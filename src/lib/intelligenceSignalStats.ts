// Deterministic portfolio-level signal statistics for the Intelligence Database
// overview. Pure mock math derived from the canonical signal vocabularies — no
// LLM, no backend. Copy stays "vaguely specific": no exact per-customer amounts.

import { SIGNAL_FAMILY_META, type SignalFamily } from "@/lib/customerDirectoryData";
import {
  BOOK_CUSTOMERS,
  ENRICHED_PROFILES,
  fmtCount as fmtBookCount,
} from "@/lib/bookScale";


export type SignalConfidence = "strong" | "likely" | "emerging";

/**
 * What a click on a family card or a signal tile hands to the Segments view.
 * `scope: "family"` means the whole family cohort, no single signal.
 */
export interface SignalSegmentSeed {
  family: import("@/lib/customerDirectoryData").SignalFamily;
  label: string;
  scope: "family" | "signal";
  /** Book-level population behind this cohort. */
  customers: number;
  delta: number;
  evidence: string;
  confidence: { strong: number; likely: number; emerging: number };
}

/** Distribution of evidence strength across the customers carrying a signal. */
export interface ConfidenceMix {
  strong: number;
  likely: number;
  emerging: number;
}

export interface SignalRollup {
  label: string;
  customers: number;
  delta: number; // 24h % change
  /** What Ventus saw in the enriched data. */
  evidence: string;
  /** Confidence is a per-customer property — expose the population split. */
  confidence: ConfidenceMix;
  /** Short deterministic trend series (relative, unitless). */
  trend: number[];
}


export interface SignalFamilyStats {
  key: SignalFamily;
  label: string;
  chip: string;
  dot: string;
  /** Soft card/panel tint classes for the Intelligence Dashboard. */
  tint: string;
  cardBorder: string;
  cardBorderHover: string;
  cardRing: string;
  sparklineColor: string;
  barStrong: string;
  barLikely: string;
  barEmerging: string;
  rowHover: string;
  rowHoverBorder: string;
  openText: string;
  /** Customers carrying at least one signal in this family. */
  customers: number;
  delta: number;
  topSignals: SignalRollup[];
  sparkline: number[];
  confidence: { strong: number; likely: number; emerging: number };
}

export interface SignalCoverageStats {
  totalCustomers: number;
  profilesEnriched: number;
  coveragePct: number;
  signals24h: number;
  avgSignalsPerCustomer: number;
  lifeEventsActive: number;
  externalSignals24h: number;
  strongPct: number;
}

export interface TaxonomyCoverage {
  pillars: number;
  tiers: number;
  merchantResolutionPct: number;
  unclassifiedPct: number;
  labelsInVocabulary: number;
  newLabels30d: number;
}

export interface ExternalSourceStat {
  name: string;
  kind: string;
  signalsAdded: string;
  matchRate: number;
}

const TOTAL_CUSTOMERS = BOOK_CUSTOMERS;
/** Everything below was authored against a 75M book; keep the ratios, rebase the size. */
const LEGACY_BOOK = 75_000_000;
const REBASE = TOTAL_CUSTOMERS / LEGACY_BOOK;

/** Base evidence-strength distribution per seed tier. */
const TIER_MIX: Record<SignalConfidence, ConfidenceMix> = {
  strong: { strong: 74, likely: 19, emerging: 7 },
  likely: { strong: 48, likely: 38, emerging: 14 },
  emerging: { strong: 26, likely: 39, emerging: 35 },
};

/** Deterministic ±5pt jitter so tiles don't all read identically. */
function mixFor(key: string, tier: SignalConfidence): ConfidenceMix {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100003;
  const base = TIER_MIX[tier];
  const jitter = (h % 11) - 5; // -5..5
  const strong = Math.min(92, Math.max(12, base.strong + jitter));
  const remainder = 100 - strong;
  const likelyShare = base.likely / (base.likely + base.emerging);
  const likely = Math.round(remainder * likelyShare);
  return { strong, likely, emerging: 100 - strong - likely };
}


interface SeedSignal {
  label: string;
  share: number;
  delta: number;
  evidence: string;
  confidence: SignalConfidence;
}

const FAMILY_SEED: Record<
  SignalFamily,
  {
    coverage: number; // share of enriched customers carrying the family
    delta: number;
    confidence: { strong: number; likely: number; emerging: number };
    signals: SeedSignal[];
  }
