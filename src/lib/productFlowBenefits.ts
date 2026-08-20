// Concrete, product-specific benefit facts used to make automated-flow
// personalization read like real marketing copy instead of a family template.
// Deterministic mock data — no backend calls, no dollar promises tied to a
// customer's own balances.

import type { ProductFlow } from "./productAutomatedFlows";

export interface ProductBenefitProfile {
  /** 3 short, concrete benefit lines shown as "What they get". */
  benefits: string[];
  /** One-line proof / reassurance used inside the message body. */
  proof: string;
  /** Action verb phrase used for the CTA. */
  ctaVerb: string;
  /** How the product is described mid-sentence. */
  noun: string;
}

const BY_ID: Record<string, ProductBenefitProfile> = {
  "529-plan": {
    benefits: ["Earnings grow tax-free for school", "Start with as little as $25 a month", "Anyone can contribute — including grandparents"],
    proof: "Opening one takes about five minutes and you can change the beneficiary later.",
    ctaVerb: "Open a 529",
    noun: "a 529 education account",
  },
  "self-directed-brokerage": {
    benefits: ["$0 commissions on stocks and ETFs", "Trade from the same app as your accounts", "Research and screeners included"],
    proof: "Positions sit next to your everyday accounts, so there's one place to look.",
    ctaVerb: "Explore investing",
    noun: "a self-directed brokerage account",
  },
  "robo-portfolio": {
    benefits: ["Diversified portfolio built for you", "Automatic rebalancing", "Low flat advisory fee"],
    proof: "Set a goal, fund it monthly, and the portfolio maintains itself.",
    ctaVerb: "Build a portfolio",
    noun: "a managed portfolio",
  },
  "hybrid-advisor-portfolio": {
    benefits: ["Managed portfolio plus a human advisor", "Unlimited planning conversations", "One fee, no product commissions"],
    proof: "You get the automation and someone to call when something changes.",
    ctaVerb: "Meet an advisor",
    noun: "an advisor-guided portfolio",
  },
  "wealth-management": {
    benefits: ["A dedicated advisor who knows your accounts", "Coordinated investing, tax and estate view", "Access to private-market strategies"],
    proof: "One relationship covering everything you already hold with us.",
    ctaVerb: "Talk to a wealth advisor",
    noun: "wealth management",
  },
  "private-wealth": {
    benefits: ["Dedicated private banking team", "Custom credit and liquidity solutions", "Trust and estate specialists on call"],
    proof: "Built for households whose finances no longer fit a standard product set.",
    ctaVerb: "Request an introduction",
    noun: "private wealth services",
  },
  ira: {
    benefits: ["Tax-advantaged retirement growth", "Traditional or Roth, your choice", "Automatic monthly contributions"],
    proof: "You can fund it once a year or a little every payday.",
    ctaVerb: "Open an IRA",
    noun: "an IRA",
  },
  "401k-rollover": {
    benefits: ["Consolidate old employer plans", "No rollover fee", "Keep the tax advantage intact"],
    proof: "We handle the paperwork with your former plan administrator.",
    ctaVerb: "Start a rollover",
    noun: "a 401(k) rollover",
  },
  "trust-estate": {
    benefits: ["Assets pass the way you intend", "Professional trustee services", "Coordinated with your investment plan"],
    proof: "A first conversation is a review, not a commitment.",
    ctaVerb: "Review your estate plan",
    noun: "trust and estate services",
  },
  mortgage: {
    benefits: ["Rate locked while you shop", "Underwriting on file, faster close", "No lender origination fee for clients"],
    proof: "Pre-approval is good for 90 days and costs nothing.",
    ctaVerb: "Get pre-approved",
    noun: "a mortgage",
  },
  heloc: {
    benefits: ["Draw only what you use", "Interest-only during the draw period", "No closing costs on most lines"],
    proof: "The line stays open even when the balance is zero.",
    ctaVerb: "Check your line",
    noun: "a home equity line",
  },
  "second-home-mortgage": {
    benefits: ["Financing built for a second property", "Rate locked while you shop", "Rental income considered"],
    proof: "Pre-approval before you tour makes an offer far stronger.",
    ctaVerb: "Get pre-approved",
    noun: "a second-home mortgage",
  },
  "construction-loan": {
    benefits: ["Funds released as work completes", "Interest only during the build", "Converts to a permanent mortgage"],
    proof: "One approval covers both the build and the mortgage that follows.",
    ctaVerb: "Plan your build",
    noun: "a construction loan",
  },
  "auto-loan": {
    benefits: ["Rate locked for 45 days", "Decision in minutes", "No prepayment penalty"],
    proof: "Walk into the dealership with financing already settled.",
    ctaVerb: "Check your rate",
    noun: "an auto loan",
  },
  "auto-refi": {
    benefits: ["Lower the monthly payment", "No fee to refinance", "Keep the same car, new terms"],
    proof: "Checking your rate won't affect your credit score.",
    ctaVerb: "Check refinance rate",
    noun: "an auto refinance",
  },
  "lease-buyout-loan": {
    benefits: ["Keep the car you already drive", "Skip the mileage and wear charges", "Fixed payment, no surprises"],
    proof: "We can quote the buyout before your lease-end date.",
    ctaVerb: "Quote your buyout",
    noun: "a lease buyout loan",
  },
  "rv-boat-loan": {
    benefits: ["Longer terms for larger purchases", "Fixed rate for the life of the loan", "Seasonal payment options"],
    proof: "Financing is settled before you negotiate at the dealer.",
    ctaVerb: "Check your rate",
    noun: "an RV or boat loan",
  },
  "motorcycle-loan": {
    benefits: ["Fast decision, fixed rate", "No prepayment penalty", "Finance gear with the bike"],
    proof: "Approval in hand makes the purchase a single visit.",
    ctaVerb: "Check your rate",
    noun: "a motorcycle loan",
  },
  "personal-loan": {
    benefits: ["Fixed rate, fixed end date", "Funds as soon as the next day", "No origination fee"],
    proof: "One predictable payment instead of several revolving ones.",
    ctaVerb: "Check your rate",
    noun: "a personal loan",
  },
  "personal-line-of-credit": {
    benefits: ["Borrow only what you draw", "Reuse the line as you repay", "No annual fee"],
    proof: "It sits ready in your app for the month things don't line up.",
    ctaVerb: "Open a line",
    noun: "a personal line of credit",
  },
  "wedding-loan": {
    benefits: ["Fixed payment through the planning", "Funds released on your timeline", "No prepayment penalty"],
    proof: "Deposits get paid on time without touching savings.",
    ctaVerb: "Check your rate",
    noun: "wedding financing",
  },
  "move-financing": {
    benefits: ["Covers deposits, movers and setup", "Fixed rate, short term", "Funds in days, not weeks"],
    proof: "One payment covers the whole move instead of several cards.",
    ctaVerb: "Check your rate",
    noun: "moving financing",
  },
  "student-loan-refi": {
    benefits: ["Consolidate several loans into one", "Lower rate for strong payers", "Choose your payoff timeline"],
    proof: "Checking your rate won't affect your credit score.",
    ctaVerb: "Check refinance rate",
    noun: "student loan refinancing",
  },
  "starter-checking": {
    benefits: ["No monthly fee", "Early access to direct deposit", "Overdraft grace on small amounts"],
    proof: "Setting up direct deposit takes one tap in the app.",
    ctaVerb: "Open checking",
    noun: "a checking account",
  },
  "everyday-checking": {
    benefits: ["Monthly fee waived with direct deposit", "Early paycheck access", "Nationwide fee-free ATMs"],
    proof: "Switching direct deposit takes about two minutes in the app.",
    ctaVerb: "Open checking",
    noun: "an everyday checking account",
  },
  "relationship-checking": {
    benefits: ["Rate boost on linked savings", "ATM fees refunded", "Priority service line"],
    proof: "The more you keep with us, the more the account gives back.",
    ctaVerb: "Upgrade your checking",
    noun: "relationship checking",
  },
  "core-savings": {
    benefits: ["Automatic transfers on payday", "No minimum balance", "Goal buckets inside one account"],
    proof: "Set it once and the saving happens without thinking about it.",
    ctaVerb: "Start saving",
    noun: "a savings account",
  },
  "high-yield-savings": {
    benefits: ["Competitive APY on every dollar", "No monthly fee or minimum", "Same-day transfers from checking"],
    proof: "Money stays fully liquid — no lockups, no penalties.",
    ctaVerb: "Open high-yield savings",
    noun: "a high-yield savings account",
  },
  "certificate-of-deposit": {
    benefits: ["Rate locked for the full term", "Terms from 3 months to 5 years", "FDIC insured"],
    proof: "You know the exact value at maturity the day you open it.",
    ctaVerb: "Lock a CD rate",
    noun: "a certificate of deposit",
  },
  "money-market-account": {
    benefits: ["Tiered rate that rises with balance", "Check writing and card access", "FDIC insured"],
    proof: "Earns more than checking while staying spendable.",
    ctaVerb: "Open a money market",
    noun: "a money market account",
  },
  "teen-youth-savings": {
    benefits: ["No fees, no minimum", "Parent visibility and controls", "Built-in savings goals"],
    proof: "A first account they run, with you able to see it.",
    ctaVerb: "Open a youth account",
    noun: "a youth savings account",
  },
  "holiday-club-savings": {
    benefits: ["Automatic weekly set-aside", "Funds release before the holidays", "No fee to participate"],
    proof: "December gets paid for across the year instead of in one month.",
    ctaVerb: "Start a club account",
    noun: "a holiday club account",
  },
  hsa: {
    benefits: ["Triple tax advantage", "Card for medical spending", "Unused balance rolls over and invests"],
    proof: "Contributions lower taxable income the year you make them.",
    ctaVerb: "Open an HSA",
    noun: "a health savings account",
  },
  "category-cashback-card": {
    benefits: ["Elevated cash back where you spend most", "No annual fee", "Rewards post automatically"],
    proof: "Categories follow your actual spending, not a fixed list.",
    ctaVerb: "See your card",
    noun: "a cash back card",
  },
  "flat-cashback-card": {
    benefits: ["Unlimited flat cash back", "No categories to track", "No annual fee"],
    proof: "Every purchase earns the same rate, no calendar to manage.",
    ctaVerb: "See your card",
    noun: "a flat-rate cash back card",
  },
  "travel-card": {
    benefits: ["Elevated miles on travel and dining", "No foreign transaction fees", "Trip protection included"],
    proof: "Miles transfer to airline and hotel partners at full value.",
    ctaVerb: "See your travel card",
    noun: "a travel rewards card",
  },
  "premium-travel-card": {
    benefits: ["Lounge access worldwide", "Annual travel credit", "No foreign transaction fees"],
    proof: "The travel credit alone covers most of the annual fee.",
    ctaVerb: "See the premium card",
    noun: "a premium travel card",
  },
  "ultra-premium-travel-card": {
    benefits: ["Global lounge and concierge access", "Elite hotel and airline status", "Highest earn on travel spend"],
    proof: "Built for households whose travel is a standing part of the year.",
    ctaVerb: "Request an invitation",
    noun: "an ultra-premium card",
  },
  "balance-transfer-card": {
    benefits: ["Intro APR on transferred balances", "One payment instead of several", "No annual fee"],
    proof: "The intro window gives the balance a real chance to clear.",
    ctaVerb: "See transfer offer",
    noun: "a balance transfer card",
  },
  "cobrand-card": {
    benefits: ["Bonus points with your favorite brand", "Member perks and priority access", "No annual fee tier available"],
    proof: "Rewards land where you were already spending.",
    ctaVerb: "See the co-brand card",
    noun: "a co-branded card",
  },
  "secured-credit-card": {
    benefits: ["Build credit with on-time payments", "Deposit refunded on graduation", "Reports to all three bureaus"],
    proof: "Most customers graduate to an unsecured card within a year.",
    ctaVerb: "Start building credit",
    noun: "a secured card",
  },
  "student-credit-card": {
    benefits: ["No annual fee", "Cash back on everyday spending", "Credit-building with no history required"],
    proof: "A first card that grows a score instead of a balance.",
    ctaVerb: "See the student card",
    noun: "a student card",
  },
  "life-insurance": {
    benefits: ["Coverage sized to your household", "Level premium for the whole term", "No medical exam for many applicants"],
    proof: "A quote takes a few minutes and commits you to nothing.",
    ctaVerb: "Get a quote",
    noun: "term life coverage",
  },
  "permanent-life": {
    benefits: ["Coverage that doesn't expire", "Builds cash value over time", "Premiums locked at issue"],
    proof: "The cash value is yours to borrow against later.",
    ctaVerb: "Get a quote",
    noun: "permanent life coverage",
  },
  "ltc-insurance": {
    benefits: ["Covers care costs insurance usually won't", "Choose home or facility care", "Premium discounts for couples"],
    proof: "Rates are set by age at issue, so earlier is cheaper.",
    ctaVerb: "Get a quote",
    noun: "long-term care coverage",
  },
  "disability-insurance": {
    benefits: ["Replaces a share of income", "Benefits paid tax-free", "Coverage follows you between jobs"],
    proof: "It protects the paycheck everything else depends on.",
    ctaVerb: "Get a quote",
    noun: "disability coverage",
  },
  "auto-insurance": {
    benefits: ["Multi-vehicle and multi-policy discounts", "Bundling credit with your bank accounts", "Claims handled in-app"],
    proof: "A side-by-side comparison takes a few minutes.",
    ctaVerb: "Compare your rate",
    noun: "auto insurance",
  },
  "homeowners-insurance": {
    benefits: ["Coverage matched to your home's value", "Bundle discount with auto", "Claims handled in-app"],
    proof: "Most bundled households save on both policies.",
    ctaVerb: "Compare your rate",
    noun: "homeowners insurance",
  },
  "umbrella-insurance": {
    benefits: ["Extra liability above your other policies", "Covers gaps auto and home leave", "Low cost per million of coverage"],
    proof: "It's the cheapest coverage per dollar most households can buy.",
    ctaVerb: "Get a quote",
    noun: "umbrella coverage",
  },
  "pet-insurance": {
    benefits: ["Covers accidents and illness", "Choose your own vet", "Reimbursement in days"],
    proof: "One emergency visit typically exceeds a year of premiums.",
    ctaVerb: "Get a quote",
    noun: "pet coverage",
  },
  annuity: {
    benefits: ["Income you can't outlive", "Guaranteed floor on your principal", "Tax-deferred growth until payout"],
    proof: "A portion of your savings turns into a paycheck for life.",
    ctaVerb: "Model your income",
    noun: "an annuity",
  },
  "identity-theft-protection": {
    benefits: ["Continuous credit and dark-web monitoring", "Restoration specialists if something happens", "Alerts in your banking app"],
    proof: "You find out first, not after the damage.",
    ctaVerb: "Turn on protection",
    noun: "identity protection",
  },
  "small-business-loan": {
    benefits: ["Fixed rate, predictable payment", "Decision in days, not weeks", "No prepayment penalty"],
    proof: "Underwriting uses the deposit history we already see.",
    ctaVerb: "Check your terms",
    noun: "a business loan",
  },
  "sba-loan": {
    benefits: ["Lower down payment than conventional", "Longer terms, smaller payments", "Preferred lender, faster process"],
    proof: "We handle the SBA paperwork end to end.",
    ctaVerb: "Start an SBA application",
    noun: "an SBA loan",
  },
  "business-line-of-credit": {
    benefits: ["Draw only what the month needs", "Reuse as you repay", "No fee on an unused line"],
    proof: "It smooths payroll weeks that land before customer payments.",
    ctaVerb: "Open a business line",
    noun: "a business line of credit",
  },
  "equipment-financing": {
    benefits: ["Equipment secures the loan", "Terms matched to useful life", "Potential Section 179 treatment"],
    proof: "The asset pays for itself over the term.",
    ctaVerb: "Finance equipment",
    noun: "equipment financing",
  },
  "commercial-real-estate-mortgage": {
    benefits: ["Financing sized to the property's income", "Fixed and floating structures", "Local underwriting team"],
    proof: "Terms are quoted against real rent rolls, not a template.",
    ctaVerb: "Request terms",
    noun: "a commercial mortgage",
  },
  "business-checking": {
    benefits: ["Business and personal money kept separate", "Free transactions up to your volume", "Integrates with your accounting tools"],
    proof: "Cleaner books and a far simpler tax season.",
    ctaVerb: "Open business checking",
    noun: "a business checking account",
  },
  "business-savings-sweep": {
    benefits: ["Idle balances swept nightly", "Earn without touching operating cash", "Funds available the next morning"],
    proof: "Working capital keeps working overnight.",
    ctaVerb: "Turn on sweep",
    noun: "a business sweep account",
  },
  "merchant-services": {
    benefits: ["Next-day funding to your account", "Transparent per-transaction pricing", "Terminals and online checkout"],
    proof: "Settlement lands in the account you already run payroll from.",
    ctaVerb: "See processing rates",
    noun: "merchant services",
  },
  "corporate-purchasing-card": {
    benefits: ["Per-employee spend limits", "Category controls and receipts capture", "Rebate on annual volume"],
    proof: "Expense reports build themselves from the card feed.",
    ctaVerb: "Set up purchasing cards",
    noun: "a purchasing card program",
  },
  "fleet-fuel-card": {
    benefits: ["Discounted fuel at national networks", "Per-driver and per-vehicle limits", "Automatic mileage and IFTA reporting"],
    proof: "Fuel spend becomes a line you can actually manage.",
    ctaVerb: "Set up fleet cards",
    noun: "a fleet fuel card",
  },
  "business-credit-card": {
    benefits: ["Separate business spend cleanly", "Employee cards with limits", "Rewards on operating expenses"],
    proof: "Every charge lands categorized for your books.",
    ctaVerb: "See the business card",
    noun: "a business card",
  },
  "payroll-services": {
    benefits: ["Payroll, tax filing and benefits in one place", "Direct deposit funded from your account", "Filings handled automatically"],
    proof: "Payroll runs from the account it already draws on.",
    ctaVerb: "See payroll pricing",
    noun: "payroll services",
  },
  "business-succession-planning": {
    benefits: ["Valuation and buy-sell structuring", "Funding options for the transition", "Coordinated with your estate plan"],
    proof: "Planning early is what makes the exit worth what you built.",
    ctaVerb: "Start a succession review",
    noun: "succession planning",
  },
  "business-owners-policy": {
    benefits: ["Property and liability in one policy", "Priced for small operations", "Certificates issued same day"],
    proof: "One policy instead of three separate ones to track.",
    ctaVerb: "Get a quote",
    noun: "a business owner's policy",
  },
  "workers-compensation": {
    benefits: ["Required coverage handled correctly", "Premiums based on real payroll", "Claims support for your team"],
    proof: "Pay-as-you-go premiums track your actual payroll runs.",
    ctaVerb: "Get a quote",
    noun: "workers' compensation",
  },
  "key-person-life-insurance": {
    benefits: ["Protects the business if a key person is lost", "Funds a buy-sell agreement", "Premiums often deductible to the entity"],
    proof: "Lenders and partners increasingly expect it in place.",
    ctaVerb: "Get a quote",
    noun: "key person coverage",
  },
  "solo-401k-sep-ira": {
    benefits: ["Higher contribution limits than an IRA", "Contributions reduce taxable income", "Simple annual administration"],
    proof: "Self-employed savers can shelter far more each year.",
    ctaVerb: "Open a solo plan",
    noun: "a solo 401(k) or SEP IRA",
  },
  "inherited-ira": {
    benefits: ["Distribution rules handled for you", "Stays invested while you decide", "Coordinated with your tax picture"],
    proof: "Getting the timeline right protects the value of what was left to you.",
    ctaVerb: "Review your options",
    noun: "an inherited IRA",
  },
  "donor-advised-fund": {
    benefits: ["Immediate deduction, grant over time", "Contribute appreciated assets", "Grants to any qualified charity"],
    proof: "Give this year, decide the recipients later.",
    ctaVerb: "Open a giving account",
    noun: "a donor-advised fund",
  },
  "global-account": {
    benefits: ["Hold and send multiple currencies", "No foreign transaction fees", "Transparent exchange rates"],
    proof: "Cross-border money moves without the usual markup.",
    ctaVerb: "Open a global account",
    noun: "a global account",
  },
  "able-savings": {
    benefits: ["Save without affecting benefit eligibility", "Tax-free growth for qualified expenses", "Debit card for everyday needs"],
    proof: "Balances stay outside the usual resource limits.",
    ctaVerb: "Open an ABLE account",
    noun: "an ABLE account",
  },
  "values-portfolio": {
    benefits: ["Screened to your values", "Diversified and rebalanced", "Same low advisory fee"],
    proof: "Alignment without giving up diversification.",
    ctaVerb: "Build a values portfolio",
    noun: "a values-aligned portfolio",
  },
  "financial-planning-subscription": {
    benefits: ["A plan you can revisit anytime", "Unlimited planner conversations", "Flat monthly fee, no commissions"],
    proof: "Advice priced like a subscription, not a percentage.",
    ctaVerb: "Start planning",
    noun: "a planning subscription",
  },
  "solo-restart-checking": {
    benefits: ["A clean account in your name only", "No monthly fee to start", "Direct deposit set up in minutes"],
    proof: "A fresh account without unwinding anything else first.",
    ctaVerb: "Open your account",
    noun: "a personal checking account",
  },
};

