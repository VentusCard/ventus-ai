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
  isAutomatedMessage,
  parseInboundEmail,
  replySubject,
  resolveThreadId,
  stripQuotedReply,
} from './mail.mjs';
import {
  renderAudienceTable,
  renderBullets,
  renderOutreachDraft,
  renderShell,
} from './render.mjs';
import { pluralize } from './labels.mjs';
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
 * @param {object} [opts.rateLimit] per-sender abuse guard for an open inbox.
 *   { limit, windowMs }. Set limit<=0 to disable. Defaults to 12 / hour.
 * @param {number} [opts.maxBodyChars] cap on the message body fed to the model,
 *   to bound token cost / prompt-stuffing on an open inbox. Defaults to 8000.
 * @returns {Promise<object>} turn result
 */
export async function runCoworkerTurn({
  raw,
  provider,
  gateway,
  store = createCoworkerStore(createInMemoryBackend()),
  clock = () => new Date(),
  demoOpen = false,
  rateLimit = { limit: 12, windowMs: 3600_000 },
  maxBodyChars = 8000,
}) {
  if (!provider) throw new Error('runCoworkerTurn requires a portfolio provider');
  if (!gateway) throw new Error('runCoworkerTurn requires a model gateway');

  const now = clock();
  const nowIso = now.toISOString();
  const institution = provider.getInstitution();
  const domain = institution?.domain || 'ventusai.com';

  const message = parseInboundEmail(raw);

  // 1. Loop / bounce guard — never auto-reply to auto-responders, bounces,
  //    mailing lists, or no-reply senders. Doing so risks an infinite mail loop
  //    and burns a turn on a non-human. Checked before allowlist so even an
  //    allowlisted advisor's out-of-office does not trigger a reply.
  const automated = isAutomatedMessage(message);
  if (automated.automated) {
    return {
      allowed: false,
      from: message.from,
      reply: null,
      reason: `automated_message:${automated.reason}`,
    };
  }

  // 2. Allowlist gate — before any model or data access. In demo mode, unknown
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

  // 3. Per-sender rate limit — protects the open demo inbox from a single sender
  //    flooding it (cost + spam). Applied after the sender is known so both
  //    admitted advisors and demo senders are covered. Bounces silently (no
  //    reply) so we don't hand an attacker a reply amplifier.
  if (rateLimit && rateLimit.limit > 0 && typeof store.checkAndBumpRate === 'function') {
    const rate = await store.checkAndBumpRate({
      sender: message.from,
      now,
      windowMs: rateLimit.windowMs ?? 3600_000,
      limit: rateLimit.limit,
    });
    if (!rate.allowed) {
      return {
        allowed: false,
        from: message.from,
        reply: null,
        reason: 'rate_limited',
        rate,
      };
    }
  }

  // 4. Idempotency. SES and Lambda are both at-least-once, so the same email
  //    can arrive twice. Replying twice to one message reads as a broken
  //    teammate, so a redelivery is dropped silently.
  if (message.messageId && typeof store.claimMessage === 'function') {
    const claim = await store.claimMessage({ messageId: message.messageId, now });
    if (!claim.firstTime) {
      return {
        allowed: false,
        from: message.from,
        reply: null,
        reason: 'duplicate_message',
        firstSeenAt: claim.claimedAt,
      };
    }
  }

  // 5. Thread + turn bookkeeping.
  const threadId = resolveThreadId(message) || `t_${hash(message.from + nowIso)}`;
  const priorTurns = await store.listTurns(threadId);
  const priorThread = await store.getThread(threadId);
  const baseSeq = priorTurns.length;
  const turnIndex = baseSeq + 1;
  const cleanBody = capText(stripQuotedReply(message.body), maxBodyChars);

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

  // 6. Classify intent, unless the advisor simply said yes to something we
  //    offered. Sending "Want me to draft outreach for the top three?" and then
  //    answering "yes" with a menu of capabilities is the single most damaging
  //    thing this agent can do: it proves it was not really listening. A bare
  //    affirmative against a standing offer executes the offer.
  const householdRoster = advisorHouseholds(provider, advisor);
  const pendingOffer = priorThread?.pending_offer || null;
  const accepted = pendingOffer && isAffirmative(cleanBody);
  const intent = accepted
    ? { ...pendingOffer.intent, confidence: 1, accepted_offer: true }
    : await classifyIntent(gateway, {
        subject: message.subject,
        body: cleanBody,
        catalog: provider.getCatalog(),
        households: householdRoster,
        priorTurns: priorTurns.slice(-6),
      });

  // 7. Route + render. Prior tasks give us slot memory: e.g. "draft outreach for
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
    messageText: accepted
      ? pendingOffer.message_text || ''
      : `${message.subject || ''} ${cleanBody}`,
  });

  // 8. Build the outbound reply.
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
  const safeParagraphs = (rendered.paragraphs || [])
    .map((p) => String(p || '').trim())
    .filter((p) => p.length);
  if (!safeParagraphs.length && !(rendered.sections || []).length) {
    safeParagraphs.push(
      "I wasn't able to put together a full answer on that one. I can screen your book for a product, draft outreach, prep you for a household, pull what we know on a household, or recap this thread. Which would help?"
    );
  }
  // The shell supplies the greeting. Model-written prose routinely opens with
  // its own, which produced two greetings in a row.
  if (safeParagraphs.length) {
    safeParagraphs[0] = stripLeadingGreeting(safeParagraphs[0]);
  }

  let html = renderShell({
    greeting: `Hi ${firstName(advisor.name)},`,
    paragraphs: safeParagraphs,
    sections: rendered.sections,
    forwardMove: rendered.forwardMove,
  });

  // Last gate before send: every household named in the message must exist in
  // this advisor's book. A fabricated client name is the one error that cannot
  // be walked back, so if the check trips we send an honest failure instead of
  // a confident invention.
  const unknownNames = findUnknownHouseholdNames(html, householdRoster);
  if (unknownNames.length) {
    html = renderShell({
      greeting: `Hi ${firstName(advisor.name)},`,
      paragraphs: [
        'I put something together for that and then caught a problem with it: my draft referenced a household I cannot match to your book, so I have held it back rather than send you something with a name I invented.',
        'Ask me again and I will rebuild it from your roster.',
      ],
      sections: [],
      forwardMove: null,
    });
  }

  // 9. Persist thread meta, outbound turn, and the task row. The pending offer
  //    is what makes a later "yes" executable.
  await store.upsertThread({
    thread_id: threadId,
    advisor_id: advisor.id,
    subject: message.subject,
    last_task_type: intent.task_type,
    pending_offer: unknownNames.length ? null : rendered.offer || null,
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
    acceptedOffer: Boolean(accepted),
    nameCheck: { passed: unknownNames.length === 0, unknown: unknownNames },
    reply: {
      to: message.from,
      subject,
      headers,
      html,
    },
    task: { taskId, task_type: intent.task_type, status: rendered.status || 'completed' },
  };
}

