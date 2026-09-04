export interface JourneyProduct {
  name: string;
  category: JourneyCategory;
  penetrationRate: number;
  customerCount: number;
  revenuePerCustomer: number;
  nextProductOpportunities: string[];
}

export type JourneyCategory =
  | 'credit_cards'
  | 'deposit_accounts'
  | 'loans_lending'
  | 'investment_products'
  | 'insurance'
  | 'digital_services'
  | 'wealth_management'
  | 'estate_trust';

export interface JourneyCategoryMeta {
  id: JourneyCategory;
  label: string;
  color: string;        // tailwind bg class token
  textColor: string;     // tailwind text class token
  iconName: string;      // lucide icon name for display
}

export const JOURNEY_CATEGORIES: JourneyCategoryMeta[] = [
  { id: 'credit_cards', label: 'Credit Cards', color: 'bg-blue-50', textColor: 'text-blue-700', iconName: 'CreditCard' },
  { id: 'deposit_accounts', label: 'Deposit Accounts', color: 'bg-emerald-50', textColor: 'text-emerald-700', iconName: 'Landmark' },
  { id: 'loans_lending', label: 'Loans & Lending', color: 'bg-amber-50', textColor: 'text-amber-700', iconName: 'HandCoins' },
  { id: 'investment_products', label: 'Investment Products', color: 'bg-violet-50', textColor: 'text-violet-700', iconName: 'TrendingUp' },
  { id: 'insurance', label: 'Insurance', color: 'bg-rose-50', textColor: 'text-rose-700', iconName: 'ShieldCheck' },
  { id: 'digital_services', label: 'Digital Services', color: 'bg-cyan-50', textColor: 'text-cyan-700', iconName: 'Smartphone' },
  { id: 'wealth_management', label: 'Wealth Management', color: 'bg-indigo-50', textColor: 'text-indigo-700', iconName: 'Crown' },
  { id: 'estate_trust', label: 'Estate & Trust', color: 'bg-purple-50', textColor: 'text-purple-700', iconName: 'Scale' },
];

