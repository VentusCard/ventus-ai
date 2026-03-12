import {
  SAMPLE_CUSTOMER_1,
  SAMPLE_CUSTOMER_2,
  SAMPLE_CUSTOMER_3,
  SAMPLE_CUSTOMER_4,
  SAMPLE_CUSTOMER_5,
  SAMPLE_CUSTOMER_6,
  SAMPLE_CSV,
  SAMPLE_CSV_SPORTS_WELLNESS,
  SAMPLE_CSV_FOOD_HOME,
  SAMPLE_CSV_TRAVEL_FAMILY_12,
  SAMPLE_CSV_NYC_SPORTS_HOME_12,
  SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12,
} from "./sampleData";
import type { ClientProfileData } from "@/types/clientProfile";

export interface DemoCustomer {
  id: string;
  profile: ClientProfileData;
  csv: string;
  zip: string;
  lifestyleType: string;
  topPillars: { name: string; icon: string; pct: number; spend: string }[];
  sampleTransactions: { merchant: string; amount: string; date: string; category: string }[];
  deals: { brand: string; offer: string; tag: string; match: number }[];
  lifeEvents: { name: string; confidence: number; urgency: "Urgent" | "Soon" | "Upcoming"; timing: string; evidence: string; color: string }[];
  trips: { destination: string; dates: string; spend: string; highlights: string[] }[];
  pillarBreakdown: { pillar: string; pct: number; color: string }[];
}

export interface CustomDemographics {
  name: string;
  age: string;
  occupation: string;
  familyStatus: string;
}

export function buildCustomDemoCustomer(
  id: string,
  csv: string,
  demographics: CustomDemographics,
  zip: string
): DemoCustomer {
  return {
    id,
    profile: {
      name: demographics.name || "Custom Customer",
      segment: "Preferred",
      aum: "$100,000",
      tenure: "1 year",
      contact: { email: "custom@example.com", phone: "000-000-0000", address: `ZIP ${zip || "00000"}` },
      demographics: {
        age: demographics.age || "35",
        occupation: demographics.occupation || "Professional",
        familyStatus: demographics.familyStatus || "Single",
        incomeLevel: "$100,000",
        industry: "Other",
      },
      holdings: { deposit: "$50,000", credit: "$10,000", mortgage: "$0", investments: "$40,000" },
      compliance: { kycStatus: "Current", lastReview: "2025-01-01", nextReview: "2026-01-01", riskProfile: "Moderate" },
      milestones: [],
    },
    csv,
    zip: zip || "10001",
    lifestyleType: "Custom Profile",
    topPillars: [],
    sampleTransactions: [],
    deals: [],
    lifeEvents: [],
    trips: [],
    pillarBreakdown: [],
  };
}

