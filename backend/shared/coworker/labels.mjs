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

/**
 * A household's name with the word "Household" taken off the end.
 *
 * Under a column headed HOUSEHOLD, in a mail about households, every row
 * repeating the word is five copies of something the reader already knows, and
 * it costs the width that the product and benefit columns need. "Sharma" is
 * how an advisor refers to them out loud anyway.
 */
export function householdShortName(name) {
  return (
    String(name || '')
      .replace(/\s+Household$/i, '')
      .trim() || String(name || '')
  );
}

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
  marriage: 'Getting married',
  job_change: 'Changed jobs',
};

/**
 * Behavioral patterns the bank catalog names in snake_case. The pipeline emits
 * its original fifteen patterns as prose already; these are the rest of the
 * catalog's vocabulary, labeled so a token that starts firing renders as a
 * sentence fragment an advisor can read aloud rather than as a field name.
 */
const BEHAVIORAL_LABELS = {
  // Cards and spend
  grocery_heavy_spend: 'Grocery-heavy spend',
  gas_heavy_spend: 'Fuel-heavy spend',
  category_concentrated_spend: 'Spend concentrated in one category',
  spend_across_categories: 'Spend spread across categories',
  big_discretionary_spender: 'Heavy discretionary spender',
  rising_card_usage: 'Rising card usage',
  card_paid_elsewhere: 'Pays off a card held elsewhere',
  debit_heavy_spender: 'Spends mostly on debit',
  high_debit_volume: 'High debit volume',
  foreign_spend_regular: 'Regular spend abroad',
  fx_fees_paid: 'Paying foreign transaction fees',
  trip_prep: 'Preparing for a trip',
  large_trip_booked: 'Large trip booked',
  rideshare_transit_heavy: 'Heavy rideshare and transit use',
  travel_card_elsewhere: 'Travel card held elsewhere',
  loyalty_spend: 'Loyalty-program spend',
  brand_loyal_spend: 'Brand-loyal spend',
  business_travel_reimbursed: 'Business travel reimbursed by employer',
  luxury_travel_spend: 'Luxury travel spend',
  multi_brand_travel: 'Travel across many brands',
  lounge_fees_paid: 'Paying for airport lounges',
  premium_cabin_bookings: 'Premium-cabin bookings',
  luxury_hotel_stays: 'Luxury hotel stays',
  concierge_spend: 'Concierge-level spend',
  high_cost_debt: 'Carrying high-cost debt',
  credit_builder_products: 'Using credit-builder products',
  prepaid_card_reliance: 'Relying on prepaid cards',
  new_to_banking: 'New to banking',
  campus_spend: 'Spending on campus',
  school_disbursements: 'Receiving school disbursements',
  first_job_payroll: 'First job payroll started',
  first_real_paycheck: 'First full-time paycheck',
  check_cashing_fees: 'Paying check-cashing fees',
  // Deposits and cash
  rate_chasing_outflow: 'Moving cash to chase a rate',
  funding_rival_account: 'Funding an account elsewhere',
  savings_elsewhere: 'Savings held elsewhere',
  cd_maturing: 'A CD held elsewhere is maturing',
  goal_saving: 'Saving toward a named goal',
  tax_refund_received: 'Tax refund received',
  income_seeking_saver: 'Saving for income',
  frequent_savings_access: 'Dips into savings often',
  paying_checking_fees: 'Paying checking fees',
  income_jump: 'Income has jumped',
  steady_payroll: 'Steady payroll',
  monthly_surplus: 'Monthly surplus',
  gig_income: 'Gig-platform income',
  payday_timing_gap: 'Payday timing gap',
  fee_cycle: 'Caught in a fee cycle',
  declined_payments: 'Declined payments',
  self_employed_income: 'Self-employed income',
  commission_or_bonus_income: 'Commission or bonus income',
  single_earner_household: 'Single-earner household',
  // Home and property
  down_payment_saving: 'Saving for a down payment',
  rent_above_mortgage: 'Rent above a comparable mortgage payment',
  rent_increase: 'Rent increase at renewal',
  earnest_money_wire: 'Earnest-money wire sent',
  housing_cost_jump: 'Housing costs jumped',
  second_property: 'Shopping for a second property',
  multiple_properties: 'Owns multiple properties',
  rental_property_income: 'Rental property income',
  renovation_planning: 'Planning a renovation',
  home_improvement_financing: 'Financing home improvements',
  planned_large_expense: 'A large expense coming up',
  moving_deposits: 'Deposits paid to movers',
  auto_premium_increase: 'Auto premium increased',
  auto_premium_elsewhere: 'Auto insurance held elsewhere',
  premium_elsewhere: 'Home insurance held elsewhere',
  // Vehicles
  car_shopping: 'Shopping for a car',
  car_purchase: 'Bought a car',
  ev_purchase: 'Bought an electric vehicle',
  auto_loan_elsewhere: 'Auto loan held elsewhere',
  high_rate_auto_loan: 'High-rate auto loan',
  lease_ending: 'Vehicle lease ending',
  car_lease_payments: 'Making car lease payments',
  dealer_deposit: 'Deposit paid to a dealer',
  boat_rv_shopping: 'Shopping for a boat or RV',
  // Wealth and planning
  rollover_401k: 'Old employer plan to roll over',
  scattered_retirement_accounts: 'Retirement accounts scattered across plans',
  invests_elsewhere: 'Invests elsewhere',
  assets_across_custodians: 'Assets spread across custodians',
  equity_comp: 'Equity compensation',
  seeking_advice: 'Seeking financial advice',
  advisory_fees_elsewhere: 'Paying advisory fees elsewhere',
  first_time_investor: 'First-time investor',
  estate_attorney: 'Working with an estate attorney',
  inherited_retirement_assets: 'Inherited retirement assets',
  gifting_to_family: 'Gifting to family',
  managing_parent_finances: 'Managing a parent\u2019s finances',
  large_charitable_giving: 'Large charitable giving',
  many_charities: 'Giving to many charities',
  giving_ramp_up: 'Charitable giving ramping up',
  year_end_giving_spike: 'Year-end giving spike',
  home_sale_proceeds: 'Home sale proceeds received',
  education_spend: 'Education spend',
  private_k12_tuition: 'Paying private school tuition',
  gift_deposits_for_child: 'Gift deposits for a child',
  diy_planning_tools: 'Using do-it-yourself planning tools',
  // Protection
  new_pet: 'New pet at home',
  regular_vet_visits: 'Regular vet visits',
  large_vet_bill: 'Large vet bill',
  recent_fraud_resolved: 'Recent fraud resolved',
  security_services_spend: 'Paying for security services',
  professional_license_fees: 'Paying professional license fees',
  life_premium_stopped: 'Life insurance premium stopped',
  new_large_debt: 'New large debt taken on',
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
  already_holds_product: 'already holding this product with us',
  serious_delinquency_24m: 'a serious delinquency in the last two years',
  revolving_balance_high: 'a high revolving balance',
  recent_new_credit: 'recently opened credit',
  missed_secured_payment: 'a missed secured-loan payment',
  recent_declined_payments: 'recently declined payments',
  payday_lender_use: 'payday lender use',
  draining_savings: 'savings being drawn down',
  near_term_cash_need: 'a near-term cash need',
  suitability_flag: 'a suitability flag',
  premium_not_affordable: 'the premium not being affordable',
  coverage_adequate: 'coverage already adequate',
  dormant_relationship: 'a dormant relationship',
  marketing_opt_out: 'a marketing opt-out on file',
  outreach_fatigue: 'recent outreach already sent',
  estate_settlement: 'an estate in settlement',
  hardship_program: 'an active hardship program',
  financial_vulnerability: 'a financial-vulnerability flag',
  open_complaint: 'an open complaint',
  fraud_watch: 'a fraud watch on the account',
  prior_chargeoff: 'a prior charge-off',
  bankruptcy_active: 'an active bankruptcy',
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
    BEHAVIORAL_LABELS[token] ||
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
    // Not "this quarter": the window is a rolling 60 days, and naming a quarter
    // implies a calendar boundary the signal does not have. It is also the only
    // label that has to carry urgency without a deadline, since the bucket does
    // not expire — "soon" does that, where a date would be a fiction.
    label: 'Worth raising soon',
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
  marriage: 'dated',
  // A job change closes its own window: the old plan has to go somewhere and
  // benefits elections happen in the first weeks.
  job_change: 'dated',
  // Seasonal by nature: the decision is real but tied to a school year, not a week.
  college_bound: 'seasonal',

  // Dated behavioral patterns from the bank catalog: each has a date attached
  // to it in the ledger (a maturity, a lease end, a wire, a vest) and loses
  // its value once that date passes.
  cd_maturing: 'dated',
  lease_ending: 'dated',
  earnest_money_wire: 'fast',
  rollover_401k: 'dated',
  inherited_retirement_assets: 'fast',
  home_sale_proceeds: 'fast',
  tax_refund_received: 'fast',
  car_shopping: 'dated',
  boat_rv_shopping: 'dated',
  second_property: 'dated',
  planned_large_expense: 'dated',
  moving_deposits: 'dated',
  income_jump: 'dated',
  new_pet: 'dated',
  recent_fraud_resolved: 'dated',
  auto_premium_increase: 'dated',
  rent_increase: 'dated',
  seeking_advice: 'dated',
  first_time_investor: 'dated',
  equity_comp: 'seasonal',
  high_cost_debt: 'seasonal',
  grocery_heavy_spend: 'seasonal',
  fx_fees_paid: 'seasonal',
  business_travel_reimbursed: 'seasonal',
  luxury_travel_spend: 'seasonal',
  premium_cabin_bookings: 'seasonal',
  lounge_fees_paid: 'seasonal',
  loyalty_spend: 'seasonal',
  savings_elsewhere: 'seasonal',
  invests_elsewhere: 'seasonal',
  advisory_fees_elsewhere: 'seasonal',
  assets_across_custodians: 'seasonal',
  auto_loan_elsewhere: 'seasonal',
  travel_card_elsewhere: 'seasonal',
  estate_attorney: 'seasonal',
  large_charitable_giving: 'seasonal',
  managing_parent_finances: 'seasonal',
  single_earner_household: 'standing',
  self_employed_income: 'standing',
  gig_income: 'standing',
  credit_builder_products: 'standing',
  down_payment_saving: 'seasonal',
  ev_purchase: 'dated',
  multiple_properties: 'standing',
  scattered_retirement_accounts: 'standing',
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
