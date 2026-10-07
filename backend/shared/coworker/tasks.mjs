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
  householdShortName,
  isBalanceDerived,
  lifeEventLabel,
  outreachWindow,
  pluralize,
  signalLabel,
} from './labels.mjs';
import { ageContext, daysBetween, signalsByToken } from './context.mjs';
import {
  MIN_DAYS_BETWEEN_SAME_PRODUCT,
  MIN_DAYS_BETWEEN_TOUCHES,
  contactCadence,
  outreachTiming,
  priorityScore,
} from './timing.mjs';

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
  const direct = resolveHouseholdExact(households, mention, q);
  if (direct) return direct;
  // "the Lindqvists", "Lindqvist's", "the Alvarezes": an advisor names a family
  // in the plural or the possessive as often as not, and normalisation has
  // already dropped the apostrophe. Try again with the ending taken off.
  for (const singular of singularForms(q)) {
    const hit = resolveHouseholdExact(households, singular, singular);
    if (hit) return hit;
  }
  return null;
}

function singularForms(q) {
  const forms = [];
  if (q.endsWith('es')) forms.push(q.slice(0, -2));
  if (q.endsWith('s')) forms.push(q.slice(0, -1));
  return forms.filter((f) => f.length >= 3);
}

function resolveHouseholdExact(households, mention, q) {
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
    // Plural and possessive forms of the surname count as mentions too: "the
    // Lindqvists" and "Lindqvist's" (apostrophe already stripped) both name
    // the family.
    const needles = [surname, `${surname}s`, `${surname}es`, contact, id, id.replace(/^hh /, '')].filter(
      (t) => t && t.length >= 3
    );
    if (needles.some((t) => q.includes(` ${t} `)) && !ids.includes(h.id)) {
      ids.push(h.id);
    }
  }
  return ids;
}

// Capitalized words that follow a targeting preposition without being anyone's
// surname. Articles and connectives are here because a subject line in caps
// ("DRAFT OUTREACH FOR THE TRAVEL CARD") defeats the capitalization test.
const NOT_A_SURNAME = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'them', 'these', 'those', 'your',
  'our', 'their', 'from', 'into', 'about', 'both', 'all', 'everyone', 'everybody',
  'draft', 'drafts', 'prep', 'screen', 'send', 'write', 'also', 'please', 'want',
  'next', 'top', 'best', 'household', 'households', 'family', 'families',
  'client', 'clients', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
  'saturday', 'sunday', 'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]);

// "for Pemberton", "to the Pembertons", "for the Pemberton family". Two words at
// most: a third is nearly always the start of the rest of the sentence.
//
// The prepositions are spelled out per character rather than carrying the `i`
// flag, because the flag would apply to the capture too. The capture has to stay
// case-sensitive: an initial capital is the only thing separating a surname from
// an ordinary noun, and without it "about the renovation" reads as a household.
// Spelling out the prepositions is what lets a shouted subject line still match.
const TARGET_PHRASE =
  /\b(?:[Ff][Oo][Rr]|[Tt][Oo]|[Aa][Bb][Oo][Uu][Tt])\s+(?:[Tt][Hh][Ee]\s+)?([A-Z][A-Za-z'\u2019-]{2,}(?:\s+[A-Z][A-Za-z'\u2019-]{2,})?)/g;

/**
 * Scan free text for households the advisor named that the roster does not have.
 *
 * `scanHouseholdMentions` answers "who did they name that we hold".  This answers
 * the more dangerous question: did they name somebody we do not hold.  The intent
 * classifier cannot be trusted with it, because the case that matters is exactly
 * the case where it stays silent: a surname it has never seen comes back as an
 * empty `household_ids`, which is indistinguishable downstream from "they named
 * nobody" and lets an outreach draft fall through to whoever happens to fit.
 *
 * Only proper-noun shapes after a targeting preposition count, and catalog words
 * are discounted, so "draft for High-Yield Savings" and "draft for the top 3" are
 * not read as people.
 *
 * @param {string} text
 * @param {{households?: object[], catalog?: object[]}} context
 * @returns {string[]} names, as the advisor wrote them, that resolve to nobody
 */
export function scanNamedTargets(text, { households = [], catalog = [] } = {}) {
  const productWords = new Set();
  for (const p of catalog) {
    const words = `${normalizeProductMention(p?.name)} ${normalizeProductMention(p?.id)}`;
    for (const w of words.split(' ')) if (w.length >= 3) productWords.add(w);
  }

  const found = [];
  for (const match of String(text || '').matchAll(TARGET_PHRASE)) {
    const label = match[1].replace(/\s+(?:Household|Family)$/i, '').trim();
    const norm = normalizeProductMention(label);
    if (norm.length < 3) continue;
    // Nothing in it could be a surname, so it is a product or a turn of phrase.
    if (norm.split(' ').every((w) => NOT_A_SURNAME.has(w) || productWords.has(w))) continue;
    if (resolveHousehold(households, label)) continue;
    if (found.some((f) => f.toLowerCase() === label.toLowerCase())) continue;
    found.push(label);
  }
  return found;
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

/** Whole dollars, sign carried by the wording rather than by the glyph. */
function money(n) {
  return `$${Math.round(Math.abs(Number(n))).toLocaleString('en-US')}`;
}

// An amount or a rate, together with the words that introduce it. Both halves
// matter: dropping "$8,000" out of "two payments above $8,000 to design firms"
// leaves a dangling "above", and the point of redacting is to hand the model a
// sentence it can still read. Stacked lead-ins are real ("totaling about
// $18,400"), so the group repeats.
const LEAD_IN =
  '(?:\\s*\\b(?:totaling|totalling|ranging|about|roughly|approximately|around|near|nearly|over|under|above|below|up\\s+to|at|of)\\b)*';
const AMOUNT = '\\$\\s?\\d[\\d,]*(?:\\.\\d+)?\\s?(?:k|m|bn?)?\\+?';
const PER_PERIOD = '(?:\\s?\\/\\s?(?:mo|month|yr|year))?';

const FIGURE_WITH_LEAD_IN = new RegExp(
  `${LEAD_IN}\\s*${AMOUNT}(?:\\s?[-\u2013]\\s?${AMOUNT})?${PER_PERIOD}`,
  'gi'
);

// No trailing \b after the percent sign: it is not a word character, so the
// boundary never matched and every rate survived the redaction.
const RATE_WITH_LEAD_IN = new RegExp(
  `${LEAD_IN}\\s*\\d[\\d,]*(?:\\.\\d+)?\\s?(?:%|percent\\b|bps\\b|basis\\s+points\\b)`,
  'gi'
);

/**
 * The same sentence with the money and the rates taken out.
 *
 * Evidence sentences are the raw material a model needs to write an
 * evidence-first reply: the merchants, the categories, the counts, the window.
 * The amounts in them are not, and showing them is what put figures into prose
 * that then could not be sent. The advisor still sees the full sentence, in the
 * attached panel; the model reasons from the redacted one and cannot quote a
 * figure it was never given.
 */
export function redactFigures(text) {
  const stripped = String(text || '')
    // A space, not nothing: the lead-in words carry the space before them, and
    // removing both closed "two payments above $8,000 to" into "paymentsto".
    .replace(FIGURE_WITH_LEAD_IN, ' ')
    .replace(RATE_WITH_LEAD_IN, ' ')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/([,;:])\s*(?=[.,;:])/g, '')
    .trim();
  // A figure can open a sentence ("$28k+ across Home Depot, ..."), and removing
  // it leaves the next word lowercase mid-bullet.
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
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
    bullets.push(`${signalLabel(b.name)}, ${levelWord(b.level)}. ${b.evidence}`);
  }
  for (const r of signals.risk || []) {
    const label = exclusionLabel(r.type);
    bullets.push(
      `${label.charAt(0).toUpperCase()}${label.slice(1)}, which the institution treats as an exclusion for some products. ${r.evidence}`
    );
  }
  // What the model is shown. Same sentences, no amounts. The advisor reads the
  // full bullets in the attached panel; the model reasons from these and so
  // cannot quote a figure, which is the only way the no-figures rule is a rule
  // the model can actually follow rather than a trap it keeps falling into.
  const modelBullets = bullets.map(redactFigures);

  const fin = signals.financial || {};
  if (fin.idle_cash_usd != null) {
    const idle = Number(fin.idle_cash_usd);
    const surplus = Number(fin.monthly_surplus_usd);
    const clauses = [];
    // Zero idle cash is not a fact worth a clause. "About $0 sitting
    // uninvested" reads as a measurement when it is the absence of one, and on
    // a juggler household it is the least interesting thing we hold.
    if (Number.isFinite(idle) && idle > 0) clauses.push(`about ${money(idle)} sitting uninvested`);
    if (Number.isFinite(surplus) && surplus > 0) {
      clauses.push(`roughly ${money(surplus)} of monthly surplus`);
    } else if (Number.isFinite(surplus) && surplus < 0) {
      // A negative surplus is a shortfall, and it is the signal an advisor most
      // needs to catch. Formatted as a surplus it came out "$-150 of monthly
      // surplus", which scans as a typo rather than as money going out.
      clauses.push(`roughly ${money(-surplus)} a month more going out than coming in`);
    }
    bullets.push(
      clauses.length
        ? `Posture is ${fin.posture}, with ${clauses.join(' and ')}.`
        : `Posture is ${fin.posture}.`
    );

    // Written qualitatively rather than redacted. This line is nothing but
    // amounts, and stripping them leaves "with about sitting uninvested".
    const qualitative = [];
    if (Number.isFinite(idle) && idle > 0) qualitative.push('cash sitting uninvested');
    if (Number.isFinite(surplus) && surplus > 0) qualitative.push('a monthly surplus');
    else if (Number.isFinite(surplus) && surplus < 0) qualitative.push('more going out than coming in');
    modelBullets.push(
      qualitative.length
        ? `Posture is ${fin.posture}, with ${qualitative.join(' and ')}.`
        : `Posture is ${fin.posture}.`
    );
  }

  return { found: true, householdId, household, signals, bullets, modelBullets };
}

