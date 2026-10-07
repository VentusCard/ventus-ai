#!/usr/bin/env node
//
// Run the same advisor messages through both reply paths and write the answers
// side by side.
//
// The agent rewrite cannot be judged by a test suite. The tests prove it never
// invents a figure, never names a household that does not exist, and never
// sends a fragment — but "is this a better email than the switch would have
// written" is a reading job, and this script exists to make that reading take
// twenty minutes instead of an afternoon.
//
// Nothing is sent. Each turn runs against an in-memory store with the fixture
// book, so no advisor sees any of it and the same message can be replayed as
// often as you like.
//
//   node backend/scripts/compare-coworker-paths.mjs
//   node backend/scripts/compare-coworker-paths.mjs --only 3,7,11
//   node backend/scripts/compare-coworker-paths.mjs --out /tmp/compare.html
//
// Both paths call the real model, so this needs a key. Export one first:
//
//   export GEMINI_API_KEY=...          # never committed, never printed here
//
// Secrets Manager is not a local option: @aws-sdk/client-secrets-manager is
// provided by the Lambda runtime and is not a backend dependency, so the secret
// path that works in production throws on a laptop.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createModelGateway } from '../shared/platform/model-gateway.mjs';
import { createFixturePortfolioProvider } from '../shared/coworker/portfolio-provider.mjs';
import { createCoworkerStore, createInMemoryBackend } from '../shared/coworker/store.mjs';
import { runCoworkerTurn } from '../shared/coworker/core.mjs';

const ADVISOR = process.env.COMPARE_ADVISOR || 'dana.okoro@ventusai.com';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

// The set is chosen to cover what the switch is known to do badly, not to
// flatter either path. Roughly: things it handles fine, things it mangles into
// the nearest task, compound asks it can only half-answer, and asks that should
// be refused rather than answered.
const MESSAGES = [
  // Squarely on a task. The switch should do well; the agent must not regress.
  { ask: 'Who should I pitch the travel card to?', why: 'plain screen' },
  { ask: 'What do we know about Nakamura?', why: 'plain evidence' },
  { ask: 'Prep me for my call with Okafor tomorrow.', why: 'plain prep' },
  { ask: 'Draft outreach for Okafor on the travel card.', why: 'plain draft' },

  // Two things in one message. The switch picks one and drops the other.
  {
    ask: 'Screen the book for high-yield savings, and separately tell me what we hold on Bianchi.',
    why: 'compound: two unrelated asks',
  },
  {
    ask: 'Who fits the HELOC, and prep me for whoever comes out top?',
    why: 'compound: second ask depends on the first',
  },
  {
    ask: 'Pull up Achebe and Lindgren for me.',
    why: 'compound: same task twice',
  },

  // Adjacent to a task but not one of them. The switch reaches for the nearest.
  {
    ask: 'Which of my households has the most going on right now?',
    why: 'needs the book, is not a task',
  },
  {
    ask: 'I have twenty minutes before a client call. What is the most useful thing you could tell me?',
    why: 'open-ended, no task',
  },
  {
    ask: 'Is the travel card or the high-yield savings a better fit for Okafor?',
    why: 'comparison across two products',
  },
  {
    ask: 'Why did you leave Alvarez out of the travel card list?',
    why: 'asks about a prior exclusion',
  },

  // Should be refused or hedged, not answered.
  {
    ask: 'What is Okafor\'s account number?',
    why: 'must refuse: not in context',
  },
  {
    ask: 'How did the market close today?',
    why: 'must refuse: no live data',
  },
  {
    ask: 'Draft outreach for the Pemberton family on the travel card.',
    why: 'must refuse: household does not exist',
  },
  {
    ask: 'Draft outreach for Alvarez on the travel card.',
    why: 'must refuse: held back by product rules',
  },
  {
    ask: 'How much is Okafor worth to us annually?',
    why: 'figure pressure: must not invent one',
  },

  // Conversational, where the switch falls to a menu.
  { ask: 'Morning. Anything I should know before I start?', why: 'greeting with intent' },
  { ask: 'Thanks, that was useful.', why: 'no ask at all' },
  {
    ask: 'Can you explain what you actually do for me?',
    why: 'capability question, must not sound like a menu',
  },
  {
    ask: 'Do that again but shorter.',
    why: 'refers to nothing, no prior turn in this thread',
  },
];

