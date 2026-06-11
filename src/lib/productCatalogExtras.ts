// Extra product metadata for the redesigned Campaign Builder.
// Not stored on PRODUCT_FLOWS itself to avoid bloating the existing 44-entry
// catalog. All copy is anonymized — no live competitor / BoA product names.
// Numbers are deterministic mocks; rates / fees mirror common industry shapes.

import type { FlowCategory } from "./productAutomatedFlows";

export interface RateRow {
  tier: string;
  rate: string;
  note?: string;
}

export interface ProductMechanics {
  tagline: string;
  fee: string;
  rateTable?: RateRow[];
  features: string[];
}

export type ExclusionType = "financial" | "behavioral" | "life-event" | "demographic" | "risk";

export const SIGNAL_FAMILIES: ExclusionType[] = [
  "life-event",
  "behavioral",
  "financial",
  "demographic",
  "risk",
];

export interface ProductExclusion {
  id: string;
  label: string;
  removedPct: number; // share of eligible audience removed (0-1)
  rationale: string;  // plain-English, customer-protective tone
  type: ExclusionType;
}

export type MessageAngle = "behavioral" | "life-event" | "financial-journey";

export interface ProductMessageVariant {
  angle: MessageAngle;
  angleLabel: string;
  signalTag: string;            // "Why this angle" chip
  subject: string;
  body: string;                 // 2-3 sentences
  cta: string;
}

// ────────────────────────────────────────────────────────────────────────────
//  Category-level defaults — used when a product doesn't have an override.
// ────────────────────────────────────────────────────────────────────────────

const CATEGORY_DEFAULT_MECHANICS: Record<FlowCategory, ProductMechanics> = {
  Cards: {
    tagline: "Flexible rewards on everyday spend.",
    fee: "No annual fee",
    features: [
      "Contactless and mobile-wallet ready",
      "Fraud monitoring and zero-liability protection",
      "Optional balance alerts and category caps",
    ],
  },
  Deposits: {
    tagline: "Everyday account with the basics dialed in.",
    fee: "$0 monthly fee with qualifying activity",
    features: [
      "Direct deposit and bill-pay included",
      "Mobile check capture and instant transfers",
      "Free network ATM access",
    ],
  },
  Lending: {
    tagline: "Predictable financing for a single planned outlay.",
    fee: "No application fee",
    features: [
      "Fixed monthly payment over a chosen term",
      "Soft-pull pre-qualification in minutes",
      "Auto-pay rate discount",
    ],
  },
  Wealth: {
    tagline: "Long-horizon account with tax-aware structure.",
    fee: "No account minimum to open",
    features: [
      "Diversified model portfolios",
      "Tax-loss harvesting where eligible",
      "Goal tracking and automated rebalancing",
    ],
  },
  Insurance: {
    tagline: "Coverage scaled to current household needs.",
    fee: "Premium tied to coverage tier",
    features: [
      "Online application with instant quote",
      "Bundle discount when paired with a deposit account",
      "Beneficiary updates without re-underwriting",
    ],
  },
};

// ────────────────────────────────────────────────────────────────────────────
//  Product-specific mechanics overrides for marquee products.
// ────────────────────────────────────────────────────────────────────────────