export const JOURNEY_PRODUCTS: JourneyProduct[] = [
  // ── Credit Cards (12) ──
  { name: 'Basic Cashback', category: 'credit_cards', penetrationRate: 32, customerCount: 21_824_000, revenuePerCustomer: 180, nextProductOpportunities: ['Custom Cashback', 'Travel Rewards'] },
  { name: 'Custom Cashback', category: 'credit_cards', penetrationRate: 14, customerCount: 9_548_000, revenuePerCustomer: 240, nextProductOpportunities: ['Travel Rewards', 'Premium Travel'] },
  { name: 'Travel Rewards', category: 'credit_cards', penetrationRate: 18, customerCount: 12_276_000, revenuePerCustomer: 320, nextProductOpportunities: ['Premium Travel', 'Airline Co-Brand'] },
  { name: 'Airline Co-Brand', category: 'credit_cards', penetrationRate: 8, customerCount: 5_456_000, revenuePerCustomer: 280, nextProductOpportunities: ['Premium Travel', 'Hotel Co-Brand'] },
  { name: 'Hotel Co-Brand', category: 'credit_cards', penetrationRate: 6, customerCount: 4_092_000, revenuePerCustomer: 260, nextProductOpportunities: ['Premium Travel'] },
  { name: 'Premium Travel', category: 'credit_cards', penetrationRate: 4, customerCount: 2_728_000, revenuePerCustomer: 550, nextProductOpportunities: ['Managed Portfolio', 'Private Banking'] },
  { name: 'Student Card', category: 'credit_cards', penetrationRate: 10, customerCount: 6_820_000, revenuePerCustomer: 80, nextProductOpportunities: ['Basic Cashback', 'Savings'] },
  { name: 'Secured Card', category: 'credit_cards', penetrationRate: 7, customerCount: 4_774_000, revenuePerCustomer: 60, nextProductOpportunities: ['Basic Cashback'] },
  { name: 'Business Card', category: 'credit_cards', penetrationRate: 12, customerCount: 8_184_000, revenuePerCustomer: 420, nextProductOpportunities: ['Business Line of Credit', 'Small Business Loan'] },
  { name: 'Co-Branded Retail', category: 'credit_cards', penetrationRate: 9, customerCount: 6_138_000, revenuePerCustomer: 150, nextProductOpportunities: ['Custom Cashback', 'Travel Rewards'] },
  { name: 'Balance Transfer', category: 'credit_cards', penetrationRate: 5, customerCount: 3_410_000, revenuePerCustomer: 120, nextProductOpportunities: ['Basic Cashback', 'Personal Loan'] },
  { name: 'World Elite', category: 'credit_cards', penetrationRate: 2, customerCount: 1_364_000, revenuePerCustomer: 850, nextProductOpportunities: ['Private Banking', 'Managed Portfolio'] },

  // ── Deposit Accounts (10) ──
  { name: 'Checking', category: 'deposit_accounts', penetrationRate: 78, customerCount: 53_196_000, revenuePerCustomer: 90, nextProductOpportunities: ['Savings', 'Basic Cashback'] },
  { name: 'Savings', category: 'deposit_accounts', penetrationRate: 62, customerCount: 42_284_000, revenuePerCustomer: 65, nextProductOpportunities: ['High-Yield Savings', 'CD'] },
  { name: 'High-Yield Savings', category: 'deposit_accounts', penetrationRate: 15, customerCount: 10_230_000, revenuePerCustomer: 110, nextProductOpportunities: ['Money Market', 'Brokerage'] },
  { name: 'Money Market', category: 'deposit_accounts', penetrationRate: 8, customerCount: 5_456_000, revenuePerCustomer: 140, nextProductOpportunities: ['CD', 'Brokerage'] },
  { name: 'Certificate of Deposit', category: 'deposit_accounts', penetrationRate: 12, customerCount: 8_184_000, revenuePerCustomer: 130, nextProductOpportunities: ['Traditional IRA', 'Brokerage'] },
  { name: 'Business Checking', category: 'deposit_accounts', penetrationRate: 10, customerCount: 6_820_000, revenuePerCustomer: 200, nextProductOpportunities: ['Business Savings', 'Business Card'] },
  { name: 'Business Savings', category: 'deposit_accounts', penetrationRate: 6, customerCount: 4_092_000, revenuePerCustomer: 120, nextProductOpportunities: ['Business Line of Credit', 'Small Business Loan'] },
  { name: 'Youth / Teen Account', category: 'deposit_accounts', penetrationRate: 5, customerCount: 3_410_000, revenuePerCustomer: 25, nextProductOpportunities: ['Checking', 'Student Card'] },
  { name: 'HSA', category: 'deposit_accounts', penetrationRate: 4, customerCount: 2_728_000, revenuePerCustomer: 95, nextProductOpportunities: ['High-Yield Savings', 'Traditional IRA'] },
  { name: 'Safe Deposit Box', category: 'deposit_accounts', penetrationRate: 3, customerCount: 2_046_000, revenuePerCustomer: 75, nextProductOpportunities: ['Trust Account', 'Home Insurance'] },

  // ── Loans & Lending (10) ──
  { name: 'Personal Loan', category: 'loans_lending', penetrationRate: 14, customerCount: 9_548_000, revenuePerCustomer: 350, nextProductOpportunities: ['Debt Consolidation', 'Home Mortgage'] },
  { name: 'Auto Loan', category: 'loans_lending', penetrationRate: 18, customerCount: 12_276_000, revenuePerCustomer: 420, nextProductOpportunities: ['Auto Insurance', 'Home Mortgage'] },
  { name: 'Home Mortgage', category: 'loans_lending', penetrationRate: 22, customerCount: 15_004_000, revenuePerCustomer: 1_200, nextProductOpportunities: ['HELOC', 'Home Insurance'] },
  { name: 'HELOC', category: 'loans_lending', penetrationRate: 8, customerCount: 5_456_000, revenuePerCustomer: 480, nextProductOpportunities: ['Home Mortgage Refi', 'Brokerage'] },
  { name: 'Student Loan Refi', category: 'loans_lending', penetrationRate: 5, customerCount: 3_410_000, revenuePerCustomer: 280, nextProductOpportunities: ['Personal Loan', 'Savings'] },
  { name: 'Small Business Loan', category: 'loans_lending', penetrationRate: 4, customerCount: 2_728_000, revenuePerCustomer: 900, nextProductOpportunities: ['Business Line of Credit', 'Business Checking'] },
  { name: 'Business Line of Credit', category: 'loans_lending', penetrationRate: 6, customerCount: 4_092_000, revenuePerCustomer: 650, nextProductOpportunities: ['Small Business Loan', 'Business Card'] },
  { name: 'Debt Consolidation', category: 'loans_lending', penetrationRate: 6, customerCount: 4_092_000, revenuePerCustomer: 300, nextProductOpportunities: ['Personal Loan', 'Basic Cashback'] },
  { name: 'Home Mortgage Refi', category: 'loans_lending', penetrationRate: 7, customerCount: 4_774_000, revenuePerCustomer: 800, nextProductOpportunities: ['HELOC', 'Home Insurance'] },
  { name: 'Construction Loan', category: 'loans_lending', penetrationRate: 1, customerCount: 682_000, revenuePerCustomer: 1_800, nextProductOpportunities: ['Home Mortgage', 'Home Insurance'] },

  // ── Investment Products (9) ──
  { name: 'Brokerage', category: 'investment_products', penetrationRate: 12, customerCount: 8_184_000, revenuePerCustomer: 380, nextProductOpportunities: ['Robo-Advisor', 'Managed Portfolio'] },
  { name: 'Traditional IRA', category: 'investment_products', penetrationRate: 15, customerCount: 10_230_000, revenuePerCustomer: 220, nextProductOpportunities: ['Roth IRA', 'Brokerage'] },
  { name: 'Roth IRA', category: 'investment_products', penetrationRate: 10, customerCount: 6_820_000, revenuePerCustomer: 200, nextProductOpportunities: ['Brokerage', '529 Plan'] },
  { name: '529 Plan', category: 'investment_products', penetrationRate: 4, customerCount: 2_728_000, revenuePerCustomer: 150, nextProductOpportunities: ['Education Trust', 'Life Insurance'] },
  { name: 'Robo-Advisor', category: 'investment_products', penetrationRate: 6, customerCount: 4_092_000, revenuePerCustomer: 160, nextProductOpportunities: ['Managed Portfolio', 'Brokerage'] },
  { name: 'Managed Portfolio', category: 'investment_products', penetrationRate: 3, customerCount: 2_046_000, revenuePerCustomer: 1_400, nextProductOpportunities: ['Private Banking', 'Trust Account'] },
  { name: 'Annuity', category: 'investment_products', penetrationRate: 2, customerCount: 1_364_000, revenuePerCustomer: 600, nextProductOpportunities: ['Life Insurance', 'Managed Portfolio'] },
  { name: 'Education Trust', category: 'investment_products', penetrationRate: 1, customerCount: 682_000, revenuePerCustomer: 500, nextProductOpportunities: ['529 Plan', 'Trust Account'] },
  { name: 'SEP IRA', category: 'investment_products', penetrationRate: 2, customerCount: 1_364_000, revenuePerCustomer: 250, nextProductOpportunities: ['Brokerage', 'Small Business Loan'] },

  // ── Insurance (7) ──
  { name: 'Life Insurance', category: 'insurance', penetrationRate: 18, customerCount: 12_276_000, revenuePerCustomer: 320, nextProductOpportunities: ['Annuity', 'Trust Account'] },
  { name: 'Home Insurance', category: 'insurance', penetrationRate: 20, customerCount: 13_640_000, revenuePerCustomer: 280, nextProductOpportunities: ['Life Insurance', 'Umbrella Policy'] },
  { name: 'Auto Insurance', category: 'insurance', penetrationRate: 25, customerCount: 17_050_000, revenuePerCustomer: 240, nextProductOpportunities: ['Home Insurance', 'Life Insurance'] },
  { name: 'Travel Insurance', category: 'insurance', penetrationRate: 5, customerCount: 3_410_000, revenuePerCustomer: 90, nextProductOpportunities: ['Travel Rewards', 'Premium Travel'] },
  { name: 'Identity Theft Protection', category: 'insurance', penetrationRate: 8, customerCount: 5_456_000, revenuePerCustomer: 110, nextProductOpportunities: ['Digital Wallet', 'Life Insurance'] },
  { name: 'Umbrella Policy', category: 'insurance', penetrationRate: 3, customerCount: 2_046_000, revenuePerCustomer: 180, nextProductOpportunities: ['Managed Portfolio', 'Trust Account'] },
  { name: 'Disability Insurance', category: 'insurance', penetrationRate: 4, customerCount: 2_728_000, revenuePerCustomer: 200, nextProductOpportunities: ['Life Insurance', 'Traditional IRA'] },

  // ── Digital Services (8) ──
  { name: 'Mobile Banking', category: 'digital_services', penetrationRate: 65, customerCount: 44_330_000, revenuePerCustomer: 15, nextProductOpportunities: ['Digital Wallet', 'Zelle/P2P'] },
  { name: 'Digital Wallet', category: 'digital_services', penetrationRate: 35, customerCount: 23_870_000, revenuePerCustomer: 25, nextProductOpportunities: ['Travel Rewards', 'Basic Cashback'] },
  { name: 'Zelle / P2P', category: 'digital_services', penetrationRate: 40, customerCount: 27_280_000, revenuePerCustomer: 10, nextProductOpportunities: ['Direct Deposit', 'Bill Pay'] },
  { name: 'Direct Deposit', category: 'digital_services', penetrationRate: 55, customerCount: 37_510_000, revenuePerCustomer: 45, nextProductOpportunities: ['Savings', 'Basic Cashback'] },
  { name: 'Bill Pay', category: 'digital_services', penetrationRate: 30, customerCount: 20_460_000, revenuePerCustomer: 20, nextProductOpportunities: ['Direct Deposit', 'Checking'] },
  { name: 'Overdraft Protection', category: 'digital_services', penetrationRate: 22, customerCount: 15_004_000, revenuePerCustomer: 55, nextProductOpportunities: ['Personal Loan', 'Savings'] },
  { name: 'Wire / ACH Services', category: 'digital_services', penetrationRate: 8, customerCount: 5_456_000, revenuePerCustomer: 60, nextProductOpportunities: ['Business Checking', 'Foreign Exchange'] },
  { name: 'Foreign Exchange', category: 'digital_services', penetrationRate: 2, customerCount: 1_364_000, revenuePerCustomer: 120, nextProductOpportunities: ['Travel Rewards', 'Wire / ACH Services'] },

  // ── Wealth Management (6) ──
  { name: 'Financial Advisory', category: 'wealth_management', penetrationRate: 5, customerCount: 3_410_000, revenuePerCustomer: 2_400, nextProductOpportunities: ['Managed Portfolio', 'Private Banking'] },
  { name: 'Private Banking', category: 'wealth_management', penetrationRate: 2, customerCount: 1_364_000, revenuePerCustomer: 5_200, nextProductOpportunities: ['Trust Account', 'Estate Planning'] },
  { name: 'Tax Planning', category: 'wealth_management', penetrationRate: 3, customerCount: 2_046_000, revenuePerCustomer: 1_800, nextProductOpportunities: ['Financial Advisory', 'Managed Portfolio'] },
  { name: 'Charitable Giving', category: 'wealth_management', penetrationRate: 1, customerCount: 682_000, revenuePerCustomer: 900, nextProductOpportunities: ['Trust Account', 'Estate Planning'] },
  { name: 'Family Office Services', category: 'wealth_management', penetrationRate: 0.5, customerCount: 341_000, revenuePerCustomer: 12_000, nextProductOpportunities: ['Estate Planning', 'Trust Account'] },
  { name: 'Concierge Banking', category: 'wealth_management', penetrationRate: 1, customerCount: 682_000, revenuePerCustomer: 3_500, nextProductOpportunities: ['Private Banking', 'Family Office Services'] },

  // ── Estate & Trust (5) ──
  { name: 'Trust Account', category: 'estate_trust', penetrationRate: 2, customerCount: 1_364_000, revenuePerCustomer: 3_200, nextProductOpportunities: ['Estate Planning', 'Family Office Services'] },
  { name: 'Estate Planning', category: 'estate_trust', penetrationRate: 1.5, customerCount: 1_023_000, revenuePerCustomer: 4_500, nextProductOpportunities: ['Trust Account', 'Life Insurance'] },
  { name: 'Irrevocable Trust', category: 'estate_trust', penetrationRate: 0.8, customerCount: 545_600, revenuePerCustomer: 5_000, nextProductOpportunities: ['Estate Planning', 'Charitable Giving'] },
  { name: 'Guardianship Services', category: 'estate_trust', penetrationRate: 0.3, customerCount: 204_600, revenuePerCustomer: 2_800, nextProductOpportunities: ['Trust Account', 'Life Insurance'] },
  { name: 'Succession Planning', category: 'estate_trust', penetrationRate: 0.4, customerCount: 272_800, revenuePerCustomer: 6_000, nextProductOpportunities: ['Family Office Services', 'Irrevocable Trust'] },
];

