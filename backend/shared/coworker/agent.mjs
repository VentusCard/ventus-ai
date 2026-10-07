// backend/shared/coworker/agent.mjs
//
// An agentic replacement for the classify-then-switch router in core.mjs.
//
// The router reads one message, picks one of six task types, and runs exactly
// one task. That is why the coworker feels rigid: an advisor who asks two
// things gets one answer, and an advisor who asks something adjacent to a task
// gets the nearest task instead of the thing they asked for. Here the model
// decides what to do, in as many steps as it needs, by calling tools.
//
// Two rules make that safe enough to put in front of an advisor.
//
// 1. FACTS, NOT PROSE. Every tool returns a small structured payload with no
//    rendered output in it. The model composes the sentences; it never gets
//    handed sentences to paraphrase, because paraphrasing a figure is how a
//    figure changes.
//
// 2. ARTIFACTS BY HANDLE. Rendered tables and client drafts are put in a
//    registry and referenced by an opaque handle. The HTML never enters the
//    transcript, so the model cannot edit a dollar column on its way past, and
//    cannot spend tokens on markup. It chooses what to attach, not what the
//    attachment says.
//
// The contract out of runAgentTurn is deliberately identical to the router's
// routeAndRender return shape, so core.mjs can switch between them with one
// branch and everything downstream — the shell, the fabricated-name gate, the
// persistence, the pending-offer mechanics — is untouched. Returning null means
// "I could not do this", and the caller falls back to the router.

import {
  buildAudience,
  generateOutreach,
  generatePrep,
  resolveHousehold,
  resolveProduct,
  retrieveEvidence,
  summarizeBookActivity,
  summarizeThread,
} from './tasks.mjs';
import {
  renderAudienceTable,
  renderBullets,
  renderNotes,
  renderOutreachDraft,
} from './render.mjs';
import { pluralize } from './labels.mjs';

/** Model calls per turn. Each step is one round trip, so this is also a latency budget. */
export const DEFAULT_MAX_STEPS = 6;

// ---------------------------------------------------------------------------
// Artifacts
// ---------------------------------------------------------------------------

/**
 * A per-turn store of rendered HTML the model may attach but never read.
 *
 * The handle is the whole point. A tool that returned its table inline would
 * put every dollar figure in the transcript, and anything in the transcript is
 * something the model can restate slightly differently. Here the only thing it
 * can do with a table is attach it or not.
 */
export function createArtifactRegistry() {
  const items = new Map();
  let counter = 0;
  return {
    put({ heading, html }) {
      const id = `art_${++counter}`;
      items.set(id, { id, heading, html });
      return id;
    },
    get(id) {
      return items.get(String(id)) || null;
    },
    has(id) {
      return items.has(String(id));
    },
    size() {
      return items.size;
    },
    handles() {
      return [...items.keys()];
    },
  };
}

// ---------------------------------------------------------------------------
// Tool schemas
// ---------------------------------------------------------------------------

