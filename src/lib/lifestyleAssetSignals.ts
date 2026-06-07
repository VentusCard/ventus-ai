import { getProductFlow } from "./productAutomatedFlows";
import type { DemographicFilters } from "@/types/segment";

export interface LifestyleAssetSignal {
  id: string;
  label: string;
  description: string;
  detectionRate: number; // share of base population estimated to exhibit this
}

/**
 * Each product gets its own bespoke set of Lifestyle Asset Signals, tuned to
 * the sales motion for that product. Signals are NOT shared across products —
 * a "Country Club Member" signal under Wealth Management is a different chip
 * than a similarly-named one elsewhere (different detection rate, different
 * evidence framing).
 */
export const ASSET_SIGNALS_BY_PRODUCT: Record<string, LifestyleAssetSignal[]> = {
  "wealth-management": [
    { id: "wm-private-banking", label: "Private Banking Indicator", description: "Avg deposit balance sustained > $1M for 6+ months", detectionRate: 0.009 },
    { id: "wm-country-club", label: "Country Club Member", description: "Recurring private club dues in 5-figure annual range", detectionRate: 0.022 },
    { id: "wm-private-aviation", label: "Private Aviation User", description: "Charter operator spend or fractional jet membership", detectionRate: 0.004 },
    { id: "wm-watch-collector", label: "High-End Watch Collector", description: "Authorized dealer spend at Rolex, Patek, AP", detectionRate: 0.007 },
    { id: "wm-charter-yacht", label: "Charter Yacht Activity", description: "Recurring or large charter operator card spend", detectionRate: 0.003 },
    { id: "wm-philanthropy", label: "Major Philanthropic Giver", description: "Aggregate annual giving > $25k across non-profits", detectionRate: 0.016 },
    { id: "wm-equity-comp", label: "Equity Comp Recipient", description: "Recurring RSU vest or ESPP buyback inflows", detectionRate: 0.041 },
    { id: "wm-second-home", label: "Second Home Owner", description: "Two distinct property-tax or HOA recipients", detectionRate: 0.018 },
    { id: "wm-fine-art", label: "Fine Art Buyer", description: "Auction house or gallery spend in 5+ figures", detectionRate: 0.005 },
    { id: "wm-family-office", label: "Family Office Outbound", description: "Outbound ACH to RIA, trust co., or family-office name", detectionRate: 0.011 },
  ],

  "529-plan": [
    { id: "529-newborn", label: "Newborn Household", description: "Baby-care merchant cluster within trailing 6 months", detectionRate: 0.034 },
    { id: "529-pediatric", label: "Pediatric Spend Cluster", description: "Repeat pediatrician copays + infant pharmacy", detectionRate: 0.048 },
    { id: "529-daycare", label: "Daycare ACH", description: "Recurring childcare ACH to daycare or nanny payroll", detectionRate: 0.057 },
    { id: "529-private-school", label: "Private K-12 Family", description: "Tuition ACH to independent or parochial school", detectionRate: 0.029 },
    { id: "529-tutoring", label: "Tutoring & Test Prep", description: "Kumon, Sylvan, SAT/ACT prep, college counselor spend", detectionRate: 0.021 },
    { id: "529-grandparent-gift", label: "Grandparent Gifting Pattern", description: "Recurring outbound transfer to adult child + dependent", detectionRate: 0.018 },
    { id: "529-college-tour", label: "College Tour Travel", description: "University-town hotel + flight cluster", detectionRate: 0.012 },
    { id: "529-youth-activities", label: "Premium Youth Activities", description: "Travel sports, music lessons, summer camp ACH", detectionRate: 0.038 },
  ],

  "heloc": [
    { id: "heloc-renovation", label: "Renovation Spend Surge", description: "Home Depot, Lowe's, contractor ACH cluster > recent baseline", detectionRate: 0.046 },
    { id: "heloc-pool-solar", label: "Pool / Solar Contractor", description: "Specialty contractor ACH (pool, solar, roofing)", detectionRate: 0.014 },
    { id: "heloc-designer", label: "Interior Designer Spend", description: "Designer fees, high-end furniture, custom millwork", detectionRate: 0.011 },
    { id: "heloc-appliances", label: "High-End Appliance Buyer", description: "Sub-Zero, Wolf, Miele authorized dealer spend", detectionRate: 0.007 },
    { id: "heloc-property-tax", label: "Property-Tax Payer", description: "Annual or semi-annual county treasurer ACH", detectionRate: 0.184 },
    { id: "heloc-long-tenure", label: "Long-Tenure Homeowner", description: "Mortgage on file > 5 years with current bank", detectionRate: 0.092 },
    { id: "heloc-landscaping", label: "Recurring Landscaping ACH", description: "Lawn, pool service, or estate maintenance ACH", detectionRate: 0.038 },
  ],

  "auto-loan": [
    { id: "auto-dealer-visits", label: "Repeat Dealer Visits", description: "Card-present spend at dealerships across 2+ weekends", detectionRate: 0.022 },
    { id: "auto-lease-end", label: "Lease-End Window", description: "Captive lender ACH ending in 60–90 days", detectionRate: 0.017 },
    { id: "auto-insurance-shop", label: "Insurance Shop-Around", description: "Multiple insurer one-time charges within 30 days", detectionRate: 0.026 },
    { id: "auto-ev-charging", label: "EV Charging Spend", description: "Tesla supercharger, EVgo, ChargePoint recurring spend", detectionRate: 0.019 },
    { id: "auto-performance", label: "Performance Service Spend", description: "Dealer service + premium fuel at performance brand", detectionRate: 0.012 },
    { id: "auto-relocation", label: "Recent Relocation", description: "Address-change signal + utility setup at new region", detectionRate: 0.024 },
  ],

  "mortgage": [
    { id: "mort-above-rent", label: "Above-Median Renter", description: "Recurring rent ACH > regional 75th percentile", detectionRate: 0.039 },
    { id: "mort-preapproval", label: "Pre-Approval Inquiry", description: "Soft-pull or rate-quote interaction in bank app", detectionRate: 0.014 },
    { id: "mort-downpayment", label: "Down-Payment Accumulator", description: "Sustained savings balance growth + low debt service", detectionRate: 0.028 },
    { id: "mort-wedding", label: "Recently Wed", description: "Wedding vendor cluster within trailing 12 months", detectionRate: 0.011 },
    { id: "mort-relocation", label: "Relocation Spend Pattern", description: "Moving company, U-Haul, new-region utility setup", detectionRate: 0.018 },
    { id: "mort-rate-search", label: "Mortgage Rate Search", description: "Search behavior for mortgage rates in bank web app", detectionRate: 0.021 },
  ],

  "personal-loan": [
    { id: "pl-bnpl", label: "BNPL Stacker", description: "Affirm, Klarna, Afterpay charges across 3+ merchants", detectionRate: 0.063 },
    { id: "pl-util-creep", label: "Card Utilization Creep", description: "Utilization rising for 4+ consecutive cycles", detectionRate: 0.048 },
    { id: "pl-medical", label: "Medical Expense Spike", description: "Hospital or specialty clinic charge outside baseline", detectionRate: 0.026 },
    { id: "pl-wedding", label: "Wedding Vendor Spend", description: "Venue deposit + photographer + caterer cluster", detectionRate: 0.009 },
    { id: "pl-move", label: "Move-Related Spend", description: "Moving company + furniture cluster in trailing 90d", detectionRate: 0.017 },
    { id: "pl-cash-advance", label: "Cash-Advance Recovery", description: "Card cash-advance followed by paycheck-aligned paydown", detectionRate: 0.014 },
  ],

  "high-yield-savings": [
    { id: "hys-idle-whale", label: "Idle Checking Whale", description: "Avg balance > $50k untouched for 90 days", detectionRate: 0.024 },
    { id: "hys-outbound-yield", label: "Outbound Yield-Seeking", description: "Recurring ACH to neobank or money-market app", detectionRate: 0.038 },
    { id: "hys-bonus", label: "Bonus Deposit Recipient", description: "Lump-sum employer inflow > 2× monthly baseline", detectionRate: 0.029 },
    { id: "hys-tax-refund", label: "Tax-Refund Holder", description: "IRS or state refund inflow sitting in checking 60+ days", detectionRate: 0.041 },
    { id: "hys-maturing-cd", label: "Maturing CD Holder", description: "Internal CD maturity within 30–60 days", detectionRate: 0.013 },
    { id: "hys-inheritance", label: "Inheritance-Pattern Inflow", description: "One-time inflow from law firm or estate trust", detectionRate: 0.006 },
  ],

  "travel-card": [
    { id: "tc-multi-airline", label: "Multi-Airline Flyer", description: "Spend across 2+ carriers in trailing 12 months", detectionRate: 0.051 },
    { id: "tc-hotel-diverse", label: "Hotel-Chain Diverse", description: "3+ distinct hotel chains within 6 months", detectionRate: 0.047 },
    { id: "tc-fx", label: "International FX Spend", description: "Foreign-currency spend in trailing 6 months", detectionRate: 0.062 },
    { id: "tc-luxury-hotel", label: "Luxury Hotel Frequent", description: "Four Seasons, Aman, Rosewood, Ritz spend", detectionRate: 0.014 },
    { id: "tc-cruise", label: "Cruise Booker", description: "Premium cruise line deposit or balance payment", detectionRate: 0.018 },
    { id: "tc-lounge-adjacent", label: "Lounge-Adjacent Buyer", description: "Airport premium F&B spend without lounge access", detectionRate: 0.027 },
    { id: "tc-fx-cost", label: "FX Fee Friction", description: "Existing card FX fees > $200 trailing 12 months", detectionRate: 0.034 },
  ],

  "small-business-loan": [
    { id: "sbl-square-stripe", label: "Square / Stripe Depositor", description: "Recurring processor deposits to personal or biz account", detectionRate: 0.022 },
    { id: "sbl-vendor-cluster", label: "Vendor ACH Cluster", description: "5+ distinct business-supplier ACH counterparties", detectionRate: 0.018 },
    { id: "sbl-payroll", label: "Payroll Provider Spend", description: "Gusto, ADP, Rippling recurring debits", detectionRate: 0.013 },
    { id: "sbl-saas-stack", label: "SaaS Stack Buyer", description: "QuickBooks, Slack, Shopify recurring subscriptions", detectionRate: 0.029 },
    { id: "sbl-commercial-lease", label: "Commercial Lease Payer", description: "Recurring lease ACH to commercial landlord", detectionRate: 0.008 },
    { id: "sbl-inventory", label: "Inventory Purchase Pattern", description: "Wholesale or supplier card spend > $5k/mo", detectionRate: 0.011 },
  ],

  "life-insurance": [
    { id: "li-newborn", label: "Newborn Household", description: "Baby-care merchant cluster within trailing 6 months", detectionRate: 0.034 },
    { id: "li-new-mortgage", label: "New Mortgage Holder", description: "Mortgage opened within trailing 12 months", detectionRate: 0.026 },
    { id: "li-single-earner", label: "Single-Earner Household", description: "One W-2 deposit source supporting 2+ dependents", detectionRate: 0.058 },
    { id: "li-estate-attorney", label: "Estate-Attorney Spend", description: "Card or check spend to estate-planning law firm", detectionRate: 0.009 },
    { id: "li-long-term-care", label: "LTC / Caregiver Spend", description: "Recurring senior care or in-home aide ACH", detectionRate: 0.014 },
    { id: "li-recently-wed", label: "Recently Wed", description: "Wedding vendor cluster within trailing 12 months", detectionRate: 0.011 },
  ],
};

