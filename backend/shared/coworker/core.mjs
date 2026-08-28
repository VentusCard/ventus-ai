// backend/shared/coworker/core.mjs
//
// The Coworker orchestrator: run one agent turn end-to-end. Everything it needs
// is injected (portfolio provider, model gateway, store), so the exact same code
// path runs inside the inbound Lambda and inside an offline test with fixtures +
// a mock gateway. No AWS, no network references live here.
//
// Turn pipeline:
//   parse -> allowlist -> resolve thread -> strip quote -> classify intent
//         -> route to task -> render reply -> persist turn+task+memory
//
// The allowlist check happens before any model/data access: unknown senders
// bounce immediately.

import { createCoworkerStore, createInMemoryBackend } from './store.mjs';
import { createMemory } from './memory.mjs';
import {
  buildThreadingHeaders,
  checkAllowlist,
  parseInboundEmail,
  replySubject,
  resolveThreadId,
  stripQuotedReply,
} from './mail.mjs';
import {
  renderAudienceTable,
  renderBullets,
  renderShell,
} from './render.mjs';
import {
  buildAudience,
  classifyIntent,
  generatePrep,
  retrieveEvidence,
  summarizeThread,
} from './tasks.mjs';

/**
 * @param {object} opts
 * @param {string} opts.raw          raw inbound MIME
 * @param {object} opts.provider     PortfolioProvider
 * @param {object} opts.gateway      model gateway
 * @param {object} [opts.store]      coworker store (defaults to in-memory)
 * @param {() => Date} [opts.clock]  injectable clock for deterministic tests
 * @returns {Promise<object>} turn result
 */
export async function runCoworkerTurn({
  raw,
  provider,
  gateway,
  store = createCoworkerStore(createInMemoryBackend()),
  clock = () => new Date(),
}) {
  if (!provider) throw new Error('runCoworkerTurn requires a portfolio provider');
  if (!gateway) throw new Error('runCoworkerTurn requires a model gateway');

  const now = clock();
  const nowIso = now.toISOString();
  const institution = provider.getInstitution();
  const domain = institution?.domain || 'ventusai.com';

  const message = parseInboundEmail(raw);

  // 1. Allowlist gate — before any model or data access.
  const { allowed, advisor } = checkAllowlist(message.from, provider.getAdvisors());
  if (!allowed) {
    return {
      allowed: false,
      from: message.from,
      reply: null,
      reason: 'sender_not_on_allowlist',
    };
  }

  // 2. Thread + turn bookkeeping.
  const threadId = resolveThreadId(message) || `t_${hash(message.from + nowIso)}`;
  const priorTurns = await store.listTurns(threadId);
  const baseSeq = priorTurns.length;
  const turnIndex = baseSeq + 1;
  const cleanBody = stripQuotedReply(message.body);

  await store.appendTurn({
    thread_id: threadId,
    seq: baseSeq + 1,
    message_id: message.messageId || `in.${turnIndex}`,
    direction: 'inbound',
    advisor_id: advisor.id,
    from: message.from,
    subject: message.subject,
    text: cleanBody,
    created_at: nowIso,
  });

  // 3. Classify intent. Feed the catalog so the model returns exact product ids.
  const intent = await classifyIntent(gateway, {
    subject: message.subject,
    body: cleanBody,
    catalog: provider.getCatalog(),
  });

  // 4. Route + render.
  const rendered = await routeAndRender({
    intent,
    advisor,
    provider,
    gateway,
    store,
    threadId,
  });

  // 5. Build the outbound reply.
  const subject = replySubject(message.subject);
  const headers = buildThreadingHeaders({
    threadId,
    turn: turnIndex,
    domain,
    inReplyToMessageId: message.messageId || undefined,
    references: message.references,
  });
  const html = renderShell({
    greeting: `Hi ${firstName(advisor.name)},`,
    paragraphs: rendered.paragraphs,
    sections: rendered.sections,
    forwardMove: rendered.forwardMove,
  });

  // 6. Persist thread meta, outbound turn, and the task row.
  await store.upsertThread({
    thread_id: threadId,
    advisor_id: advisor.id,
    subject: message.subject,
    last_task_type: intent.task_type,
    updated_at: nowIso,
  });
  await store.appendTurn({
    thread_id: threadId,
    seq: baseSeq + 2,
    message_id: stripAngle(headers['Message-ID']),
    direction: 'outbound',
    advisor_id: advisor.id,
    to: message.from,
    subject,
    summary: rendered.summary,
    created_at: nowIso,
  });
  const taskId = `${intent.task_type}.${turnIndex}`;
  await store.putTask({
    thread_id: threadId,
    task_id: taskId,
    task_type: intent.task_type,
    status: rendered.status || 'completed',
    advisor_id: advisor.id,
    confidence: intent.confidence,
    result: rendered.result || null,
    created_at: nowIso,
  });

  // 7. Memory writes (best-effort; scope by advisor).
  const memory = createMemory(store, advisor.id);
  if (rendered.householdId) {
    await memory.remember({
      scope: 'household',
      key: rendered.householdId,
      value: { last_task: intent.task_type, at: nowIso },
    });
  }

  return {
    allowed: true,
    threadId,
    turnIndex,
    advisorId: advisor.id,
    intent,
    reply: {
      to: message.from,
      subject,
      headers,
      html,
    },
    task: { taskId, task_type: intent.task_type, status: rendered.status || 'completed' },
  };
}