> = {
  spending_habit: {
    coverage: 0.94,
    delta: 1.4,
    confidence: { strong: 61, likely: 29, emerging: 10 },
    signals: [
      { label: "Weeknight delivery habit", share: 0.21, delta: 2.6, confidence: "strong", evidence: "Delivery platforms three-plus weeknights, same window" },
      { label: "Frequent leisure traveler", share: 0.16, delta: 4.1, confidence: "strong", evidence: "Non-corporate fares plus hotel stays across seasons" },
      { label: "Fitness studio regular", share: 0.13, delta: 1.2, confidence: "strong", evidence: "Recurring studio dues alongside athletic retail" },
      { label: "Streaming and software stack", share: 0.12, delta: 1.8, confidence: "strong", evidence: "Ten-plus recurring digital subscriptions on one profile" },
      { label: "Premium grocery preference", share: 0.11, delta: -0.6, confidence: "likely", evidence: "Basket mix skews specialty grocers over value chains" },
      { label: "Style and beauty regular", share: 0.096, delta: 2.4, confidence: "likely", evidence: "Salon cadence with apparel and cosmetics refreshes" },
      { label: "Weekend cyclist", share: 0.084, delta: 3.2, confidence: "likely", evidence: "Bike shop and route-app charges clustered on Saturdays" },
      { label: "Live events and culture goer", share: 0.072, delta: 2.9, confidence: "likely", evidence: "Venue and museum ticketing repeated across seasons" },
      { label: "Quarterly business travel", share: 0.067, delta: 2.1, confidence: "strong", evidence: "Repeat weekday fares on the same corridor" },
      { label: "Pet owner", share: 0.058, delta: 0.9, confidence: "strong", evidence: "Recurring pet supply deliveries and grooming visits" },
      { label: "Home improvement project", share: 0.043, delta: 5.4, confidence: "emerging", evidence: "Trade supply and contractor payments over two cycles" },
    ],
  },
  life_event: {
    coverage: 0.27,
    delta: 3.8,
    confidence: { strong: 44, likely: 38, emerging: 18 },
    signals: [
      { label: "College-bound child", share: 0.052, delta: 6.3, confidence: "strong", evidence: "Test prep, campus visits and admissions fees" },
      { label: "First home purchase underway", share: 0.041, delta: 3.1, confidence: "strong", evidence: "Inspection, appraisal and escrow-related payments" },
      { label: "New baby at home", share: 0.036, delta: 2.4, confidence: "strong", evidence: "Pediatric visits and infant supply subscriptions" },
      { label: "Retirement in sight", share: 0.029, delta: 1.8, confidence: "likely", evidence: "Payroll tapering with benefit-plan servicing activity" },
      { label: "Relocation considered", share: 0.024, delta: 4.7, confidence: "emerging", evidence: "Long-distance movers and a new-metro utility setup" },
      { label: "Wedding in planning", share: 0.019, delta: 3.9, confidence: "likely", evidence: "Venue deposits and bridal-category merchants" },
      { label: "Starting a business", share: 0.016, delta: 5.1, confidence: "likely", evidence: "Formation filings with new merchant-services onboarding" },
      { label: "Caring for a parent", share: 0.011, delta: 1.4, confidence: "emerging", evidence: "Senior care and medical transport charges recurring" },
      { label: "Windfall or inheritance", share: 0.008, delta: 2.6, confidence: "emerging", evidence: "One-time inflow paired with estate or trust servicing" },
    ],
  },
  financial: {
    coverage: 0.58,
    delta: 2.1,
    confidence: { strong: 68, likely: 25, emerging: 7 },
    signals: [
      { label: "Steady primary income", share: 0.31, delta: 0.5, confidence: "strong", evidence: "Employer payroll landing on a consistent cadence" },
      { label: "Mortgage servicing elsewhere", share: 0.14, delta: 1.1, confidence: "strong", evidence: "Monthly servicer debit to an outside lender" },
      { label: "Deposit balances trending up", share: 0.12, delta: 2.2, confidence: "strong", evidence: "Checking and savings growing across recent statements" },
      { label: "Auto loan maturing soon", share: 0.096, delta: 5.2, confidence: "strong", evidence: "Outside servicer tradeline nearing term" },
      { label: "Retirement money held away", share: 0.083, delta: 2.7, confidence: "strong", evidence: "Outside retirement rail with no rollover here" },
      { label: "Room on existing credit lines", share: 0.074, delta: 0.8, confidence: "strong", evidence: "Revolving utilization comfortably below limits" },
      { label: "Brokerage contributions outbound", share: 0.061, delta: 3.4, confidence: "strong", evidence: "Scheduled transfers to a third-party brokerage" },
      { label: "Chasing a better rate", share: 0.047, delta: 4.6, confidence: "likely", evidence: "Balances drifting toward outside high-yield" },
      { label: "Business banking elsewhere", share: 0.026, delta: 2.3, confidence: "likely", evidence: "Merchant settlement deposits from an outside bank" },
    ],
  },
  demographic: {
    coverage: 0.71,
    delta: 0.6,
    confidence: { strong: 57, likely: 33, emerging: 10 },
    signals: [
      { label: "Likely homeowner", share: 0.24, delta: 0.5, confidence: "strong", evidence: "Mortgage servicing with home improvement and HOA spend" },
      { label: "Dual-income household", share: 0.19, delta: 0.4, confidence: "strong", evidence: "Two payroll rails on different cycles" },
      { label: "High-income urban renter", share: 0.12, delta: 1.9, confidence: "strong", evidence: "Metro rent debit with no mortgage servicing" },
      { label: "Parent of young children", share: 0.094, delta: 1.1, confidence: "strong", evidence: "Daycare, pediatric and infant-category volume" },
      { label: "Multi-generation household", share: 0.074, delta: 0.8, confidence: "likely", evidence: "Care, tuition and senior spend under one address" },
      { label: "Income trajectory rising", share: 0.058, delta: 3.6, confidence: "likely", evidence: "Payroll step-ups across consecutive quarters" },
      { label: "Young professional", share: 0.049, delta: 1.5, confidence: "likely", evidence: "Early-career payroll with high discretionary mix" },
      { label: "Household with school-age kids", share: 0.038, delta: 0.6, confidence: "strong", evidence: "School fees and youth activity merchants" },
      { label: "Pre-retiree or empty nester", share: 0.034, delta: 1.2, confidence: "likely", evidence: "Benefit-plan servicing with no dependent-linked spend" },
      { label: "Self-employed income", share: 0.027, delta: 2.8, confidence: "emerging", evidence: "Irregular deposits from platform payors" },
      { label: "Small business owner", share: 0.022, delta: 3.3, confidence: "likely", evidence: "Merchant-services volume with wholesale supplier payments" },
      { label: "Multi-property household", share: 0.016, delta: 1.6, confidence: "likely", evidence: "Two or more distinct property tax or HOA streams" },
      { label: "Private-client profile", share: 0.009, delta: 2.0, confidence: "emerging", evidence: "Advisory and trust-service fees on the profile" },
    ],
  },
  risk: {
    coverage: 0.13,
    delta: -1.2,
    confidence: { strong: 31, likely: 41, emerging: 28 },
    signals: [
      { label: "Card utilization creeping", share: 0.048, delta: 2.2, confidence: "likely", evidence: "Revolving balance up two straight cycles" },
      { label: "Cash buffer thinning", share: 0.033, delta: -1.6, confidence: "likely", evidence: "End-of-month balance trending toward zero" },
      { label: "Large cash left uninvested", share: 0.027, delta: 0.9, confidence: "strong", evidence: "Idle deposit balance well above spend needs" },
      { label: "Recurring sports wagering", share: 0.024, delta: 3.4, confidence: "likely", evidence: "Repeat sportsbook debits across multiple weeks" },
      { label: "Short credit history", share: 0.019, delta: -0.3, confidence: "emerging", evidence: "Thin tradeline depth relative to income band" },
      { label: "Casino and table-game activity", share: 0.017, delta: 1.1, confidence: "likely", evidence: "Resort and casino floor charges on repeat trips" },
      { label: "Income volatility", share: 0.015, delta: 1.7, confidence: "likely", evidence: "Deposit amounts swinging cycle over cycle" },
      { label: "Overdraft frequency rising", share: 0.011, delta: 2.9, confidence: "emerging", evidence: "Repeat negative-balance days within a quarter" },
      { label: "Short-term lender outflows", share: 0.0094, delta: 2.4, confidence: "likely", evidence: "Payday or installment lender debits on a monthly cycle" },
      { label: "Offshore gaming platforms", share: 0.0071, delta: 1.9, confidence: "emerging", evidence: "Settlements to books outside domestic licensing" },
      { label: "Crypto exposure concentrated", share: 0.0063, delta: 4.2, confidence: "emerging", evidence: "Sustained exchange funding relative to liquid balances" },
      { label: "Structuring-pattern deposits", share: 0.0038, delta: 0.6, confidence: "likely", evidence: "Repeat cash deposits clustered under reporting thresholds" },
      { label: "Cross-border wire pattern", share: 0.0029, delta: 1.3, confidence: "emerging", evidence: "Recurring international wires outside the home footprint" },
      { label: "Adult-category processors", share: 0.0021, delta: -0.4, confidence: "emerging", evidence: "Recurring charges from adult-content payment processors" },
    ],
  },
};


