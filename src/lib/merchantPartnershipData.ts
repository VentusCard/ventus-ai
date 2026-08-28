/**
 * Merchant partnership planning data — national brands and local metro merchants.
 *
 * All figures are deterministic demo data derived from the compact seed rows below.
 * Nothing here calls an AI model or a network service.
 */

export type PartnerStage = "prospect" | "outreach" | "negotiating" | "contract" | "live";

export interface QuarterPoint {
  label: string;
  spend: number;
}

export interface NationalPartner {
  id: string;
  brand: string;
  category: string;
  pillar: string;
  /** Cardholders who spend at this brand at least monthly */
  cardholders: number;
  /** Annual card spend flowing through the brand */
  annualSpend: number;
  avgTicket: number;
  /** Share of the bank's spend in this category that lands at this brand */
  categorySharePct: number;
  /** Expected incremental lift on partnered spend */
  upliftPct: number;
  estimatedValue: number;
  valueLow: number;
  valueHigh: number;
  fitScore: number;
  stage: PartnerStage;
  reason: string;
  dealConstruct: string;
  competitor: string;
  competitorLeakage: number;
  cohorts: string[];
  trend: QuarterPoint[];
}

export interface LocalPartner {
  id: string;
  name: string;
  metroId: string;
  neighborhood: string;
  category: string;
  cardholders: number;
  annualSpend: number;
  avgTicket: number;
  upliftPct: number;
  estimatedValue: number;
  fitScore: number;
  stage: PartnerStage;
  reason: string;
  dealConstruct: string;
  /** Position on the stylized metro street canvas (0-100 scale) */
  x: number;
  y: number;
  /** Real-world coordinates, scattered deterministically inside the neighborhood */
  lat: number;
  lng: number;
}

export interface Metro {
  id: string;
  name: string;
  state: string;
  cardholders: number;
  neighborhoods: string[];
  lat: number;
  lng: number;
  zoom: number;
}

export const PARTNER_CATEGORIES = [
  "Grocery & Everyday",
  "Dining",
  "Travel",
  "Retail & Style",
  "Home & Living",
  "Health & Wellness",
  "Entertainment",
  "Technology",
  "Auto & Fuel",
  "Pets & Family",
] as const;

