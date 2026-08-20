// Deterministic portfolio-level signal statistics for the Intelligence Database
// overview. Pure mock math derived from the canonical signal vocabularies — no
// LLM, no backend. Copy stays "vaguely specific": no exact per-customer amounts.

import { SIGNAL_FAMILY_META, type SignalFamily } from "@/lib/customerDirectoryData";

export interface SignalRollup {
  label: string;
  customers: number;
  delta: number; // 24h % change
}

export interface SignalFamilyStats {
  key: SignalFamily;
  label: string;
  chip: string;
  dot: string;
  /** Customers carrying at least one signal in this family. */
  customers: number;
  delta: number;
  topSignals: SignalRollup[];
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

const TOTAL_CUSTOMERS = 75_000_000;

const FAMILY_SEED: Record<
  SignalFamily,
  {
    coverage: number; // share of enriched customers carrying the family
    delta: number;
    confidence: { strong: number; likely: number; emerging: number };
    signals: { label: string; share: number; delta: number }[];
  }
> = {
  spending_habit: {
    coverage: 0.94,
    delta: 1.4,
    confidence: { strong: 61, likely: 29, emerging: 10 },
    signals: [
      { label: "Weeknight delivery habit", share: 0.21, delta: 2.6 },
      { label: "Frequent leisure traveler", share: 0.16, delta: 4.1 },
      { label: "Fitness studio regular", share: 0.13, delta: 1.2 },
      { label: "Premium grocery preference", share: 0.11, delta: -0.6 },
    ],
  },
  life_event: {
    coverage: 0.27,
    delta: 3.8,
    confidence: { strong: 44, likely: 38, emerging: 18 },
    signals: [
      { label: "College-bound child", share: 0.052, delta: 6.3 },
      { label: "First home purchase underway", share: 0.041, delta: 3.1 },
      { label: "New baby at home", share: 0.036, delta: 2.4 },
      { label: "Retirement in sight", share: 0.029, delta: 1.8 },
    ],
  },
  financial: {
    coverage: 0.58,
    delta: 2.1,
    confidence: { strong: 68, likely: 25, emerging: 7 },
    signals: [
      { label: "Mortgage servicing elsewhere", share: 0.14, delta: 1.1 },
      { label: "Auto loan maturing soon", share: 0.096, delta: 5.2 },
      { label: "Retirement money held away", share: 0.083, delta: 2.7 },
      { label: "Brokerage contributions outbound", share: 0.061, delta: 3.4 },
    ],
  },
  demographic: {
    coverage: 0.71,
    delta: 0.6,
    confidence: { strong: 57, likely: 33, emerging: 10 },
    signals: [
      { label: "Dual-income household", share: 0.19, delta: 0.4 },
      { label: "High-income urban renter", share: 0.12, delta: 1.9 },
      { label: "Multi-generation household", share: 0.074, delta: 0.8 },
      { label: "Income trajectory rising", share: 0.058, delta: 3.6 },
    ],
  },
  risk: {
    coverage: 0.13,
    delta: -1.2,
    confidence: { strong: 31, likely: 41, emerging: 28 },
    signals: [
      { label: "Card utilization creeping", share: 0.048, delta: 2.2 },
      { label: "Cash buffer thinning", share: 0.033, delta: -1.6 },
      { label: "Large cash left uninvested", share: 0.027, delta: 0.9 },
      { label: "Short credit history", share: 0.019, delta: -0.3 },
    ],
  },
};

export function getSignalCoverage(): SignalCoverageStats {
  const profilesEnriched = 71_400_000;
  return {
    totalCustomers: TOTAL_CUSTOMERS,
    profilesEnriched,
    coveragePct: (profilesEnriched / TOTAL_CUSTOMERS) * 100,
    signals24h: 4_820_000,
    avgSignalsPerCustomer: 6.4,
    lifeEventsActive: Math.round(profilesEnriched * FAMILY_SEED.life_event.coverage),
    externalSignals24h: 1_140_000,
    strongPct: 58.2,
  };
}

export function getSignalFamilyStats(): SignalFamilyStats[] {
  const { profilesEnriched } = getSignalCoverage();
  return SIGNAL_FAMILY_META.map((meta) => {
    const seed = FAMILY_SEED[meta.key];
    return {
      key: meta.key,
      label: meta.label,
      chip: meta.chip,
      dot: meta.dot,
      customers: Math.round(profilesEnriched * seed.coverage),
      delta: seed.delta,
      confidence: seed.confidence,
      topSignals: seed.signals.map((s) => ({
        label: s.label,
        customers: Math.round(profilesEnriched * s.share),
        delta: s.delta,
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
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}
