// backend/shared/coworker/tasks.mjs
//
// The Coworker's task tools. Two flavors:
//
//  1. Deterministic, model-free logic (intent tool schema, evidence retrieval,
//     audience build). These are the auditable core: given the same portfolio,
//     they always produce the same ranked candidates, the same benefit figures,
//     and the same exclusions. Fully offline-testable.
//
//  2. Model-backed narration (prep, summary, reply prose). These wrap the model
//     gateway and are injected so tests can stub them.
//
// Benefit figures come from benefit.mjs, which distinguishes a computed figure
// (this household's transactions against the published rate card, net of what
// they earn today and net of the fee) from an estimate that rests on an
// assumption. Callers must carry that distinction through to the reader.
//
// Internal signal keys never leave this module in raw form: labels.mjs converts
// them to phrases an advisor can read aloud.

import {
  NON_CONSUMPTION_SUBCATEGORIES,
  benefitFor,
  benefitRank,
  headlineBenefit,
} from './benefit.mjs';
import {
  exclusionLabel,
  isBalanceDerived,
  lifeEventLabel,
  outreachWindow,
  pluralize,
  signalLabel,
} from './labels.mjs';

// ---------------------------------------------------------------------------
// Intent classification
// ---------------------------------------------------------------------------

export const COWORKER_TASK_TYPES = [
  'audience_build', // "who should I pitch product X to"
  'compose_outreach', // "draft outreach for these households / the top N"
  'prep', // "prep me for my meeting with household Y"
  'evidence', // "what do we know about household Y"
  'summary', // "summarize this thread / recap"
  'other', // anything else -> grounded conversational answer
];

export const INTENT_TOOL = [
  {
    type: 'function',
    function: {
      name: 'classify_intent',
      description:
        "Classify a wealth advisor's email to the AI coworker into a single task type and extract entities.",
      parameters: {
        type: 'object',
        properties: {
          task_type: {
            type: 'string',
            enum: COWORKER_TASK_TYPES,
            description: 'The single best-fit task for this message.',
          },
          product_id: {
            type: ['string', 'null'],
            description: 'Catalog product id if the advisor named/implied a product, else null.',
          },
          household_id: {
            type: ['string', 'null'],
            description:
              'Household id if the advisor named a single specific household, else null. Use the exact id from the provided roster.',
          },
          household_ids: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description:
              'For compose_outreach or multi-household asks: the exact household ids named (from the roster). Null if none named (e.g. "the top 3" refers to the prior audience).',
          },
          confidence: {
            type: 'number',
            description: 'Confidence 0-1 in the task_type classification.',
          },
        },
        required: ['task_type', 'confidence'],
      },
    },
  },
];

export const INTENT_PROMPT = `You are the routing brain for a wealth-management AI coworker that advisors email.
Read the advisor's latest message (prior conversation may be provided for context) and pick exactly one task_type:
- audience_build: they want a list/audience of households to target for a product.
- compose_outreach: they want you to draft outreach emails/messages to specific households or to "the top N" from a list you already produced.
- prep: they want to be prepared for a meeting/call with a specific household.
- evidence: they want to know what we already know about a household.
- summary: they want a recap of the conversation or prior work.
- other: greetings, general questions, or anything not covered above.
Extract product_id, household_id, and household_ids only from the provided rosters. Never invent ids. If the advisor refers to "the top 3", "those households", or "them" without naming ids, set household_ids to null (the caller resolves it from the prior audience). Always call classify_intent.`;

/**
 * Classify an inbound message into a task. Model-backed but tolerant: on any
 * failure it falls back to task_type "other" with low confidence.
 * @param {object} gateway  model gateway
 * @param {object} msg      { subject, body, catalog }
 *   catalog (optional) lets us feed the known product ids into the prompt so the
 *   model returns an exact id rather than a free-text name.
 */
export async function classifyIntent(
  gateway,
  { subject = '', body = '', catalog = [], households = [], priorTurns = [] }
) {
  const productLine = (catalog || []).length
    ? `\n\nKnown catalog products (set product_id to the exact id on the left, not the display name): ${catalog
        .map((p) => `${p.id} (${p.name})`)
        .join(', ')}.`
    : '';
  const householdLine = (households || []).length
    ? `\n\nKnown households in this advisor's book (set household_id / household_ids to the exact id on the left): ${households
        .map((h) => `${h.id} (${h.name || h.primary_contact || ''})`)
        .join(', ')}.`
    : '';
  // A compact transcript of recent turns lets follow-ups ("draft outreach for
  // the top 3", "Sharma") route correctly instead of falling back to "other".
  const contextLine = (priorTurns || []).length
    ? `\n\nRecent conversation (oldest first), for context only:\n${priorTurns
        .map((t) => `[${t.direction || '?'}] ${t.summary || t.text || ''}`)
        .filter((l) => l.trim().length > 4)
        .join('\n')}`
    : '';
  try {
    const { response } = await gateway.chatCompletion({
      task: 'coworker_intent_classification',
      label: 'COWORKER intent',
      maxRetries: 1,
      messages: [
        { role: 'system', content: `${INTENT_PROMPT}${productLine}${householdLine}${contextLine}` },
        { role: 'user', content: `Subject: ${subject}\n\n${body}` },
      ],
      tools: INTENT_TOOL,
      tool_choice: { type: 'function', function: { name: 'classify_intent' } },
    });
    if (!response.ok) return fallbackIntent();
    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return fallbackIntent();
    const args = JSON.parse(call.function.arguments);
    return {
      task_type: COWORKER_TASK_TYPES.includes(args.task_type) ? args.task_type : 'other',
      product_id: args.product_id ?? null,
      household_id: args.household_id ?? null,
      household_ids: Array.isArray(args.household_ids) ? args.household_ids : null,
      confidence: typeof args.confidence === 'number' ? args.confidence : 0.4,
    };
  } catch {
    return fallbackIntent();
  }
}

