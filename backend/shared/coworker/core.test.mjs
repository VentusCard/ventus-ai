import assert from 'node:assert/strict';
import test from 'node:test';
import { createFixturePortfolioProvider } from './portfolio-provider.mjs';
import { createCoworkerStore, createInMemoryBackend } from './store.mjs';
import { runCoworkerTurn } from './core.mjs';

const provider = createFixturePortfolioProvider();
const clock = () => new Date('2026-02-01T12:00:00.000Z');

function intentGateway(intent) {
  return {
    async chatCompletion() {
      return {
        response: {
          ok: true,
          async json() {
            return {
              choices: [
                { message: { tool_calls: [{ function: { arguments: JSON.stringify(intent) } }] } },
              ],
            };
          },
        },
      };
    },
  };
}

// Routes by task: returns the classifier tool-call for intent, and forces the
// deterministic fallback (ok:false) for narration tasks (prep/summary/outreach)
// so core tests stay offline and deterministic.
function routingGateway(intent) {
  return {
    async chatCompletion({ task }) {
      if (task === 'coworker_intent_classification') {
        return {
          response: {
            ok: true,
            async json() {
              return {
                choices: [
                  { message: { tool_calls: [{ function: { arguments: JSON.stringify(intent) } }] } },
                ],
              };
            },
          },
        };
      }
      return { response: { ok: false, async json() { return {}; } } };
    },
  };
}

function rawEmail({ from, subject, body, messageId = '<m1@mail>', references, headers = {} }) {
  const lines = [
    `From: ${from}`,
    `To: coworker@ventusai.com`,
    `Subject: ${subject}`,
    `Message-ID: ${messageId}`,
  ];
  if (references) lines.push(`References: ${references}`);
  for (const [k, v] of Object.entries(headers)) lines.push(`${k}: ${v}`);
  lines.push('', body);
  return lines.join('\n');
}

test('unknown sender is rejected before any work', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({ from: 'stranger@example.com', subject: 'hi', body: 'hello' }),
    provider,
    gateway: intentGateway({ task_type: 'audience_build', product_id: 'travel-card', confidence: 0.9 }),
    store,
    clock,
  });
  assert.equal(res.allowed, false);
  assert.equal(res.reason, 'sender_not_on_allowlist');
  assert.equal(res.reply, null);
  assert.equal((await store.listTurns('anything')).length, 0);
});

test('demo mode admits an unknown sender as a synthetic advisor over the full book', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'jamie.lee@prospect.com',
      subject: 'Who should I pitch the travel card to?',
      body: 'Build me an audience for the travel card.',
    }),
    provider,
    gateway: intentGateway({ task_type: 'audience_build', product_id: 'travel-card', confidence: 0.9 }),
    store,
    clock,
    demoOpen: true,
  });

  assert.equal(res.allowed, true);
  assert.equal(res.demo, true);
  assert.match(res.reply.html, /Hi Jamie,/);
  assert.match(res.reply.html, /Target audience/);
  assert.equal(res.task.task_type, 'audience_build');
});

test('demo advisor can resolve any household in the full book (roster = household_ids)', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  // Synthetic demo advisor spans the whole book, but those households are "owned"
  // by other advisors. Resolution must still find Okafor by name.
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'jamie.lee@prospect.com',
      subject: 'read',
      body: 'what do we know about Okafor',
    }),
    provider,
    gateway: routingGateway({ task_type: 'evidence', household_id: 'Okafor', confidence: 0.8 }),
    store,
    clock,
    demoOpen: true,
  });
  assert.equal(res.demo, true);
  assert.equal(res.task.task_type, 'evidence');
  assert.match(res.reply.html, /Okafor Household/);
});

test('demo mode off still rejects an unknown sender', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({ from: 'stranger@example.com', subject: 'hi', body: 'hello' }),
    provider,
    gateway: intentGateway({ task_type: 'summary', confidence: 0.9 }),
    store,
    clock,
    demoOpen: false,
  });
  assert.equal(res.allowed, false);
  assert.equal(res.reason, 'sender_not_on_allowlist');
});

