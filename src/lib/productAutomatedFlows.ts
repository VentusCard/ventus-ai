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
  Heart,
  Truck,
  Gift,
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
      { label: "Newborn / toddler expense cluster", evidence: "Clustered spend at baby supply retailers, pediatric specialist copays (card), and daycare tuition (ACH) post-birth record.", type: "life-event" },
      { label: "College-bound dependent inferred", evidence: "Tuition payments to academic institutions (ACH/bill-pay), standardized test fees (card), and out-of-town travel to university towns.", type: "life-event" },
      { label: "Education savings visibility", evidence: "Outbound ACH transfers to known 529 plan providers or brokerage education accounts, alongside internal transfers.", type: "behavioral" },
    
      { label: "Newborn purchase cluster", evidence: "Buy Buy Baby, Carter's, pediatric copays within 90 days", type: "life-event" },
      { label: "Dependent age inference (0–2 yrs)", evidence: "Diaper subscriptions, daycare ACH, formula brands", type: "life-event" },
      { label: "College-age dependent (16–18 yrs)", evidence: "Private school tuition, SAT/ACT fees, college tour travel", type: "life-event" },
      { label: "Stated savings intent", evidence: "Search behavior for 'college savings' on bank web app", type: "behavioral" },
    : 14_200_000,
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
      { label: "External brokerage funding", evidence: "Regular ACH transfers or bill-pay to self-directed investment platforms beyond bank's offerings.", type: "behavioral" },
      { label: "Diversified crypto exposure", evidence: "Card or ACH outflows to multiple cryptocurrency exchanges, including 'VEN*Crypto' or 'SQC*Coinbase'.", type: "behavioral" },
      { label: "Investment research & cash hoarding", evidence: "Sustained high checking balances coupled with subscription payments to investment research services or financial news.", type: "behavioral" },
    
      { label: "External brokerage transfers", evidence: "Recurring ACH to third-party retail brokerage apps", type: "behavioral" },
      { label: "Crypto exchange activity", evidence: "Card or ACH spend at major crypto on-ramps", type: "behavioral" },
      { label: "Idle cash with investing intent", evidence: "Checking balance > $10k + research-site visits in-app", type: "behavioral" },
    : 22_000_000,
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
      { label: "New investor building capital", evidence: "Multiple small-dollar P2P transfers and recurring ACH debits to investment platforms/brokerages like 'VEN*ACORN', 'CHASE INV' after initial funding.", type: "behavioral" },
      { label: "Competitive wealth product funding", evidence: "Significant outbound ACH transfers/wires from DDA to external brokerage or robo-advisor (~$5k+) not associated with existing bank-managed investments.", type: "behavioral" },
      { label: "Late-career asset consolidation", evidence: "Large, infrequent inbound ACH credits/wires from pension or 401k administrators, followed by transfers to a new singular brokerage account with robo-advisor features.", type: "life-event" },
    
      { label: "First-time investor signals", evidence: "Small recurring transfers to investing apps under $200", type: "behavioral" },
      { label: "Idle savings drift", evidence: "Savings balance flat for 6+ months while income rises", type: "behavioral" },
      { label: "Stated goal-based intent", evidence: "Goal-planner tool engagement in bank app", type: "behavioral" },
    : 17_500_000,
    penetration: 0.070,
  },
  {
    id: "hybrid-advisor-portfolio",
    name: "Hybrid Advisor Portfolio",
    category: "Wealth",
    icon: UserCheck,
    positioning: "Managed portfolio with on-demand human advisor for mass-affluent households.",
    signals: [
      { label: "Wealth Accumulation Trigger", evidence: "Significant inflows from estate disbursement or business sale, followed by outflows to brokerage accounts or investment platforms.", type: "life-event" },
      { label: "Competitive Wealth Product Engagement", evidence: "Recurring outbound ACH transfers to external brokerage firms or investment robo-advisors; no matching inbound investment income.", type: "behavioral" },
      { label: "Professional Financial Guidance Seeking", evidence: "Frequent bill-pay to wealth management firms, financial advisors, or estate planning attorneys, coupled with large-value bank transfers.", type: "behavioral" },
    
      { label: "Mass-affluent balance band", evidence: "Investable assets $100k–$1M across linked accounts", type: "behavioral" },
      { label: "Advisor search engagement", evidence: "Repeated visits to 'find an advisor' page", type: "behavioral" },
      { label: "Life transition trigger", evidence: "Inheritance deposit, severance, or business-sale inflow", type: "life-event" },
    : 9_200_000,
    penetration: 0.037,
  },
  {
    id: "wealth-management",
    name: "Wealth Management",
    category: "Wealth",
    icon: Briefcase,
    positioning: "Holistic advisory for high-net-worth households and complex balance sheets.",
    signals: [
      { label: "Diversified equity compensation inflows", evidence: "Significant quarterly inflows from corporate payroll (ACH) and brokerage (wire) indicating RSU vest, ESPP buyback, or option exercise.", type: "behavioral" },
      { label: "Multi-institution wealth management", evidence: "Consistent outbound ACHs over $10k to external brokerage or private bank names, coupled with wire transfers.", type: "behavioral" },
      { label: "Luxury lifestyle memberships", evidence: "Recurring card charges and ACH payments to canonical private clubs, golf courses, or fractional jet operators.", type: "behavioral" },
      { label: "Complex asset liquidation event", evidence: "Large inbound wire transfer from an estate counsel IOLTA or real estate attorney, following irregular outflows.", type: "life-event" },
    
      { label: "Large equity comp deposit", evidence: "Quarterly RSU vest, ESPP buyback inflows", type: "behavioral" },
      { label: "Recurring brokerage transfers", evidence: "Outbound ACH to external brokerage > $5k/mo", type: "behavioral" },
      { label: "Country club dues", evidence: "Recurring private club, golf, yacht club ACH", type: "behavioral" },
      { label: "Private aviation indicator", evidence: "Charter operator card spend, fractional jet membership", type: "behavioral" },
    : 6_400_000,
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
      { label: "Significant Liquidity Event", evidence: "Large inbound ACH or wire transfers from M&A escrow, trust disbursement, or capital gains, exceeding $5M.", type: "life-event" },
      { label: "Distributed Real Estate Portfolio", evidence: "Recurring property tax payments via ACH or bill-pay to multiple distinct municipal or county entities.", type: "behavioral" },
      { label: "Complex Financial Management", evidence: "Multiple payroll ACH outflows, inter-entity transfers, and recurring wire payments to various specialized financial counterparties (e.g., trust, legal).", type: "behavioral" },
    
      { label: "Eight-figure inflow event", evidence: "Single deposit > $5M from M&A escrow or IPO", type: "life-event" },
      { label: "Multi-property tax footprint", evidence: "Property tax ACH to 3+ counties annually", type: "behavioral" },
      { label: "Family office indicator", evidence: "Recurring payroll outflows + multi-entity transfers", type: "behavioral" },
    : 850_000,
    penetration: 0.003,
  },
  {
    id: "ira",
    name: "Individual Retirement Account",
    category: "Wealth",
    icon: PiggyBank,
    positioning: "Tax-advantaged retirement account with Traditional, Roth, and Rollover options.",
    signals: [
      { label: "Retirement Account Consolidation", evidence: "Direct ACH transfers from external brokerage accounts (", type: "life-event" },
      { label: "Diversified Investment Strategy", evidence: "Regular, simultaneous ACH transfers to multiple investment platforms (brokerage, robo-advisor, alternative assets).", type: "behavioral" },
      { label: "Pre-Retirement Windfall", evidence: "Large, one-time inbound wire or ACH, followed by significant outbound investment vehicle funding transfers.", type: "life-event" },
    
      { label: "Job change rollover trigger", evidence: "Final payroll deposit followed by new employer ACH", type: "life-event" },
      { label: "Maxed 401(k) saver", evidence: "Consistent pre-tax payroll deferrals near IRS limit", type: "behavioral" },
      { label: "Self-employed income", evidence: "1099 deposits without W-2 payroll", type: "behavioral" },
    : 28_000_000,
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
      { label: "Estate Counsel Engaged", evidence: "Significant outgoing ACH/wire to identified estate counsel IOLTA, often alongside recurring bill-pay for legal retainers.", type: "life-event" },
      { label: "Eldercare Gifting/Payments", evidence: "Consistent P2P (Zelle/Venmo) transfers to family/caregivers, coupled with ACH payments to assisted living or home health providers.", type: "behavioral" },
      { label: "Wealth Transfer Indication", evidence: "Large inbound wire deposits from estate accounts, or outgoing ACH to multiple individual beneficiaries following a life event.", type: "life-event" },
    
      { label: "Estate planning attorney spend", evidence: "Recurring legal ACH plus notary fees", type: "behavioral" },
      { label: "Aging household signal", evidence: "Primary holder 65+ with charitable giving uptick", type: "life-event" },
      { label: "Beneficiary update activity", evidence: "In-app beneficiary form interactions", type: "behavioral" },
    : 2_400_000,
    penetration: 0.010,
  },
  {
    id: "values-portfolio",
    name: "Values-Aligned Portfolio",
    category: "Wealth",
    icon: Leaf,
    positioning: "Sustainable and impact-aligned managed portfolios for values-driven investors.",
    signals: [
      { label: "Ethical retail alignment", evidence: "Consistent spend at certified B-corp merchants and specialty organic grocers across card and P2P rails.", type: "behavioral" },
      { label: "Impact-driven philanthropy", evidence: "Regular, multi-rail donations to environmental NGOs and social justice organizations, alongside impact-fund contributions.", type: "behavioral" },
      { label: "Green vehicle adoption", evidence: "EV charging network subscriptions, home charging installations (ACH), and state-level EV rebate deposits.", type: "life-event" },
    
      { label: "Sustainable consumer pattern", evidence: "Recurring spend at certified-B / organic grocers", type: "behavioral" },
      { label: "Charitable giving cadence", evidence: "Monthly donations to environmental or social causes", type: "behavioral" },
      { label: "EV ownership", evidence: "Charging network subscriptions and EV-tax-credit refund", type: "behavioral" },
    : 5_600_000,
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
      { label: "Rent payments above local median", evidence: "Consistent ACH debits for rent, recurring P2P payments to 'landlord', or bill-pay to property management companies exceed local 75th percentile.", type: "behavioral" },
      { label: "Significant savings for down payment", evidence: "Consistent, increasing balance across savings accounts, coupled with incoming transfers from investment accounts or matured CDs, beyond regular income.", type: "behavioral" },
      { label: "Home-related expense surge", evidence: "Increased card spend at home improvement stores, furniture retailers, and moving services, immediately following a large outflow for a down payment or closing costs.", type: "life-event" },
    
      { label: "Rent above local median", evidence: "Recurring rent ACH > regional 75th percentile", type: "behavioral" },
      { label: "Pre-approval inquiry", evidence: "Soft-pull or rate-quote interaction in bank app", type: "life-event" },
      { label: "Down-payment accumulation", evidence: "Savings balance growth trajectory + low debt service", type: "behavioral" },
    : 13_700_000,
    penetration: 0.055,
  },
  {
    id: "heloc",
    name: "Home Equity Line of Credit",
    category: "Lending",
    icon: Home,
    positioning: "Flexible credit secured by home equity for renovations or large expenses.",
    signals: [
      { label: "Significant home improvement outlays", evidence: "Accumulation of large ticket card charges at building material retailers and ACH payments to general contractors exceeding $5,000 within 3 months.", type: "behavioral" },
      { label: "Recurring property tax payments", evidence: "Consistent annual or semi-annual ACH debits to municipal tax authorities or large bill-pay disbursements to county treasurers.", type: "behavioral" },
      { label: "Established property ownership", evidence: "Mortgage payments, property tax records, and utility bill-pays indicate continuous homeownership for over five years.", type: "life-event" },
      { label: "Home equity unlock potential", evidence: "Large inbound ACH from a different bank followed by series of high-value home improvement transactions via card and ACH.", type: "life-event" },
    
      { label: "Home renovation spend", evidence: "Home Depot, Lowe's, contractor ACH > $1,000", type: "behavioral" },
      { label: "Property tax payment", evidence: "Annual or semi-annual county treasurer ACH", type: "behavioral" },
      { label: "Long-term homeowner", evidence: "Mortgage on file > 5 years with current bank", type: "life-event" },
    : 9_800_000,
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
      { label: "Auto shopping behavior", evidence: "Card spend at multiple dealerships, with parallel ACH inquiries and insurance prepayments within 30 days.", type: "behavioral" },
      { label: "Outbound auto loan payoff", evidence: "Large outbound wire or ACH to a captive auto lender, with concurrent DMV payment.", type: "life-event" },
      { label: "New auto loan origination", evidence: "Large inbound ACH from a financial institution followed by regular outbound ACH payments to an auto lender.", type: "life-event" },
    
      { label: "Repeated dealer visits", evidence: "Card-present spend at dealerships across 2+ weekends", type: "behavioral" },
      { label: "Lease-end timing", evidence: "Captive lender ACH ending in 60–90 days", type: "life-event" },
      { label: "Auto insurance shop-around", evidence: "Multiple insurer one-time charges within 30 days", type: "behavioral" },
    : 11_500_000,
    penetration: 0.046,
  },
  {
    id: "auto-refi",
    name: "Auto Refinance",
    category: "Lending",
    icon: RefreshCw,
    positioning: "Lower-rate refinance for customers carrying a high-APR auto loan elsewhere.",
    signals: [
      { label: "Outbound auto loan payments", evidence: "Consistent ACH or bill-pay outflows to captive auto lenders, or transfers to external accounts followed by loan payments.", type: "behavioral" },
      { label: "Increased disposable income", evidence: "Sustained increase in direct-deposit payroll or P2P inflows, with no corresponding increase in recurring bill-pay or card outflows.", type: "life-event" },
      { label: "Refinance research behavior", evidence: "Frequent card transactions or ACH payments to credit reporting agencies, or inquiries to 'loan comparison' services.", type: "behavioral" },
    
      { label: "High-APR captive lender", evidence: "Monthly ACH to subprime auto lender > 24 months", type: "behavioral" },
      { label: "Credit score improvement", evidence: "Bureau-pulled score up 60+ pts since origination", type: "behavioral" },
      { label: "Income step-up", evidence: "Payroll deposit increase > 15% sustained 6 months", type: "life-event" },
    : 7_300_000,
    penetration: 0.029,
  },
  {
    id: "personal-loan",
    name: "Personal Loan",
    category: "Lending",
    icon: HandCoins,
    positioning: "Unsecured installment loans for consolidation or one-time expenses.",
    signals: [
      { label: "Third-party lender repayment", evidence: "ACH debits to known captive lenders, matched with bill-pay to non-bank lenders or external card paydowns for credit products.", type: "behavioral" },
      { label: "Emergency cash injection", evidence: "Inbound P2P transfers from multiple individuals or cash-out activity from diverse sources like 'VEN*CASH-OUT' followed by immediate bill payments.", type: "life-event" },
      { label: "Debt spiral risk", evidence: "Consistent high-utilization credit card balances paired with increasing ACH debits to collection agencies or frequent 'STRP*LOAN' type transactions.", type: "behavioral" },
    
      { label: "Repeated BNPL usage", evidence: "Affirm, Klarna, Afterpay charges across 3+ merchants", type: "behavioral" },
      { label: "Cash-advance recovery", evidence: "Card cash-advance followed by paycheck-aligned paydown", type: "behavioral" },
      { label: "Revolving balance creep", evidence: "Card utilization rising for 4+ consecutive cycles", type: "behavioral" },
    : 8_900_000,
    penetration: 0.036,
  },
  {
    id: "small-business-loan",
    name: "Small Business Loan",
    category: "Lending",
    icon: Store,
    positioning: "Working capital and term loans for sole proprietors and small businesses.",
    signals: [
      { label: "Emerging microbusiness revenue", evidence: "Regular deposits from payment processors like Stripe/Square/Paypal into a personal account, alongside business-category card spend.", type: "behavioral" },
      { label: "Business supplier network", evidence: "Multiple distinct ACH payments to known business suppliers, combined with online bill-pays to professional services or software vendors.", type: "behavioral" },
      { label: "Dedicated business operations", evidence: "Consistent card spending at office supply stores or SaaS providers, coupled with ACH transfers to a separate business account or payroll service.", type: "behavioral" },
    
      { label: "Vendor ACH cluster", evidence: "5+ distinct business-supplier ACH counterparties", type: "behavioral" },
      { label: "Square / Stripe deposits", evidence: "Recurring processor deposits to personal account", type: "behavioral" },
      { label: "Business-pattern card use", evidence: "Office supply + SaaS subscription combo", type: "behavioral" },
    : 3_200_000,
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
      { label: "Educational Institution Inflows", evidence: "Consistent ACH credits from universities or vocational schools alongside P2P from guardian counterparties.", type: "life-event" },
      { label: "Emerging Financial Footprint", evidence: "Limited credit bureau data, with early-stage card and ACH activity showing reliance on cash alternatives and P2P payments.", type: "life-event" },
      { label: "Prepaid Card Ecosystem Engagement", evidence: "Regular bill-pay transfers to known prepaid card providers (e.g., \"CHIME\", \"GREEN DOT\") and P2P loads to digital wallets.", type: "behavioral" },
    
      { label: "Student inflow pattern", evidence: "University refunds, work-study payroll, parent transfers", type: "life-event" },
      { label: "Thin-file young adult", evidence: "Age 18–24 with single low-volume account", type: "life-event" },
      { label: "Prepaid card top-ups", evidence: "Recurring loads to prepaid debit programs", type: "behavioral" },
    : 19_000_000,
    penetration: 0.076,
  },
  {
    id: "everyday-checking",
    name: "Everyday Checking",
    category: "Deposits",
    icon: Banknote,
    positioning: "Primary checking with direct deposit, bill pay, and broad ATM access.",
    signals: [
      { label: "Cross-rail payroll anchoring", evidence: "Consistent W-2 payroll inflow via ACH, coupled with minimal P2P cash-out or external account transfers.", type: "behavioral" },
      { label: "Bill-pay hub establishment", evidence: "Multiple bill-pay transactions to utilities, rent, and captive auto lenders, indicating primary bill management.", type: "behavioral" },
      { label: "Joint financial anchoring", evidence: "Shared address update alongside new joint account opening and recurring inter-account transfers to other known accounts.", type: "life-event" },
    
      { label: "Direct deposit anchor", evidence: "Recurring W-2 payroll deposit as primary inflow", type: "behavioral" },
      { label: "Recurring bill-pay use", evidence: "5+ scheduled bill-pay payees active monthly", type: "behavioral" },
      { label: "Household formation", evidence: "Recent address change + joint account opening", type: "life-event" },
    : 62_000_000,
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
      { label: "Multi-product household indicator", evidence: "Customer shows payments to captive auto lenders, mortgage servicers, and external credit cards across ACH and bill pay.", type: "behavioral" },
      { label: "High liquidity across rails", evidence: "Consistent high balances in checking, plus inbound transfers from brokerages and outbound bill pays to external investment platforms.", type: "behavioral" },
      { label: "Wealth management engagement", evidence: "Regular ACH transfers to/from known investment platforms and advisory firms, alongside bill pay for estate counsel fees.", type: "behavioral" },
    
      { label: "Multi-product household", evidence: "Customer holds 3+ products across deposits, cards, and lending", type: "behavioral" },
      { label: "High average balance", evidence: "Combined deposits > $20k for trailing 90 days", type: "behavioral" },
      { label: "Wealth product overlap", evidence: "Linked brokerage or advised assets on file", type: "behavioral" },
    : 9_500_000,
    penetration: 0.038,
  },
  {
    id: "core-savings",
    name: "Core Savings",
    category: "Deposits",
    icon: PiggyBank,
    positioning: "Companion savings account with automatic-transfer tools for everyday savers.",
    signals: [
      { label: "Consistent micro-savings behavior", evidence: "Daily small-dollar transfers from checking to savings, augmented by debit card round-up programs", type: "behavioral" },
      { label: "Dedicated savings goal", evidence: "Recurring transfers to a savings account, often with a unique memo like 'down payment' or 'tuition fund'", type: "behavioral" },
      { label: "Significant tax refund received", evidence: "Large annual inflow from tax authorities (IRS, state DOR) via ACH or direct deposit, frequently >$1,500", type: "life-event" },
    
      { label: "Round-up saver pattern", evidence: "Frequent small recurring transfers from checking", type: "behavioral" },
      { label: "Goal-based saving", evidence: "Self-named savings sub-accounts created in-app", type: "behavioral" },
      { label: "Tax-refund inflow", evidence: "IRS or state refund deposit > $1,000", type: "life-event" },
    : 34_000_000,
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
      { label: "High Checking Balance, Low-Yield", evidence: "Consistent checking account balances exceeding $25,000 for 90+ days, with minimal linked savings account activity.", type: "behavioral" },
      { label: "Outbound Yield-Seeking Transfers", evidence: "Recurring ACH transfers to known investment platforms, brokerage accounts, or high-yield fintech savings products.", type: "behavioral" },
      { label: "Competitive Product Funding", evidence: "Inbound ACH linked to a prominent challenger bank or investment product, followed by large outbound transfers from checking.", type: "life-event" },
    
      { label: "Idle checking balance", evidence: "Avg balance > $25k for 90 consecutive days", type: "behavioral" },
      { label: "Outbound yield-seeking", evidence: "Recurring ACH to neobank or money-market app", type: "behavioral" },
    : 18_600_000,
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
      { label: "External CD Matures", evidence: "Large inbound ACH or wire from another financial institution, paired with no matching outbound CD purchase.", type: "life-event" },
      { label: "Senior Wealth Builder", evidence: "Consistent inbound Social Security or pension ACH, coupled with recurring bill-pay to retirement community and medical providers.", type: "behavioral" },
      { label: "Fixed Income Seeker", evidence: "Frequent outbound transfers to online brokerage for bond/Treasury ETFs, or direct ACH to government treasury programs.", type: "behavioral" },
    
      { label: "Maturing external CD", evidence: "Lump-sum inflow from competitor bank near month-end", type: "life-event" },
      { label: "Retirement-age saver", evidence: "Primary holder 60+ with conservative balance growth", type: "life-event" },
      { label: "Treasury-purchase activity", evidence: "Outbound ACH to TreasuryDirect or T-bill ETFs", type: "behavioral" },
    : 11_000_000,
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
      { label: "Heavy discretionary category spend", evidence: "Consistent high spend on selected reward categories like dining, entertainment, or travel, visible across card and P2P rails.", type: "behavioral" },
      { label: "Competitor card funding", evidence: "Regular bill-pay or ACH transfers to other card issuers, indicating external card payments and usage.", type: "behavioral" },
      { label: "Growing card engagement", evidence: "Increasing monthly transaction volume and value on a single card, with new linked bill-pay or P2P activity.", type: "behavioral" },
    
      { label: "Concentrated category spend", evidence: "Single category > 40% of card spend (gas, dining, online)", type: "behavioral" },
      { label: "Competitor rewards card use", evidence: "External card statement payments via bill-pay", type: "behavioral" },
      { label: "First-card upgrade signal", evidence: "Holds entry-level card with rising monthly volume", type: "behavioral" },
    : 24_000_000,
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
      { label: "Diversified everyday spend profile", evidence: "Consistent multi-category general-purpose card spend across 50+ merchants, supplemented by recurring bill-pay and P2P for services.", type: "behavioral" },
      { label: "High share of wallet, everyday spend", evidence: "Large proportion of essential spending (groceries, fuel, dining) consistently captured on card, minimal external card paydown ACH.", type: "behavioral" },
      { label: "Simplified rewards preference", evidence: "Ignored category-activation prompts on card, consistent P2P/ACH for structured bills, suggests preference for flat-rate rewards.", type: "behavioral" },
      { label: "Cross-rail discretionary spending", evidence: "Balanced discretionary spending across card (e.g., entertainment, apparel) and P2P (e.g., VEN* for social activities or shared expenses).", type: "behavioral" },
    
      { label: "Diversified everyday spend", evidence: "No single category > 25% of card volume", type: "behavioral" },
      { label: "High monthly card volume", evidence: "Card spend > $3k/mo across 50+ merchants", type: "behavioral" },
      { label: "Simplicity preference", evidence: "Customer ignores category-activation prompts in app", type: "behavioral" },
    : 21_000_000,
    penetration: 0.084,
  },
  {
    id: "travel-card",
    name: "Travel Rewards Card",
    category: "Cards",
    icon: Plane,
    positioning: "Mid-tier travel card with points, no foreign transaction fees, and travel protections.",
    signals: [
      { label: "Travel booked across providers", evidence: "Card spend and ACH debits to multiple airlines, online travel agencies, and hotel groups within 90 days, including 'ACME Travel' and 'Expedia'.", type: "behavioral" },
      { label: "Foreign transaction history", evidence: "Card foreign currency transactions, plus international wire transfers or P2P to foreign persons, within the last six months.", type: "behavioral" },
      { label: "Pre-travel spending surge", evidence: "Elevated card spend at specialty apparel, luggage, and duty-free merchants, correlated with upcoming travel-related debits and P2P payments.", type: "behavioral" },
    
      { label: "Multi-airline spend", evidence: "Spend across 2+ carriers in trailing 12 months", type: "behavioral" },
      { label: "Hotel diversity", evidence: "3+ distinct hotel chains within 6 months", type: "behavioral" },
      { label: "International transactions", evidence: "Foreign-currency spend in trailing 6 months", type: "behavioral" },
    : 12_100_000,
    penetration: 0.048,
  },
  {
    id: "premium-travel-card",
    name: "Premium Travel Card",
    category: "Cards",
    icon: Gem,
    positioning: "Premium travel card with lounge access, travel credits, and elevated earn rates.",
    signals: [
      { label: "Frequent business traveler", evidence: "Regular T&E transactions across corporate cards, personal cards and expense reimbursements for lodging and airfare.", type: "behavioral" },
      { label: "Luxury travel indulgence", evidence: "Consistent personal card spend at premium airlines, resorts, and fine dining establishments, often exceeding corporate travel budgets.", type: "behavioral" },
      { label: "Broad travel ecosystem spend", evidence: "Frequent transactions for ride-sharing, luggage, adaptive clothing, and travel medical, indicating extensive and diverse travel needs.", type: "behavioral" },
    
      { label: "Frequent business travel", evidence: "Weekly hotel + airline pattern Mon–Thu", type: "behavioral" },
      { label: "Lounge-day-pass spend", evidence: "Card spend at airport lounges or day-pass providers", type: "behavioral" },
      { label: "Annual-fee tolerance", evidence: "Existing $95+ annual-fee card paid on time 24+ months", type: "behavioral" },
    : 4_800_000,
    penetration: 0.019,
  },
  {
    id: "ultra-premium-travel-card",
    name: "Ultra-Premium Travel Card",
    category: "Cards",
    icon: Crown,
    positioning: "Top-tier travel card with concierge, hotel elite status, and global lounge network.",
    signals: [
      { label: "Premium travel ecosystem engagement", evidence: "Consistent spend at luxury hotels and airlines, often with global lounge network, across card and bill-pay rails.", type: "behavioral" },
      { label: "Affluent global traveler profile", evidence: "Frequent, high-value foreign currency transactions and cross-border payments for travel services via cards and wires.", type: "behavioral" },
      { label: "Concierge service dependency", evidence: "Repeated card transactions with known concierge merchant types, often followed by high-end travel or experience purchases.", type: "behavioral" },
    
      { label: "Luxury hotel pattern", evidence: "Stays at 5-star chains averaging > $600/night", type: "behavioral" },
      { label: "International first/business class", evidence: "Single-ticket airline charges > $5,000", type: "behavioral" },
      { label: "High investable assets", evidence: "Linked advised assets > $1M", type: "behavioral" },
    : 1_100_000,
    penetration: 0.004,
  },
  {
    id: "balance-transfer-card",
    name: "Low-Rate Balance Transfer Card",
    category: "Cards",
    icon: RefreshCw,
    positioning: "Long 0% intro APR for customers carrying high-interest balances elsewhere.",
    signals: [
      { label: "External Card Debt Servicing", evidence: "Consistent bill-pay to multiple external card issuers, identified via semantic merchant resolution from cryptic descriptors.", type: "behavioral" },
      { label: "High-Cost Debt Indicators", evidence: "Recurring ACH transfers and bill-pays to non-bank lenders and credit card companies, showing high estimated interest payments.", type: "behavioral" },
      { label: "Opportunity for Wallet Share", evidence: "Significant external credit card payments observed across bill-pay and P2P, indicating potential to consolidate balances.", type: "behavioral" },
    
      { label: "External card revolve", evidence: "Recurring bill-pay to external issuers with minimum-payment pattern", type: "behavioral" },
      { label: "High-APR debt service", evidence: "Estimated finance charges > $75/mo on outside debt", type: "behavioral" },
      { label: "Stable income, no delinquencies", evidence: "On-time payments 24+ months across all accounts", type: "behavioral" },
    : 6_700_000,
    penetration: 0.027,
  },
  {
    id: "cobrand-card",
    name: "Co-Brand Partner Card",
    category: "Cards",
    icon: Globe,
    positioning: "Affinity card with branded rewards for loyal customers of a specific airline, cruise, or retailer.",
    signals: [
      { label: "Deep brand loyalty", evidence: "Majority of consumer spend at a single merchant and related ecosystem via card, with cross-rail recognition of brand payments.", type: "behavioral" },
      { label: "Competitive card wallet share", evidence: "Inbound ACH transfers from other financial institutions for credit card payments, indicating competitor usage within the same spend category.", type: "behavioral" },
      { label: "Brand-specific travel investment", evidence: "Card and bill-pay transactions show consistent booking and payment for a single airline, cruise line, or related travel provider.", type: "behavioral" },
    
      { label: "Single-brand loyalty", evidence: "60%+ of category spend with one airline, hotel, or retailer", type: "behavioral" },
      { label: "Loyalty-program engagement", evidence: "Recurring redemptions or status-qualifying spend", type: "behavioral" },
      { label: "Seasonal travel pattern", evidence: "Predictable annual booking cadence with same brand", type: "behavioral" },
    : 3_400_000,
    penetration: 0.014,
  },

  // ===== INSURANCE =====
  {
    id: "life-insurance",
    name: "Term Life Insurance",
    category: "Insurance",
    icon: Shield,
    positioning: "Income protection for new families and primary earners.",
    signals: [
      { label: "New dependent expenses", evidence: "Increased spend at pediatric offices (card), daycare centers (ACH), and children's apparel (card) following birth-event cluster.", type: "life-event" },
      { label: "Increased housing costs", evidence: "New recurring ACH payments to a mortgage servicer or significantly larger rent payments (bill-pay) started recently.", type: "life-event" },
      { label: "Consolidated income dependency", evidence: "One primary income source (ACH payroll) increasingly covers household expenses and transfers to other accounts (P2P, bill-pay).", type: "behavioral" },
    
      { label: "Recent family formation", evidence: "Newborn cluster + first dependent listed on account", type: "life-event" },
      { label: "New mortgage holder", evidence: "Mortgage opened within trailing 12 months", type: "life-event" },
      { label: "Single-earner household", evidence: "One W-2 deposit source supporting 2+ dependents", type: "behavioral" },
    : 7_500_000,
    penetration: 0.030,
  },
  {
    id: "permanent-life",
    name: "Permanent Life Insurance",
    category: "Insurance",
    icon: Shield,
    positioning: "Lifetime coverage with cash-value accumulation for estate and legacy planning.",
    signals: [
      { label: "Substantial legal & accounting spend", evidence: "Consistent legal and accounting firm payments via ACH, wire, and bill pay, especially for trust and estate services.", type: "behavioral" },
      { label: "Diversified asset management", evidence: "Outflows to multiple brokerages, private equity firms or alternative investment vehicles via ACH and wire transfers.", type: "behavioral" },
      { label: "Intergenerational wealth transfer", evidence: "Regular P2P and wire transfers to multiple family members, often near annual gift tax exclusion limits.", type: "behavioral" },
    
      { label: "Estate planning attorney spend", evidence: "Recurring legal ACH plus trust formation fees", type: "behavioral" },
      { label: "High investable assets", evidence: "Linked advised assets > $2M with tax-efficiency focus", type: "behavioral" },
      { label: "Multi-generational gifting", evidence: "Annual transfers near IRS gift-tax exclusion to family members", type: "behavioral" },
    : 2_200_000,
    penetration: 0.009,
  },
  {
    id: "ltc-insurance",
    name: "Long-Term Care Insurance",
    category: "Insurance",
    icon: Umbrella,
    positioning: "Coverage for in-home and facility-based long-term care needs.",
    signals: [
      { label: "Emerging Eldercare Costs", evidence: "Increased bill-pay to assisted-living facilities, recurring ACH to home healthcare agencies, and P2P payments for care services.", type: "behavioral" },
      { label: "Family Financial Reorganization", evidence: "New wires/ACH from family members, trust disbursements, or sudden large transfers to estate-counsel IOLTA accounts.", type: "life-event" },
      { label: "Complex Health Spend Uptick", evidence: "Rising card spend at specialized medical practices combined with increasing P2P to nursing support or medical supply vendors.", type: "behavioral" },
    
      { label: "Pre-retiree age band", evidence: "Primary holder 55–65 with stable income", type: "life-event" },
      { label: "Parent-care indicators", evidence: "Recurring ACH to assisted-living or in-home care providers", type: "behavioral" },
      { label: "Health-cost uptick", evidence: "Rising medical specialist copays and pharmacy spend", type: "behavioral" },
    : 4_100_000,
    penetration: 0.016,
  },
  {
    id: "annuity",
    name: "Annuity",
    category: "Insurance",
    icon: Landmark,
    positioning: "Guaranteed income and tax-deferred growth for pre-retirees and retirees.",
    signals: [
      { label: "Pension liquidation and rollover", evidence: "Large inbound ACH from known pension administrator, followed by outbound wire to brokerage or mutual fund 'for deposit only'", type: "life-event" },
      { label: "Diversified retirement funding", evidence: "Regular inbound transfers from multiple sources including employment income, investment dividends, and external annuity payments across ACH/wire.", type: "behavioral" },
      { label: "Approaching retirement age", evidence: "Consistent payroll deposits declining in frequency or amount, paired with increased medical spending (copays, prescriptions) via card or ACH.", type: "life-event" },
    
      { label: "Retirement countdown", evidence: "Primary holder 60–70 with declining payroll deposits", type: "life-event" },
      { label: "Pension lump-sum offer", evidence: "Unusually large single deposit from former employer", type: "life-event" },
      { label: "Conservative allocation drift", evidence: "Linked advised assets shifting to fixed income > 60%", type: "behavioral" },
    : 3_600_000,
    penetration: 0.014,
  },

  // ===== LIFE-EVENT FLOWS =====
  {
    id: "wedding-loan",
    name: "Wedding Personal Loan",
    category: "Lending",
    icon: Heart,
    positioning: "Fixed-rate financing for engagement, wedding, and honeymoon expenses.",
    signals: [
      { label: "High-value jewelry purchase", evidence: "Card spend over $2k at fine-jewelry MCCs, often followed by credit card paydown.", type: "life-event" },
      { label: "Recurring wedding vendor payments", evidence: "Clustered card, Bill-Pay, or ACH outflows to multiple wedding-related categories like venues, caterers, or event planners.", type: "life-event" },
      { label: "Honeymoon travel bookings", evidence: "Clusters of card or online travel agency (OTA) spend for flights, lodging, and experiences in common honeymoon destinations.", type: "life-event" },
    
      { label: "Engagement spend cluster", evidence: "Jewelry purchase at premium retailer over $3k", type: "life-event" },
      { label: "Venue and vendor deposits", evidence: "Recurring deposits to catering, venue, and photography vendors", type: "life-event" },
      { label: "Save-the-date stationery", evidence: "Spend at print/stationery merchants plus dress retailers", type: "behavioral" },
    : 2_400_000,
    penetration: 0.010,
  },
  {
    id: "solo-restart-checking",
    name: "Solo Restart Checking",
    category: "Deposits",
    icon: RefreshCw,
    positioning: "Fresh standalone checking with budgeting tools for customers re-establishing solo finances.",
    signals: [
      { label: "Emerging solo bill-pay pattern", evidence: "Formerly joint bill-payees (e.g., utility, rent) now exclusively single-payer via ACH or bill-pay, often with new account numbers.", type: "life-event" },
      { label: "Family law/legal services engagement", evidence: "Multiple disaggregated payments to legal services firms, ", type: "life-event" },
      { label: "New solo rent or mortgage payments", evidence: "First-time or new recurring rent/mortgage payments via ACH or bill-pay, linked to a single individual, following a period of joint housing payments.", type: "life-event" },
    
      { label: "Joint-to-solo ACH shift", evidence: "Shared bill-pay payees splitting to one holder", type: "life-event" },
      { label: "Family-law attorney spend", evidence: "Recurring legal ACH to family-law firm over 60+ days", type: "life-event" },
      { label: "Address change with single holder", evidence: "New residential address tied to one name on account", type: "life-event" },
    : 3_100_000,
    penetration: 0.012,
  },
  {
    id: "inherited-ira",
    name: "Inherited IRA",
    category: "Wealth",
    icon: Gift,
    positioning: "Beneficiary IRA structure preserving tax treatment for inherited retirement assets.",
    signals: [
      { label: "Estate settlement inflow", evidence: "Large inbound ACH or wire from an estate counsel IOLTA or trust disbursement, potentially preceded by multiple smaller legal/probate fees.", type: "life-event" },
      { label: "Recurring wealth transfer", evidence: "Consistent outbound ACHs or bill-pays to a financial advisor or brokerage, following a large estate inflow event.", type: "behavioral" },
      { label: "Beneficiary data update", evidence: "Digital engagement with beneficiary forms or account titling changes observed across multiple financial platforms or bank products.", type: "behavioral" },
    
      { label: "Estate distribution inflow", evidence: "Single deposit from estate or trust counsel over $50k", type: "life-event" },
      { label: "Beneficiary form activity", evidence: "In-app beneficiary update or claim form interaction", type: "behavioral" },
      { label: "Survivor signal", evidence: "Joint account converting to single after death certificate", type: "life-event" },
    : 1_900_000,
    penetration: 0.008,
  },
  {
    id: "second-home-mortgage",
    name: "Second Home Mortgage",
    category: "Lending",
    icon: Home,
    positioning: "Purchase financing for vacation or seasonal-use second properties.",
    signals: [
      { label: "Vacation area lodging and dining", evidence: "Card spend at resorts and restaurants in a distinct geographic region cross-referenced with ACH to local utilities or property management.", type: "behavioral" },
      { label: "Second property tax payments", evidence: "Multiple large-value ACH or bill-pay transactions to distinct county tax assessors with different geographic markers.", type: "behavioral" },
      { label: "Remote property maintenance payments", evidence: "Recurring card or bill-pay transactions to landscaping, pool, or home repair services in a non-primary residential area.", type: "behavioral" },
      { label: "Out-of-area contractor payments", evidence: "Large-value ACH or wire transfers to contractors and builders located outside the primary residence's metropolitan area.", type: "life-event" },
    
      { label: "Repeated locale travel", evidence: "Recurring vacation-rental spend in the same metro area", type: "behavioral" },
      { label: "Multi-state property tax", evidence: "Property tax ACH to a second county annually", type: "behavioral" },
      { label: "High household income", evidence: "Sustained payroll deposits in top income decile", type: "behavioral" },
    : 1_400_000,
    penetration: 0.006,
  },
  {
    id: "student-loan-refi",
    name: "Student Loan Refinance",
    category: "Lending",
    icon: GraduationCap,
    positioning: "Lower-rate refinance for borrowers carrying federal or private student loans.",
    signals: [
      { label: "Student loan consolidation inquiry", evidence: "Multiple recent hard credit inquiries from student lenders followed by a new recurring ACH to a consolidated servicer.", type: "life-event" },
      { label: "Career launch income surge", evidence: "Significant and sustained increase in payroll deposits, potentially combined with relocation expenses via card and bill pay.", type: "life-event" },
      { label: "Student loan wallet share shift", evidence: "Decreased or terminated ACH payments to original student loan servicers, replaced by new payments to a competing financial institution.", type: "behavioral" },
    
      { label: "Student loan servicer ACH", evidence: "Recurring monthly payment to a known student-loan servicer", type: "behavioral" },
      { label: "Post-grad income step-up", evidence: "Payroll deposit increase > 25% sustained 6+ months", type: "life-event" },
      { label: "Credit profile strengthening", evidence: "On-time payments 18+ months with rising score", type: "behavioral" },
    : 5_800_000,
    penetration: 0.023,
  },
  {
    id: "hsa",
    name: "Health Savings Account",
    category: "Deposits",
    icon: Heart,
    positioning: "Triple-tax-advantaged savings for customers on high-deductible health plans.",
    signals: [
      { label: "HSA Contribution Trend", evidence: "Regular inbound ACH transfers from employer payroll or personal funding to a health savings administrator; may see 'HSA' or 'HEALTH SA' in descriptor.", type: "behavioral" },
      { label: "High Deductible Plan Medical Outflows", evidence: "Consistent, out-of-pocket card or ACH payments to medical providers ('HOSPITAL', 'PEDIATRIC', 'RX') before typical insurance coverage limits are met.", type: "behavioral" },
      { label: "Catch-Up Contribution Eligibility", evidence: "Periodic, larger-than-normal ACH or P2P contributions to an HSA administrator, often occurring around age 55, indicating catch-up contributions.", type: "life-event" },
    
      { label: "HDHP premium pattern", evidence: "Employer health premium deduction sized for high-deductible plan", type: "behavioral" },
      { label: "Recurring pharmacy and specialist copays", evidence: "Steady out-of-pocket medical spend across providers", type: "behavioral" },
      { label: "Year-end FSA cliff", evidence: "December spending spike at health-related merchants", type: "life-event" },
    : 9_400_000,
    penetration: 0.038,
  },
  {
    id: "donor-advised-fund",
    name: "Donor-Advised Fund",
    category: "Wealth",
    icon: HeartHandshake,
    positioning: "Tax-efficient charitable giving vehicle with invested balances for long-term impact.",
    signals: [
      { label: "Significant annual giving", evidence: "Large Q4 bill-pay and ACH outflows to diverse charitable organizations, exceeding prior yearly averages by 2x.", type: "behavioral" },
      { label: "Diversified giving portfolio", evidence: "Consistent P2P, bill-pay, and card donations to multiple distinct non-profit categories (e.g., education, arts, social services).", type: "behavioral" },
      { label: "New philanthropic intent", evidence: "Initial large ACH or wire transfer to a DAF sponsor or community foundation, followed by segmented outflows to charities.", type: "life-event" },
    
      { label: "Year-end charitable spike", evidence: "Large Q4 donations to multiple 501(c)(3) recipients", type: "behavioral" },
      { label: "Recurring nonprofit giving", evidence: "Monthly donations across 3+ charities", type: "behavioral" },
      { label: "High investable assets", evidence: "Linked advised assets > $500k", type: "behavioral" },
    : 2_100_000,
    penetration: 0.008,
  },
  {
    id: "personal-line-of-credit",
    name: "Personal Line of Credit",
    category: "Lending",
    icon: HandCoins,
    positioning: "Revolving unsecured line for flexible access during income gaps or large planned outflows.",
    signals: [
      { label: "Income Interruption Or Reduction", evidence: "Observed absence of typical payroll deposits or recurring income, or a sustained decrease in deposit amounts across ACH and P2P rails.", type: "life-event" },
      { label: "Emergency Savings Depletion/Creation", evidence: "Rapid, multi-rail cash-out movements to external accounts or P2P; or new, consistent inflows from an external investment or savings provider.", type: "life-event" },
      { label: "Sustained High Credit Utilization", evidence: "Consistent external credit card payments via bill-pay show increasing principal paydowns, indicating rising revolving debt across card rails.", type: "behavioral" },
      { label: "Increased Reliance On Non-Bank Financial Services", evidence: "Recurring outbound transfers to alternative lenders or 'pay-over-time' services, indicating use of external credit providers.", type: "behavioral" },
    
      { label: "Payroll gap or step-down", evidence: "Missed expected payroll cycle or sustained income drop", type: "life-event" },
      { label: "Healthy savings ratio", evidence: "Savings buffer covers 3+ months of essential outflows", type: "behavioral" },
      { label: "Card utilization climbing", evidence: "Card utilization rising for 3+ consecutive cycles", type: "behavioral" },
    : 6_500_000,
    penetration: 0.026,
  },
  {
    id: "global-account",
    name: "Multi-Currency Global Account",
    category: "Deposits",
    icon: Globe,
    positioning: "Cross-border account with multi-currency holdings and reduced FX wire fees.",
    signals: [
      { label: "Foreign payroll income", evidence: "Recurring ACH or swift credits from foreign employer, with 'PAYROLL' or 'SALARY' in descriptor and non-USD original currency.", type: "life-event" },
      { label: "Multi-currency lifestyle indicator", evidence: "Sustained card spend in non-USD across multiple currencies, combined with P2P to international recipients.", type: "behavioral" },
      { label: "Frequent international transfers", evidence: "Recurring outbound or inbound wires/ACH to/from foreign counterparties, including 'SWIFT' or 'IBAN' references.", type: "behavioral" },
    
      { label: "International payroll inflow", evidence: "Recurring deposit from foreign-domiciled employer", type: "life-event" },
      { label: "Foreign-currency card spend", evidence: "Sustained card spend in non-USD across trailing 3 months", type: "behavioral" },
      { label: "Cross-border wires", evidence: "Recurring outbound or inbound international wires", type: "behavioral" },
    : 1_700_000,
    penetration: 0.007,
  },
  {
    id: "homeowners-insurance",
    name: "Homeowners Insurance",
    category: "Insurance",
    icon: Shield,
    positioning: "Bundled property and liability coverage for primary-residence homeowners.",
    signals: [
      { label: "Recent Home Purchase Mortgage", evidence: "New mortgage disbursements and principal payments via ACH and wire to a known lender.", type: "life-event" },
      { label: "Home Improvement Project Concluding", evidence: "Clustering of final large-dollar ACH payments to contractors and building material suppliers.", type: "life-event" },
      { label: "No Recurring Home Insurance", evidence: "Absence of recurring bill-pay or ACH payments to property & casualty insurers, despite property ownership.", type: "behavioral" },
    
      { label: "New mortgage on file", evidence: "Mortgage opened within trailing 6 months", type: "life-event" },
      { label: "No insurer ACH detected", evidence: "No recurring insurance premium tied to property address", type: "behavioral" },
      { label: "Renovation completion", evidence: "Large contractor ACH cluster wrapping up", type: "behavioral" },
    : 4_900_000,
    penetration: 0.020,
  },
  {
    id: "umbrella-insurance",
    name: "Umbrella Insurance",
    category: "Insurance",
    icon: Umbrella,
    positioning: "Excess-liability coverage for households with material assets or higher exposure.",
    signals: [
      { label: "Multiple property tax footprint", evidence: "Recurring property tax payments via ACH/BillPay to multiple distinct county/municipality entities indicate ownership of multiple properties.", type: "behavioral" },
      { label: "Increased auto insurance premium", evidence: "Significant increase in recurring auto insurance payments (card or ACH) following a new driver addition or vehicle purchase event.", type: "life-event" },
      { label: "High-value asset transfers", evidence: "Large outbound wire transfers or ACH payments to known luxury good merchants or investment accounts, alongside inbound proceeds from asset sales.", type: "behavioral" },
    
      { label: "Multi-property tax footprint", evidence: "Property tax ACH to 2+ counties annually", type: "behavioral" },
      { label: "Teen-driver insurance add", evidence: "Auto premium step-up with new named driver", type: "life-event" },
      { label: "Mass-affluent wealth tier", evidence: "Combined linked assets > $750k", type: "behavioral" },
    : 3_200_000,
    penetration: 0.013,
  },
  {
    id: "move-financing",
    name: "Moving & Relocation Loan",
    category: "Lending",
    icon: Truck,
    positioning: "Short-term unsecured financing for moving costs, deposits, and relocation gaps.",
    signals: [
      { label: "Moving services & deposits payments", evidence: "Clustered card spend at movers, container services, and rental agencies, plus ACH/wire for security deposits and first month's rent.", type: "life-event" },
      { label: "Out-of-state utility & rent payments", evidence: "Concurrent bill-pay enrollment and recurring payments to utility providers and landlords in a new, distant geography.", type: "life-event" },
      { label: "New local-employer payroll deposit", evidence: "New recurring ACH payroll credits from an employer geographically distant from prior employer's location.", type: "life-event" },
    
      { label: "Moving-services spend", evidence: "Van-rental, movers, or container-service charges", type: "life-event" },
      { label: "Cross-state address change", evidence: "New residential address in a different state on file", type: "life-event" },
      { label: "New lease security deposit", evidence: "Large one-time outflow to a property management company", type: "behavioral" },
    : 2_600_000,
    penetration: 0.010,
  },
];

export function getProductFlow(id: string): ProductFlow | undefined {
  return PRODUCT_FLOWS.find((p) => p.id === id);
}
