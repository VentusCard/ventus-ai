// Static demo data for Next-product cohort × product roll-up.
// Conceptually a roll-up of Automated Flows output: each cohort's score per
// product reflects how often the corresponding automated flows are firing
// across that cohort.

export interface ProductDef {
  id: string;
  name: string;
  short: string;
  category: "Lending" | "Wealth" | "Deposits" | "Cards" | "Insurance";
}

export const PRODUCTS: ProductDef[] = [
  { id: "heloc", name: "HELOC", short: "HELOC", category: "Lending" },
  { id: "auto-refi", name: "Auto Refinance", short: "Auto Refi", category: "Lending" },
  { id: "premium-card", name: "Premium Travel Card", short: "Premium Card", category: "Cards" },
  { id: "529", name: "529 College Plan", short: "529", category: "Wealth" },
  { id: "hysa", name: "High-Yield Savings", short: "HYSA", category: "Deposits" },
  { id: "wealth", name: "Wealth Advisory", short: "Wealth", category: "Wealth" },
  { id: "mortgage", name: "Mortgage Refi", short: "Mortgage", category: "Lending" },
  { id: "smb-line", name: "Small Biz Line", short: "SMB Line", category: "Lending" },
];

export interface CohortDef {
  id: string;
  name: string;
  lifeStage: "Young Pros" | "Families" | "Pre-Retirees" | "Retirees" | "SMB";
  pillar: string;
  audience: number;
  dominantPillars: string[];
  topSignals: { label: string; type: "behavioral" | "life-event" }[];
  /** product.id -> score 0-100 */
  scores: Record<string, number>;
  /** product.id -> list of automated flows feeding the score */
  feedingFlows: Record<string, string[]>;
  momentum: number; // -20..+30, weekly change in matched customers
}

