// Deterministic representative-profile synthesis for the Segments sub-tab.
// The live fixture holds 16 real profiles; an exported signal cohort can number
// in the millions. To keep the demo honest but legible we render a fixed set of
// clearly-labelled illustrative profiles alongside the real matches.
// Everything is seeded from the segment label so the same segment always
// produces the same sample.

import type {
  ConfidenceBand,
  DirectoryCustomer,
  DirectorySignal,
  SignalFamily,
} from "@/lib/customerDirectoryData";
import type { SignalSegmentSeed } from "@/lib/intelligenceSignalStats";

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Marcus", "Elena", "David", "Priya", "James", "Sofia", "Andre", "Grace",
  "Tom", "Nadia", "Chris", "Mei", "Jordan", "Isabel", "Sam", "Rachel",
  "Victor", "Amara", "Ben", "Lily", "Omar", "Kate", "Diego", "Hannah",
];
const LAST = [
  "Thompson", "Reyes", "Kim", "Patel", "Sullivan", "Nguyen", "Brooks", "Ortiz",
  "Fischer", "Adeyemi", "Romano", "Chen", "Walsh", "Haddad", "Peterson", "Larsen",
  "Moreau", "Silva", "Bakker", "Quinn", "Aldana", "Mercer", "Yamada", "Frost",
];
const CITIES = [
  "Austin, TX", "Charlotte, NC", "Columbus, OH", "Tampa, FL", "Denver, CO",
  "Raleigh, NC", "Phoenix, AZ", "Nashville, TN", "Madison, WI", "Boise, ID",
  "Atlanta, GA", "Minneapolis, MN", "San Diego, CA", "Pittsburgh, PA",
];
const SEGMENTS = [
  "Mass Affluent", "Emerging Affluent", "Established Families", "Young Professionals",
  "Pre-Retirees", "Small Business Owners", "Suburban Households", "Urban Professionals",
];
const AGE_BANDS = ["25-34", "35-44", "45-54", "55-64"];
const PRODUCTS_POOL = [
  "Checking", "Savings", "Credit Card", "Auto Loan", "Mortgage",
  "HELOC", "Investment Account", "Personal Loan", "CD", "Small Business Checking",
];
const TENURES = ["2 yrs", "4 yrs", "6 yrs", "8 yrs", "11 yrs", "14 yrs"];
const ACTIVITY = ["Today", "Yesterday", "2 days ago", "3 days ago", "This week"];

type Tier = DirectoryCustomer["tier"];
const TIER_BY_FAMILY: Record<SignalFamily, Tier[]> = {
  spending_habit: ["Mass", "Preferred", "Preferred", "Premier"],
  life_event: ["Preferred", "Premier", "Premier", "Private"],
  financial: ["Preferred", "Premier", "Premier", "Private"],
  demographic: ["Mass", "Mass", "Preferred", "Premier"],
  risk: ["Mass", "Mass", "Preferred", "Mass"],
};
const VALUE_BY_TIER: Record<Tier, [number, number]> = {
  Mass: [18, 90],
  Preferred: [95, 380],
  Premier: [420, 950],
  Private: [1.1 * 1000, 3.4 * 1000], // stored in K
};

const FILLER: Record<SignalFamily, DirectorySignal[]> = {
  life_event: [
    { label: "Address change pattern", evidence: "Recent address-related activity across accounts", confidence: "Likely" },
    { label: "New dependent signals", evidence: "First-time spending in family categories", confidence: "Emerging" },
  ],
  financial: [
    { label: "Growing deposit balance", evidence: "Balances trending up over recent cycles", confidence: "Likely" },
    { label: "External loan payment", evidence: "Recurring transfer to an outside lender", confidence: "Strong" },
  ],
  spending_habit: [
    { label: "Weekend dining pattern", evidence: "Consistent weekend restaurant activity", confidence: "Strong" },
    { label: "Subscription stacking", evidence: "Multiple recurring digital subscriptions", confidence: "Likely" },
  ],
  demographic: [
    { label: "Dual-income household", evidence: "Two recurring payroll deposits detected", confidence: "Likely" },
    { label: "Urban professional", evidence: "Spending pattern matches dense metro lifestyle", confidence: "Emerging" },
  ],
  risk: [
    { label: "Balance trending down", evidence: "Deposit balances declining across recent cycles", confidence: "Emerging" },
  ],
};

