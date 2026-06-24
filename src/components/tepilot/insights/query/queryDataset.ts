// Deterministic synthetic Ventus dataset for the SQL Query console.
// Generates ~90 days of transactions + derived "Ventus" tables
// (shopping_habits, wallet_share, life_events with evidence,
//  deals + deal_redemptions) so analysts can JOIN and aggregate freely.

export type Row = Record<string, string | number>;

const PILLARS = [
  "Food", "Travel", "Wellness", "Home", "Apparel", "Entertainment",
  "Transport", "Education", "Subscriptions", "Family", "Tech", "Auto",
];

const CATEGORIES: Record<string, string[]> = {
  Food: ["Restaurants", "Groceries", "Coffee", "Delivery"],
  Travel: ["Flights", "Hotels", "Rideshare", "Cruises"],
  Wellness: ["Gym", "Yoga", "Spa", "Supplements"],
  Home: ["Furniture", "Decor", "General", "Garden"],
  Apparel: ["Womens", "Mens", "Athletic", "Luxury"],
  Entertainment: ["Streaming", "Events", "Gaming", "Music"],
  Transport: ["Gas", "Transit", "Tolls", "Parking"],
  Education: ["Tuition", "Books", "Courses"],
  Subscriptions: ["Streaming", "Software", "News"],
  Family: ["Childcare", "Toys", "School"],
  Tech: ["Devices", "Accessories", "Cloud"],
  Auto: ["Service", "Insurance", "Parts"],
};

const REGIONS = ["NYC", "SF", "Chicago", "Austin", "Miami", "Seattle", "Boston", "LA"];
const SEGMENTS = ["Mass", "Affluent", "Mass-Affluent", "Private", "Emerging"];
const LIFE_EVENTS = ["new_baby", "home_purchase", "new_job", "relocation", "engagement", "retirement", "college"];
const URGENCY: Array<"Urgent" | "Soon" | "Upcoming"> = ["Urgent", "Soon", "Upcoming"];

const DEALS_SEED: Array<{ brand: string; pillar: string; category: string }> = [
  { brand: "Delta SkyMiles", pillar: "Travel", category: "Flights" },
  { brand: "Marriott Bonvoy", pillar: "Travel", category: "Hotels" },
  { brand: "Equinox", pillar: "Wellness", category: "Gym" },
  { brand: "Whole Foods", pillar: "Food", category: "Groceries" },
  { brand: "Apple", pillar: "Tech", category: "Devices" },
  { brand: "Tesla", pillar: "Auto", category: "Service" },
  { brand: "Sephora", pillar: "Apparel", category: "Luxury" },
  { brand: "Lululemon", pillar: "Apparel", category: "Athletic" },
  { brand: "Peloton", pillar: "Wellness", category: "Gym" },
  { brand: "DoorDash", pillar: "Food", category: "Delivery" },
];

// Outbound funds detected as wallet-share leakage (rivals / non-bank wallets)
const COMPETITOR_MERCHANTS: Array<{ name: string; category: string }> = [
  { name: "Chase Visa Payment", category: "Card Repayment" },
  { name: "Amex Autopay", category: "Card Repayment" },
  { name: "Venmo Transfer", category: "P2P Transfer" },
  { name: "Cash App", category: "P2P Transfer" },
  { name: "PayPal Withdraw", category: "Wallet Outflow" },
  { name: "Robinhood Deposit", category: "Investment Outflow" },
  { name: "Coinbase Buy", category: "Investment Outflow" },
  { name: "Wells Fargo Mortgage", category: "Loan Outflow" },
];