test('auto-responder (Precedence: bulk) is dropped before any reply, even from an allowlisted advisor', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'Automatic reply: Out of office',
      body: 'I am away until Monday.',
      headers: { Precedence: 'bulk' },
    }),
    provider,
    gateway: intentGateway({ task_type: 'audience_build', product_id: 'travel-card', confidence: 0.9 }),
    store,
    clock,
    demoOpen: true,
  });
  assert.equal(res.allowed, false);
  assert.match(res.reason, /^automated_message:/);
  assert.equal(res.reply, null);
  // No thread work should have happened.
  assert.equal(store.backend._dump().length, 0);
});

test('a no-reply sender is treated as automated and never gets a reply', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({ from: 'no-reply@marketing.example.com', subject: 'Deal!', body: 'buy now' }),
    provider,
    gateway: intentGateway({ task_type: 'other', confidence: 0.3 }),
    store,
    clock,
    demoOpen: true,
  });
  assert.equal(res.allowed, false);
  assert.equal(res.reason, 'automated_message:automated_sender');
});

test('a single sender is rate limited after the configured number of messages', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const send = () =>
    runCoworkerTurn({
      raw: rawEmail({ from: 'jamie.lee@prospect.com', subject: 'q', body: 'hello', messageId: `<${Math.random()}@m>` }),
      provider,
      gateway: routingGateway({ task_type: 'other', confidence: 0.3 }),
      store,
      // Real clock so the in-memory rate record keeps a future ttl and persists
      // across sends (the in-memory backend enforces TTL against wall time).
      clock: () => new Date(),
      demoOpen: true,
      rateLimit: { limit: 2, windowMs: 3600_000 },
    });

  const r1 = await send();
  const r2 = await send();
  const r3 = await send();
  assert.equal(r1.allowed, true);
  assert.equal(r2.allowed, true);
  assert.equal(r3.allowed, false);
  assert.equal(r3.reason, 'rate_limited');
  assert.equal(r3.rate.count, 3);
  assert.equal(r3.rate.limit, 2);
});

test('rate limiting can be disabled with limit 0', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  for (let i = 0; i < 5; i++) {
    const r = await runCoworkerTurn({
      raw: rawEmail({ from: 'jamie.lee@prospect.com', subject: 'q', body: 'hello', messageId: `<d${i}@m>` }),
      provider,
      gateway: routingGateway({ task_type: 'other', confidence: 0.3 }),
      store,
      clock,
      demoOpen: true,
      rateLimit: { limit: 0 },
    });
    assert.equal(r.allowed, true);
  }
});

test('an oversized body is truncated before it is stored or sent to the model', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const huge = 'a'.repeat(20000);
  const res = await runCoworkerTurn({
    raw: rawEmail({ from: 'dana.okoro@ventusai.com', subject: 'long', body: huge }),
    provider,
    gateway: routingGateway({ task_type: 'other', confidence: 0.3 }),
    store,
    clock,
    maxBodyChars: 500,
  });
  assert.equal(res.allowed, true);
  const turns = await store.listTurns(res.threadId);
  const inbound = turns.find((t) => t.direction === 'inbound');
  assert.ok(inbound.text.length < 600);
  assert.match(inbound.text, /\[message truncated\]$/);
});