export const CATEGORY_COLORS: Record<string, { dot: string; chip: string; pin: string }> = {
  "Grocery & Everyday": { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", pin: "#10b981" },
  Dining: { dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200", pin: "#f59e0b" },
  Travel: { dot: "bg-sky-500", chip: "bg-sky-50 text-sky-700 border-sky-200", pin: "#0ea5e9" },
  "Retail & Style": { dot: "bg-fuchsia-500", chip: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", pin: "#d946ef" },
  "Home & Living": { dot: "bg-orange-500", chip: "bg-orange-50 text-orange-700 border-orange-200", pin: "#f97316" },
  "Health & Wellness": { dot: "bg-teal-500", chip: "bg-teal-50 text-teal-700 border-teal-200", pin: "#14b8a6" },
  Entertainment: { dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700 border-violet-200", pin: "#8b5cf6" },
  Technology: { dot: "bg-blue-500", chip: "bg-blue-50 text-blue-700 border-blue-200", pin: "#3b82f6" },
  "Auto & Fuel": { dot: "bg-slate-500", chip: "bg-slate-100 text-slate-700 border-slate-200", pin: "#64748b" },
  "Pets & Family": { dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200", pin: "#f43f5e" },
};

export const STAGE_LABELS: Record<PartnerStage, string> = {
  prospect: "Prospect",
  outreach: "Outreach sent",
  negotiating: "Negotiating",
  contract: "Contract out",
  live: "Live",
};

export const STAGE_STYLES: Record<PartnerStage, string> = {
  prospect: "bg-slate-100 text-slate-600 border-slate-200",
  outreach: "bg-blue-50 text-blue-700 border-blue-200",
  negotiating: "bg-amber-50 text-amber-700 border-amber-200",
  contract: "bg-violet-50 text-violet-700 border-violet-200",
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

/** Blended share of incremental spend the bank captures through a co-funded partnership. */
const CAPTURE_RATE = 0.29;

export function estimatePartnershipValue(annualSpend: number, upliftPct: number): number {
  return Math.round((annualSpend * (upliftPct / 100) * CAPTURE_RATE) / 1000) * 1000;
}

/* ------------------------------------------------------------------ */
/* National partners                                                    */
/* ------------------------------------------------------------------ */

type NationalSeed = [
  brand: string,
  category: string,
  cardholders: number,
  annualSpendM: number,
  avgTicket: number,
  categorySharePct: number,
  upliftPct: number,
  fitScore: number,
  stage: PartnerStage,
  competitor: string,
  competitorLeakageM: number,
  reason: string,
  dealConstruct: string,
  cohorts: string,
];

const NATIONAL_SEEDS: NationalSeed[] = [
  ["Costco", "Grocery & Everyday", 486000, 742, 138, 22, 6.5, 94, "negotiating", "Sam's Club", 96, "Highest recurring-visit grocery brand in the book — 486K cardholders shop it at least monthly and 31% pair it with a competing warehouse club.", "5% category boost on club spend, funded 60/40 by the merchant", "Bulk-buying families|Suburban homeowners|Business owners"],
  ["Amazon", "Retail & Style", 812000, 1180, 61, 34, 4.2, 96, "contract", "Walmart.com", 184, "Broadest reach of any merchant — nearly 3 in 4 active cardholders transact monthly, with heaviest concentration in general merchandise.", "Rotating 5% quarter with co-funded new-cardholder bonus", "Everyday spenders|New parents|Students"],
  ["Delta Air Lines", "Travel", 214000, 596, 428, 27, 8.1, 93, "negotiating", "United Airlines", 142, "Travel spend concentrates here for the affluent segment; 62% of Delta flyers also book hotels on-card within 14 days.", "Co-branded lounge access plus 3x points on airfare", "Frequent business travelers|Affluent households"],
  ["Target", "Retail & Style", 604000, 528, 74, 19, 5.4, 91, "live", "Walmart", 118, "Second-widest household reach and the strongest basket for family formation signals — baby, school, and home items in one trip.", "4% back on family categories, merchant-funded", "New parents|College-prep families|Suburban homeowners"],
  ["Whole Foods Market", "Grocery & Everyday", 268000, 384, 96, 11, 6.8, 88, "outreach", "Trader Joe's", 74, "Premium grocery basket skewing to health-conscious, higher-income cardholders with 3.1 visits per month.", "6% back capped at $40/quarter, co-funded", "Health-focused|Urban professionals"],
  ["Starbucks", "Dining", 731000, 268, 12, 24, 7.2, 90, "live", "Dunkin'", 41, "Highest transaction frequency of any brand — 22 visits per active cardholder per quarter, ideal for habit-forming rewards.", "Load-and-earn: $5 back per $50 reloaded", "Commuters|Students|Young professionals"],
  ["Marriott Bonvoy", "Travel", 158000, 412, 611, 21, 8.6, 92, "negotiating", "Hilton", 108, "Hotel spend clusters here for business travelers; average stay value is 2.4x the portfolio hotel average.", "Elite status match plus 4x points on stays", "Business travelers|Affluent households"],
  ["Home Depot", "Home & Living", 392000, 486, 164, 26, 6.1, 89, "outreach", "Lowe's", 122, "Renovation spend spikes 90 days after a home purchase — a clean trigger the bank already detects.", "5% back for 6 months post-mortgage close", "New homeowners|Renovators|Business owners"],
  ["Apple", "Technology", 348000, 442, 386, 31, 5.2, 90, "prospect", "Best Buy", 88, "Device upgrade cycles are predictable at 26 months, and 44% of purchases are financed on-card.", "12-month 0% installment plan, merchant-subsidized", "Tech upgraders|Young professionals"],
  ["Chipotle", "Dining", 412000, 148, 19, 9, 7.8, 86, "live", "Sweetgreen", 22, "Fast-casual leader among under-35 cardholders with strong weekday lunch cadence.", "Buy 8, get 1 free funded by the merchant", "Young professionals|Students"],
  ["Walmart", "Grocery & Everyday", 668000, 694, 82, 24, 4.6, 88, "prospect", "Target", 132, "Broadest everyday coverage in value-conscious segments and the top merchant in eight of ten regions.", "3% back on groceries, capped monthly", "Value-focused households|Large families"],
  ["Nike", "Retail & Style", 296000, 214, 128, 16, 6.9, 85, "outreach", "Lululemon", 46, "Active-living pillar leader; buyers also index high on gym memberships and race entries.", "5% back plus early drop access", "Active lifestyle|Parents of athletes"],
  ["Southwest Airlines", "Travel", 186000, 268, 284, 12, 7.4, 84, "prospect", "JetBlue", 58, "Dominant leisure-travel carrier in southern metros with strong family booking patterns.", "Companion fare credit after $6K annual spend", "Leisure travelers|Families"],
  ["Peloton", "Health & Wellness", 62000, 74, 118, 8, 9.2, 79, "prospect", "Equinox", 14, "Small but high-value wellness cohort with 91% subscription retention past 18 months.", "Subscription credit for 12 months", "Health-focused|Affluent households"],
  ["Sephora", "Retail & Style", 224000, 138, 78, 14, 7.6, 83, "outreach", "Ulta Beauty", 34, "Beauty spend is highly repeatable and pairs with the style pillar's fastest-growing cohort.", "Points multiplier on beauty category", "Style-forward|Young professionals"],
  ["Chevron", "Auto & Fuel", 428000, 312, 54, 18, 5.1, 82, "live", "Shell", 76, "Fuel is the most-used everyday category among commuters, with 9 fills per quarter on average.", "10c/gal statement credit, co-funded", "Commuters|Suburban households"],
  ["Chewy", "Pets & Family", 184000, 96, 68, 21, 8.4, 84, "negotiating", "Petco", 19, "New-pet-owner signal fires 3 weeks before the first large supply order — a clean pre-emptive offer window.", "First-order credit plus 5% on autoship", "New pet owners|Families"],
  ["Netflix", "Entertainment", 552000, 128, 18, 27, 4.1, 80, "prospect", "Hulu", 24, "Highest subscription penetration in the book and a reliable retention hook for card-on-file.", "One month credited annually", "Everyday spenders|Families"],
  ["Delta Vacations", "Travel", 74000, 186, 1240, 7, 9.4, 81, "prospect", "Expedia", 42, "Package bookings signal a planned multi-week trip, unlocking pre-trip lending and FX products.", "Trip credit plus fee-free FX", "Leisure travelers|Affluent households"],
  ["Best Buy", "Technology", 262000, 224, 218, 17, 5.8, 81, "outreach", "Amazon", 62, "Big-ticket electronics with high installment attach — 38% of purchases exceed $500.", "18-month financing offer", "Tech upgraders|New homeowners"],
  ["Trader Joe's", "Grocery & Everyday", 246000, 196, 62, 9, 6.2, 82, "prospect", "Whole Foods Market", 38, "Loyal weekly-shop base with the lowest attrition rate of any grocer in the portfolio.", "4% back on weekly grocery run", "Urban professionals|Small households"],
  ["Lowe's", "Home & Living", 288000, 342, 152, 18, 5.9, 83, "prospect", "Home Depot", 94, "Complementary to the Home Depot trigger and stronger in suburban and rural regions.", "5% back on project spend over $500", "New homeowners|Renovators"],
  ["Airbnb", "Travel", 168000, 246, 486, 11, 8.2, 83, "outreach", "Vrbo", 52, "Longer-stay bookings correlate with remote-work cohorts and multi-generational family trips.", "$100 credit on stays over $750", "Remote workers|Families"],
  ["DoorDash", "Dining", 486000, 214, 38, 16, 6.4, 85, "live", "Uber Eats", 48, "Highest weekly frequency in delivery with strong overlap into the grocery pillar.", "Free delivery tier bundled with the card", "Young professionals|Busy families"],
  ["Uber", "Travel", 428000, 168, 26, 8, 5.6, 82, "prospect", "Lyft", 39, "Urban mobility staple that pairs naturally with airline and dining partnerships.", "Monthly ride credit for cardholders", "Urban professionals|Travelers"],
  ["CVS Pharmacy", "Health & Wellness", 514000, 188, 41, 23, 4.8, 81, "prospect", "Walgreens", 44, "Pharmacy visits are the most reliable recurring health signal across all age bands.", "3% back on prescriptions and health items", "Older households|Families"],
  ["Lululemon", "Retail & Style", 148000, 124, 132, 9, 7.9, 80, "prospect", "Nike", 28, "Premium activewear with the highest repeat rate among affluent under-40 cardholders.", "Points multiplier plus early access", "Active lifestyle|Affluent households"],
  ["Disney+", "Entertainment", 312000, 74, 14, 14, 4.4, 76, "prospect", "Max", 16, "Family entertainment subscription that tracks tightly with the college-prep and new-parent cohorts.", "Annual subscription credit", "Families|New parents"],
  ["Instacart", "Grocery & Everyday", 288000, 168, 94, 7, 6.7, 80, "outreach", "Amazon Fresh", 32, "Delivery grocery leader in dense metros, with basket sizes 2.2x in-store average.", "Membership fee waived for cardholders", "Urban professionals|Busy families"],
  ["Expedia", "Travel", 196000, 288, 542, 13, 7.1, 82, "prospect", "Booking.com", 68, "Cross-category travel booking that captures air, hotel, and car in a single authorization.", "6% back on packages booked on-card", "Leisure travelers|Families"],
  ["Petco", "Pets & Family", 152000, 74, 62, 16, 7.8, 78, "prospect", "Chewy", 15, "Grooming and vet services attach at 41%, extending the pet relationship beyond supplies.", "Service credit on grooming and vet visits", "New pet owners|Families"],
  ["The Container Store", "Home & Living", 74000, 48, 148, 5, 8.8, 74, "prospect", "IKEA", 9, "Fires alongside relocation signals — organization spend peaks in the 30 days after a move.", "$50 credit on moving-window purchases", "Movers|New homeowners"],
  ["IKEA", "Home & Living", 208000, 186, 214, 11, 6.6, 80, "prospect", "Wayfair", 42, "First-furnishing purchases for renters and first-time buyers, heavily concentrated in metros.", "5% back for 90 days after a move", "Movers|Young professionals"],
  ["Wayfair", "Home & Living", 174000, 156, 268, 9, 7.2, 78, "prospect", "IKEA", 36, "Online furnishing with high average tickets and strong installment-financing attach.", "12-month financing on orders over $1,000", "New homeowners|Renovators"],
  ["REI", "Health & Wellness", 96000, 82, 142, 6, 8.1, 77, "prospect", "Dick's Sporting Goods", 17, "Outdoor cohort books travel 2.3x the portfolio average — a natural bridge to airline partners.", "Co-op dividend match for cardholders", "Active lifestyle|Travelers"],
  ["Ticketmaster", "Entertainment", 264000, 148, 186, 19, 6.3, 79, "outreach", "StubHub", 34, "Live-event spend is the strongest discretionary signal for the entertainment pillar.", "Presale window reserved for cardholders", "Entertainment-driven|Young professionals"],
  ["AMC Theatres", "Entertainment", 186000, 46, 34, 8, 5.4, 72, "prospect", "Cinemark", 11, "Weekend family outings that pair with dining spend within the same two-hour window.", "Bundle credit with nearby dining partners", "Families|Students"],
  ["Tesla", "Auto & Fuel", 58000, 214, 1860, 6, 9.6, 80, "prospect", "Rivian", 46, "EV purchase and charging spend flags an affluent household 6 months before the auto-loan window.", "Charging credit plus auto-loan rate hold", "Affluent households|Tech upgraders"],
  ["Costco Gas", "Auto & Fuel", 312000, 168, 62, 10, 5.2, 78, "prospect", "Chevron", 38, "Fuel visits pull the member back into the warehouse basket 68% of the time.", "Bundled fuel and club-spend accelerator", "Suburban households|Bulk buyers"],
  ["Hilton Honors", "Travel", 142000, 324, 574, 16, 7.7, 86, "outreach", "Marriott Bonvoy", 82, "Second hotel partner covering markets where the primary chain under-indexes.", "Status match plus 3x points on stays", "Business travelers|Leisure travelers"],
  ["Sam's Club", "Grocery & Everyday", 244000, 288, 124, 10, 5.7, 79, "prospect", "Costco", 68, "Value warehouse coverage in markets where the premium club has no footprint.", "4% back on club spend", "Value-focused households|Business owners"],
];

const TREND_LABELS = ["Q1", "Q2", "Q3", "Q4"];
const TREND_SHAPES = [
  [0.88, 0.94, 1.0, 1.08],
  [0.96, 1.04, 0.98, 1.06],
  [1.06, 0.98, 0.94, 1.02],
  [0.82, 0.96, 1.1, 1.14],
];

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const NATIONAL_PARTNERS: NationalPartner[] = NATIONAL_SEEDS.map((seed, i) => {
  const [
    brand, category, cardholders, annualSpendM, avgTicket, categorySharePct,
    upliftPct, fitScore, stage, competitor, competitorLeakageM, reason, dealConstruct, cohorts,
  ] = seed;
  const annualSpend = annualSpendM * 1_000_000;
  const estimatedValue = estimatePartnershipValue(annualSpend, upliftPct);
  const shape = TREND_SHAPES[i % TREND_SHAPES.length];
  return {
    id: slug(brand),
    brand,
    category,
    pillar: category,
    cardholders,
    annualSpend,
    avgTicket,
    categorySharePct,
    upliftPct,
    estimatedValue,
    valueLow: Math.round((estimatedValue * 0.78) / 1000) * 1000,
    valueHigh: Math.round((estimatedValue * 1.26) / 1000) * 1000,
    fitScore,
    stage,
    reason,
    dealConstruct,
    competitor,
    competitorLeakage: competitorLeakageM * 1_000_000,
    cohorts: cohorts.split("|"),
    trend: shape.map((m, qi) => ({ label: TREND_LABELS[qi], spend: Math.round((annualSpend / 4) * m) })),
  };
});

/* ------------------------------------------------------------------ */
/* Metros and local partners                                            */
/* ------------------------------------------------------------------ */

export const METROS: Metro[] = [
  { id: "nyc", name: "New York", state: "NY", cardholders: 412000, lat: 40.7295, lng: -73.9670, zoom: 12, neighborhoods: ["SoHo", "Williamsburg", "Upper West Side", "Flatiron", "Astoria", "Park Slope"] },
  { id: "chi", name: "Chicago", state: "IL", cardholders: 268000, lat: 41.9000, lng: -87.6450, zoom: 12, neighborhoods: ["West Loop", "Lincoln Park", "Wicker Park", "Hyde Park", "River North", "Logan Square"] },
  { id: "lax", name: "Los Angeles", state: "CA", cardholders: 344000, lat: 34.0700, lng: -118.3400, zoom: 11, neighborhoods: ["Silver Lake", "Santa Monica", "Culver City", "Highland Park", "Venice", "Pasadena"] },
  { id: "sfo", name: "San Francisco", state: "CA", cardholders: 196000, lat: 37.7680, lng: -122.4400, zoom: 12.5, neighborhoods: ["Mission", "Hayes Valley", "Marina", "SoMa", "Noe Valley", "Richmond"] },
  { id: "bos", name: "Boston", state: "MA", cardholders: 164000, lat: 42.3550, lng: -71.0870, zoom: 12.5, neighborhoods: ["Back Bay", "South End", "Cambridge", "Seaport", "Somerville", "Jamaica Plain"] },
  { id: "mia", name: "Miami", state: "FL", cardholders: 188000, lat: 25.7700, lng: -80.1950, zoom: 12, neighborhoods: ["Wynwood", "Brickell", "Coral Gables", "Little Havana", "Design District", "South Beach"] },
  { id: "dal", name: "Dallas", state: "TX", cardholders: 212000, lat: 32.7900, lng: -96.7900, zoom: 12, neighborhoods: ["Deep Ellum", "Bishop Arts", "Uptown", "Knox-Henderson", "Trinity Groves", "Lakewood"] },
  { id: "hou", name: "Houston", state: "TX", cardholders: 224000, lat: 29.7400, lng: -95.3900, zoom: 12, neighborhoods: ["Montrose", "Heights", "Rice Village", "EaDo", "Midtown", "Galleria"] },
  { id: "sea", name: "Seattle", state: "WA", cardholders: 172000, lat: 47.6350, lng: -122.3400, zoom: 12, neighborhoods: ["Capitol Hill", "Ballard", "Fremont", "Belltown", "Queen Anne", "Georgetown"] },
  { id: "atl", name: "Atlanta", state: "GA", cardholders: 198000, lat: 33.7700, lng: -84.3700, zoom: 11.7, neighborhoods: ["Old Fourth Ward", "Buckhead", "West Midtown", "Decatur", "Virginia-Highland", "East Atlanta"] },
];

type LocalSeed = [name: string, metroId: string, neighborhoodIndex: number, category: string, cardholders: number, annualSpendK: number, avgTicket: number, upliftPct: number, fitScore: number, stage: PartnerStage, reason: string, dealConstruct: string];

const LOCAL_SEEDS: LocalSeed[] = [
  // New York
  ["Russ & Daughters", "nyc", 0, "Dining", 8400, 4200, 46, 9.2, 88, "negotiating", "Weekend brunch anchor — 62% of visitors also spend at two other SoHo partners the same day.", "15% weekend brunch credit"],
  ["Devoción Coffee", "nyc", 1, "Dining", 12600, 2800, 17, 8.4, 84, "outreach", "Daily-habit merchant with 14 visits per cardholder per quarter in Williamsburg.", "Fifth coffee free, merchant-funded"],
  ["Zabar's", "nyc", 2, "Grocery & Everyday", 16800, 9400, 64, 7.1, 86, "prospect", "Neighborhood grocery staple for long-tenured Upper West Side households.", "5% back on weekly grocery run"],
  ["Eataly Flatiron", "nyc", 3, "Dining", 14200, 8600, 78, 8.8, 87, "live", "Combines dining and specialty grocery in one basket, lifting average ticket 2.1x.", "Dining plus market bundle credit"],
  ["Astoria Bookshop", "nyc", 4, "Entertainment", 4200, 680, 32, 9.6, 72, "prospect", "Small but sticky community merchant with high repeat visits from family cohorts.", "$10 credit per $50 spent"],
  ["Blue Marble Ice Cream", "nyc", 5, "Dining", 9800, 1240, 14, 8.2, 74, "prospect", "Family-outing merchant in Park Slope that peaks alongside school-calendar spend.", "Family weekend offer"],
  // Chicago
  ["Publican Quality Meats", "chi", 0, "Dining", 7600, 3900, 62, 9.0, 85, "outreach", "West Loop dining anchor with the highest weekday-evening ticket in the metro.", "10% back on dinner service"],
  ["Sweet Mandy B's", "chi", 1, "Dining", 6400, 980, 22, 8.6, 71, "prospect", "Family-occasion bakery clustered near school and youth-sports spend.", "Birthday-month credit"],
  ["Myopic Books", "chi", 2, "Entertainment", 3800, 420, 26, 9.4, 68, "prospect", "Wicker Park cultural draw that pairs with adjacent dining partners.", "Bundle credit with local dining"],
  ["Valois Cafeteria", "chi", 3, "Dining", 8900, 1680, 19, 7.8, 73, "prospect", "Everyday-value merchant serving the Hyde Park student and staff base.", "Weekday lunch credit"],
  ["Bavette's Bar & Boeuf", "chi", 4, "Dining", 6200, 5400, 118, 9.1, 89, "negotiating", "Top expense-account merchant in River North — 44% of spend is business-owner cards.", "Business-card dining accelerator"],
  ["Logan Hardware", "chi", 5, "Home & Living", 5400, 1120, 38, 8.0, 70, "prospect", "Neighborhood home merchant that fires after local move-in signals.", "Post-move welcome credit"],
  // Los Angeles
  ["Intelligentsia Silver Lake", "lax", 0, "Dining", 13400, 2960, 16, 8.3, 82, "live", "Highest visit frequency in the metro with strong morning-commute cadence.", "Reload-and-earn coffee offer"],
  ["Santa Monica Seafood", "lax", 1, "Grocery & Everyday", 9600, 4800, 68, 7.4, 79, "prospect", "Specialty grocery basket for coastal households with above-average income.", "6% back capped quarterly"],
  ["Father's Office", "lax", 2, "Dining", 7200, 2640, 54, 8.7, 78, "outreach", "Culver City evening anchor with heavy entertainment-adjacent spend.", "Weeknight dining credit"],
  ["Highland Park Bowl", "lax", 3, "Entertainment", 6800, 1840, 48, 9.0, 75, "prospect", "Group-outing venue with tickets 2.4x the local entertainment average.", "Group booking credit"],
  ["Gjusta", "lax", 4, "Dining", 8800, 3120, 42, 8.9, 80, "prospect", "Venice all-day merchant capturing both breakfast and dinner occasions.", "All-day dining multiplier"],
  ["Vroman's Bookstore", "lax", 5, "Entertainment", 5200, 940, 34, 9.2, 71, "prospect", "Pasadena family destination aligned with college-prep spending windows.", "Back-to-school credit"],
  // San Francisco
  ["Tartine Bakery", "sfo", 0, "Dining", 11200, 2480, 21, 8.6, 83, "outreach", "Mission daily-habit merchant with the metro's highest morning frequency.", "Fifth visit free"],
  ["Bi-Rite Market", "sfo", 0, "Grocery & Everyday", 10400, 5600, 58, 7.6, 84, "prospect", "Premium neighborhood grocer with 3.4 visits per cardholder per month.", "5% back on weekly basket"],
  ["Souvla Hayes Valley", "sfo", 1, "Dining", 8600, 2140, 27, 8.4, 78, "prospect", "Fast-casual leader among under-35 tech cardholders.", "Lunch loyalty accelerator"],
  ["Marina Sports Club", "sfo", 2, "Health & Wellness", 4600, 3240, 168, 9.3, 81, "negotiating", "Wellness subscription with 88% retention and strong affluent overlap.", "Membership credit for cardholders"],
  ["SoMa StrEat Food Park", "sfo", 3, "Dining", 7400, 1320, 24, 8.1, 72, "prospect", "Weekday lunch cluster serving the downtown commuter base.", "Weekday lunch offer"],
  ["Noe Valley Pet Co.", "sfo", 4, "Pets & Family", 3400, 860, 62, 9.5, 74, "prospect", "Fires on the new-pet-owner signal within three weeks of first supply purchase.", "First-order credit"],
  // Boston
  ["Flour Bakery", "bos", 1, "Dining", 10800, 2260, 18, 8.5, 82, "live", "Multi-location daily habit with the metro's best repeat rate.", "Reload-and-earn offer"],
  ["Newbury Comics", "bos", 0, "Entertainment", 6200, 1080, 31, 8.8, 71, "prospect", "Back Bay cultural retail with strong student and gift-occasion spend.", "Gift-season credit"],
  ["Cambridge Naturals", "bos", 2, "Health & Wellness", 4800, 1420, 46, 9.1, 76, "prospect", "Wellness merchant aligned with the health-focused behavioral cohort.", "Wellness category boost"],
  ["Row 34 Seaport", "bos", 3, "Dining", 5600, 3480, 96, 8.9, 80, "outreach", "Seaport business-dining anchor with high corporate-card mix.", "Business dining accelerator"],
  ["Union Square Donuts", "bos", 4, "Dining", 7200, 940, 13, 8.0, 69, "prospect", "High-frequency, low-ticket merchant ideal for habit-forming offers.", "Buy 6, get 1 free"],
  ["JP Licks", "bos", 5, "Dining", 8400, 1180, 15, 7.9, 70, "prospect", "Family-occasion merchant that peaks with school-calendar patterns.", "Family weekend offer"],
  // Miami
  ["Zak the Baker", "mia", 0, "Dining", 8200, 1960, 24, 8.7, 79, "prospect", "Wynwood daily-habit anchor with strong weekend visitor overlap.", "Weekend brunch credit"],
  ["Brickell City Centre Market", "mia", 1, "Grocery & Everyday", 12600, 6800, 62, 7.3, 83, "outreach", "Downtown grocery for the metro's highest-income residential cluster.", "5% back on weekly shop"],
  ["Books & Books", "mia", 2, "Entertainment", 5400, 1020, 36, 9.0, 72, "prospect", "Coral Gables cultural institution tied to family and student cohorts.", "Event access for cardholders"],
  ["Versailles Restaurant", "mia", 3, "Dining", 11400, 3240, 32, 8.2, 81, "prospect", "Highest-traffic local dining merchant across all age bands in the metro.", "Family dining credit"],
  ["Design District Wellness", "mia", 4, "Health & Wellness", 3800, 2680, 176, 9.4, 77, "prospect", "Premium wellness subscription with affluent-household concentration.", "Membership credit"],
  ["Pura Vida South Beach", "mia", 5, "Dining", 9600, 2140, 26, 8.4, 75, "prospect", "Health-forward cafe with high repeat visits from the wellness cohort.", "Fifth visit free"],
  // Dallas
  ["Pecan Lodge", "dal", 0, "Dining", 9400, 2980, 38, 8.6, 80, "outreach", "Deep Ellum destination merchant drawing spend from across the metro.", "Weekend dining credit"],
  ["Emporium Pies", "dal", 1, "Dining", 5800, 820, 17, 8.1, 68, "prospect", "Bishop Arts family-occasion merchant with strong weekend cadence.", "Buy 5, get 1 free"],
  ["Uptown Fitness Collective", "dal", 2, "Health & Wellness", 4400, 2860, 152, 9.2, 78, "prospect", "Recurring wellness subscription with high retention among young professionals.", "Membership credit"],
  ["Knox Street Market", "dal", 3, "Grocery & Everyday", 10200, 5240, 58, 7.2, 79, "prospect", "Neighborhood grocer serving the metro's densest affluent cluster.", "5% back on weekly basket"],
  ["Trinity Groves Brewing", "dal", 4, "Entertainment", 6600, 1680, 42, 8.5, 73, "prospect", "Group-occasion venue with tickets well above the local average.", "Group booking credit"],
  ["Lakewood Pet Supply", "dal", 5, "Pets & Family", 3600, 780, 54, 9.3, 71, "prospect", "Triggers on the new-pet-owner signal in a high-family-density area.", "First-order credit"],
  // Houston
  ["Common Bond Montrose", "hou", 0, "Dining", 10600, 2380, 22, 8.4, 80, "live", "Daily-habit bakery cafe with the metro's strongest morning frequency.", "Reload-and-earn offer"],
  ["Heights Mercantile Grocer", "hou", 1, "Grocery & Everyday", 11800, 5960, 61, 7.4, 81, "prospect", "Neighborhood grocery anchor with 3.2 monthly visits per cardholder.", "5% back on groceries"],
  ["Rice Village Books", "hou", 2, "Entertainment", 4600, 720, 29, 9.1, 69, "prospect", "Student and family cultural merchant tied to school-calendar spend.", "Back-to-school credit"],
  ["Truck Yard EaDo", "hou", 3, "Dining", 7800, 1840, 31, 8.3, 74, "prospect", "Group dining venue with heavy weekend and event overlap.", "Group dining credit"],
  ["Midtown Auto Care", "hou", 4, "Auto & Fuel", 5200, 2640, 186, 8.9, 76, "prospect", "Service merchant that fires ahead of the auto-loan renewal window.", "Service credit pre-renewal"],
  ["Galleria Style Studio", "hou", 5, "Retail & Style", 6400, 2180, 96, 8.7, 75, "prospect", "Style-pillar merchant with strong repeat purchase among young professionals.", "Style category multiplier"],
  // Seattle
  ["Victrola Coffee", "sea", 0, "Dining", 12200, 2540, 15, 8.5, 82, "outreach", "Capitol Hill daily habit with the metro's highest visit frequency.", "Fifth coffee free"],
  ["Ballard Farmers Market", "sea", 1, "Grocery & Everyday", 9800, 3120, 42, 7.8, 78, "prospect", "Weekend grocery ritual with strong family and wellness overlap.", "Weekend market credit"],
  ["Fremont Brewing", "sea", 2, "Entertainment", 7600, 1920, 36, 8.6, 75, "prospect", "Group-occasion venue anchoring weekend neighborhood spend.", "Group booking credit"],
  ["Belltown Athletic", "sea", 3, "Health & Wellness", 4200, 2740, 158, 9.2, 77, "prospect", "Wellness subscription with high retention in the downtown cohort.", "Membership credit"],
  ["Queen Anne Book Company", "sea", 4, "Entertainment", 3800, 620, 30, 9.0, 68, "prospect", "Community merchant with reliable repeat family visits.", "$10 per $50 credit"],
  ["Georgetown Trailer Park Mall", "sea", 5, "Retail & Style", 5400, 1180, 44, 8.8, 70, "prospect", "Local retail cluster with weekend-heavy discovery spend.", "Weekend retail credit"],
  // Atlanta
  ["Ponce City Market Grocers", "atl", 0, "Grocery & Everyday", 13600, 6420, 56, 7.5, 84, "negotiating", "Highest-traffic local grocery destination in the metro's densest cluster.", "5% back on weekly basket"],
  ["Buckhead Wellness Club", "atl", 1, "Health & Wellness", 4600, 3180, 168, 9.3, 79, "prospect", "Premium wellness subscription concentrated in affluent households.", "Membership credit"],
  ["West Midtown Design Co.", "atl", 2, "Home & Living", 4800, 2960, 214, 9.1, 78, "prospect", "Home merchant that fires 90 days after local mortgage closings.", "Post-close home credit"],
  ["Decatur Book Exchange", "atl", 3, "Entertainment", 4200, 640, 27, 8.9, 67, "prospect", "Community cultural merchant aligned with family and student cohorts.", "Family credit"],
  ["Virginia-Highland Pet Co.", "atl", 4, "Pets & Family", 3400, 820, 58, 9.4, 72, "prospect", "New-pet-owner trigger merchant in a high-family-density neighborhood.", "First-order credit"],
  ["East Atlanta Auto Works", "atl", 5, "Auto & Fuel", 5600, 2480, 178, 8.7, 74, "prospect", "Service merchant that precedes the auto-loan renewal window by ~4 months.", "Pre-renewal service credit"],
];

/** Deterministic pin placement on the 0-100 street canvas, spread by neighborhood. */
export const NEIGHBORHOOD_ANCHORS: Array<{ x: number; y: number }> = [
  { x: 26, y: 30 },
  { x: 63, y: 24 },
  { x: 78, y: 58 },
  { x: 44, y: 66 },
  { x: 20, y: 72 },
  { x: 55, y: 44 },
];

/** Real neighborhood centers, keyed by `${metroId}:${neighborhood}`. */
export const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  "nyc:SoHo": { lat: 40.7233, lng: -74.0020 },
  "nyc:Williamsburg": { lat: 40.7143, lng: -73.9570 },
  "nyc:Upper West Side": { lat: 40.7870, lng: -73.9754 },
  "nyc:Flatiron": { lat: 40.7401, lng: -73.9903 },
  "nyc:Astoria": { lat: 40.7644, lng: -73.9235 },
  "nyc:Park Slope": { lat: 40.6710, lng: -73.9814 },

  "chi:West Loop": { lat: 41.8827, lng: -87.6505 },
  "chi:Lincoln Park": { lat: 41.9214, lng: -87.6513 },
  "chi:Wicker Park": { lat: 41.9088, lng: -87.6796 },
  "chi:Hyde Park": { lat: 41.7943, lng: -87.5907 },
  "chi:River North": { lat: 41.8924, lng: -87.6341 },
  "chi:Logan Square": { lat: 41.9231, lng: -87.7085 },

  "lax:Silver Lake": { lat: 34.0870, lng: -118.2700 },
  "lax:Santa Monica": { lat: 34.0195, lng: -118.4912 },
  "lax:Culver City": { lat: 34.0211, lng: -118.3965 },
  "lax:Highland Park": { lat: 34.1122, lng: -118.1926 },
  "lax:Venice": { lat: 33.9850, lng: -118.4695 },
  "lax:Pasadena": { lat: 34.1478, lng: -118.1445 },

  "sfo:Mission": { lat: 37.7599, lng: -122.4148 },
  "sfo:Hayes Valley": { lat: 37.7765, lng: -122.4256 },
  "sfo:Marina": { lat: 37.8021, lng: -122.4382 },
  "sfo:SoMa": { lat: 37.7785, lng: -122.4056 },
  "sfo:Noe Valley": { lat: 37.7502, lng: -122.4337 },
  "sfo:Richmond": { lat: 37.7800, lng: -122.4830 },

  "bos:Back Bay": { lat: 42.3503, lng: -71.0810 },
  "bos:South End": { lat: 42.3411, lng: -71.0765 },
  "bos:Cambridge": { lat: 42.3736, lng: -71.1097 },
  "bos:Seaport": { lat: 42.3519, lng: -71.0431 },
  "bos:Somerville": { lat: 42.3876, lng: -71.0995 },
  "bos:Jamaica Plain": { lat: 42.3097, lng: -71.1151 },

  "mia:Wynwood": { lat: 25.8010, lng: -80.1994 },
  "mia:Brickell": { lat: 25.7601, lng: -80.1951 },
  "mia:Coral Gables": { lat: 25.7215, lng: -80.2684 },
  "mia:Little Havana": { lat: 25.7658, lng: -80.2196 },
  "mia:Design District": { lat: 25.8130, lng: -80.1930 },
  "mia:South Beach": { lat: 25.7826, lng: -80.1341 },

  "dal:Deep Ellum": { lat: 32.7840, lng: -96.7784 },
  "dal:Bishop Arts": { lat: 32.7495, lng: -96.8290 },
  "dal:Uptown": { lat: 32.7996, lng: -96.8025 },
  "dal:Knox-Henderson": { lat: 32.8199, lng: -96.7876 },
  "dal:Trinity Groves": { lat: 32.7789, lng: -96.8283 },
  "dal:Lakewood": { lat: 32.8143, lng: -96.7513 },

  "hou:Montrose": { lat: 29.7440, lng: -95.3900 },
  "hou:Heights": { lat: 29.7982, lng: -95.3987 },
  "hou:Rice Village": { lat: 29.7160, lng: -95.4145 },
  "hou:EaDo": { lat: 29.7480, lng: -95.3480 },
  "hou:Midtown": { lat: 29.7373, lng: -95.3769 },
  "hou:Galleria": { lat: 29.7397, lng: -95.4617 },

  "sea:Capitol Hill": { lat: 47.6229, lng: -122.3212 },
  "sea:Ballard": { lat: 47.6685, lng: -122.3843 },
  "sea:Fremont": { lat: 47.6510, lng: -122.3500 },
  "sea:Belltown": { lat: 47.6142, lng: -122.3459 },
  "sea:Queen Anne": { lat: 47.6370, lng: -122.3570 },
  "sea:Georgetown": { lat: 47.5460, lng: -122.3200 },

  "atl:Old Fourth Ward": { lat: 33.7620, lng: -84.3690 },
  "atl:Buckhead": { lat: 33.8484, lng: -84.3733 },
  "atl:West Midtown": { lat: 33.7860, lng: -84.4120 },
  "atl:Decatur": { lat: 33.7748, lng: -84.2963 },
  "atl:Virginia-Highland": { lat: 33.7787, lng: -84.3540 },
  "atl:East Atlanta": { lat: 33.7404, lng: -84.3419 },
};

/** Deterministic sub-neighborhood scatter so pins never stack on one point. */
function scatter(base: { lat: number; lng: number }, i: number) {
  const a = ((i * 137.508) % 360) * (Math.PI / 180);
  const r = 0.0035 + ((i * 31) % 17) * 0.00035;
  return { lat: base.lat + Math.sin(a) * r, lng: base.lng + Math.cos(a) * r * 1.25 };
}

export const LOCAL_PARTNERS: LocalPartner[] = LOCAL_SEEDS.map((seed, i) => {
  const [name, metroId, nIdx, category, cardholders, annualSpendK, avgTicket, upliftPct, fitScore, stage, reason, dealConstruct] = seed;
  const metro = METROS.find((m) => m.id === metroId)!;
  const anchor = NEIGHBORHOOD_ANCHORS[nIdx % NEIGHBORHOOD_ANCHORS.length];
  const jitter = (i * 37) % 11;
  const annualSpend = annualSpendK * 1_000;
  const neighborhood = metro.neighborhoods[nIdx];
  const coords = scatter(
    NEIGHBORHOOD_COORDS[`${metroId}:${neighborhood}`] ?? { lat: metro.lat, lng: metro.lng },
    i,
  );
  return {
    id: `${metroId}-${slug(name)}`,
    name,
    metroId,
    neighborhood,
    category,
    cardholders,
    annualSpend,
    avgTicket,
    upliftPct,
    estimatedValue: estimatePartnershipValue(annualSpend, upliftPct),
    fitScore,
    stage,
    reason,
    dealConstruct,
    x: Math.min(92, Math.max(8, anchor.x + (jitter - 5) * 1.6)),
    y: Math.min(90, Math.max(10, anchor.y + (((i * 53) % 9) - 4) * 1.7)),
    lat: coords.lat,
    lng: coords.lng,
  };
});

export function getLocalPartnersByMetro(metroId: string): LocalPartner[] {
  return LOCAL_PARTNERS.filter((p) => p.metroId === metroId).sort((a, b) => b.estimatedValue - a.estimatedValue);
}

export function getPartnershipSummary() {
  const nationalValue = NATIONAL_PARTNERS.reduce((s, p) => s + p.estimatedValue, 0);
  const localValue = LOCAL_PARTNERS.reduce((s, p) => s + p.estimatedValue, 0);
  const reach = NATIONAL_PARTNERS.reduce((s, p) => s + p.cardholders, 0);
  const inMotion = [...NATIONAL_PARTNERS, ...LOCAL_PARTNERS].filter(
    (p) => p.stage === "negotiating" || p.stage === "contract" || p.stage === "live",
  ).length;
  return {
    partnerCount: NATIONAL_PARTNERS.length + LOCAL_PARTNERS.length,
    nationalCount: NATIONAL_PARTNERS.length,
    localCount: LOCAL_PARTNERS.length,
    totalValue: nationalValue + localValue,
    nationalValue,
    localValue,
    reach,
    inMotion,
  };
}

/* ------------------------------------------------------------------ */
/* Deterministic contact resolution (no LLM, no network)                */
/* ------------------------------------------------------------------ */

export interface BrandContact {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  confidence: number;
  lastVerified: string;
  sources: string[];
  alternate: { name: string; title: string; email: string };
}

const FIRST_NAMES = ["Alexis", "Jordan", "Priya", "Marcus", "Danielle", "Owen", "Camila", "Nathan", "Sasha", "Elliot", "Renee", "Tobias", "Maya", "Grant", "Ingrid", "Devon"];
const LAST_NAMES = ["Whitfield", "Nakamura", "Alvarez", "Okonkwo", "Lindqvist", "Barrera", "Chaudhry", "Feldman", "Moreau", "Kaminski", "Ibrahim", "Delgado", "Yoon", "Prescott", "Santoro", "Brennan"];
const NATIONAL_TITLES = ["VP, Strategic Partnerships", "Head of Financial Services Partnerships", "Director, Card & Loyalty Partnerships", "SVP, Brand Alliances"];
const LOCAL_TITLES = ["Owner / Operator", "General Manager", "Director of Marketing", "Managing Partner"];
const CITY_BY_METRO: Record<string, string> = {
  nyc: "New York, NY", chi: "Chicago, IL", lax: "Los Angeles, CA", sfo: "San Francisco, CA", bos: "Boston, MA",
  mia: "Miami, FL", dal: "Dallas, TX", hou: "Houston, TX", sea: "Seattle, WA", atl: "Atlanta, GA",
};

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

function domainFor(brand: string): string {
  return `${brand.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
}

export function resolveBrandContact(brand: string, scope: "national" | "local", metroId?: string): BrandContact {
  const h = hash(brand);
  const first = FIRST_NAMES[h % FIRST_NAMES.length];
  const last = LAST_NAMES[(h >> 3) % LAST_NAMES.length];
  const altFirst = FIRST_NAMES[(h >> 5) % FIRST_NAMES.length];
  const altLast = LAST_NAMES[((h >> 7) + 5) % LAST_NAMES.length] === last
    ? LAST_NAMES[((h >> 7) + 9) % LAST_NAMES.length]
    : LAST_NAMES[((h >> 7) + 5) % LAST_NAMES.length];
  const titles = scope === "national" ? NATIONAL_TITLES : LOCAL_TITLES;
  const title = titles[(h >> 2) % titles.length];
  const domain = domainFor(brand);
  const confidence = 74 + (h % 22);
  const daysAgo = 2 + (h % 26);
  const verified = new Date(Date.UTC(2026, 7, 17) - daysAgo * 86400000);

  return {
    name: `${first} ${last}`,
    title,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
    phone: `+1 (${200 + (h % 700)}) ${100 + ((h >> 4) % 800)}-${1000 + ((h >> 6) % 8999)}`,
    linkedin: `linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}`,
    location: scope === "local" && metroId ? CITY_BY_METRO[metroId] : ["Seattle, WA", "New York, NY", "Chicago, IL", "Atlanta, GA"][(h >> 8) % 4],
    confidence,
    lastVerified: verified.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    sources: scope === "national"
      ? ["Corporate partnerships directory", "Press release byline match", "Conference speaker listing"]
      : ["Business registration record", "Merchant acquirer contact of record", "Local chamber listing"],
    alternate: {
      name: `${altFirst} ${altLast}`,
      title: scope === "national" ? "Manager, Partner Marketing" : "Assistant Manager",
      email: `${altFirst.toLowerCase()}.${altLast.toLowerCase()}@${domain}`,
    },
  };
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function buildOutreachDraft(args: {
  brand: string;
  contactFirstName: string;
  cardholders: number;
  annualSpend: number;
  estimatedValue: number;
  dealConstruct: string;
  reason: string;
}): string {
  const { brand, contactFirstName, cardholders, annualSpend, estimatedValue, dealConstruct, reason } = args;
  return [
    `Subject: ${brand} x our cardholders — ${usd(estimatedValue)} in incremental annual volume`,
    ``,
    `Hi ${contactFirstName},`,
    ``,
    `${cardholders.toLocaleString("en-US")} of our cardholders already spend at ${brand}, representing ${usd(annualSpend)} in annual volume on our cards.`,
    ``,
    `${reason}`,
    ``,
    `We would like to propose: ${dealConstruct}. Based on comparable programs, we model roughly ${usd(estimatedValue)} of incremental annual value for ${brand}, with placement in our in-app offer wall and targeted delivery to the cohorts most likely to convert.`,
    ``,
    `Open to a 30-minute call in the next two weeks to walk through the audience detail?`,
    ``,
    `Best,`,
    `Partnerships Team`,
  ].join("\n");
}