// A bare affirmative reply to a standing offer. Deliberately narrow: only a
// short message that is essentially just agreement counts, so "yes, but only
// for Okafor" still goes through intent classification where the qualifier can
// be picked up.
const AFFIRMATIVE = /^(yes|yep|yeah|yup|sure|ok|okay|please|please do|do it|go ahead|go for it|sounds good|sounds great|perfect|great|absolutely|let's do it|lets do it)[\s.!]*$/i;

export function isAffirmative(text) {
  const trimmed = String(text || '').trim().replace(/^(yes|yeah|sure)[,\s]+please[\s.!]*$/i, 'yes');
  if (trimmed.length > 24) return false;
  return AFFIRMATIVE.test(trimmed);
}

/**
 * Household names present in the rendered message that are not in the
 * advisor's book. Matches the canonical "<Surname> Household" form that every
 * fixture and every table uses.
 *
 * The leading capitalized words are matched greedily and then trimmed from the
 * left, because surrounding prose supplies capitals of its own: "For Okafor
 * Household" would otherwise be read as a household named "For Okafor". A
 * match counts as known if any suffix of the captured words names a real
 * household, which also handles multi-word surnames.
 */
export function findUnknownHouseholdNames(html, roster = []) {
  const known = new Set(roster.map((h) => String(h.name || '').toLowerCase()));
  const found = new Set();
  for (const match of String(html || '').matchAll(
    /\b([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)*)\s+Household\b/g
  )) {
    const words = match[1].split(/\s+/);
    const matchesKnown = words.some((_, i) =>
      known.has(`${words.slice(i).join(' ')} Household`.toLowerCase())
    );
    if (!matchesKnown) found.add(`${words[words.length - 1]} Household`);
  }
  return [...found];
}

/**
 * Remove a greeting the model wrote for itself, so the shell's greeting is the
 * only one in the message.
 */
export function stripLeadingGreeting(text) {
  return String(text || '')
    .replace(/^\s*(hi|hey|hello|good\s+(morning|afternoon|evening))\b[^,\n]{0,40}[,!]?\s*/i, '')
    .trim();
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
          'Happy to screen the book for that. Which product should I target? For example high-yield savings, the travel card, or a HELOC.'
        );
      }
      let audience;
      try {
        audience = buildAudience({ provider, advisorId: advisor.id, productId: intent.product_id });
      } catch (e) {
        return clarify(`I couldn't find a product called "${intent.product_id}" in the catalog.`);
      }
      const table = renderAudienceTable(audience);
      const { fits, excluded, no_signal: noSignal } = audience.reconciliation;
      const excludedNote = excluded
        ? ` ${excluded} ${excluded === 1 ? 'is' : 'are'} held back by the institution's own product rules`
        : '';
      const noSignalNote = noSignal
        ? `${excluded ? ', and ' : ' '}${noSignal} ${noSignal === 1 ? 'has' : 'have'} nothing on file that supports it`
        : '';
      return {
        paragraphs: [
          `I screened all ${pluralize(audience.considered, 'household')} in your book against ${audience.product.name}. ${pluralize(fits, 'household')} ${fits === 1 ? 'fits' : 'fit'}.${excludedNote}${noSignalNote}.`,
        ],
        sections: [{ heading: `Best fit for ${audience.product.name}`, html: table }],
        forwardMove: fits
          ? `Want me to draft outreach for ${draftTargetPhrase(audience.candidates)}?`
          : 'Want me to widen the criteria or try a different product?',
        // A standing offer the advisor can accept with a single word.
        offer: fits
          ? {
              intent: {
                task_type: 'compose_outreach',
                product_id: audience.product.id,
                household_id: null,
                household_ids: null,
              },
              label: `draft outreach for ${draftTargetPhrase(audience.candidates)}`,
              message_text: '',
            }
          : null,
        summary: `audience_build for ${audience.product.name}: ${fits} fit, ${excluded} excluded, ${noSignal} without signal`,
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
          "Happy to draft outreach. Which product is it for, and which households? If you'd rather, ask me to screen the book first and I'll draft for the best fits."
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
          // They named specific households that are not in the fitting set. Do
          // not silently draft the wrong people. Explain and offer next steps.
          const names = namedIds.map(
            (id) => households.find((h) => h.id === id)?.name || id
          );
          const excluded = (lastAudience?.excluded || []).filter((s) =>
            namedIds.includes(s.household_id)
          );
          const why = excluded.length
            ? ` ${excluded
                .map(
                  (s) =>
                    `the institution's product rules hold back ${s.household_name || s.household_id} for ${s.reason_label || s.reason}`
                )
                .join('; ')}.`
            : '';
          return clarify(
            `${names.join(', ')} ${names.length > 1 ? "aren't" : "isn't"} in the fitting set for ${product.name}.${why} Want me to draft for the households that do fit, or prep you on ${names[0]}?`
          );
        }
      }

      if (!candidates.length) {
        return clarify(
          `No households in your book fit ${product?.name || 'that product'} right now. Want me to screen for something else?`
        );
      }

      const { drafts } = await generateOutreach({ gateway, product, candidates });
      if (!drafts.length) {
        return clarify('I ran into trouble drafting those. Want me to try again?');
      }
      const sections = drafts.map((d) => ({
        heading: `For ${d.household_name}`,
        html: renderOutreachDraft({
          subject: d.subject,
          clientBody: d.client_body,
          rationale: d.rationale,
          window: d.window,
        }),
      }));
      return {
        paragraphs: [
          `Here ${drafts.length === 1 ? 'is a draft' : 'are drafts'} for ${pluralize(drafts.length, 'household')} on ${product.name}. Each one is written in your voice, with the reasoning underneath it so you can check my work before you send anything. I have kept every dollar figure out of the client half.`,
        ],
        sections,
        forwardMove: 'Want me to change the tone on any of these, or prep you for the calls?',
        summary: `compose_outreach for ${product.name}: ${pluralize(drafts.length, 'draft')}`,
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
          ? [{ heading: 'What we see', html: renderBullets(prep.evidence.bullets) }]
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
        sections: [{ heading: 'What we see', html: renderBullets(ev.bullets) }],
        forwardMove: 'Want me to prep you for a meeting with them?',
        offer: {
          intent: { task_type: 'prep', household_id: hh.id, product_id: null, household_ids: null },
          label: `prep you for ${ev.household.name}`,
          message_text: ev.household.name,
        },
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
    'I can screen your book for a product, draft outreach, prep you for a household, pull what we know on one, recap this thread, or answer questions about anyone in your book. What would help?'
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

/**
 * How to describe the households an outreach offer would cover. "The top 1" is
 * the kind of phrase that tells an advisor a template wrote this, so a single
 * fit gets named outright.
 */
function draftTargetPhrase(candidates = []) {
  if (candidates.length === 1) return candidates[0].household_name;
  return `the top ${Math.min(3, candidates.length)}`;
}

function clarify(text) {
  return {
    paragraphs: [text],
    sections: [],
    forwardMove: null,
    offer: null,
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

// Bound the message text handed to the model so a single huge email can't blow
// up token cost or attempt prompt-stuffing on the open inbox.
function capText(text, maxChars) {
  const s = text || '';
  if (!maxChars || maxChars <= 0 || s.length <= maxChars) return s;
  return `${s.slice(0, maxChars)}\n\n[message truncated]`;
}