function fallbackIntent() {
  return {
    task_type: 'other',
    product_id: null,
    household_id: null,
    household_ids: null,
    confidence: 0.2,
  };
}

/**
 * Resolve a free-text household mention to a household record, tolerant to the
 * many ways an advisor names one: exact id, "Nakamura", "Nakamura Household",
 * or the primary contact's name ("Kenji Nakamura"). Ambiguous matches (more
 * than one) return null so the caller asks rather than guesses.
 * @param {object[]} households  provider.getHouseholds(...) records
 * @param {string} mention
 */
export function resolveHousehold(households = [], mention) {
  if (!mention) return null;
  const q = normalizeProductMention(mention); // reuse: lowercase, alnum, single-spaced
  if (!q) return null;
  // 1. Exact id.
  const byId = households.find((h) => h.id === mention || normalizeProductMention(h.id) === q);
  if (byId) return byId;
  // 2. Exact normalized name or primary contact.
  const byName = households.find(
    (h) =>
      normalizeProductMention(h.name) === q || normalizeProductMention(h.primary_contact) === q
  );
  if (byName) return byName;
  // 3. Containment on the family surname / contact; only when unambiguous.
  const contains = households.filter((h) => {
    const name = normalizeProductMention(h.name);
    const contact = normalizeProductMention(h.primary_contact);
    const id = normalizeProductMention(h.id);
    return (
      name.includes(q) ||
      q.includes(name) ||
      contact.includes(q) ||
      q.includes(contact) ||
      id.includes(q)
    );
  });
  return contains.length === 1 ? contains[0] : null;
}

/**
 * Deterministically scan free text for every household the roster knows about,
 * by surname, primary-contact name, or id. Whole-word matching (padded) avoids
 * false positives. This runs independently of the model so an explicit ask like
 * "Draft for Okafor" always targets Okafor, even when the small intent classifier
 * forgets to populate household_ids.
 * @param {string} text
 * @param {object[]} households
 * @returns {string[]} matched household ids (deduped, in roster order)
 */