const GENERIC_FALLBACK: LifestyleAssetSignal[] = [
  { id: "gen-affluent", label: "Affluent Spend Pattern", description: "Above-region spend baseline across discretionary categories", detectionRate: 0.058 },
  { id: "gen-loyal", label: "Long-Tenure Customer", description: "Account relationship > 7 years", detectionRate: 0.124 },
  { id: "gen-digital", label: "Digital-First Engager", description: "App session frequency > 12 per month", detectionRate: 0.184 },
];

export function getAssetSignalsForProduct(productId: string): LifestyleAssetSignal[] {
  return ASSET_SIGNALS_BY_PRODUCT[productId] ?? GENERIC_FALLBACK;
}

export function findAssetSignal(productId: string, signalId: string): LifestyleAssetSignal | undefined {
  return getAssetSignalsForProduct(productId).find((s) => s.id === signalId);
}

interface EstimateInput {
  productId: string;
  assetSignals: string[];
  lifeEvents: string[];
  pillars: string[];
  demographics: DemographicFilters;
}

const BASE_POPULATION = 250_000_000;

export function estimateAssetSignalAudience({
  productId,
  assetSignals,
  lifeEvents,
  pillars,
  demographics,
}: EstimateInput): number {
  const product = getProductFlow(productId);
  let size = BASE_POPULATION * (product?.penetration ?? 0.05);

  const productSignals = getAssetSignalsForProduct(productId);
  for (const id of assetSignals) {
    const sig = productSignals.find((s) => s.id === id);
    if (sig) size *= sig.detectionRate * 12; // boost: signals strongly correlate with target product
  }

  if (lifeEvents.length > 0) size *= 0.55 + lifeEvents.length * 0.08;
  if (pillars.length > 0) size *= 0.55 + pillars.length * 0.06;

  if (demographics.ageRanges.length > 0 && demographics.ageRanges.length < 6) {
    size *= demographics.ageRanges.length / 6;
  }
  if (demographics.incomeBands.length > 0 && demographics.incomeBands.length < 4) {
    size *= demographics.incomeBands.length / 4;
  }
  if (demographics.regions.length > 0 && demographics.regions.length < 6) {
    size *= demographics.regions.length / 6;
  }
  if (demographics.accountTenure && demographics.accountTenure !== "all") {
    size *= 0.4;
  }

  return Math.max(0, Math.floor(size));
}
