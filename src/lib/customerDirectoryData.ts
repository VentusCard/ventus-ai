// Mock customer directory for the banker-facing "Customers" tab in /bankdemo.
// Each customer carries signals across the five families used across the demo,
// in the canonical priority ladder: Life Event > Financial > Spending Habit >
// Demographic > Risk. Assignment is mutually exclusive (e.g. pet spending only
// ever lives in Spending Habits, auto/mortgage/investment only in Financial).

export type SignalFamily =
  | "life_event"
  | "financial"
  | "spending_habit"
  | "demographic"
  | "risk";

export type ConfidenceBand = "Emerging" | "Likely" | "Strong";

export interface DirectorySignal {
  /** Short pill label — 2-5 words, no brand names, no arrows. */
  label: string;
  /** Vaguely-specific evidence line. Never exact totals or transaction counts. */
  evidence: string;
  confidence: ConfidenceBand;
  /**
   * Where the signal came from. "external" = bureau / outside intelligence and
   * renders an "Ext" tag on the pill. Defaults to internal (first-party) data.
   */
  source?: "internal" | "external";
}

export interface DirectoryCustomer {
  id: string;
  name: string;
  email: string;
  city: string;
  ageBand: string;
  segment: string;
  tier: "Mass" | "Preferred" | "Premier" | "Private";
  tenure: string;
  relationshipValue: string;
  products: string[];
  lastActivity: string;
  lifeEvents: DirectorySignal[];
  financialSignals: DirectorySignal[];
  spendingHabits: DirectorySignal[];
  demographicSignals: DirectorySignal[];
  riskFlags: DirectorySignal[];
  nextActions: string[];
  /** True for illustrative profiles synthesized to represent a large cohort. */
  synthetic?: boolean;
}

export const SIGNAL_FAMILY_META: {
  key: SignalFamily;
  label: string;
  short: string;
  field: keyof Pick<
    DirectoryCustomer,
    "lifeEvents" | "financialSignals" | "spendingHabits" | "demographicSignals" | "riskFlags"
  >;
  /** Light-theme pill styling. Red is reserved for risk only. */
  chip: string;
  dot: string;
  /** Soft card/panel tint classes for the Intelligence Dashboard. */
  tint: string;
  /** Full saturated background for prominent cards (e.g. Systems tab Core). */
  fullBg: string;
  /** Light text classes for use on fullBg backgrounds. */
  fullText: string;
  /** Subtle white/translucent accent for use on fullBg backgrounds. */
  fullAccent: string;
  cardBorder: string;
  cardBorderHover: string;
  cardRing: string;
  sparkline: string;
  barStrong: string;
  barLikely: string;
  barEmerging: string;
  rowHover: string;
  rowHoverBorder: string;
  openText: string;
}[] = [
  // Order matches the Systems tab: Behavioral → Life Event → Financial → Demographic → Risk.
  {
    key: "spending_habit",
    label: "Behavioral",
    short: "BEH",
    field: "spendingHabits",
    chip: "bg-blue-100 text-blue-800 border-blue-300",
    dot: "bg-blue-600",
    tint: "bg-blue-100/80",
    fullBg: "bg-blue-600",
    fullText: "text-white",
    fullAccent: "bg-white/20 border-white/30",
    cardBorder: "border-blue-500",
    cardBorderHover: "group-hover:border-blue-600",
    cardRing: "ring-blue-400/40",
    sparkline: "#2563eb",
    barStrong: "bg-blue-600",
    barLikely: "bg-blue-500",
    barEmerging: "bg-blue-300",
    rowHover: "hover:bg-blue-100/60",
    rowHoverBorder: "hover:border-blue-400",
    openText: "group-hover:text-blue-800",
  },
  {
    key: "life_event",
    label: "Life Events",
    short: "LE",
    field: "lifeEvents",
    chip: "bg-amber-100 text-amber-800 border-amber-300",
    dot: "bg-amber-600",
    tint: "bg-amber-100/80",
    fullBg: "bg-amber-500",
    fullText: "text-white",
    fullAccent: "bg-white/20 border-white/30",
    cardBorder: "border-amber-500",
    cardBorderHover: "group-hover:border-amber-600",
    cardRing: "ring-amber-400/40",
    sparkline: "#f59e0b",
    barStrong: "bg-amber-600",
    barLikely: "bg-amber-500",
    barEmerging: "bg-amber-300",
    rowHover: "hover:bg-amber-100/60",
    rowHoverBorder: "hover:border-amber-400",
    openText: "group-hover:text-amber-800",
  },
  {
    key: "financial",
    label: "Financial Signals",
    short: "FIN",
    field: "financialSignals",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dot: "bg-emerald-600",
    tint: "bg-emerald-100/80",
    fullBg: "bg-emerald-600",
    fullText: "text-white",
    fullAccent: "bg-white/20 border-white/30",
    cardBorder: "border-emerald-500",
    cardBorderHover: "group-hover:border-emerald-600",
    cardRing: "ring-emerald-400/40",
    sparkline: "#10b981",
    barStrong: "bg-emerald-600",
    barLikely: "bg-emerald-500",
    barEmerging: "bg-emerald-300",
    rowHover: "hover:bg-emerald-100/60",
    rowHoverBorder: "hover:border-emerald-400",
    openText: "group-hover:text-emerald-800",
  },
  {
    key: "demographic",
    label: "Demographic",
    short: "DEM",
    field: "demographicSignals",
    chip: "bg-violet-100 text-violet-800 border-violet-300",
    dot: "bg-violet-600",
    tint: "bg-violet-100/80",
    fullBg: "bg-violet-600",
    fullText: "text-white",
    fullAccent: "bg-white/20 border-white/30",
    cardBorder: "border-violet-500",
    cardBorderHover: "group-hover:border-violet-600",
    cardRing: "ring-violet-400/40",
    sparkline: "#8b5cf6",
    barStrong: "bg-violet-600",
    barLikely: "bg-violet-500",
    barEmerging: "bg-violet-300",
    rowHover: "hover:bg-violet-100/60",
    rowHoverBorder: "hover:border-violet-400",
    openText: "group-hover:text-violet-800",
  },
  {
    key: "risk",
    label: "Risk",
    short: "RSK",
    field: "riskFlags",
    chip: "bg-rose-100 text-rose-800 border-rose-300",
    dot: "bg-rose-600",
    tint: "bg-rose-100/80",
    cardBorder: "border-rose-500",
    cardBorderHover: "group-hover:border-rose-600",
    cardRing: "ring-rose-400/40",
    sparkline: "#f43f5e",
    barStrong: "bg-rose-600",
    barLikely: "bg-rose-500",
    barEmerging: "bg-rose-300",
    rowHover: "hover:bg-rose-100/60",
    rowHoverBorder: "hover:border-rose-400",
    openText: "group-hover:text-rose-800",
  },
];