export function scanHouseholdMentions(text, households = []) {
  const q = ` ${normalizeProductMention(text)} `;
  if (q.trim().length < 3) return [];
  const ids = [];
  for (const h of households) {
    const name = normalizeProductMention(h.name);
    const surname = name.replace(/ household$/, '').trim();
    const contact = normalizeProductMention(h.primary_contact);
    const id = normalizeProductMention(h.id); // e.g. "hh okafor"
    const needles = [surname, contact, id, id.replace(/^hh /, '')].filter(
      (t) => t && t.length >= 3
    );
    if (needles.some((t) => q.includes(` ${t} `)) && !ids.includes(h.id)) {
      ids.push(h.id);
    }
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Evidence retrieval (deterministic)
// ---------------------------------------------------------------------------

/** Strength words for a behavioral signal level, so "MED" never reaches a reader. */
function levelWord(level) {
  switch (String(level || '').toUpperCase()) {
    case 'HIGH':
      return 'strong';
    case 'MED':
    case 'MEDIUM':
      return 'moderate';
    case 'LOW':
      return 'light';
    default:
      return 'observed';
  }
}

/**
 * Gather the evidence we hold on a household: signals plus a compact
 * transaction rollup. Returns plain sentences ready to bullet in a reply, with
 * every internal key already converted to a readable phrase.
 */
export function retrieveEvidence({ provider, householdId }) {
  const household = provider.getHousehold(householdId);
  if (!household) return { found: false, householdId, bullets: [], signals: null };

  const signals = provider.getSignals(householdId) || {};
  const bullets = [];

  for (const ev of signals.life_events || []) {
    bullets.push(`${lifeEventLabel(ev.type)}, ${ev.confidence_band} confidence. ${ev.evidence}`);
  }
  for (const b of signals.behavioral || []) {
    bullets.push(`${b.name}, ${levelWord(b.level)}. ${b.evidence}`);
  }
  for (const r of signals.risk || []) {
    const label = exclusionLabel(r.type);
    bullets.push(
      `${label.charAt(0).toUpperCase()}${label.slice(1)}, which the institution treats as an exclusion for some products. ${r.evidence}`
    );
  }
  const fin = signals.financial || {};
  if (fin.idle_cash_usd != null) {
    bullets.push(
      `Posture is ${fin.posture}, with about $${Number(fin.idle_cash_usd).toLocaleString('en-US')} sitting uninvested and roughly $${Number(fin.monthly_surplus_usd).toLocaleString('en-US')} of monthly surplus.`
    );
  }

  return { found: true, householdId, household, signals, bullets };
}

// ---------------------------------------------------------------------------
// Audience build (deterministic screen) -- the auditable centerpiece
// ---------------------------------------------------------------------------

const IDLE_CASH_TOKEN_THRESHOLD = 25000;

/** Normalize a product string for tolerant matching: lowercase, alnum-only, single-spaced. */
function normalizeProductMention(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Resolve a free-text product mention from the intent model (e.g. "travel card",
 * "High Yield Savings") to a catalog product. The model routinely returns a human
 * product name rather than the exact catalog id, so match tolerantly against the
 * id, the hyphen-normalized id, and the display name. Returns the product or null.
 * Ambiguous mentions (matching >1 product by containment) return null so the
 * caller can ask for clarification rather than guess.
 */
export function resolveProduct(catalog = [], mention) {
  if (!mention) return null;
  const q = normalizeProductMention(mention);
  if (!q) return null;
  // 1. Exact id, or id with hyphens normalized to spaces ("travel-card" ~ "travel card").
  const byId = catalog.find((p) => p.id === mention || normalizeProductMention(p.id) === q);
  if (byId) return byId;
  // 2. Exact normalized display-name match ("Travel Rewards Card").
  const byName = catalog.find((p) => normalizeProductMention(p.name) === q);
  if (byName) return byName;
  // 3. Containment either direction as a last resort; only when unambiguous.
  const contains = catalog.filter((p) => {
    const id = normalizeProductMention(p.id);
    const name = normalizeProductMention(p.name);
    return id.includes(q) || q.includes(id) || name.includes(q) || q.includes(name);
  });
  return contains.length === 1 ? contains[0] : null;
}

/**
 * Reduce a household's signals + financials to a flat token set used for fit
 * matching. Tokens include behavioral names, life-event types, risk types, and
 * a few derived financial tokens.
 */
export function householdTokens(signals = {}) {
  const tokens = new Set();
  for (const b of signals.behavioral || []) tokens.add(b.name);
  for (const ev of signals.life_events || []) tokens.add(ev.type);
  for (const r of signals.risk || []) tokens.add(r.type);
  const fin = signals.financial || {};
  if (Number(fin.idle_cash_usd) >= IDLE_CASH_TOKEN_THRESHOLD) tokens.add('idle_cash');
  if (fin.home_equity_usd != null) tokens.add('home_equity');
  if (fin.student_loan_balance_usd != null) tokens.add('student_loan_balance');
  if (Number(fin.monthly_surplus_usd) <= 0) tokens.add('no_monthly_surplus');
  return tokens;
}

/** Hard gates: any disqualifier present in the household's risk/derived tokens. */
function findDisqualifier(product, tokens, signals) {
  const riskTypes = new Set((signals.risk || []).map((r) => r.type));
  for (const dq of product.disqualifiers || []) {
    if (riskTypes.has(dq) || tokens.has(dq)) return dq;
  }
  return null;
}

/** Count of product target_signals satisfied by the household token set. */
function fitScore(product, tokens) {
  const matched = (product.target_signals || []).filter((s) => tokens.has(s));
  return { score: matched.length, matched };
}

/**
 * Annual benefit for a household/product pair. Delegates to benefit.mjs, which
 * computes card benefit from the household's own ledger and falls back to a
 * clearly-labeled estimate where the value depends on facts we do not hold.
 */
export function annualBenefit({ product, household, signals, provider }) {
  return benefitFor({
    product,
    household,
    signals,
    transactions: provider.getTransactions(household.id),
    catalog: provider.getCatalogDocument?.() || {},
  });
}

/**
 * The signal that leads a household's story for this product. Drives both the
 * digest's signal column and its outreach window.
 *
 * Preference order matters. A signal that actually drove the match comes first,
 * because the column has to explain why the row is there: showing "approaching
 * retirement" next to a travel card invites the obvious question of what one
 * has to do with the other. Only when no matched signal is a life event or a
 * behavioral pattern do we fall back to an unmatched life event, which is at
 * least real context, and to a balance last.
 */
export function leadSignal({ signals, matched = [] }) {
  const events = signals.life_events || [];
  const behavioral = signals.behavioral || [];

  const matchedEvent = events.find((e) => matched.includes(e.type));
  if (matchedEvent) {
    return {
      type: matchedEvent.type,
      label: lifeEventLabel(matchedEvent.type),
      evidence: matchedEvent.evidence,
    };
  }
  const matchedBehavioral = behavioral.find((b) => matched.includes(b.name));
  if (matchedBehavioral) {
    return {
      type: matchedBehavioral.name,
      label: matchedBehavioral.name,
      evidence: matchedBehavioral.evidence,
    };
  }
  if (events[0]) {
    return { type: events[0].type, label: lifeEventLabel(events[0].type), evidence: events[0].evidence };
  }
  if (behavioral[0]) {
    return { type: behavioral[0].name, label: behavioral[0].name, evidence: behavioral[0].evidence };
  }
  const first = matched[0];
  return first ? { type: first, label: signalLabel(first), evidence: null } : null;
}

/**
 * Signals that actually support pitching this product to this household: the
 * matched targeting signals plus any life event on file. Used by the digest to
 * refuse rows that rest on a single data point.
 */
function supportingSignals({ signals, matched = [] }) {
  const out = new Set(matched);
  for (const ev of signals.life_events || []) out.add(ev.type);
  return [...out];
}

/**
 * Build a ranked target audience for a product across an advisor's book.
 *
 * Every household in the book comes back in exactly one bucket: a fit, an
 * exclusion the institution applies, or no signal. An advisor asked to trust a
 * shortlist needs to see the whole denominator reconciled, otherwise the list
 * is an assertion rather than a screen.
 *
 * Deterministic: fit score, then benefit, breaking ties by household id.
 *
 * @returns {{ product, candidates, excluded, no_signal, considered, reconciliation }}
 */
export function buildAudience({ provider, advisorId, productId, minFit = 1 }) {
  const product = resolveProduct(provider.getCatalog() || [], productId);
  if (!product) throw new Error(`Unknown product: ${productId}`);

  const advisor = provider.getAdvisors().find((a) => a.id === advisorId);
  if (!advisor) throw new Error(`Unknown advisor: ${advisorId}`);

  const candidates = [];
  const excluded = [];
  const noSignal = [];

  for (const householdId of advisor.household_ids) {
    const household = provider.getHousehold(householdId);
    if (!household) continue;
    const signals = provider.getSignals(householdId) || {};
    const tokens = householdTokens(signals);

    const dq = findDisqualifier(product, tokens, signals);
    if (dq) {
      excluded.push({
        household_id: householdId,
        household_name: household.name,
        reason: dq,
        reason_label: exclusionLabel(dq),
      });
      continue;
    }

    const { score, matched } = fitScore(product, tokens);
    if (score < minFit) {
      noSignal.push({ household_id: householdId, household_name: household.name });
      continue;
    }

    const benefit = annualBenefit({ product, household, signals, provider });
    const headline = headlineBenefit(benefit);

    // A fee-bearing product whose computed benefit does not clear the fee is not
    // an opportunity, it is a worse deal than what they hold. Say nothing rather
    // than dress up a negative number.
    if (benefit.mode === 'computed' && benefit.baseline === 'known' && benefit.net_usd <= 0) {
      noSignal.push({
        household_id: householdId,
        household_name: household.name,
        reason_label: 'the card does not out-earn what they already hold once the fee is counted',
      });
      continue;
    }

    const support = supportingSignals({ signals, matched });
    const lead = leadSignal({ signals, matched });
    candidates.push({
      household_id: householdId,
      household_name: household.name,
      primary_contact: household.primary_contact || null,
      // Advisor-entered, never inferred. Drives the voice of any draft we write
      // for this household, so an advisor can always answer why it sounds the
      // way it does.
      tone: household.communication_tone || 'warm_personal',
      fit_score: score,
      matched_signals: matched,
      matched_signal_labels: matched.map(signalLabel),
      supporting_signals: support,
      supporting_signal_count: support.length,
      lead_signal: lead,
      outreach_window: outreachWindow(lead?.type),
      benefit,
      annual_benefit_usd: headline ? Math.round(headline.usd) : 0,
      benefit_precision: headline?.precision || 'none',
      benefit_qualifier: headline?.qualifier || null,
      benefit_outcome: headline?.outcome || null,
      benefit_basis: benefit.basis || benefit.assumption || '',
      rationale: matched.length
        ? `Matches ${matched.map(signalLabel).join(', ')}.`
        : 'Fits the product targeting.',
    });
  }

  // Strongest first, and "strongest" means most defensible before it means
  // largest. A stated net is actionable; a gross needs a discovery conversation
  // first, so rows where we can see the household's current card lead, and
  // comparing a gross against a net as if they were the same number would
  // flatter the wrong rows. Only within one class does the dollar figure
  // decide, then fit as the tiebreak. Leading with fit instead would scramble
  // the money column, and an advisor reading top to bottom would rightly ask
  // what the list is ranked by.
  candidates.sort(
    (a, b) =>
      benefitRank(a.benefit_qualifier) - benefitRank(b.benefit_qualifier) ||
      b.annual_benefit_usd - a.annual_benefit_usd ||
      b.fit_score - a.fit_score ||
      (a.household_id < b.household_id ? -1 : 1)
  );

  const considered = advisor.household_ids.length;
  return {
    product: { id: product.id, name: product.name, category: product.category },
    candidates,
    excluded,
    no_signal: noSignal,
    considered,
    reconciliation: {
      considered,
      fits: candidates.length,
      excluded: excluded.length,
      no_signal: noSignal.length,
    },
  };
}

/**
 * Build a proactive digest for an advisor: scan the whole catalog against their
 * book and keep the single best opportunity per household.
 *
 * A digest that lists everything it found is a report, and an advisor stops
 * opening a report. Three rules decide what earns a row:
 *
 *   1. At least two supporting signals. One data point is a coincidence.
 *   2. Not every supporting signal may be a restatement of a balance the
 *      advisor can already see on the account screen.
 *   3. No single product may occupy more than half the rows, so the digest
 *      cannot collapse into a campaign for whatever product happens to have
 *      the most generous arithmetic.
 *
 * Ordering leads with rows whose figure is computed rather than estimated:
 * those are the ones that survive being questioned.
 *
 * @returns {{ advisorId, items, considered, withOpportunity, scannedProducts, dropped }}
 */
export function buildAdvisorDigest({ provider, advisorId, maxItems = 5 }) {
  const catalog = provider.getCatalog() || [];
  const advisor = provider.getAdvisors().find((a) => a.id === advisorId);
  const considered = advisor?.household_ids?.length || 0;
  const bestByHousehold = new Map();

  for (const product of catalog) {
    let audience;
    try {
      audience = buildAudience({ provider, advisorId, productId: product.id });
    } catch {
      continue;
    }
    for (const c of audience.candidates) {
      const item = {
        household_id: c.household_id,
        household_name: c.household_name,
        product: audience.product,
        fit_score: c.fit_score,
        annual_benefit_usd: c.annual_benefit_usd,
        benefit_precision: c.benefit_precision,
        benefit_qualifier: c.benefit_qualifier,
        benefit_basis: c.benefit_basis,
        benefit_mode: c.benefit.mode,
        benefit_outcome: c.benefit_outcome,
        lead_signal: c.lead_signal,
        outreach_window: c.outreach_window,
        supporting_signals: c.supporting_signals,
        supporting_signal_count: c.supporting_signal_count,
        rationale: c.rationale,
      };
      const existing = bestByHousehold.get(c.household_id);
      if (!existing || beatsForDigest(item, existing)) {
        bestByHousehold.set(c.household_id, item);
      }
    }
  }

  const withOpportunity = bestByHousehold.size;
  const dropped = { thin_signal: 0, balance_only: 0, product_concentration: 0 };

  const qualityPassed = [...bestByHousehold.values()].filter((item) => {
    if (item.supporting_signal_count < 2) {
      dropped.thin_signal++;
      return false;
    }
    if (item.supporting_signals.every((s) => isBalanceDerived(s))) {
      dropped.balance_only++;
      return false;
    }
    return true;
  });

  qualityPassed.sort(
    (a, b) =>
      benefitRank(a.benefit_qualifier) - benefitRank(b.benefit_qualifier) ||
      b.annual_benefit_usd - a.annual_benefit_usd ||
      b.fit_score - a.fit_score ||
      (a.household_id < b.household_id ? -1 : 1)
  );

  const perProductCap = Math.max(1, Math.floor(maxItems / 2));
  const perProduct = new Map();
  const items = [];
  for (const item of qualityPassed) {
    if (items.length >= maxItems) break;
    const used = perProduct.get(item.product.id) || 0;
    if (used >= perProductCap) {
      dropped.product_concentration++;
      continue;
    }
    perProduct.set(item.product.id, used + 1);
    items.push(item);
  }

  return {
    advisorId,
    items,
    considered,
    withOpportunity,
    scannedProducts: catalog.length,
    dropped,
  };
}

/**
 * Which of two opportunities for the same household earns the digest row.
 *
 * Not simply the larger number. A computed figure that survives being
 * questioned beats a larger one resting on an assumed market return, because
 * the moment an advisor cannot defend a figure in front of a client the whole
 * digest loses its credibility. Size only decides within the same tier.
 */
function beatsForDigest(candidate, incumbent) {
  const delta = benefitRank(candidate.benefit_qualifier) - benefitRank(incumbent.benefit_qualifier);
  if (delta !== 0) return delta < 0;
  return candidate.annual_benefit_usd > incumbent.annual_benefit_usd;
}

/**
 * Subject line for the scheduled digest. States the numerator and the
 * denominator, because "5 opportunities" out of an unstated book size is a
 * number an advisor cannot calibrate against.
 */
export function digestSubject({ items = [], considered = 0 }) {
  if (!items.length) return 'Daily digest: nothing new worth your time today';
  return `Daily digest: ${items.length} of ${pluralize(considered, 'household')} worth a look`;
}

// ---------------------------------------------------------------------------
// Model-backed narration
// ---------------------------------------------------------------------------

/**
 * Generate meeting-prep prose for a household. Model-backed; on failure returns
 * a deterministic fallback built from evidence so a reply always goes out.
 */
export async function generatePrep({ gateway, provider, householdId }) {
  const evidence = retrieveEvidence({ provider, householdId });
  if (!evidence.found) {
    return { text: `I couldn't find a household matching "${householdId}" in your book.`, evidence };
  }
  const context = {
    household: evidence.household,
    signals: evidence.signals,
  };
  try {
    const { response } = await gateway.chatCompletion({
      task: 'coworker_prep',
      label: 'COWORKER prep',
      maxRetries: 1,
      messages: [
        {
          role: 'system',
          content:
            'You are a wealth-management coworker prepping an advisor for a client meeting. Be concise and peer-toned. Ground every claim in the provided modeled signals. End with one concrete talking point. Do not invent figures.',
        },
        { role: 'user', content: JSON.stringify(context) },
      ],
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return { text, evidence };
    }
  } catch {
    /* fall through to deterministic fallback */
  }
  return {
    text: `Here's what we know going in:\n- ${evidence.bullets.join('\n- ')}`,
    evidence,
  };
}

// ---------------------------------------------------------------------------
// Outreach drafting
// ---------------------------------------------------------------------------

/**
 * Voice instructions per advisor-entered tone. The tone comes from the
 * household record, not from an inference about the client, so an advisor asked
 * why a draft sounds a certain way has a concrete answer.
 */
const TONE_GUIDANCE = {
  warm_personal:
    'Use their first name. One warm opening line, then the substance. Conversational; contractions are fine.',
  direct_professional:
    'No preamble. The first sentence states why you are writing. Short sentences, no pleasantries beyond the greeting.',
  formal_reserved:
    'Address them by full name. Measured phrasing, complete sentences, no contractions, no exclamation points.',
  analytical:
    'Lead with the mechanism in plain terms. Minimal relationship language. Explain what changes and why.',
};

/**
 * Subject lines, deterministic per tone and product category, all under 40
 * characters so they survive a phone lock screen. Generated rather than
 * model-written because subject length and consistency are exactly the things
 * a model will not hold, and a subject is the only part of a draft an advisor
 * is likely to send unedited.
 */
const TONE_SUBJECTS = {
  warm_personal: {
    Cards: 'A thought on how you travel',
    Deposits: 'An idea for your savings',
    Wealth: 'Something worth a conversation',
    Lending: 'An option on your loan',
    Insurance: 'A quick coverage question',
  },
  direct_professional: {
    Cards: 'Your card spend, one change',
    Deposits: 'Your cash is under-earning',
    Wealth: 'Your cash balance, next step',
    Lending: 'A lower rate is available',
    Insurance: 'Coverage gap to close',
  },
  formal_reserved: {
    Cards: 'Regarding your card arrangement',
    Deposits: 'Regarding your deposit accounts',
    Wealth: 'Regarding your portfolio',
    Lending: 'Regarding your loan terms',
    Insurance: 'Regarding your coverage',
  },
  analytical: {
    Cards: 'The math on your card spend',
    Deposits: 'The yield on your cash',
    Wealth: 'What your idle cash costs',
    Lending: 'Your rate versus the market',
    Insurance: 'Sizing your coverage need',
  },
};

/** Subject line for a household's tone and the product category. */
export function outreachSubject({ tone, category }) {
  const byTone = TONE_SUBJECTS[tone] || TONE_SUBJECTS.warm_personal;
  return byTone[category] || 'Something worth a conversation';
}

/**
 * Terms that must never reach a client. Modeled signal names, internal keys,
 * and any dollar figure: the client half of a draft is not the place to
 * disclose that we inferred a life event from their spending, and an advisor
 * must not send a financial figure that nobody approved.
 */
function forbiddenClientTerms(candidate) {
  const terms = new Set(['modeled', 'signal', 'audience', 'fit score', 'idle cash', 'wallet share']);
  for (const s of candidate.supporting_signals || []) terms.add(String(s).toLowerCase());
  for (const s of candidate.matched_signals || []) terms.add(String(s).toLowerCase());
  return [...terms];
}

/**
 * Check a client-facing draft for anything that must not go to a client.
 * Returns the violations so the caller can fall back rather than send.
 *
 * @returns {string[]} empty when the draft is clean
 */
export function validateClientDraft(text, candidate = {}) {
  const body = String(text || '');
  const lower = body.toLowerCase();
  const violations = [];

  // No dollar figures in the client half, full stop. Whether the number is
  // computed or estimated, it has not been approved for client disclosure.
  if (/\$\s?\d/.test(body)) violations.push('dollar_figure');
  if (/\b\d+(\.\d+)?\s?%/.test(body)) violations.push('percentage');

  for (const term of forbiddenClientTerms(candidate)) {
    if (term.length > 3 && lower.includes(term)) violations.push(`internal_term:${term}`);
  }
  if (/[a-z0-9]+_[a-z0-9]+/.test(body)) violations.push('internal_key');
  return violations;
}

/**
 * The advisor's own briefing for a draft. Fully deterministic: it inherits the
 * exact basis string the benefit calculator produced rather than asking a model
 * to restate a number, because a restated figure is a figure that can drift.
 */
function advisorRationale(candidate) {
  const parts = [];
  if (candidate.lead_signal?.evidence) {
    parts.push(candidate.lead_signal.evidence);
  } else if (candidate.lead_signal?.label) {
    parts.push(`${candidate.lead_signal.label}.`);
  }
  if (candidate.benefit_basis) parts.push(candidate.benefit_basis);
  if (candidate.outreach_window?.basis) parts.push(candidate.outreach_window.basis);
  return parts.join(' ');
}

/** Deterministic client body, used as the fallback and when validation fails. */
function fallbackClientBody({ candidate, product }) {
  const name = clientFirstName(candidate);
  const outcome = candidate.benefit_qualifier === 'outcome';
  const opening =
    candidate.tone === 'formal_reserved'
      ? `Dear ${candidate.primary_contact || name},`
      : `Hi ${name},`;
  const middle = outcome
    ? `I was going through your accounts this week and there is a conversation worth having about ${product.name.toLowerCase()}.`
    : `I was going through your accounts this week, and based on how you have actually been spending, ${product.name} looks like it would work better for you than what you have now.`;
  return `${opening}

${middle} I have run the numbers and would rather walk you through them than put them in an email.

Do you have twenty minutes this week or next?`;
}

function clientFirstName(candidate) {
  const contact = String(candidate.primary_contact || '').trim();
  if (contact) return contact.split(/\s+/)[0];
  return String(candidate.household_name || '').replace(/\s+household$/i, '').trim() || 'there';
}

/**
 * Draft outreach for already-screened households, as two separate halves.
 *
 * The client half is model-written for voice, but it is constrained hard: the
 * model never sees a dollar figure or a signal name, and anything it returns is
 * validated before use. The advisor half is not model-written at all, so the
 * arithmetic in the briefing is the same arithmetic the calculator produced.
 *
 * The advisor is the subject of every sentence that involves noticing
 * something. "I was going through your accounts" is a thing an advisor did.
 * "Our analysis identified you" is a thing that happened to a client, and it is
 * the sentence that makes a client feel surveilled.
 *
 * @returns {Promise<{drafts: {household_id, household_name, subject, client_body, rationale, tone, window, validation}[]}>}
 */
export async function generateOutreach({ gateway, product, candidates = [] }) {
  const selected = candidates.slice(0, 3);
  if (!selected.length) return { drafts: [] };

  // Deliberately narrow: no figures, no signal names, nothing inferred. The
  // model gets the relationship facts it needs to write in the right voice and
  // nothing it could leak.
  const context = {
    product: { name: product.name, category: product.category, what_it_does: product.tagline },
    households: selected.map((c) => ({
      household_id: c.household_id,
      client_first_name: clientFirstName(c),
      client_full_name: c.primary_contact || c.household_name,
      tone: c.tone,
      tone_guidance: TONE_GUIDANCE[c.tone] || TONE_GUIDANCE.warm_personal,
      reason_to_reach_out: c.benefit_qualifier === 'outcome' ? 'a planning conversation' : 'their recent spending pattern',
    })),
  };

  const byId = new Map(selected.map((c) => [c.household_id, c]));
  let modelDrafts = new Map();

  try {
    const { response } = await gateway.chatCompletion({
      task: 'coworker_outreach',
      label: 'COWORKER outreach',
      maxRetries: 1,
      messages: [
        {
          role: 'system',
          content:
            'You write the client-facing half of an outreach email that a wealth advisor will review and send under their own name. ' +
            'Write in the advisor\'s first person: the advisor is the one who reviewed the accounts and noticed something. ' +
            'Never write as a system, a model, or an analysis. Never say the client was identified, flagged, selected, or matched. ' +
            'Follow each household\'s tone_guidance exactly. Three to five sentences. End with a request for a short conversation. ' +
            'Hard rules you must not break: include no dollar amounts, no percentages, and no numbers of any kind. ' +
            'Do not describe how the advisor knows what they know beyond having looked at the account. ' +
            'Do not mention data, signals, patterns being detected, or any internal terminology. ' +
            'Return a JSON object: {"drafts":[{"household_id":"...","body":"..."}]} and nothing else.',
        },
        { role: 'user', content: JSON.stringify(context) },
      ],
      response_format: { type: 'json_object' },
    });
    if (response.ok) {
      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content?.trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const d of parsed.drafts || []) {
          if (d && d.body && byId.has(d.household_id)) {
            modelDrafts.set(d.household_id, String(d.body).trim());
          }
        }
      }
    }
  } catch {
    /* fall through: every household still gets a deterministic draft */
  }

  const drafts = selected.map((c) => {
    const proposed = modelDrafts.get(c.household_id);
    const violations = proposed ? validateClientDraft(proposed, c) : ['no_model_output'];
    const clientBody = violations.length ? fallbackClientBody({ candidate: c, product }) : proposed;
    return {
      household_id: c.household_id,
      household_name: c.household_name,
      subject: outreachSubject({ tone: c.tone, category: product.category }),
      client_body: clientBody,
      rationale: advisorRationale(c),
      tone: c.tone,
      window: c.outreach_window?.label || null,
      validation: { violations, used_fallback: violations.length > 0 },
    };
  });

  return { drafts };
}

/**
 * Summarize a household's observed spend into top pillars and merchants over
 * the ledger window. Deterministic; used to ground free-form answers like
 * "what does this household like to spend on?".
 *
 * Money moved rather than consumed is excluded. A household running $4,000 a
 * month into savings would otherwise show up as spending most of its money on
 * "Financial & Aspirational", which is both true and useless.
 */
export function summarizeSpend(transactions = [], { exclude = NON_CONSUMPTION_SUBCATEGORIES } = {}) {
  const excluded = new Set(exclude);
  const debits = transactions.filter(
    (t) => t.direction === 'debit' && !excluded.has(t.subcategory)
  );
  const byPillar = {};
  const byMerchant = {};
  for (const t of debits) {
    const amt = Number(t.amount) || 0;
    const pillar = t.pillar || 'Other';
    const merchant = t.normalized_merchant || t.merchant_name || 'Unknown';
    byPillar[pillar] = (byPillar[pillar] || 0) + amt;
    byMerchant[merchant] = (byMerchant[merchant] || 0) + amt;
  }
  const top = (obj, n) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, amount]) => ({ name, observed_usd: Math.round(amount) }));
  return { top_pillars: top(byPillar, 4), top_merchants: top(byMerchant, 5) };
}

