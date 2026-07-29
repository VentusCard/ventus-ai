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
  txnCount: number;
  txnTotal: string;
  sourceCount: number;
  dateRange: string;
  topPillars: { name: string; icon: string; pct: number; spend: string }[];
  sampleTransactions: { merchant: string; amount: string; date: string; category: string; zip_code?: string; source?: string }[];
  deals: { brand: string; offer: string; tag: string; match: number }[];
  lifeEvents: { name: string; confidence: number; urgency: "Urgent" | "Soon" | "Upcoming"; timing: string; evidence: string; color: string }[];
  trips: { destination: string; dates: string; spend: string; highlights: string[] }[];
  pillarBreakdown: { pillar: string; pct: number; color: string }[];
}

export function summarizeCsv(csv: string): { txnCount: number; txnTotal: string; sourceCount: number; dateRange: string } {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return { txnCount: 0, txnTotal: "$0", sourceCount: 0, dateRange: "–" };

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const amtIdx = header.findIndex((h) => h === "amount");
  const dateIdx = header.findIndex((h) => h === "date");
  const srcIdx = header.findIndex((h) => h === "source");

  const rows = lines.slice(1).filter((l) => l.trim());
  let total = 0;
  const sources = new Set<string>();
  const dates: Date[] = [];

  for (const row of rows) {
    const cols = row.split(",").map((c) => c.trim());
    if (amtIdx >= 0) total += Math.abs(parseFloat(cols[amtIdx]) || 0);
    if (srcIdx >= 0 && cols[srcIdx]) sources.add(cols[srcIdx]);
    if (dateIdx >= 0 && cols[dateIdx]) {
      const d = new Date(cols[dateIdx]);
      if (!isNaN(d.getTime())) dates.push(d);
    }
  }

  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  let dateRange = "–";
  if (dates.length > 0) {
    dates.sort((a, b) => a.getTime() - b.getTime());
    const fmtD = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dateRange = `${fmtD(dates[0])} – ${fmtD(dates[dates.length - 1])}`;
  }

  return { txnCount: rows.length, txnTotal: fmt.format(total), sourceCount: sources.size, dateRange };
}

export interface CustomDemographics {
  name: string;
  age: string;
  occupation: string;
  familyStatus: string;
  incomeLevel?: string;
  segment?: string;
  industry?: string;
}

/** Parse the unified LLM output block into demographics + CSV */
export function parseUnifiedOutput(text: string): { demographics: CustomDemographics; zip: string; csv: string } | null {
  const profileMatch = text.match(/===\s*PROFILE\s*===([\s\S]*?)===\s*TRANSACTIONS\s*===/i);
  const txnMatch = text.match(/===\s*TRANSACTIONS\s*===([\s\S]*)/i);
  if (!profileMatch || !txnMatch) return null;

  const profileBlock = profileMatch[1].trim();
  const csv = txnMatch[1].trim();

  const get = (key: string): string => {
    const m = profileBlock.match(new RegExp(`^${key}:\\s*(.+)$`, "mi"));
    return m ? m[1].trim() : "";
  };

  return {
    demographics: {
      name: get("name"),
      age: get("age"),
      occupation: get("occupation"),
      familyStatus: get("family") || get("familyStatus") || "Single",
      incomeLevel: get("income"),
      segment: get("segment"),
      industry: get("industry"),
    },
    zip: get("zip"),
    csv,
  };
}

/** Build a dynamic LLM prompt from a persona description */
export function buildCustomerPrompt(persona: string): string {
  return `Generate a complete customer profile and 30 realistic bank transactions for this persona:
"${persona}"

Output EXACTLY this format (no extra text):

=== PROFILE ===
name: [realistic full name]
age: [number]
occupation: [job title]
family: [Single / Married / Married with Kids / Divorced]
income: [$amount]
segment: [Preferred / Premier / Private]
industry: [industry name]
zip: [realistic US zip code matching the persona's location]

=== TRANSACTIONS ===
transaction_id,merchant_name,description,mcc,amount,date,zip_code,source
1,Whole Foods Market,Grocery shopping,5411,87.50,2026-01-15,94102,Premium Card
2,Delta Air Lines,Round-trip flight,3058,450.00,2026-01-18,94102,Travel Card
[continue for 30 rows total]

Rules:
- CRITICAL: Never use commas inside any field value. Amounts must be plain numbers without commas (e.g. 1450.00 not 1,450.00)
- transaction_id is a sequential number 1-30
- description is a short 2-4 word phrase describing the purchase
- Amounts $5-$2000, realistic MCC codes (5411=grocery, 5812=dining, 3000-3299=airlines, 5977=cosmetics, 7941=sports, etc.)
- source should be one of: Premium Card, Travel Card, Cashback Card, Checking
- Include 1 realistic life-event transaction cluster that matches this persona (e.g. baby prep purchases, retirement advisor visits, home improvement, college application fees, wedding planning, relocation expenses — pick whichever fits best)
- Spread the life-event transactions across 3-5 rows so the pattern is detectable
- Use zip codes near the persona's stated or implied location
- Output ONLY the formatted block above, no explanation`;
}