export const COHORTS: CohortDef[] = [
  {
    id: "yp-travel",
    name: "Young Professionals — Travel-led",
    lifeStage: "Young Pros",
    pillar: "Travel",
    audience: 184_200,
    dominantPillars: ["Travel", "Dining", "Experiences"],
    topSignals: [
      { label: "Repeat international card spend", type: "behavioral" },
      { label: "Annual fare upgrade pattern", type: "behavioral" },
      { label: "First passport renewal", type: "life-event" },
    ],
    scores: { heloc: 14, "auto-refi": 24, "premium-card": 86, "529": 8, hysa: 62, wealth: 31, mortgage: 18, "smb-line": 11 },
    feedingFlows: {
      "premium-card": ["Premium Travel Card", "Lounge Access Upgrade", "FX Fee Eliminator"],
      hysa: ["Idle Cash Sweep"],
      wealth: ["First Brokerage Account"],
    },
    momentum: 18,
  },
  {
    id: "yp-urban",
    name: "Young Professionals — Urban Renters",
    lifeStage: "Young Pros",
    pillar: "Cards",
    audience: 221_800,
    dominantPillars: ["Dining", "Subscriptions", "Rideshare"],
    topSignals: [
      { label: "Rent-via-card pattern", type: "behavioral" },
      { label: "Subscription stack growth", type: "behavioral" },
    ],
    scores: { heloc: 6, "auto-refi": 12, "premium-card": 71, "529": 4, hysa: 78, wealth: 22, mortgage: 9, "smb-line": 6 },
    feedingFlows: {
      hysa: ["Idle Cash Sweep", "Emergency Fund Builder"],
      "premium-card": ["Everyday Cashback Upgrade"],
    },
    momentum: 12,
  },
  {
    id: "new-parents",
    name: "New Parents — Home-led",
    lifeStage: "Families",
    pillar: "Home",
    audience: 96_400,
    dominantPillars: ["Childcare", "Home", "Groceries"],
    topSignals: [
      { label: "Newborn / toddler expense cluster", type: "life-event" },
      { label: "Daycare ACH commitment", type: "behavioral" },
      { label: "Pediatric specialist copays", type: "life-event" },
    ],
    scores: { heloc: 48, "auto-refi": 22, "premium-card": 28, "529": 91, hysa: 64, wealth: 34, mortgage: 58, "smb-line": 8 },
    feedingFlows: {
      "529": ["529 College Savings Plan", "Education ACH Detector"],
      heloc: ["Home Improvement HELOC"],
      hysa: ["Emergency Fund Builder"],
    },
    momentum: 24,
  },
  {
    id: "growing-families",
    name: "Growing Families — School-aged",
    lifeStage: "Families",
    pillar: "Education",
    audience: 312_900,
    dominantPillars: ["Education", "Groceries", "Auto"],
    topSignals: [
      { label: "K-12 tuition / activity fees", type: "behavioral" },
      { label: "SUV / minivan purchase", type: "life-event" },
    ],
    scores: { heloc: 54, "auto-refi": 68, "premium-card": 24, "529": 82, hysa: 47, wealth: 29, mortgage: 41, "smb-line": 7 },
    feedingFlows: {
      "529": ["529 College Savings Plan"],
      "auto-refi": ["Auto Refinance Trigger"],
      heloc: ["Home Improvement HELOC"],
    },
    momentum: 9,
  },
  {
    id: "college-bound",
    name: "Families — College-bound Dependents",
    lifeStage: "Families",
    pillar: "Education",
    audience: 142_600,
    dominantPillars: ["Education", "Travel", "Retail"],
    topSignals: [
      { label: "Tuition ACH to universities", type: "behavioral" },
      { label: "Out-of-town travel to college towns", type: "life-event" },
    ],
    scores: { heloc: 64, "auto-refi": 18, "premium-card": 32, "529": 88, hysa: 41, wealth: 38, mortgage: 22, "smb-line": 6 },
    feedingFlows: {
      "529": ["529 College Savings Plan", "Education ACH Detector"],
      heloc: ["Tuition-bridge HELOC"],
    },
    momentum: 14,
  },
  {
    id: "movers",
    name: "Recent Movers — Suburban",
    lifeStage: "Families",
    pillar: "Home",
    audience: 78_300,
    dominantPillars: ["Home", "Furniture", "Utilities"],
    topSignals: [
      { label: "Title / closing payment", type: "life-event" },
      { label: "Big-box furnishing spike", type: "behavioral" },
    ],
    scores: { heloc: 84, "auto-refi": 26, "premium-card": 22, "529": 36, hysa: 39, wealth: 18, mortgage: 79, "smb-line": 7 },
    feedingFlows: {
      heloc: ["Home Improvement HELOC", "Furnishing Spend Detector"],
      mortgage: ["Mortgage Refi Watch"],
    },
    momentum: 21,
  },
  {
    id: "pre-retire-wealth",
    name: "Pre-Retirees — Wealth-led",
    lifeStage: "Pre-Retirees",
    pillar: "Wealth",
    audience: 168_500,
    dominantPillars: ["Wealth", "Health", "Travel"],
    topSignals: [
      { label: "Catch-up 401(k) contributions", type: "behavioral" },
      { label: "Estate-attorney engagement", type: "life-event" },
    ],
    scores: { heloc: 71, "auto-refi": 12, "premium-card": 34, "529": 8, hysa: 49, wealth: 92, mortgage: 18, "smb-line": 6 },
    feedingFlows: {
      wealth: ["Wealth Advisory Hand-off", "Estate Planning Trigger", "Catch-up Contribution Detector"],
      heloc: ["Equity-tap HELOC"],
    },
    momentum: 6,
  },
  {
    id: "retirees-income",
    name: "Retirees — Fixed Income",
    lifeStage: "Retirees",
    pillar: "Deposits",
    audience: 204_100,
    dominantPillars: ["Healthcare", "Travel", "Utilities"],
    topSignals: [
      { label: "Social Security ACH inbound", type: "behavioral" },
      { label: "Medicare premium deductions", type: "behavioral" },
    ],
    scores: { heloc: 41, "auto-refi": 8, "premium-card": 18, "529": 4, hysa: 84, wealth: 71, mortgage: 12, "smb-line": 4 },
    feedingFlows: {
      hysa: ["Idle Cash Sweep", "CD Ladder Builder"],
      wealth: ["Income Strategy Hand-off"],
    },
    momentum: 4,
  },
  {
    id: "smb-owners",
    name: "Small Biz Owners — Cards-led",
    lifeStage: "SMB",
    pillar: "Cards",
    audience: 64_700,
    dominantPillars: ["B2B", "Travel", "Software"],
    topSignals: [
      { label: "Co-mingled personal + biz spend", type: "behavioral" },
      { label: "Payroll ACH outbound", type: "behavioral" },
    ],
    scores: { heloc: 38, "auto-refi": 16, "premium-card": 64, "529": 12, hysa: 58, wealth: 28, mortgage: 22, "smb-line": 89 },
    feedingFlows: {
      "smb-line": ["Small Biz Line of Credit", "Payroll Smoothing Line"],
      "premium-card": ["Business Travel Card"],
    },
    momentum: 16,
  },
  {
    id: "smb-services",
    name: "Small Biz — Service Operators",
    lifeStage: "SMB",
    pillar: "Lending",
    audience: 41_200,
    dominantPillars: ["B2B", "Auto", "Equipment"],
    topSignals: [
      { label: "Equipment / supplier ACH outflows", type: "behavioral" },
      { label: "Fleet fuel spend pattern", type: "behavioral" },
    ],
    scores: { heloc: 32, "auto-refi": 54, "premium-card": 38, "529": 8, hysa: 44, wealth: 18, mortgage: 24, "smb-line": 81 },
    feedingFlows: {
      "smb-line": ["Small Biz Line of Credit", "Equipment Financing Trigger"],
      "auto-refi": ["Fleet Refinance"],
    },
    momentum: 11,
  },
  {
    id: "yp-saver",
    name: "Young Professionals — High Savers",
    lifeStage: "Young Pros",
    pillar: "Deposits",
    audience: 132_400,
    dominantPillars: ["Deposits", "Investing", "Dining"],
    topSignals: [
      { label: "Regular brokerage contributions", type: "behavioral" },
      { label: "Idle checking-account balance", type: "behavioral" },
    ],
    scores: { heloc: 11, "auto-refi": 18, "premium-card": 44, "529": 9, hysa: 88, wealth: 62, mortgage: 14, "smb-line": 5 },
    feedingFlows: {
      hysa: ["Idle Cash Sweep", "High-Yield Sweep"],
      wealth: ["First Brokerage Account", "Roth IRA Trigger"],
    },
    momentum: 19,
  },
  {
    id: "empty-nesters",
    name: "Empty Nesters — Home Equity Rich",
    lifeStage: "Pre-Retirees",
    pillar: "Home",
    audience: 88_900,
    dominantPillars: ["Home", "Travel", "Wealth"],
    topSignals: [
      { label: "Mortgage near payoff", type: "behavioral" },
      { label: "Renovation contractor ACH", type: "life-event" },
    ],
    scores: { heloc: 89, "auto-refi": 14, "premium-card": 52, "529": 6, hysa: 41, wealth: 68, mortgage: 34, "smb-line": 5 },
    feedingFlows: {
      heloc: ["Equity-tap HELOC", "Renovation HELOC"],
      wealth: ["Wealth Advisory Hand-off"],
      "premium-card": ["Premium Travel Card"],
    },
    momentum: 13,
  },
];

export function topProductFor(cohort: CohortDef): ProductDef {
  let best = PRODUCTS[0];
  let bestScore = -1;
  for (const p of PRODUCTS) {
    const s = cohort.scores[p.id] ?? 0;
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }
  return best;
}

export function rankedProductsFor(cohort: CohortDef, n = 5): { product: ProductDef; score: number }[] {
  return PRODUCTS.map((p) => ({ product: p, score: cohort.scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