test('audience_build turn replies with the ranked table and persists turns + task', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'Dana Okoro <dana.okoro@ventusai.com>',
      subject: 'Who should I pitch the travel card to?',
      body: 'Build me an audience for the travel card.',
    }),
    provider,
    gateway: intentGateway({ task_type: 'audience_build', product_id: 'travel-card', confidence: 0.92 }),
    store,
    clock,
  });

  assert.equal(res.allowed, true);
  assert.equal(res.advisorId, 'adv_okoro');
  assert.equal(res.task.task_type, 'audience_build');
  assert.match(res.reply.subject, /^Re: /);
  assert.match(res.reply.html, /Okafor Household/);
  assert.match(res.reply.html, /third-party modeled/);
  assert.match(res.reply.html, /Next:/);
  assert.ok(res.reply.headers['Message-ID']);

  const turns = await store.listTurns(res.threadId);
  assert.equal(turns.length, 2);
  assert.deepEqual(
    turns.map((t) => t.direction),
    ['inbound', 'outbound']
  );
  const tasks = await store.listTasks(res.threadId);
  assert.equal(tasks[0].task_type, 'audience_build');
  assert.equal(tasks[0].status, 'completed');
});

test('audience_build without a product asks for clarification', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'audience',
      body: 'build me an audience',
    }),
    provider,
    gateway: intentGateway({ task_type: 'audience_build', product_id: null, confidence: 0.6 }),
    store,
    clock,
  });
  assert.equal(res.task.status, 'needs_input');
  assert.match(res.reply.html, /which product/i);
});

test('evidence turn returns modeled signals for a household', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'what do we know',
      body: 'what do we know about the Bianchi household',
    }),
    provider,
    gateway: intentGateway({ task_type: 'evidence', household_id: 'hh_bianchi', confidence: 0.8 }),
    store,
    clock,
  });
  assert.equal(res.task.task_type, 'evidence');
  assert.match(res.reply.html, /Bianchi Household/);
  assert.match(res.reply.html, /third-party modeled|Signals \(modeled\)/);
});

test('evidence resolves a free-text household name to the right household', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'read',
      body: 'what do we know about Nakamura',
    }),
    provider,
    // Model returns a bare family name, not the exact id — core must resolve it.
    gateway: routingGateway({ task_type: 'evidence', household_id: 'Nakamura', confidence: 0.8 }),
    store,
    clock,
  });
  assert.equal(res.task.task_type, 'evidence');
  assert.match(res.reply.html, /Nakamura Household/);
});

test('compose_outreach with an explicit product drafts grounded notes', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'outreach',
      body: 'draft outreach for high-yield-savings',
    }),
    provider,
    gateway: routingGateway({ task_type: 'compose_outreach', product_id: 'high-yield-savings', confidence: 0.9 }),
    store,
    clock,
  });
  assert.equal(res.task.task_type, 'compose_outreach');
  assert.equal(res.task.status, 'completed');
  assert.match(res.reply.html, /Draft —/);
});

test('compose_outreach follow-up uses the prior audience via thread slot memory', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  // Turn 1: build an audience so a result is persisted on the thread.
  const t1 = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'Who fits HYSA?',
      body: 'build me an audience for high-yield-savings',
      messageId: '<a1@mail>',
    }),
    provider,
    gateway: routingGateway({ task_type: 'audience_build', product_id: 'high-yield-savings', confidence: 0.9 }),
    store,
    clock,
  });
  assert.equal(t1.task.task_type, 'audience_build');

  // Turn 2: "draft outreach for the top 3" with no product — must resolve to the
  // prior audience. Reference the turn-1 outbound Message-ID to stay in-thread.
  const t2 = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'Re: Who fits HYSA?',
      body: 'draft outreach for the top 3',
      messageId: '<b1@mail>',
      references: t1.reply.headers['Message-ID'],
    }),
    provider,
    gateway: routingGateway({ task_type: 'compose_outreach', product_id: null, household_ids: null, confidence: 0.9 }),
    store,
    clock,
  });
  assert.equal(t2.threadId, t1.threadId);
  assert.equal(t2.task.task_type, 'compose_outreach');
  assert.equal(t2.task.status, 'completed');
  assert.match(t2.reply.html, /Draft —/);
});