// ── Helpers ──

export function getJourneyProductsByCategory(category: JourneyCategory): JourneyProduct[] {
  return JOURNEY_PRODUCTS.filter(p => p.category === category);
}

export function getCategorySummary(category: JourneyCategory) {
  const products = getJourneyProductsByCategory(category);
  const totalCustomers = products.reduce((s, p) => s + p.customerCount, 0);
  const avgRevenue = products.length > 0
    ? Math.round(products.reduce((s, p) => s + p.revenuePerCustomer, 0) / products.length)
    : 0;
  const topOpportunity = products.reduce((best, p) =>
    p.nextProductOpportunities.length > 0 && p.customerCount > (best?.customerCount || 0) ? p : best,
    products[0]
  );
  return { productCount: products.length, totalCustomers, avgRevenue, topOpportunity };
}

export function getJourneySummaryStats() {
  const totalProducts = JOURNEY_PRODUCTS.length;
  const avgProductsPerCustomer = 3.4; // mock bank-wide average
  const totalRevenuePipeline = JOURNEY_PRODUCTS.reduce(
    (s, p) => s + p.customerCount * p.revenuePerCustomer * 0.02, // 2% conversion assumption
    0
  );
  // find the single biggest next-product opportunity by volume
  const opportunityCounts: Record<string, number> = {};
  JOURNEY_PRODUCTS.forEach(p => {
    p.nextProductOpportunities.forEach(opp => {
      opportunityCounts[opp] = (opportunityCounts[opp] || 0) + p.customerCount;
    });
  });
  const topCrossSell = Object.entries(opportunityCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    totalProducts,
    avgProductsPerCustomer,
    totalRevenuePipeline,
    topCrossSellProduct: topCrossSell?.[0] || '',
    topCrossSellVolume: topCrossSell?.[1] || 0,
  };
}