/**
 * Map an intent to a rendered reply body. Returns paragraphs/sections/forwardMove
 * for renderShell plus persistence metadata (summary, result, status).
 */
async function routeAndRender({ intent, advisor, provider, gateway, store, threadId }) {
  switch (intent.task_type) {
    case 'audience_build': {
      if (!intent.product_id) {
        return clarify(
          'Happy to build that audience — which product should I target? (e.g. high-yield-savings, travel-card, heloc)'
        );
      }
      let audience;
      try {
        audience = buildAudience({ provider, advisorId: advisor.id, productId: intent.product_id });
      } catch (e) {
        return clarify(`I couldn't find a product called "${intent.product_id}" in the catalog.`);
      }
      const table = renderAudienceTable(audience);
      return {
        paragraphs: [
          `I back-tested your book of ${audience.considered} households against ${audience.product.name}. ${audience.candidates.length} qualify; ${audience.suppressed.length} were suppressed on risk/underwriting gates.`,
        ],
        sections: [{ heading: `Target audience — ${audience.product.name}`, html: table }],
        forwardMove: audience.candidates.length
          ? `Want me to draft outreach for the top ${Math.min(3, audience.candidates.length)}?`
          : 'Want me to widen the criteria or try a different product?',
        summary: `audience_build for ${audience.product.name}: ${audience.candidates.length} qualified, ${audience.suppressed.length} suppressed`,
        result: audience,
        householdId: null,
        status: 'completed',
      };
    }

    case 'prep': {
      if (!intent.household_id) {
        return clarify('Which household should I prep you for?');
      }
      const prep = await generatePrep({ gateway, provider, householdId: intent.household_id });
      return {
        paragraphs: [prep.text],
        sections: prep.evidence?.bullets?.length
          ? [{ heading: 'Evidence (modeled)', html: renderBullets(prep.evidence.bullets) }]
          : [],
        forwardMove: 'Want me to turn this into a one-page agenda?',
        summary: `prep for ${intent.household_id}`,
        result: { householdId: intent.household_id },
        householdId: intent.household_id,
        status: prep.evidence?.found ? 'completed' : 'needs_input',
      };
    }

    case 'evidence': {
      if (!intent.household_id) {
        return clarify('Which household do you want the read on?');
      }
      const ev = retrieveEvidence({ provider, householdId: intent.household_id });
      if (!ev.found) return clarify(`I couldn't find a household matching "${intent.household_id}".`);
      return {
        paragraphs: [`Here's what we hold on ${ev.household.name}:`],
        sections: [{ heading: 'Signals (modeled)', html: renderBullets(ev.bullets) }],
        forwardMove: 'Want me to prep you for a meeting with them?',
        summary: `evidence for ${ev.household.name}`,
        result: { householdId: intent.household_id },
        householdId: intent.household_id,
        status: 'completed',
      };
    }

    case 'summary': {
      const turns = await store.listTurns(threadId);
      const text = await summarizeThread({ gateway, turns });
      return {
        paragraphs: [text],
        sections: [],
        forwardMove: 'Anything you want me to pick back up?',
        summary: 'thread summary',
        result: null,
        householdId: null,
        status: 'completed',
      };
    }

    default:
      return clarify(
        "I can build target audiences for a product, prep you for a household meeting, pull what we know on a household, or recap a thread. What would you like?"
      );
  }
}

function clarify(text) {
  return {
    paragraphs: [text],
    sections: [],
    forwardMove: null,
    summary: 'clarification',
    result: null,
    householdId: null,
    status: 'needs_input',
  };
}

function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'there';
}

function stripAngle(id) {
  return String(id || '').replace(/^<|>$/g, '');
}

// Small, stable, dependency-free hash for synthesizing a thread id when there is
// no References/In-Reply-To chain (brand-new conversation).
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