// Mulberry32 PRNG
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function isoDay(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export function getDateRange(): { today: string; minDay: string; maxDay: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = new Date(today);
  min.setDate(min.getDate() - 89);
  return { today: isoDay(today), minDay: isoDay(min), maxDay: isoDay(today) };
}

function tierFor(avg: number): "Budget" | "Mainstream" | "Premium" | "Luxury" {
  if (avg < 35) return "Budget";
  if (avg < 100) return "Mainstream";
  if (avg < 250) return "Premium";
  return "Luxury";
}

function freqFor(count: number, days: number): "Rare" | "Monthly" | "Weekly" | "Daily" {
  const perDay = count / Math.max(days, 1);
  if (perDay >= 0.8) return "Daily";
  if (perDay >= 0.2) return "Weekly";
  if (perDay >= 0.05) return "Monthly";
  return "Rare";
}

let cache: Record<string, Row[]> | null = null;

export function getDataset(): Record<string, Row[]> {
  if (cache) return cache;
  const r = rng(20260624);

  // 60 customers
  const customers: Row[] = Array.from({ length: 60 }, (_, i) => ({
    customer_id: `C${1000 + i}`,
    name: `Customer ${i + 1}`,
    segment: SEGMENTS[Math.floor(r() * SEGMENTS.length)],
    region: REGIONS[Math.floor(r() * REGIONS.length)],
    age: 22 + Math.floor(r() * 50),
    tenure_years: Math.floor(r() * 15),
    aum: Math.round(20_000 + r() * 480_000),
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const WINDOW_DAYS = 90;

  // ---- transactions ----
  const transactions: Row[] = [];
  let tid = 0;
  for (let dayOffset = WINDOW_DAYS - 1; dayOffset >= 0; dayOffset--) {
    const d = new Date(today);
    d.setDate(d.getDate() - dayOffset);
    const day = isoDay(d);
    const dow = d.getDay();
    const txCount = Math.floor(40 + r() * 40 + (dow === 0 || dow === 6 ? 15 : 0));
    for (let i = 0; i < txCount; i++) {
      const cust = customers[Math.floor(r() * customers.length)];
      const pillar = PILLARS[Math.floor(r() * PILLARS.length)];
      const cats = CATEGORIES[pillar];
      const category = cats[Math.floor(r() * cats.length)];
      const base =
        pillar === "Travel" ? 150 + r() * 600 :
        pillar === "Home" ? 60 + r() * 400 :
        pillar === "Wellness" ? 30 + r() * 180 :
        pillar === "Food" ? 12 + r() * 80 :
        20 + r() * 200;
      transactions.push({
        transaction_id: `T${tid++}`,
        customer_id: String(cust.customer_id),
        day,
        amount: Math.round(base * 100) / 100,
        pillar,
        category,
        merchant: `${pillar} Co ${1 + Math.floor(r() * 30)}`,
        region: String(cust.region),
        segment: String(cust.segment),
      });
    }
  }

  // ---- shopping_habits (derived from transactions) ----
  type HabitAgg = { count: number; total: number; merchants: Map<string, number>; lastDay: string };
  const habitMap = new Map<string, HabitAgg>();
  for (const t of transactions) {
    const key = `${t.customer_id}::${t.pillar}`;
    let h = habitMap.get(key);
    if (!h) { h = { count: 0, total: 0, merchants: new Map(), lastDay: "" }; habitMap.set(key, h); }
    h.count += 1;
    h.total += Number(t.amount);
    h.merchants.set(String(t.merchant), (h.merchants.get(String(t.merchant)) || 0) + 1);
    if (String(t.day) > h.lastDay) h.lastDay = String(t.day);
  }
  const shopping_habits: Row[] = [];
  for (const [key, h] of habitMap.entries()) {
    const [customer_id, pillar] = key.split("::");
    const avg = h.total / h.count;
    const topMerchant = [...h.merchants.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    shopping_habits.push({
      customer_id,
      pillar,
      txn_count: h.count,
      total_spend: Math.round(h.total * 100) / 100,
      avg_ticket: Math.round(avg * 100) / 100,
      top_merchant: topMerchant,
      spending_tier: tierFor(avg),
      purchase_frequency: freqFor(h.count, WINDOW_DAYS),
      last_seen_day: h.lastDay,
    });
  }

  // ---- wallet_share (synthetic outbound funds per customer) ----
  const wallet_share: Row[] = [];
  for (const cust of customers) {
    const outflows = 1 + Math.floor(r() * 4);
    for (let i = 0; i < outflows; i++) {
      const comp = COMPETITOR_MERCHANTS[Math.floor(r() * COMPETITOR_MERCHANTS.length)];
      const count = 1 + Math.floor(r() * 8);
      const amt = Math.round((count * (80 + r() * 900)) * 100) / 100;
      const dayOff = Math.floor(r() * WINDOW_DAYS);
      const d = new Date(today); d.setDate(d.getDate() - dayOff);
      wallet_share.push({
        customer_id: String(cust.customer_id),
        competitor_merchant: comp.name,
        category: comp.category,
        outflow_amount: amt,
        outflow_count: count,
        last_outflow_day: isoDay(d),
      });
    }
  }

  // ---- life_events with evidence ----
  const life_events: Row[] = [];
  for (let i = 0; i < 140; i++) {
    const cust = customers[Math.floor(r() * customers.length)];
    const dayOffset = Math.floor(r() * WINDOW_DAYS);
    const d = new Date(today); d.setDate(d.getDate() - dayOffset);
    const event_type = LIFE_EVENTS[Math.floor(r() * LIFE_EVENTS.length)];
    // pick a plausible evidence merchant from customer's transactions
    const custTxns = transactions.filter((t) => t.customer_id === cust.customer_id);
    const evidenceMerchant = custTxns.length
      ? String(custTxns[Math.floor(r() * custTxns.length)].merchant)
      : "—";
    life_events.push({
      event_id: `E${i}`,
      customer_id: String(cust.customer_id),
      event_type,
      day: isoDay(d),
      confidence: Math.round((0.55 + r() * 0.4) * 100) / 100,
      urgency: URGENCY[Math.floor(r() * URGENCY.length)],
      evidence_count: 2 + Math.floor(r() * 8),
      evidence_sample: evidenceMerchant,
    });
  }

  // ---- deals (richer) ----
  const deals: Row[] = DEALS_SEED.map((d, i) => ({
    deal_id: `D${i}`,
    brand: d.brand,
    pillar: d.pillar,
    category: d.category,
    discount_pct: 5 + Math.floor(r() * 25),
    redemptions: 0, // overwritten below from deal_redemptions
    active: r() > 0.15 ? 1 : 0,
  }));

  // ---- deal_redemptions ----
  const deal_redemptions: Row[] = [];
  let rid = 0;
  for (const deal of deals) {
    if (!deal.active) continue;
    const count = 20 + Math.floor(r() * 200);
    for (let i = 0; i < count; i++) {
      const cust = customers[Math.floor(r() * customers.length)];
      const dayOffset = Math.floor(r() * WINDOW_DAYS);
      const d = new Date(today); d.setDate(d.getDate() - dayOffset);
      deal_redemptions.push({
        redemption_id: `R${rid++}`,
        deal_id: String(deal.deal_id),
        customer_id: String(cust.customer_id),
        day: isoDay(d),
        redeemed_amount: Math.round((15 + r() * 380) * 100) / 100,
      });
    }
  }
  // Sync deals.redemptions
  const redCount = new Map<string, number>();
  for (const r2 of deal_redemptions) {
    redCount.set(String(r2.deal_id), (redCount.get(String(r2.deal_id)) || 0) + 1);
  }
  for (const deal of deals) deal.redemptions = redCount.get(String(deal.deal_id)) || 0;

  cache = { transactions, customers, life_events, shopping_habits, wallet_share, deals, deal_redemptions };
  return cache;
}

export const SCHEMA: Record<string, string[]> = {
  transactions: ["transaction_id", "customer_id", "day", "amount", "pillar", "category", "merchant", "region", "segment"],
  customers: ["customer_id", "name", "segment", "region", "age", "tenure_years", "aum"],
  life_events: ["event_id", "customer_id", "event_type", "day", "confidence", "urgency", "evidence_count", "evidence_sample"],
  shopping_habits: ["customer_id", "pillar", "txn_count", "total_spend", "avg_ticket", "top_merchant", "spending_tier", "purchase_frequency", "last_seen_day"],
  wallet_share: ["customer_id", "competitor_merchant", "category", "outflow_amount", "outflow_count", "last_outflow_day"],
  deals: ["deal_id", "brand", "pillar", "category", "discount_pct", "redemptions", "active"],
  deal_redemptions: ["redemption_id", "deal_id", "customer_id", "day", "redeemed_amount"],
};
