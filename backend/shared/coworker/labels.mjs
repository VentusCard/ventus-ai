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

// Named buckets, not a unique number per signal. A window has to be defensible
// when an advisor asks where the number came from, and a bucket with a stated
// basis survives that question in a way invented precision does not: "23 days"
// implies a model we do not have.
//
// Five buckets rather than the original three, because three collapsed almost
// everything into one. Every behavioral signal except an idle-cash spike landed
// in the 45-day bucket, and behavioral signals lead most digest rows, so nearly
// every row in the mail carried an identical window — which reads as a template
// rather than a judgment. Thirty days was doing similar damage at the other
// end, filing "relocating next month" and "approaching retirement" as equally
// urgent.
//
// `mode` decides whether a signal runs out. Events describe a moment and expire
// when their window closes; conditions describe an ongoing state and never do.
// This belongs on the signal rather than on its family, because life events
// contain both: an inheritance is a moment, a retirement horizon is a state
// that persists for years.
const WINDOW_BUCKETS = {
  immediate: {
    days: 7,
    label: 'Next 7 days',
    mode: 'windowed',
    basis: 'The household is under active financial strain, and a conversation that arrives after the next cycle arrives too late to help.',
  },
  fast: {
    days: 14,
    label: 'Next 14 days',
    mode: 'windowed',
    basis: 'A one-time inflow gets deployed or spent within weeks, so the conversation has to happen while the money is still uncommitted.',
  },
  dated: {
    days: 30,
    label: 'Next 30 days',
    mode: 'windowed',
    basis: 'The household is inside a decision window that stays open for about a month before choices get made elsewhere.',
  },
  seasonal: {
    days: 60,
    label: 'Worth raising this quarter',
    mode: 'standing',
    basis: 'A recurring pattern the household is unlikely to change on its own, so the conversation keeps its value for a quarter rather than expiring.',
  },
  standing: {
    days: 90,
    label: 'No fixed deadline',
    mode: 'standing',
    basis: 'A durable trait rather than an event, so nothing about it expires and timing matters far less than raising it well.',
  },
};

/**
 * Bucket per signal, stated explicitly rather than inferred.
 *
 * Every signal the fixture book can produce appears here. A signal that falls
 * through is a signal nobody assigned a window to, and the default below is
 * written so that omission is safe rather than loud.
 */
const SIGNAL_WINDOWS = {
  // Events: a moment, with money or a decision moving.
  estate_inflow: 'fast',
  business_liquidity: 'fast',
  new_child: 'fast',
  'Idle cash spike': 'fast',
  new_child_expected: 'dated',
  home_purchase_intent: 'dated',
  relocation: 'dated',
  home_renovation: 'dated',
  elder_care: 'dated',
  // Seasonal by nature: the decision is real but tied to a school year, not a week.
  college_bound: 'seasonal',
  // A state, not an event. Filing this at 30 days implied a deadline that does
  // not exist and expired the row while the household was still years out.
  retirement_horizon: 'standing',

  // Distress. The only signal short enough to warrant the immediate bucket,
  // because the cost of arriving late is a fee the household already paid.
  'Cash-advance / gambling spend': 'immediate',

  // Conditions with some momentum behind them.
  'Accelerating savings velocity': 'dated',
  'Large discretionary outlays': 'dated',
  'Rising family spend': 'dated',
  'Volatile income': 'dated',

  // Recurring patterns worth a conversation, with no deadline attached.
  'Idle cash accumulation': 'seasonal',
  'Building emergency fund': 'seasonal',
  'Recurring savings transfers': 'seasonal',
  'Steady student-loan servicing': 'seasonal',
  'Travel-heavy spend': 'seasonal',
  'Dining-led discretionary': 'seasonal',
  idle_cash: 'seasonal',

  // Durable traits. Useful context, never a reason to hurry.
  'Pays card in full': 'standing',
  'Automated investing': 'standing',
  'Avoids liquidating investments': 'standing',
  home_equity: 'standing',
  student_loan_balance: 'standing',
};

/**
 * The outreach window for a lead signal, with the reason it is that long.
 *
 * Anything unmapped gets the standing bucket: no deadline, no expiry, no
 * urgency. Defaulting the other way would manufacture pressure out of
 * ignorance, and would also silently expire rows built on signals we have not
 * classified yet.
 *
 * @param {string} signalType
 * @returns {{days:number,label:string,basis:string,bucket:string,mode:string}}
 */
export function outreachWindow(signalType) {
  const key = String(signalType ?? '');
  const bucket = SIGNAL_WINDOWS[key] || 'standing';
  return { ...WINDOW_BUCKETS[bucket], bucket };
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