const MECHANICS_OVERRIDES: Record<string, ProductMechanics> = {
  "category-cashback-card": {
    tagline: "3% / 2% / 1% — you pick the top category, we handle the rest.",
    fee: "No annual fee",
    rateTable: [
      { tier: "Chosen category", rate: "3%", note: "one of six — switch monthly" },
      { tier: "Grocery + warehouse", rate: "2%", note: "automatic" },
      { tier: "Everything else", rate: "1%" },
    ],
    features: [
      "Switch your 3% category once per calendar month",
      "Quarterly cap on bonus-tier spend, unlimited 1% beyond",
      "Cashback redeems as statement credit or to a linked deposit account",
    ],
  },
  "flat-cashback-card": {
    tagline: "Unlimited 1.5% cash back on every swipe — no categories to track.",
    fee: "No annual fee",
    rateTable: [{ tier: "All purchases", rate: "1.5%", note: "no cap" }],
    features: [
      "No bonus categories to activate",
      "Sign-on cashback after qualifying spend in the first 90 days",
      "Cell-phone protection when bill is paid on card",
    ],
  },
  "travel-card": {
    tagline: "1.5x points everywhere, 3x on travel and dining.",
    fee: "$95 annual fee — waived first year",
    rateTable: [
      { tier: "Travel & dining", rate: "3x points" },
      { tier: "Everything else", rate: "1.5x points" },
    ],
    features: [
      "No foreign transaction fees",
      "Trip-delay and lost-luggage protection",
      "Points redeemable 1:1 against any travel charge",
    ],
  },
  "premium-travel-card": {
    tagline: "Lounge access plus accelerated earn on travel.",
    fee: "$395 annual fee",
    rateTable: [
      { tier: "Airfare booked direct", rate: "5x points" },
      { tier: "Hotels & dining", rate: "3x points" },
      { tier: "Everything else", rate: "1x point" },
    ],
    features: [
      "Priority lounge network membership included",
      "$300 annual travel credit",
      "Trip insurance and rental car CDW coverage",
    ],
  },
  "ultra-premium-travel-card": {
    tagline: "Concierge, elite status, and the broadest lounge network.",
    fee: "$695 annual fee",
    rateTable: [
      { tier: "Direct airfare & hotels", rate: "5x points" },
      { tier: "Dining worldwide", rate: "3x points" },
      { tier: "Everything else", rate: "1x point" },
    ],
    features: [
      "24/7 personal concierge",
      "$300 travel credit + $200 dining credit",
      "Complimentary elite status with partner hotel and rental chains",
    ],
  },
  "balance-transfer-card": {
    tagline: "0% intro APR for 18 months on transferred balances.",
    fee: "3% balance-transfer fee, no annual fee",
    rateTable: [
      { tier: "Intro APR (18 mo)", rate: "0%", note: "on transfers made in first 60 days" },
      { tier: "Standard purchase APR", rate: "18.49% – 28.49% variable" },
    ],
    features: [
      "One application covers transfers from multiple issuers",
      "No penalty APR on first late payment",
      "Soft-pull pre-qualification",
    ],
  },
  "cobrand-card": {
    tagline: "Branded rewards stacked on top of a familiar partner ecosystem.",
    fee: "$0 – $95 depending on tier",
    rateTable: [
      { tier: "Partner brand", rate: "3x points" },
      { tier: "Travel & dining", rate: "2x points" },
      { tier: "Everything else", rate: "1x point" },
    ],
    features: [
      "Welcome bonus paid in partner-brand currency",
      "Free checked bag or status perk where applicable",
      "Points pool with linked partner loyalty account",
    ],
  },
  "high-yield-savings": {
    tagline: "4.25% APY on every dollar — no balance tiers, no caps.",
    fee: "No monthly fee, $0 minimum",
    rateTable: [{ tier: "All balances", rate: "4.25% APY", note: "variable" }],
    features: [
      "Same-day transfers to a linked checking account",
      "Up to 6 outbound transfers per month",
      "FDIC-insured up to the standard limit",
    ],
  },
  "core-savings": {
    tagline: "Companion savings with automatic round-ups and goal buckets.",
    fee: "$0 with linked checking",
    rateTable: [{ tier: "All balances", rate: "0.40% APY" }],
    features: [
      "Round-ups from every linked card swipe",
      "Up to five named goal buckets",
      "Auto-transfer scheduler on payday",
    ],
  },
  "certificate-of-deposit": {
    tagline: "Fixed yield, fixed term — lock in today's rate.",
    fee: "No fee; early-withdrawal penalty applies",
    rateTable: [
      { tier: "6-month", rate: "4.50% APY" },
      { tier: "12-month", rate: "4.85% APY" },
      { tier: "24-month", rate: "4.25% APY" },
    ],
    features: [
      "Auto-renewal at then-prevailing rate",
      "Optional monthly interest payout",
      "FDIC-insured up to the standard limit",
    ],
  },
  "everyday-checking": {
    tagline: "Primary checking with bill-pay, mobile deposit, and overdraft choice.",
    fee: "$12 monthly fee, waived with direct deposit or $1,500 balance",
    features: [
      "Free incoming wires and mobile check capture",
      "Choose overdraft protection: decline, transfer, or line-of-credit",
      "Free network ATMs nationwide",
    ],
  },
  "starter-checking": {
    tagline: "No-overdraft checking built for first-timers.",
    fee: "$0 monthly fee",
    features: [
      "No overdraft fees — transactions decline instead",
      "Co-owner option for a parent or guardian",
      "Built-in budgeting view on every transaction",
    ],
  },
  "relationship-checking": {
    tagline: "Fee waivers and rate boosts that scale with household balances.",
    fee: "$25 monthly fee, waived at $20,000 combined balance",
    features: [
      "Boosted APY on linked savings and CDs",
      "Free outgoing wires and check orders",
      "Dedicated relationship banker line",
    ],
  },
  "529-plan": {
    tagline: "Tax-advantaged education savings with age-based glide-paths.",
    fee: "No account fee; underlying fund expenses apply",
    features: [
      "State tax deduction where applicable",
      "Age-based portfolio rebalances toward bonds as the beneficiary nears college",
      "Beneficiary transferable to another family member",
    ],
  },
  "ira": {
    tagline: "Traditional, Roth, and Rollover IRAs in a single account flow.",
    fee: "$0 account fee",
    features: [
      "Pick Traditional, Roth, or Rollover during signup",
      "Automatic contribution scheduler stops at the annual IRS limit",
      "Catch-up contribution unlocks automatically at age 50",
    ],
  },
  "mortgage": {
    tagline: "Fixed-rate purchase and refinance with on-app rate lock.",
    fee: "Standard closing costs; no lender fee on relationship customers",
    rateTable: [
      { tier: "30-year fixed", rate: "6.75%" },
      { tier: "15-year fixed", rate: "6.05%" },
      { tier: "7/6 ARM", rate: "6.40%" },
    ],
    features: [
      "Soft-pull pre-approval in 24 hours",
      "Float-down option once before closing",
      "Bi-weekly auto-pay reduces principal faster",
    ],
  },
  "heloc": {
    tagline: "Draw against home equity — pay interest only on what you use.",
    fee: "No annual fee; closing costs may apply",
    rateTable: [
      { tier: "Intro APR (6 mo)", rate: "5.99%" },
      { tier: "Variable APR after intro", rate: "Prime + 0.50%" },
    ],
    features: [
      "10-year draw period, 20-year repayment",
      "Convert any portion to a fixed-rate sub-loan",
      "Online draw and payment from the same dashboard",
    ],
  },
  "auto-loan": {
    tagline: "Direct or dealer-funded auto financing with rate lock.",
    fee: "No application fee",
    rateTable: [
      { tier: "New auto, 60 mo", rate: "6.49%" },
      { tier: "Used auto, 60 mo", rate: "7.24%" },
    ],
    features: [
      "Pre-approval valid at dealer for 45 days",
      "Auto-pay rate discount of 0.25%",
      "Skip-a-payment option once per year",
    ],
  },
  "hsa": {
    tagline: "Triple-tax-advantaged health savings with invested-balance option.",
    fee: "$0 with $1,000 combined balance",
    features: [
      "Payroll-direct contributions pre-tax",
      "Invest balance above $1,000 in a diversified menu",
      "Debit card for qualified medical spend",
    ],
  },
  "personal-loan": {
    tagline: "Unsecured installment loan for one-time, planned expenses.",
    fee: "No prepayment penalty; origination fee waived for relationship customers",
    rateTable: [
      { tier: "APR range", rate: "9.49% – 23.99%", note: "based on credit profile" },
      { tier: "Terms", rate: "24 – 60 months" },
    ],
    features: [
      "Fixed monthly payment",
      "Funds disbursed as soon as next business day",
      "Soft-pull rate check before applying",
    ],
  },
};