export const QA_SYSTEM =
  'You are Ventus Coworker, an AI teammate for a wealth advisor, replying by email in a warm, concise, peer tone. ' +
  "Answer the advisor's question using ONLY the JSON context provided (household signals, observed spend, catalog, book, and recent conversation). " +
  'Rules you must follow: ' +
  '(1) Never invent facts, dollar figures, rates, names, or attributes that are not in the context. ' +
  '(2) Life events and behavioral patterns are inferred from spending, not verified facts. Say "looks like" or "appears to be" when you cite one. ' +
  '(3) Observed spend figures are real transaction sums over the window named in the context. You may cite them, and you should name the window when you do. ' +
  '(4) If the answer is not in the context, such as account numbers or live market data, say plainly that you do not have it, then offer what you can do: screen the book for a product, prep a household, pull what we hold on one, draft outreach, or recap the thread. ' +
  '(5) Never describe your own internal workings. Do not mention tools, tasks, classifiers, confidence scores, fixtures, or what you did or did not manage to run. ' +
  '(6) Never refer to content as if you had already sent it when you have not. ' +
  '(7) Keep it to a few sentences and end with exactly one next step. Do not offer two. Do not use headers or markdown. ' +
  '(8) Do not use em dashes.';

/**
 * Answer a free-form advisor question, grounded strictly on assembled context.
 * Returns { text } (empty string when the model is unavailable so the caller can
 * fall back to a capability menu). No governance figures are fabricated because
 * the model is constrained to the provided context.
 */
