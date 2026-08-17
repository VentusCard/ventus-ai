// Expands each product flow's authored signals into a multi-signal,
// family-grouped targeting set across the five platform signal families:
// Life Event · Behavioral · Financial · Demographic · Risk.
//
// Authored life-event / behavioral signals live on PRODUCT_FLOWS. This layer
// adds product-relevant Financial, Demographic and Risk signals (and a few
// extra life-event / behavioral signals) so a family can hold several signals.
// All content is deterministic mock data — no backend calls.

import type { ProductFlow, FlowSignal } from "./productAutomatedFlows";
import { FLOW_MICROSEGMENTS, type FlowMicrosegment } from "./productMicrosegments";

export type SignalFamily = "life-event" | "behavioral" | "financial" | "demographic" | "risk";

export const SIGNAL_FAMILY_ORDER: SignalFamily[] = [
  "life-event",
  "behavioral",
  "financial",
  "demographic",
  "risk",
];

export const SIGNAL_FAMILY_LABEL: Record<SignalFamily, string> = {
  "life-event": "Life Event",
  behavioral: "Behavioral",
  financial: "Financial",
  demographic: "Demographic",
  risk: "Risk",
};

export const SIGNAL_FAMILY_CLASS: Record<SignalFamily, string> = {
  "life-event": "bg-amber-50 text-amber-700 border-amber-200",
  behavioral: "bg-blue-50 text-blue-700 border-blue-200",
  financial: "bg-emerald-50 text-emerald-700 border-emerald-200",
  demographic: "bg-violet-50 text-violet-700 border-violet-200",
  risk: "bg-slate-100 text-slate-600 border-slate-300",
};

export interface ExpandedSignal {
  id: string;
  label: string;
  evidence: string;
  family: SignalFamily;
  /** Relative reach weight used to split the flow audience across signals. */
  weight: number;
  /** Hyper-personalization payload shown when the signal is opened. */
  message: FlowMicrosegment;
  channels: string[];
}

interface SeedSignal {
  label: string;
  evidence: string;
  weight?: number;
}

/* ------------------------------------------------------------------ *
 * Product tagging — drives which supplemental signals a product gets. *
 * ------------------------------------------------------------------ */

type Tag =
  | "business"
  | "home"
  | "auto"
  | "education"
  | "retirement"
  | "invest"
  | "card"
  | "deposit"
  | "insurance"
  | "travel"
  | "credit"
  | "student"
  | "pet"
  | "health";

const TAG_PATTERNS: Array<[Tag, RegExp]> = [
  ["business", /business|sba|commercial|merchant|payroll|corporate|fleet|equipment|succession|key.person|workers|bop/i],
  ["home", /mortgage|heloc|home|refinanc|renovation|property|landlord|construction/i],
  ["auto", /auto|car|vehicle|rv|boat|marine|motorcycle|ev\b/i],
  ["education", /529|college|education|tuition|student/i],
  ["student", /student/i],
  ["retirement", /retire|401|ira|annuity|pension|rollover/i],
  ["invest", /invest|brokerage|portfolio|wealth|advisory|trust|robo|securities|sbl/i],
  ["card", /card|rewards|cash.back|miles/i],
  ["deposit", /checking|savings|deposit|cd\b|money market|hysa|sweep|certificate/i],
  ["insurance", /insur|life|umbrella|policy|coverage|comp\b/i],
  ["travel", /travel|miles|airline|passport/i],
  ["credit", /loan|credit|line of credit|financing|lending|consolidat/i],
  ["pet", /pet/i],
  ["health", /health|hsa|medical|dental|disability|care/i],
];

function tagsFor(flow: ProductFlow): Set<Tag> {
  const hay = `${flow.id} ${flow.name} ${flow.positioning}`;
  const tags = new Set<Tag>();
  for (const [tag, re] of TAG_PATTERNS) if (re.test(hay)) tags.add(tag);
  return tags;
}

/* ---------------------------- *
 * Supplemental signal library  *
 * ---------------------------- */