/**
 * What is active across a whole book, one row per household, no amounts.
 *
 * Exists because "which household has the most going on" had no tool behind it.
 * The agent answered it by calling the single-household lookup five times, which
 * burned its entire step budget, took twenty seconds, and then named a winner
 * on the strength of five households out of twelve. A superlative needs the
 * denominator in one call, or it is a guess with evidence attached.
 *
 * Ordered here rather than left to the model: life events count double, because
 * something happening to a household outranks a pattern in how they spend.
 */
export function summarizeBookActivity({ provider, households = [] }) {
  const rows = households
    .map((hh) => {
      const signals = provider.getSignals(hh.id) || {};
      const lifeEvents = (signals.life_events || []).map((ev) => lifeEventLabel(ev.type));
      const patterns = (signals.behavioral || []).map((b) => b.name);
      const flags = (signals.risk || []).map((r) => exclusionLabel(r.type));
      return {
        household: hh.name,
        life_events: lifeEvents,
        patterns,
        held_back_by: flags,
        activity_score: lifeEvents.length * 2 + patterns.length,
      };
    })
    .sort((a, b) => b.activity_score - a.activity_score || a.household.localeCompare(b.household));

  return {
    considered: households.length,
    ordered_by: 'life events first, then behavioral patterns',
    households: rows,
  };
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
  if (contains.length === 1) return contains[0];
  // 4. A family of variants: "travel" matches the travel card and its premium
  // tiers. When every other match contains the shortest one, the shortest is
  // the base product and that is what an unqualified mention means. A mention
  // that spans unrelated products ("insurance") still comes back null.
  if (contains.length > 1) {
    const base = contains.reduce((a, b) =>
      normalizeProductMention(b.id).length < normalizeProductMention(a.id).length ? b : a,
    );
    const baseId = normalizeProductMention(base.id);
    if (contains.every((p) => normalizeProductMention(p.id).includes(baseId))) return base;
  }
  return null;
}

/**
 * Tokens derived from the financial block rather than detected by the pipeline.
 * They can match a product, but they cannot headline an email the way an event
 * or a spending pattern can: there is no evidence behind them and no date.
 */
const FINANCIAL_TOKENS = new Set(['idle_cash', 'home_equity', 'student_loan_balance', 'no_monthly_surplus']);

/**
 * Reduce a household's signals + financials to a flat token set used for fit
 * matching. Tokens include behavioral names, life-event types, risk types, and
 * a few derived financial tokens.
 */
export function householdTokens(signals = {}, household = null) {
  const tokens = new Set();
  for (const b of signals.behavioral || []) tokens.add(b.name);
  for (const ev of signals.life_events || []) tokens.add(ev.type);
  for (const r of signals.risk || []) tokens.add(r.type);
  const fin = signals.financial || {};
  if (Number(fin.idle_cash_usd) >= IDLE_CASH_TOKEN_THRESHOLD) tokens.add('idle_cash');
  if (fin.home_equity_usd != null) tokens.add('home_equity');
  if (fin.student_loan_balance_usd != null) tokens.add('student_loan_balance');
  if (Number(fin.monthly_surplus_usd) <= 0) tokens.add('no_monthly_surplus');
  else if (fin.monthly_surplus_usd != null) tokens.add('monthly_surplus');

  // Qualifiers the bank already knows from the relationship record. These are
  // facts on file rather than detections, so they are derived here instead of
  // being authored as signals. None of them can create a match on its own.
  const rel = household?.relationship || {};
  const held = rel.products_held || [];
  if (fin.home_equity_usd != null || held.includes('mortgage')) tokens.add('owns_home');
  if (Number(rel.aum_usd) >= HIGH_NET_WORTH_AUM_USD) tokens.add('high_net_worth');
  if (held.length >= 3) tokens.add('multi_product_household');
  return tokens;
}

const HIGH_NET_WORTH_AUM_USD = 1_000_000;

/**
 * Hard gates: any disqualifier present in the household's risk/derived tokens,
 * plus the one every product carries implicitly — we do not pitch a household
 * something it already holds with us.
 */
function findDisqualifier(product, tokens, signals, household = null) {
  const held = household?.relationship?.products_held || [];
  if (held.includes(product.id) && (product.disqualifiers || []).includes('already_holds_product')) {
    return 'already_holds_product';
  }
  const riskTypes = new Set((signals.risk || []).map((r) => r.type));
  for (const dq of product.disqualifiers || []) {
    if (riskTypes.has(dq) || tokens.has(dq)) return dq;
  }
  return null;
}

/**
 * Fit of a product to a household's token set.
 *
 * `target_signals` are the reasons a product is relevant now. `qualifying_signals`
 * say the household is a good fit once something else has made it relevant —
 * paying a card in full, holding equity, carrying a loan balance. A qualifier
 * raises the score but can never create the match, because scoring the two the
 * same way is what let "pays card in full" alone pitch a travel card to someone
 * who never travels.
 */
function fitScore(product, tokens) {
  const matched = (product.target_signals || []).filter((s) => tokens.has(s));
  if (!matched.length) return { score: 0, matched: [], qualifying: [] };
  const qualifying = (product.qualifying_signals || []).filter((s) => tokens.has(s));
  return { score: matched.length + qualifying.length, matched, qualifying };
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
      kind: 'life_event',
      label: lifeEventLabel(matchedEvent.type),
      evidence: matchedEvent.evidence,
    };
  }
  const matchedBehavioral = behavioral.find((b) => matched.includes(b.name));
  if (matchedBehavioral) {
    return {
      type: matchedBehavioral.name,
      kind: 'behavioral',
      label: signalLabel(matchedBehavioral.name),
      evidence: matchedBehavioral.evidence,
    };
  }

  // A matched financial token has to outrank the fallbacks below. It is a worse
  // headline than an event or a pattern — it carries no evidence and no date —
  // but it is the reason the row exists. Ranking it last is what put "home
  // renovation" at the top of a savings pitch that matched on idle cash alone.
  const matchedFinancial = matched.find((m) => FINANCIAL_TOKENS.has(m));
  if (matchedFinancial) {
    return { type: matchedFinancial, kind: 'financial', label: signalLabel(matchedFinancial), evidence: null };
  }

  if (events[0]) {
    return {
      type: events[0].type,
      kind: 'life_event',
      label: lifeEventLabel(events[0].type),
      evidence: events[0].evidence,
    };
  }
  if (behavioral[0]) {
    return {
      type: behavioral[0].name,
      kind: 'behavioral',
      label: signalLabel(behavioral[0].name),
      evidence: behavioral[0].evidence,
    };
  }
  const first = matched[0];
  // A bare targeting token like idle_cash or home_equity: a standing financial
  // attribute, which is neither something that happened to the household nor a
  // pattern in how they spend.
  return first ? { type: first, kind: 'financial', label: signalLabel(first), evidence: null } : null;
}