test('compose_outreach targets a named household even when the classifier misses it', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const t1 = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'aud',
      body: 'build me an audience for high-yield-savings',
      messageId: '<a2@mail>',
    }),
    provider,
    gateway: routingGateway({ task_type: 'audience_build', product_id: 'high-yield-savings', confidence: 0.9 }),
    store,
    clock,
  });
  // Classifier returns NO household refs — resolution must come from the text scan.
  const t2 = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'Re: aud',
      body: 'Draft for Okafor',
      messageId: '<b2@mail>',
      references: t1.reply.headers['Message-ID'],
    }),
    provider,
    gateway: routingGateway({ task_type: 'compose_outreach', product_id: null, household_ids: null, confidence: 0.9 }),
    store,
    clock,
  });
  assert.equal(t2.task.task_type, 'compose_outreach');
  assert.match(t2.reply.html, /Draft — Okafor Household/);
  assert.doesNotMatch(t2.reply.html, /Draft — Bianchi/);
});

test('compose_outreach asks instead of drafting the wrong people when the named household is not qualifying', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const t1 = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'aud',
      body: 'build me an audience for high-yield-savings',
      messageId: '<a3@mail>',
    }),
    provider,
    gateway: routingGateway({ task_type: 'audience_build', product_id: 'high-yield-savings', confidence: 0.9 }),
    store,
    clock,
  });
  // Alvarez is suppressed for HYSA (low_liquidity_buffer) -> not a qualifying candidate.
  const t2 = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'Re: aud',
      body: 'Draft for Alvarez',
      messageId: '<b3@mail>',
      references: t1.reply.headers['Message-ID'],
    }),
    provider,
    gateway: routingGateway({ task_type: 'compose_outreach', product_id: null, household_ids: null, confidence: 0.9 }),
    store,
    clock,
  });
  assert.equal(t2.task.status, 'needs_input');
  assert.match(t2.reply.html, /Alvarez/);
  assert.doesNotMatch(t2.reply.html, /Draft — /);
});

test('free-form question is answered by the grounded QA path, not a canned menu', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  // Intent classifier -> tool_calls; the QA task -> content answer that cites the
  // household context we assembled (proves grounding data is passed through).
  const gateway = {
    async chatCompletion({ task }) {
      if (task === 'coworker_intent_classification') {
        return {
          response: {
            ok: true,
            async json() {
              return {
                choices: [
                  { message: { tool_calls: [{ function: { arguments: JSON.stringify({ task_type: 'other', confidence: 0.3 }) } }] } },
                ],
              };
            },
          },
        };
      }
      // coworker_qa
      return {
        response: {
          ok: true,
          async json() {
            return {
              choices: [
                { message: { content: 'Okafor skews heavily toward travel and dining — modeled as travel-heavy.' } },
              ],
            };
          },
        },
      };
    },
  };
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'question',
      body: 'what types of things does Okafor like to spend on?',
    }),
    provider,
    gateway,
    store,
    clock,
  });
  assert.equal(res.task.task_type, 'other');
  assert.equal(res.task.status, 'completed');
  assert.match(res.reply.html, /travel/i);
  assert.doesNotMatch(res.reply.html, /What would you like\?/); // not the canned menu
});

test('free-form falls back to a capability menu when the model is unavailable', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({ from: 'dana.okoro@ventusai.com', subject: 'q', body: 'tell me something interesting' }),
    provider,
    gateway: routingGateway({ task_type: 'other', confidence: 0.3 }), // QA task returns ok:false
    store,
    clock,
  });
  assert.ok(res.reply.html.replace(/<[^>]+>/g, '').trim().length > 0);
  assert.match(res.reply.html, /answer questions about any household/i);
});

test('reply body is never blank', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({ from: 'dana.okoro@ventusai.com', subject: 'hi', body: 'hey there' }),
    provider,
    gateway: routingGateway({ task_type: 'other', confidence: 0.3 }),
    store,
    clock,
  });
  assert.ok(res.reply.html.replace(/<[^>]+>/g, '').trim().length > 0);
});
