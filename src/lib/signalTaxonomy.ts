import { PRODUCT_FLOWS, type SignalType } from "@/lib/productAutomatedFlows";

export interface TaxonomySignal {
  id: string;
  family: SignalType;
  label: string;
  /** How Ventus detects it — merchant / rail evidence shown in the Systems tab. */
  detection: string;
  /** Risk severity weight (risk family only). */
  weight?: number;
  /** Product flows this signal enrolls customers into. */
  productIds: string[];
}

export const SIGNAL_FAMILY_ORDER: SignalType[] = [
  "behavioral",
  "life-event",
  "financial",
  "demographic",
  "risk",
];

export const SIGNAL_TAXONOMY: TaxonomySignal[] = [
  // ---------------- Behavioral: 11 lifestyle pillars ----------------
  {
    id: "beh-sports",
    family: "behavioral",
    label: "Sports & Active Living",
    detection: "Equinox, Lululemon, REI, fitness classes, team leagues",
    productIds: ["category-cashback-card", "flat-cashback-card", "cobrand-card", "disability-insurance"],
  },
  {
    id: "beh-food",
    family: "behavioral",
    label: "Food & Dining",
    detection: "Whole Foods, Starbucks, Chipotle, delivery, meal kits",
    productIds: ["category-cashback-card", "flat-cashback-card", "everyday-checking"],
  },
  {
    id: "beh-travel",
    family: "behavioral",
    label: "Travel & Exploration",
    detection: "Flights, hotels, car rentals, tours, travel insurance",
    productIds: ["travel-card", "premium-travel-card", "ultra-premium-travel-card", "global-account"],
  },
  {
    id: "beh-home",
    family: "behavioral",
    label: "Home & Living",
    detection: "Mortgage, utilities, Home Depot, furniture, commuting",
    productIds: ["heloc", "homeowners-insurance", "personal-loan", "category-cashback-card"],
  },
  {
    id: "beh-style",
    family: "behavioral",
    label: "Style & Beauty",
    detection: "Zara, Sephora, salon, jewelry, accessories",
    productIds: ["category-cashback-card", "cobrand-card", "flat-cashback-card"],
  },
  {
    id: "beh-health",
    family: "behavioral",
    label: "Health & Wellness",
    detection: "Doctor visits, pharmacy, therapy, spa, supplements",
    productIds: ["hsa", "disability-insurance", "ltc-insurance"],
  },
  {
    id: "beh-tech",
    family: "behavioral",
    label: "Technology & Digital",
    detection: "Spotify, Netflix, Adobe, devices, cloud storage",
    productIds: ["flat-cashback-card", "identity-theft-protection", "everyday-checking"],
  },
  {
    id: "beh-family",
    family: "behavioral",
    label: "Family & Community",
    detection: "Childcare, gifts, religious orgs, kids activities",
    productIds: ["529-plan", "life-insurance", "teen-youth-savings", "donor-advised-fund"],
  },
  {
    id: "beh-pets",
    family: "behavioral",
    label: "Pets",
    detection: "Chewy, vet care, grooming, pet insurance",
    productIds: ["pet-insurance", "category-cashback-card"],
  },
  {
    id: "beh-entertainment",
    family: "behavioral",
    label: "Entertainment & Culture",
    detection: "Movies, concerts, museums, books, gaming",
    productIds: ["cobrand-card", "flat-cashback-card", "holiday-club-savings"],
  },
  {
    id: "beh-trips",
    family: "behavioral",
    label: "Trip Reconstruction",
    detection: "Anchor + non-home-zip clustering into dated trips with spend breakdown",
    productIds: ["premium-travel-card", "travel-card", "global-account"],
  },

  // ---------------- Life Event ----------------
  {
    id: "le-home-purchase",
    family: "life-event",
    label: "Home Purchase",
    detection: "Realtor, title/escrow, mortgage, HOA setup, first mortgage payment",
    productIds: ["mortgage", "homeowners-insurance", "heloc", "life-insurance", "second-home-mortgage"],
  },
  {
    id: "le-new-baby",
    family: "life-event",
    label: "New Baby",
    detection: "OB/midwife, buybuy BABY, pediatrician, daycare, hospital L&D",
    productIds: ["529-plan", "life-insurance", "core-savings", "disability-insurance"],
  },
  {
    id: "le-wedding",
    family: "life-event",
    label: "Wedding / Engagement",
    detection: "Jeweler ($2k+), venue, bridal salon, photographer, registry",
    productIds: ["wedding-loan", "relationship-checking", "life-insurance", "personal-loan"],
  },
  {
    id: "le-college-prep",
    family: "life-event",
    label: "College Prep (Dependent)",
    detection: "SAT/ACT/Kaplan, Common App, bursar deposits, college tours",
    productIds: ["529-plan", "student-credit-card", "student-loan-refi", "personal-line-of-credit"],
  },
  {
    id: "le-business-formation",
    family: "life-event",
    label: "Business Formation",
    detection: "LegalZoom, Stripe Atlas, business banking, commercial leasing",
    productIds: ["business-checking", "small-business-loan", "merchant-services", "business-credit-card", "business-owners-policy"],
  },
  {
    id: "le-elder-care",
    family: "life-event",
    label: "Elder Care",
    detection: "Assisted living, home health aide, geriatric care, hospice, DME",
    productIds: ["ltc-insurance", "trust-estate", "annuity", "personal-line-of-credit"],
  },
  {
    id: "le-retirement",
    family: "life-event",
    label: "Retirement Planning",
    detection: "Advisor fees, estate attorney, Medicare supplement, downsizing",
    productIds: ["ira", "401k-rollover", "annuity", "wealth-management", "trust-estate"],
  },
  {
    id: "le-relocation",
    family: "life-event",
    label: "Relocation",
    detection: "Long-distance movers, vehicle shipping, extended-stay 7+ nights, new-metro utilities",
    productIds: ["move-financing", "mortgage", "everyday-checking", "auto-insurance"],
  },
  {
    id: "le-windfall",
    family: "life-event",
    label: "Inheritance / Windfall",
    detection: "Large one-time inflow paired with estate attorney or trust services",
    productIds: ["inherited-ira", "private-wealth", "wealth-management", "donor-advised-fund", "high-yield-savings"],
  },

  // ---------------- Financial ----------------
  {
    id: "fin-payroll",
    family: "financial",
    label: "Active payroll deposit",
    detection: "Recurring employer ACH on a consistent cadence",
    productIds: ["everyday-checking", "relationship-checking", "core-savings", "personal-loan"],
  },
  {
    id: "fin-large-inflow",
    family: "financial",
    label: "Recent large inflow",
    detection: "One-off deposit well above payroll baseline (windfall, bonus)",
    productIds: ["high-yield-savings", "certificate-of-deposit", "money-market-account", "self-directed-brokerage"],
  },
  {
    id: "fin-balance-up",
    family: "financial",
    label: "Deposit balance trending up",
    detection: "Checking and savings growing across recent statements",
    productIds: ["high-yield-savings", "money-market-account", "certificate-of-deposit", "robo-portfolio"],
  },
  {
    id: "fin-investable",
    family: "financial",
    label: "Investable assets tier",
    detection: "Idle balances above typical operating-cash needs",
    productIds: ["wealth-management", "hybrid-advisor-portfolio", "private-wealth", "annuity"],
  },
  {
    id: "fin-external-brokerage",
    family: "financial",
    label: "Funds external brokerage",
    detection: "Outbound ACH to Schwab, Fidelity, Robinhood (wallet share leak)",
    productIds: ["self-directed-brokerage", "robo-portfolio", "wealth-management", "ira"],
  },
  {
    id: "fin-mortgage-payer",
    family: "financial",
    label: "Active mortgage payer",
    detection: "Recurring mortgage servicer outflow on file",
    productIds: ["heloc", "mortgage", "homeowners-insurance", "umbrella-insurance"],
  },
  {
    id: "fin-low-utilization",
    family: "financial",
    label: "Low credit utilization",
    detection: "Headroom on existing revolving credit lines",
    productIds: ["premium-travel-card", "category-cashback-card", "personal-line-of-credit"],
  },
  {
    id: "fin-healthy-dti",
    family: "financial",
    label: "Healthy DTI",
    detection: "Debt service comfortably below underwriting thresholds",
    productIds: ["mortgage", "auto-loan", "personal-loan", "heloc"],
  },
  {
    id: "fin-subscription-load",
    family: "financial",
    label: "Subscription stack load",
    detection: "10+ active recurring digital subscriptions",
    productIds: ["flat-cashback-card", "everyday-checking", "identity-theft-protection"],
  },

  // ---------------- Demographic ----------------
  {
    id: "dem-homeowner",
    family: "demographic",
    label: "Likely homeowner",
    detection: "Mortgage, Home Depot/Lowe's, HOA fees",
    productIds: ["heloc", "homeowners-insurance", "umbrella-insurance", "construction-loan"],
  },
  {
    id: "dem-young-children",
    family: "demographic",
    label: "Parent of young children",
    detection: "Daycare, pediatric, Carter's, infant formula volume",
    productIds: ["529-plan", "life-insurance", "teen-youth-savings", "disability-insurance"],
  },
  {
    id: "dem-school-age",
    family: "demographic",
    label: "Parent of school-age",
    detection: "Tuition, kids activities, SAT/ACT prep",
    productIds: ["529-plan", "student-credit-card", "teen-youth-savings", "permanent-life"],
  },
  {
    id: "dem-dual-income",
    family: "demographic",
    label: "Dual-income household",
    detection: "Two distinct payroll streams to one household",
    productIds: ["relationship-checking", "high-yield-savings", "mortgage", "hybrid-advisor-portfolio"],
  },
  {
    id: "dem-pre-retiree",
    family: "demographic",
    label: "Pre-retiree / empty nester",
    detection: "Medicare supplement, downsizing, no dependent-linked spend",
    productIds: ["ira", "annuity", "ltc-insurance", "401k-rollover"],
  },
  {
    id: "dem-self-employed",
    family: "demographic",
    label: "Self-employed / 1099 household",
    detection: "Quarterly estimated tax payments, irregular platform inflows, no single employer ACH",
    productIds: ["solo-401k-sep-ira", "business-checking", "personal-line-of-credit", "disability-insurance"],
  },
  {
    id: "dem-business-owner",
    family: "demographic",
    label: "Small business owner",
    detection: "Business banking deposits, merchant-services volume, commercial insurance, wholesale suppliers",
    productIds: [
      "sba-loan",
      "business-line-of-credit",
      "business-checking",
      "business-savings-sweep",
      "merchant-services",
      "corporate-purchasing-card",
      "payroll-services",
      "business-owners-policy",
      "workers-compensation",
      "key-person-life-insurance",
      "business-succession-planning",
      "equipment-financing",
    ],
  },
  {
    id: "dem-multi-property",
    family: "demographic",
    label: "Multi-property household",
    detection: "Two or more distinct mortgage, HOA, or property-tax streams",
    productIds: ["second-home-mortgage", "commercial-real-estate-mortgage", "umbrella-insurance", "heloc"],
  },
  {
    id: "dem-rental-income",
    family: "demographic",
    label: "Rental income earner",
    detection: "Recurring inbound rent deposits or property-management payouts",
    productIds: ["business-checking", "commercial-real-estate-mortgage", "umbrella-insurance", "money-market-account"],
  },
  {
    id: "dem-college-dependents",
    family: "demographic",
    label: "Household with dependents in college",
    detection: "Bursar or tuition outflows plus 529 plan distributions",
    productIds: ["student-loan-refi", "529-plan", "student-credit-card", "personal-line-of-credit"],
  },
  {
    id: "dem-hnw",
    family: "demographic",
    label: "High-net-worth indicator",
    detection: "Advisory fees, trust services, private-client banking outflows",
    productIds: ["private-wealth", "trust-estate", "ultra-premium-travel-card", "donor-advised-fund", "umbrella-insurance"],
  },
  {
    id: "dem-relocated",
    family: "demographic",
    label: "Recently relocated household",
    detection: "Sustained merchant footprint shift into a new metro",
    productIds: ["move-financing", "everyday-checking", "auto-insurance", "mortgage"],
  },
  {
    id: "dem-beneficiary",
    family: "demographic",
    label: "Beneficiary reasoning",
    detection: "Spend benefits self vs. dependent vs. third-party gift",
    productIds: ["life-insurance", "trust-estate", "529-plan", "donor-advised-fund"],
  },

  // ---------------- Risk ----------------
  {
    id: "risk-adult",
    family: "risk",
    label: "Adult entertainment",
    detection: "OnlyFans, cam sites, adult processors (CCBill/Epoch), MCC 5967",
    weight: 3,
    productIds: ["identity-theft-protection"],
  },
  {
    id: "risk-offshore-gambling",
    family: "risk",
    label: "Offshore gambling",
    detection: "Bovada, Stake.com, Roobet, Curaçao books",
    weight: 5,
    productIds: ["identity-theft-protection"],
  },
  {
    id: "risk-sports-betting",
    family: "risk",
    label: "Sports betting",
    detection: "DraftKings SB, FanDuel SB, BetMGM, PrizePicks",
    weight: 3,
    productIds: ["core-savings", "identity-theft-protection"],
  },
  {
    id: "risk-casino",
    family: "risk",
    label: "Casino & table games",
    detection: "MGM, Bellagio, Foxwoods, DraftKings Casino",
    weight: 3,
    productIds: ["core-savings"],
  },
  {
    id: "risk-payday",
    family: "risk",
    label: "Payday & short-term credit",
    detection: "ACE Cash Express, Advance America, Earnin, Dave",
    weight: 5,
    productIds: ["starter-checking", "secured-credit-card", "personal-loan"],
  },
  {
    id: "risk-debt-collection",
    family: "risk",
    label: "Debt collection & relief",
    detection: "Portfolio Recovery, Freedom Debt Relief, bankruptcy filings",
    weight: 5,
    productIds: ["balance-transfer-card", "secured-credit-card", "starter-checking"],
  },
  {
    id: "risk-check-cashing",
    family: "risk",
    label: "Check cashing & money services",
    detection: "Western Union, MoneyGram, MoneyPak reloads",
    weight: 4,
    productIds: ["starter-checking", "global-account"],
  },
  {
    id: "risk-overdraft",
    family: "risk",
    label: "Overdraft & NSF activity",
    detection: "Aggregated fee events; severity escalates at 5+",
    weight: 4,
    productIds: ["starter-checking", "core-savings", "personal-line-of-credit"],
  },
  {
    id: "risk-subprime",
    family: "risk",
    label: "Subprime credit & rent-to-own",
    detection: "Credit One, OpenSky, Rent-A-Center, DriveTime",
    weight: 3,
    productIds: ["secured-credit-card", "auto-refi", "balance-transfer-card"],
  },
  {
    id: "risk-crypto-mixing",
    family: "risk",
    label: "Crypto mixing",
    detection: "Tornado Cash, Wasabi, CoinJoin, Monero exchanges",
    weight: 4,
    productIds: ["identity-theft-protection"],
  },
  {
    id: "risk-intl",
    family: "risk",
    label: "Suspicious international",
    detection: "Merchant contains INTL/OFFSHORE + non-US zip",
    weight: 4,
    productIds: ["global-account"],
  },
  {
    id: "risk-structuring",
    family: "risk",
    label: "AML structuring",
    detection: "Multiple deposits/withdrawals just below $10K (model-routed)",
    weight: 5,
    productIds: [],
  },
  {
    id: "risk-layering",
    family: "risk",
    label: "AML round-number layering",
    detection: "Repeated round-number cash-equivalent patterns",
    weight: 5,
    productIds: [],
  },
  {
    id: "risk-cross-border",
    family: "risk",
    label: "AML cross-border wires",
    detection: "Wire patterns inconsistent with home zip",
    weight: 5,
    productIds: ["global-account"],
  },
];

/** Systems-tab item list for a family (label + sublabel), sourced from the shared taxonomy. */
export function taxonomyItems(family: SignalType): { label: string; sublabel: string }[] {
  return SIGNAL_TAXONOMY.filter((s) => s.family === family).map((s) => ({
    label: s.label,
    sublabel: s.weight ? `${s.detection} (weight ${s.weight})` : s.detection,
  }));
}

const FLOW_BY_ID = new Map(PRODUCT_FLOWS.map((f) => [f.id, f]));

export function flowsForSignal(signal: TaxonomySignal) {
  return signal.productIds.map((id) => FLOW_BY_ID.get(id)).filter((f): f is NonNullable<typeof f> => Boolean(f));
}

/** Estimated reachable audience for a signal — largest flow it feeds, plus a tapered tail. */
export function signalAudience(signal: TaxonomySignal): number {
  const sizes = flowsForSignal(signal)
    .map((f) => f.estimatedAudience)
    .sort((a, b) => b - a);
  if (sizes.length === 0) return 0;
  return Math.round(sizes.reduce((acc, n, i) => acc + n / (i + 1.6), 0));
}