// ────────────────────────────────────────────────────────────────────────────
//  Exclusions — category defaults + product-specific.
// ────────────────────────────────────────────────────────────────────────────

const FIN = (id: string, label: string, removedPct: number, rationale: string): ProductExclusion =>
  ({ id, label, removedPct, rationale, type: "financial" });
const BEH = (id: string, label: string, removedPct: number, rationale: string): ProductExclusion =>
  ({ id, label, removedPct, rationale, type: "behavioral" });
const LIFE = (id: string, label: string, removedPct: number, rationale: string): ProductExclusion =>
  ({ id, label, removedPct, rationale, type: "life-event" });
const DEMO = (id: string, label: string, removedPct: number, rationale: string): ProductExclusion =>
  ({ id, label, removedPct, rationale, type: "demographic" });
const RISK = (id: string, label: string, removedPct: number, rationale: string): ProductExclusion =>
  ({ id, label, removedPct, rationale, type: "risk" });

// Universal signal additions applied to every product so all 5 families have content.
const UNIVERSAL_SIGNALS: ProductExclusion[] = [
  LIFE("recent-life-event", "Active life-event window", 0.04, "Households inside a recent life-event window are prioritized — timing materially lifts response."),
  LIFE("stale-life-context", "Stale household context", 0.03, "No life-event signals refreshed in 18+ months — held for re-discovery before outreach."),
  DEMO("outside-target-age", "Outside product target age band", 0.05, "Age outside the band where this product's structure typically pays off."),
  DEMO("region-unsupported", "Region without product availability", 0.02, "Product not currently offered in this region or licensed jurisdiction."),
  RISK("fraud-watch", "Active fraud / dispute watch", 0.02, "Open fraud or dispute case — held until the case clears to avoid noisy onboarding."),
  RISK("aml-review", "AML review in progress", 0.01, "Pending AML review — standard policy to pause cross-sell outreach."),
];

