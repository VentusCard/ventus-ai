// backend/shared/coworker/labels.mjs
//
// Display vocabulary for everything the Coworker puts in front of a reader.
//
// Two jobs:
//   1. Turn internal signal keys into human-readable phrases. Raw keys
//      (idle_cash, nsf_overdraft_cluster) must never reach an email, and the
//      humanize() fallback guarantees that even for keys added later.
//   2. Own the outreach-window buckets, so a window shown next to a signal has
//      a stated basis rather than an arbitrary number.
//
// Pure functions, no I/O. Kept separate from render.mjs because the same
// vocabulary is needed by task logic (rationale strings) and by tests.

// ---------------------------------------------------------------------------
// Signal labels
// ---------------------------------------------------------------------------

/**
 * Life events, stated as something that happened to the household rather than
 * an attribute it holds. "Inheritance received" is an event; "estate inflow"
 * reads as a file field.
 */
const LIFE_EVENT_LABELS = {
  new_child_expected: 'Expecting a child',
  new_child: 'New child at home',
  home_renovation: 'Renovating the home',
  home_purchase_intent: 'Shopping for a home',
  relocation: 'Relocating',
  estate_inflow: 'Inheritance received',
  retirement_horizon: 'Approaching retirement',
  college_bound: 'Child heading to college',
  business_liquidity: 'Business sale proceeds received',
  elder_care: 'Taking on elder care',
};

/** Risk / exclusion reasons, phrased so an advisor can read them aloud. */
const RISK_LABELS = {
  nsf_overdraft_cluster: 'recent overdraft activity',
  low_liquidity_buffer: 'a thin cash buffer',
  thin_credit_file: 'a limited credit history',
  aml_review: 'an account review in progress',
  ltv_above_80: 'high loan-to-value on the mortgage',
  recent_late_mortgage: 'a recent late mortgage payment',
  listing_active: 'the home currently listed for sale',
  liquid_below_min: 'investable balances below the product minimum',
  dti_high: 'a high debt-to-income ratio',
  down_payment_short: 'a down payment below requirement',
  residency_short: 'a short residency history',
  income_instability: 'irregular income',
  recent_delinquency: 'a recent delinquency',
  retirement_cap_met: 'retirement contributions already at the cap',
  address_flux: 'a recent address change',
  no_monthly_surplus: 'no monthly surplus',
};

/** Derived financial tokens that are attributes, not events. */
const FINANCIAL_LABELS = {
  idle_cash: 'Cash sitting uninvested',
  home_equity: 'Available home equity',
  student_loan_balance: 'Student loan balance',
};

/**
 * Turn any internal key into a readable phrase. Falls back to de-underscoring
 * and sentence-casing, so a key we have not explicitly labeled still never
 * renders as snake_case.
 * @param {string} key
 * @returns {string}
 */
