// Self-defined signal builder: catalogs, audience math, product fit, and outreach recommendation.
// Keeps everything client-side and deterministic so the demo is honest.

import { LIFE_EVENTS } from "@/types/segment";
import {
  FINANCIAL_SIGNAL_CHIPS,
  RISK_SIGNAL_CHIPS,
  DEMOGRAPHIC_SIGNAL_CHIPS,
  type SignalFamilyChip,
} from "@/lib/campaignSignalFamilies";
import { PRODUCT_FLOWS, type ProductFlow } from "@/lib/productAutomatedFlows";

export type SignalFamily = "life-event" | "behavioral" | "financial" | "demographic" | "risk";

export interface StudioSignal {
  id: string;
  family: SignalFamily;
  label: string;
  description: string;
  detectionRate: number;
  /** Tags used to score product fit. */
  productAffinity: string[];
}

const BASE_POPULATION = 250_000_000;

// ---------- Catalogs ----------

const LIFE_EVENT_AFFINITY: Record<string, string[]> = {
  retirement: ["wealth", "advisor", "annuity", "income"],
  education: ["529", "student-loan", "wealth"],
  family: ["529", "life-insurance", "deposits", "card-family"],
  home: ["mortgage", "heloc", "insurance"],
  elder_care: ["advisor", "insurance", "deposits"],
  business: ["sba", "treasury", "wealth"],
  wealth_transfer: ["wealth", "advisor", "trust"],
};

export const LIFE_EVENT_SIGNALS: StudioSignal[] = LIFE_EVENTS.map((e) => ({
  id: `life-${e.id}`,
  family: "life-event",
  label: e.name,
  description: `Detected ${e.name.toLowerCase()} pattern across transactions.`,
  detectionRate: e.detectionRate,
  productAffinity: LIFE_EVENT_AFFINITY[e.id] ?? [],
}));

export const BEHAVIORAL_SIGNAL_CHIPS: StudioSignal[] = [
  { id: "beh-luxury-travel", family: "behavioral", label: "Premium travel spend", description: "Recurring airline/hotel spend in premium fare classes.", detectionRate: 0.08, productAffinity: ["card-travel", "card-premium"] },
  { id: "beh-dining-frequent", family: "behavioral", label: "Frequent dining out", description: "High-frequency restaurant and delivery activity.", detectionRate: 0.31, productAffinity: ["card-cashback", "card-dining"] },
  { id: "beh-grocery-large", family: "behavioral", label: "Large grocery basket", description: "Above-cohort weekly grocery outflow.", detectionRate: 0.27, productAffinity: ["card-cashback", "card-family"] },
  { id: "beh-external-brokerage", family: "behavioral", label: "Funds external brokerage", description: "Outbound ACH to Schwab/Fidelity/Robinhood.", detectionRate: 0.14, productAffinity: ["wealth", "robo", "advisor"] },
  { id: "beh-recurring-subs", family: "behavioral", label: "Heavy subscription stack", description: "10+ active recurring digital subscriptions.", detectionRate: 0.22, productAffinity: ["card-cashback", "subscription"] },
  { id: "beh-fitness-wellness", family: "behavioral", label: "Wellness & fitness spend", description: "Studio fees, equipment, and supplement orders.", detectionRate: 0.16, productAffinity: ["card-cashback", "insurance"] },
  { id: "beh-gas-commuter", family: "behavioral", label: "Daily commuter pattern", description: "Workday gas and transit charges.", detectionRate: 0.34, productAffinity: ["card-cashback", "auto"] },
  { id: "beh-home-improvement", family: "behavioral", label: "Home improvement projects", description: "Sustained Home Depot/Lowe's and contractor spend.", detectionRate: 0.11, productAffinity: ["heloc", "mortgage"] },
  { id: "beh-charitable-giving", family: "behavioral", label: "Charitable giving cadence", description: "Recurring nonprofit and faith-based gifts.", detectionRate: 0.19, productAffinity: ["wealth", "advisor", "trust"] },
];

// Re-export chip lists augmented with family + affinity so scoring is uniform.
const FIN_AFFINITY: Record<string, string[]> = {
  "fin-payroll-direct-deposit": ["deposits", "card-cashback"],
  "fin-large-recent-inflow": ["wealth", "advisor", "deposits"],
  "fin-deposit-growth": ["wealth", "robo", "deposits"],
  "fin-investable-assets": ["wealth", "advisor", "trust"],
  "fin-low-credit-util": ["card-premium", "heloc", "mortgage"],
  "fin-mortgage-payer": ["heloc", "insurance", "wealth"],
};

