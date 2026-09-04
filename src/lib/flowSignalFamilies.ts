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
import { benefitsForFlow } from "./productFlowBenefits";

/** Microsegment copy plus the concrete product benefits shown with it. */
export interface SignalMessage extends FlowMicrosegment {
  benefits: string[];
}

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
  message: SignalMessage;
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
  ["home", /mortgage|heloc|home equity|homeowner|home refinanc|renovation|landlord|construction/i],
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
  homeEquityBuilt: {
    label: "Built meaningful home equity",
    evidence: "Mortgage principal paid down over several years alongside property tax and homeowners insurance outflows.",
    weight: 0.35,
  },
  highInterestConsumerDebt: {
    label: "Carrying high-interest consumer debt",
    evidence: "Recurring interest charges and revolving balances that a lower-rate home equity line could consolidate.",
    weight: 0.31,
  },
  largePlannedOutflow: {
    label: "Large planned outflow ahead",
    evidence: "Large tuition deposits, large medical payments, or renovation deposits already leaving the account.",
    weight: 0.22,
  },
  outsideMortgageServicer: {
    label: "Mortgage payment to an outside servicer",
    evidence: "Proves ownership, dates the origination, and reveals a lender the institution does not hold. Seasoning past three years plus continuing property tax and insurance establishes meaningful equity accumulation, and an escrow step-up usually means assessed value rose.",
    weight: 0.32,
  },
  existingHelocElsewhere: {
    label: "Existing HELOC at another lender",
    evidence: "A recurring payment to a second lien servicer. Payment size implies the outstanding balance, and anything above roughly $25K drawn is worth pursuing. The refinance target, and the highest-converting audience in the set.",
    weight: 0.36,
  },
  higherCostDebt: {
    label: "Carrying higher-cost debt",
    evidence: "Revolving balances with recurring interest charges, or payments to a personal loan servicer, home improvement financing company, or retail project card. Fires above $15K aggregate, where the rate difference produces savings large enough to move someone. All of it consolidates into a line at a fraction of the rate.",
    weight: 0.34,
  },
  reachingLiquidity: {
    label: "Reaching for liquidity",
    evidence: "Savings drawn down toward zero, transfer direction reversing from checking-to-savings into savings-to-checking, or an investment account liquidating into deposits. The purpose does not have to be legible. What matters is that a household with equity is converting assets to cash rather than borrowing against the house.",
    weight: 0.30,
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
  longTenureHomeowner: {
    label: "Long-tenure homeowner",
    evidence: "Same property payments for 7+ years, indicating a paid-down mortgage and strong equity position.",
    weight: 0.28,
  },
  dualIncomeHomeowner: {
    label: "Dual-income homeowner",
    evidence: "Two payroll streams land in the household alongside mortgage and property tax outflows.",
    weight: 0.26,
  },
  preRetireeHomeowner: {
    label: "Pre-retiree homeowner",
    evidence: "Age band 50–62 with a paid-down mortgage and rising discretionary home-improvement spend.",
    weight: 0.18,
  },
};