const FINANCIAL: Record<string, SeedSignal> = {
  payroll: {
    label: "Stable payroll deposits",
    evidence: "Recurring employer direct deposits on a predictable cadence for 6+ consecutive cycles.",
    weight: 0.55,
  },
  surplus: {
    label: "Surplus cash after fixed obligations",
    evidence: "Month-end balance consistently exceeds recurring rent/mortgage, utility and card outflows.",
    weight: 0.34,
  },
  depositGrowth: {
    label: "Deposit balances trending up",
    evidence: "Checking and savings balances rising across the trailing six statement cycles.",
    weight: 0.28,
  },
  idleCash: {
    label: "Idle cash above operating needs",
    evidence: "Sustained non-interest balances well above 3 months of observed outflow.",
    weight: 0.18,
  },
  lowUtil: {
    label: "Low revolving utilization",
    evidence: "Statement balances stay under a third of available revolving lines.",
    weight: 0.41,
  },
  mortgagePayer: {
    label: "Active mortgage servicer outflow",
    evidence: "Recurring monthly ACH to a mortgage servicer with escrow-shaped amount.",
    weight: 0.22,
  },
  autoPayer: {
    label: "Active auto loan / lease payment",
    evidence: "Fixed monthly ACH to a captive auto lender or lease administrator.",
    weight: 0.24,
  },
  externalInvestFunding: {
    label: "Funding held-away investments",
    evidence: "Recurring outbound ACH to third-party brokerage or advisory platforms.",
    weight: 0.16,
  },
  retirementContrib: {
    label: "Retirement contribution activity",
    evidence: "Payroll deferrals plus periodic ACH to IRA or rollover custodians.",
    weight: 0.19,
  },
  interestSeeking: {
    label: "Rate-seeking transfers out",
    evidence: "Balances migrating to high-yield accounts at other institutions.",
    weight: 0.13,
  },
  highInsuranceSpend: {
    label: "Meaningful premium outflow",
    evidence: "Multiple recurring insurance premium debits across carriers each month.",
    weight: 0.26,
  },
  bizRevenue: {
    label: "Business revenue settlements",
    evidence: "Recurring card-processor settlements (Stripe / Square / merchant acquirer) into the account.",
    weight: 0.09,
  },
  bizTaxes: {
    label: "Estimated tax payments",
    evidence: "Quarterly IRS / state estimated tax debits consistent with pass-through income.",
    weight: 0.07,
  },
  tuitionOutflow: {
    label: "Tuition outflow on file",
    evidence: "Recurring ACH or bill-pay to academic institutions outside the public-school calendar.",
    weight: 0.11,
  },
  travelSpend: {
    label: "Sustained travel spend",
    evidence: "Airline, hotel and rideshare spend across multiple trips in the trailing year.",
    weight: 0.17,
  },
};

const DEMOGRAPHIC: Record<string, SeedSignal> = {
  dualIncome: {
    label: "Dual-income household",
    evidence: "Two distinct recurring payroll deposits landing in the same household relationship.",
    weight: 0.34,
  },
  parentYoung: {
    label: "Parent of young children",
    evidence: "Childcare tuition, pediatric copays and juvenile retail in a repeating monthly pattern.",
    weight: 0.21,
  },
  parentSchoolAge: {
    label: "Parent of school-age children",
    evidence: "School fees, youth-sports registrations and K-12 supply spend on an academic cadence.",
    weight: 0.19,
  },
  homeowner: {
    label: "Likely homeowner",
    evidence: "Property tax, home insurance and hardware-retail spend alongside servicer payments.",
    weight: 0.46,
  },
  renter: {
    label: "Likely renter",
    evidence: "Recurring rent ACH with renters-insurance premium and no mortgage activity on file.",
    weight: 0.32,
  },
  preRetiree: {
    label: "Pre-retiree",
    evidence: "Peak earnings alongside catch-up deferrals and advisory-fee debits.",
    weight: 0.13,
  },
  youngProfessional: {
    label: "Early-career professional",
    evidence: "First sustained payroll stream with student-loan servicing and urban-transit spend.",
    weight: 0.17,
  },
  selfEmployed: {
    label: "Self-employed / 1099 earner",
    evidence: "Irregular inbound deposits from multiple payers with quarterly tax outflow.",
    weight: 0.11,
  },
  ownerOperator: {
    label: "Owner-operator household",
    evidence: "Business settlements and payroll runs commingled with personal household spend.",
    weight: 0.06,
  },
  multiVehicle: {
    label: "Multi-vehicle household",
    evidence: "Two or more distinct auto insurance premiums and separate fuel-station patterns.",
    weight: 0.15,
  },
  affluentHousehold: {
    label: "Affluent household profile",
    evidence: "Premium-tier merchant mix with advisory fees and private-club or concierge spend.",
    weight: 0.08,
  },
  petOwner: {
    label: "Pet-owning household",
    evidence: "Recurring veterinary, grooming and pet-retail spend across the trailing year.",
    weight: 0.23,
  },
  relocated: {
    label: "Recently relocated",
    evidence: "Sustained merchant-footprint shift into a new metro with utility set-up spend.",
    weight: 0.07,
  },
  emptyNester: {
    label: "Empty nester",
    evidence: "Family-category outflow drops while travel and dining discretionary recovers.",
    weight: 0.14,
  },
};