/** Deterministic pseudo-trend series derived from a string key. */
function seriesFor(key: string, points = 12, drift = 0): number[] {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    h = (h * 1103515245 + 12345) % 2147483648;
    const noise = (h / 2147483648) * 0.4 - 0.2;
    out.push(Number((1 + noise + (drift / 100) * (i / points)).toFixed(4)));
  }
  return out;
}

export function getSignalCoverage(): SignalCoverageStats {
  const profilesEnriched = ENRICHED_PROFILES;
  return {
    totalCustomers: TOTAL_CUSTOMERS,
    profilesEnriched,
    coveragePct: (profilesEnriched / TOTAL_CUSTOMERS) * 100,
    signals24h: Math.round(4_820_000 * REBASE),
    avgSignalsPerCustomer: 6.4,
    lifeEventsActive: Math.round(profilesEnriched * FAMILY_SEED.life_event.coverage),
    externalSignals24h: Math.round(1_140_000 * REBASE),
    strongPct: 58.2,
  };
}


export function getSignalFamilyStats(): SignalFamilyStats[] {
  const { profilesEnriched } = getSignalCoverage();
  return SIGNAL_FAMILY_META.map((meta) => {
    const seed = FAMILY_SEED[meta.key];
    // Sub-signals are a subset of the family: their shares can never exceed the
    // family coverage. Normalize down when a seed set overshoots (e.g. risk).
    const seedSum = seed.signals.reduce((n, s) => n + s.share, 0);
    const fit = seedSum > seed.coverage ? (seed.coverage * 0.92) / seedSum : 1;
    return {
      key: meta.key,
      label: meta.label,
      chip: meta.chip,
      dot: meta.dot,
      tint: meta.tint,
      cardBorder: meta.cardBorder,
      cardBorderHover: meta.cardBorderHover,
      cardRing: meta.cardRing,
      sparklineColor: meta.sparkline,
      barStrong: meta.barStrong,
      barLikely: meta.barLikely,
      barEmerging: meta.barEmerging,
      rowHover: meta.rowHover,
      rowHoverBorder: meta.rowHoverBorder,
      openText: meta.openText,
      customers: Math.round(profilesEnriched * seed.coverage),
      delta: seed.delta,
      confidence: seed.confidence,
      sparkline: seriesFor(meta.key, 14, seed.delta * 4),
      topSignals: seed.signals.map((s) => ({
        label: s.label,
        customers: Math.round(profilesEnriched * s.share * fit),
        delta: s.delta,
        evidence: s.evidence,
        confidence: mixFor(`${meta.key}:${s.label}`, s.confidence),
        trend: seriesFor(`${meta.key}:${s.label}`, 10, s.delta * 3),
      })),
    };
  });
}


