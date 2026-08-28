// Plain-language goal → campaign state. Keyword/tag scoring only, no LLM.

import { PRODUCT_CATALOG } from "@/lib/campaignStudioData";
import type { CatalogProduct } from "@/types/campaign-studio";
import { SIGNAL_FAMILIES, type StudioSignal } from "@/lib/signalStudio";

export interface GoalMatch {
  mode: "product" | "signals" | "outflow";
  product?: CatalogProduct;
  signals: StudioSignal[];
  explanation: string;
}

export const GOAL_SUGGESTIONS = [
  "Grow deposits from customers who just received a windfall",
  "Win back spend that's leaking to another card",
  "Reach parents with a college-bound teenager",
  "Move idle checking balances into savings",
  "Find homeowners with equity they aren't using",
];

const PRODUCT_KEYWORDS: Record<string, string[]> = {
  "High-Yield Savings": ["deposit", "deposits", "savings", "save", "idle", "balance", "balances", "windfall", "cash", "yield", "rate"],
  Checking: ["checking", "direct deposit", "payroll", "primary bank"],
  CD: ["cd", "certificate", "lock", "term"],
  "Money Market": ["money market", "liquid"],
  Travel: ["travel", "trip", "flight", "airline", "hotel", "vacation"],
  "Premium Travel": ["premium", "luxury travel", "lounge", "affluent traveler"],
  "Cashback (3/2/1)": ["cashback", "cash back", "everyday spend", "grocery", "dining", "leak", "leaking", "off-us", "win back", "winback", "another card", "competitor card"],
  "Custom Cashback": ["custom rewards", "category rewards"],
  Business: ["business owner", "small business", "self-employed", "entrepreneur"],
  Student: ["student", "college student", "campus"],
  Secured: ["build credit", "thin file", "rebuild"],
  "Home Mortgage": ["mortgage", "home purchase", "buying a home", "first-time buyer", "house"],
  HELOC: ["equity", "heloc", "home equity", "renovation", "remodel", "home improvement"],
  "Auto Loan": ["auto", "car", "vehicle", "auto loan"],
  "Personal Loan": ["personal loan", "consolidate", "debt"],
  "Debt Consolidation": ["consolidate", "high-interest", "debt"],
  "Small Business Loan": ["sba", "business loan", "working capital"],
  "Student Loan Refi": ["refinance student", "student debt"],
  "529 Plan": ["college", "tuition", "college-bound", "529", "education", "teenager", "school"],
  Brokerage: ["invest", "investing", "brokerage", "trading"],
  "Roth IRA": ["roth", "retirement", "ira"],
  "Traditional IRA": ["ira", "retirement", "rollover"],
  "Robo-Advisor": ["robo", "automated investing", "starter portfolio"],
  "Managed Portfolio": ["managed", "advisor", "wealth", "portfolio"],
  "Trust Account": ["trust", "estate", "inheritance", "wealth transfer"],
  "Life Insurance": ["life insurance", "protect family", "beneficiary", "new baby", "newborn"],
  "Home Insurance": ["home insurance", "homeowner coverage"],
  "Auto Insurance": ["auto insurance", "car insurance"],
  "Travel Insurance": ["travel insurance", "trip protection"],
  "Identity Theft Protection": ["identity", "fraud protection"],
  "Digital Wallet": ["wallet", "tap to pay", "apple pay"],
  "Mobile Banking Active": ["mobile app", "activate app", "digital engagement"],
  "Zelle/P2P Active": ["zelle", "p2p", "send money"],
  "Direct Deposit Active": ["direct deposit", "payroll switch"],
  "Bill Pay Active": ["bill pay", "autopay"],
  "Overdraft Protection": ["overdraft", "buffer"],
  Airline: ["airline", "miles"],
  Hotel: ["hotel", "points"],
  "Co-Branded Retail": ["retail card", "store card"],
  Savings: ["savings", "save more", "emergency fund"],
  "Business Checking": ["business checking"],
  "Business Savings": ["business savings"],
  "Youth/Teen": ["teen account", "kids account", "youth"],
  "Line of Credit": ["line of credit", "flexible borrowing"],
};

const OUTFLOW_HINTS = ["leak", "leaking", "outflow", "win back", "winback", "competitor", "another bank", "wallet share", "off-us", "external card"];

const SIGNAL_KEYWORDS: Record<string, string[]> = {
  windfall: ["fin-large-recent-inflow"],
  bonus: ["fin-large-recent-inflow"],
  inheritance: ["fin-large-recent-inflow", "fin-investable-assets"],
  college: ["demo-parent-school-age"],
  teenager: ["demo-parent-school-age"],
  tuition: ["demo-parent-school-age"],
  homeowner: ["demo-likely-homeowner", "fin-mortgage-payer"],
  equity: ["demo-likely-homeowner", "fin-mortgage-payer"],
  travel: ["beh-luxury-travel"],
  dining: ["beh-dining-frequent"],
  grocery: ["beh-grocery-large"],
  invest: ["beh-external-brokerage", "fin-investable-assets"],
  brokerage: ["beh-external-brokerage"],
  retirement: ["demo-pre-retiree"],
  "small business": ["demo-self-employed"],
  "self-employed": ["demo-self-employed"],
  subscription: ["beh-recurring-subs"],
  payroll: ["fin-payroll-direct-deposit"],
  "direct deposit": ["fin-payroll-direct-deposit"],
  idle: ["fin-deposit-growth"],
  savings: ["fin-deposit-growth"],
  commute: ["beh-gas-commuter"],
  renovation: ["beh-home-improvement"],
  moved: ["demo-recently-relocated"],
  relocat: ["demo-recently-relocated"],
};

const allSignals = (): StudioSignal[] => SIGNAL_FAMILIES.flatMap((f) => f.signals);

export function matchGoal(goalRaw: string): GoalMatch | null {
  const goal = goalRaw.trim().toLowerCase();
  if (goal.length < 4) return null;

  // Product scoring
  let best: { product: CatalogProduct; score: number; hits: string[] } | null = null;
  for (const product of PRODUCT_CATALOG) {
    const kws = PRODUCT_KEYWORDS[product.name] ?? [product.name.toLowerCase()];
    const hits = kws.filter((k) => goal.includes(k));
    const score = hits.reduce((s, k) => s + (k.includes(" ") ? 2.2 : 1), 0);
    if (score > 0 && (!best || score > best.score)) best = { product, score, hits };
  }

  // Signal matching
  const ids = new Set<string>();
  for (const [kw, sigIds] of Object.entries(SIGNAL_KEYWORDS)) {
    if (goal.includes(kw)) sigIds.forEach((id) => ids.add(id));
  }
  const signals = allSignals().filter((s) => ids.has(s.id));

  const isOutflow = OUTFLOW_HINTS.some((h) => goal.includes(h));

  if (isOutflow) {
    return {
      mode: "outflow",
      product: best?.product,
      signals,
      explanation: `Read as a wallet-share problem — opening the outflow view${best ? ` with ${best.product.name} as the recapture product` : ""}.`,
    };
  }

  if (best) {
    return {
      mode: "product",
      product: best.product,
      signals,
      explanation: `Matched "${best.hits.slice(0, 3).join('", "')}" → ${best.product.name}${signals.length ? `, pre-loading ${signals.length} supporting signal${signals.length > 1 ? "s" : ""}.` : "."}`,
    };
  }

  if (signals.length) {
    return {
      mode: "signals",
      signals,
      explanation: `No single product matched, but ${signals.length} signal${signals.length > 1 ? "s" : ""} did — starting from signals and letting the engine rank the products.`,
    };
  }

  return null;
}
