import type { CatalogProduct, StrategyChip, CampaignGoal, MetroArea, ProductCategory } from '@/types/campaign-studio';

export const BASE_USERS = BOOK_CUSTOMERS;

// ─── Full Banking Product Catalog (44 products) ───

export const PRODUCT_CATALOG: CatalogProduct[] = [
  // Credit Cards (10)
  { name: 'Cashback (3/2/1)', category: 'credit_cards', penetrationRate: 32 },
  { name: 'Custom Cashback', category: 'credit_cards', penetrationRate: 14 },
  { name: 'Travel', category: 'credit_cards', penetrationRate: 18 },
  { name: 'Airline', category: 'credit_cards', penetrationRate: 8 },
  { name: 'Hotel', category: 'credit_cards', penetrationRate: 6 },
  { name: 'Premium Travel', category: 'credit_cards', penetrationRate: 4 },
  { name: 'Student', category: 'credit_cards', penetrationRate: 10 },
  { name: 'Secured', category: 'credit_cards', penetrationRate: 7 },
  { name: 'Business', category: 'credit_cards', penetrationRate: 12 },
  { name: 'Co-Branded Retail', category: 'credit_cards', penetrationRate: 9 },

  // Deposit Accounts (8)
  { name: 'Checking', category: 'deposit_accounts', penetrationRate: 78 },
  { name: 'Savings', category: 'deposit_accounts', penetrationRate: 62 },
  { name: 'High-Yield Savings', category: 'deposit_accounts', penetrationRate: 15 },
  { name: 'Money Market', category: 'deposit_accounts', penetrationRate: 8 },
  { name: 'CD', category: 'deposit_accounts', penetrationRate: 12 },
  { name: 'Business Checking', category: 'deposit_accounts', penetrationRate: 10 },
  { name: 'Business Savings', category: 'deposit_accounts', penetrationRate: 6 },
  { name: 'Youth/Teen', category: 'deposit_accounts', penetrationRate: 5 },

  // Loans (8)
  { name: 'Personal Loan', category: 'loans', penetrationRate: 14 },
  { name: 'Auto Loan', category: 'loans', penetrationRate: 18 },
  { name: 'Home Mortgage', category: 'loans', penetrationRate: 22 },
  { name: 'HELOC', category: 'loans', penetrationRate: 8 },
  { name: 'Student Loan Refi', category: 'loans', penetrationRate: 5 },
  { name: 'Small Business Loan', category: 'loans', penetrationRate: 4 },
  { name: 'Line of Credit', category: 'loans', penetrationRate: 10 },
  { name: 'Debt Consolidation', category: 'loans', penetrationRate: 6 },

  // Investment Products (7)
  { name: 'Brokerage', category: 'investments', penetrationRate: 12 },
  { name: 'Traditional IRA', category: 'investments', penetrationRate: 15 },
  { name: 'Roth IRA', category: 'investments', penetrationRate: 10 },
  { name: '529 Plan', category: 'investments', penetrationRate: 4 },
  { name: 'Robo-Advisor', category: 'investments', penetrationRate: 6 },
  { name: 'Managed Portfolio', category: 'investments', penetrationRate: 3 },
  { name: 'Trust Account', category: 'investments', penetrationRate: 2 },

  // Insurance (5)
  { name: 'Life Insurance', category: 'insurance', penetrationRate: 18 },
  { name: 'Home Insurance', category: 'insurance', penetrationRate: 20 },
  { name: 'Auto Insurance', category: 'insurance', penetrationRate: 25 },
  { name: 'Travel Insurance', category: 'insurance', penetrationRate: 5 },
  { name: 'Identity Theft Protection', category: 'insurance', penetrationRate: 8 },

  // Digital Services (6)
  { name: 'Mobile Banking Active', category: 'digital_services', penetrationRate: 65 },
  { name: 'Digital Wallet', category: 'digital_services', penetrationRate: 35 },
  { name: 'Zelle/P2P Active', category: 'digital_services', penetrationRate: 40 },
  { name: 'Direct Deposit Active', category: 'digital_services', penetrationRate: 55 },
  { name: 'Bill Pay Active', category: 'digital_services', penetrationRate: 30 },
  { name: 'Overdraft Protection', category: 'digital_services', penetrationRate: 22 },
];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  credit_cards: 'Credit Cards',
  deposit_accounts: 'Deposit Accounts',
  loans: 'Loans',
  investments: 'Investment Products',
  insurance: 'Insurance',
  digital_services: 'Digital Services',
};

export function getProductsByCategory(category: ProductCategory) {
  return PRODUCT_CATALOG.filter(p => p.category === category);
}

// ─── Lifestyle Pillars ───