export async function answerQuestion({ gateway, question, context }) {
  try {
    const { response } = await gateway.chatCompletion({
      task: 'coworker_qa',
      label: 'COWORKER qa',
      maxRetries: 1,
      messages: [
        { role: 'system', content: QA_SYSTEM },
        {
          role: 'user',
          content: `Question: ${question}\n\nContext (JSON, the only facts you may use):\n${JSON.stringify(context)}`,
        },
      ],
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return { text };
    }
  } catch {
    /* fall through to empty -> caller uses capability menu */
  }
  return { text: '' };
}

/** Summarize a thread from its stored turns. Model-backed with a safe fallback. */
export async function summarizeThread({ gateway, turns = [] }) {
  const transcript = turns
    .map((t) => `[${t.direction || '?'}] ${t.summary || t.text || ''}`)
    .join('\n');
  try {
    const { response } = await gateway.chatCompletion({
      task: 'coworker_summary',
      label: 'COWORKER summary',
      maxRetries: 1,
      messages: [
        {
          role: 'system',
          content:
            'Summarize this advisor/coworker email thread in 3-5 crisp bullets: what was asked, what was delivered, and the open next step.',
        },
        { role: 'user', content: transcript || '(no prior turns)' },
      ],
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch {
    /* fall through */
  }
  return `This thread has ${turns.length} turn(s). (Summary model unavailable.)`;
}