export const DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: "c1",
    profile: SAMPLE_CUSTOMER_1,
    csv: SAMPLE_CSV,
    zip: "94102",
    lifestyleType: "Wellness Explorer",
    topPillars: [
      { name: "Travel", icon: "✈️", pct: 34, spend: "$4,120" },
      { name: "Dining", icon: "🍽️", pct: 22, spend: "$2,640" },
      { name: "Wellness", icon: "💪", pct: 18, spend: "$2,160" },
      { name: "Shopping", icon: "🛍️", pct: 14, spend: "$1,680" },
    ],
    sampleTransactions: [
      { merchant: "Equinox Fitness", amount: "$200", date: "Aug 15", category: "Wellness" },
      { merchant: "Whole Foods Market", amount: "$157", date: "Aug 16", category: "Grocery" },
      { merchant: "Delta Air Lines", amount: "$450", date: "Aug 12", category: "Travel" },
      { merchant: "Sephora", amount: "$157", date: "Aug 25", category: "Shopping" },
    ],
    deals: [
      { brand: "REI Co-op", offer: "10% back on outdoor gear", tag: "Outdoor", match: 96 },
      { brand: "Sweetgreen", offer: "$5 off next order", tag: "Dining", match: 92 },
      { brand: "Equinox", offer: "First month free", tag: "Wellness", match: 89 },
      { brand: "Away Luggage", offer: "20% off travel sets", tag: "Travel", match: 87 },
    ],
    lifeEvents: [
      { name: "Career Advancement", confidence: 82, urgency: "Soon", timing: "Q2 2026", evidence: "LinkedIn Premium + executive coaching + new laptop purchase", color: "#3b82f6" },
      { name: "Travel Planning", confidence: 78, urgency: "Upcoming", timing: "Q3 2026", evidence: "Passport renewal + travel insurance + flight search patterns", color: "#f59e0b" },
    ],
    trips: [
      { destination: "New York, NY", dates: "Sep 24–28", spend: "$2,145", highlights: ["Broadway", "Museum visits", "Fine dining"] },
    ],
    pillarBreakdown: [
      { pillar: "Travel", pct: 34, color: "#3b82f6" },
      { pillar: "Dining", pct: 22, color: "#f59e0b" },
      { pillar: "Wellness", pct: 18, color: "#22c55e" },
      { pillar: "Shopping", pct: 14, color: "#a855f7" },
      { pillar: "Entertainment", pct: 12, color: "#ec4899" },
    ],
  },
  {
    id: "c2",
    profile: SAMPLE_CUSTOMER_2,
    csv: SAMPLE_CSV_SPORTS_WELLNESS,
    zip: "78701",
    lifestyleType: "Tech Enthusiast",
    topPillars: [
      { name: "Technology", icon: "💻", pct: 28, spend: "$3,360" },
      { name: "Dining", icon: "🍽️", pct: 24, spend: "$2,880" },
      { name: "Fitness", icon: "🏋️", pct: 20, spend: "$2,400" },
      { name: "Entertainment", icon: "🎮", pct: 16, spend: "$1,920" },
    ],
    sampleTransactions: [
      { merchant: "Apple Store", amount: "$1,299", date: "Aug 20", category: "Technology" },
      { merchant: "Barry's Bootcamp", amount: "$150", date: "Aug 18", category: "Fitness" },
      { merchant: "Chipotle", amount: "$12", date: "Aug 22", category: "Dining" },
      { merchant: "Steam Games", amount: "$60", date: "Aug 19", category: "Entertainment" },
    ],
    deals: [
      { brand: "Best Buy", offer: "15% off MacBook accessories", tag: "Tech", match: 94 },
      { brand: "Peloton", offer: "3 months free All-Access", tag: "Fitness", match: 91 },
      { brand: "DoorDash", offer: "Free delivery for 1 month", tag: "Dining", match: 88 },
      { brand: "PlayStation", offer: "$50 off PS5 bundle", tag: "Gaming", match: 85 },
    ],
    lifeEvents: [
      { name: "Home Purchase", confidence: 87, urgency: "Urgent", timing: "Q1 2026", evidence: "Earnest money deposit + Home Depot visits + U-Haul booking", color: "#22c55e" },
      { name: "Family Formation", confidence: 76, urgency: "Upcoming", timing: "Q3 2026", evidence: "Baby registry research + engagement ring search patterns", color: "#ec4899" },
    ],
    trips: [
      { destination: "Austin, TX → Denver, CO", dates: "Oct 10–16", spend: "$1,890", highlights: ["Tech conference", "Skiing", "Craft breweries"] },
    ],
    pillarBreakdown: [
      { pillar: "Technology", pct: 28, color: "#6366f1" },
      { pillar: "Dining", pct: 24, color: "#f59e0b" },
      { pillar: "Fitness", pct: 20, color: "#22c55e" },
      { pillar: "Entertainment", pct: 16, color: "#ec4899" },
      { pillar: "Travel", pct: 12, color: "#3b82f6" },
    ],
  },
  {
    id: "c3",
    profile: SAMPLE_CUSTOMER_3,
    csv: SAMPLE_CSV_FOOD_HOME,
    zip: "60614",
    lifestyleType: "Family Planner",
    topPillars: [
      { name: "Family", icon: "👨‍👩‍👧‍👦", pct: 30, spend: "$5,400" },
      { name: "Home", icon: "🏠", pct: 25, spend: "$4,500" },
      { name: "Education", icon: "📚", pct: 20, spend: "$3,600" },
      { name: "Grocery", icon: "🛒", pct: 15, spend: "$2,700" },
    ],
    sampleTransactions: [
      { merchant: "Buy Buy Baby", amount: "$234", date: "Sep 05", category: "Family" },
      { merchant: "Home Depot", amount: "$345", date: "Sep 12", category: "Home" },
      { merchant: "College Board SAT", amount: "$68", date: "Oct 05", category: "Education" },
      { merchant: "Costco Wholesale", amount: "$199", date: "Sep 06", category: "Grocery" },
    ],
    deals: [
      { brand: "Target", offer: "20% off kids' back-to-school", tag: "Family", match: 95 },
      { brand: "Lowe's", offer: "10% off home improvement", tag: "Home", match: 90 },
      { brand: "Kumon", offer: "First month free tutoring", tag: "Education", match: 86 },
      { brand: "Instacart", offer: "Free delivery 6 months", tag: "Grocery", match: 83 },
    ],
    lifeEvents: [
      { name: "Wealth Transfer", confidence: 79, urgency: "Soon", timing: "Q2 2026", evidence: "Estate attorney consultation + trust documentation + gift tax research", color: "#a855f7" },
      { name: "Elder Care", confidence: 68, urgency: "Upcoming", timing: "Q4 2026", evidence: "AARP Medicare supplement + Sunrise Senior Living inquiry", color: "#ef4444" },
    ],
    trips: [
      { destination: "Orlando, FL", dates: "Dec 18–26", spend: "$4,200", highlights: ["Disney World", "Family resort", "Holiday travel"] },
    ],
    pillarBreakdown: [
      { pillar: "Family", pct: 30, color: "#ec4899" },
      { pillar: "Home", pct: 25, color: "#22c55e" },
      { pillar: "Education", pct: 20, color: "#3b82f6" },
      { pillar: "Grocery", pct: 15, color: "#f59e0b" },
      { pillar: "Entertainment", pct: 10, color: "#a855f7" },
    ],
  },
  {
    id: "c4",
    profile: SAMPLE_CUSTOMER_4,
    csv: SAMPLE_CSV_TRAVEL_FAMILY_12,
    zip: "94102",
    lifestyleType: "Golf & Leisure",
    topPillars: [
      { name: "Golf", icon: "⛳", pct: 32, spend: "$8,960" },
      { name: "Dining", icon: "🍽️", pct: 22, spend: "$6,160" },
      { name: "Travel", icon: "✈️", pct: 20, spend: "$5,600" },
      { name: "Wine & Spirits", icon: "🍷", pct: 14, spend: "$3,920" },
    ],
    sampleTransactions: [
      { merchant: "Pebble Beach Golf", amount: "$595", date: "Sep 14", category: "Golf" },
      { merchant: "Wine.com", amount: "$287", date: "Sep 10", category: "Wine & Spirits" },
      { merchant: "United Airlines", amount: "$680", date: "Sep 08", category: "Travel" },
      { merchant: "Morton's Steakhouse", amount: "$245", date: "Sep 15", category: "Dining" },
    ],
    deals: [
      { brand: "Callaway", offer: "20% off premium clubs", tag: "Golf", match: 97 },
      { brand: "Wine Access", offer: "$50 off first case", tag: "Wine", match: 93 },
      { brand: "Hilton Honors", offer: "80K bonus points", tag: "Travel", match: 90 },
      { brand: "OpenTable", offer: "$25 dining credit", tag: "Dining", match: 87 },
    ],
    lifeEvents: [
      { name: "Retirement Planning", confidence: 88, urgency: "Soon", timing: "Q3 2026", evidence: "Retirement calculator + Schwab rollover + travel agency visits", color: "#f59e0b" },
      { name: "Estate Planning", confidence: 75, urgency: "Upcoming", timing: "Q1 2027", evidence: "Estate attorney + trust documentation + charitable giving research", color: "#a855f7" },
    ],
    trips: [
      { destination: "Scottsdale, AZ", dates: "Jan 15–20", spend: "$3,800", highlights: ["Golf resort", "Spa retreat", "Desert dining"] },
    ],
    pillarBreakdown: [
      { pillar: "Golf", pct: 32, color: "#22c55e" },
      { pillar: "Dining", pct: 22, color: "#f59e0b" },
      { pillar: "Travel", pct: 20, color: "#3b82f6" },
      { pillar: "Wine & Spirits", pct: 14, color: "#a855f7" },
      { pillar: "Entertainment", pct: 12, color: "#ec4899" },
    ],
  },
  {
    id: "c5",
    profile: SAMPLE_CUSTOMER_5,
    csv: SAMPLE_CSV_NYC_SPORTS_HOME_12,
    zip: "10003",
    lifestyleType: "Urban Professional",
    topPillars: [
      { name: "Dining", icon: "🍽️", pct: 28, spend: "$5,040" },
      { name: "Fashion", icon: "👗", pct: 24, spend: "$4,320" },
      { name: "Wellness", icon: "💆", pct: 20, spend: "$3,600" },
      { name: "Culture", icon: "🎭", pct: 16, spend: "$2,880" },
    ],
    sampleTransactions: [
      { merchant: "Nobu Restaurant", amount: "$380", date: "Sep 11", category: "Dining" },
      { merchant: "Nordstrom", amount: "$450", date: "Sep 01", category: "Fashion" },
      { merchant: "SoulCycle NYC", amount: "$85", date: "Sep 03", category: "Wellness" },
      { merchant: "MoMA Membership", amount: "$150", date: "Sep 08", category: "Culture" },
    ],
    deals: [
      { brand: "Sweetgreen", offer: "$5 off + loyalty double", tag: "Dining", match: 95 },
      { brand: "Net-a-Porter", offer: "15% off new arrivals", tag: "Fashion", match: 92 },
      { brand: "Exhale Spa", offer: "30% off first visit", tag: "Wellness", match: 88 },
      { brand: "Lincoln Center", offer: "Season pass discount", tag: "Culture", match: 84 },
    ],
    lifeEvents: [
      { name: "Education Funding", confidence: 75, urgency: "Upcoming", timing: "Q4 2026", evidence: "529 plan research + school tours + tuition comparison sites", color: "#3b82f6" },
      { name: "Career Change", confidence: 71, urgency: "Upcoming", timing: "Q1 2027", evidence: "Executive recruiter meetings + MBA program research", color: "#6366f1" },
    ],
    trips: [
      { destination: "Paris, France", dates: "Nov 5–12", spend: "$6,500", highlights: ["Fashion week events", "Michelin dining", "Art galleries"] },
    ],
    pillarBreakdown: [
      { pillar: "Dining", pct: 28, color: "#f59e0b" },
      { pillar: "Fashion", pct: 24, color: "#ec4899" },
      { pillar: "Wellness", pct: 20, color: "#22c55e" },
      { pillar: "Culture", pct: 16, color: "#a855f7" },
      { pillar: "Travel", pct: 12, color: "#3b82f6" },
    ],
  },
  {
    id: "c6",
    profile: SAMPLE_CUSTOMER_6,
    csv: SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12,
    zip: "60610",
    lifestyleType: "Adventurer & Investor",
    topPillars: [
      { name: "Travel", icon: "✈️", pct: 30, spend: "$9,600" },
      { name: "Investments", icon: "📈", pct: 25, spend: "$8,000" },
      { name: "Dining", icon: "🍽️", pct: 18, spend: "$5,760" },
      { name: "Golf", icon: "⛳", pct: 15, spend: "$4,800" },
    ],
    sampleTransactions: [
      { merchant: "Emirates Airlines", amount: "$4,200", date: "Oct 01", category: "Travel" },
      { merchant: "Vanguard", amount: "$12,000", date: "Oct 05", category: "Investments" },
      { merchant: "Nobu Malibu", amount: "$520", date: "Oct 10", category: "Dining" },
      { merchant: "Bandon Dunes Golf", amount: "$890", date: "Oct 14", category: "Golf" },
    ],
    deals: [
      { brand: "Delta SkyMiles", offer: "100K bonus miles", tag: "Travel", match: 96 },
      { brand: "Charles Schwab", offer: "Advisor consultation free", tag: "Invest", match: 93 },
      { brand: "OpenTable", offer: "$50 fine dining credit", tag: "Dining", match: 89 },
      { brand: "TaylorMade", offer: "Custom fitting + 25% off", tag: "Golf", match: 86 },
    ],
    lifeEvents: [
      { name: "Retirement Planning", confidence: 91, urgency: "Urgent", timing: "Q1 2026", evidence: "401k max contribution + AARP enrollment + pension inquiry", color: "#f59e0b" },
      { name: "Wealth Transfer", confidence: 82, urgency: "Soon", timing: "Q2 2026", evidence: "Dynasty trust research + charitable foundation inquiry + gift planning", color: "#a855f7" },
    ],
    trips: [
      { destination: "Tokyo, Japan", dates: "Mar 10–22", spend: "$8,900", highlights: ["Golf resorts", "Cultural tours", "Fine dining"] },
    ],
    pillarBreakdown: [
      { pillar: "Travel", pct: 30, color: "#3b82f6" },
      { pillar: "Investments", pct: 25, color: "#22c55e" },
      { pillar: "Dining", pct: 18, color: "#f59e0b" },
      { pillar: "Golf", pct: 15, color: "#6366f1" },
      { pillar: "Other", pct: 12, color: "#94a3b8" },
    ],
  },
];