export const LIFESTYLE_PILLARS = [
  'Travel & Exploration', 'Food & Dining', 'Health & Wellness',
  'Sports & Active Living', 'Entertainment & Media', 'Fashion & Beauty',
  'Home & Garden', 'Pets', 'Education & Learning', 'Family & Kids',
  'Technology & Gaming', 'Financial & Aspirational',
];

// ─── Cross-Sell Strategies ───

export const CROSS_SELL_STRATEGIES: StrategyChip[] = [
  { id: 'basic_to_premium', label: 'Has basic, lacks premium', description: 'Upgrade path' },
  { id: 'cards_no_deposit', label: 'Has cards, lacks deposit', description: 'Deepen relationship' },
  { id: 'deposit_no_cards', label: 'Has deposit, lacks cards', description: 'Activation play' },
  { id: 'personal_no_business', label: 'Has personal, lacks business', description: 'Business banking' },
  { id: 'single_product', label: 'Single product holder', description: 'Expansion' },
  { id: 'dormant_reactivation', label: 'Dormant account reactivation', description: 'Re-engage' },
];

export const UPSELL_STRATEGIES: StrategyChip[] = [
  { id: 'tier_upgrade', label: 'Tier upgrade eligible', description: 'Move to higher tier' },
  { id: 'balance_growth', label: 'Balance growth potential', description: 'Increase deposits' },
  { id: 'fee_waiver', label: 'Fee waiver candidates', description: 'Retention via fee relief' },
  { id: 'loyalty_advancement', label: 'Loyalty tier advancement', description: 'Reward loyalty' },
  { id: 'annual_fee_justify', label: 'Annual fee justification', description: 'Demonstrate value' },
];

// ─── Campaign Goals ───

export const CAMPAIGN_GOALS: CampaignGoal[] = [
  { id: 'acquisition', label: 'Acquisition', icon: 'UserPlus' },
  { id: 'cross_sell', label: 'Cross-Sell', icon: 'ArrowRightLeft' },
  { id: 'upsell', label: 'Upsell', icon: 'TrendingUp' },
  { id: 'retention', label: 'Retention', icon: 'ShieldCheck' },
  { id: 'reactivation', label: 'Reactivation', icon: 'RefreshCw' },
  { id: 'seasonal', label: 'Seasonal Promotion', icon: 'Calendar' },
  { id: 'life_event', label: 'Life Event Response', icon: 'Sparkles' },
  { id: 'brand_awareness', label: 'Brand Awareness', icon: 'Megaphone' },
];

// ─── Metro Areas (Top 20) ───

export const METRO_AREAS: MetroArea[] = [
  { id: 'nyc', name: 'New York', region: 'Northeast', population: 20_140_000 },
  { id: 'la', name: 'Los Angeles', region: 'West', population: 13_200_000 },
  { id: 'chi', name: 'Chicago', region: 'Midwest', population: 9_460_000 },
  { id: 'dfw', name: 'Dallas-Fort Worth', region: 'Southwest', population: 7_640_000 },
  { id: 'hou', name: 'Houston', region: 'Southwest', population: 7_120_000 },
  { id: 'dc', name: 'Washington D.C.', region: 'Northeast', population: 6_380_000 },
  { id: 'mia', name: 'Miami', region: 'Southeast', population: 6_170_000 },
  { id: 'phi', name: 'Philadelphia', region: 'Northeast', population: 6_250_000 },
  { id: 'atl', name: 'Atlanta', region: 'Southeast', population: 6_090_000 },
  { id: 'bos', name: 'Boston', region: 'Northeast', population: 4_940_000 },
  { id: 'phx', name: 'Phoenix', region: 'Southwest', population: 4_950_000 },
  { id: 'sf', name: 'San Francisco', region: 'West', population: 4_750_000 },
  { id: 'riv', name: 'Riverside', region: 'West', population: 4_650_000 },
  { id: 'det', name: 'Detroit', region: 'Midwest', population: 4_340_000 },
  { id: 'sea', name: 'Seattle', region: 'Northwest', population: 4_020_000 },
  { id: 'msp', name: 'Minneapolis', region: 'Midwest', population: 3_690_000 },
  { id: 'sd', name: 'San Diego', region: 'West', population: 3_340_000 },
  { id: 'tb', name: 'Tampa', region: 'Southeast', population: 3_220_000 },
  { id: 'den', name: 'Denver', region: 'West', population: 2_970_000 },
  { id: 'stl', name: 'St. Louis', region: 'Midwest', population: 2_810_000 },
];

export const AREA_TYPES = ['All', 'Urban', 'Suburban', 'Rural'] as const;

// ─── Audience Estimation ───