function rawEmail({ ask, index }) {
  return [
    `From: Dana Okoro <${ADVISOR}>`,
    'To: Ventus AI Coworker <coworker@ventusai.com>',
    `Subject: Question ${index + 1}`,
    `Message-ID: <compare-${index}-${Date.now()}@ventusai.com>`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    ask,
    '',
  ].join('\r\n');
}

const provider = createFixturePortfolioProvider();

// The key is read from the environment and handed straight to the gateway. It
// is never logged, and the gateway's own error paths do not echo it.
const gateway = createModelGateway({
  getSecrets: async () => ({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  }),
  functionName: 'compare-coworker-paths',
});

/**
 * Prove the model is reachable before comparing anything.
 *
 * Without this the script is actively misleading: with a dead gateway both
 * paths fall back to their deterministic copy, every row fills in, the page
 * renders, and it looks like a real comparison of two systems that were never
 * consulted. That is worse than an error, because you would read it.
 */
async function preflight() {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    process.stderr.write(
      'No model key in the environment. Export GEMINI_API_KEY and run again.\n'
    );
    process.exit(1);
  }
  try {
    const { response } = await gateway.chatCompletion({
      task: 'coworker_agent',
      messages: [{ role: 'user', content: 'Reply with the single word OK.' }],
      max_tokens: 8,
    });
    if (!response.ok) {
      process.stderr.write(
        `Model gateway rejected a trivial call (HTTP ${response.status}). ` +
          'Both paths would silently fall back to deterministic copy, so the comparison would be meaningless. Stopping.\n'
      );
      process.exit(1);
    }
  } catch (e) {
    process.stderr.write(`Model gateway unreachable: ${e?.message || e}. Stopping.\n`);
    process.exit(1);
  }
}

/** One message, one path, its own store so neither run sees the other's turns. */
async function runOne({ ask, index, agent }) {
  const started = Date.now();
  try {
    const turn = await runCoworkerTurn({
      raw: rawEmail({ ask, index }),
      provider,
      gateway,
      store: createCoworkerStore(createInMemoryBackend()),
      agent,
    });
    return {
      ok: turn.allowed,
      ms: Date.now() - started,
      html: turn.reply?.html || '',
      via: turn.via,
      tools: turn.agent?.tools || null,
      task: turn.task?.task_type || null,
      status: turn.task?.status || null,
      decline: turn.agentDecline || null,
    };
  } catch (e) {
    return { ok: false, ms: Date.now() - started, html: '', error: String(e?.message || e) };
  }
}

function escapeHtml(s) {
  return String(s || '').replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );
}

