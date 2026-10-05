import type { RickyTransaction } from "@/lib/deckmoRickyTransactions";

export type RickyTier = "Budget" | "Standard" | "Premium" | "N/A";
export type RickyFrequency = "Weekly" | "Monthly" | "Occasional" | "Annually" | "One-Time";

export interface RickyEnrichment {
  merchant: string;
  pillar: string;
  category: string;
  subcategories: string[];
  tier: RickyTier;
  frequency: RickyFrequency;
  confidence: number;
}

type Rule = [match: string, enrichment: RickyEnrichment];
const e = (merchant: string, pillar: string, category: string, subcategories: string[], tier: RickyTier, frequency: RickyFrequency, confidence: number): RickyEnrichment =>
  ({ merchant, pillar, category, subcategories, tier, frequency, confidence });

const SPORT = "Sports & Active Living";
const TRAVEL = "Travel & Exploration";
const FOOD = "Food & Dining";
const HOME = "Home & Living";
const FIN = "Financial & Aspirational";
const INCOME = "Income & Inflows";
const ENT = "Entertainment & Culture";
const TECH = "Technology & Digital Life";

// Ordered: first match wins. Curated for Ricky's static deck ledger.
const RULES: Rule[] = [
  ["HAWAIIAN AIR INFLIGHT", e("Hawaiian Airlines", TRAVEL, "Air Travel", ["In-flight", "Hawaii Trip"], "Standard", "Annually", 0.95)],
  ["HAWAIIAN AIR", e("Hawaiian Airlines", TRAVEL, "Air Travel", ["Airfare", "Hawaii Trip"], "Premium", "Annually", 0.98)],
  ["SFO INTL TERM LOUNGE", e("SFO Terminal Lounge", TRAVEL, "Airport", ["Lounge"], "Premium", "Occasional", 0.93)],
  ["WAILEA BCH RESORT", e("Wailea Beach Resort", TRAVEL, "Lodging", ["Resort", "Hawaii Trip"], "Premium", "Annually", 0.98)],
  ["GRAND HYATT KAUAI", e("Grand Hyatt Kauai", TRAVEL, "Lodging", ["Resort", "Hawaii Trip"], "Premium", "Annually", 0.98)],
  ["ISLAND CAR RENTAL", e("Island Car Rental", TRAVEL, "Ground Transport", ["Car Rental", "Hawaii Trip"], "Standard", "Annually", 0.95)],
  ["MAMAS FISH HOUSE", e("Mama's Fish House", FOOD, "Restaurants", ["Fine Dining", "Hawaii Trip"], "Premium", "Annually", 0.96)],
  ["MOLOKINI SNORKEL", e("Molokini Snorkel", TRAVEL, "Experiences", ["Snorkel Tour", "Hawaii Trip"], "Premium", "Annually", 0.94)],
  ["MAUI SURF", e("Maui Surf Rentals", SPORT, "Water Sports", ["Surf Rental", "Hawaii Trip"], "Standard", "Annually", 0.93)],
  ["LUAU KALAMAKU", e("Luau Kalamaku", TRAVEL, "Experiences", ["Luau", "Hawaii Trip"], "Premium", "Annually", 0.95)],
  ["KAUAI COFFEE", e("Kauai Coffee Farm", TRAVEL, "Experiences", ["Farm Tour", "Hawaii Trip"], "Standard", "Annually", 0.92)],
  ["ALLIANZ TRAVEL", e("Allianz Travel Insurance", TRAVEL, "Travel Protection", ["Trip Insurance"], "Standard", "Annually", 0.94)],
  ["CHECK #1051 CITY TENNIS", e("City Tennis Center", SPORT, "Racquet Sports", ["Annual Dues", "Tennis"], "Premium", "Annually", 0.97)],
  ["CITY TENNIS CTR", e("City Tennis Center", SPORT, "Racquet Sports", ["Court Fees", "Tennis"], "Premium", "Weekly", 0.98)],
  ["COURTRESERVE", e("CourtReserve", SPORT, "Racquet Sports", ["Court Booking", "Tennis"], "Standard", "Weekly", 0.95)],
  ["BAY INDOOR COURTS", e("Bay Indoor Courts", SPORT, "Racquet Sports", ["Indoor Court", "Tennis"], "Standard", "Occasional", 0.95)],
  ["COURTSIDE PRO SHOP", e("Courtside Pro Shop", SPORT, "Equipment", ["Racquets", "Tennis"], "Premium", "Occasional", 0.96)],
  ["RACKET SPORTS CLUB", e("Racket Sports Club", SPORT, "Racquet Sports", ["Club Play", "Tennis"], "Premium", "Weekly", 0.96)],
  ["STRING LAB", e("String Lab", SPORT, "Equipment", ["Restringing", "Tennis"], "Standard", "Occasional", 0.94)],
  ["USTA", e("USTA NorCal", SPORT, "Competitions", ["Tournament Entry", "Tennis"], "Standard", "Occasional", 0.97)],
  ["TENNIS WAREHOUSE", e("Tennis Warehouse", SPORT, "Apparel & Gear", ["Shoes", "Tennis"], "Standard", "Occasional", 0.96)],
  ["COACHING", e("Daniel K. Coaching", SPORT, "Lessons", ["Private Coaching", "Tennis"], "Premium", "Monthly", 0.9)],
  ["FID BKG", e("Fidelity Brokerage", FIN, "Investing", ["Brokerage Transfer"], "N/A", "Monthly", 0.97)],
  ["STRIPE PAYOUT", e("Stripe", INCOME, "Business Income", ["Merchant Payout"], "N/A", "Weekly", 0.97)],
  ["GUSTO", e("Gusto", FIN, "Business Operations", ["Payroll"], "N/A", "Monthly", 0.96)],
  ["BENCH ACCOUNTING", e("Bench Accounting", FIN, "Business Operations", ["Bookkeeping"], "Standard", "Monthly", 0.95)],
  ["PACIFIC OFFICE SUPPLY", e("Pacific Office Supply", FIN, "Business Operations", ["Office Supplies"], "Standard", "Occasional", 0.92)],
  ["TRAVELERS INS COMM", e("Travelers Insurance", FIN, "Business Operations", ["Commercial Insurance"], "N/A", "Monthly", 0.95)],
  ["COMCAST BUSINESS", e("Comcast Business", FIN, "Business Operations", ["Internet"], "Standard", "Monthly", 0.96)],
  ["DK CROWN", e("DraftKings", ENT, "Gaming", ["Sports Betting"], "N/A", "Weekly", 0.97)],
  ["PACIFIC TITLE ESCROW", e("Pacific Title & Escrow", HOME, "Home Purchase", ["Escrow Deposit"], "N/A", "One-Time", 0.97)],
  ["HOME INSPECTION", e("Premier Home Inspection", HOME, "Home Purchase", ["Inspection"], "Standard", "One-Time", 0.95)],
  ["MTG APPRAISAL", e("First Republic Mortgage", HOME, "Home Purchase", ["Appraisal"], "N/A", "One-Time", 0.95)],
  ["BAY AREA APPRAISAL", e("Bay Area Appraisal", HOME, "Home Purchase", ["Appraisal"], "N/A", "One-Time", 0.94)],
  ["ARCHITECTURAL REVIEW", e("Architectural Review", HOME, "Home Purchase", ["Design Review"], "Premium", "One-Time", 0.9)],
  ["PROPERTY ATTORNEY", e("Property Attorney", HOME, "Home Purchase", ["Legal"], "Premium", "One-Time", 0.92)],
  ["NORTHSTAR MOVING", e("Northstar Moving", HOME, "Moving", ["Movers Deposit"], "Standard", "One-Time", 0.94)],
  ["BAYSIDE PROP MGMT", e("Bayside Property Mgmt", HOME, "Housing", ["Rent"], "Premium", "Monthly", 0.97)],
  ["PG&E", e("PG&E", HOME, "Utilities", ["Electric & Gas"], "Standard", "Monthly", 0.98)],
  ["DESIGN WITHIN REACH", e("Design Within Reach", HOME, "Furnishings", ["Furniture"], "Premium", "Occasional", 0.96)],
  ["IRS USATAXPYMT", e("IRS", FIN, "Taxes", ["Estimated Tax"], "N/A", "Occasional", 0.98)],
  ["CHEWY", e("Chewy", "Pets", "Pet Supplies", ["Food & Supplies"], "Premium", "Monthly", 0.97)],
  ["PETCO", e("Petco", "Pets", "Pet Supplies", ["Food & Supplies"], "Standard", "Occasional", 0.96)],
  ["ANIMAL HOSP", e("Mid-Peninsula Animal Hospital", "Pets", "Pet Health", ["Veterinary"], "Premium", "Occasional", 0.95)],
  ["WHOLEFDS", e("Whole Foods Market", FOOD, "Grocery", ["Natural & Organic"], "Premium", "Weekly", 0.98)],
  ["TRADER JOES", e("Trader Joe's", FOOD, "Grocery", ["Specialty Grocery"], "Standard", "Weekly", 0.98)],
  ["TARGET", e("Target", HOME, "General", ["Big-Box Retail"], "Standard", "Occasional", 0.94)],
  ["COSTCO", e("Costco", HOME, "General", ["Warehouse Club"], "Standard", "Monthly", 0.95)],
  ["FOUR SEASONS", e("Four Seasons Silicon Valley", FOOD, "Restaurants", ["Fine Dining"], "Premium", "Occasional", 0.93)],
  ["STARBUCKS", e("Starbucks", FOOD, "Coffee", ["Cafe"], "Budget", "Weekly", 0.98)],
  ["SHELL OIL", e("Shell", TRAVEL, "Auto", ["Fuel"], "Standard", "Weekly", 0.97)],
  ["UBER", e("Uber", TRAVEL, "Ground Transport", ["Rideshare"], "Standard", "Occasional", 0.97)],
  ["SPOTIFY", e("Spotify", ENT, "Streaming", ["Music"], "Standard", "Monthly", 0.99)],
  ["APPLE.COM/BILL", e("Apple", TECH, "Digital Services", ["Subscriptions"], "Standard", "Monthly", 0.97)],
  ["CVS", e("CVS Pharmacy", "Health & Wellness", "Pharmacy", ["Personal Care"], "Standard", "Occasional", 0.96)],
  ["NORDSTROM", e("Nordstrom", "Style & Beauty", "Apparel", ["Department Store"], "Premium", "Occasional", 0.96)],
  ["BOOKS INC", e("Books Inc.", ENT, "Books", ["Bookstore"], "Standard", "Occasional", 0.95)],
  ["ZELLE PAYMENT TO", e("Peer Transfer", "Family & Community", "P2P", ["Shared Expense"], "N/A", "Occasional", 0.85)],
];

const FALLBACK = e("Unclassified", "Miscellaneous & Unclassified", "General", ["Review"], "N/A", "Occasional", 0.6);

export function enrichRickyTransaction(transaction: RickyTransaction): RickyEnrichment {
  const description = transaction.description.toUpperCase();
  const hit = RULES.find(([match]) => description.includes(match));
  if (!hit) return FALLBACK;
  const [, enrichment] = hit;
  if (enrichment.merchant === "Peer Transfer") {
    const name = transaction.description.replace(/^ZELLE PAYMENT TO\s+/i, "").replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase());
    return { ...enrichment, merchant: `Zelle · ${name}` };
  }
  return enrichment;
}