// Risk items are exclusion filters, not triggers. Each label names WHO GETS
// REMOVED; the weight is the share of the triggered audience that still clears.
// Pass rates are calibrated for an audience that is ALREADY signal-qualified,
// so a healthy pre-screen clears 70-98% on any single check.
const RISK: Record<string, SeedSignal> = {
  noOverdraft: {
    label: "Recent overdrafts",
    evidence: "Removes anyone who overdrew or bounced a payment in the last three months.",
    weight: 0.91,
  },
  healthyDti: {
    label: "Payments already stretched",
    evidence: "Removes anyone whose existing loan and card payments take up too much of what comes in each month.",
    weight: 0.82,
  },
  cleanFraud: {
    label: "Unresolved fraud or identity flag",
    evidence: "Removes accounts carrying an open fraud claim or an unresolved identity check.",
    weight: 0.97,
  },
  accountStanding: {
    label: "Prior charge-off or account closed for cause",
    evidence: "Removes anyone with a written-off balance or an account the bank previously closed for cause.",
    weight: 0.96,
  },
  noRecentDeclines: {
    label: "Recent declined payments",
    evidence: "Removes anyone whose card or bank payments were turned down in the last two months.",
    weight: 0.94,
  },
  collateralClean: {
    label: "Missed secured-loan payments",
    evidence: "Removes anyone who has fallen behind on a mortgage or car loan.",
    weight: 0.94,
  },
  seriousDelinquency: {
    label: "Serious delinquency in the last 24 months",
    evidence: "Removes anyone 60+ days past due on any credit obligation in the past two years.",
    weight: 0.93,
  },
  cardPaysInFull: {
    label: "Carries a revolving balance",
    evidence: "Removes anyone rolling a balance month to month or paying the card late.",
    weight: 0.86,
  },
  bizCashBuffer: {
    label: "Thin payroll cushion",
    evidence: "Removes businesses that end the month with less than one payroll run in the account.",
    weight: 0.88,
  },
  premiumAffordability: {
    label: "Premium not affordable",
    evidence: "Removes households whose monthly surplus will not carry the premium for this cover.",
    weight: 0.85,
  },
  suitability: {
    label: "Suitability profile flag",
    evidence: "Removes households whose recorded risk profile or time horizon does not fit this product.",
    weight: 0.9,
  },
  noInvestableSurplus: {
    label: "No investable surplus",
    evidence: "Removes households with nothing left over each month once obligations and reserves are covered.",
    weight: 0.74,
  },
  coverageGap: {
    label: "Coverage already adequate",
    weight: 0.8,
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
  // Education signals describe a PARENT funding a child's education. A student
  // card is held by the student, so it never gets tuition-payer signals.
  const parentEducation = t.has("education") && !t.has("student");
  const autoInsurance = t.has("auto") || /auto insurance|vehicle/i.test(name);
  const entryLevelCard = isCard && /student|secured|starter|first|cash back/i.test(name);
  const checkingProduct = /checking/i.test(name);
  const hasAuthoredLifeEvent = flow.signals.some((s) => s.type === "life-event");


  // --- Financial ---
  if (t.has("business")) {
    add("financial", FINANCIAL.bizRevenue, 3);
    add("financial", FINANCIAL.bizTaxes, 3);
  }
  if (t.has("home")) {
    add("financial", FINANCIAL.outsideMortgageServicer, 3);
    add("financial", FINANCIAL.existingHelocElsewhere, 3);
    add("financial", FINANCIAL.higherCostDebt, 3);
    add("financial", FINANCIAL.reachingLiquidity, 3);
    add("financial", FINANCIAL.mortgagePayer, 2);
    add("financial", FINANCIAL.homeEquityBuilt, 2);
    add("financial", FINANCIAL.highInterestConsumerDebt, 2);
    add("financial", FINANCIAL.largePlannedOutflow, 2);
    add("financial", FINANCIAL.surplus, 2);
  }

  if (t.has("auto")) add("financial", FINANCIAL.autoPayer, 3);
  if (parentEducation) {
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
  if ((isCard || t.has("credit")) && flow.id !== "heloc") add("financial", FINANCIAL.lowUtil, 3);
  if (t.has("insurance")) add("financial", FINANCIAL.highInsuranceSpend, 3);
  if (t.has("travel")) add("financial", FINANCIAL.travelSpend, 3);
  // Income stability matters where repayment, funding or premiums are involved.
  if (!t.has("business") && (underwritten || t.has("deposit") || t.has("retirement"))) {
    add("financial", FINANCIAL.payroll, 1);
  }
  if (out.filter(([f]) => f === "financial").length < 2) {
    add("financial", t.has("invest") || t.has("deposit") ? FINANCIAL.depositGrowth : FINANCIAL.surplus, 1);
  }

  // --- Demographic ---
  if (t.has("business")) {
    add("demographic", DEMOGRAPHIC.ownerOperator, 3);
    add("demographic", DEMOGRAPHIC.selfEmployed, 3);
  }
  if (parentEducation) {
    add("demographic", DEMOGRAPHIC.parentSchoolAge, 3);
    add("demographic", DEMOGRAPHIC.dualIncome, 2);
  }
  if (t.has("home") && flow.id !== "heloc") {
    add("demographic", DEMOGRAPHIC.homeowner, 3);
    add("demographic", DEMOGRAPHIC.longTenureHomeowner, 3);
    add("demographic", DEMOGRAPHIC.dualIncomeHomeowner, 3);
    add("demographic", DEMOGRAPHIC.preRetireeHomeowner, 2);
  }

  // Only vehicle products get a vehicle-count signal — not life or pet cover.
  if (autoInsurance) add("demographic", DEMOGRAPHIC.multiVehicle, 3);
  if (t.has("retirement")) add("demographic", DEMOGRAPHIC.preRetiree, 3);
  if (t.has("invest")) add("demographic", DEMOGRAPHIC.affluentHousehold, 3);
  if (t.has("pet")) add("demographic", DEMOGRAPHIC.petOwner, 3);
  // Entry-level products skew young; premium products do not.
  if (t.has("student") || entryLevelCard) add("demographic", DEMOGRAPHIC.youngProfessional, 2);
  if (isCard && /premium|ultra|private|luxury/i.test(name)) {
    add("demographic", DEMOGRAPHIC.affluentHousehold, 3);
  }
  if (t.has("insurance") && !t.has("retirement")) add("demographic", DEMOGRAPHIC.parentYoung, 2);
  if (checkingProduct) add("demographic", DEMOGRAPHIC.renter, 1);
  if (t.has("travel")) add("demographic", DEMOGRAPHIC.emptyNester, 1);
  if (out.filter(([f]) => f === "demographic").length < 2 && flow.id !== "heloc") {
    add("demographic", t.has("invest") ? DEMOGRAPHIC.affluentHousehold : DEMOGRAPHIC.dualIncome, 1);
  }

  // --- Risk / eligibility ---
  // Credit exposure, insurance underwriting, advisory suitability and plain
  // account-standing checks are different jobs and get different filters.
  const lendingProduct =
    isCard ||
    t.has("credit") ||
    ((t.has("home") || t.has("auto") || t.has("business")) &&
      /loan|mortgage|heloc|line of credit|financing|refi|card|lease/i.test(name));
  const businessCredit = t.has("business") && lendingProduct;

  if (t.has("insurance")) {
    add("risk", RISK.coverageGap, 3);
    add("risk", RISK.premiumAffordability, 3);
    add("risk", RISK.accountStanding, 1);
  } else if (lendingProduct) {
    add("risk", RISK.healthyDti, 3);
    if (secured) add("risk", RISK.collateralClean, 3);
    if (isCard) add("risk", RISK.seriousDelinquency, 3);
    if (businessCredit) add("risk", RISK.bizCashBuffer, 3);
    if (!isCard && !secured) add("risk", RISK.noRecentDeclines, 2);
    add("risk", RISK.noOverdraft, 2);
  } else if (t.has("invest") || t.has("retirement") || parentEducation) {
    // Advisory / plan products: suitability and funding capacity, not credit risk.
    add("risk", RISK.noInvestableSurplus, 3);
    add("risk", RISK.suitability, 3);
    add("risk", RISK.accountStanding, 1);
  } else {
    // Deposits, services and everything else: compliance and account standing only.
    add("risk", RISK.accountStanding, 3);
    add("risk", RISK.cleanFraud, 3);
  }


  // --- Extra behavioral / life-event depth ---
  if (parentEducation) {
    // We can observe education SPENDING, not that a household is "saving for school".
    // Skip when the product already authors an education-spend signal.
    if (!flow.signals.some((s) => /educat|tutor|school|tuition/i.test(s.label))) {
      add("behavioral", EXTRA_BEHAVIORAL.educationSpend, 3);
    }
    add("behavioral", EXTRA_BEHAVIORAL.educationOutbound, 3);
  } else if (flow.id !== "heloc") {
    add("behavioral", EXTRA_BEHAVIORAL.competitorProduct, 2);
  }
  if (underwritten && flow.id !== "heloc") add("behavioral", EXTRA_BEHAVIORAL.researchIntent, 2);
  if ((t.has("card") || checkingProduct) && !parentEducation) {
    add("behavioral", EXTRA_BEHAVIORAL.digitalEngaged, 1);
  }
  // Only used as a life-event stand-in when the product authored none.
  if (!hasAuthoredLifeEvent && !t.has("business") && (t.has("invest") || t.has("deposit") || t.has("credit"))) {
    add("life-event", EXTRA_LIFE_EVENT.incomeStepUp, 1);
  }


  return out;
}

/** Max signals shown per family, authored signals included. */
const FAMILY_CAP: Record<SignalFamily, number> = {
  "life-event": 3,
  behavioral: 3,
  financial: 4,
  demographic: 3,
  risk: 3,
};



/* ------------------------------- *
 * Personalization message builder *
 * ------------------------------- */

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Signal archetype -> the observation line + framing used in the message. */
interface Angle {
  /** Short microsegment name. */
  title: string;
  subject: string;
  /** Observation of the behavior, tied to what the product does about it. */
  open: (noun: string) => string;
  /** Overrides the product's default CTA verb when the moment calls for it. */
  cta?: string;
}

// Keyed by the seed key in the libraries above (resolved by label at build time).
const ARCHETYPE_ANGLE: Record<string, Angle> = {
  // --- Financial ---
  payroll: {
    title: "Steady Income",
    subject: "Your income makes this straightforward",
    open: (n) => `Your pay arrives on a predictable schedule, which is the single thing that makes ${n} simple to approve and easy to fit into a month.`,
  },
  surplus: {
    title: "Room in the Budget",
    subject: "There's room here — here's a good use for it",
    open: (n) => `After the essentials are covered, there's consistently something left over. Putting a portion of it toward ${n} turns that margin into progress instead of drift.`,
  },
  depositGrowth: {
    title: "Balances Trending Up",
    subject: "Your balances are growing — let's put them to work",
    open: (n) => `Your balances have been climbing steadily. At this point ${n} is usually the next move, so the growth compounds instead of just accumulating.`,
  },
  idleCash: {
    title: "Cash Sitting Still",
    subject: "Cash that could be earning",
    open: (n) => `You're holding more in checking than a typical month needs. Moving the excess into ${n} keeps it available while it finally earns something.`,
    cta: "Put it to work",
  },
  lowUtil: {
    title: "Light Credit User",
    subject: "You use credit well — this rewards that",
    open: (n) => `You keep balances well under your limit, which is exactly the profile that gets the best terms on ${n}.`,
  },
  mortgagePayer: {
    title: "Mortgage Holder",
    subject: "Your home has been quietly working for you",
    open: (n) => `Every mortgage payment has been building equity. ${n[0].toUpperCase()}${n.slice(1)} is how that equity becomes usable without touching the loan you already have.`,
  },
  autoPayer: {
    title: "Active Vehicle Payment",
    subject: "Worth a second look at that payment",
    open: (n) => `You're carrying a fixed vehicle payment each month. It's worth 10 minutes to see what ${n} would change about the number and the term.`,
  },
  externalInvestFunding: {
    title: "Investing Elsewhere",
    subject: "Your investing is happening somewhere else",
    open: (n) => `Money leaves regularly for an outside investment platform. With ${n}, those positions sit beside your everyday accounts — one view, one login, usually lower cost.`,
    cta: "Bring it together",
  },
  retirementContrib: {
    title: "Actively Saving for Retirement",
    subject: "You're already saving — this adds to it",
    open: (n) => `You're contributing toward retirement consistently. ${n[0].toUpperCase()}${n.slice(1)} sits alongside that and gives the same dollars a bit more room to work.`,
  },
  interestSeeking: {
    title: "Rate Shopper",
    subject: "You shouldn't have to bank elsewhere for a better rate",
    open: (n) => `Savings have been moving out to a higher-paying account somewhere else. ${n[0].toUpperCase()}${n.slice(1)} means you don't have to keep money at two banks to get a competitive rate.`,
    cta: "Compare the rate",
  },
  highInsuranceSpend: {
    title: "Multiple Premiums",
    subject: "Several policies, several bills",
    open: (n) => `You're paying premiums to more than one insurer each month. Consolidating around ${n} usually means one renewal date and a bundling discount.`,
    cta: "Compare and bundle",
  },
  bizRevenue: {
    title: "Card Revenue Business",
    subject: "Your sales already run through here",
    open: (n) => `Card settlements land in this account regularly. That deposit history is the underwriting for ${n} — nothing extra to prove.`,
  },
  bizTaxes: {
    title: "Quarterly Tax Filer",
    subject: "Built for how your business pays",
    open: (n) => `You pay taxes on a quarterly schedule the way owner-operators do. ${n[0].toUpperCase()}${n.slice(1)} is structured around that rhythm rather than a salaried one.`,
  },
  tuitionOutflow: {
    title: "Paying Tuition Now",
    subject: "Tuition is going out either way",
    open: (n) => `Tuition payments are already leaving each term. Routing part of that through ${n} means the same money does more before it's spent.`,
  },
  travelSpend: {
    title: "Frequent Traveler",
    subject: "You travel enough for this to pay off",
    open: (n) => `Flights, hotels and rides show up across several trips this year. That's the spend level where ${n} stops being a nice-to-have and starts paying for itself.`,
  },
  homeEquityBuilt: {
    title: "Equity Built Up",
    subject: "Your home has been quietly building value",
    open: (n) => `Years of mortgage payments have turned your home into a real asset. ${n[0].toUpperCase()}${n.slice(1)} lets you put that equity to work without refinancing the loan you already have.`,
  },
  highInterestConsumerDebt: {
    title: "High-Interest Debt",
    subject: "A lower-rate option is sitting right here",
    open: (n) => `Revolving balances are racking up interest every month. Moving that debt into ${n} usually means one lower rate and a faster path to zero.`,
  },
  largePlannedOutflow: {
    title: "Big Expense Ahead",
    subject: "The money is already leaving — make it cheaper",
    open: (n) => `Large tuition, medical, or renovation payments are on their way out. ${n[0].toUpperCase()}${n.slice(1)} covers the same spending at a fraction of the interest cost.`,
  },
  outsideMortgageServicer: {
    title: "Mortgage Held Elsewhere",
    subject: "Your equity is already growing with someone else",
    open: (n) => `A mortgage payment goes out every month to another lender, which means your equity is building even though the loan isn't here. ${n[0].toUpperCase()}${n.slice(1)} lets you tap that equity without moving the mortgage.`,
  },
  existingHelocElsewhere: {
    title: "HELOC Refinance Candidate",
    subject: "Move that balance to a better line",
    open: (n) => `You're already using a home equity line at another lender. Bringing the balance to ${n} usually means a lower rate, fewer logins, and one place to manage it.`,
    cta: "Compare and move",
  },
  higherCostDebt: {
    title: "Higher-Rate Debt Consolidation",
    subject: "Replace expensive balances with a single line",
    open: (n) => `Revolving balances and personal-loan payments are racking up interest. Moving that debt into ${n} can cut the rate and the number of payments you track each month.`,
  },
  reachingLiquidity: {
    title: "Liquidity Squeeze",
    subject: "Access cash without selling assets",
    open: (n) => `Savings are being drawn down and investments are moving into checking. ${n[0].toUpperCase()}${n.slice(1)} lets you borrow against equity instead of cashing out positions.`,
  },

  // --- Demographic ---

  dualIncome: {
    title: "Dual-Income Household",
    subject: "Two incomes, one plan",
    open: (n) => `Two paychecks land in this household. ${n[0].toUpperCase()}${n.slice(1)} is easiest to qualify for and fund when income comes from both sides.`,
  },
  parentYoung: {
    title: "Parents of Young Children",
    subject: "The years that make this matter most",
    open: (n) => `Daycare, pediatric visits and kids' spending are a standing part of your month. Families at this stage get the most out of ${n}.`,
  },
  parentSchoolAge: {
    title: "Parents of School-Age Kids",
    subject: "The school years go faster than the bill",
    open: (n) => `School fees and activities follow your calendar every year. ${n[0].toUpperCase()}${n.slice(1)} is how families get ahead of the bigger bill that comes later.`,
  },
  homeowner: {
    title: "Homeowner",
    subject: "Your home is part of your financial picture",
    open: (n) => `Property taxes, insurance and upkeep say this is your home, not a rental. ${n[0].toUpperCase()}${n.slice(1)} is built around owning rather than renting.`,
  },
  renter: {
    title: "Renter",
    subject: "Made for renting, not owning",
    open: (n) => `Rent goes out monthly and there's no mortgage in the picture. ${n[0].toUpperCase()}${n.slice(1)} is designed for that setup — no home equity required.`,
  },
  preRetiree: {
    title: "Approaching Retirement",
    subject: "The decade that decides the next thirty years",
    open: (n) => `You're in peak earning years with retirement in view. This is the window where ${n} changes the outcome most.`,
  },
  youngProfessional: {
    title: "Early Career",
    subject: "Start it now, thank yourself later",
    open: (n) => `A first steady paycheck alongside student loans and city living. ${n[0].toUpperCase()}${n.slice(1)} is built to start small and grow with the income.`,
  },
  selfEmployed: {
    title: "Self-Employed",
    subject: "Built for uneven income",
    open: (n) => `Income arrives from several clients on an uneven schedule. ${n[0].toUpperCase()}${n.slice(1)} is underwritten on deposit history, not a W-2.`,
  },
  ownerOperator: {
    title: "Owner-Operator",
    subject: "Business and household in one account",
    open: (n) => `Business income and household spending share the same account today. ${n[0].toUpperCase()}${n.slice(1)} is the cleanest way to separate the two without adding work.`,
  },
  multiVehicle: {
    title: "Multi-Vehicle Household",
    subject: "Two cars, two premiums",
    open: (n) => `There's more than one vehicle in the household, each with its own policy. ${n[0].toUpperCase()}${n.slice(1)} prices them together instead of separately.`,
  },
  affluentHousehold: {
    title: "Affluent Household",
    subject: "A setup that matches the balance sheet",
    open: (n) => `Your spending pattern reflects a household whose finances have outgrown standard products. ${n[0].toUpperCase()}${n.slice(1)} is where that complexity gets handled properly.`,
  },
  petOwner: {
    title: "Pet Owner",
    subject: "For the member of the family with four legs",
    open: (n) => `Vet visits and pet spending run through the year. ${n[0].toUpperCase()}${n.slice(1)} keeps one unexpected visit from becoming a hard decision.`,
  },
  relocated: {
    title: "Recently Relocated",
    subject: "New city, worth a fresh look",
    open: (n) => `Your everyday spending moved to a new area recently. A move is the natural moment to get ${n} set up correctly for where you are now.`,
  },
  emptyNester: {
    title: "Empty Nester",
    subject: "The budget just changed shape",
    open: (n) => `Family spending has eased while travel and dining have picked up. ${n[0].toUpperCase()}${n.slice(1)} fits the version of the budget you're living in now.`,
  },
  longTenureHomeowner: {
    title: "Long-Tenure Homeowner",
    subject: "You've owned long enough for this to matter",
    open: (n) => `Seven or more years of payments have built real equity in your home. ${n[0].toUpperCase()}${n.slice(1)} is the cleanest way to access it when a large expense comes up.`,
  },
  dualIncomeHomeowner: {
    title: "Dual-Income Homeowner",
    subject: "Two incomes, one house, more options",
    open: (n) => `Two paychecks land in this household and the mortgage is well in hand. ${n[0].toUpperCase()}${n.slice(1)} is easier to qualify for and manage with that income foundation.`,
  },
  preRetireeHomeowner: {
    title: "Pre-Retiree Homeowner",
    subject: "The right window for a low-rate backstop",
    open: (n) => `You're in the years when a paid-down mortgage and upcoming life changes overlap. ${n[0].toUpperCase()}${n.slice(1)} gives you flexible access to equity before you need it.`,
  },

  // --- Behavioral ---

  competitorProduct: {
    title: "Held at Another Provider",
    subject: "You already have this — just not with us",
    open: (n) => `A regular payment goes to another provider for the same thing. Bringing ${n} in-house usually means better terms and one fewer login.`,
    cta: "Compare side by side",
  },
  researchIntent: {
    title: "Actively Shopping",
    subject: "Since you're already comparing",
    open: (n) => `Comparison and quote activity shows up in recent spending. Before you decide, here's what ${n} looks like with your history already on file.`,
    cta: "See your terms",
  },
  digitalEngaged: {
    title: "Highly Digital",
    subject: "Two taps and it's done",
    open: (n) => `You handle almost everything from the app. ${n[0].toUpperCase()}${n.slice(1)} opens the same way — no branch visit, no paperwork.`,
    cta: "Open it in the app",
  },
  educationSpend: {
    title: "Investing in Their Education",
    subject: "You're already spending on their education",
    open: (n) => `Tutoring, fees and enrichment show up through the school year. ${n[0].toUpperCase()}${n.slice(1)} makes the bigger education bill ahead a lot easier to meet.`,
  },
  educationOutbound: {
    title: "Education Plan Elsewhere",
    subject: "Your education savings are held elsewhere",
    open: (n) => `Education contributions leave regularly for an outside plan. Moving to ${n} keeps the same tax treatment and puts it next to your other accounts.`,
    cta: "Compare plans",
  },

  // --- Life event ---
  incomeStepUp: {
    title: "Recent Income Increase",
    subject: "Your paycheck grew — decide where it goes",
    open: (n) => `Your paycheck stepped up and has held there for a few months. This is the window where directing part of the increase into ${n} is easiest.`,
  },
  householdFormation: {
    title: "New Household",
    subject: "Two lives, one set of accounts",
    open: (n) => `Rent, utilities and groceries are being shared now. ${n[0].toUpperCase()}${n.slice(1)} is usually the first thing worth setting up jointly.`,
  },
};

const FAMILY_FALLBACK: Record<SignalFamily, Angle> = {
  "life-event": {
    title: "Life Event Trigger",
    subject: "Something changed — here's what it opens up",
    open: (n) => `Your day-to-day money movement shifted recently. When life moves, ${n} is one of the first things worth revisiting.`,
  },
  behavioral: {
    title: "Behavioral Match",
    subject: "You're already doing this — here's a better fit",
    open: (n) => `Your recent activity lines up closely with what ${n} is built for. Bringing it in-house usually means fewer moving parts and better terms.`,
  },
  financial: {
    title: "Financially Ready",
    subject: "Your numbers are ready for this",
    open: (n) => `Your balances and obligations have been trending in a direction that makes ${n} a comfortable next step — no change to your day-to-day required.`,
  },
  demographic: {
    title: "Household Fit",
    subject: "Built for households like yours",
    open: (n) => `Households shaped like yours tend to get the most out of ${n}. Here's the short version of how it would work.`,
  },
  risk: {
    title: "Pre-Qualified",
    subject: "You're already through the hard part",
    open: (n) => `Your account history clears the checks we'd normally run for ${n}. That means a shorter path and fewer questions.`,
  },
};

/** seed label -> archetype key, built once from the libraries above. */
const ARCHETYPE_BY_LABEL: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const libs = [FINANCIAL, DEMOGRAPHIC, EXTRA_BEHAVIORAL, EXTRA_LIFE_EVENT];
  for (const lib of libs) {
    for (const [key, seed] of Object.entries(lib)) map[seed.label.toLowerCase()] = key;
  }
  return map;
})();