const RISK: Record<string, SeedSignal> = {
  noOverdraft: {
    label: "No overdraft or NSF (90d)",
    evidence: "Zero overdraft, NSF or returned-item events across the trailing 90 days.",
    weight: 0.78,
  },
  healthyDti: {
    label: "Healthy debt service ratio",
    evidence: "Observed debt-service outflow comfortably below underwriting thresholds for income.",
    weight: 0.48,
  },
  stableTenure: {
    label: "Stable relationship tenure",
    evidence: "Primary relationship open longer than the cohort median with no dormancy gaps.",
    weight: 0.55,
  },
  cleanFraud: {
    label: "Clean fraud & dispute history",
    evidence: "No fraud flags or disputed-transaction cases on file in the trailing 12 months.",
    weight: 0.93,
  },
  noRecentDeclines: {
    label: "No recent declines",
    evidence: "No card authorization or ACH declines in the trailing 60 days.",
    weight: 0.71,
  },
  collateralClean: {
    label: "Collateral-ready profile",
    evidence: "Existing secured obligations paid as agreed with no servicer delinquency markers.",
    weight: 0.44,
  },
  bizCashBuffer: {
    label: "Operating cash buffer",
    evidence: "Business balances cover more than one payroll cycle at all observed month-ends.",
    weight: 0.05,
  },
  suitability: {
    label: "Suitability screen clear",
    evidence: "Liquid reserves and income stability meet the product's suitability floor.",
    weight: 0.29,
  },
};

const EXTRA_BEHAVIORAL: Record<string, SeedSignal> = {
  competitorProduct: {
    label: "Comparable product held elsewhere",
    evidence: "Recurring payment or transfer to a competing provider of this product category.",
    weight: 0.15,
  },
  researchIntent: {
    label: "Research & shopping intent",
    evidence: "Comparison-site subscriptions, application fees and quote-portal charges in-market.",
    weight: 0.09,
  },
  digitalEngaged: {
    label: "Digitally engaged",
    evidence: "Mobile-first authentication with card-on-file digital wallet usage each week.",
    weight: 0.52,
  },
};

const EXTRA_LIFE_EVENT: Record<string, SeedSignal> = {
  incomeStepUp: {
    label: "Income step-up",
    evidence: "Payroll deposit amount rises 15%+ and holds for three consecutive cycles.",
    weight: 0.12,
  },
  householdFormation: {
    label: "New household formed",
    evidence: "Joint account opened with merged utility, rent and grocery outflows.",
    weight: 0.06,
  },
};

/* ---------------------------- *
 * Per-product selection rules  *
 * ---------------------------- */