const LIFE_EVENT_RATES: Record<string, number> = {
  retirement: 0.042, education: 0.038, family: 0.055,
  home: 0.032, elder_care: 0.028, business: 0.018, wealth_transfer: 0.022,
};

const THRESHOLD_MULTIPLIERS: Record<string, number> = {
  top_10: 0.10, top_20: 0.20, top_30: 0.30, above_average: 0.50,
};

const REGION_RATES: Record<string, number> = {
  Northeast: 0.17, Southeast: 0.24, Midwest: 0.21,
  Southwest: 0.12, West: 0.18, Northwest: 0.08,
};

const AGE_RATES: Record<string, number> = {
  '18-24': 0.12, '25-34': 0.18, '35-44': 0.17,
  '45-54': 0.17, '55-64': 0.16, '65+': 0.20,
};

const STRATEGY_MULTIPLIERS: Record<string, number> = {
  basic_to_premium: 0.15, cards_no_deposit: 0.12, deposit_no_cards: 0.18,
  personal_no_business: 0.08, single_product: 0.22, dormant_reactivation: 0.10,
  tier_upgrade: 0.14, balance_growth: 0.20, fee_waiver: 0.12,
  loyalty_advancement: 0.08, annual_fee_justify: 0.06,
};

export interface StudioEstimationInput {
  selectedPillars: string[];
  lifeEventTypes: string[];
  selectedProducts: Record<string, 'has' | 'lacks'>;
  selectedRegions: string[];
  selectedMetros: string[];
  areaType: string;
  crossSellStrategies: string[];
  upsellStrategies: string[];
  demographicAgeRanges: string[];
  demographicIncomeBands: string[];
  demographicAccountTenure: string;
}

export function estimateStudioAudienceSize(input: StudioEstimationInput): number {
  let multiplier = 1.0;
  let hasAnySelection = false;

  // Life events
  if (input.lifeEventTypes.length > 0) {
    hasAnySelection = true;
    const eventMult = input.lifeEventTypes.reduce((sum, e) => sum + (LIFE_EVENT_RATES[e] || 0.03), 0);
    multiplier *= eventMult;
  }

  // Lifestyle pillars
  if (input.selectedPillars.length > 0) {
    hasAnySelection = true;
    const pillarFactor = Math.pow(0.20, input.selectedPillars.length * 0.3);
    multiplier *= pillarFactor;
  }

  // Products
  const hasProducts = Object.entries(input.selectedProducts).filter(([, m]) => m === 'has');
  const lacksProducts = Object.entries(input.selectedProducts).filter(([, m]) => m === 'lacks');
  if (hasProducts.length > 0) {
    hasAnySelection = true;
    const avgPenetration = hasProducts.reduce((sum, [name]) => {
      const p = PRODUCT_CATALOG.find(c => c.name === name);
      return sum + ((p?.penetrationRate || 10) / 100);
    }, 0) / hasProducts.length;
    multiplier *= avgPenetration;
    if (lacksProducts.length > 0) multiplier *= 0.7;
  }

  // Regions
  if (input.selectedRegions.length > 0 && input.selectedRegions.length < 6) {
    hasAnySelection = true;
    const regionMult = input.selectedRegions.reduce((sum, r) => sum + (REGION_RATES[r] || 0.15), 0);
    multiplier *= regionMult;
  }

  // Metros (narrow further)
  if (input.selectedMetros.length > 0) {
    multiplier *= Math.min(1, input.selectedMetros.length * 0.08);
  }

  // Area type
  if (input.areaType && input.areaType !== 'All') {
    multiplier *= 0.35;
  }

  // Strategies
  const allStrategies = [...input.crossSellStrategies, ...input.upsellStrategies];
  if (allStrategies.length > 0) {
    hasAnySelection = true;
    const stratMult = allStrategies.reduce((sum, s) => sum + (STRATEGY_MULTIPLIERS[s] || 0.10), 0);
    multiplier *= stratMult;
  }

  // Demographics
  if (input.demographicAgeRanges.length > 0 && input.demographicAgeRanges.length < 6) {
    const ageMult = input.demographicAgeRanges.reduce((sum, a) => sum + (AGE_RATES[a] || 0.16), 0);
    multiplier *= ageMult;
  }
  if (input.demographicIncomeBands.length > 0 && input.demographicIncomeBands.length < 4) {
    multiplier *= input.demographicIncomeBands.length * 0.25;
  }
  if (input.demographicAccountTenure !== 'all') {
    multiplier *= 0.35;
  }

  if (!hasAnySelection) return 0;

  const estimated = Math.floor(BASE_USERS * multiplier);
  return Math.max(10_000, Math.min(estimated, BASE_USERS));
}