const FAMILY_FIELD = {
  life_event: "lifeEvents",
  financial: "financialSignals",
  spending_habit: "spendingHabits",
  demographic: "demographicSignals",
  risk: "riskFlags",
} as const;

const ACTIONS: Record<SignalFamily, string[]> = {
  spending_habit: ["Align rewards with current spending pattern", "Review card fit at next interaction"],
  life_event: ["Reach out while the life event is fresh", "Prepare relevant product options ahead of contact"],
  financial: ["Review consolidation options before renewal", "Benchmark current rate against portfolio offers"],
  demographic: ["Tailor channel preference for outreach", "Include in the next targeted campaign wave"],
  risk: ["Review account before any outreach", "Monitor balances for another cycle"],
};

function confidenceFor(rnd: () => number, seed: SignalSegmentSeed): ConfidenceBand {
  const { strong, likely } = seed.confidence;
  const roll = rnd() * 100;
  if (roll < strong) return "Strong";
  if (roll < strong + likely) return "Likely";
  return "Emerging";
}

/**
 * Build `count` illustrative profiles that all carry the exported segment's
 * signal. Real fixture customers are NOT included — callers prepend them.
 */
export function synthesizeSegmentSample(seed: SignalSegmentSeed, count = 24): DirectoryCustomer[] {
  const rnd = mulberry32(hashSeed(`${seed.family}:${seed.label}`));
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const tiers = TIER_BY_FAMILY[seed.family];
  const field = FAMILY_FIELD[seed.family];

  const usedNames = new Set<string>();
  const out: DirectoryCustomer[] = [];

  for (let i = 0; i < count; i++) {
    let name = `${pick(FIRST)} ${pick(LAST)}`;
    while (usedNames.has(name)) name = `${pick(FIRST)} ${pick(LAST)}`;
    usedNames.add(name);

    const tier = pick(tiers);
    const [lo, hi] = VALUE_BY_TIER[tier];
    const valueK = lo + rnd() * (hi - lo);
    const relationshipValue =
      valueK >= 1000 ? `$${(valueK / 1000).toFixed(1)}M` : `$${Math.round(valueK)}k`;

    const products: string[] = [];
    const nProducts = 2 + Math.floor(rnd() * 3);
    while (products.length < nProducts) {
      const p = pick(PRODUCTS_POOL);
      if (!products.includes(p)) products.push(p);
    }

    const primary: DirectorySignal = {
      label: seed.label,
      evidence: seed.evidence || "Detected across recent account activity",
      confidence: confidenceFor(rnd, seed),
    };

    const customer: DirectoryCustomer = {
      id: `syn-${hashSeed(name + seed.label).toString(36)}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z ]/g, "").replace(/ +/g, ".")}@example.com`,
      city: pick(CITIES),
      ageBand: pick(AGE_BANDS),
      segment: pick(SEGMENTS),
      tier,
      tenure: pick(TENURES),
      relationshipValue,
      products,
      lastActivity: pick(ACTIVITY),
      lifeEvents: [],
      financialSignals: [],
      spendingHabits: [],
      demographicSignals: [],
      riskFlags: [],
      nextActions: ACTIONS[seed.family],
      synthetic: true,
    };
    customer[field] = [primary];

    // 0-2 filler signals in other families for a realistic pills row.
    const others = (Object.keys(FILLER) as SignalFamily[]).filter((f) => f !== seed.family);
    const nExtra = Math.floor(rnd() * 3);
    for (let j = 0; j < nExtra; j++) {
      const fam = pick(others);
      const filler = pick(FILLER[fam]);
      const target = customer[FAMILY_FIELD[fam]];
      if (!target.some((x) => x.label === filler.label)) target.push({ ...filler });
    }

    out.push(customer);
  }
  return out;
}