const CATEGORY_DEFAULT_EXCLUSIONS: Record<FlowCategory, ProductExclusion[]> = {
  Cards: [
    FIN("thin-file", "Thin credit file", 0.08, "Not enough credit history yet — we hold off until a few months of activity build up."),
    FIN("recent-delinq", "Recent 60-day delinquency", 0.05, "A fresh missed payment elsewhere means now isn't the right moment to add a new line."),
    BEH("nsf-cluster", "Recent NSF or overdraft cluster", 0.04, "Repeated overdrafts in the last 60 days suggest a tight runway — protects against added strain."),
    BEH("gambling-heavy", "Cash-advance / gambling-heavy spend", 0.03, "Spend concentrated in cash-advance or gambling categories — we'd rather not add revolving credit."),
  ],
  Lending: [
    FIN("dti-high", "Debt-to-income above threshold", 0.11, "Existing obligations already use most monthly cash flow — adding more would tip the ratio."),
    FIN("recent-bankruptcy", "Recent bankruptcy filing", 0.02, "Standard underwriting waiting period before re-extending credit."),
    BEH("income-instability", "Volatile income pattern", 0.06, "Payroll has been irregular for 3+ months — a fixed monthly payment could be hard to absorb."),
    BEH("recent-late-mortgage", "Recent late mortgage payment", 0.03, "Late housing payment in the last 90 days — we'd rather stabilize that first."),
  ],
  Deposits: [
    FIN("chexsystems-flag", "Prior deposit-account closure", 0.04, "Closed-for-cause history at another institution — routed to the no-overdraft starter product instead."),
    BEH("dormant-pattern", "Dormant primary account", 0.05, "Customer hasn't transacted in 6+ months — re-engagement campaign fits better than a new account."),
  ],
  Wealth: [
    FIN("liquid-below-min", "Liquid assets below program minimum", 0.18, "Doesn't yet meet the threshold where this product's structure pays off in fees-vs-yield."),
    FIN("retirement-cap-met", "Already at annual contribution cap", 0.02, "Already maxed the relevant IRS limit for this year — wait until January."),
    BEH("active-elsewhere", "Active wealth relationship at peer institution", 0.07, "Currently being served somewhere else — switch-incentive campaign fits better."),
  ],
  Insurance: [
    FIN("coverage-exists", "Already insured with comparable coverage", 0.14, "Carrier and policy size match what we'd recommend — no need to disrupt it."),
    BEH("recent-claim-cluster", "Recent multi-claim cluster", 0.04, "Recent claims pattern would price the new policy unfavorably — wait for the rolling-12 window to clear."),
    BEH("address-flux", "Address still in flux", 0.03, "Multiple addresses in the last 90 days — wait until residence stabilizes."),
  ],
};