const s = (label: string, evidence: string, confidence: ConfidenceBand): DirectorySignal => ({
  label,
  evidence,
  confidence,
});

export const CUSTOMER_DIRECTORY: DirectoryCustomer[] = [
  {
    id: "c-1001",
    name: "Morgan Ellis",
    email: "morgan.ellis@example.com",
    city: "Austin, TX",
    ageBand: "34-40",
    segment: "New parent household",
    tier: "Preferred",
    tenure: "6 yrs",
    relationshipValue: "$60k-$90k",
    products: ["Checking", "Rewards Card", "Auto Loan"],
    lastActivity: "2 days ago",
    lifeEvents: [
      s("New Baby At Home", "Pediatric and nursery-category activity appearing steadily over the last quarter", "Strong"),
      s("Household Move Planning", "Repeat home-setup and storage spend clustered in recent weeks", "Emerging"),
    ],
    financialSignals: [
      s("Auto Loan Servicing", "Consistent monthly servicer payment in the mid-hundreds band", "Strong"),
      s("Retirement Contributions", "Recurring payroll-linked contribution each cycle", "Likely"),
    ],
    spendingHabits: [
      s("Weeknight Delivery Habit", "Evening food-delivery pattern several times a week", "Strong"),
      s("Warehouse Bulk Shopper", "Regular large-basket general merchandise runs", "Likely"),
    ],
    demographicSignals: [s("Dual-Income Household", "Two distinct payroll rails on a matching cadence", "Strong")],
    riskFlags: [],
    nextActions: [
      "Position a family-tier rewards upgrade on the primary card",
      "Pre-approve an auto refinance ahead of the renewal window",
      "Introduce an education savings starter conversation",
    ],
  },
  {
    id: "c-1002",
    name: "Priya Raman",
    email: "priya.raman@example.com",
    city: "Jersey City, NJ",
    ageBand: "45-52",
    segment: "College-prep household",
    tier: "Premier",
    tenure: "11 yrs",
    relationshipValue: "$180k-$240k",
    products: ["Checking", "Savings", "Mortgage", "Brokerage"],
    lastActivity: "Today",
    lifeEvents: [s("College Prep Underway", "Test-prep and campus-visit travel activity across recent months", "Strong")],
    financialSignals: [
      s("Mortgage Servicing", "Steady monthly servicer payment in the low-thousands band", "Strong"),
      s("Education Savings Funding", "Quarterly transfers into a dedicated education vehicle", "Likely"),
      s("Brokerage Contributions", "Regular self-directed contributions each month", "Strong"),
    ],
    spendingHabits: [s("Premium Grocery Preference", "Consistent upmarket grocery basket week over week", "Strong")],
    demographicSignals: [s("Multi-Generation Household", "Recurring senior-care and youth-activity spend in the same period", "Likely")],
    riskFlags: [],
    nextActions: [
      "Review education funding gap with a planning specialist",
      "Offer a rate-and-term mortgage review",
      "Invite to the advisory tier onboarding",
    ],
  },
  {
    id: "c-1003",
    name: "Daniel Okafor",
    email: "daniel.okafor@example.com",
    city: "Charlotte, NC",
    ageBand: "28-34",
    segment: "Relocating professional",
    tier: "Preferred",
    tenure: "3 yrs",
    relationshipValue: "$35k-$55k",
    products: ["Checking", "Cash-Back Card"],
    lastActivity: "Yesterday",
    lifeEvents: [
      s("Relocation In Motion", "Moving services, deposit-style payments and utility setup in a tight window", "Strong"),
      s("Job Change Signal", "Payroll rail switched to a new originator recently", "Likely"),
    ],
    financialSignals: [s("Personal Loan Payoff", "Declining balance payments to a single lender each month", "Likely")],
    spendingHabits: [s("Fitness Studio Regular", "Recurring boutique fitness memberships", "Strong")],
    demographicSignals: [s("First-Time Renter Upgrade", "Step-up in monthly housing outflow versus prior year", "Emerging")],
    riskFlags: [],
    nextActions: [
      "Offer relocation-timed deposit incentives",
      "Position a first-time homebuyer pre-qualification",
      "Enroll in the moving-week perks collection",
    ],
  },
  {
    id: "c-1004",
    name: "Sofia Bianchi",
    email: "sofia.bianchi@example.com",
    city: "Chicago, IL",
    ageBand: "38-45",
    segment: "Small-business owner",
    tier: "Premier",
    tenure: "8 yrs",
    relationshipValue: "$220k-$310k",
    products: ["Business Checking", "Personal Checking", "Line of Credit"],
    lastActivity: "3 days ago",
    lifeEvents: [s("Business Expansion Signal", "New vendor and equipment counterparties appearing consistently", "Likely")],
    financialSignals: [
      s("Revolving Credit Usage", "Regular draws and paydowns on a working-capital line", "Strong"),
      s("Insurance Premium Cycle", "Quarterly commercial-style premium payments", "Likely"),
    ],
    spendingHabits: [s("Supplier Bulk Purchasing", "Frequent wholesale purchases clustered mid-month", "Strong")],
    demographicSignals: [s("Business Owner Household", "Blended personal and merchant-services activity on one profile", "Strong")],
    riskFlags: [s("Cash Flow Volatility", "Inflow timing varies materially month to month", "Emerging")],
    nextActions: [
      "Review working-capital line sizing",
      "Offer merchant treasury and payables tooling",
      "Schedule an owner-succession planning touch",
    ],
  },
  {
    id: "c-1005",
    name: "Walter Grimes",
    email: "walter.grimes@example.com",
    city: "Scottsdale, AZ",
    ageBand: "58-64",
    segment: "Pre-retiree",
    tier: "Private",
    tenure: "19 yrs",
    relationshipValue: "$1.2M-$1.8M",
    products: ["Checking", "Brokerage", "Managed Portfolio", "HELOC"],
    lastActivity: "1 week ago",
    lifeEvents: [s("Retirement Transition Nearing", "Advisory and benefits-related counterparties appearing recently", "Likely")],
    financialSignals: [
      s("HELOC Servicing", "Interest-only style payments each month", "Strong"),
      s("Portfolio Contributions", "Sizeable periodic transfers to managed accounts", "Strong"),
      s("Long-Term Care Premiums", "Annual premium payment to a protection provider", "Likely"),
    ],
    spendingHabits: [s("Golf And Club Life", "Recurring club dues and pro-shop activity", "Strong")],
    demographicSignals: [s("Empty Nest Household", "Youth-linked categories tapered off over the past year", "Strong")],
    riskFlags: [],
    nextActions: [
      "Run a decumulation and income-sequencing review",
      "Discuss HELOC paydown versus portfolio drawdown",
      "Introduce estate and trust services",
    ],
  },
  {
    id: "c-1006",
    name: "Amara Johnson",
    email: "amara.johnson@example.com",
    city: "Atlanta, GA",
    ageBand: "30-36",
    segment: "Frequent traveler",
    tier: "Preferred",
    tenure: "5 yrs",
    relationshipValue: "$45k-$70k",
    products: ["Checking", "Travel Card"],
    lastActivity: "Today",
    lifeEvents: [s("Milestone Trip Planning", "Multi-leg fare and lodging holds booked well ahead of travel", "Likely")],
    financialSignals: [s("Card Balance Payoff Discipline", "Full statement payoff each cycle", "Strong")],
    spendingHabits: [
      s("Long-Haul Travel Pattern", "International fares recurring several times a year", "Strong"),
      s("Rideshare Commuter", "Daily point-to-point rides on weekdays", "Strong"),
      s("Coffee Ritual", "Same-hour morning cafe visits most weekdays", "Likely"),
    ],
    demographicSignals: [s("Urban Single Household", "Single payroll rail with city-dense merchant footprint", "Strong")],
    riskFlags: [],
    nextActions: [
      "Upgrade to the premium travel card with lounge access",
      "Activate destination-city perks before the next trip",
      "Offer foreign-transaction fee waiver messaging",
    ],
  },
  {
    id: "c-1007",
    name: "Tyler Nguyen",
    email: "tyler.nguyen@example.com",
    city: "Seattle, WA",
    ageBand: "26-32",
    segment: "New pet owner",
    tier: "Mass",
    tenure: "2 yrs",
    relationshipValue: "$12k-$20k",
    products: ["Checking", "Cash-Back Card"],
    lastActivity: "4 days ago",
    lifeEvents: [],
    financialSignals: [s("Student Loan Servicing", "Steady monthly servicer payment in the low-hundreds band", "Strong")],
    spendingHabits: [
      s("Pet Care Routine", "Veterinary, grooming and pet-supply spend recurring monthly", "Strong"),
      s("Outdoor Gear Interest", "Seasonal outdoor and trail retailer activity", "Likely"),
    ],
    demographicSignals: [s("Early-Career Renter", "Housing outflow steady with a single payroll rail", "Strong")],
    riskFlags: [],
    nextActions: [
      "Surface pet-category cash-back accelerators",
      "Offer a student loan refinance conversation",
      "Enroll in round-up savings",
    ],
  },
  {
    id: "c-1008",
    name: "Rachel Duval",
    email: "rachel.duval@example.com",
    city: "Denver, CO",
    ageBand: "31-37",
    segment: "First-time homebuyer",
    tier: "Preferred",
    tenure: "4 yrs",
    relationshipValue: "$55k-$85k",
    products: ["Checking", "High-Yield Savings", "Rewards Card"],
    lastActivity: "Today",
    lifeEvents: [s("Home Purchase Underway", "Inspection, appraisal and escrow-style payments in a compressed window", "Strong")],
    financialSignals: [
      s("Down Payment Accumulation", "Sustained transfers into a savings vehicle over several quarters", "Strong"),
      s("Auto Lease Servicing", "Fixed monthly lease payment with consistent timing", "Likely"),
    ],
    spendingHabits: [s("Home Improvement Focus", "Repeat hardware and furnishing purchases", "Strong")],
    demographicSignals: [s("Newly Formed Household", "Two contributors funding a single shared account", "Likely")],
    riskFlags: [],
    nextActions: [
      "Lock a mortgage rate ahead of closing",
      "Bundle homeowners protection at closing",
      "Offer a home-setup deals collection",
    ],
  },
  {
    id: "c-1009",
    name: "Victor Almeida",
    email: "victor.almeida@example.com",
    city: "Miami, FL",
    ageBand: "48-55",
    segment: "High-net-worth investor",
    tier: "Private",
    tenure: "14 yrs",
    relationshipValue: "$2.4M-$3.1M",
    products: ["Checking", "Managed Portfolio", "Jumbo Mortgage", "Private Card"],
    lastActivity: "2 days ago",
    lifeEvents: [s("Second Property Interest", "Coastal listing services and inspection-style payments recently", "Emerging")],
    financialSignals: [
      s("Jumbo Mortgage Servicing", "Large fixed monthly servicer payment", "Strong"),
      s("Alternative Investment Funding", "Irregular large transfers to investment counterparties", "Likely"),
    ],
    spendingHabits: [
      s("Fine Dining Regular", "Upmarket restaurant activity several times a month", "Strong"),
      s("Marine And Boating", "Seasonal marina and vessel-services spend", "Likely"),
    ],
    demographicSignals: [s("Multi-Property Household", "Duplicate utility and insurance rails across two locations", "Strong")],
    riskFlags: [],
    nextActions: [
      "Present a second-home financing structure",
      "Review concentration in the managed portfolio",
      "Offer private banking concierge perks",
    ],
  },
  {
    id: "c-1010",
    name: "Keisha Barnes",
    email: "keisha.barnes@example.com",
    city: "Houston, TX",
    ageBand: "27-33",
    segment: "Gig-income earner",
    tier: "Mass",
    tenure: "3 yrs",
    relationshipValue: "$8k-$16k",
    products: ["Checking", "Secured Card"],
    lastActivity: "Yesterday",
    lifeEvents: [],
    financialSignals: [s("Buy-Now-Pay-Later Obligations", "Multiple short-cycle installment payments running concurrently", "Strong")],
    spendingHabits: [
      s("Fuel And Vehicle Upkeep", "High-frequency fuel and maintenance spend tied to work hours", "Strong"),
      s("Convenience Retail Habit", "Frequent small-basket purchases through the day", "Likely"),
    ],
    demographicSignals: [s("Variable-Income Household", "Deposits arrive from several platforms on irregular timing", "Strong")],
    riskFlags: [
      s("Thin Liquidity Buffer", "Balance trends near zero before each deposit cycle", "Likely"),
      s("Frequent Overdraft Pattern", "Repeat negative-balance events in recent months", "Emerging"),
    ],
    nextActions: [
      "Offer earned-income smoothing and early deposit",
      "Position a credit-builder upgrade path",
      "Enable low-balance coaching alerts",
    ],
  },
  {
    id: "c-1011",
    name: "Owen Park",
    email: "owen.park@example.com",
    city: "Boston, MA",
    ageBand: "22-26",
    segment: "Recent graduate",
    tier: "Mass",
    tenure: "1 yr",
    relationshipValue: "$5k-$12k",
    products: ["Checking", "Starter Card"],
    lastActivity: "Today",
    lifeEvents: [s("First Job Started", "New payroll rail established with steady cadence", "Strong")],
    financialSignals: [s("Student Loan Grace Ending", "Servicer onboarding activity followed by first payments", "Strong")],
    spendingHabits: [
      s("Streaming Stack Loyalty", "Several recurring entertainment subscriptions", "Strong"),
      s("Late-Night Delivery", "Evening food orders concentrated on weekends", "Likely"),
    ],
    demographicSignals: [s("Shared Housing Arrangement", "Split rent-style transfers with peers each month", "Likely")],
    riskFlags: [],
    nextActions: [
      "Introduce automated savings on payday",
      "Offer a first credit line with graduation path",
      "Recommend a subscription-audit nudge",
    ],
  },
  {
    id: "c-1012",
    name: "Linda Whitfield",
    email: "linda.whitfield@example.com",
    city: "Portland, OR",
    ageBand: "55-62",
    segment: "Empty nester",
    tier: "Premier",
    tenure: "17 yrs",
    relationshipValue: "$310k-$420k",
    products: ["Checking", "CDs", "Brokerage", "Rewards Card"],
    lastActivity: "5 days ago",
    lifeEvents: [s("Downsizing Consideration", "Listing services and appraisal-style payments appearing recently", "Emerging")],
    financialSignals: [
      s("Mortgage Nearing Payoff", "Servicer payments continuing with shrinking obligation profile", "Likely"),
      s("Term Deposit Laddering", "Successive fixed-term placements at maturity", "Strong"),
    ],
    spendingHabits: [s("Garden And Home Projects", "Sustained nursery and home-project spend across seasons", "Strong")],
    demographicSignals: [s("Two-Person Household", "Household spend footprint contracted versus prior years", "Strong")],
    riskFlags: [],
    nextActions: [
      "Model downsizing proceeds into income planning",
      "Offer a maturity-timed rate conversation",
      "Introduce legacy planning services",
    ],
  },
  {
    id: "c-1013",
    name: "Marcus Feld",
    email: "marcus.feld@example.com",
    city: "Nashville, TN",
    ageBand: "40-47",
    segment: "Multi-property owner",
    tier: "Premier",
    tenure: "9 yrs",
    relationshipValue: "$420k-$610k",
    products: ["Checking", "Investment Property Loan", "HELOC", "Rewards Card"],
    lastActivity: "Yesterday",
    lifeEvents: [s("Property Portfolio Growth", "New title and inspection counterparties in the recent window", "Likely")],
    financialSignals: [
      s("Investment Property Servicing", "Two distinct servicer payments each month", "Strong"),
      s("Property Insurance Cycle", "Semi-annual premium payments across locations", "Strong"),
    ],
    spendingHabits: [s("Contractor And Trade Spend", "Recurring trade-services purchases through the year", "Strong")],
    demographicSignals: [s("Rental Income Household", "Regular inbound tenant-style deposits", "Strong")],
    riskFlags: [s("Leverage Concentration", "Multiple secured obligations against related collateral", "Emerging")],
    nextActions: [
      "Consolidate property debt under one facility",
      "Review insurance coverage adequacy",
      "Offer a landlord treasury package",
    ],
  },
  {
    id: "c-1014",
    name: "Hannah Iverson",
    email: "hannah.iverson@example.com",
    city: "Minneapolis, MN",
    ageBand: "33-39",
    segment: "Subscription-heavy household",
    tier: "Preferred",
    tenure: "7 yrs",
    relationshipValue: "$40k-$65k",
    products: ["Checking", "Savings", "Rewards Card"],
    lastActivity: "3 days ago",
    lifeEvents: [s("Wedding Planning Signals", "Venue and photography-style deposits within a short window", "Likely")],
    financialSignals: [s("Personal Loan Origination", "New fixed installment obligation started this quarter", "Likely")],
    spendingHabits: [
      s("Subscription Stacking", "A dozen-plus recurring digital services renewing monthly", "Strong"),
      s("Wellness Membership Habit", "Recurring studio and wellness memberships", "Likely"),
    ],
    demographicSignals: [s("Pre-Marriage Household", "Two rails converging on shared vendors", "Likely")],
    riskFlags: [s("Recurring Charge Creep", "Subscription outflow growing quarter over quarter", "Emerging")],
    nextActions: [
      "Offer a wedding-timed savings and card bundle",
      "Surface subscription control tooling",
      "Position joint account onboarding",
    ],
  },
  {
    id: "c-1015",
    name: "Andre Costa",
    email: "andre.costa@example.com",
    city: "Newark, NJ",
    ageBand: "36-42",
    segment: "Credit rebuilding",
    tier: "Mass",
    tenure: "5 yrs",
    relationshipValue: "$10k-$18k",
    products: ["Checking", "Secured Card"],
    lastActivity: "Today",
    lifeEvents: [s("Household Separation", "Housing and utility rails split into two locations recently", "Likely")],
    financialSignals: [
      s("Credit Card Paydown Plan", "Steady above-minimum payments to a single issuer", "Strong"),
      s("Auto Loan Servicing", "Monthly servicer payment maintained on time", "Strong"),
    ],
    spendingHabits: [s("Neighborhood Grocery Loyalty", "Consistent weekly basket at nearby grocers", "Strong")],
    demographicSignals: [s("Single-Parent Household", "Childcare and school-linked spend with one payroll rail", "Likely")],
    riskFlags: [
      s("Fee Sensitivity", "Repeat small service fees over recent cycles", "Likely"),
      s("Outbound Funds Leakage", "Recurring transfers to an external provider", "Emerging"),
    ],
    nextActions: [
      "Offer a fee-waived everyday account",
      "Graduate the secured card with a credit-limit path",
      "Win back outbound balances with a savings incentive",
    ],
  },
];