function composeMessage(
  flow: ProductFlow,
  family: SignalFamily,
  label: string,
  evidence: string,
): SignalMessage {
  const profile = benefitsForFlow(flow);
  const archetype = ARCHETYPE_BY_LABEL[label.toLowerCase()];
  const angle = (archetype && ARCHETYPE_ANGLE[archetype]) || FAMILY_FALLBACK[family];
  const [b1, b2, b3] = profile.benefits;

  const body = [
    "Hi {{first_name}},",
    angle.open(profile.noun),
    `What that means for you: ${b1.toLowerCase()}, ${b2.toLowerCase()}, and ${b3.toLowerCase()}.`,
    profile.proof,
  ].join("\n");

  return {
    signalLabel: label,
    title: `${angle.title} · ${flow.name}`,
    subject: angle.subject,
    body,
    cta: angle.cta ?? profile.ctaVerb,
    benefits: profile.benefits,
  };
}

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
      message: copy
        ? { ...copy, benefits: benefitsForFlow(flow).benefits }
        : composeMessage(flow, family, sig.label, sig.evidence),
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
      message: composeMessage(flow, family, s.label, s.evidence),
      channels: CHANNELS_BY_FAMILY[family],
    }));

  const filters: EligibilityFilter[] = kept
    .filter(([family]) => family === "risk")
    .map(([, s]) => ({
      id: `${flow.id}--filter--${slug(s.label)}`,
      label: s.label,
      evidence: s.evidence,
      passRate: Math.min(FILTER_PASS_MAX, Math.max(FILTER_PASS_MIN, s.weight ?? 0.9)),
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

export function groupByFamily(signals: ExpandedSignal[]): Array<[SignalFamily, ExpandedSignal[]]> {
  return SIGNAL_FAMILY_ORDER.map(
    (family) => [family, signals.filter((s) => s.family === family)] as [SignalFamily, ExpandedSignal[]],
  ).filter(([, list]) => list.length > 0);
}

/** Triggered audience narrowed by the enabled eligibility filters. */
export function qualifiedAudience(
  flow: ProductFlow,
  signals: ExpandedSignal[],
  enabledSignals: Set<string>,
  filters: EligibilityFilter[],
  enabledFilters: Set<string>,
): number {
  const triggered = enabledAudience(flow, signals, enabledSignals);
  let removed = 0;
  filterCascade(triggered, filters, enabledFilters).forEach((v) => {
    removed += v;
  });
  return triggered - removed;
}


/**
 * Split the flow audience across every signal with a largest-remainder
 * allocation, so the parts sum EXACTLY to `flow.estimatedAudience`.
 */
export function allocateSignalAudiences(
  flow: ProductFlow,
  signals: ExpandedSignal[],
): Map<string, number> {
  const out = new Map<string, number>();
  if (signals.length === 0) return out;
  const total = flow.estimatedAudience;
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0) || 1;

  const exact = signals.map((s) => (total * s.weight) / totalWeight);
  const floors = exact.map((v) => Math.floor(v));
  let remainder = total - floors.reduce((a, b) => a + b, 0);

  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  const alloc = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) {
    alloc[order[k].i] += 1;
  }
  signals.forEach((s, i) => out.set(s.id, alloc[i]));
  return out;
}

/** Audience attributable to a signal. Parts sum exactly to the flow total. */
export function signalAudience(
  flow: ProductFlow,
  signals: ExpandedSignal[],
  _enabled: Set<string>,
  signal: ExpandedSignal,
): number {
  return allocateSignalAudiences(flow, signals).get(signal.id) ?? 0;
}

/** Flow audience limited to the enabled signals — the exact sum of their rows. */
export function enabledAudience(
  flow: ProductFlow,
  signals: ExpandedSignal[],
  enabled: Set<string>,
): number {
  const alloc = allocateSignalAudiences(flow, signals);
  return signals
    .filter((s) => enabled.has(s.id))
    .reduce((sum, s) => sum + (alloc.get(s.id) ?? 0), 0);
}

/**
 * Per-filter removals shown as a cascade: each enabled filter removes from the
 * audience left by the filters above it, and the last enabled filter absorbs
 * the rounding remainder so the rows sum EXACTLY to `triggered - qualified`.
 * Disabled filters map to 0.
 */
export function filterCascade(
  triggered: number,
  filters: EligibilityFilter[],
  enabled: Set<string>,
): Map<string, number> {
  const out = new Map<string, number>();
  const on = filters.filter((f) => enabled.has(f.id));
  filters.forEach((f) => out.set(f.id, 0));
  if (on.length === 0) return out;

  const qualified = Math.round(triggered * filterPassRate(filters, enabled));
  const totalRemoved = Math.max(0, triggered - qualified);

  let remaining = triggered;
  let allocated = 0;
  on.forEach((f, idx) => {
    let removed: number;
    if (idx === on.length - 1) {
      removed = totalRemoved - allocated;
    } else {
      removed = Math.round(remaining * (1 - f.passRate));
      removed = Math.min(removed, totalRemoved - allocated);
    }
    removed = Math.max(0, removed);
    out.set(f.id, removed);
    allocated += removed;
    remaining -= removed;
  });
  return out;
}


/* ------------------------------------------------------------------ *
 * Public helpers used by the signal editor (add / edit signals).      *
 * ------------------------------------------------------------------ */

export const FAMILY_SIGNAL_CAP = FAMILY_CAP;

/** Channels a signal of this family goes out on. */
export function channelsForFamily(family: SignalFamily): string[] {
  return CHANNELS_BY_FAMILY[family];
}

/** Builds the personalization payload for a hand-authored / edited signal. */
export function composeSignalMessage(
  flow: ProductFlow,
  family: SignalFamily,
  label: string,
  evidence: string,
): SignalMessage {
  return composeMessage(flow, family, label, evidence);
}

/** Stable id for a custom or library signal added to a flow. */
export function customSignalId(flowId: string, label: string): string {
  return `${flowId}--custom--${slug(label)}`;
}

export function customFilterId(flowId: string, label: string): string {
  return `${flowId}--filter--custom--${slug(label)}`;
}