/**
 * Every signal that could headline this row, in the order leadSignal prefers
 * them: matched life events, then matched behavioral patterns. Each one drove
 * the match and carries evidence, so any of them is an honest answer to "why
 * is this row here". The digest uses the list to avoid headlining three rows
 * with the same phrase when the households behind them had other reasons.
 */
export function leadSignalOptions({ signals, matched = [] }) {
  const options = [];
  for (const e of signals.life_events || []) {
    if (matched.includes(e.type)) {
      options.push({ type: e.type, kind: 'life_event', label: lifeEventLabel(e.type), evidence: e.evidence });
    }
  }
  for (const b of signals.behavioral || []) {
    if (matched.includes(b.name)) {
      options.push({ type: b.name, kind: 'behavioral', label: signalLabel(b.name), evidence: b.evidence });
    }
  }
  return options;
}

/**
 * Signals that actually support pitching this product to this household: the
 * matched targeting signals, the qualifiers they clear, plus any life event on
 * file. Used by the digest to refuse rows that rest on a single data point — a
 * qualifier belongs here even though it cannot create a match, because it is
 * genuine corroboration once something else has.
 */
function supportingSignals({ signals, matched = [], qualifying = [] }) {
  const out = new Set([...matched, ...qualifying]);
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
 * @param {object} args
 * @param {object} args.provider
 * @param {string} args.advisorId
 * @param {string} args.productId
 * @param {number} [args.minFit=1]
 * @param {Map<string,object>|null} [args.context]  household id -> context snapshot.
 *   Optional on purpose. Without it every candidate gets undated timing at full
 *   weight, which is exactly the pre-context behavior, so the first digest after
 *   deploy is unchanged and the second one — once a refresh has run — starts
 *   accounting for age.
 * @param {Date} [args.now]
 * @returns {{ product, candidates, excluded, no_signal, expired, considered, reconciliation }}
 */
export function buildAudience({ provider, advisorId, productId, minFit = 1, context = null, now = new Date() }) {
  const product = resolveProduct(provider.getCatalog() || [], productId);
  if (!product) throw new Error(`Unknown product: ${productId}`);

  const advisor = provider.getAdvisors().find((a) => a.id === advisorId);
  if (!advisor) throw new Error(`Unknown advisor: ${advisorId}`);

  const candidates = [];
  const excluded = [];
  const noSignal = [];
  const expired = [];

  for (const householdId of advisor.household_ids) {
    const household = provider.getHousehold(householdId);
    if (!household) continue;
    const signals = provider.getSignals(householdId) || {};
    const tokens = householdTokens(signals, household);

    const dq = findDisqualifier(product, tokens, signals, household);
    if (dq) {
      excluded.push({
        household_id: householdId,
        household_name: household.name,
        reason: dq,
        reason_label: exclusionLabel(dq),
      });
      continue;
    }

    const { score, matched, qualifying } = fitScore(product, tokens);
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

    const support = supportingSignals({ signals, matched, qualifying });
    const lead = leadSignal({ signals, matched });

    // Age the snapshot against read time rather than trusting the age it was
    // written with: the refresh runs at 11:00 and a send can happen any time
    // after, so a stored age_days is only ever correct at the moment of writing.
    const snapshot = context?.get(householdId) ? ageContext(context.get(householdId), now) : null;
    const byToken = snapshot ? signalsByToken(snapshot) : null;
    const tracked = byToken ? byToken.get(lead?.type) || null : null;
    const timing = outreachTiming({ leadSignal: lead, signal: tracked, now });

    // The other signals this row could headline with, each aged on its own
    // clock. One that has expired is not offered: swapping it in later would
    // put a closed window on a live row.
    const leadOptions = leadSignalOptions({ signals, matched })
      .map((option) => ({
        lead: option,
        timing: outreachTiming({ leadSignal: option, signal: byToken ? byToken.get(option.type) || null : null, now }),
      }))
      .filter((o) => o.timing.status !== 'expired');

    // A closed window is not a weak opportunity, it is a past one. Ranking it
    // low would still eventually float it back to the top on a quiet day, so it
    // has to leave the candidate set entirely — while still being reported, so
    // the reconciliation continues to account for every household in the book.
    if (timing.status === 'expired') {
      expired.push({
        household_id: householdId,
        household_name: household.name,
        lead_signal: lead,
        age_days: timing.age_days,
        window_days: timing.window.days,
        reason_label: timing.basis,
      });
      continue;
    }

    const headlineUsd = headline ? Math.round(headline.usd) : 0;
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
      lead_options: leadOptions,
      outreach_window: timing.window,
      timing,
      // Rank key only. Never render this as a dollar figure — it is the benefit
      // scaled by how live the signal still is, and presenting a discounted
      // number as money would misstate what the household stands to gain.
      priority: priorityScore({ benefitUsd: headlineUsd, decay: timing.decay, novel: timing.novel }),
      benefit,
      annual_benefit_usd: headlineUsd,
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
  //
  // Timing enters as `priority` rather than as its own sort term, and only
  // inside a tier. With no context every priority equals its benefit exactly,
  // so this ordering is identical to the pre-context one until a refresh has
  // actually observed something.
  candidates.sort(
    (a, b) =>
      benefitRank(a.benefit_qualifier) - benefitRank(b.benefit_qualifier) ||
      b.priority - a.priority ||
      b.annual_benefit_usd - a.annual_benefit_usd ||
      b.fit_score - a.fit_score ||
      (a.household_id < b.household_id ? -1 : 1)
  );

  const considered = advisor.household_ids.length;
  return {
    // plain_benefit travels with the product because generateOutreach is handed
    // this object rather than the catalog entry, and a draft cannot say what the
    // product does differently unless the words come along.
    product: {
      id: product.id,
      name: product.name,
      category: product.category,
      plain_benefit: product.plain_benefit || null,
    },
    candidates,
    excluded,
    no_signal: noSignal,
    expired,
    considered,
    reconciliation: {
      considered,
      fits: candidates.length,
      excluded: excluded.length,
      no_signal: noSignal.length,
      expired: expired.length,
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
 *   4. A household the advisor was already shown this week does not come back
 *      unless something new arrived. Repetition is what makes a daily digest
 *      stop being read, and the rules above cannot catch it because a row that
 *      was worth sending yesterday is still worth sending today on every
 *      measure except that it has already been sent.
 *
 * Ordering leads with rows whose figure is computed rather than estimated:
 * those are the ones that survive being questioned. Within that, a signal that
 * arrived overnight outranks one that has been sitting for a month.
 *
 * @param {object} args
 * @param {Map<string,object>|null} [args.context]  household id -> context snapshot
 * @param {Map<string,{lastTouchAt:string|null,byProduct:Map<string,string>}>|null} [args.touches]
 * @param {Date} [args.now]
 * @returns {{ advisorId, items, considered, withOpportunity, scannedProducts, dropped, held, context_coverage }}
 */
/**
 * Granularity of the fairness term in digest ranking, in days.
 *
 * Tracks the cadence cap rather than sitting at a fixed week, because the
 * bucket has to be smaller than the interval at which households recur or it
 * cannot distinguish them. On the fixture book households return every two
 * days, so a seven-day bucket put all of them in the same one, the term went
 * inert, and coverage skewed hard: the two households holding a product nobody
 * else matched took nine mornings out of fifteen while others took three.
 *
 * Capped at a week so a real book, where the same-product cap is measured in
 * months, keeps the original behavior.
 */
function waitBucketDays(sameProductCap) {
  return Math.max(1, Math.min(7, sameProductCap));
}

export function buildAdvisorDigest({
  provider,
  advisorId,
  maxItems = 5,
  minItems = null,
  context = null,
  touches = null,
  now = new Date(),
  cadence: cadenceOpts = {},
  pace = true,
  lifeEventSlots = null,
}) {
  const catalog = provider.getCatalog() || [];
  // Two reserved rows in a five-row mail is a lot; two in a ten-row mail is a
  // mail that has gone back to being about card maths. Scale with the mail
  // unless the caller has an opinion: a quarter of the rows, never fewer than
  // the default.
  if (lifeEventSlots == null) {
    lifeEventSlots = Math.max(DEFAULT_LIFE_EVENT_SLOTS, Math.ceil(maxItems / 4));
  }
  const advisor = provider.getAdvisors().find((a) => a.id === advisorId);
  const considered = advisor?.household_ids?.length || 0;
  const bestByHousehold = new Map();
  const altByHousehold = new Map();
  // Households, not household-product pairs. The catalog is scanned product by
  // product, so the same closed window is reported once per product and a naive
  // sum reads as 22 expiries on a book of 12.
  const expiredHouseholds = new Set();

  for (const product of catalog) {
    let audience;
    try {
      audience = buildAudience({ provider, advisorId, productId: product.id, context, now });
    } catch {
      continue;
    }
    for (const e of audience.expired || []) expiredHouseholds.add(e.household_id);
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
        lead_options: c.lead_options || [],
        outreach_window: c.outreach_window,
        timing: c.timing,
        priority: c.priority,
        matched_signals: c.matched_signals,
        supporting_signals: c.supporting_signals,
        supporting_signal_count: c.supporting_signal_count,
        rationale: c.rationale,
      };
      const existing = bestByHousehold.get(c.household_id);
      if (!existing || beatsForDigest(item, existing)) {
        bestByHousehold.set(c.household_id, item);
      }
      // Every match is kept, not just the household's best. A household still
      // gets one row, but which product takes it is decided at selection time
      // against what the rest of the mail already says. Discarding the runners
      // up here is what made the digest repetitive: fourteen households match
      // the savings account and thirteen of them price it above their
      // alternatives, so it won every row it was allowed and the mortgage,
      // the HELOC and the term life a household also qualified for were gone
      // before anything could notice the mail had said "savings" four times.
      if (!altByHousehold.has(c.household_id)) altByHousehold.set(c.household_id, []);
      altByHousehold.get(c.household_id).push(item);
    }
  }

  const withOpportunity = bestByHousehold.size;
  const dropped = {
    thin_signal: 0,
    balance_only: 0,
    product_concentration: 0,
    expired: expiredHouseholds.size,
    contacted_recently: 0,
    same_product_recently: 0,
    paced: 0,
  };
  // Rows that were good enough to send but are being held back for cadence
  // reasons. Separated from `dropped` because these come back on their own,
  // and an operator looking at a thin digest needs to know which.
  const held = [];

  // `record` is on only for the household's best row. The gate now runs over
  // every match so that a household whose best product is already well
  // represented can still be reached through another one, but the counters
  // and the held list stay per household: reporting "thin_signal: 31" for a
  // book of 28 households would be arithmetic nobody could follow.
  const passesQuality = (item, { record }) => {
    if (item.supporting_signal_count < 2) {
      if (record) dropped.thin_signal++;
      return false;
    }
    if (item.supporting_signals.every((s) => isBalanceDerived(s))) {
      if (record) dropped.balance_only++;
      return false;
    }

    const summary = touches?.get(item.household_id);
    if (!summary) return true;

    const cadence = contactCadence({
      lastTouchAt: summary.lastTouchAt,
      lastProductTouchAt: summary.byProduct?.get(item.product.id) || null,
      novel: Boolean(item.timing?.novel),
      now,
      ...cadenceOpts,
    });
    if (!cadence.ready) {
      if (record) {
        dropped[cadence.reason] = (dropped[cadence.reason] || 0) + 1;
        held.push({
          household_id: item.household_id,
          household_name: item.household_name,
          product_id: item.product.id,
          reason: cadence.reason,
          days_since: cadence.days_since,
          next_eligible_at: cadence.next_eligible_at,
        });
      }
      return false;
    }
    item.cadence = cadence;
    return true;
  };

  // Cadence is per household *and* product, so a swapped-in product has to
  // clear the gate on its own terms rather than inherit the best row's pass.
  //
  // The household's entry in the ranked list is its best *passing* product,
  // not its best product. Gating on the best alone dropped four households
  // from a 28-household book: each one's highest-paying match rested on a
  // single signal, so the household was filed as thin while three other
  // products it qualified for, each with two or more signals behind it, were
  // never looked at. A drop is only recorded when nothing the household
  // matches gets through.
  const alternatives = new Map();
  const qualityPassed = [];
  for (const [householdId, list] of altByHousehold) {
    const ok = list.filter((item) => passesQuality(item, { record: false }));
    if (!ok.length) {
      passesQuality(bestByHousehold.get(householdId), { record: true });
      continue;
    }
    alternatives.set(householdId, ok);
    qualityPassed.push(ok.reduce((a, b) => (beatsForDigest(b, a) ? b : a)));
  }

  // How long a household has gone unmentioned, for the fairness term below.
  // Never contacted sorts ahead of everything, which is the right default: a
  // household nobody has raised yet has waited longest by definition.
  const nowIso = new Date(now).toISOString();
  const waited = new Map(
    qualityPassed.map((item) => {
      const last = touches?.get(item.household_id)?.lastTouchAt;
      return [item.household_id, last ? daysBetween(last, nowIso) : Infinity];
    })
  );
  // Bucketed rather than compared day by day, which is what keeps this from
  // turning into pure round-robin. Inside a bucket the term is inert and the
  // better-evidenced opportunity wins, exactly as before.
  const bucketDays = waitBucketDays(
    cadenceOpts.minDaysBetweenSameProduct ?? MIN_DAYS_BETWEEN_SAME_PRODUCT
  );
  const waitBucket = (item) => {
    const days = waited.get(item.household_id);
    return days === Infinity ? Infinity : Math.floor(days / bucketDays);
  };
  const byWaited = (a, b) => {
    const x = waitBucket(a);
    const y = waitBucket(b);
    return x === y ? 0 : y - x;
  };

  // Breaking news, then weeks waited, then defensibility, then size.
  //
  // The fairness term exists because the product cap makes some slots scarce,
  // and a scarce slot handed out by a stable ordering starves whoever is last
  // in line — permanently, not occasionally. Seven households in the demo book
  // best-match the travel card and only one row a day may carry it. Six of
  // them price it from posted rates and rank a tier above the seventh, who
  // prices it gross; six households cycling through one slot on a six-day cap
  // fits exactly, so the seventh was never mentioned again. Its figure was the
  // largest of the seven.
  //
  // Ranking above defensibility is deliberate and is why the term is bucketed.
  // Within a week the more defensible figure always leads. Across weeks, the
  // household nobody has raised in longer gets the slot, because a marginally
  // better-evidenced number is worth less than an advisor hearing about a
  // household at all. Never-contacted sorts above every bucket, so a book
  // cycles through everyone before repeating anyone.
  //
  // On a first run no household has been contacted, every bucket is equal, and
  // the ordering is the original one untouched.
  const rankForDigest = (a, b) =>
    newsRank(a) - newsRank(b) ||
    byWaited(a, b) ||
    benefitRank(a.benefit_qualifier) - benefitRank(b.benefit_qualifier) ||
    b.priority - a.priority ||
    b.annual_benefit_usd - a.annual_benefit_usd ||
    b.fit_score - a.fit_score ||
    (a.household_id < b.household_id ? -1 : 1);

  qualityPassed.sort(rankForDigest);

  // Pace the mail to what the book can sustain.
  //
  // maxItems is a ceiling, not a target, and treating it as a target is what
  // makes a small book feel broken. Taking the best five every morning spends a
  // twelve-household book in three days and then sends nothing for a week — the
  // cadence caps are working exactly as designed and the advisor still sees a
  // burst followed by silence. Loosening the caps does not fix it; it just
  // makes the burst repeat more often.
  //
  // A book of N supports about N / cap rows a day indefinitely. Sizing to that
  // trades a full first morning for a digest that has something to say every
  // morning, which is the whole premise of a daily habit. A large book never
  // reaches this limit and keeps the full five.
  //
  // The cap to divide by is the same-product one, because that is what binds: a
  // household returns after `minDaysBetween` only if its best product changed,
  // and otherwise waits out `minDaysBetweenSameProduct`. Dividing by the
  // shorter of the two promises a rhythm the book cannot keep — two rows a day
  // for a week, then three weeks of silence.
  const cadenceDays = Math.max(
    cadenceOpts.minDaysBetween ?? MIN_DAYS_BETWEEN_TOUCHES,
    cadenceOpts.minDaysBetweenSameProduct ?? MIN_DAYS_BETWEEN_SAME_PRODUCT
  );
  const sustainable = Math.max(1, Math.ceil(withOpportunity / Math.max(1, cadenceDays)));
  // Only ration when there is a contact log to ration against. Without one
  // nothing is being held for another day — there are no other days — so a
  // thinner mail buys nothing and simply loses rows. This also keeps the
  // promise that a caller passing neither context nor touches sees exactly the
  // pre-timing digest.
  const pacedMax = pace && touches ? Math.min(maxItems, sustainable) : maxItems;

  // "No more than half the digest" has to mean half of the digest being sent,
  // not half of the ceiling. Sized against maxItems, the guard silently stopped
  // guarding the moment pacing shrank the mail: a two-row digest with a cap of
  // two is not capped at all, and the fixture book duly pitched the travel card
  // in both rows on most mornings. The names rotated and the mail still read
  // identically day to day, which is the complaint this was supposed to answer.
  const newsCount = qualityPassed.reduce((n, item) => n + (newsRank(item) === 0 ? 1 : 0), 0);
  const expectedRows = Math.min(maxItems, Math.max(pacedMax, newsCount));

  // The mail has a floor and a ceiling rather than a fixed length. Rows up to
  // the floor are filled the usual way; rows past it have to say something
  // the mail has not said yet — a product and a headline both new to the page
  // — or they are not added. A ten-row mail that could have been twelve
  // because two more households had genuinely different things going on
  // should be twelve; one that would have been twelve by repeating "savings"
  // a third time should stay at ten. Caps and the relaxation loop are sized
  // to the floor, so the ceiling never loosens them.
  const floorRows = Math.min(expectedRows, minItems == null ? maxItems : Math.max(1, minItems));

  // A fifth of the mail, not half of it.
  //
  // Half was never a variety rule, it was a ceiling on the worst case, and the
  // worst case is what we got: five rows allowed two savings accounts and ten
  // allowed five. The reader's complaint is not that a product repeats, it is
  // that the mail reads the same every morning, and two of anything out of ten
  // is the point where it stops reading that way. The lead signal is capped on
  // the same terms, because two different products both headlined "cash
  // sitting uninvested" is the same monotony wearing a different label.
  const diversityCap = (rows) => Math.max(1, Math.ceil(rows / 5));

  /**
   * Fill the mail, giving each household the product that repeats least.
   *
   * Households are still visited in ranked order, so the most important
   * conversation is still picked first; what changes is that the household's
   * runner-up takes the row when its best product has already had its turn.
   * Pure, so the caps can be loosened and the whole thing re-run without the
   * first attempt's counters leaking into the second.
   */
  const fill = (productCap, signalCap) => {
    const perProduct = new Map();
    const perSignal = new Map();
    const perCategory = new Map();
    const picked = [];
    let concentration = 0;
    let paced = 0;
    const usedCount = (map, key) => map.get(key) || 0;

    for (const best of qualityPassed) {
      // News is never held back for pacing. Pacing exists to ration routine
      // rows across the week; a signal that arrived overnight is the one thing
      // that cannot wait for its turn.
      const isNews = newsRank(best) === 0;
      const limit = isNews ? maxItems : pacedMax;
      if (picked.length >= limit) {
        // Only call it pacing when pacing is what cut it. A row that simply did
        // not fit inside maxItems was not held for tomorrow, and counting it
        // here would overstate how much the rationing is doing.
        if (!isNews && pacedMax < maxItems) paced++;
        continue;
      }

      // A row can headline with any signal that drove its match. When the
      // default headline is already on the page, step to the next one the
      // household actually has, so two travel rows read "reimbursed business
      // travel" and "travel-heavy spend" rather than the same phrase twice.
      const headlineFor = (item) => {
        const fallback = { lead: item.lead_signal, timing: item.timing };
        const choices = [fallback, ...(item.lead_options || [])];
        return choices.reduce((bestSoFar, o) =>
          usedCount(perSignal, o.lead?.label) < usedCount(perSignal, bestSoFar.lead?.label) ? o : bestSoFar
        );
      };
      const withHeadline = (item) => {
        const h = headlineFor(item);
        if (!h.lead || h.lead === item.lead_signal) return item;
        return { ...item, lead_signal: h.lead, timing: h.timing, outreach_window: h.timing.window };
      };
      // Product and headline repeats cost the same: a mail that says "savings"
      // twice and one that says "expecting a child" twice are equally tired.
      // A category repeat costs half as much. Three different travel cards
      // under three different headlines are still three travel rows in a
      // five-row mail, so the category has to count for something; but it is
      // never capped, and a book whose households all need deposits should
      // still get a mail that says so. Ties go to the fresher headline,
      // because the headline is what the advisor reads first and what the
      // complaint about sameness was about.
      const repeats = (o) =>
        usedCount(perProduct, o.product.id) +
        usedCount(perSignal, o.lead_signal?.label) +
        usedCount(perCategory, o.product.category) / 2;
      // New to the page means a product and a headline it has not used;
      // category is not counted, because five categories cannot all be new
      // past the fifth row and the test would never pass.
      const fresh = (o) =>
        usedCount(perProduct, o.product.id) === 0 && usedCount(perSignal, o.lead_signal?.label) === 0;
      const options = [...(alternatives.get(best.household_id) || [best])].map(withHeadline).sort(
        (a, b) =>
          repeats(a) - repeats(b) ||
          usedCount(perSignal, a.lead_signal?.label) - usedCount(perSignal, b.lead_signal?.label) ||
          usedCount(perProduct, a.product.id) - usedCount(perProduct, b.product.id) ||
          newsRank(a) - newsRank(b) ||
          benefitRank(a.benefit_qualifier) - benefitRank(b.benefit_qualifier) ||
          b.priority - a.priority ||
          b.annual_benefit_usd - a.annual_benefit_usd ||
          // Category only breaks a tie between two products that are equally
          // fresh to the mail and equally well evidenced. It sits below the
          // money on purpose: with fifty-five products, most households have
          // several options at zero repeats, and letting category decide among
          // them traded a computed $1,965 card row for a savings estimate. It
          // is not capped either: a book whose households all need deposits
          // should say so.
          usedCount(perCategory, a.product.category) -
            usedCount(perCategory, b.product.category) ||
          b.fit_score - a.fit_score
      );
      const pastFloor = picked.length >= floorRows;
      const pick = options.find(
        (o) =>
          usedCount(perProduct, o.product.id) < productCap &&
          usedCount(perSignal, o.lead_signal?.label) < signalCap &&
          (!pastFloor || fresh(o))
      );
      if (!pick) {
        // Past the floor, a household with nothing new to add is not a
        // casualty of the cap; the mail is simply as long as it should be.
        if (!pastFloor) concentration++;
        continue;
      }

      perProduct.set(pick.product.id, usedCount(perProduct, pick.product.id) + 1);
      perSignal.set(pick.lead_signal?.label, usedCount(perSignal, pick.lead_signal?.label) + 1);
      perCategory.set(pick.product.category, usedCount(perCategory, pick.product.category) + 1);
      picked.push(pick);
    }
    return { picked, concentration, paced };
  };

  // Tight caps first, loosened only if the book cannot fill the mail under
  // them. A twelve-household book where everyone wants the same two products
  // should send a repetitive digest rather than a half-empty one — but it
  // should have to earn the repetition, which the old fixed half-the-mail cap
  // never asked of the 28-household book.
  let attempt = fill(diversityCap(floorRows), diversityCap(floorRows));
  for (
    let cap = diversityCap(floorRows) + 1;
    attempt.picked.length < Math.min(floorRows, qualityPassed.length) &&
    cap <= Math.max(1, floorRows);
    cap += 1
  ) {
    attempt = fill(cap, cap);
  }
  // Re-sort on the chosen rows. Households were visited in the order their
  // best opportunity earned, but the row a household ends up with may be its
  // second or third product, so the order the mail was filled in is no longer
  // the order it should be read in. Same comparator as above, applied to what
  // was actually picked.
  const items = attempt.picked.sort(rankForDigest);
  dropped.product_concentration += attempt.concentration;
  dropped.paced += attempt.paced;

  reserveForLifeEvents({
    items,
    ranked: qualityPassed,
    slots: lifeEventSlots,
    caps: { product: diversityCap(floorRows), signal: diversityCap(floorRows) },
  });

  return {
    advisorId,
    items,
    // The subject is dated from this. It has to be the digest's own notion of
    // today rather than whenever the subject happens to be rendered.
    //
    // An ISO string, not the Date: the caller persists this whole object to
    // DynamoDB, and the document client refuses to marshall a class instance.
    // Every field that hangs off a digest has to survive JSON.
    generatedAt: isoOrNull(now),
    considered,
    withOpportunity,
    scannedProducts: catalog.length,
    dropped,
    held,
    // What the mail was actually sized to today, and why. A thin digest is the
    // first thing questioned, and "the book only supports two a day" is a very
    // different answer from "we ran out of opportunities".
    pacing: {
      max_items: maxItems,
      min_items: floorRows,
      paced_to: pacedMax,
      sustainable,
      cadence_days: cadenceDays,
      life_event_slots: lifeEventSlots,
    },
    // How much of the book the refresh has actually observed. A digest built on
    // partial context is still worth sending, but the gap is the first thing to
    // look at when the ordering seems wrong.
    context_coverage: context
      ? { covered: countCovered(advisor, context), of: considered }
      : { covered: 0, of: considered },
  };
}

function countCovered(advisor, context) {
  return (advisor?.household_ids || []).filter((id) => context.has(id)).length;
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
  // News wins the household's row, ahead of how defensible the figure is.
  //
  // This inverts the usual ordering deliberately, and only here. A household
  // gets one row, and the question that row answers is "what is the most
  // important conversation to have with these people right now" — not "which
  // of our figures is tidiest". Without this, a household that came into
  // $310,000 last night is represented in the mail by a $272-a-year card
  // saving, purely because the card figure is computed from their ledger while
  // the inheritance figure rests on an assumed return. That is the arithmetic
  // winning an argument it was never asked to join.
  //
  // Cross-household ranking still leads with defensibility; see the digest sort.
  const news = newsRank(candidate) - newsRank(incumbent);
  if (news !== 0) return news < 0;

  const delta = benefitRank(candidate.benefit_qualifier) - benefitRank(incumbent.benefit_qualifier);
  if (delta !== 0) return delta < 0;
  // Priority rather than raw benefit, so the household's one row goes to the
  // product whose signal is still live. Without context the two are equal and
  // this is the original comparison.
  if (candidate.priority !== incumbent.priority) return candidate.priority > incumbent.priority;
  if (candidate.annual_benefit_usd !== incumbent.annual_benefit_usd) {
    return candidate.annual_benefit_usd > incumbent.annual_benefit_usd;
  }
  // Everything above is equal, which for products valued as an outcome rather
  // than a figure is the common case: several of them price to no dollar
  // amount at all, so they reach here tied on every term. Falling through left
  // catalog order to decide, so a product matching one of the household's
  // signals could hold the row against one matching three. A household that
  // has both told us it is moving and told us it is buying should be reading
  // about a mortgage, not about the one product that noticed only the
  // purchase; and where the thinly-matched product also lacked support, the
  // household was dropped outright with a better opportunity sitting unused.
  if (candidate.fit_score !== incumbent.fit_score) {
    return candidate.fit_score > incumbent.fit_score;
  }
  return candidate.supporting_signal_count > incumbent.supporting_signal_count;
}

/**
 * 0 for a row whose lead signal arrived in the last few days, 1 otherwise.
 *
 * One bit, not a scale. Novelty either is or is not the reason to read the row,
 * and a graded newsworthiness score would be unexplainable the first time an
 * advisor asked why one row outranked another.
 */
function newsRank(item) {
  return item?.timing?.novel ? 0 : 1;
}

// How much a life event changes a household's finances, roughly, and only
// relative to each other. Money arriving or a dependant arriving outranks a
// state the household has been in for years.
const LIFE_EVENT_WEIGHT = {
  estate_inflow: 100,
  business_liquidity: 95,
  new_child: 80,
  new_child_expected: 75,
  home_purchase_intent: 70,
  marriage: 60,
  relocation: 55,
  job_change: 50,
  elder_care: 50,
  college_bound: 45,
  home_renovation: 35,
  // A horizon, not an event. Real, worth a conversation, not news.
  retirement_horizon: 20,
};

export const DEFAULT_LIFE_EVENT_SLOTS = 2;

function lifeEventWeight(item) {
  // Gated on kind rather than on membership of the table, so a life event type
  // added to the taxonomy later still competes for a reserved row instead of
  // silently scoring zero and never being surfaced. The table orders the ones
  // we have opinions about; anything new lands mid-pack until it gets one.
  if (item?.lead_signal?.kind !== 'life_event') return 0;
  return LIFE_EVENT_WEIGHT[item.lead_signal.type] ?? 40;
}

/**
 * Keep room in the mail for the events that matter most to a household, even
 * though we refuse to put a number on them.
 *
 * The digest orders by how defensible the figure is, which is right when the
 * figures are comparable. Life events have no defensible figure by design — we
 * will not dollarize an inheritance on an assumed return — so they carry an
 * outcome phrase, and an outcome phrase sorts below every computed one. On the
 * 28-household book that put all 22 life events in the bottom half and ranked
 * "Inheritance received" 27th of 27, behind a $1,132 card saving. The rule
 * written to stop us overclaiming was quietly deciding what an advisor never
 * hears about.
 *
 * So a couple of rows are reserved rather than competed for. Reserved, not
 * promoted to the top: 22 of 28 households have an event of some kind, and a
 * digest that led with all of them would be as uniform as the one that led
 * with none. Weight decides which events earn the reserved rows, and the
 * priced rows keep the rest of the mail.
 *
 * Mutates `items` in place, replacing the weakest non-event rows.
 */
function reserveForLifeEvents({
  items,
  ranked,
  slots = DEFAULT_LIFE_EVENT_SLOTS,
  caps = { product: Infinity, signal: Infinity },
}) {
  if (slots <= 0 || !items.length) return;
  const present = new Set(items.map((i) => i.household_id));

  // Reservation runs after the mail has been balanced, so it has to respect
  // that balance or it quietly undoes it: given a free hand it will splice in
  // a second 529 under a second "expecting a child", displacing the one HELOC
  // and the one term life policy in the mail, and hand back the monotony the
  // selection just removed.
  const count = (key, of) => items.filter((i) => of(i) === key).length;
  const breachesCaps = (item) =>
    count(item.product.id, (i) => i.product.id) >= caps.product ||
    count(item.lead_signal?.label, (i) => i.lead_signal?.label) >= caps.signal;

  const candidates = ranked
    .filter((i) => lifeEventWeight(i) > 0 && !present.has(i.household_id))
    .sort((a, b) => lifeEventWeight(b) - lifeEventWeight(a));
  if (!candidates.length) return;

  for (const candidate of candidates) {
    if (breachesCaps(candidate)) continue;
    const eventRows = items.filter((i) => lifeEventWeight(i) > 0);
    if (eventRows.length < slots) {
      // Room going spare. Drop from the bottom of the mail, and only rows
      // carrying no event. Never displace news: something that arrived
      // overnight is the reason the advisor opens this at all. Among those,
      // give up a row whose product already appears elsewhere before giving
      // up the only one of its kind.
      const droppable = (i) => lifeEventWeight(i) === 0 && newsRank(i) !== 0;
      const at = (() => {
        const dupe = items.findLastIndex(
          (i) => droppable(i) && count(i.product.id, (x) => x.product.id) > 1
        );
        return dupe >= 0 ? dupe : items.findLastIndex(droppable);
      })();
      if (at < 0) return;
      items.splice(at, 1, candidate);
      present.add(candidate.household_id);
      continue;
    }

    // Both slots taken, so the question is whether they are taken by the right
    // events. Selecting for variety surfaces events on its own now, and two
    // incidental ones arriving first used to lock out the heaviest in the book
    // — a $310,000 inheritance losing its row to a kitchen renovation because
    // the renovation happened to be picked earlier. Reservation guarantees the
    // weightiest events a place, not merely that some event is present.
    const weakest = eventRows.reduce((a, b) =>
      lifeEventWeight(b) < lifeEventWeight(a) ? b : a
    );
    if (lifeEventWeight(candidate) <= lifeEventWeight(weakest)) return;
    if (newsRank(weakest) === 0) return;
    // A heavier event is not worth a narrower mail. Swapping the only term
    // life policy out for a second 529 under a second "expecting a child"
    // raises the weight of the reserved rows and makes the digest read worse,
    // which is the trade this whole change exists to stop making.
    //
    // Counted over the whole mail rather than judged a row at a time, because
    // the two rows often carry the same product: an inheritance displacing a
    // retirement horizon on the same managed portfolio costs nothing, and
    // reasoning about either row alone says it does, which is how the heaviest
    // event in the book got skipped.
    const before = new Set(items.map((i) => i.product.id)).size;
    const after = new Set([
      ...items.filter((i) => i !== weakest).map((i) => i.product.id),
      candidate.product.id,
    ]).size;
    if (after < before) continue;
    items.splice(items.indexOf(weakest), 1, candidate);
    present.add(candidate.household_id);
  }
  items.sort(
    (a, b) =>
      newsRank(a) - newsRank(b) ||
      benefitRank(a.benefit_qualifier) - benefitRank(b.benefit_qualifier) ||
      b.priority - a.priority
  );
}

/**
 * Subject line for the scheduled digest.
 *
 * The denominator used to be here — "5 of 28 households" — on the reasoning
 * that a shortlist without a book size cannot be calibrated. That reasoning
 * holds for a screen an advisor asked for, where the denominator is the
 * evidence the screen was thorough. It does not hold for the morning mail,
 * where the book size is a constant the reader already knows and the only
 * thing it adds is a chance to notice it is small. A relationship manager
 * carries hundreds; the reconciliation line still states the denominator
 * whenever an advisor actually screens for something.
 *
 * Undated, and fixed rather than varied per send. Both were tried while
 * chasing a "Re:" that kept appearing on the digest, and neither was the
 * cause. Gmail titles a conversation from the message that started it, and
 * groups later same-subject mail from the same sender into it only when the
 * messages land close together. A digest a day apart never grouped: months of
 * byte-identical subjects arrived as separate mail. What grouped was an hour
 * of test sends and test replies minutes apart, and because a reply was in
 * that group the conversation took a "Re:" title that every later digest then
 * displayed under. The subject was innocent; the send pattern was not.
 *
 * So this stays the plain count, which is the part worth scanning and reads
 * the same every morning. Nothing in a header can override the grouping if a
 * burst is ever sent again — the only defences are one send a morning, and
 * not leaving a reply sitting in a conversation a digest can land in.
 */
export function digestSubject({ items = [] } = {}) {
  if (!items.length) return 'Your Daily Digest: nothing needs your attention today';
  const needs = items.length === 1 ? 'needs' : 'need';
  return `Your Daily Digest: ${pluralize(items.length, 'household')} ${needs} attention`;
}

function isoOrNull(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * The replies the digest invites, as examples built from the households in
 * front of the reader.
 *
 * Only four, and only these four: drafting, screening, meeting prep and
 * evidence lookup are what classifyIntent actually routes. Listing anything
 * else would be advertising a capability the next reply cannot honor, which
 * costs more trust than the extra line buys.
 */
export function digestActions(items = []) {
  if (!items.length) return [];
  const name = (item) => householdShortName(item?.household_name);
  const lead = name(items[0]) || 'a household';
  const second = name(items[1] || items[0]) || lead;
  const product = items[0]?.product?.name || 'a product';
  return [
    { example: `Draft the outreach for ${lead}`, does: 'A client-ready email, with the reasoning kept separate' },
    { example: `Screen the book for ${product}`, does: 'Every household ranked against one product' },
    { example: `Prep me for a call with ${second}`, does: 'A short briefing to read beforehand' },
    { example: `What do we know about ${lead}?`, does: 'The evidence behind the row' },
  ];
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
          // No greeting and no self-introduction. These notes are read under a
          // heading that already names the household, on both the router path
          // and the agent path, so "Hey Okoro, quick prep for Ada Okafor"
          // spends the first line saying what the heading said.
          content:
            'You are a wealth-management coworker prepping an advisor for a client meeting. Be concise and peer-toned. Ground every claim in the provided modeled signals. End with one concrete talking point. Do not invent figures. Start with the first thing that matters going in: no greeting, no salutation, and do not open by saying this is a prep or naming who it is for.',
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
 * What the advisor noticed, in the words a client would use about their own
 * life. The signal name itself is banned from client text, so a draft can only
 * be specific if it is handed a translation: "Travel-heavy spend" is an
 * internal label, "how much of your spending goes to flights and hotels" is the
 * same fact in a sentence an advisor could say out loud.
 *
 * Without this the model has nothing concrete to write about and produces
 * "a change in your spending habits", which is true of every client alive.
 *
 * Every entry must be a noun phrase in the second person, because the
 * deterministic fallback drops it straight into "I ... paid attention to X".
 * A clause starting with "that" reads as broken English there.
 */
const CLIENT_OBSERVATIONS = {
  'Travel-heavy spend': 'how much of your spending goes to flights and hotels',
  'Dining-led discretionary': 'how much of your everyday spending goes to restaurants',
  'Idle cash accumulation': 'the balance that has been building up in your checking account',
  'Idle cash spike': 'the cash that has landed in your checking account recently',
  'Accelerating savings velocity': 'how much more you have been setting aside lately',
  'Building emergency fund': 'the reserve you have been building',
  'Recurring savings transfers': 'the transfer you make to savings every month',
  'Automated investing': 'the investing you have set up to run on its own',
  'Avoids liquidating investments':
    'how you have left your investments alone even in the months when cash was tight',
  'Pays card in full': 'the way you clear your card balance every month',
  'Large discretionary outlays': 'a few sizeable purchases over the past year',
  'Rising family spend': 'how much household costs have grown for you',
  'Steady student-loan servicing': 'the student loan payments you have kept up without fail',
  'Volatile income': 'how much your income varies from month to month',
  home_renovation: 'the work you have been having done on the house',
  home_purchase_intent: 'the groundwork you seem to be laying for a home purchase',
  relocation: 'the signs that a move may be coming for you',
  retirement_horizon: 'how close you are getting to retirement',
  estate_inflow: 'the funds that recently came to you',
  elder_care: 'the care you have been arranging for a parent',
  college_bound: 'the college planning that seems to be under way',
  new_child: 'the new arrival at home',
  marriage: 'the wedding plans that seem to be under way',
  job_change: 'your recent change of employer',
  grocery_heavy_spend: 'how much of your everyday spending goes to groceries',
  business_travel_reimbursed: 'the work travel you have been putting on your own card',
  loyalty_spend: 'how much of your travel stays with one airline',
  fx_fees_paid: 'the foreign transaction fees you have been paying',
  travel_card_elsewhere: 'the travel card you carry with another bank',
  luxury_travel_spend: 'the way you travel',
  lounge_fees_paid: 'the lounge access you have been paying for',
  premium_cabin_bookings: 'the way you have been flying',
  cd_maturing: 'the certificate that is coming due',
  savings_elsewhere: 'the savings you keep with another bank',
  rollover_401k: 'the retirement plans you still have with old employers',
  scattered_retirement_accounts: 'the retirement accounts spread across old employers',
  equity_comp: 'the stock you receive from your employer',
  invests_elsewhere: 'the investments you hold with another firm',
  assets_across_custodians: 'the accounts you hold across several firms',
  seeking_advice: 'the advice you have been looking for',
  advisory_fees_elsewhere: 'the advisory fee you pay elsewhere',
  first_time_investor: 'the first investment you have made',
  estate_attorney: 'the estate planning you have been working through',
  inherited_retirement_assets: 'the retirement account that came to you',
  managing_parent_finances: 'the way you have been managing a parent\u2019s finances',
  large_charitable_giving: 'the giving you have been doing',
  high_cost_debt: 'the balances you have been carrying at high rates',
  income_jump: 'the raise that has come through',
  self_employed_income: 'the way your income arrives as a business owner',
  single_earner_household: 'the fact that one income carries the household right now',
  gig_income: 'the way your income arrives from different platforms',
  credit_builder_products: 'the work you have been doing to build your credit',
  car_shopping: 'the car you seem to be shopping for',
  auto_loan_elsewhere: 'the car loan you have with another lender',
  lease_ending: 'the lease that is coming to an end',
  boat_rv_shopping: 'the boat you seem to be shopping for',
  ev_purchase: 'the electric vehicle you recently bought',
  second_property: 'the property you seem to be looking at',
  multiple_properties: 'the properties you hold',
  planned_large_expense: 'the project you seem to be planning for',
  down_payment_saving: 'the down payment you have been setting aside',
  rent_increase: 'the rent increase that came through at renewal',
  earnest_money_wire: 'the deposit you recently sent on a property',
  moving_deposits: 'the move you have coming up',
  auto_premium_increase: 'the jump in your auto insurance premium',
  new_pet: 'the new pet at home',
  recent_fraud_resolved: 'the fraud issue we resolved for you recently',
};

/**
 * How the advisor accounts for knowing this, per tone.
 *
 * "I was going through your accounts this week" makes an advisor sound like
 * they were rummaging. A periodic review is a thing the client already pays
 * for and expects, so naming it as one makes the same sentence routine instead
 * of intrusive. Each opener ends ready for a noun-phrase observation.
 */
const TONE_OPENERS = {
  formal_reserved: 'As part of my regular review of your accounts, one item stood out:',
  direct_professional: 'In my regular review of your accounts this quarter, one thing stood out:',
  analytical: 'In reviewing your accounts this quarter, one thing stands out:',
  warm_personal: 'I was doing my regular review of your accounts, and one thing stood out:',
};

/** The ask, per tone. Same request, different register. */
const TONE_CLOSERS = {
  formal_reserved: 'Would twenty minutes this week or early next be convenient?',
  direct_professional: 'Do you have twenty minutes this week or early next?',
  analytical: 'Do you have twenty minutes this week or early next to go through it?',
  warm_personal: 'Any chance you have twenty minutes this week or early next?',
};

/** Last resort when the lead signal has no client translation. */
const CATEGORY_OBSERVATIONS = {
  Cards: 'where most of your card spending actually goes',
  Deposits: 'how much you are holding in cash',
  Wealth: 'how your accounts are currently put together',
  Lending: 'what you are currently paying to borrow',
  Insurance: 'what your current coverage does and does not cover',
};

/**
 * The client-safe observation for a candidate. Never returns a signal name, so
 * whatever the model does with it cannot trip validateClientDraft.
 */
function clientObservation(candidate, product) {
  const lead = candidate.lead_signal?.type || candidate.lead_signal?.label;
  return (
    CLIENT_OBSERVATIONS[lead] ||
    CATEGORY_OBSERVATIONS[product?.category] ||
    'where their money has been going lately'
  );
}

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

/**
 * Deterministic client body, used as the fallback and when validation fails.
 *
 * Carries the same observation the model is given, so a rejected model draft
 * degrades to a plainer sentence rather than a vaguer one. The observation is
 * the whole reason the email is worth opening.
 */
function fallbackClientBody({ candidate, product }) {
  const name = clientFirstName(candidate);
  const outcome = candidate.benefit_qualifier === 'outcome';
  const opening =
    candidate.tone === 'formal_reserved'
      ? `Dear ${candidate.primary_contact || name},`
      : `Hi ${name},`;
  const noticed = clientObservation(candidate, product);
  const opener = TONE_OPENERS[candidate.tone] || TONE_OPENERS.warm_personal;
  const closer = TONE_CLOSERS[candidate.tone] || TONE_CLOSERS.warm_personal;
  // Describes the product rather than naming it. Product names vary in whether
  // they take an article ("the Travel Cash Rewards Card" but "High-Yield
  // Savings") and no field records which, whereas plain_benefit always slots
  // in after "an option that". The advisor names the product when they edit;
  // the subject line already carries the category.
  const benefit = product?.plain_benefit
    ? `There is an option that ${product.plain_benefit}, and I believe it would suit you better than your current arrangement.`
    : 'I believe there is an arrangement that would suit you better than your current one.';
  const closing = outcome
    ? 'It is worth a conversation, and I would rather have it properly than over email.'
    : 'I have worked through what the difference would be worth, and I would rather go over it with you directly than put it in an email.';
  return `${opening}

${opener} ${noticed}. ${benefit} ${closing}

${closer}`;
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
    // Never product.tagline: taglines quote rates ("4% back on travel"), and a
    // draft that echoes one is rejected by validateClientDraft for carrying a
    // percentage. plain_benefit is the same claim with no figures in it.
    product: {
      name: product.name,
      category: product.category,
      what_it_does: product.plain_benefit || null,
    },
    households: selected.map((c) => ({
      household_id: c.household_id,
      client_first_name: clientFirstName(c),
      client_full_name: c.primary_contact || c.household_name,
      tone: c.tone,
      tone_guidance: TONE_GUIDANCE[c.tone] || TONE_GUIDANCE.warm_personal,
      // Already phrased in the second person, so it can be used close to
      // verbatim in the client's first sentence.
      what_the_advisor_noticed: clientObservation(c, product),
      // Whether there is a number to withhold at all. An 'outcome' candidate
      // has no computed figure, so promising to walk through numbers would be
      // a promise the advisor cannot keep in the meeting.
      has_figures_to_discuss: c.benefit_qualifier !== 'outcome',
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
            'Write in the advisor\'s first person, and account for how the advisor knows this by referring to their regular or periodic review of the client\'s accounts. ' +
            'That review is a service the client already pays for, so it is routine. Phrasing it as a one-off look, such as "I was going through your accounts", makes the advisor sound as though they were rummaging. ' +
            'Never write as a system, a model, or an analysis. Never say the client was identified, flagged, selected, or matched. ' +
            'This is a professional letter from someone who manages the client\'s money, so keep the register formal even for a warm tone. No slang, no exclamation points, no salesy enthusiasm. ' +
            'Follow each household\'s tone_guidance exactly. Three to five sentences. ' +
            '\n\nSTRUCTURE. Sentence one names what_the_advisor_noticed as a specific thing about this client, in the second person. ' +
            'Sentence two says plainly what their current arrangement does with that, and why it is not the best fit. ' +
            'Sentence three says what the named product does differently, in concrete terms, using what_it_does. ' +
            'If has_figures_to_discuss is true, say the advisor has worked out what the difference is worth and would rather go through it together than put it in an email. ' +
            'Close by asking for a short conversation and proposing a specific window such as this week or early next week. ' +
            '\n\nHARD RULES. No dollar amounts, no percentages, no numbers of any kind, not even spelled out as words. ' +
            'Do not describe how the advisor knows what they know beyond having gone through the account. ' +
            'Do not mention data, signals, patterns being detected, or any internal terminology. ' +
            '\n\nBANNED PHRASING, because it is vague enough to be true of any client and reads as a form letter: ' +
            '"reviewed your financial activity", "your spending habits", "a change in your spending", "I noticed some changes", ' +
            '"there might be a way", "enhance the value", "maximize your benefits", "explore this possibility", ' +
            '"bring this to your attention", "I wanted to reach out", "optimize", "solutions", "opportunity". ' +
            'Write the specific thing instead. A sentence that would be equally true of a different client is a failed sentence. ' +
            '\n\nReturn a JSON object: {"drafts":[{"household_id":"...","body":"..."}]} and nothing else.',
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
  'You are Ventus AI Coworker, an AI teammate for a wealth advisor, replying by email in a warm, concise, peer tone. ' +
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
    .filter((line) => line.replace(/^\[.*?\]\s*/, '').trim().length > 0)
    .join('\n');

  // Never ask the model to summarize nothing. Given an empty transcript it
  // writes a plausible thread that never happened, and a fabricated recap has
  // no figures in it, so the provenance checks downstream cannot catch it.
  if (!transcript.trim()) {
    return 'There is nothing in this thread yet beyond your message, so there is nothing for me to recap.';
  }

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
        {
          role: 'system',
          content:
            'Summarize only what the transcript contains. Do not add detail that is not written there.',
        },
        { role: 'user', content: transcript },
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