const TAG_DEFAULTS: Array<[RegExp, ProductBenefitProfile]> = [
  [/insur|coverage|policy|umbrella/i, {
    benefits: ["Coverage sized to your household", "Bundling discounts with your other policies", "Claims handled in-app"],
    proof: "A quote takes a few minutes and commits you to nothing.",
    ctaVerb: "Get a quote",
    noun: "this coverage",
  }],
  [/loan|financing|credit line|line of credit|refi/i, {
    benefits: ["Fixed rate and a clear payoff date", "Fast decision, no origination fee", "No prepayment penalty"],
    proof: "Checking your rate won't affect your credit score.",
    ctaVerb: "Check your rate",
    noun: "this financing",
  }],
  [/card/i, {
    benefits: ["Rewards on the spending you already do", "No annual fee tier available", "Controls and alerts in-app"],
    proof: "Rewards post automatically — nothing to activate.",
    ctaVerb: "See your card",
    noun: "this card",
  }],
  [/savings|checking|deposit|money market|certificate|\bcd\b/i, {
    benefits: ["Competitive rate with no monthly fee", "Same-day transfers between accounts", "FDIC insured"],
    proof: "Opening takes a few minutes in the app.",
    ctaVerb: "Open an account",
    noun: "this account",
  }],
  [/invest|portfolio|brokerage|advisor|wealth|ira|retire|annuity|401/i, {
    benefits: ["Diversified and rebalanced for you", "Transparent, low advisory fee", "Guidance when your plan changes"],
    proof: "A first review is a conversation, not a commitment.",
    ctaVerb: "Review your options",
    noun: "this account",
  }],
  [/business|payroll|merchant|fleet|sba|commercial/i, {
    benefits: ["Built around how your business actually runs", "Approvals informed by your deposit history", "One relationship for banking and financing"],
    proof: "We already see the cash flow this is underwritten against.",
    ctaVerb: "See your options",
    noun: "this solution",
  }],
];

const GENERIC: ProductBenefitProfile = {
  benefits: ["Terms matched to your situation", "No hidden fees", "Set up in minutes"],
  proof: "A short review is all it takes to see the numbers.",
  ctaVerb: "See your options",
  noun: "this product",
};

export function benefitsForFlow(flow: ProductFlow): ProductBenefitProfile {
  const direct = BY_ID[flow.id];
  if (direct) return direct;
  const hay = `${flow.id} ${flow.name}`;
  for (const [re, profile] of TAG_DEFAULTS) if (re.test(hay)) return profile;
  return GENERIC;
}