function supplementalFor(flow: ProductFlow): Array<[SignalFamily, SeedSignal]> {
  const t = tagsFor(flow);
  const out: Array<[SignalFamily, SeedSignal]> = [];
  const add = (family: SignalFamily, seed: SeedSignal | undefined) => {
    if (seed && !out.some(([, s]) => s.label === seed.label)) out.push([family, seed]);
  };

  // --- Financial ---
  if (t.has("business")) {
    add("financial", FINANCIAL.bizRevenue);
    add("financial", FINANCIAL.bizTaxes);
  }
  if (t.has("home")) {
    add("financial", FINANCIAL.mortgagePayer);
    add("financial", FINANCIAL.surplus);
  }
  if (t.has("auto")) add("financial", FINANCIAL.autoPayer);
  if (t.has("education")) add("financial", FINANCIAL.tuitionOutflow);
  if (t.has("retirement")) add("financial", FINANCIAL.retirementContrib);
  if (t.has("invest")) {
    add("financial", FINANCIAL.externalInvestFunding);
    add("financial", FINANCIAL.idleCash);
  }
  if (t.has("deposit")) {
    add("financial", FINANCIAL.depositGrowth);
    add("financial", FINANCIAL.interestSeeking);
  }
  if (t.has("card") || t.has("credit")) add("financial", FINANCIAL.lowUtil);
  if (t.has("insurance")) add("financial", FINANCIAL.highInsuranceSpend);
  if (t.has("travel")) add("financial", FINANCIAL.travelSpend);
  add("financial", FINANCIAL.payroll);
  if (out.filter(([f]) => f === "financial").length < 2) add("financial", FINANCIAL.surplus);

  // --- Demographic ---
  if (t.has("business")) {
    add("demographic", DEMOGRAPHIC.ownerOperator);
    add("demographic", DEMOGRAPHIC.selfEmployed);
  }
  if (t.has("education")) {
    add("demographic", DEMOGRAPHIC.parentSchoolAge);
    add("demographic", DEMOGRAPHIC.dualIncome);
  }
  if (t.has("home")) add("demographic", DEMOGRAPHIC.homeowner);
  if (t.has("auto")) add("demographic", DEMOGRAPHIC.multiVehicle);
  if (t.has("retirement")) add("demographic", DEMOGRAPHIC.preRetiree);
  if (t.has("invest")) add("demographic", DEMOGRAPHIC.affluentHousehold);
  if (t.has("pet")) add("demographic", DEMOGRAPHIC.petOwner);
  if (t.has("student") || t.has("card")) add("demographic", DEMOGRAPHIC.youngProfessional);
  if (t.has("insurance")) add("demographic", DEMOGRAPHIC.parentYoung);
  if (t.has("deposit")) add("demographic", DEMOGRAPHIC.renter);
  if (out.filter(([f]) => f === "demographic").length < 2) add("demographic", DEMOGRAPHIC.dualIncome);

  // --- Risk ---
  if (t.has("credit") || t.has("home") || t.has("auto") || t.has("card")) {
    add("risk", RISK.healthyDti);
    add("risk", RISK.collateralClean);
  }
  if (t.has("invest") || t.has("retirement")) add("risk", RISK.suitability);
  if (t.has("business")) add("risk", RISK.bizCashBuffer);
  if (t.has("deposit")) add("risk", RISK.noOverdraft);
  add("risk", RISK.stableTenure);
  if (out.filter(([f]) => f === "risk").length < 2) add("risk", RISK.cleanFraud);

  // --- Extra behavioral / life-event depth ---
  add("behavioral", EXTRA_BEHAVIORAL.competitorProduct);
  if (t.has("credit") || t.has("insurance") || t.has("home") || t.has("auto")) {
    add("behavioral", EXTRA_BEHAVIORAL.researchIntent);
  }
  if (t.has("invest") || t.has("deposit") || t.has("credit")) {
    add("life-event", EXTRA_LIFE_EVENT.incomeStepUp);
  }

  return out;
}

/* ------------------------------- *
 * Personalization message builder *
 * ------------------------------- */

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const FAMILY_ANGLE: Record<SignalFamily, (flow: ProductFlow, s: SeedSignal) => Omit<FlowMicrosegment, "signalLabel">> = {
  "life-event": (flow, s) => ({
    title: `${s.label} · ${flow.name}`,
    subject: "Something changed — here's what it unlocks",
    body: `Hi {{first_name}},\nWe noticed a shift in your day-to-day money movement. When life moves, ${flow.name} is one of the first things worth revisiting — we've lined up the details so you can decide quickly.`,
    cta: `Review ${flow.name}`,
  }),
  behavioral: (flow, s) => ({
    title: `${s.label} · ${flow.name}`,
    subject: "You're already doing this — here's a better fit",
    body: `Hi {{first_name}},\nYour recent pattern of activity lines up closely with what ${flow.name} is built for. Bringing it in-house usually means fewer moving parts and better terms.`,
    cta: `Compare ${flow.name}`,
  }),
  financial: (flow) => ({
    title: `Financially ready · ${flow.name}`,
    subject: "Your numbers are ready for this",
    body: `Hi {{first_name}},\nBased on how your balances and obligations have been trending, ${flow.name} looks like a comfortable next step — no change to your day-to-day required.`,
    cta: `See your options`,
  }),
  demographic: (flow) => ({
    title: `Household fit · ${flow.name}`,
    subject: "Built for households like yours",
    body: `Hi {{first_name}},\nHouseholds with your shape of spending tend to get the most out of ${flow.name}. Here's the short version of how it would work for you.`,
    cta: `See how it works`,
  }),
  risk: (flow) => ({
    title: `Pre-qualified · ${flow.name}`,
    subject: "You're already through the hard part",
    body: `Hi {{first_name}},\nYour account history clears the checks we'd normally run for ${flow.name}. That means a shorter path and fewer questions when you're ready.`,
    cta: `Start pre-qualified`,
  }),
};