const RISK_AFFINITY: Record<string, string[]> = {
  "risk-no-overdraft-90d": ["card-premium", "heloc", "mortgage"],
  "risk-no-fraud-flags": ["card-premium", "wealth"],
  "risk-stable-tenure": ["mortgage", "advisor", "wealth"],
  "risk-healthy-dti": ["mortgage", "heloc", "auto"],
  "risk-no-recent-decline": ["card-premium", "card-cashback"],
};

const DEMO_AFFINITY: Record<string, string[]> = {
  "demo-dual-income": ["mortgage", "wealth", "529"],
  "demo-single-income": ["deposits", "insurance"],
  "demo-parent-young-kids": ["529", "life-insurance", "card-family"],
  "demo-parent-school-age": ["529", "card-family"],
  "demo-empty-nester": ["wealth", "advisor", "annuity"],
  "demo-eldercare": ["advisor", "insurance"],
  "demo-likely-homeowner": ["heloc", "mortgage", "insurance"],
  "demo-likely-renter": ["card-cashback", "deposits"],
  "demo-recently-relocated": ["mortgage", "deposits", "card-cashback"],
  "demo-self-employed": ["sba", "treasury", "advisor"],
  "demo-pre-retiree": ["wealth", "advisor", "annuity", "income"],
  "demo-newly-partnered": ["mortgage", "deposits", "wealth"],
};

const toStudio = (
  chip: SignalFamilyChip,
  family: SignalFamily,
  affinityMap: Record<string, string[]>,
): StudioSignal => ({
  id: chip.id,
  family,
  label: chip.label,
  description: chip.description,
  detectionRate: chip.detectionRate,
  productAffinity: affinityMap[chip.id] ?? [],
});

export const FINANCIAL_SIGNALS: StudioSignal[] = FINANCIAL_SIGNAL_CHIPS.map((c) =>
  toStudio(c, "financial", FIN_AFFINITY),
);
export const RISK_SIGNALS: StudioSignal[] = RISK_SIGNAL_CHIPS.map((c) =>
  toStudio(c, "risk", RISK_AFFINITY),
);
export const DEMOGRAPHIC_SIGNALS: StudioSignal[] = DEMOGRAPHIC_SIGNAL_CHIPS.map((c) =>
  toStudio(c, "demographic", DEMO_AFFINITY),
);

export const SIGNAL_FAMILIES: { family: SignalFamily; label: string; description: string; signals: StudioSignal[] }[] = [
  { family: "life-event", label: "Life Event", description: "Major customer milestones detected from transaction patterns.", signals: LIFE_EVENT_SIGNALS },
  { family: "behavioral", label: "Behavioral", description: "How customers spend, save, and invest over time.", signals: BEHAVIORAL_SIGNAL_CHIPS },
  { family: "financial", label: "Financial", description: "Cash-flow, balances, and credit posture.", signals: FINANCIAL_SIGNALS },
  { family: "demographic", label: "Demographic (inferred)", description: "Household and livelihood patterns beyond KYC.", signals: DEMOGRAPHIC_SIGNALS },
  { family: "risk", label: "Risk", description: "Inclusion filters — audience meets ALL selected risk signals.", signals: RISK_SIGNALS },
];

// ---------- Audience math ----------

/**
 * Audience size = base × Π(detectionRate) with a partial-independence correction.
 * We dampen the product so stacking 5 narrow signals doesn't collapse to <1k.
 */
export function estimateAudience(selected: StudioSignal[]): number {
  if (selected.length === 0) return 0;
  let factor = 1;
  for (const s of selected) {
    // Soften via square root so signals partially overlap.
    factor *= Math.sqrt(Math.max(0.005, s.detectionRate));
  }
  // Risk signals act as inclusion-only filters and shouldn't over-collapse the audience.
  const riskCount = selected.filter((s) => s.family === "risk").length;
  if (riskCount > 0) factor *= Math.pow(1.4, riskCount); // partial offset
  return Math.max(1000, Math.floor(BASE_POPULATION * factor));
}

// ---------- Product fit ----------