const EXCLUSIONS_OVERRIDES: Record<string, ProductExclusion[]> = {
  "heloc": [
    FIN("ltv-high", "Loan-to-value above 80%", 0.16, "Not enough equity headroom yet — would push combined LTV past program limits."),
    FIN("recent-late-mortgage", "Recent late mortgage payment", 0.04, "Late housing payment in the last 90 days — we'd rather stabilize that first."),
    BEH("rapid-equity-drawdown", "Rapid prior equity drawdown", 0.03, "Cashed out home equity in the last 12 months — protects against over-leverage."),
    BEH("listing-active", "Property listed for sale", 0.02, "Home is on the market — a HELOC pulled now would complicate closing."),
  ],
  "mortgage": [
    FIN("dti-high", "Debt-to-income above threshold", 0.13, "Existing obligations already use most monthly cash flow — adding a mortgage would tip the ratio."),
    FIN("down-payment-short", "Down-payment savings short of 5%", 0.21, "Pre-approval would expire before reserves hit the minimum — surface a savings goal instead."),
    BEH("residency-short", "Less than 12 months at current employer", 0.05, "Underwriting prefers a year of continuous income before approving a 30-year obligation."),
  ],
  "category-cashback-card": [
    FIN("thin-file", "Thin credit file", 0.08, "Not enough credit history yet — surface the starter / secured card instead."),
    BEH("nsf-cluster", "Recent NSF or overdraft cluster", 0.04, "Repeated overdrafts in the last 60 days suggest a tight runway — protects against added strain."),
    BEH("single-category-spend", "Spend lacks bonus-category fit", 0.06, "Spending is concentrated in one category that's already at 1% — flat-rate card fits better."),
  ],
  "high-yield-savings": [
    FIN("low-checking-buffer", "Checking buffer below one month of bills", 0.09, "Moving cash into a transfer-limited account would risk overdrafts — build the buffer first."),
    BEH("dormant-pattern", "Dormant deposit relationship", 0.04, "No transactions in 6+ months — re-engagement fits better than a new account."),
  ],
  "529-plan": [
    FIN("liquid-below-min", "No discretionary monthly surplus", 0.12, "Households without monthly surplus would feel any contribution as cash-flow pressure."),
    BEH("competing-saving-goal", "Active down-payment savings goal", 0.05, "Currently saving toward a home — prioritizing 529 could delay that closer goal."),
  ],
};

// ────────────────────────────────────────────────────────────────────────────
//  Message variants — 3 angles per product. Marquee products get bespoke copy;
//  the rest use category templates with a product name substituted in.
// ────────────────────────────────────────────────────────────────────────────

const ANGLE_META: Record<MessageAngle, { angleLabel: string; signalTag: string }> = {
  behavioral: {
    angleLabel: "Behavioral / spend-pattern",
    signalTag: "Top-3 spending categories",
  },
  "life-event": {
    angleLabel: "Life-event driven",
    signalTag: "Recent life-event signal",
  },
  "financial-journey": {
    angleLabel: "Financial-journey driven",
    signalTag: "Long-arc goal context",
  },
};