export function humanize(key) {
  const raw = String(key ?? '').trim();
  if (!raw) return '';
  if (!/[_]/.test(raw)) return raw;
  const words = raw.replace(/_+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Human phrase for a life-event type. */
export function lifeEventLabel(type) {
  return LIFE_EVENT_LABELS[type] || humanize(type);
}

/**
 * Human phrase for an exclusion reason, written to slot into
 * "excluded for <reason>". Always lowercase-leading.
 */
export function exclusionLabel(reason) {
  const known = RISK_LABELS[reason];
  if (known) return known;
  const h = humanize(reason);
  return h ? h.charAt(0).toLowerCase() + h.slice(1) : 'a policy exclusion';
}

/** Human phrase for any signal token, whichever family it belongs to. */
export function signalLabel(token) {
  return (
    LIFE_EVENT_LABELS[token] ||
    FINANCIAL_LABELS[token] ||
    (RISK_LABELS[token] ? capitalize(RISK_LABELS[token]) : null) ||
    humanize(token)
  );
}

/**
 * Signals that reduce to a balance the advisor can already see. A row resting
 * only on one of these demonstrates arithmetic, not intelligence, so the digest
 * drops it.
 */
const BALANCE_DERIVED = new Set(['idle_cash', 'home_equity', 'student_loan_balance']);

/** True when the token is just a balance restated. */
export function isBalanceDerived(token) {
  return BALANCE_DERIVED.has(token);
}

// ---------------------------------------------------------------------------
// Outreach windows
// ---------------------------------------------------------------------------

// Three buckets, not per-signal half-lives. A window has to be defensible when
// an advisor asks where the number came from, and a coarse bucket with a stated
// basis survives that question in a way invented precision does not.
const WINDOW_BUCKETS = {
  fast: {
    days: 14,
    label: 'Next 14 days',
    basis: 'A one-time inflow gets deployed or spent within weeks, so the conversation has to happen while the money is still uncommitted.',
  },
  standard: {
    days: 30,
    label: 'Next 30 days',
    basis: 'The household is inside a decision window that stays open for about a month before choices get made elsewhere.',
  },
  slow: {
    days: 45,
    label: 'Next 45 days',
    basis: 'A standing balance or servicing pattern decays slowly, so timing matters less than getting the conversation right.',
  },
};

/** Signal types whose window is short because the money moves fast. */
const FAST_SIGNALS = new Set(['estate_inflow', 'business_liquidity', 'Idle cash spike']);

/** Signal types tied to a dated life decision. */
const STANDARD_SIGNALS = new Set([
  'new_child_expected',
  'new_child',
  'home_purchase_intent',
  'relocation',
  'home_renovation',
  'retirement_horizon',
  'college_bound',
  'elder_care',
]);

/**
 * The outreach window for a lead signal, with the reason it is that long.
 * Anything unrecognized gets the slow bucket: never overstate urgency.
 * @param {string} signalType
 * @returns {{days:number,label:string,basis:string,bucket:string}}
 */
export function outreachWindow(signalType) {
  const key = String(signalType ?? '');
  if (FAST_SIGNALS.has(key)) return { ...WINDOW_BUCKETS.fast, bucket: 'fast' };
  if (STANDARD_SIGNALS.has(key)) return { ...WINDOW_BUCKETS.standard, bucket: 'standard' };
  return { ...WINDOW_BUCKETS.slow, bucket: 'slow' };
}

/** All bucket definitions, for the runbook and for tests. */
export function outreachWindowBuckets() {
  return { ...WINDOW_BUCKETS };
}

// ---------------------------------------------------------------------------
// Vocabulary guards
// ---------------------------------------------------------------------------

/**
 * Words that must not appear in anything a reader sees.
 *
 * "underwriting" / "risk gate" / "eligible": Ventus stays on the marketing and
 * personalization side. The institution runs its own eligibility and credit
 * decisioning, so we never describe ourselves as applying one.
 * "qualify": same family, and it implies a determination we did not make.
 * "back-tested": means simulating a strategy against historical outcomes. We
 * screened a book against a product.
 * "ground truth": overclaims a modeled inference.
 * "recommendation": a term of art under Reg BI in a wealth register.
 */
export const BANNED_VOCABULARY = [
  'underwriting',
  'underwrite',
  'risk gate',
  'risk/underwriting',
  'qualify',
  'qualifies',
  'qualifying',
  'eligible',
  'eligibility',
  'back-tested',
  'back-test',
  'backtested',
  'ground truth',
  'recommendation',
];

/**
 * Find banned vocabulary in a rendered string. Used by the guard tests and by
 * the pre-send validator so a violation fails loudly instead of shipping.
 * @param {string} text
 * @returns {string[]} the banned terms present
 */
export function findBannedVocabulary(text) {
  const haystack = String(text ?? '').toLowerCase();
  return BANNED_VOCABULARY.filter((term) => haystack.includes(term));
}

/**
 * Find snake_case tokens in a rendered string. Style attributes and HTML are
 * ignored by only matching lowercase words joined by underscores.
 * @param {string} text
 * @returns {string[]}
 */
export function findSnakeCase(text) {
  const matches = String(text ?? '').match(/\b[a-z0-9]+(?:_[a-z0-9]+)+\b/g);
  return matches ? [...new Set(matches)] : [];
}

// ---------------------------------------------------------------------------
// Grammar
// ---------------------------------------------------------------------------

/**
 * Pluralize a count phrase so 0, 1, and n all read grammatically.
 * @param {number} count
 * @param {string} singular  e.g. "household"
 * @param {string} [plural]  defaults to singular + "s"
 * @returns {string} e.g. "1 household", "3 households"
 */
export function pluralize(count, singular, plural) {
  const n = Number(count) || 0;
  const word = n === 1 ? singular : plural || `${singular}s`;
  return `${n} ${word}`;
}

/** Subject-verb agreement for a count: "1 is", "2 are". */
export function verbFor(count) {
  return Number(count) === 1 ? 'is' : 'are';
}

/** "was" / "were" for a count. */
export function pastVerbFor(count) {
  return Number(count) === 1 ? 'was' : 'were';
}

function capitalize(s) {
  const str = String(s || '');
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