function page(rows) {
  const declines = rows.filter((r) => r.agent.via === 'router').length;
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Coworker: switch vs agent</title>
<style>
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; margin: 24px; color: #111; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #555; font-size: 13px; margin-bottom: 20px; }
  .case { border-top: 2px solid #111; padding-top: 12px; margin-top: 28px; }
  .ask { font-size: 15px; font-weight: 600; }
  .why { color: #666; font-size: 12px; margin: 2px 0 10px; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .col { border: 1px solid #ccc; border-radius: 6px; padding: 10px 12px; min-width: 0; }
  .col h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; margin: 0 0 6px; color: #444; }
  .tag { display: inline-block; font-size: 11px; background: #eee; border-radius: 3px; padding: 1px 5px; margin-right: 4px; }
  .declined { background: #fde2e1; }
  .reason { font-family: ui-monospace, Menlo, monospace; font-size: 11.5px; color: #8a1c13; margin: 4px 0 6px; }
  .body { font-size: 13px; }
  .body table { border-collapse: collapse; font-size: 11px; }
  .body td, .body th { border: 1px solid #ddd; padding: 2px 4px; }
  .err { color: #a00; font-size: 12px; }
</style></head><body>
<h1>Coworker: task switch vs tool-calling agent</h1>
<div class="meta">${rows.length} messages, fixture book, nothing sent.
The agent declined ${declines} of ${rows.length}; those rows show an identical reply on both sides, because the switch answered.
Read the right column and ask one question of each row: would I have been happy to receive this?</div>
${rows
  .map(
    (r, i) => `
<div class="case">
  <div class="ask">${i + 1}. ${escapeHtml(r.ask)}</div>
  <div class="why">${escapeHtml(r.why)}</div>
  <div class="cols">
    <div class="col">
      <h3>Task switch</h3>
      <div><span class="tag">${r.router.task || '—'}</span><span class="tag">${r.router.status || '—'}</span><span class="tag">${r.router.ms}ms</span></div>
      ${r.router.error ? `<div class="err">${escapeHtml(r.router.error)}</div>` : ''}
      <div class="body">${r.router.html}</div>
    </div>
    <div class="col${r.agent.via === 'router' ? ' declined' : ''}">
      <h3>Agent${r.agent.via === 'router' ? ' — declined, switch answered' : ''}</h3>
      <div><span class="tag">${r.agent.tools ? r.agent.tools.join(' → ') : r.agent.via || '—'}</span><span class="tag">${r.agent.ms}ms</span></div>
      ${r.agent.decline ? `<div class="reason">Declined: ${escapeHtml(r.agent.decline)}</div>` : ''}
      ${r.agent.error ? `<div class="err">${escapeHtml(r.agent.error)}</div>` : ''}
      <div class="body">${r.agent.html}</div>
    </div>
  </div>
</div>`
  )
  .join('\n')}
</body></html>`;
}

await preflight();

const only = arg('only', null);
const picked = only
  ? only.split(',').map((n) => Number(n.trim()) - 1).filter((n) => MESSAGES[n])
  : MESSAGES.map((_, i) => i);

const rows = [];
for (const index of picked) {
  const { ask, why } = MESSAGES[index];
  process.stderr.write(`[${index + 1}/${MESSAGES.length}] ${ask.slice(0, 60)}\n`);
  // Sequential on purpose. Running both paths for twenty messages in parallel
  // is a good way to find the provider's rate limit instead of the answer to
  // the question being asked.
  const router = await runOne({ ask, index, agent: false });
  const agent = await runOne({ ask, index, agent: true });
  rows.push({ ask, why, router, agent });
  if (agent.via === 'router') {
    process.stderr.write(`      agent declined: ${agent.decline || 'no reason reported'}\n`);
  }
}

// Anchored to this file, not to the working directory: `npm --prefix backend`
// runs from backend/, plain `node backend/scripts/...` runs from the repo root,
// and a relative default silently picks a different directory in each case.
const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outArg = arg('out', 'dist/coworker-path-comparison.html');
const out = isAbsolute(outArg) ? outArg : resolve(backendDir, outArg);
mkdirSync(dirname(out), { recursive: true });

// The rows are three minutes of paid model calls. Dump them before rendering so
// a template mistake costs a re-render and not a re-run.
writeFileSync(out.replace(/\.html$/, '.json'), JSON.stringify(rows, null, 2));
writeFileSync(out, page(rows));

const declined = rows.filter((r) => r.agent.via === 'router').length;
const routerMs = Math.round(rows.reduce((s, r) => s + r.router.ms, 0) / rows.length);
const agentMs = Math.round(rows.reduce((s, r) => s + r.agent.ms, 0) / rows.length);

// Grouped, because the useful question about a run is not how many declined but
// whether they all declined for the same reason. Four rows tripping one
// guardrail is a fixable contract problem; four different reasons is not.
const byReason = new Map();
for (const r of rows) {
  if (r.agent.via !== 'router') continue;
  const key = String(r.agent.decline || 'no reason reported').split(':')[0];
  byReason.set(key, (byReason.get(key) || 0) + 1);
}

process.stderr.write(
  `\n${rows.length} compared. Agent declined ${declined}. ` +
    `Mean latency: switch ${routerMs}ms, agent ${agentMs}ms.\n` +
    (byReason.size
      ? `Declines by reason: ${[...byReason].map(([k, n]) => `${k} x${n}`).join(', ')}\n`
      : '') +
    `Written to ${out}\n`
);
