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
  risk: "Risk Filter",
};

export const SIGNAL_FAMILY_CLASS: Record<SignalFamily, string> = {
  "life-event": "bg-amber-50 text-amber-700 border-amber-200",
  behavioral: "bg-blue-50 text-blue-700 border-blue-200",
  financial: "bg-emerald-50 text-emerald-700 border-emerald-200",
  demographic: "bg-violet-50 text-violet-700 border-violet-200",
  risk: "bg-rose-50 text-rose-700 border-rose-200",
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

// Matched against the product id and name ONLY — never the category (which made
// every "Wealth" product look like a brokerage) and never the marketing
// positioning line ("automatic transfers" -> auto).
const TAG_PATTERNS: Array<[Tag, RegExp]> = [
  ["business", /business|sba|commercial|merchant|payroll|corporate|fleet|equipment|succession|key.person|workers|bop/i],
  ["home", /mortgage|heloc|home equity|homeowner|refinanc|renovation|landlord|construction/i],
  ["auto", /\bauto (loan|lease|insurance|refi)|\bcar\b|vehicle|\brv\b|boat|marine|motorcycle|powersport|\bev\b/i],
  ["education", /529|college|education|tuition|student/i],
  ["student", /student/i],
  ["retirement", /retire|401|\bira\b|annuity|pension|rollover/i],
  // Requires an actual investing noun — "wealth" alone no longer qualifies.
  ["invest", /invest|brokerage|portfolio|advisory|robo|securities|\bsbl\b|wealth management|managed account/i],
  ["card", /card|rewards|cash.back|miles/i],
  // Requires a real deposit noun; "College Savings Plan" is not a deposit product.
  ["deposit", /checking|savings account|deposit|\bcd\b|money market|hysa|high.yield savings|sweep|certificate/i],
  ["insurance", /insur|umbrella|policy|coverage|term life|whole life|workers.comp/i],
  ["travel", /travel|miles|airline|passport/i],
  ["credit", /loan|credit|line of credit|financing|lending|consolidat/i],
  ["pet", /\bpet\b/i],
  ["health", /health|\bhsa\b|medical|dental|disability/i],
];

function tagsFor(flow: ProductFlow): Set<Tag> {
  const hay = `${flow.id} ${flow.name}`;
  const tags = new Set<Tag>();
  for (const [tag, re] of TAG_PATTERNS) if (re.test(hay)) tags.add(tag);
  // Education / insurance products are never investing or deposit products,
  // even when their name mentions savings or a plan.
  if (tags.has("education") || tags.has("insurance")) {
    tags.delete("deposit");
    if (!/brokerage|advisory|portfolio|managed account/i.test(hay)) tags.delete("invest");
  }
  return tags;
}



/* ---------------------------- *
 * Supplemental signal library  *
 * ---------------------------- */

const FINANCIAL: Record<string, SeedSignal> = {
  payroll: {
    label: "Steady paycheck coming in",
    evidence: "The same employer deposit lands on the same schedule, month after month.",
    weight: 0.55,
  },
  surplus: {
    label: "Money left over each month",
    evidence: "What comes in covers rent or mortgage, bills and cards with room to spare.",
    weight: 0.34,
  },
  depositGrowth: {
    label: "Savings are growing",
    evidence: "Checking and savings balances have climbed steadily over the last six months.",
    weight: 0.28,
  },
  idleCash: {
    label: "Cash sitting still",
    evidence: "More in checking than they spend, month after month, earning nothing.",
    weight: 0.18,
  },
  lowUtil: {
    label: "Barely uses their credit limit",
    evidence: "Card balances stay well under the limit every month.",
    weight: 0.41,
  },
  mortgagePayer: {
    label: "Pays a mortgage every month",
    evidence: "A regular payment goes out to a home loan servicer.",
    weight: 0.22,
  },
  autoPayer: {
    label: "Pays a car loan or lease",
    evidence: "A fixed monthly payment goes out to a car lender or leasing company.",
    weight: 0.24,
  },
  externalInvestFunding: {
    label: "Investing somewhere else",
    evidence: "Money moves out regularly to an outside brokerage or advisor.",
    weight: 0.16,
  },
  retirementContrib: {
    label: "Putting money toward retirement",
    evidence: "Retirement contributions come out of pay, plus occasional transfers to a retirement account.",
    weight: 0.19,
  },
  interestSeeking: {
    label: "Chasing a better rate elsewhere",
    evidence: "Savings are moving out to a higher-paying account at another bank.",
    weight: 0.13,
  },
  highInsuranceSpend: {
    label: "Pays several insurance premiums",
    evidence: "Multiple insurance payments go out each month to different companies.",
    weight: 0.26,
  },
  bizRevenue: {
    label: "Gets paid by customers through card sales",
    evidence: "Regular payouts from a card processor land in the account.",
    weight: 0.09,
  },
  bizTaxes: {
    label: "Pays quarterly business taxes",
    evidence: "Tax payments go out four times a year, the way business owners pay.",
    weight: 0.07,
  },
  tuitionOutflow: {
    label: "Paying tuition",
    evidence: "Regular payments go to a school or college.",
    weight: 0.11,
  },
  travelSpend: {
    label: "Travels often",
    evidence: "Airline, hotel and ride spending across several trips this past year.",
    weight: 0.17,
  },
};

const DEMOGRAPHIC: Record<string, SeedSignal> = {
  dualIncome: {
    label: "Two earners in the household",
    evidence: "Two different paychecks land in the same household's accounts.",
    weight: 0.34,
  },
  parentYoung: {
    label: "Has young children",
    evidence: "Daycare, children's doctor visits and kids' store spending repeat every month.",
    weight: 0.21,
  },
  parentSchoolAge: {
    label: "Has school-age children",
    evidence: "School fees, youth sports sign-ups and supply runs follow the school year.",
    weight: 0.19,
  },
  homeowner: {
    label: "Owns their home",
    evidence: "Property taxes, home insurance and hardware-store spending alongside a mortgage payment.",
    weight: 0.46,
  },
  renter: {
    label: "Rents their home",
    evidence: "Rent goes out every month, with renters insurance and no mortgage payment.",
    weight: 0.32,
  },
  preRetiree: {
    label: "Getting close to retirement",
    evidence: "Peak earning years with extra retirement contributions and advisor fees.",
    weight: 0.13,
  },
  youngProfessional: {
    label: "Early in their career",
    evidence: "A first steady paycheck alongside student loan payments and city transit spending.",
    weight: 0.17,
  },
  selfEmployed: {
    label: "Works for themselves",
    evidence: "Uneven payments from several clients, plus quarterly tax payments.",
    weight: 0.11,
  },
  ownerOperator: {
    label: "Runs a business from this account",
    evidence: "Business income and payroll run through the same account as household spending.",
    weight: 0.06,
  },
  multiVehicle: {
    label: "More than one car in the household",
    evidence: "Two separate car insurance payments and two different gas-station patterns.",
    weight: 0.15,
  },
  affluentHousehold: {
    label: "High-net-worth household",
    evidence: "Premium stores, advisor fees and club or concierge spending.",
    weight: 0.08,
  },
  petOwner: {
    label: "Has a pet",
    evidence: "Vet visits, grooming and pet-store spending throughout the year.",
    weight: 0.23,
  },
  relocated: {
    label: "Recently moved",
    evidence: "Everyday spending shifted to a new city, with utility setup charges.",
    weight: 0.07,
  },
  emptyNester: {
    label: "Children have moved out",
    evidence: "Family spending dropped off while travel and dining picked up.",
    weight: 0.14,
  },
};

// Risk items are exclusion filters, not triggers. Each label names WHO GETS
// REMOVED; the weight is the share of the triggered audience that still clears.
const RISK: Record<string, SeedSignal> = {
  noOverdraft: {
    label: "Recent overdrafts",
    evidence: "Removes anyone who overdrew or bounced a payment in the last three months.",
    weight: 0.78,
  },
  healthyDti: {
    label: "Payments already stretched",
    evidence: "Removes anyone whose existing loan and card payments take up too much of what comes in each month.",
    weight: 0.48,
  },
  cleanFraud: {
    label: "Fraud or dispute history",
    evidence: "Removes accounts with a fraud claim or a disputed charge in the past year.",
    weight: 0.93,
  },
  noRecentDeclines: {
    label: "Recent declined payments",
    evidence: "Removes anyone whose card or bank payments were turned down in the last two months.",
    weight: 0.71,
  },
  collateralClean: {
    label: "Missed secured-loan payments",
    evidence: "Removes anyone who has fallen behind on a mortgage or car loan.",
    weight: 0.44,
  },
  cardPaysInFull: {
    label: "Carries a revolving balance",
    evidence: "Removes anyone rolling a balance month to month or paying the card late.",
    weight: 0.38,
  },
  bizCashBuffer: {
    label: "Thin payroll cushion",
    evidence: "Removes businesses that end the month with less than one payroll run in the account.",
    weight: 0.05,
  },
  suitability: {
    label: "Outside the suitability range",
    evidence: "Removes households whose savings or steady income fall outside what this product is built for.",
    weight: 0.29,
  },
  coverageGap: {
    label: "Coverage already adequate",
    evidence: "Removes households whose insurance already tracks their income and assets.",
    weight: 0.31,
  },
};


const EXTRA_BEHAVIORAL: Record<string, SeedSignal> = {
  competitorProduct: {
    label: "Already has this at another bank",
    evidence: "A regular payment or transfer goes to another provider of the same product.",
    weight: 0.15,
  },
  researchIntent: {
    label: "Shopping around right now",
    evidence: "Comparison sites, quote services and application fees show up in recent spending.",
    weight: 0.09,
  },
  digitalEngaged: {
    label: "Uses the app constantly",
    evidence: "Signs in from their phone and pays with a digital wallet most weeks.",
    weight: 0.52,
  },
  educationSpend: {
    label: "Spending on their kids' education",
    evidence: "Tutoring, test prep, school fees and enrichment programs show up through the school year.",
    weight: 0.18,
  },
  educationOutbound: {
    label: "Education money going to an outside provider",
    evidence: "Recurring transfers to an outside education account or plan administrator.",
    weight: 0.12,
  },
};


const EXTRA_LIFE_EVENT: Record<string, SeedSignal> = {
  incomeStepUp: {
    label: "Just got a raise",
    evidence: "The paycheck jumped and has stayed higher for three months running.",
    weight: 0.12,
  },
  householdFormation: {
    label: "Started a household together",
    evidence: "A joint account opened, with rent, utilities and groceries now shared.",
    weight: 0.06,
  },
};

/* ---------------------------- *
 * Per-product selection rules  *
 * ---------------------------- */

/** [family, seed, relevance] — relevance 3 = direct product match, 2 = adjacent, 1 = generic. */
type ScoredSeed = [SignalFamily, SeedSignal, number];

function supplementalFor(flow: ProductFlow): ScoredSeed[] {
  const t = tagsFor(flow);
  const name = `${flow.id} ${flow.name}`;
  const out: ScoredSeed[] = [];
  const add = (family: SignalFamily, seed: SeedSignal | undefined, score = 2) => {
    if (seed && !out.some(([, s]) => s.label === seed.label)) out.push([family, seed, score]);
  };

  // Products where the bank actually extends credit or underwrites a policy.
  const isCard = t.has("card") && /card/i.test(name);
  const underwritten =
    t.has("credit") || t.has("home") || t.has("auto") || t.has("business") || t.has("insurance") || isCard;
  const secured = t.has("home") || t.has("auto") || /secured|collateral|sbl|securities.based/i.test(name);
  const savingsProduct = /savings account|cd\b|certificate|money market|hysa|high.yield|sweep/i.test(name);

  // --- Financial ---
  if (t.has("business")) {
    add("financial", FINANCIAL.bizRevenue, 3);
    add("financial", FINANCIAL.bizTaxes, 3);
  }
  if (t.has("home")) {
    add("financial", FINANCIAL.mortgagePayer, 3);
    add("financial", FINANCIAL.surplus, 2);
  }
  if (t.has("auto")) add("financial", FINANCIAL.autoPayer, 3);
  if (t.has("education")) {
    add("financial", FINANCIAL.tuitionOutflow, 3);
    add("financial", FINANCIAL.surplus, 2);
  }
  if (t.has("retirement")) add("financial", FINANCIAL.retirementContrib, 3);
  if (t.has("invest")) {
    add("financial", FINANCIAL.externalInvestFunding, 3);
    add("financial", FINANCIAL.idleCash, 2);
  }
  if (t.has("deposit")) add("financial", FINANCIAL.depositGrowth, 3);
  if (savingsProduct) add("financial", FINANCIAL.interestSeeking, 3);
  if (isCard || t.has("credit")) add("financial", FINANCIAL.lowUtil, 3);
  if (t.has("insurance")) add("financial", FINANCIAL.highInsuranceSpend, 3);
  if (t.has("travel")) add("financial", FINANCIAL.travelSpend, 3);
  // Income stability matters where repayment, funding or premiums are involved.
  if (underwritten || t.has("deposit") || t.has("retirement")) add("financial", FINANCIAL.payroll, 1);
  if (out.filter(([f]) => f === "financial").length < 2) {
    add("financial", t.has("invest") || t.has("deposit") ? FINANCIAL.depositGrowth : FINANCIAL.surplus, 1);
  }

  // --- Demographic ---
  if (t.has("business")) {
    add("demographic", DEMOGRAPHIC.ownerOperator, 3);
    add("demographic", DEMOGRAPHIC.selfEmployed, 3);
  }
  if (t.has("education")) {
    add("demographic", DEMOGRAPHIC.parentSchoolAge, 3);
    add("demographic", DEMOGRAPHIC.dualIncome, 2);
  }
  if (t.has("home")) add("demographic", DEMOGRAPHIC.homeowner, 3);
  if (t.has("auto") || t.has("insurance")) add("demographic", DEMOGRAPHIC.multiVehicle, 3);
  if (t.has("retirement")) add("demographic", DEMOGRAPHIC.preRetiree, 3);
  if (t.has("invest")) add("demographic", DEMOGRAPHIC.affluentHousehold, 3);
  if (t.has("pet")) add("demographic", DEMOGRAPHIC.petOwner, 3);
  if (t.has("student") || isCard) add("demographic", DEMOGRAPHIC.youngProfessional, 2);
  if (t.has("insurance")) add("demographic", DEMOGRAPHIC.parentYoung, 2);
  if (t.has("deposit")) add("demographic", DEMOGRAPHIC.renter, 1);
  if (t.has("travel")) add("demographic", DEMOGRAPHIC.emptyNester, 2);
  if (out.filter(([f]) => f === "demographic").length < 2) {
    add("demographic", t.has("invest") ? DEMOGRAPHIC.affluentHousehold : DEMOGRAPHIC.dualIncome, 1);
  }

  // --- Risk / eligibility: only where the bank takes on exposure ---
  if (underwritten) {
    add("risk", RISK.healthyDti, 3);
    if (secured) add("risk", RISK.collateralClean, 3);
    if (isCard) add("risk", RISK.cardPaysInFull, 3);
    if (t.has("insurance")) add("risk", RISK.coverageGap, 3);
    if (t.has("business")) add("risk", RISK.bizCashBuffer, 3);
    add("risk", RISK.noOverdraft, 2);
  } else if (t.has("invest") || t.has("retirement") || t.has("education")) {
    // Advisory / plan products: suitability, not credit risk.
    add("risk", RISK.suitability, 3);
  }

  // --- Extra behavioral / life-event depth ---
  if (t.has("education")) {
    // We can observe education SPENDING, not that a household is "saving for school".
    add("behavioral", EXTRA_BEHAVIORAL.educationSpend, 3);
    add("behavioral", EXTRA_BEHAVIORAL.educationOutbound, 3);
  } else {
    add("behavioral", EXTRA_BEHAVIORAL.competitorProduct, 2);
  }
  if (underwritten) add("behavioral", EXTRA_BEHAVIORAL.researchIntent, 2);
  if ((t.has("card") || t.has("deposit")) && !t.has("education")) {
    add("behavioral", EXTRA_BEHAVIORAL.digitalEngaged, 1);
  }
  if ((t.has("invest") || t.has("deposit") || t.has("credit")) && !t.has("education")) {
    add("life-event", EXTRA_LIFE_EVENT.incomeStepUp, 1);
  }

  return out;
}

/** Max signals shown per family, authored signals included. */
const FAMILY_CAP: Record<SignalFamily, number> = {
  "life-event": 3,
  behavioral: 3,
  financial: 3,
  demographic: 2,
  risk: 3,
};


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
const filterCache = new Map<string, EligibilityFilter[]>();

/** A risk filter: it removes customers from the triggered audience, never adds any. */
export interface EligibilityFilter {
  id: string;
  label: string;
  /** Plain-language description of who this check removes. */
  evidence: string;
  /** Share of the triggered audience that still clears this check. */
  passRate: number;
}


function buildFlow(flow: ProductFlow): { signals: ExpandedSignal[]; filters: EligibilityFilter[] } {
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

  const supplemental = supplementalFor(flow).filter(
    ([, s]) => !authored.some((a) => a.label.toLowerCase() === s.label.toLowerCase()),
  );

  // Keep the strongest supplemental signals per family, within the family cap
  // (authored signals always stay and count toward the cap).
  const kept: ScoredSeed[] = [];
  for (const family of SIGNAL_FAMILY_ORDER) {
    const authoredCount = authored.filter((a) => a.family === family).length;
    const room = Math.max(0, FAMILY_CAP[family] - authoredCount);
    const pool = supplemental
      .filter(([f]) => f === family)
      .sort((a, b) => b[2] - a[2] || (b[1].weight ?? 0) - (a[1].weight ?? 0));
    kept.push(...pool.slice(0, room));
  }

  const triggering: ExpandedSignal[] = kept
    .filter(([family]) => family !== "risk")
    .map(([family, s]) => ({
      id: `${flow.id}--${slug(s.label)}`,
      label: s.label,
      evidence: s.evidence,
      family,
      weight: s.weight ?? 0.2,
      message: { signalLabel: s.label, ...FAMILY_ANGLE[family](flow, s) },
      channels: CHANNELS_BY_FAMILY[family],
    }));

  const filters: EligibilityFilter[] = kept
    .filter(([family]) => family === "risk")
    .map(([, s]) => ({
      id: `${flow.id}--filter--${slug(s.label)}`,
      label: s.label,
      evidence: s.evidence,
      passRate: Math.min(0.98, Math.max(0.2, s.weight ?? 0.5)),
    }));

  const signals = [...authored, ...triggering].sort(
    (a, b) => SIGNAL_FAMILY_ORDER.indexOf(a.family) - SIGNAL_FAMILY_ORDER.indexOf(b.family),
  );


  return { signals, filters };
}

export function expandFlowSignals(flow: ProductFlow): ExpandedSignal[] {
  const cached = cache.get(flow.id);
  if (cached) return cached;
  const { signals, filters } = buildFlow(flow);
  cache.set(flow.id, signals);
  filterCache.set(flow.id, filters);
  return signals;
}

export function expandFlowFilters(flow: ProductFlow): EligibilityFilter[] {
  const cached = filterCache.get(flow.id);
  if (cached) return cached;
  const { signals, filters } = buildFlow(flow);
  cache.set(flow.id, signals);
  filterCache.set(flow.id, filters);
  return filters;
}

/** Combined pass rate of the enabled eligibility filters. */
export function filterPassRate(filters: EligibilityFilter[], enabled: Set<string>): number {
  return filters
    .filter((f) => enabled.has(f.id))
    .reduce((rate, f) => rate * f.passRate, 1);
}

/** Triggered audience narrowed by the enabled eligibility filters. */
export function qualifiedAudience(
  flow: ProductFlow,
  signals: ExpandedSignal[],
  enabledSignals: Set<string>,
  filters: EligibilityFilter[],
  enabledFilters: Set<string>,
): number {
  return Math.round(
    enabledAudience(flow, signals, enabledSignals) * filterPassRate(filters, enabledFilters),
  );
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
