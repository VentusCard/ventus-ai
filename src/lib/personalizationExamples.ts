// Five example customers used by the Personalization tabs (/bankdemo).
// Each is keyed to an existing DEMO_CUSTOMERS entry so the phone mockup keeps
// working, and carries signals across the five families in the canonical
// priority ladder: Life Event > Financial > Spending Habit > Demographic > Risk.
// All static mock data — no LLM or backend calls.

import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";
import type { DirectorySignal } from "@/lib/customerDirectoryData";

export interface ExampleCustomer {
  id: string;
  name: string;
  city: string;
  segment: string;
  tier: string;
  lifestyleType: string;
  products: string[];
  lifeEvents: DirectorySignal[];
  financialSignals: DirectorySignal[];
  spendingHabits: DirectorySignal[];
  demographicSignals: DirectorySignal[];
  riskFlags: DirectorySignal[];
  demo: DemoCustomer;
}

const s = (
  label: string,
  evidence: string,
  confidence: DirectorySignal["confidence"],
): DirectorySignal => ({ label, evidence, confidence });

const byId = (id: string) => DEMO_CUSTOMERS.find((c) => c.id === id)!;

export const EXAMPLE_CUSTOMERS: ExampleCustomer[] = [
  {
    id: "c1",
    name: "Sarah Mitchell",
    city: "San Francisco, CA",
    segment: "Preferred",
    tier: "Preferred",
    lifestyleType: "Wellness Explorer",
    products: ["Premium Card", "Checking", "Cashback Card", "Mortgage"],
    lifeEvents: [
      s("College-bound child", "Test prep, campus visits and admissions help across two quarters", "Strong"),
      s("Home purchase underway", "Inspection, title and escrow activity clustered in recent months", "Strong"),
    ],
    financialSignals: [
      s("Mortgage in progress", "Lender and escrow payments appearing on a new schedule", "Strong"),
      s("Building a savings buffer", "Repeat transfers into savings ahead of a large planned payment", "Likely"),
      s("Education funding gap", "Tuition-style outflows without a dedicated education account", "Likely"),
    ],
    spendingHabits: [
      s("Frequent leisure traveler", "Repeat airline and resort activity, mostly island destinations", "Strong"),
      s("Racquet sports member", "Steady club dues plus seasonal gear purchases", "Likely"),
      s("Dog owner", "Recurring pet supply deliveries and grooming visits", "Strong"),
    ],
    demographicSignals: [
      s("Dual-income household", "Two recurring payroll deposits on different cycles", "Strong"),
      s("Suburban homeowner", "Utility, home services and improvement spend in one metro", "Likely"),
    ],
    riskFlags: [],
  },
  {
    id: "c2",
    name: "James Rodriguez",
    city: "Austin, TX",
    segment: "Preferred",
    tier: "Preferred",
    lifestyleType: "Tech Enthusiast",
    products: ["Everyday Card", "Checking", "High-Yield Savings"],
    lifeEvents: [
      s("First home purchase", "Earnest money, home improvement runs and a moving service booking", "Strong"),
      s("Family formation ahead", "Early-stage baby and household planning purchases", "Emerging"),
    ],
    financialSignals: [
      s("Mortgage shopping", "Multiple lender and credit-check style charges in a short window", "Likely"),
      s("Rate-seeking saver", "Balances moving toward higher-yield accounts", "Likely"),
    ],
    spendingHabits: [
      s("Tech-forward buyer", "Consistent electronics and software subscription activity", "Strong"),
      s("Dining out regular", "Weeknight restaurant and delivery pattern in the urban core", "Strong"),
      s("Gym and fitness member", "Recurring studio dues plus activewear purchases", "Likely"),
    ],
    demographicSignals: [
      s("Young professional renter", "Rent-style payment now tapering as home costs begin", "Strong"),
      s("Single income, growing", "One payroll deposit trending upward year over year", "Likely"),
    ],
    riskFlags: [
      s("Thin credit history", "Limited long-tenure credit lines relative to income", "Emerging"),
    ],
  },
  {
    id: "c3",
    name: "Emily Chen",
    city: "Chicago, IL",
    segment: "Private",
    tier: "Private",
    lifestyleType: "Family Planner",
    products: ["Private Checking", "Investment Account", "Premium Card", "Mortgage"],
    lifeEvents: [
      s("Wealth transfer planning", "Estate attorney and trust documentation activity", "Likely"),
      s("Elder care approaching", "Senior living inquiries and supplemental coverage research", "Emerging"),
    ],
    financialSignals: [
      s("Investable cash building", "Deposit balances rising faster than spending", "Strong"),
      s("Advised portfolio in place", "Recurring advisory fee pattern from an outside firm", "Likely"),
      s("Trust structure forming", "Legal and filing costs consistent with estate setup", "Likely"),
    ],
    spendingHabits: [
      s("Family-first household", "Grocery, childcare and family activity spend dominate", "Strong"),
      s("Education spender", "Tutoring, enrichment and school-related payments each term", "Strong"),
      s("Home improvement projects", "Contractor and furnishing purchases in bursts", "Likely"),
    ],
    demographicSignals: [
      s("Established family household", "Multi-person household spend across essentials", "Strong"),
      s("Urban homeowner", "Property, insurance and utility charges in one address", "Strong"),
    ],
    riskFlags: [],
  },
  {
    id: "c4",
    name: "Michael Thompson",
    city: "San Francisco, CA",
    segment: "Premium",
    tier: "Premier",
    lifestyleType: "Golf & Leisure",
    products: ["Premium Card", "Brokerage", "Private Checking", "Line of Credit"],
    lifeEvents: [
      s("Retirement in sight", "Rollover research and a step-up in travel planning", "Strong"),
      s("Estate planning started", "Attorney consultations and charitable giving research", "Likely"),
    ],
    financialSignals: [
      s("Retirement rollover likely", "Outside retirement account activity with no in-house rollover", "Strong"),
      s("Assets held elsewhere", "Recurring transfers to an outside brokerage", "Strong"),
      s("Charitable giving pattern", "Repeat donations timed to year end", "Likely"),
    ],
    spendingHabits: [
      s("Golf club member", "Club dues, pro-shop and course fees through the season", "Strong"),
      s("Fine dining and wine", "Upscale restaurant and wine merchant activity", "Strong"),
      s("Premium travel", "Business-class fares and luxury hotel stays", "Strong"),
    ],
    demographicSignals: [
      s("Pre-retiree, high income", "Income deposits stable and well above segment median", "Strong"),
      s("Multi-property indicators", "Utility and service costs at two distinct addresses", "Likely"),
    ],
    riskFlags: [],
  },
  {
    id: "c5",
    name: "Amanda Williams",
    city: "New York, NY",
    segment: "Private",
    tier: "Private",
    lifestyleType: "Urban Professional",
    products: ["Premium Card", "Private Checking", "Investment Account"],
    lifeEvents: [
      s("Relocation considered", "Out-of-market housing searches and travel to one city", "Emerging"),
      s("Career step-up", "Payroll deposit increase with a new employer identifier", "Likely"),
    ],
    financialSignals: [
      s("Cash sitting idle", "Large checking balance with no yield-bearing account", "Strong"),
      s("Equity compensation likely", "Periodic large non-payroll deposits", "Likely"),
    ],
    spendingHabits: [
      s("Fashion and retail regular", "Frequent apparel purchases at premium retailers", "Strong"),
      s("Wellness and spa routine", "Recurring studio, spa and wellness appointments", "Strong"),
      s("Dining-led lifestyle", "High share of spend at restaurants and bars", "Strong"),
      s("Rideshare commuter", "Daily rideshare instead of vehicle-related spend", "Likely"),
    ],
    demographicSignals: [
      s("High-income urban renter", "Large recurring rent payment in a top-tier metro", "Strong"),
      s("Single-person household", "Household spend sized to one person", "Likely"),
    ],
    riskFlags: [
      s("Card utilization creeping", "Revolving balance rising for consecutive cycles", "Emerging"),
    ],
  },
].map((c) => ({ ...c, demo: byId(c.id) }));

export function searchExampleCustomers(query: string): ExampleCustomer[] {
  const q = query.trim().toLowerCase();
  if (!q) return EXAMPLE_CUSTOMERS;
  return EXAMPLE_CUSTOMERS.filter((c) => {
    const hay = [
      c.name,
      c.city,
      c.segment,
      c.tier,
      c.lifestyleType,
      ...c.products,
      ...c.lifeEvents.map((x) => `${x.label} ${x.evidence}`),
      ...c.financialSignals.map((x) => `${x.label} ${x.evidence}`),
      ...c.spendingHabits.map((x) => `${x.label} ${x.evidence}`),
      ...c.demographicSignals.map((x) => `${x.label} ${x.evidence}`),
      ...c.riskFlags.map((x) => `${x.label} ${x.evidence}`),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