const PRODUCT_TAGS: Record<string, string[]> = {
  "529-plan": ["529", "wealth"],
  "self-directed-brokerage": ["wealth", "robo"],
  "robo-portfolio": ["robo", "wealth"],
  "hybrid-advisor-portfolio": ["advisor", "wealth"],
  "private-wealth": ["advisor", "wealth", "trust"],
  "annuity": ["annuity", "income", "wealth"],
  "income-portfolio": ["income", "wealth", "annuity"],
  "mortgage": ["mortgage"],
  "heloc": ["heloc", "mortgage"],
  "auto-loan": ["auto"],
  "personal-loan": ["personal-loan"],
  "sba-loan": ["sba", "treasury"],
  "student-loan-refi": ["student-loan"],
  "hysa": ["deposits"],
  "checking-premium": ["deposits", "card-premium"],
  "cd-ladder": ["deposits", "income"],
  "treasury-cash-mgmt": ["treasury", "deposits"],
  "cashback-card": ["card-cashback"],
  "travel-card": ["card-travel", "card-premium"],
  "premium-card": ["card-premium"],
  "family-card": ["card-family", "card-cashback"],
  "dining-card": ["card-dining", "card-cashback"],
  "term-life": ["life-insurance", "insurance"],
  "umbrella-insurance": ["insurance"],
  "home-insurance": ["insurance"],
  "subscription-manager": ["subscription"],
};

function productTags(p: ProductFlow): string[] {
  // Prefer explicit tags; fall back to category-derived defaults.
  if (PRODUCT_TAGS[p.id]) return PRODUCT_TAGS[p.id];
  const cat = p.category.toLowerCase();
  if (cat === "wealth") return ["wealth"];
  if (cat === "lending") return ["mortgage", "heloc", "personal-loan"];
  if (cat === "deposits") return ["deposits"];
  if (cat === "cards") return ["card-cashback"];
  if (cat === "insurance") return ["insurance"];
  return [];
}

export interface ProductFit {
  product: ProductFlow;
  score: number;
  matchedSignals: StudioSignal[];
}

export function rankProductFits(selected: StudioSignal[], topN = 4): ProductFit[] {
  if (selected.length === 0) return [];
  const fits: ProductFit[] = PRODUCT_FLOWS.map((p) => {
    const tags = new Set(productTags(p));
    const matched = selected.filter((s) => s.productAffinity.some((t) => tags.has(t)));
    // Weight life-event + financial matches higher.
    const weight = matched.reduce((sum, s) => {
      const w = s.family === "life-event" ? 2.2
        : s.family === "financial" ? 1.6
        : s.family === "behavioral" ? 1.4
        : s.family === "demographic" ? 1.2
        : 0.6; // risk
      return sum + w;
    }, 0);
    return { product: p, score: weight, matchedSignals: matched };
  });
  return fits
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// ---------- Outreach recommendation ----------

export type OutreachChannel =
  | "Relationship-manager outreach"
  | "Personalized email"
  | "Mobile push + in-app card"
  | "SMS reactivation"
  | "Advisor call + secure message";

export interface OutreachRecommendation {
  primary: OutreachChannel;
  secondary: OutreachChannel;
  rationale: string;
}

export function recommendOutreach(
  selected: StudioSignal[],
  topFit?: ProductFit,
): OutreachRecommendation | null {
  if (selected.length === 0) return null;
  const fam = (f: SignalFamily) => selected.filter((s) => s.family === f).length;
  const lifeEvents = fam("life-event");
  const financial = fam("financial");
  const behavioral = fam("behavioral");
  const cat = topFit?.product.category;

  // Wealth-adjacent: humans first.
  if (cat === "Wealth" || (financial >= 2 && lifeEvents >= 1)) {
    return {
      primary: "Advisor call + secure message",
      secondary: "Personalized email",
      rationale: "High-value financial signals plus a life event — converts best with a named advisor, not a blast.",
    };
  }
  if (lifeEvents >= 1) {
    return {
      primary: "Personalized email",
      secondary: "Mobile push + in-app card",
      rationale: "Life event detected — narrative-rich email lands the relevance; push reinforces the offer in-app.",
    };
  }
  if (behavioral >= 2 && (cat === "Cards" || cat === "Deposits")) {
    return {
      primary: "Mobile push + in-app card",
      secondary: "Personalized email",
      rationale: "Behavioral spend signals correlate with engaged mobile users — in-app placement converts fastest.",
    };
  }
  if (cat === "Lending") {
    return {
      primary: "Relationship-manager outreach",
      secondary: "Personalized email",
      rationale: "Lending fit + qualified financials — branch RM follow-up lifts pull-through.",
    };
  }
  return {
    primary: "Personalized email",
    secondary: "SMS reactivation",
    rationale: "Light signal stack — start with low-cost email, then SMS for non-openers.",
  };
}

export function formatAudience(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}