const CHANNELS_BY_FAMILY: Record<SignalFamily, string[]> = {
  "life-event": ["Email", "In-app", "Advisor brief"],
  behavioral: ["Email", "In-app"],
  financial: ["Email", "Advisor brief"],
  demographic: ["In-app", "Email"],
  risk: ["Advisor brief", "In-app"],
};

/* ------------------------------- *
 * Public expansion entry point    *
 * ------------------------------- */

const cache = new Map<string, ExpandedSignal[]>();

export function expandFlowSignals(flow: ProductFlow): ExpandedSignal[] {
  const cached = cache.get(flow.id);
  if (cached) return cached;

  const authoredCopy = FLOW_MICROSEGMENTS[flow.id] ?? [];

  const authored: ExpandedSignal[] = flow.signals.map((sig: FlowSignal, idx) => {
    const copy = authoredCopy[idx];
    const family: SignalFamily = sig.type === "life-event" ? "life-event" : "behavioral";
    return {
      id: `${flow.id}--${slug(sig.label)}`,
      label: sig.label,
      evidence: sig.evidence,
      family,
      weight: family === "life-event" ? 0.2 : 0.3,
      message: copy ?? {
        signalLabel: sig.label,
        ...FAMILY_ANGLE[family](flow, { label: sig.label, evidence: sig.evidence }),
      },
      channels: CHANNELS_BY_FAMILY[family],
    };
  });

  const supplemental: ExpandedSignal[] = supplementalFor(flow)
    .filter(([, s]) => !authored.some((a) => a.label.toLowerCase() === s.label.toLowerCase()))
    .map(([family, s]) => ({
      id: `${flow.id}--${slug(s.label)}`,
      label: s.label,
      evidence: s.evidence,
      family,
      weight: s.weight ?? 0.2,
      message: { signalLabel: s.label, ...FAMILY_ANGLE[family](flow, s) },
      channels: CHANNELS_BY_FAMILY[family],
    }));

  const all = [...authored, ...supplemental].sort(
    (a, b) => SIGNAL_FAMILY_ORDER.indexOf(a.family) - SIGNAL_FAMILY_ORDER.indexOf(b.family),
  );

  cache.set(flow.id, all);
  return all;
}

export function groupByFamily(signals: ExpandedSignal[]): Array<[SignalFamily, ExpandedSignal[]]> {
  return SIGNAL_FAMILY_ORDER.map(
    (family) => [family, signals.filter((s) => s.family === family)] as [SignalFamily, ExpandedSignal[]],
  ).filter(([, list]) => list.length > 0);
}

/** Audience attributable to a signal, given the enabled set for its flow. */
export function signalAudience(
  flow: ProductFlow,
  signals: ExpandedSignal[],
  enabled: Set<string>,
  signal: ExpandedSignal,
): number {
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0) || 1;
  return Math.round((flow.estimatedAudience * signal.weight) / totalWeight);
}

/** Flow audience limited to the enabled signals. */
export function enabledAudience(
  flow: ProductFlow,
  signals: ExpandedSignal[],
  enabled: Set<string>,
): number {
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0) || 1;
  const onWeight = signals.filter((s) => enabled.has(s.id)).reduce((sum, s) => sum + s.weight, 0);
  return Math.round((flow.estimatedAudience * onWeight) / totalWeight);
}
