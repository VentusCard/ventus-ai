// Deterministic synthetic dataset for the Query console.
// Generates ~90 days of transactions across customers, pillars, categories,
// life events and deals so DSL aggregations look believable.

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
const DEALS = ["Delta SkyMiles", "Marriott Bonvoy", "Equinox", "Whole Foods", "Apple", "Tesla", "Sephora", "Lululemon"];

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

  // ~90 days, 4-12 transactions per day
  const transactions: Row[] = [];
  let tid = 0;
  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
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

  // Life events sprinkled over the window
  const life_events: Row[] = [];
  for (let i = 0; i < 140; i++) {
    const cust = customers[Math.floor(r() * customers.length)];
    const dayOffset = Math.floor(r() * 90);
    const d = new Date(today);
    d.setDate(d.getDate() - dayOffset);
    life_events.push({
      event_id: `E${i}`,
      customer_id: String(cust.customer_id),
      event_type: LIFE_EVENTS[Math.floor(r() * LIFE_EVENTS.length)],
      day: isoDay(d),
      confidence: Math.round((0.55 + r() * 0.4) * 100) / 100,
    });
  }

  // Deals (catalog)
  const deals: Row[] = DEALS.map((brand, i) => ({
    deal_id: `D${i}`,
    brand,
    pillar: PILLARS[i % PILLARS.length],
    discount_pct: 5 + Math.floor(r() * 25),
    redemptions: Math.floor(50 + r() * 800),
  }));

  cache = { transactions, customers, life_events, deals };
  return cache;
}

export const SCHEMA = {
  transactions: ["transaction_id", "customer_id", "day", "amount", "pillar", "category", "merchant", "region", "segment"],
  customers: ["customer_id", "name", "segment", "region", "age", "tenure_years", "aum"],
  life_events: ["event_id", "customer_id", "event_type", "day", "confidence"],
  deals: ["deal_id", "brand", "pillar", "discount_pct", "redemptions"],
} as const;