const MESSAGE_OVERRIDES: Record<string, Record<MessageAngle, { subject: string; body: string; cta: string }>> = {
  "category-cashback-card": {
    behavioral: {
      subject: "Your transit and gym swipes could earn 3% back",
      body: "Looks like your top two everyday categories this quarter are transit and fitness. This card lets you pick transit as your 3% category and still earns 2% on the gym side.",
      cta: "See the rewards math",
    },
    "life-event": {
      subject: "New routine, new top category",
      body: "After a few months of new spending patterns, your bonus category looks ready for a switch. Pick the one that fits today and we'll handle the rest.",
      cta: "Switch my bonus category",
    },
    "financial-journey": {
      subject: "Turn the rewards into the goal you're already saving for",
      body: "You've been building toward a planned big-ticket purchase. Route the cash back from this card straight into the same savings bucket and the goal arrives sooner.",
      cta: "Link rewards to my goal",
    },
  },
  "high-yield-savings": {
    behavioral: {
      subject: "Your checking buffer is doing nothing — at 4.25% APY it could",
      body: "Your everyday balance has stayed comfortably above what you need for monthly bills. Anything above that buffer earns 4.25% APY here with same-day access back.",
      cta: "Move the spare buffer",
    },
    "life-event": {
      subject: "Fresh inflow, fresh place to park it",
      body: "Looks like a sizable one-time deposit just landed. While you decide what's next, 4.25% APY beats sitting in checking — and it's one same-day transfer away.",
      cta: "Open in 60 seconds",
    },
    "financial-journey": {
      subject: "The down-payment fund deserves a yield",
      body: "Your savings have been climbing steadily toward what looks like a down-payment goal. Same-day access, 4.25% APY, and a named goal bucket to track the progress.",
      cta: "Start the goal bucket",
    },
  },
  "529-plan": {
    behavioral: {
      subject: "Tuition payments suggest a 529 could be doing the lifting",
      body: "Your monthly education-adjacent spend has been steady. A 529 redirects part of that flow into a tax-advantaged account with an age-based portfolio that adjusts as your child grows.",
      cta: "Open a 529",
    },
    "life-event": {
      subject: "Welcome to the family — and to a head start on college",
      body: "Now's the easiest time in the timeline to open a 529. Eighteen years of compounding turns small monthly contributions into a real difference at tuition time.",
      cta: "Start with $25/mo",
    },
    "financial-journey": {
      subject: "College is a long arc — let the calendar do the work",
      body: "An age-based 529 portfolio rebalances on its own as the beneficiary moves closer to college, shifting from growth to stability automatically. Set the monthly amount once and let it run.",
      cta: "See the projection",
    },
  },
  "heloc": {
    behavioral: {
      subject: "Your renovation spend would fit a HELOC better than the card",
      body: "Recent home-improvement charges have been climbing on credit. A HELOC carries a lower rate and lets you draw what you need — and only pay interest on what you draw.",
      cta: "Check my HELOC rate",
    },
    "life-event": {
      subject: "Just bought — here's how to fund the next phase",
      body: "Now that you're in the home, a HELOC stays open in the background for the projects that come up over the next few years. No need to apply each time.",
      cta: "Open my line",
    },
    "financial-journey": {
      subject: "Your equity has grown — put it to work without selling",
      body: "Years of mortgage payments have built real equity. A HELOC gives you flexible access to it for renovations, education, or consolidating higher-rate balances.",
      cta: "See available equity",
    },
  },
  "travel-card": {
    behavioral: {
      subject: "Three trips this year — your current card isn't keeping up",
      body: "Travel and dining are two of your top categories. This card earns 3x points on both, with no foreign transaction fees on the next trip.",
      cta: "See the points math",
    },
    "life-event": {
      subject: "Honeymoon coming up — here's a card built for it",
      body: "Welcome bonus, no foreign transaction fees, and trip-delay protection that kicks in if anything reroutes. The points cover a meaningful chunk of the next trip.",
      cta: "Apply before the trip",
    },
    "financial-journey": {
      subject: "Pay off the card, keep the points",
      body: "Your card balance trends to zero each month, which means rewards are pure upside. This card adds 3x on the categories you're already living in.",
      cta: "Switch my everyday card",
    },
  },
};