export function buildCustomDemoCustomer(
  id: string,
  csv: string,
  demographics: CustomDemographics,
  zip: string
): DemoCustomer {
  const summary = summarizeCsv(csv);
  const segment = (demographics.segment as ClientProfileData["segment"]) || "Preferred";
  return {
    id,
    profile: {
      name: demographics.name || "Custom Customer",
      segment,
      aum: "$100,000",
      tenure: "1 year",
      contact: { email: "custom@example.com", phone: "000-000-0000", address: `ZIP ${zip || "00000"}` },
      demographics: {
        age: demographics.age || "35",
        occupation: demographics.occupation || "Professional",
        familyStatus: demographics.familyStatus || "Single",
        incomeLevel: demographics.incomeLevel || "$100,000",
        industry: demographics.industry || "Other",
      },
      holdings: { deposit: "$190,000", credit: "$10,000", mortgage: "$0", investments: "$40,000" },
      compliance: { kycStatus: "Current", lastReview: "2025-01-01", nextReview: "2026-01-01", riskProfile: "Moderate" },
      milestones: [],
    },
    csv,
    zip: zip || "10001",
    ...summary,
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
    ...summarizeCsv(SAMPLE_CSV),
    topPillars: [
      { name: "Travel", icon: "✈️", pct: 28, spend: "$7,374" },
      { name: "Home", icon: "🏠", pct: 24, spend: "$93,087" },
      { name: "Sports", icon: "🎾", pct: 18, spend: "$1,584" },
      { name: "Pets", icon: "🐕", pct: 8, spend: "$474" },
    ],
    sampleTransactions: [
      { merchant: "Hawaiian Airlines", amount: "$892", date: "Jul 01", category: "Travel", zip_code: "94102", source: "Premium Card" },
      { merchant: "SF Tennis Club", amount: "$350", date: "Apr 10", category: "Sports", zip_code: "94102", source: "Checks" },
      { merchant: "Palisades Tahoe", amount: "$189", date: "Nov 23", category: "Sports", zip_code: "81657", source: "Premium Card" },
      { merchant: "CHEWY.COM", amount: "$68", date: "Dec 05", category: "Pets", zip_code: "94102", source: "Cashback Card" },
    ],
    deals: [
      { brand: "REI Co-op", offer: "10% back on outdoor gear", tag: "Outdoor", match: 96 },
      { brand: "Petco", offer: "20% off premium food", tag: "Pets", match: 92 },
      { brand: "Hawaiian Airlines", offer: "Double miles on flights", tag: "Travel", match: 89 },
      { brand: "Wilson", offer: "15% off tennis gear", tag: "Sports", match: 87 },
    ],
    lifeEvents: [
      { name: "College-Bound Child", confidence: 88, urgency: "Urgent", timing: "Q1 2026", evidence: "SAT registration + Kaplan prep course + campus tour + admissions consulting", color: "#3b82f6" },
      { name: "New Home Purchase", confidence: 92, urgency: "Soon", timing: "Q2 2026", evidence: "Mortgage application + home inspection + title/escrow + down payment wire", color: "#22c55e" },
    ],
    trips: [
      { destination: "Maui, HI", dates: "Jul 1–6, 2025", spend: "$3,746", highlights: ["Grand Wailea Resort", "Molokini snorkeling", "Mama's Fish House"] },
      { destination: "Big Island, HI", dates: "Jul 5–10, 2026", spend: "$3,628", highlights: ["Hilton Waikoloa", "Volcano tour", "Beach resort"] },
    ],
    pillarBreakdown: [
      { pillar: "Home & Real Estate", pct: 28, color: "#22c55e" },
      { pillar: "Travel", pct: 24, color: "#3b82f6" },
      { pillar: "Sports & Active Living", pct: 18, color: "#6366f1" },
      { pillar: "Education", pct: 14, color: "#f59e0b" },
      { pillar: "Pets", pct: 8, color: "#ec4899" },
      { pillar: "Other", pct: 8, color: "#94a3b8" },
    ],
  },
  {
    id: "c2",
    profile: SAMPLE_CUSTOMER_2,
    csv: SAMPLE_CSV_SPORTS_WELLNESS,
    zip: "78701",
    lifestyleType: "Tech Enthusiast",
    ...summarizeCsv(SAMPLE_CSV_SPORTS_WELLNESS),
    topPillars: [
      { name: "Technology", icon: "💻", pct: 28, spend: "$3,360" },
      { name: "Dining", icon: "🍽️", pct: 24, spend: "$2,880" },
      { name: "Fitness", icon: "🏋️", pct: 20, spend: "$2,400" },
      { name: "Entertainment", icon: "🎮", pct: 16, spend: "$1,920" },
    ],
    sampleTransactions: [
      { merchant: "Equinox Austin", amount: "$250", date: "Aug 15", category: "Fitness", source: "Premium Card" },
      { merchant: "Barry's Bootcamp", amount: "$150", date: "Aug 18", category: "Fitness", source: "Premium Card" },
      { merchant: "REI Co-op", amount: "$235", date: "Aug 17", category: "Outdoors", zip_code: "78701", source: "Cashback Card" },
      { merchant: "Nike Store Austin", amount: "$160", date: "Aug 17", category: "Shopping", source: "Cashback Card" },
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
    ...summarizeCsv(SAMPLE_CSV_FOOD_HOME),
    topPillars: [
      { name: "Family", icon: "👨‍👩‍👧‍👦", pct: 30, spend: "$5,400" },
      { name: "Home", icon: "🏠", pct: 25, spend: "$4,500" },
      { name: "Education", icon: "📚", pct: 20, spend: "$3,600" },
      { name: "Grocery", icon: "🛒", pct: 15, spend: "$2,700" },
    ],
    sampleTransactions: [
      { merchant: "Home Depot", amount: "$157", date: "Aug 16", category: "Home", zip_code: "60614", source: "Checking" },
      { merchant: "Costco Wholesale", amount: "$299", date: "Aug 21", category: "Grocery", zip_code: "60614", source: "Cashback Card" },
      { merchant: "Gibsons Steakhouse", amount: "$288", date: "Aug 15", category: "Dining", zip_code: "60614", source: "Premium Card" },
      { merchant: "Crate and Barrel", amount: "$157", date: "Aug 22", category: "Home", zip_code: "60614", source: "Premium Card" },
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
    ...summarizeCsv(SAMPLE_CSV_TRAVEL_FAMILY_12),
    topPillars: [
      { name: "Golf", icon: "⛳", pct: 32, spend: "$8,960" },
      { name: "Dining", icon: "🍽️", pct: 22, spend: "$6,160" },
      { name: "Travel", icon: "✈️", pct: 20, spend: "$5,600" },
      { name: "Wine & Spirits", icon: "🍷", pct: 14, spend: "$3,920" },
    ],
    sampleTransactions: [
      { merchant: "United Airlines", amount: "$1,345", date: "Nov 25", category: "Travel", zip_code: "94102", source: "Travel Card" },
      { merchant: "Yellowstone Lodge", amount: "$1,234", date: "Nov 25", category: "Travel", zip_code: "82190", source: "Travel Card" },
      { merchant: "Kids Soccer League", amount: "$295", date: "Nov 05", category: "Family", zip_code: "94102", source: "Checking" },
      { merchant: "Safeway", amount: "$179", date: "Nov 11", category: "Grocery", zip_code: "94102", source: "Cashback Card" },
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
    ...summarizeCsv(SAMPLE_CSV_NYC_SPORTS_HOME_12),
    topPillars: [
      { name: "Dining", icon: "🍽️", pct: 28, spend: "$5,040" },
      { name: "Fashion", icon: "👗", pct: 24, spend: "$4,320" },
      { name: "Wellness", icon: "💆", pct: 20, spend: "$3,600" },
      { name: "Culture", icon: "🎭", pct: 16, spend: "$2,880" },
    ],
    sampleTransactions: [
      { merchant: "Equinox Gramercy", amount: "$245", date: "Nov 01", category: "Wellness", zip_code: "10003", source: "Premium Card" },
      { merchant: "SoulCycle Flatiron", amount: "$175", date: "Nov 15", category: "Wellness", zip_code: "10010", source: "Premium Card" },
      { merchant: "West Elm", amount: "$389", date: "Nov 06", category: "Home", zip_code: "10003", source: "Premium Card" },
      { merchant: "Whole Foods Union Sq", amount: "$125", date: "Nov 05", category: "Grocery", zip_code: "10003", source: "Cashback Card" },
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
    ...summarizeCsv(SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12),
    topPillars: [
      { name: "Travel", icon: "✈️", pct: 30, spend: "$9,600" },
      { name: "Investments", icon: "📈", pct: 25, spend: "$8,000" },
      { name: "Dining", icon: "🍽️", pct: 18, spend: "$5,760" },
      { name: "Golf", icon: "⛳", pct: 15, spend: "$4,800" },
    ],
    sampleTransactions: [
      { merchant: "East Bank Club", amount: "$295", date: "Nov 01", category: "Fitness", zip_code: "60610", source: "Premium Card" },
      { merchant: "Tennis Pro Shop", amount: "$85", date: "Nov 03", category: "Sports", zip_code: "60610", source: "Cashback Card" },
      { merchant: "RPM Italian", amount: "$88", date: "Nov 24", category: "Dining", zip_code: "60610", source: "Premium Card" },
      { merchant: "Lululemon Chicago", amount: "$156", date: "Nov 05", category: "Fashion", zip_code: "60610", source: "Premium Card" },
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
