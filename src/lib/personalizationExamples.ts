// Five example customers used by the Personalization tabs (/bankdemo).
// Each is keyed to an existing DEMO_CUSTOMERS entry so the phone mockup keeps
// working. Every customer carries the same signal shape, ordered the way the
// Systems tab presents the families:
//   Behavioral (2-3) > Life Event (1 internal + 1 external) > Financial (1)
//   > Demographic (1) > Risk (1)
// All static mock data — no LLM or backend calls.

import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";
import type { DirectorySignal } from "@/lib/customerDirectoryData";
import type { ClientProfileData } from "@/types/clientProfile";

export interface ExampleCustomer {
  id: string;
  customerId: string;
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

/** Internal (first-party transaction) signal. */
const s = (
  label: string,
  evidence: string,
  confidence: DirectorySignal["confidence"],
): DirectorySignal => ({ label, evidence, confidence, source: "internal" });

/** External intelligence signal (bureau tradeline, outside data). */
const ext = (
  label: string,
  evidence: string,
  confidence: DirectorySignal["confidence"],
): DirectorySignal => ({ label, evidence, confidence, source: "external" });

const byId = (id: string) => DEMO_CUSTOMERS.find((c) => c.id === id)!;

export const EXAMPLE_CUSTOMERS: ExampleCustomer[] = [
  {
    id: "c1",
    customerId: "4829103",
    name: "Ricky J",
    city: "San Francisco, CA",
    segment: "Preferred",
    tier: "Preferred",
    lifestyleType: "Wellness Explorer",
    products: ["Premium Card", "Checking", "Cashback Card", "Mortgage"],
    spendingHabits: [
      s("Biweekly advanced tennis", "Private coaching, league fees and premium club charges on a two-week cadence", "Strong"),
      s("Recurring dog expenditures", "Repeat dog food, vet, grooming and walker charges", "Strong"),
      ext("Annual tropical vacation in December", "Outside travel booking history each December", "Likely"),
    ],
    lifeEvents: [
      s("Buying a house above $1.5M", "Pre-mover to high-value homeowner: earnest deposit, inspection, moving and setup spend above $1.5M", "Strong"),
    ],
    financialSignals: [
      s("Recurring transfers to an outside brokerage", "Steady outbound transfers to a non-bank investment account", "Strong"),
      ext("Car loan expiring in ~4 months", "Outside lender tradeline nearing the end of its term", "Likely"),
    ],
    demographicSignals: [
      s("Small business owner", "Merchant-services deposits and business-expense pattern", "Strong"),
    ],
    riskFlags: [
      s("Gambling: online sports betting", "Recurring online sportsbook deposits and wagering activity", "Emerging"),
    ],
  },
  {
    id: "c2",
    customerId: "7392041",
    name: "James Rodriguez",
    city: "Austin, TX",
    segment: "Preferred",
    tier: "Preferred",
    lifestyleType: "Tech Enthusiast",
    products: ["Everyday Card", "Checking", "High-Yield Savings"],
    spendingHabits: [
      s("Tech-forward buyer", "Consistent electronics and software subscription activity", "Strong"),
      s("Dining out regular", "Weeknight restaurant and delivery pattern in the urban core", "Strong"),
      s("Gym member", "Recurring gym dues plus workout gear purchases", "Likely"),
    ],
    lifeEvents: [
      s("First home purchase underway", "Deposit, home improvement runs and a moving service booking", "Strong"),
      ext("Mortgage shopping elsewhere", "Several outside lender credit checks in a short window", "Likely"),
    ],
    financialSignals: [
      s("Chasing a better rate", "Balances moving toward higher-yield savings accounts", "Likely"),
    ],
    demographicSignals: [
      s("Young professional renter", "Rent-style payment now tapering as home costs begin", "Strong"),
    ],
    riskFlags: [
      s("Short credit history", "Few long-standing credit lines relative to income", "Emerging"),
    ],
  },
  {
    id: "c3",
    customerId: "6158392",
    name: "Emily Chen",
    city: "Chicago, IL",
    segment: "Private",
    tier: "Private",
    lifestyleType: "Family Planner",
    products: ["Private Checking", "Investment Account", "Premium Card", "Mortgage"],
    spendingHabits: [
      s("Family-first household", "Grocery, childcare and family activity spend dominate", "Strong"),
      s("Education spender", "Tutoring, enrichment and school payments each term", "Strong"),
      s("Home improvement projects", "Contractor and furnishing purchases in bursts", "Likely"),
    ],
    lifeEvents: [
      s("Estate planning started", "Attorney and trust documentation payments over recent months", "Likely"),
      ext("Elder care approaching", "Outside senior living and supplemental coverage inquiries", "Emerging"),
    ],
    financialSignals: [
      s("Investments held elsewhere", "Recurring transfers out to an outside investment firm", "Strong"),
    ],
    demographicSignals: [
      s("Established family household", "Multi-person household spend across everyday essentials", "Strong"),
    ],
    riskFlags: [
      s("Large cash left uninvested", "Sizeable checking balance idle for several months", "Likely"),
    ],
  },
  {
    id: "c4",
    customerId: "9084726",
    name: "Michael Thompson",
    city: "San Francisco, CA",
    segment: "Premium",
    tier: "Premier",
    lifestyleType: "Golf & Leisure",
    products: ["Premium Card", "Brokerage", "Private Checking", "Line of Credit"],
    spendingHabits: [
      s("Golf club member", "Club dues, pro-shop and course fees through the season", "Strong"),
      s("Fine dining and wine", "Upscale restaurant and wine merchant activity", "Strong"),
      s("Premium travel", "Business-class fares and luxury hotel stays", "Strong"),
    ],
    lifeEvents: [
      s("Retirement in sight", "Rollover research and a clear step-up in travel planning", "Strong"),
      ext("Second property in play", "Outside property records show a new title search", "Likely"),
    ],
    financialSignals: [
      s("Retirement money held away", "Outside retirement account activity with no rollover here", "Strong"),
    ],
    demographicSignals: [
      s("Pre-retiree, high income", "Income deposits stable and well above segment median", "Strong"),
    ],
    riskFlags: [
      s("Credit line drawn on", "Line of credit used to smooth large seasonal purchases", "Emerging"),
    ],
  },
  {
    id: "c5",
    customerId: "3546178",
    name: "Amanda Williams",
    city: "New York, NY",
    segment: "Private",
    tier: "Private",
    lifestyleType: "Urban Professional",
    products: ["Premium Card", "Private Checking", "Investment Account"],
    spendingHabits: [
      s("Fashion and retail regular", "Frequent apparel purchases at premium retailers", "Strong"),
      s("Wellness and spa routine", "Recurring studio, spa and wellness appointments", "Strong"),
      s("Rideshare commuter", "Daily rideshare instead of any vehicle-related spend", "Likely"),
    ],
    lifeEvents: [
      s("Career step-up", "Paycheck increase arriving under a new employer name", "Likely"),
      ext("Relocation considered", "Outside housing searches concentrated in one new city", "Emerging"),
    ],
    financialSignals: [
      s("Cash sitting idle", "Large checking balance with no yield-bearing account", "Strong"),
    ],
    demographicSignals: [
      s("High-income urban renter", "Large recurring rent payment in a top-tier metro", "Strong"),
    ],
    riskFlags: [
      s("Card utilization creeping", "Revolving balance rising for consecutive cycles", "Emerging"),
    ],
  },
].map((c) => {
  const base = byId(c.id);
  return {
    ...c,
    demo: {
      ...base,
      profile: {
        ...base.profile,
        name: c.name,
        segment: c.segment as ClientProfileData["segment"],
      },
    },
  };
});

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