// Generic template for products without a bespoke override.
function defaultVariants(productName: string, category: FlowCategory): Record<MessageAngle, { subject: string; body: string; cta: string }> {
  return {
    behavioral: {
      subject: `${productName} fits how you already spend`,
      body: `Your everyday transaction pattern lines up with where ${productName.toLowerCase()} adds the most value. A quick look shows it would slot in without disrupting the accounts you already use.`,
      cta: "See how it fits",
    },
    "life-event": {
      subject: `A timely fit for ${productName.toLowerCase()}`,
      body: `Recent activity suggests a moment of change in your household. ${productName} is built for exactly this kind of transition and can be opened without re-doing your whole setup.`,
      cta: "Open in minutes",
    },
    "financial-journey": {
      subject: `${productName} supports the long-arc plan`,
      body: `Looking at where your finances have been heading over the last few quarters, ${productName} reinforces that direction. It works quietly in the background so the plan keeps moving.`,
      cta: "Add to my plan",
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
//  Public accessors.
// ────────────────────────────────────────────────────────────────────────────

export function getProductMechanics(productId: string, category: FlowCategory): ProductMechanics {
  return MECHANICS_OVERRIDES[productId] ?? CATEGORY_DEFAULT_MECHANICS[category];
}

export function getProductExclusions(productId: string, category: FlowCategory): ProductExclusion[] {
  const base = EXCLUSIONS_OVERRIDES[productId] ?? CATEGORY_DEFAULT_EXCLUSIONS[category];
  return [...base, ...UNIVERSAL_SIGNALS];
}

export function getProductMessageVariants(
  productId: string,
  productName: string,
  category: FlowCategory,
): ProductMessageVariant[] {
  const copy = MESSAGE_OVERRIDES[productId] ?? defaultVariants(productName, category);
  return (Object.keys(ANGLE_META) as MessageAngle[]).map((angle) => ({
    angle,
    angleLabel: ANGLE_META[angle].angleLabel,
    signalTag: ANGLE_META[angle].signalTag,
    ...copy[angle],
  }));
}

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  delta?: number; // amount removed from previous stage
}

export interface FamilyBreakdown {
  removed: number;
  signals: ProductExclusion[];
}

export function buildAudienceFunnel(
  estimatedAudience: number,
  exclusions: ProductExclusion[],
  disabled?: Set<ExclusionType>,
): {
  stages: FunnelStage[];
  finalCount: number;
  byFamily: Record<ExclusionType, FamilyBreakdown>;
} {
  // Apply families sequentially in SIGNAL_FAMILIES order so each removal is on the post-prior remainder.
  let remaining = estimatedAudience;
  const stages: FunnelStage[] = [{ id: "eligible", label: "Eligible base", count: estimatedAudience }];
  const byFamily = {} as Record<ExclusionType, FamilyBreakdown>;

  for (const fam of SIGNAL_FAMILIES) {
    const signals = exclusions.filter((e) => e.type === fam);
    const pct = signals.reduce((s, e) => s + e.removedPct, 0);
    const isDisabled = disabled?.has(fam) ?? false;
    const potentialRemoved = Math.round(remaining * pct);
    const after = isDisabled ? remaining : remaining - potentialRemoved;
    const removed = remaining - after;
    // Report each family's *potential* removed count for tooltip clarity, even when disabled.
    byFamily[fam] = { removed: isDisabled ? potentialRemoved : removed, signals };
    stages.push({ id: `after-${fam}`, label: `After ${FAMILY_META[fam].label.toLowerCase()}`, count: after, delta: removed });
    remaining = after;
  }

  return { stages, finalCount: remaining, byFamily };
}

export const FAMILY_POLARITY: Record<ExclusionType, "plus" | "minus"> = {
  "life-event": "plus",
  behavioral: "plus",
  demographic: "plus",
  financial: "minus",
  risk: "minus",
};

export const FAMILY_REASONS: Record<ExclusionType, { intro: string; reasons: string[] }> = {
  "life-event": {
    intro: "These signals qualify customers because we detected a timely moment:",
    reasons: [
      "New-home indicators",
      "Growing-family signals",
      "Job or role change detected",
      "Relocation footprint",
      "Recent education milestone",
    ],
  },
  behavioral: {
    intro: "These signals qualify customers because their engagement pattern fits:",
    reasons: [
      "Active digital engagement",
      "Recurring savings transfers",
      "Frequent advisor touchpoints",
      "Healthy category diversification",
    ],
  },
  demographic: {
    intro: "These signals qualify customers because their household profile fits:",
    reasons: [
      "Likely homeowner",
      "Dual-income household",
      "Family-stage match",
      "Tenure above cohort median",
    ],
  },
  financial: {
    intro: "These signals exclude customers to protect them from added strain:",
    reasons: [
      "Recent financial strain",
      "Cash buffer below two weeks of outflows",
      "Rising essential-spend share",
      "Recurring overdraft fees",
      "Debt-to-income above underwriting band",
    ],
  },
  risk: {
    intro: "These signals exclude customers based on recent risk posture:",
    reasons: [
      "Decreased credit-score trajectory",
      "NSF or overdraft in last 90 days",
      "Elevated DTI vs. underwriting band",
      "Recent card or ACH declines",
      "Open fraud or dispute case",
    ],
  },
};

export const FAMILY_META: Record<ExclusionType, { label: string; tone: string; border: string; iconBg: string; iconColor: string; chip: string }> = {
  "life-event": {
    label: "Life Event Signals",
    tone: "amber",
    border: "border-l-amber-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
  },
  behavioral: {
    label: "Behavioral Signals",
    tone: "blue",
    border: "border-l-blue-400",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    chip: "bg-blue-50 text-blue-700 border-blue-200",
  },
  financial: {
    label: "Financial Signals",
    tone: "emerald",
    border: "border-l-emerald-400",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  demographic: {
    label: "Demographic Signals",
    tone: "violet",
    border: "border-l-violet-400",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    chip: "bg-violet-50 text-violet-700 border-violet-200",
  },
  risk: {
    label: "Risk Signals",
    tone: "rose",
    border: "border-l-rose-400",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
  },
};