export interface StreamSignal {
  signal: string;
  evidence: string;
  family: SignalFamily;
  source: "internal" | "external";
}

export const SIGNAL_STREAM: StreamSignal[] = [
  { signal: "Quarterly business trip to Chicago", evidence: "Repeat weekday fares on the same corridor", family: "spending_habit", source: "internal" },
  { signal: "Auto loan maturing in ~2 months", evidence: "Outside servicer tradeline nearing term", family: "financial", source: "external" },
  { signal: "College-bound child", evidence: "Test prep, campus visits and admissions fees", family: "life_event", source: "internal" },
  { signal: "Second property in play", evidence: "Property records show a new title search", family: "life_event", source: "external" },
  { signal: "Weekend cyclist", evidence: "Bike shop and route-app charges every Saturday", family: "spending_habit", source: "internal" },
  { signal: "Retirement money held away", evidence: "Outside retirement rail with no rollover here", family: "financial", source: "internal" },
  { signal: "Dual-income household", evidence: "Two payroll rails on different cycles", family: "demographic", source: "internal" },
  { signal: "Card utilization creeping", evidence: "Revolving balance up two straight cycles", family: "risk", source: "internal" },
  { signal: "Dog owner", evidence: "Recurring pet supply deliveries and grooming", family: "spending_habit", source: "internal" },
  { signal: "Relocation considered", evidence: "Housing searches concentrated in one new metro", family: "life_event", source: "external" },
  { signal: "Chasing a better rate", evidence: "Balances drifting toward outside high-yield", family: "financial", source: "internal" },
  { signal: "Wine collector", evidence: "Specialist merchant purchases each quarter", family: "spending_habit", source: "internal" },
];

export function getTaxonomyCoverage(): TaxonomyCoverage {
  return {
    pillars: 12,
    tiers: 3,
    merchantResolutionPct: 97.3,
    unclassifiedPct: 2.7,
    labelsInVocabulary: 1_840,
    newLabels30d: 62,
  };
}

export const EXTERNAL_SOURCES: ExternalSourceStat[] = [
  { name: "Bureau tradelines", kind: "Credit", signalsAdded: "Loan maturity, outside balances", matchRate: 94.1 },
  { name: "Property records", kind: "Property", signalsAdded: "Title searches, new ownership", matchRate: 88.6 },
  { name: "Auto registries", kind: "Auto", signalsAdded: "Lease end, vehicle change", matchRate: 81.2 },
  { name: "Household demographics", kind: "Demographics", signalsAdded: "Composition and income band shifts", matchRate: 90.4 },
];

export function fmtCount(n: number): string {
  return fmtBookCount(n);
}