export const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'screen_book',
      description:
        "Screen every household in the advisor's book against one product and rank the ones that fit. Use when the advisor wants to know who to target, who qualifies, or who the best fits are. Returns counts, the ranked household names, and a handle for the results table. Dollar figures are in the table, not in the reply text.",
      parameters: {
        type: 'object',
        properties: {
          product: {
            type: 'string',
            description:
              'Product name or id from the catalog in the system prompt. Match one of those exactly.',
          },
        },
        required: ['product'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_household',
      description:
        "Everything we hold on one household: inferred life events, behavioral patterns, risk exclusions, financial posture, and what they actually spend on. Use when the advisor asks what we know about someone, or when you need facts about a household before answering a question about them.",
      parameters: {
        type: 'object',
        properties: {
          household: {
            type: 'string',
            description: 'Household name or id from the roster in the system prompt.',
          },
        },
        required: ['household'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'scan_book',
      description:
        "What is currently active across every household in the advisor's book, ordered with the busiest first. Use for any question about the book as a whole rather than one household: who has the most going on, where something has changed, who is worth a look. One call covers all of them, so never loop get_household to answer a question about the whole book.",
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'prep_household',
      description:
        'Write meeting preparation for one household: what to know going in and a concrete talking point. Use when the advisor has a meeting or call coming up with a specific household.',
      parameters: {
        type: 'object',
        properties: {
          household: {
            type: 'string',
            description: 'Household name or id from the roster in the system prompt.',
          },
        },
        required: ['household'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'draft_outreach',
      description:
        'Write client-facing outreach drafts for up to three households on one product, each in that household\'s advisor-recorded tone, with the advisor-only reasoning underneath. Use when the advisor asks you to draft, write, or compose something to send. If you have just screened the book and the advisor said "the top three" or similar, omit households and the highest-ranked fits are used.',
      parameters: {
        type: 'object',
        properties: {
          product: {
            type: 'string',
            description: 'Product name or id. Omit to reuse the product from the most recent screen.',
          },
          households: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description:
              'Specific household names or ids to draft for. Omit or null to use the top fits from the most recent screen.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recap_thread',
      description:
        'Summarize this email thread so far. Use only when the advisor asks what happened, what you have covered, or for a recap.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compose_reply',
      description:
        'Send the reply. Call this exactly once, as your final action. Everything you want the advisor to read goes here.',
      parameters: {
        type: 'object',
        properties: {
          paragraphs: {
            type: 'array',
            items: { type: 'string' },
            description:
              'The body of the email, one string per paragraph. No greeting and no sign-off; those are added for you. No markdown, no headers, no bullet characters.',
          },
          attach: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description:
              'Handles from the "attachments" list of the tool results, in the order you want them shown below your text. Attach everything your text refers to, and everything carrying a figure you chose not to write out.',
          },
          forward_move: {
            type: ['string', 'null'],
            description:
              'One question offering the single most useful next step, or null if your text already ends with one. Never offer two.',
          },
          offer_action: {
            type: ['string', 'null'],
            enum: ['draft_outreach', 'prep_household', 'screen_book', null],
            description:
              'If forward_move offers something you could do immediately, name the tool here so a one-word "yes" from the advisor executes it. Null otherwise.',
          },
          offer_product: {
            type: ['string', 'null'],
            description: 'Product for offer_action, if it needs one.',
          },
          offer_households: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'Households for offer_action, if it needs them.',
          },
        },
        required: ['paragraphs'],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
//
// NOTE FOR REVIEW: this is prompt/routing policy, which the repo guardrails put
// behind explicit human review.
//
// Revised after reading twenty replies side by side against the router. The
// first draft copied QA_SYSTEM's rule that inferred signals be introduced with
// "looks like" or "appears to be", and the model applied it to everything,
// including institutional product rules that are not inferences at all. The
// epistemics were right and the mechanism was wrong: hedging every verb reads
// as a system that is unsure of facts it is certain about. What replaces it is
// evidence-first phrasing, where the observation carries the uncertainty
// instead of the verb.
//
// QA_SYSTEM still carries the original rule and still drives the router, so the
// two paths phrase inference differently on purpose until the router is retired.
//
// The replacement then became its own tic: a single worked example using "which
// reads as" produced that exact phrase five times in one reply. An example
// sentence is copied, not generalized from, so the evidence-first rule now
// carries two differently worded examples and an explicit instruction not to
// reuse a connective.

export const AGENT_SYSTEM = `You are Ventus AI Coworker, an AI teammate for a wealth advisor. You reply by email in a warm, concise, peer tone, the way a capable colleague would.

HOW YOU WORK
You have tools. Use them to do the actual work, then call compose_reply exactly once to answer. Do the work before you describe it: never say you have screened, drafted, or prepared anything unless the matching tool has returned.

Answer what was asked. If the advisor asks two things, do both before composing. If they ask something no tool covers, answer it from the household facts and the catalog in your context, and say plainly when you do not have something rather than reaching for the nearest tool.

If the message refers back to something, like "do that again", "the same thing" or "those households", and your context shows no earlier conversation and no earlier screen, then there is nothing being referred to. Say so and ask what they want. Never pick a product or a household to make the reference work.

FACTS
Every claim you write must come from a tool result, the roster, or the catalog.

Never write a dollar amount, a percentage, or a rate in your own sentences, not even one a tool gave you. Every figure the advisor needs is already in what you attach. Your sentences say what the figures mean; the attachment shows them. A reply that quotes a number will not be sent at all, so there is nothing to gain by including one.

Household names come from the roster only. Never write a household name that is not on it.

WHAT THE ADVISOR CAN SEE
Tool results include an "attachments" list. Those are the only things the advisor sees besides your text, and only if you pass their handles to compose_reply. Everything else in a tool result is for your reasoning alone and is invisible to them.

Each attachment has a "shows" field saying what is in it. Use that to decide what to attach; it is not a phrase to put in your reply.

Do not point at what you attach. It appears directly under your text with its own heading, so the advisor cannot miss it, and a sentence spent announcing it is a sentence wasted. Write what the figures mean and stop; the panel does the showing. Never say the words artifact, attachment or handle, and do not say anything is "below".

If a tool result has no attachments list, nothing from it is visible to the advisor at all. A reply that says something is below and attaches nothing will not be sent.

WHAT IS CERTAIN AND WHAT IS NOT
Life events and behavioral patterns are read off spending, so they are inferences and must not be stated as things the household has told you. Carry that by naming what was observed and letting the read follow from it, worded differently each time. Two shapes that work: "Nakamura's spending has been running through home-improvement merchants and a contractor, which points to a renovation." and "Okafor books flights and lodging most months, and that is the pattern the travel card is built around." The evidence does the hedging for you, so the verb does not have to. Name the merchants and the categories, and let what you attach carry the amounts.

These are not inferences and must be stated flatly, with no hedge at all:
- Whether a household is held back by the institution's product rules, and which rule.
- Counts: how many were screened, fit, held back, or had nothing on file.
- Who is in the book and what products are in the catalog.
- Where the spending went, and the window it covers. Those are real observations, so state them without hedging. The amounts themselves still stay in the attachment.

Do not write "looks like", "appears to be", "it seems", "signals show", or "suggests" more than once in a reply, and never about anything in that list. A colleague who hedges a rule sounds unsure of the rulebook. The same goes for however you word the read off the evidence: use a given connective once. Four identical words joining every sentence make a reply look generated rather than written.

WHAT YOU CAN DO
You can screen the whole book against a product and rank the fits, and you can see what is active across the whole book in one call. Never tell the advisor you are unable to look across their households or compare them. If a request needs a product or a household you were not given, ask for that one missing thing.

A question about the book is answered with the book tool, once. Do not call the single-household tool repeatedly to build up a picture: you will run out of steps partway through and name a winner having seen half the roster.

When you genuinely do not have something, such as account numbers or live market data, say so in one sentence and stop. Do not follow a refusal with a list of everything else you could do.

WRITING
A few sentences. No headers, no markdown, no bullet characters, no em dashes. Do not open with a greeting.

The next step goes in forward_move and nowhere else. Do not end a paragraph with it as well: it is rendered for you, and a reply carrying both offers the advisor two things and looks like it forgot what it already said. It must name the specific thing you would do next and who or what it is for, like "Want me to draft outreach for Okafor on the travel card?". If you have nothing specific to propose, leave it null. Never offer to help further in general terms.

One subject to a paragraph. Two households, or two questions, is two paragraphs.

Do not describe yourself or your own machinery. No mention of tools, tasks, scores, confidence, or what you did and did not manage to run, and do not explain that you are an AI or how you work. If the advisor asks what you do, answer with the work itself: the kinds of questions you can settle and what they get back.`;

// ---------------------------------------------------------------------------
// Toolbox
// ---------------------------------------------------------------------------

/**
 * Build the executable side of the tools for one turn.
 *
 * `state` accumulates what the model has established so far, which is what
 * makes "draft outreach for the top three" work without the model having to
 * restate a product or a household list it has already seen.
 */
export function createToolbox({ provider, gateway, store, advisor, households, threadId, artifacts, lastAudience = null }) {
  const state = {
    audience: lastAudience,
    householdTouched: [],
  };

  // Kept as the single return point for every tool so there is one place to add
  // a cross-tool invariant. It collected serialized payloads for the old
  // provenance check; that check is gone, and nothing else needed them.
  const record = (payload) => payload;

  /** Resolve a model-supplied household reference, or explain what is valid. */
  const pickHousehold = (mention) => {
    const hh = resolveHousehold(households, mention);
    if (hh) return { ok: true, household: hh };
    return {
      ok: false,
      error: `No household matching "${mention}" in this advisor's book.`,
      valid_households: households.map((h) => h.name),
    };
  };

  return {
    state,

    async screen_book({ product: productRef }) {
      const product = resolveProduct(provider.getCatalog() || [], productRef);
      if (!product) {
        return record({
          error: `No product matching "${productRef}" in the catalog.`,
          valid_products: (provider.getCatalog() || []).map((p) => p.name),
        });
      }
      let audience;
      try {
        audience = buildAudience({ provider, advisorId: advisor.id, productId: product.id });
      } catch (e) {
        return record({ error: `Could not screen for ${product.name}.` });
      }
      state.audience = audience;

      const handle = artifacts.put({
        heading: `Best fit for ${audience.product.name}`,
        html: renderAudienceTable(audience),
      });

      // Deliberately no dollar figures. The ranking carries the ordering and the
      // table carries the money, so there is no number here for the model to
      // restate imprecisely.
      return record({
        product: audience.product.name,
        considered: audience.considered,
        fits: audience.reconciliation.fits,
        held_back_by_product_rules: audience.reconciliation.excluded,
        nothing_on_file: audience.reconciliation.no_signal,
        ranked_fits: (audience.candidates || []).map((c, i) => ({
          rank: i + 1,
          household: c.household_name,
          why: c.matched_signal_labels || [],
          outreach_window: c.outreach_window?.label || null,
        })),
        held_back_detail: (audience.excluded || []).map((e) => ({
          household: e.household_name,
          reason: e.reason_label || e.reason,
        })),
        attachments: [{ handle, shows: 'the ranked results, with the money' }],
        note: 'Dollar figures are in the table. Do not restate them in prose.',
      });
    },

    async get_household({ household: mention }) {
      const picked = pickHousehold(mention);
      if (!picked.ok) return record(picked);
      const ev = retrieveEvidence({ provider, householdId: picked.household.id });
      if (!ev.found) return record({ error: `Nothing on file for ${picked.household.name}.` });

      state.householdTouched.push(picked.household.id);
      // Named, because a reply can carry two of these. Two panels both headed
      // "What we see" leave the advisor guessing which household is which.
      const handle = artifacts.put({
        heading: `What we see for ${ev.household.name}`,
        html: renderBullets(ev.bullets),
      });

      return record({
        household: ev.household.name,
        primary_contact: ev.household.primary_contact || null,
        // Redacted, not the full bullets. The merchants, categories, counts and
        // windows are what the model needs to write an evidence-first sentence;
        // the amounts are not, and every figure that leaked into prose and cost
        // a turn came from this field. The advisor sees them in the panel.
        what_we_hold: ev.modelBullets,
        attachments: [{ handle, shows: 'the evidence, with the amounts' }],
      });
    },

    async scan_book() {
      const scan = summarizeBookActivity({ provider, households });
      if (!scan.households.length) return record({ error: 'The roster is empty.' });

      const handle = artifacts.put({
        heading: "What's active across the book",
        html: renderBullets(
          scan.households
            .filter((h) => h.life_events.length || h.patterns.length)
            .map((h) => `${h.household}: ${[...h.life_events, ...h.patterns].join(', ')}.`)
        ),
      });

      return record({
        considered: scan.considered,
        ordered_by: scan.ordered_by,
        households: scan.households,
        attachments: [{ handle, shows: 'every household and what is active for them' }],
        note: 'This covers the whole book, so a superlative like "the most going on" is answerable from it. Name the household at the top and say what is happening with them.',
      });
    },

    async prep_household({ household: mention }) {
      const picked = pickHousehold(mention);
      if (!picked.ok) return record(picked);
      const prep = await generatePrep({ gateway, provider, householdId: picked.household.id });
      state.householdTouched.push(picked.household.id);

      // The prep narrative is attached, not handed over for rewriting. It is
      // dense with figures, and asking for a rewrite put those figures into
      // model prose, where the no-figures rule then refused to send the reply —
      // so every prep turn declined and the router answered instead. Attaching
      // it also means the advisor reads the prep model's own sentences.
      //
      // One panel, not two. The evidence is already inside the notes, and a
      // reply carrying both produced "the prep notes are in the notes below,
      // and the detail is in the detail below".
      const notes = prep.evidence?.found && String(prep.text || '').trim();
      const attachments = notes
        ? [
            {
              handle: artifacts.put({
                heading: `Prep notes for ${picked.household.name}`,
                html: renderNotes(prep.text),
              }),
              shows: 'the prep notes in full',
            },
          ]
        : [];

      return record({
        household: picked.household.name,
        what_we_hold: prep.evidence?.modelBullets || [],
        attachments,
        grounded: Boolean(prep.evidence?.found),
        note: 'The prep notes are attached. Attach them; do not retype or summarize what they say.',
      });
    },

    async draft_outreach({ product: productRef, households: mentions }) {
      // Which product: an explicit one wins, otherwise the most recent screen.
      let product = null;
      let candidates = [];
      if (productRef) {
        const resolved = resolveProduct(provider.getCatalog() || [], productRef);
        if (!resolved) {
          return record({
            error: `No product matching "${productRef}" in the catalog.`,
            valid_products: (provider.getCatalog() || []).map((p) => p.name),
          });
        }
        try {
          const audience = buildAudience({
            provider,
            advisorId: advisor.id,
            productId: resolved.id,
          });
          state.audience = audience;
          product = audience.product;
          candidates = audience.candidates || [];
        } catch {
          return record({ error: `Could not screen for ${resolved.name}.` });
        }
      } else if (state.audience) {
        product = state.audience.product;
        candidates = state.audience.candidates || [];
      } else {
        return record({
          error:
            'No product given and nothing screened yet in this thread. Call screen_book first, or ask the advisor which product.',
        });
      }

      // Narrowing to named households is a refusal point, not a best-effort
      // match. Drafting to the wrong client is worse than not drafting.
      if (Array.isArray(mentions) && mentions.length) {
        const wanted = [];
        const unresolved = [];
        for (const m of mentions) {
          const hh = resolveHousehold(households, m);
          if (hh) wanted.push(hh);
          else unresolved.push(m);
        }
        if (unresolved.length) {
          return record({
            error: `Not in this advisor's book: ${unresolved.join(', ')}.`,
            valid_households: households.map((h) => h.name),
          });
        }
        const byId = new Map(candidates.map((c) => [c.household_id, c]));
        const picked = wanted.map((h) => byId.get(h.id)).filter(Boolean);
        if (!picked.length) {
          const notFitting = wanted.map((h) => h.name);
          const why = (state.audience?.excluded || [])
            .filter((e) => wanted.some((h) => h.id === e.household_id))
            .map((e) => ({ household: e.household_name, reason: e.reason_label || e.reason }));
          return record({
            error: `${notFitting.join(', ')} ${notFitting.length > 1 ? 'are' : 'is'} not in the fitting set for ${product.name}, so there is nothing defensible to draft.`,
            held_back_detail: why,
            fitting_instead: candidates.map((c) => c.household_name),
          });
        }
        candidates = picked;
      }

      if (!candidates.length) {
        return record({
          error: `No households fit ${product.name} right now.`,
        });
      }

      const { drafts } = await generateOutreach({ gateway, product, candidates });
      if (!drafts.length) return record({ error: 'Drafting failed.' });

      const withHandles = drafts.map((d) => ({
        household: d.household_name,
        subject: d.subject,
        tone: d.tone,
        outreach_window: d.window,
        // A draft that failed validation fell back to deterministic copy. The
        // model is told so it does not promise the advisor bespoke writing.
        used_fallback_copy: Boolean(d.validation?.used_fallback),
        handle: artifacts.put({
          heading: `For ${d.household_name}`,
          html: renderOutreachDraft({
            subject: d.subject,
            clientBody: d.client_body,
            rationale: d.rationale,
            window: d.window,
          }),
        }),
      }));

      return record({
        product: product.name,
        drafts: withHandles,
        attachments: withHandles.map((d) => ({
          handle: d.handle,
          shows: 'the client copy and the reasoning under it',
        })),
        note: 'The draft text itself is attached. Attach it; do not retype or summarize the client copy.',
      });
    },

    async recap_thread() {
      const turns = await store.listTurns(threadId);
      const text = await summarizeThread({ gateway, turns });
      return record({ recap: text, turns: turns.length });
    },
  };
}

// ---------------------------------------------------------------------------
// Figure provenance
// ---------------------------------------------------------------------------

const FIGURE_PATTERN = /\$\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s?%|\b\d+(?:\.\d+)?\s?(?:percent|bps|basis points)\b/gi;

/**
 * A pointer at something meant to be attached.
 *
 * Deliberately only the nouns a reply would use for a panel, so a sentence like
 * "their buffer is below what the rule allows" is not mistaken for a promise.
 */
const PROMISED_PANEL = /\b(?:table|list|detail|details|notes|draft|drafts|panel|breakdown)\s+below\b/i;

/**
 * Money and percentages in the model's own sentences.
 *
 * This started as a provenance check: a figure was allowed if it appeared in
 * something a tool had returned. Reading twenty real replies showed why that is
 * the wrong line. Evidence bullets are quotable and they contain most of the
 * money, so a "sourced" reply would restate a household's savings transfer in
 * prose, four lines above a table quoting a modelled annual benefit, and the
 * advisor is left reconciling two correct numbers that were never meant to sit
 * together.
 *
 * So the rule is now positional rather than evidential: figures live in the
 * attachments, prose says what they mean. That also makes the check something
 * an advisor can verify by looking, instead of something only the transcript
 * can settle.
 *
 * @param {string[]} paragraphs  model-composed prose
 * @returns {string[]} figures that belong in an attachment instead
 */
export function findProseFigures(paragraphs = []) {
  const found = new Set();
  for (const para of paragraphs) {
    for (const raw of String(para || '').match(FIGURE_PATTERN) || []) {
      found.add(raw.trim());
    }
  }
  return [...found];
}

/** Sentence-ish split that keeps the terminator with the sentence. */
function sentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+(?=[A-Z("'\u2018\u201c])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Put the next step in exactly one place, whatever the model did.
 *
 * The prompt asks for it in forward_move, and across twenty replies it came
 * back three ways: labelled, buried in the last sentence, and absent. All three
 * render differently, so the same product looked like three products. Rather
 * than ask again, the trailing question is lifted out of the prose here, and a
 * reply that offers something twice keeps the one the model put in the field.
 *
 * Never lifts the only sentence: a reply whose whole point is a clarifying
 * question would otherwise end up with an empty body.
 */
export function splitForwardMove(paragraphs, declared) {
  const move = declared ? String(declared).trim() : '';
  const body = [...paragraphs];
  const lastIdx = body.length - 1;
  if (lastIdx < 0) return { paragraphs: body, forwardMove: move || null };

  const parts = sentences(body[lastIdx]);
  const trailingQuestion = parts.length && parts[parts.length - 1].endsWith('?');
  const somethingLeft = parts.length > 1 || body.length > 1;
  if (!trailingQuestion || !somethingLeft) {
    return { paragraphs: body, forwardMove: move || null };
  }

  const lifted = parts.pop();
  if (parts.length) body[lastIdx] = parts.join(' ');
  else body.splice(lastIdx, 1);

  // A declared move wins. It was chosen deliberately and it is the one the
  // offer mechanics were built from, so the prose copy is the duplicate.
  return { paragraphs: body, forwardMove: move || lifted };
}

/**
 * Break up a paragraph that is carrying a whole reply.
 *
 * Two of twenty replies answered a compound question in one eight-sentence
 * block. The prompt now asks for one subject per paragraph, but the rendering
 * should not depend on the model remembering: an unbroken wall in an email is
 * the difference between being read and being skimmed.
 */
export function splitLongParagraphs(paragraphs, maxSentences = 3) {
  const out = [];
  for (const para of paragraphs) {
    const parts = sentences(para);
    if (parts.length <= maxSentences) {
      out.push(para);
      continue;
    }
    for (let i = 0; i < parts.length; i += maxSentences) {
      out.push(parts.slice(i, i + maxSentences).join(' '));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// The loop
// ---------------------------------------------------------------------------

/**
 * Run one agent turn.
 *
 * @param {(reason: string) => void} [opts.onDecline] called with a short reason
 *   when the turn is handed back. Every decline is invisible in the output,
 *   because the router answers well enough that a broken agent path reads as a
 *   working one; the reason is the only way to tell a gateway failure from a
 *   guardrail doing its job.
 * @returns {Promise<object|null>} the same shape routeAndRender returns, or
 *   null when the agent could not produce a safe reply. Null is not an error
 *   path to be logged and forgotten: it means the caller should run the router
 *   instead, so the advisor still gets an answer.
 */
export async function runAgentTurn({
  provider,
  gateway,
  store,
  advisor,
  households = [],
  threadId,
  messageText = '',
  priorTurns = [],
  lastAudience = null,
  maxSteps = DEFAULT_MAX_STEPS,
  onDecline,
}) {
  const decline = (reason) => {
    try {
      onDecline?.(reason);
    } catch {
      // Reporting a decline must never be the thing that fails a turn.
    }
    return null;
  };

  if (!provider || !gateway) return decline('no_provider_or_gateway');

  const artifacts = createArtifactRegistry();
  const toolbox = createToolbox({
    provider,
    gateway,
    store,
    advisor,
    households,
    threadId,
    artifacts,
    lastAudience,
  });

  const catalog = provider.getCatalog() || [];
  const context = [
    `Advisor: ${advisor?.name || 'the advisor'}.`,
    `Institution: ${provider.getInstitution?.()?.name || 'the institution'}.`,
    households.length
      ? `Roster, the only household names you may use (${pluralize(households.length, 'household')}): ${households
          .map((h) => h.name)
          .join(', ')}.`
      : 'Roster: empty.',
    catalog.length
      ? `Catalog: ${catalog.map((p) => `${p.name} (${p.category})`).join(', ')}.`
      : 'Catalog: empty.',
    lastAudience
      ? `Already screened in this thread: ${lastAudience.product?.name}, top fits ${(lastAudience.candidates || [])
          .slice(0, 3)
          .map((c) => c.household_name)
          .join(', ')}. A reference to "the top three" or "those households" means these.`
      : null,
    // Stated rather than omitted. An absent section reads as missing
    // information, which the model fills in; this says the thing itself does
    // not exist, which is what makes "do that again" answerable.
    priorTurns.length
      ? `Recent conversation, oldest first:\n${priorTurns
          .map((t) => `[${t.direction || '?'}] ${t.summary || t.text || ''}`)
          .filter((l) => l.trim().length > 4)
          .join('\n')}`
      : 'Recent conversation: none. This is the first message in the thread, and nothing was said before it.',
  ]
    .filter(Boolean)
    .join('\n\n');

  const messages = [
    { role: 'system', content: `${AGENT_SYSTEM}\n\nCONTEXT\n${context}` },
    { role: 'user', content: messageText },
  ];

  const transcript = [];

  try {
    for (let step = 0; step < maxSteps; step++) {
      const { response } = await gateway.chatCompletion({
        task: 'coworker_agent',
        label: 'COWORKER agent',
        maxRetries: 1,
        messages,
        tools: AGENT_TOOLS,
        // The last step is forced to compose, so a model that keeps gathering
        // still produces an email rather than running out of budget silently.
        tool_choice:
          step === maxSteps - 1
            ? { type: 'function', function: { name: 'compose_reply' } }
            : 'auto',
      });
      if (!response.ok) return decline(`gateway_http_${response.status}`);
      const data = await response.json();
      const choice = data.choices?.[0]?.message;
      if (!choice) return decline('no_choice_in_response');

      const calls = choice.tool_calls || [];

      // No tool call. Prose at this point is the model answering directly,
      // which is legitimate for a question that needs no tools, so treat it as
      // an implicit compose rather than discarding a good answer.
      //
      // Everything a tool built gets attached here. The model skipped its
      // chance to choose, and prose that says "I've attached the table" with
      // nothing under it is worse than an extra table: the advisor is told a
      // figure exists and then cannot see it.
      if (!calls.length) {
        const text = String(choice.content || '').trim();
        if (!text) return decline('no_tool_call_and_no_content');
        return finish({
          args: { paragraphs: [text], attach: artifacts.handles(), forward_move: null },
          artifacts,
          toolbox,
          households,
          provider,
          transcript,
          decline,
        });
      }

      messages.push({
        role: 'assistant',
        content: choice.content || '',
        tool_calls: calls,
      });

      for (const call of calls) {
        const name = call.function?.name;
        let args = {};
        try {
          args = JSON.parse(call.function?.arguments || '{}');
        } catch {
          args = {};
        }

        if (name === 'compose_reply') {
          transcript.push({ tool: name, args });
          return finish({ args, artifacts, toolbox, households, provider, transcript, decline });
        }

        const fn = toolbox[name];
        const result = fn
          ? await fn(args)
          : { error: `No tool named ${name}. Available: screen_book, scan_book, get_household, prep_household, draft_outreach, recap_thread, compose_reply.` };
        transcript.push({ tool: name, args, ok: !result?.error });

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }
    return decline(`step_budget_exhausted_after_${maxSteps}`);
  } catch (err) {
    // Any throw — bad JSON, gateway failure, a tool blowing up on unexpected
    // fixture shape — hands the turn back to the router rather than sending
    // something half-built.
    return decline(`threw: ${err?.message || 'unknown error'}`);
  }
}

/**
 * Turn a compose_reply call into the router's return shape, after the checks
 * that decide whether it may be sent at all.
 */
function finish({
  args,
  artifacts,
  toolbox,
  households,
  provider,
  transcript,
  decline = () => null,
}) {
  const paragraphs = (Array.isArray(args.paragraphs) ? args.paragraphs : [args.paragraphs])
    .map((p) => String(p || '').trim())
    .filter((p) => p.length);
  if (!paragraphs.length) return decline('compose_reply_had_no_paragraphs');

  // A figure in prose is either invented, which an advisor cannot catch by
  // reading, or duplicated from an attachment, which makes the reply argue with
  // itself. Neither is worth sending, and the router answers instead.
  const figures = findProseFigures(paragraphs);
  if (figures.length) return decline(`figure_in_prose: ${figures.join(', ')}`);

  // Attachments resolve by handle, so an invented handle drops out silently
  // rather than becoming an empty section in the email.
  const sections = (Array.isArray(args.attach) ? args.attach : [])
    .map((h) => artifacts.get(h))
    .filter(Boolean)
    .map((a) => ({ heading: a.heading, html: a.html }));

  // Prose that promises a panel and attaches none tells the advisor a figure
  // exists and then does not show it, which is worse than attaching one too
  // many. An invented handle drops out here silently, so the promise outliving
  // the panel is not hypothetical.
  const promised = paragraphs.join(' ').match(PROMISED_PANEL);
  if (promised && !sections.length) {
    return decline(`promised_but_not_attached: ${promised[0]}`);
  }

  const offer = buildOffer({ args, households, provider, state: toolbox.state });

  // One next step, one place, one rendering. Done after the figure and promise
  // checks so those still see everything the model wrote.
  const { paragraphs: body, forwardMove } = splitForwardMove(paragraphs, args.forward_move);

  const touched = toolbox.state.householdTouched;
  return {
    paragraphs: splitLongParagraphs(body),
    sections,
    forwardMove,
    offer,
    summary: summarizeTranscript(transcript),
    result: toolbox.state.audience || null,
    householdId: touched.length === 1 ? touched[0] : null,
    status: 'completed',
    agent: { steps: transcript.length, tools: transcript.map((t) => t.tool) },
  };
}

/**
 * Convert the model's declared offer into an executable intent.
 *
 * The model names the action and the subject; the intent itself is assembled
 * here from resolved ids. That split matters: a pending offer is the thing a
 * bare "yes" executes, so letting the model write the intent directly would let
 * a confidently worded offer run the wrong task. Anything that fails to resolve
 * drops the offer entirely, which costs a follow-up question and never costs a
 * wrong send.
 */
function buildOffer({ args, households, provider, state }) {
  const action = args.offer_action || null;
  if (!action) return null;
  const label = String(args.forward_move || '').trim();
  if (!label) return null;

  if (action === 'prep_household') {
    const refs = Array.isArray(args.offer_households) ? args.offer_households : [];
    const hh = resolveHousehold(households, refs[0]);
    if (!hh) return null;
    return {
      intent: { task_type: 'prep', household_id: hh.id, product_id: null, household_ids: null },
      label,
      message_text: hh.name,
    };
  }

  if (action === 'screen_book' || action === 'draft_outreach') {
    const productRef = args.offer_product || state.audience?.product?.id || null;
    const product = productRef ? resolveProduct(provider.getCatalog() || [], productRef) : null;
    if (!product) return null;
    const refs = Array.isArray(args.offer_households) ? args.offer_households : [];
    const ids = refs.map((r) => resolveHousehold(households, r)?.id).filter(Boolean);
    return {
      intent: {
        task_type: action === 'screen_book' ? 'audience_build' : 'compose_outreach',
        product_id: product.id,
        household_id: null,
        household_ids: ids.length ? ids : null,
      },
      label,
      message_text: '',
    };
  }

  return null;
}

/** A one-line description of what the turn actually did, for the task row. */
function summarizeTranscript(transcript = []) {
  const used = transcript.map((t) => t.tool).filter((t) => t && t !== 'compose_reply');
  if (!used.length) return 'agent: answered directly';
  return `agent: ${used.join(' -> ')}`;
}
