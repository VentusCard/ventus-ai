import {
  GraduationCap,
  Home,
  Briefcase,
  Car,
  Building2,
  PiggyBank,
  Plane,
  Store,
  HandCoins,
  Shield,
  Wallet,
  Banknote,
  Landmark,
  CreditCard,
  Receipt,
  TrendingUp,
  Wrench,
  LineChart,
  Bot,
  UserCheck,
  Crown,
  FileSpreadsheet,
  HeartHandshake,
  Umbrella,
  RefreshCw,
  Tag,
  Gem,
  Leaf,
  Scale,
  Globe,
  type LucideIcon,
} from "lucide-react";

export type FlowCategory =
  | "Lending"
  | "Wealth"
  | "Deposits"
  | "Cards"
  | "Insurance";

export type SignalType = "life-event" | "behavioral";

export interface FlowSignal {
  label: string;
  evidence: string;
  type: SignalType;
}

export interface ProductFlow {
  id: string;
  name: string;
  category: FlowCategory;
  icon: LucideIcon;
  positioning: string;
  signals: FlowSignal[];
  estimatedAudience: number; // out of ~250M
  penetration: number; // 0-1, share of base eligible
  defaultActive?: boolean;
}

export const PRODUCT_FLOWS: ProductFlow[] = [
  // ===== WEALTH =====
  {
    id: "529-plan",
    name: "529 College Savings Plan",
    category: "Wealth",
    icon: GraduationCap,
    positioning: "Tax-advantaged education savings for families with young or college-bound children.",
    signals: [
      { label: "Newborn purchase cluster", evidence: "Buy Buy Baby, Carter's, pediatric copays within 90 days", type: "life-event" },
      { label: "Dependent age inference (0–2 yrs)", evidence: "Diaper subscriptions, daycare ACH, formula brands", type: "life-event" },
      { label: "College-age dependent (16–18 yrs)", evidence: "Private school tuition, SAT/ACT fees, college tour travel", type: "life-event" },
      { label: "Stated savings intent", evidence: "Search behavior for 'college savings' on bank web app", type: "behavioral" },
    ],
    estimatedAudience: 14_200_000,
    penetration: 0.057,
    defaultActive: true,
  },
  {
    id: "self-directed-brokerage",
    name: "Self-Directed Brokerage",
    category: "Wealth",
    icon: LineChart,
    positioning: "Commission-free online trading for customers who want to manage their own portfolio.",
    signals: [
      { label: "External brokerage transfers", evidence: "Recurring ACH to third-party retail brokerage apps", type: "behavioral" },
      { label: "Crypto exchange activity", evidence: "Card or ACH spend at major crypto on-ramps", type: "behavioral" },
      { label: "Idle cash with investing intent", evidence: "Checking balance > $10k + research-site visits in-app", type: "behavioral" },
    ],
    estimatedAudience: 22_000_000,
    penetration: 0.088,
    defaultActive: true,
  },
  {
    id: "robo-portfolio",
    name: "Robo / Guided Portfolio",
    category: "Wealth",
    icon: Bot,
    positioning: "Algorithm-built diversified portfolio for hands-off investors at low cost.",
    signals: [
      { label: "First-time investor signals", evidence: "Small recurring transfers to investing apps under $200", type: "behavioral" },
      { label: "Idle savings drift", evidence: "Savings balance flat for 6+ months while income rises", type: "behavioral" },
      { label: "Stated goal-based intent", evidence: "Goal-planner tool engagement in bank app", type: "behavioral" },
    ],
    estimatedAudience: 17_500_000,
    penetration: 0.070,
  },
  {
    id: "hybrid-advisor-portfolio",
    name: "Hybrid Advisor Portfolio",
    category: "Wealth",
    icon: UserCheck,
    positioning: "Managed portfolio with on-demand human advisor for mass-affluent households.",
    signals: [
      { label: "Mass-affluent balance band", evidence: "Investable assets $100k–$1M across linked accounts", type: "behavioral" },
      { label: "Advisor search engagement", evidence: "Repeated visits to 'find an advisor' page", type: "behavioral" },
      { label: "Life transition trigger", evidence: "Inheritance deposit, severance, or business-sale inflow", type: "life-event" },
    ],
    estimatedAudience: 9_200_000,
    penetration: 0.037,
  },
  {
    id: "wealth-management",
    name: "Wealth Management",
    category: "Wealth",
    icon: Briefcase,
    positioning: "Holistic advisory for high-net-worth households and complex balance sheets.",
    signals: [
      { label: "Large equity comp deposit", evidence: "Quarterly RSU vest, ESPP buyback inflows", type: "behavioral" },
      { label: "Recurring brokerage transfers", evidence: "Outbound ACH to external brokerage > $5k/mo", type: "behavioral" },
      { label: "Country club dues", evidence: "Recurring private club, golf, yacht club ACH", type: "behavioral" },
      { label: "Private aviation indicator", evidence: "Charter operator card spend, fractional jet membership", type: "behavioral" },
    ],
    estimatedAudience: 6_400_000,
    penetration: 0.026,
    defaultActive: true,
  },
  {
    id: "private-wealth",
    name: "Private Wealth Management",
    category: "Wealth",
    icon: Crown,
    positioning: "Ultra-high-net-worth advisory with dedicated team, lending, and trust services.",
    signals: [
      { label: "Eight-figure inflow event", evidence: "Single deposit > $5M from M&A escrow or IPO", type: "life-event" },
      { label: "Multi-property tax footprint", evidence: "Property tax ACH to 3+ counties annually", type: "behavioral" },
      { label: "Family office indicator", evidence: "Recurring payroll outflows + multi-entity transfers", type: "behavioral" },
    ],
    estimatedAudience: 850_000,
    penetration: 0.003,
  },
  {
    id: "ira",
    name: "Individual Retirement Account",
    category: "Wealth",
    icon: PiggyBank,
    positioning: "Tax-advantaged retirement account with Traditional, Roth, and Rollover options.",
    signals: [
      { label: "Job change rollover trigger", evidence: "Final payroll deposit followed by new employer ACH", type: "life-event" },
      { label: "Maxed 401(k) saver", evidence: "Consistent pre-tax payroll deferrals near IRS limit", type: "behavioral" },
      { label: "Self-employed income", evidence: "1099 deposits without W-2 payroll", type: "behavioral" },
    ],
    estimatedAudience: 28_000_000,
    penetration: 0.112,
    defaultActive: true,
  },
  {
    id: "trust-estate",
    name: "Trust & Estate Services",
    category: "Wealth",
    icon: Scale,
    positioning: "Multi-generational wealth structuring, trusteeship, and estate administration.",
    signals: [
      { label: "Estate planning attorney spend", evidence: "Recurring legal ACH plus notary fees", type: "behavioral" },
      { label: "Aging household signal", evidence: "Primary holder 65+ with charitable giving uptick", type: "life-event" },
      { label: "Beneficiary update activity", evidence: "In-app beneficiary form interactions", type: "behavioral" },
    ],
    estimatedAudience: 2_400_000,
    penetration: 0.010,
  },
  {
    id: "values-portfolio",
    name: "Values-Aligned Portfolio",
    category: "Wealth",
    icon: Leaf,
    positioning: "Sustainable and impact-aligned managed portfolios for values-driven investors.",
    signals: [
      { label: "Sustainable consumer pattern", evidence: "Recurring spend at certified-B / organic grocers", type: "behavioral" },
      { label: "Charitable giving cadence", evidence: "Monthly donations to environmental or social causes", type: "behavioral" },
      { label: "EV ownership", evidence: "Charging network subscriptions and EV-tax-credit refund", type: "behavioral" },
    ],
    estimatedAudience: 5_600_000,
    penetration: 0.022,
  },

  // ===== LENDING =====
  {
    id: "mortgage",
    name: "Mortgage",
    category: "Lending",
    icon: Building2,
    positioning: "Purchase and refinance mortgages for first-time and move-up buyers.",
    signals: [
      { label: "Rent above local median", evidence: "Recurring rent ACH > regional 75th percentile", type: "behavioral" },
      { label: "Pre-approval inquiry", evidence: "Soft-pull or rate-quote interaction in bank app", type: "life-event" },
      { label: "Down-payment accumulation", evidence: "Savings balance growth trajectory + low debt service", type: "behavioral" },
    ],
    estimatedAudience: 13_700_000,
    penetration: 0.055,
  },
  {
    id: "heloc",
    name: "Home Equity Line of Credit",
    category: "Lending",
    icon: Home,
    positioning: "Flexible credit secured by home equity for renovations or large expenses.",
    signals: [
      { label: "Home renovation spend", evidence: "Home Depot, Lowe's, contractor ACH > $1,000", type: "behavioral" },
      { label: "Property tax payment", evidence: "Annual or semi-annual county treasurer ACH", type: "behavioral" },
      { label: "Long-term homeowner", evidence: "Mortgage on file > 5 years with current bank", type: "life-event" },
    ],
    estimatedAudience: 9_800_000,
    penetration: 0.039,
    defaultActive: true,
  },
  {
    id: "auto-loan",
    name: "Auto Loan",
    category: "Lending",
    icon: Car,
    positioning: "Financing for new or used vehicle purchase, with refi for existing loans.",
    signals: [
      { label: "Repeated dealer visits", evidence: "Card-present spend at dealerships across 2+ weekends", type: "behavioral" },
      { label: "Lease-end timing", evidence: "Captive lender ACH ending in 60–90 days", type: "life-event" },
      { label: "Auto insurance shop-around", evidence: "Multiple insurer one-time charges within 30 days", type: "behavioral" },
    ],
    estimatedAudience: 11_500_000,
    penetration: 0.046,
  },
  {
    id: "auto-refi",
    name: "Auto Refinance",
    category: "Lending",
    icon: RefreshCw,
    positioning: "Lower-rate refinance for customers carrying a high-APR auto loan elsewhere.",
    signals: [
      { label: "High-APR captive lender", evidence: "Monthly ACH to subprime auto lender > 24 months", type: "behavioral" },
      { label: "Credit score improvement", evidence: "Bureau-pulled score up 60+ pts since origination", type: "behavioral" },
      { label: "Income step-up", evidence: "Payroll deposit increase > 15% sustained 6 months", type: "life-event" },
    ],
    estimatedAudience: 7_300_000,
    penetration: 0.029,
  },
  {
    id: "personal-loan",
    name: "Personal Loan",
    category: "Lending",
    icon: HandCoins,
    positioning: "Unsecured installment loans for consolidation or one-time expenses.",
    signals: [
      { label: "Repeated BNPL usage", evidence: "Affirm, Klarna, Afterpay charges across 3+ merchants", type: "behavioral" },
      { label: "Cash-advance recovery", evidence: "Card cash-advance followed by paycheck-aligned paydown", type: "behavioral" },
      { label: "Revolving balance creep", evidence: "Card utilization rising for 4+ consecutive cycles", type: "behavioral" },
    ],
    estimatedAudience: 8_900_000,
    penetration: 0.036,
  },
  {
    id: "small-business-loan",
    name: "Small Business Loan",
    category: "Lending",
    icon: Store,
    positioning: "Working capital and term loans for sole proprietors and small businesses.",
    signals: [
      { label: "Vendor ACH cluster", evidence: "5+ distinct business-supplier ACH counterparties", type: "behavioral" },
      { label: "Square / Stripe deposits", evidence: "Recurring processor deposits to personal account", type: "behavioral" },
      { label: "Business-pattern card use", evidence: "Office supply + SaaS subscription combo", type: "behavioral" },
    ],
    estimatedAudience: 3_200_000,
    penetration: 0.013,
  },

  // ===== DEPOSITS =====
  {
    id: "starter-checking",
    name: "Starter Checking",
    category: "Deposits",
    icon: Wallet,
    positioning: "No-overdraft checking for students, teens, and customers new to banking.",
    signals: [
      { label: "Student inflow pattern", evidence: "University refunds, work-study payroll, parent transfers", type: "life-event" },
      { label: "Thin-file young adult", evidence: "Age 18–24 with single low-volume account", type: "life-event" },
      { label: "Prepaid card top-ups", evidence: "Recurring loads to prepaid debit programs", type: "behavioral" },
    ],
    estimatedAudience: 19_000_000,
    penetration: 0.076,
  },
  {
    id: "everyday-checking",
    name: "Everyday Checking",
    category: "Deposits",
    icon: Banknote,
    positioning: "Primary checking with direct deposit, bill pay, and broad ATM access.",
    signals: [
      { label: "Direct deposit anchor", evidence: "Recurring W-2 payroll deposit as primary inflow", type: "behavioral" },
      { label: "Recurring bill-pay use", evidence: "5+ scheduled bill-pay payees active monthly", type: "behavioral" },
      { label: "Household formation", evidence: "Recent address change + joint account opening", type: "life-event" },
    ],
    estimatedAudience: 62_000_000,
    penetration: 0.248,
    defaultActive: true,
  },
  {
    id: "relationship-checking",
    name: "Relationship Checking",
    category: "Deposits",
    icon: HeartHandshake,
    positioning: "Premium checking with fee waivers and rate bonuses for multi-product households.",
    signals: [
      { label: "Multi-product household", evidence: "Customer holds 3+ products across deposits, cards, and lending", type: "behavioral" },
      { label: "High average balance", evidence: "Combined deposits > $20k for trailing 90 days", type: "behavioral" },
      { label: "Wealth product overlap", evidence: "Linked brokerage or advised assets on file", type: "behavioral" },
    ],
    estimatedAudience: 9_500_000,
    penetration: 0.038,
  },
  {
    id: "core-savings",
    name: "Core Savings",
    category: "Deposits",
    icon: PiggyBank,
    positioning: "Companion savings account with automatic-transfer tools for everyday savers.",
    signals: [
      { label: "Round-up saver pattern", evidence: "Frequent small recurring transfers from checking", type: "behavioral" },
      { label: "Goal-based saving", evidence: "Self-named savings sub-accounts created in-app", type: "behavioral" },
      { label: "Tax-refund inflow", evidence: "IRS or state refund deposit > $1,000", type: "life-event" },
    ],
    estimatedAudience: 34_000_000,
    penetration: 0.136,
    defaultActive: true,
  },
  {
    id: "high-yield-savings",
    name: "High-Yield Savings",
    category: "Deposits",
    icon: TrendingUp,
    positioning: "Premium savings yield for customers with idle checking balances.",
    signals: [
      { label: "Idle checking balance", evidence: "Avg balance > $25k for 90 consecutive days", type: "behavioral" },
      { label: "Outbound yield-seeking", evidence: "Recurring ACH to neobank or money-market app", type: "behavioral" },
    ],
    estimatedAudience: 18_600_000,
    penetration: 0.074,
    defaultActive: true,
  },
  {
    id: "certificate-of-deposit",
    name: "Certificate of Deposit",
    category: "Deposits",
    icon: Landmark,
    positioning: "Fixed-term, guaranteed-rate deposits for customers locking in yield.",
    signals: [
      { label: "Maturing external CD", evidence: "Lump-sum inflow from competitor bank near month-end", type: "life-event" },
      { label: "Retirement-age saver", evidence: "Primary holder 60+ with conservative balance growth", type: "life-event" },
      { label: "Treasury-purchase activity", evidence: "Outbound ACH to TreasuryDirect or T-bill ETFs", type: "behavioral" },
    ],
    estimatedAudience: 11_000_000,
    penetration: 0.044,
  },

  // ===== CARDS =====
  {
    id: "category-cashback-card",
    name: "Category Cash Back Card",
    category: "Cards",
    icon: Tag,
    positioning: "Cash-back card with a customer-chosen bonus category for everyday spend.",
    signals: [
      { label: "Concentrated category spend", evidence: "Single category > 40% of card spend (gas, dining, online)", type: "behavioral" },
      { label: "Competitor rewards card use", evidence: "External card statement payments via bill-pay", type: "behavioral" },
      { label: "First-card upgrade signal", evidence: "Holds entry-level card with rising monthly volume", type: "behavioral" },
    ],
    estimatedAudience: 24_000_000,
    penetration: 0.096,
    defaultActive: true,
  },
  {
    id: "flat-cashback-card",
    name: "Flat-Rate Cash Back Card",
    category: "Cards",
    icon: CreditCard,
    positioning: "Simple unlimited cash back on every purchase, no category tracking.",
    signals: [
      { label: "Diversified everyday spend", evidence: "No single category > 25% of card volume", type: "behavioral" },
      { label: "High monthly card volume", evidence: "Card spend > $3k/mo across 50+ merchants", type: "behavioral" },
      { label: "Simplicity preference", evidence: "Customer ignores category-activation prompts in app", type: "behavioral" },
    ],
    estimatedAudience: 21_000_000,
    penetration: 0.084,
  },
  {
    id: "travel-card",
    name: "Travel Rewards Card",
    category: "Cards",
    icon: Plane,
    positioning: "Mid-tier travel card with points, no foreign transaction fees, and travel protections.",
    signals: [
      { label: "Multi-airline spend", evidence: "Spend across 2+ carriers in trailing 12 months", type: "behavioral" },
      { label: "Hotel diversity", evidence: "3+ distinct hotel chains within 6 months", type: "behavioral" },
      { label: "International transactions", evidence: "Foreign-currency spend in trailing 6 months", type: "behavioral" },
    ],
    estimatedAudience: 12_100_000,
    penetration: 0.048,
  },
  {
    id: "premium-travel-card",
    name: "Premium Travel Card",
    category: "Cards",
    icon: Gem,
    positioning: "Premium travel card with lounge access, travel credits, and elevated earn rates.",
    signals: [
      { label: "Frequent business travel", evidence: "Weekly hotel + airline pattern Mon–Thu", type: "behavioral" },
      { label: "Lounge-day-pass spend", evidence: "Card spend at airport lounges or day-pass providers", type: "behavioral" },
      { label: "Annual-fee tolerance", evidence: "Existing $95+ annual-fee card paid on time 24+ months", type: "behavioral" },
    ],
    estimatedAudience: 4_800_000,
    penetration: 0.019,
  },
  {
    id: "ultra-premium-travel-card",
    name: "Ultra-Premium Travel Card",
    category: "Cards",
    icon: Crown,
    positioning: "Top-tier travel card with concierge, hotel elite status, and global lounge network.",
    signals: [
      { label: "Luxury hotel pattern", evidence: "Stays at 5-star chains averaging > $600/night", type: "behavioral" },
      { label: "International first/business class", evidence: "Single-ticket airline charges > $5,000", type: "behavioral" },
      { label: "High investable assets", evidence: "Linked advised assets > $1M", type: "behavioral" },
    ],
    estimatedAudience: 1_100_000,
    penetration: 0.004,
  },
  {
    id: "balance-transfer-card",
    name: "Low-Rate Balance Transfer Card",
    category: "Cards",
    icon: RefreshCw,
    positioning: "Long 0% intro APR for customers carrying high-interest balances elsewhere.",
    signals: [
      { label: "External card revolve", evidence: "Recurring bill-pay to external issuers with minimum-payment pattern", type: "behavioral" },
      { label: "High-APR debt service", evidence: "Estimated finance charges > $75/mo on outside debt", type: "behavioral" },
      { label: "Stable income, no delinquencies", evidence: "On-time payments 24+ months across all accounts", type: "behavioral" },
    ],
    estimatedAudience: 6_700_000,
    penetration: 0.027,
  },
  {
    id: "cobrand-card",
    name: "Co-Brand Partner Card",
    category: "Cards",
    icon: Globe,
    positioning: "Affinity card with branded rewards for loyal customers of a specific airline, cruise, or retailer.",
    signals: [
      { label: "Single-brand loyalty", evidence: "60%+ of category spend with one airline, hotel, or retailer", type: "behavioral" },
      { label: "Loyalty-program engagement", evidence: "Recurring redemptions or status-qualifying spend", type: "behavioral" },
      { label: "Seasonal travel pattern", evidence: "Predictable annual booking cadence with same brand", type: "behavioral" },
    ],
    estimatedAudience: 3_400_000,
    penetration: 0.014,
  },
  {
    id: "sb-cashback-card",
    name: "Small Business Cash Back Card",
    category: "Cards",
    icon: Receipt,
    positioning: "Cash-back card built for owners on operating expenses and supplier spend.",
    signals: [
      { label: "Supplier card spend", evidence: "Recurring charges at wholesale, office supply, fuel cards", type: "behavioral" },
      { label: "Processor deposits", evidence: "Square / Stripe / Toast settlements to business account", type: "behavioral" },
      { label: "Employee card request", evidence: "Multiple authorized-user adds within 90 days", type: "behavioral" },
    ],
    estimatedAudience: 2_100_000,
    penetration: 0.008,
  },
  {
    id: "sb-flat-card",
    name: "Small Business Flat-Rate Card",
    category: "Cards",
    icon: FileSpreadsheet,
    positioning: "Simple unlimited cash back for business owners with diversified spend.",
    signals: [
      { label: "Diversified business spend", evidence: "Card spend across 30+ business-coded merchants/mo", type: "behavioral" },
      { label: "SaaS subscription stack", evidence: "10+ recurring SaaS charges on business account", type: "behavioral" },
      { label: "Growing payroll outflow", evidence: "Payroll provider ACH increasing quarter over quarter", type: "behavioral" },
    ],
    estimatedAudience: 1_600_000,
    penetration: 0.006,
  },
  {
    id: "sb-travel-card",
    name: "Small Business Travel Card",
    category: "Cards",
    icon: Plane,
    positioning: "Travel rewards card for owners and teams with frequent client travel.",
    signals: [
      { label: "Client travel pattern", evidence: "Hotel + rental car spend on business account weekly", type: "behavioral" },
      { label: "Conference / trade show spend", evidence: "Annual large registration fees + travel cluster", type: "behavioral" },
      { label: "International client base", evidence: "FX or international wires to business counterparties", type: "behavioral" },
    ],
    estimatedAudience: 900_000,
    penetration: 0.004,
  },

  // ===== INSURANCE =====
  {
    id: "life-insurance",
    name: "Term Life Insurance",
    category: "Insurance",
    icon: Shield,
    positioning: "Income protection for new families and primary earners.",
    signals: [
      { label: "Recent family formation", evidence: "Newborn cluster + first dependent listed on account", type: "life-event" },
      { label: "New mortgage holder", evidence: "Mortgage opened within trailing 12 months", type: "life-event" },
      { label: "Single-earner household", evidence: "One W-2 deposit source supporting 2+ dependents", type: "behavioral" },
    ],
    estimatedAudience: 7_500_000,
    penetration: 0.030,
  },
  {
    id: "permanent-life",
    name: "Permanent Life Insurance",
    category: "Insurance",
    icon: Shield,
    positioning: "Lifetime coverage with cash-value accumulation for estate and legacy planning.",
    signals: [
      { label: "Estate planning attorney spend", evidence: "Recurring legal ACH plus trust formation fees", type: "behavioral" },
      { label: "High investable assets", evidence: "Linked advised assets > $2M with tax-efficiency focus", type: "behavioral" },
      { label: "Multi-generational gifting", evidence: "Annual transfers near IRS gift-tax exclusion to family members", type: "behavioral" },
    ],
    estimatedAudience: 2_200_000,
    penetration: 0.009,
  },
  {
    id: "ltc-insurance",
    name: "Long-Term Care Insurance",
    category: "Insurance",
    icon: Umbrella,
    positioning: "Coverage for in-home and facility-based long-term care needs.",
    signals: [
      { label: "Pre-retiree age band", evidence: "Primary holder 55–65 with stable income", type: "life-event" },
      { label: "Parent-care indicators", evidence: "Recurring ACH to assisted-living or in-home care providers", type: "behavioral" },
      { label: "Health-cost uptick", evidence: "Rising medical specialist copays and pharmacy spend", type: "behavioral" },
    ],
    estimatedAudience: 4_100_000,
    penetration: 0.016,
  },
  {
    id: "annuity",
    name: "Annuity",
    category: "Insurance",
    icon: Landmark,
    positioning: "Guaranteed income and tax-deferred growth for pre-retirees and retirees.",
    signals: [
      { label: "Retirement countdown", evidence: "Primary holder 60–70 with declining payroll deposits", type: "life-event" },
      { label: "Pension lump-sum offer", evidence: "Unusually large single deposit from former employer", type: "life-event" },
      { label: "Conservative allocation drift", evidence: "Linked advised assets shifting to fixed income > 60%", type: "behavioral" },
    ],
    estimatedAudience: 3_600_000,
    penetration: 0.014,
  },
];

export function getProductFlow(id: string): ProductFlow | undefined {
  return PRODUCT_FLOWS.find((p) => p.id === id);
}
