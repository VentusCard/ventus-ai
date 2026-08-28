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
  answerQuestion,
  buildAudience,
  classifyIntent,
  generateOutreach,
  generatePrep,
  resolveHousehold,
  retrieveEvidence,
  scanHouseholdMentions,
  summarizeSpend,
  summarizeThread,
} from './tasks.mjs';

/**
 * @param {object} opts
 * @param {string} opts.raw          raw inbound MIME
 * @param {object} opts.provider     PortfolioProvider
 * @param {object} opts.gateway      model gateway
 * @param {object} [opts.store]      coworker store (defaults to in-memory)
 * @param {() => Date} [opts.clock]  injectable clock for deterministic tests
 * @param {boolean} [opts.demoOpen]  when true, admit senders who are not on the
 *   advisor allowlist as a synthetic advisor over the full demo book. For demos
 *   only — leave OFF in production so unknown senders bounce.
 * @returns {Promise<object>} turn result
 */
export async function runCoworkerTurn({
  raw,
  provider,
  gateway,
  store = createCoworkerStore(createInMemoryBackend()),
  clock = () => new Date(),
  demoOpen = false,
}) {
  if (!provider) throw new Error('runCoworkerTurn requires a portfolio provider');
  if (!gateway) throw new Error('runCoworkerTurn requires a model gateway');

  const now = clock();
  const nowIso = now.toISOString();
  const institution = provider.getInstitution();
  const domain = institution?.domain || 'ventusai.com';

  const message = parseInboundEmail(raw);

  // 1. Allowlist gate — before any model or data access. In demo mode, unknown
  //    senders are admitted as a synthetic advisor over the full demo book so
  //    anyone can try the coworker; kept OFF in production.
  const gate = checkAllowlist(message.from, provider.getAdvisors());
  let advisor = gate.advisor;
  let isDemoSender = false;
  if (!gate.allowed) {
    if (!demoOpen) {
      return {
        allowed: false,
        from: message.from,
        reply: null,
        reason: 'sender_not_on_allowlist',
      };
    }
    advisor = buildDemoAdvisor(message.from, provider);
    isDemoSender = true;
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

  // 3. Classify intent. Feed the catalog + this advisor's household roster so the
  //    model returns exact ids, and the recent turns so follow-ups route right.
  const householdRoster = advisorHouseholds(provider, advisor);
  const intent = await classifyIntent(gateway, {
    subject: message.subject,
    body: cleanBody,
    catalog: provider.getCatalog(),
    households: householdRoster,
    priorTurns: priorTurns.slice(-6),
  });

  // 4. Route + render. Prior tasks give us slot memory: e.g. "draft outreach for
  //    the top 3" resolves against the most recent audience we built.
  const priorTasks = await store.listTasks(threadId);
  const rendered = await routeAndRender({
    intent,
    advisor,
    provider,
    gateway,
    store,
    threadId,
    priorTasks,
    messageText: `${message.subject || ''} ${cleanBody}`,
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
  // Safety net: never send a blank body. If a task produced no prose and no
  // sections, fall back to a helpful menu instead of an empty email.
  const safeParagraphs = (rendered.paragraphs || []).filter((p) => String(p || '').trim().length);
  if (!safeParagraphs.length && !(rendered.sections || []).length) {
    safeParagraphs.push(
      "I wasn't able to put together a full answer on that one. I can build a target audience, draft outreach, prep you for a household, pull what we know on a household, or recap this thread — which would help?"
    );
  }
  const html = renderShell({
    greeting: `Hi ${firstName(advisor.name)},`,
    paragraphs: safeParagraphs,
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
    demo: isDemoSender,
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
async function routeAndRender({
  intent,
  advisor,
  provider,
  gateway,
  store,
  threadId,
  priorTasks = [],
  messageText = '',
}) {
  const households = advisorHouseholds(provider, advisor);
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

    case 'compose_outreach': {
      // Resolve which audience/product to draft against. Prefer an explicit
      // product on this message; otherwise fall back to the most recent audience
      // we built in this thread (slot memory), so "draft outreach for the top 3"
      // works as a follow-up.
      const lastAudience = findLastAudience(priorTasks);
      let product = null;
      let candidates = [];

      if (intent.product_id) {
        try {
          const audience = buildAudience({
            provider,
            advisorId: advisor.id,
            productId: intent.product_id,
          });
          product = audience.product;
          candidates = audience.candidates;
        } catch {
          return clarify(`I couldn't find a product called "${intent.product_id}" in the catalog.`);
        }
      } else if (lastAudience) {
        product = lastAudience.product;
        candidates = lastAudience.candidates || [];
      } else {
        return clarify(
          "Happy to draft outreach — which product is it for, and which households (or shall I use the top few from an audience)? If you haven't yet, ask me to build the audience first."
        );
      }

      // Narrow to specifically named households if the advisor named any — from
      // the classifier AND a deterministic scan of the raw message, so an explicit
      // "Draft for Okafor" always targets Okafor even if the model missed it.
      const namedIds = resolveOutreachTargets({ intent, households, messageText });
      if (namedIds.length) {
        const byId = new Map(candidates.map((c) => [c.household_id, c]));
        const picked = namedIds.map((id) => byId.get(id)).filter(Boolean);
        if (picked.length) {
          candidates = picked;
        } else {
          // They named specific households that aren't in the qualifying set —
          // don't silently draft the wrong people. Explain and offer next steps.
          const names = namedIds.map(
            (id) => households.find((h) => h.id === id)?.name || id
          );
          const suppressed = (lastAudience?.suppressed || []).filter((s) =>
            namedIds.includes(s.household_id)
          );
          const why = suppressed.length
            ? ` ${suppressed.map((s) => `${s.household_name || s.household_id} was suppressed (${s.reason})`).join('; ')}.`
            : '';
          return clarify(
            `${names.join(', ')} ${names.length > 1 ? "aren't" : "isn't"} in the qualifying set for ${product.name}.${why} Want me to draft for the qualifying households instead, or prep you on ${names[0]}?`
          );
        }
      }

      if (!candidates.length) {
        return clarify(
          `I don't have qualifying households to draft for on ${product?.name || 'that product'}. Want me to build the audience first?`
        );
      }

      const { drafts } = await generateOutreach({ gateway, product, candidates });
      if (!drafts.length) {
        return clarify('I ran into trouble drafting those — want me to try again?');
      }
      const sections = drafts.map((d) => ({
        heading: `Draft — ${d.household_name}`,
        html: renderBullets([d.text]),
      }));
      return {
        paragraphs: [
          `Here are draft outreach notes for ${drafts.length} household${drafts.length > 1 ? 's' : ''} on ${product.name}. Modeled benefits are described as estimates to review, not promises — edit before sending.`,
        ],
        sections,
        forwardMove: 'Want me to adjust the tone, or prep you for any of these calls?',
        summary: `compose_outreach for ${product.name}: ${drafts.length} draft(s)`,
        result: { product, drafts },
        householdId: null,
        status: 'completed',
      };
    }

    case 'prep': {
      const hh = resolveSingleHousehold({ intent, households, messageText });
      if (!hh) {
        return clarify(
          intent.household_id
            ? `I couldn't match "${intent.household_id}" to a household in your book. Which one?`
            : 'Which household should I prep you for?'
        );
      }
      const prep = await generatePrep({ gateway, provider, householdId: hh.id });
      return {
        paragraphs: [prep.text],
        sections: prep.evidence?.bullets?.length
          ? [{ heading: 'Evidence (modeled)', html: renderBullets(prep.evidence.bullets) }]
          : [],
        forwardMove: 'Want me to turn this into a one-page agenda?',
        summary: `prep for ${hh.name}`,
        result: { householdId: hh.id },
        householdId: hh.id,
        status: prep.evidence?.found ? 'completed' : 'needs_input',
      };
    }

    case 'evidence': {
      const hh = resolveSingleHousehold({ intent, households, messageText });
      if (!hh) {
        return clarify(
          intent.household_id
            ? `I couldn't match "${intent.household_id}" to a household in your book. Which one?`
            : 'Which household do you want the read on?'
        );
      }
      const ev = retrieveEvidence({ provider, householdId: hh.id });
      if (!ev.found) return clarify(`I couldn't find a household matching "${hh.name}".`);
      return {
        paragraphs: [`Here's what we hold on ${ev.household.name}:`],
        sections: [{ heading: 'Signals (modeled)', html: renderBullets(ev.bullets) }],
        forwardMove: 'Want me to prep you for a meeting with them?',
        summary: `evidence for ${ev.household.name}`,
        result: { householdId: hh.id },
        householdId: hh.id,
        status: 'completed',
      };
    }

    case 'summary': {
      const turns = await store.listTurns(threadId);
      const text = await summarizeThread({ gateway, turns });
      return {
        paragraphs: [ensureText(text, 'Here is a short recap of where we are.')],
        sections: [],
        forwardMove: 'Anything you want me to pick back up?',
        summary: 'thread summary',
        result: null,
        householdId: null,
        status: 'completed',
      };
    }

    default:
      return await answerFreeform({
        provider,
        gateway,
        households,
        messageText,
        store,
        threadId,
      });
  }
}

/**
 * Grounded free-form answer for anything outside the structured tools. Assembles
 * the relevant book context (any mentioned households' modeled signals + observed
 * spend, the catalog, and recent turns) and lets the model answer naturally, but
 * strictly constrained to that context. Falls back to a capability menu only if
 * the model is unavailable — so the coworker feels like a real assistant, not a
 * fixed menu, while money-touching tasks stay on the deterministic tools.
 */
async function answerFreeform({ provider, gateway, households, messageText, store, threadId }) {
  const mentionedIds = scanHouseholdMentions(messageText, households).slice(0, 3);
  const householdContext = mentionedIds.map((id) => {
    const hh = provider.getHousehold(id);
    const signals = provider.getSignals(id) || {};
    return {
      household: hh?.name || id,
      financial_posture: signals.financial?.posture,
      life_events: (signals.life_events || []).map((e) => e.type || e.name),
      behavioral_modeled: (signals.behavioral || []).map((b) => ({
        pattern: b.name,
        level: b.level,
        evidence: b.evidence,
      })),
      risk_modeled: (signals.risk || []).map((r) => ({ type: r.type, evidence: r.evidence })),
      observed_spend: summarizeSpend(provider.getTransactions(id)),
    };
  });

  const turns = await store.listTurns(threadId);
  const context = {
    institution: provider.getInstitution?.()?.name,
    advisor_book: households.map((h) => h.name),
    catalog: (provider.getCatalog() || []).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
    })),
    households: householdContext,
    recent_turns: turns
      .slice(-4)
      .map((t) => ({ direction: t.direction, text: t.text, summary: t.summary }))
      .filter((t) => t.text || t.summary),
    capabilities: ['audience_build', 'compose_outreach', 'prep', 'evidence', 'summary'],
  };

  const { text } = await answerQuestion({ gateway, question: messageText, context });
  if (text) {
    return {
      paragraphs: [text],
      sections: [],
      forwardMove: null, // the grounded answer carries its own next step
      summary: 'freeform_answer',
      result: null,
      householdId: mentionedIds.length === 1 ? mentionedIds[0] : null,
      status: 'completed',
    };
  }

  return clarify(
    'I can build target audiences, draft outreach, prep you for a household, pull what we know on a household, recap this thread — and answer questions about any household in your book. What would you like?'
  );
}

/** Most recent audience_build task result in this thread, or null. */
function findLastAudience(priorTasks = []) {
  for (let i = priorTasks.length - 1; i >= 0; i--) {
    const t = priorTasks[i];
    if (t?.task_type === 'audience_build' && t.result?.candidates?.length) return t.result;
  }
  return null;
}

/**
 * Resolve explicitly named outreach targets to ids, combining the classifier's
 * extracted ids with a deterministic scan of the raw message text. The text scan
 * is the reliable path; the classifier fields are a bonus.
 */
function resolveOutreachTargets({ intent, households, messageText = '' }) {
  const ids = [];
  const add = (id) => {
    if (id && !ids.includes(id)) ids.push(id);
  };
  const mentions = [];
  if (Array.isArray(intent.household_ids)) mentions.push(...intent.household_ids);
  if (intent.household_id) mentions.push(intent.household_id);
  for (const m of mentions) {
    const hh = resolveHousehold(households, m);
    if (hh) add(hh.id);
  }
  for (const id of scanHouseholdMentions(messageText, households)) add(id);
  return ids;
}

/**
 * Resolve a single household for prep/evidence: trust the classifier's id first,
 * then fall back to scanning the message text (unambiguous match only).
 */
function resolveSingleHousehold({ intent, households, messageText }) {
  const byIntent = resolveHousehold(households, intent.household_id);
  if (byIntent) return byIntent;
  const scanned = scanHouseholdMentions(messageText, households);
  if (scanned.length === 1) return households.find((h) => h.id === scanned[0]) || null;
  return null;
}

/**
 * The households an advisor operates over. Uses the advisor's authoritative
 * household_ids list (the same set buildAudience iterates) rather than filtering
 * by each household's ownership field — critical for the synthetic demo advisor,
 * whose book spans households owned by other advisors. Falls back to the
 * ownership filter if no ids are present.
 */
function advisorHouseholds(provider, advisor) {
  const ids = advisor?.household_ids || [];
  if (ids.length) {
    return ids.map((id) => provider.getHousehold(id)).filter(Boolean);
  }
  return provider.getHouseholds({ advisorId: advisor?.id });
}

/** Guarantee non-empty reply text so a blank email can never go out. */
function ensureText(value, fallback) {
  const t = String(value || '').trim();
  return t.length ? t : fallback;
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

/**
 * Synthesize an advisor for an unrecognized sender in demo mode. Clones the
 * fixture advisor with the widest book so every task type has data to reason
 * over, then overrides identity to the actual sender so replies address them by
 * name and household scoping resolves to the full demo portfolio.
 */
function buildDemoAdvisor(fromAddress, provider) {
  const advisors = provider.getAdvisors() || [];
  const base = advisors.reduce(
    (best, a) =>
      (a?.household_ids?.length || 0) > (best?.household_ids?.length || 0) ? a : best,
    advisors[0] || null
  );
  return {
    ...(base || { id: 'adv_demo', household_ids: [] }),
    email: (fromAddress || '').trim().toLowerCase(),
    name: displayNameFromEmail(fromAddress),
  };
}

/** Turn an email local-part into a friendly display name, e.g. "jamie.lee" -> "Jamie Lee". */
function displayNameFromEmail(fromAddress) {
  const local = String(fromAddress || '').split('@')[0] || '';
  const words = local
    .split(/[._+-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.join(' ') || 'there';
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
