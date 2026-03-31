// Financial Vulnerability Indicators - Mock Data & Logic

export type RiskLevel = 'green' | 'monitor' | 'alert' | 'critical';
export type TrendDirection = 'growing' | 'stable' | 'shrinking';
export type ConfidenceLevel = 'Confirmed' | 'High' | 'Probable';
export type ActionStatus = 'pending' | 'in_progress' | 'completed';

export interface FVICohort {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  totalPortfolioPercent: number;
  trend: TrendDirection;
  trendPercent: number;
  avgFviScore: number;
  topCategories: string[];
  recommendedActions: RecommendedAction[];
  color: string;
}

export interface RecommendedAction {
  id: string;
  description: string;
  owner: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FVICustomer {
  id: string;
  name: string;
  cohortIds: string[];
  incomeBand: string;
  accountType: string;
  state: string;
  tenure: string;
  incomeEstimate: number | null;
  monthlySpend: MonthlySpend[];
  fviScore: number;
  riskLevel: RiskLevel;
}

export interface MonthlySpend {
  month: string;
  gambling: number;
  paydayLending: number;
  adultContent: number;
  cashAdvances: number;
  alcoholTobacco: number;
}

export interface MerchantMapping {
  rawDescriptor: string;
  ventusIdentification: string;
  confidence: ConfidenceLevel;
  category: string;
}

export interface CohortTrendPoint {
  month: string;
  customerCount: number;
  avgCategorySpend: number;
}

export interface SubSegmentBreakdown {
  label: string;
  count: number;
  percent: number;
}

export interface ThresholdConfig {
  spend: { monitor: number; alert: number; critical: number };
  incomePct: { monitor: number; alert: number; critical: number };
  velocity: { monitor: number; alert: number; critical: number };
}

export interface FVIConfig {
  thresholds: Record<string, ThresholdConfig>;
  weights: Record<string, number>;
  cohortRules: {
    distressCascadeCombinations: string[];
    newPatternMinAmount: number;
    outlierSigma: number;
    recoveryMonths: number;
  };
}

// Risk level colors
export const RISK_COLORS: Record<RiskLevel, string> = {
  green: '#22C55E',
  monitor: '#EAB308',
  alert: '#F97316',
  critical: '#EF4444',
};

export const getRiskLevel = (score: number): RiskLevel => {
  if (score <= 25) return 'green';
  if (score <= 50) return 'monitor';
  if (score <= 75) return 'alert';
  return 'critical';
};

export const getRiskColor = (score: number): string => RISK_COLORS[getRiskLevel(score)];

export const getTrendIcon = (trend: TrendDirection): string => {
  if (trend === 'growing') return '↗';
  if (trend === 'shrinking') return '↘';
  return '→';
};

// Default configuration
export const defaultConfig: FVIConfig = {
  thresholds: {
    gambling: { spend: { monitor: 200, alert: 500, critical: 1000 }, incomePct: { monitor: 5, alert: 10, critical: 20 }, velocity: { monitor: 50, alert: 100, critical: 150 } },
    paydayLending: { spend: { monitor: 200, alert: 500, critical: 1000 }, incomePct: { monitor: 5, alert: 10, critical: 20 }, velocity: { monitor: 50, alert: 100, critical: 150 } },
    adultContent: { spend: { monitor: 100, alert: 300, critical: 600 }, incomePct: { monitor: 3, alert: 7, critical: 15 }, velocity: { monitor: 50, alert: 100, critical: 150 } },
    cashAdvances: { spend: { monitor: 200, alert: 500, critical: 1000 }, incomePct: { monitor: 5, alert: 10, critical: 20 }, velocity: { monitor: 50, alert: 100, critical: 150 } },
    alcoholTobacco: { spend: { monitor: 150, alert: 400, critical: 800 }, incomePct: { monitor: 5, alert: 10, critical: 20 }, velocity: { monitor: 50, alert: 100, critical: 150 } },
  },
  weights: { gambling: 30, paydayLending: 20, cashAdvances: 20, adultContent: 10, alcoholTobacco: 10, other: 10 },
  cohortRules: {
    distressCascadeCombinations: ['gambling', 'cashAdvances', 'paydayLending'],
    newPatternMinAmount: 100,
    outlierSigma: 3,
    recoveryMonths: 2,
  },
};

// Cohorts
export const cohorts: FVICohort[] = [
  {
    id: 'gambling-escalators',
    name: 'Gambling Escalators',
    description: 'Customers with accelerating gambling spend over 3+ months',
    customerCount: 89,
    totalPortfolioPercent: 0.69,
    trend: 'growing',
    trendPercent: 18,
    avgFviScore: 72,
    topCategories: ['Online Sportsbooks', 'Casino Platforms', 'Lottery'],
    color: '#EF4444',
    recommendedActions: [
      { id: 'ge-1', description: 'Trigger financial wellness check-in via relationship manager', owner: 'Relationship Manager', priority: 'high' },
      { id: 'ge-2', description: 'Enroll in responsible gambling resource program (opt-in)', owner: 'Marketing', priority: 'medium' },
      { id: 'ge-3', description: 'Review credit line exposure for high-balance customers', owner: 'Risk Team', priority: 'high' },
    ],
  },
  {
    id: 'high-risk-lending',
    name: 'High-Risk Lending Dependent',
    description: 'Customers with recurring payday loan, rent-to-own, or high-interest lending activity',
    customerCount: 134,
    totalPortfolioPercent: 1.04,
    trend: 'stable',
    trendPercent: 0,
    avgFviScore: 61,
    topCategories: ['Payday Loans', 'Rent-to-Own', 'Earned Wage Access'],
    color: '#F97316',
    recommendedActions: [
      { id: 'hrl-1', description: 'Offer lower-cost credit alternatives (personal loan pre-qualification)', owner: 'Product Team', priority: 'high' },
      { id: 'hrl-2', description: 'Route to financial coaching program', owner: 'Relationship Manager', priority: 'medium' },
      { id: 'hrl-3', description: 'Flag for responsible lending review if customer has bank credit products', owner: 'Risk Team', priority: 'high' },
    ],
  },
  {
    id: 'financial-distress',
    name: 'Financial Distress Cascade',
    description: 'Customers showing simultaneous signals across multiple vulnerability categories',
    customerCount: 23,
    totalPortfolioPercent: 0.18,
    trend: 'growing',
    trendPercent: 8,
    avgFviScore: 88,
    topCategories: ['Gambling + Cash Advances', 'Overdrafts', 'Payday Loans'],
    color: '#EF4444',
    recommendedActions: [
      { id: 'fd-1', description: 'Priority outreach by relationship manager within 5 business days', owner: 'Relationship Manager', priority: 'high' },
      { id: 'fd-2', description: 'Offer hardship program enrollment', owner: 'Operations', priority: 'high' },
      { id: 'fd-3', description: 'Temporarily flag for credit line increase holds', owner: 'Risk Team', priority: 'high' },
    ],
  },
  {
    id: 'new-pattern',
    name: 'New Pattern Emergence',
    description: 'Customers who just started spending in a vulnerability category for the first time',
    customerCount: 47,
    totalPortfolioPercent: 0.37,
    trend: 'stable',
    trendPercent: 2,
    avgFviScore: 38,
    topCategories: ['First-time Gambling (62%)', 'Payday Loans', 'Cash Advances'],
    color: '#EAB308',
    recommendedActions: [
      { id: 'np-1', description: 'Add to monitoring watchlist (no customer-facing action yet)', owner: 'Analytics', priority: 'low' },
      { id: 'np-2', description: 'Set automated alert if spend exceeds $500 or continues for 3+ months', owner: 'Analytics', priority: 'medium' },
    ],
  },
  {
    id: 'cohort-outliers',
    name: 'Cohort Outliers',
    description: 'Customers whose sensitive spending is statistically unusual for their income/demographic band',
    customerCount: 31,
    totalPortfolioPercent: 0.24,
    trend: 'shrinking',
    trendPercent: 5,
    avgFviScore: 65,
    topCategories: ['Varies by Individual', 'Statistical Anomalies'],
    color: '#F97316',
    recommendedActions: [
      { id: 'co-1', description: 'Review for potential fraud (unusual patterns may indicate compromised accounts)', owner: 'Fraud Team', priority: 'high' },
      { id: 'co-2', description: 'If confirmed as customer behavior, route to appropriate wellness program', owner: 'Relationship Manager', priority: 'medium' },
    ],
  },
  {
    id: 'recovery-trajectory',
    name: 'Recovery Trajectory',
    description: 'Previously flagged customers whose vulnerability spending is now declining',
    customerCount: 56,
    totalPortfolioPercent: 0.44,
    trend: 'growing',
    trendPercent: 22,
    avgFviScore: 34,
    topCategories: ['Gambling (Recovery)', 'Payday Loans (Declining)'],
    color: '#22C55E',
    recommendedActions: [
      { id: 'rt-1', description: 'Positive reinforcement touchpoint (congratulatory messaging via app/email)', owner: 'Marketing', priority: 'medium' },
      { id: 'rt-2', description: 'Offer savings or budgeting tool enrollment', owner: 'Product Team', priority: 'medium' },
      { id: 'rt-3', description: 'Continue monitoring — relapse patterns are common in months 3-6', owner: 'Analytics', priority: 'low' },
    ],
  },
  {
    id: 'low-level-recreational',
    name: 'Low-Level Recreational',
    description: 'Customers with detectable but non-concerning levels of sensitive spending',
    customerCount: 1247,
    totalPortfolioPercent: 9.71,
    trend: 'stable',
    trendPercent: 1,
    avgFviScore: 12,
    topCategories: ['Occasional Sportsbook', 'Social Alcohol', 'Lottery'],
    color: '#22C55E',
    recommendedActions: [
      { id: 'llr-1', description: 'No action required — baseline monitoring only', owner: 'Analytics', priority: 'low' },
    ],
  },
];

// Merchant mappings
export const merchantMappings: MerchantMapping[] = [
  { rawDescriptor: 'Fenix International Ltd', ventusIdentification: 'OnlyFans', confidence: 'Confirmed', category: 'Adult Content' },
  { rawDescriptor: 'MG Billing MT', ventusIdentification: 'MindGeek (Pornhub)', confidence: 'Confirmed', category: 'Adult Content' },
  { rawDescriptor: 'Epoch.com *8827', ventusIdentification: 'Adult Content Processor', confidence: 'High', category: 'Adult Content' },
  { rawDescriptor: 'CCBill.com', ventusIdentification: 'Adult Content Processor', confidence: 'Confirmed', category: 'Adult Content' },
  { rawDescriptor: 'Segpay *2941', ventusIdentification: 'Adult Content Processor', confidence: 'Confirmed', category: 'Adult Content' },
  { rawDescriptor: 'TSG Interactive', ventusIdentification: 'PokerStars', confidence: 'Confirmed', category: 'Gambling' },
  { rawDescriptor: 'Flutter Ent.', ventusIdentification: 'FanDuel / Betfair', confidence: 'Confirmed', category: 'Gambling' },
  { rawDescriptor: 'BetMGM Inc', ventusIdentification: 'BetMGM Sportsbook', confidence: 'Confirmed', category: 'Gambling' },
  { rawDescriptor: 'CRWN Gaming LLC', ventusIdentification: 'Offshore Casino', confidence: 'High', category: 'Gambling' },
  { rawDescriptor: 'Paysafe Prepaid', ventusIdentification: 'Probable Gambling Load', confidence: 'Probable', category: 'Gambling' },
  { rawDescriptor: 'GreenDot Reload', ventusIdentification: 'Probable Gambling/Prepaid Load', confidence: 'Probable', category: 'Gambling' },
  { rawDescriptor: 'DraftKings Inc', ventusIdentification: 'DraftKings Sportsbook', confidence: 'Confirmed', category: 'Gambling' },
  { rawDescriptor: 'CURO Group Holdings', ventusIdentification: 'Speedy Cash / Rapid Cash', confidence: 'Confirmed', category: 'Payday Lending' },
  { rawDescriptor: 'OppFi Inc', ventusIdentification: 'High-Interest Lender', confidence: 'Confirmed', category: 'Payday Lending' },
  { rawDescriptor: 'PROG Holdings', ventusIdentification: 'Progressive Leasing', confidence: 'Confirmed', category: 'Rent-to-Own' },
  { rawDescriptor: 'Avant LLC', ventusIdentification: 'Online Lender', confidence: 'Confirmed', category: 'Payday Lending' },
  { rawDescriptor: 'Marlin Finance', ventusIdentification: 'Debt Servicer', confidence: 'High', category: 'Payday Lending' },
  { rawDescriptor: 'PayActiv Inc', ventusIdentification: 'Earned Wage Access', confidence: 'Confirmed', category: 'Payday Lending' },
  { rawDescriptor: 'Enova International', ventusIdentification: 'Online Lending', confidence: 'Confirmed', category: 'Payday Lending' },
  { rawDescriptor: 'FanDuel Group', ventusIdentification: 'Sports Gambling', confidence: 'Confirmed', category: 'Gambling' },
];

// Generate mock customers
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const states = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
const incomeBands = ['<$30K', '$30K–$75K', '$75K–$150K', '$150K+'];
const accountTypes = ['Checking', 'Savings', 'Credit Card', 'Premier'];
const tenures = ['<1 year', '1-5 years', '5+ years'];
const months = ['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateCustomersForCohort(cohortId: string, count: number): FVICustomer[] {
  const rand = seededRandom(cohortId.length * 1000 + count);
  const customers: FVICustomer[] = [];

  for (let i = 0; i < count; i++) {
    const hasIncome = rand() > 0.3;
    const incomeBand = incomeBands[Math.floor(rand() * incomeBands.length)];
    let incomeEstimate: number | null = null;
    if (hasIncome) {
      if (incomeBand === '<$30K') incomeEstimate = 20000 + Math.floor(rand() * 10000);
      else if (incomeBand === '$30K–$75K') incomeEstimate = 35000 + Math.floor(rand() * 40000);
      else if (incomeBand === '$75K–$150K') incomeEstimate = 80000 + Math.floor(rand() * 70000);
      else incomeEstimate = 155000 + Math.floor(rand() * 100000);
    }

    const baseGambling = cohortId === 'gambling-escalators' ? 300 + rand() * 700 : cohortId === 'financial-distress' ? 200 + rand() * 500 : rand() * 100;
    const basePayday = cohortId === 'high-risk-lending' ? 200 + rand() * 600 : cohortId === 'financial-distress' ? 150 + rand() * 400 : rand() * 50;
    const baseCashAdv = cohortId === 'financial-distress' ? 100 + rand() * 300 : rand() * 80;
    const recoveryFactor = cohortId === 'recovery-trajectory';
    const lowLevel = cohortId === 'low-level-recreational';

    const monthlySpend: MonthlySpend[] = months.map((month, mi) => {
      const growthFactor = cohortId === 'gambling-escalators' ? 1 + mi * 0.15 : cohortId === 'new-pattern' ? (mi < 3 ? 0 : 1 + (mi - 3) * 0.3) : 1;
      const declineFactor = recoveryFactor ? Math.max(0.2, 1 - mi * 0.15) : 1;
      const scale = lowLevel ? 0.15 : 1;

      return {
        month,
        gambling: Math.round((baseGambling * growthFactor * declineFactor * scale + rand() * 50) * 100) / 100,
        paydayLending: Math.round((basePayday * declineFactor * scale + rand() * 30) * 100) / 100,
        adultContent: Math.round((rand() * 40 * scale) * 100) / 100,
        cashAdvances: Math.round((baseCashAdv * declineFactor * scale + rand() * 20) * 100) / 100,
        alcoholTobacco: Math.round((rand() * 60 * scale) * 100) / 100,
      };
    });

    const latestSpend = monthlySpend[monthlySpend.length - 1];
    const totalSensitive = latestSpend.gambling + latestSpend.paydayLending + latestSpend.adultContent + latestSpend.cashAdvances + latestSpend.alcoholTobacco;
    const incomePct = incomeEstimate ? (totalSensitive / (incomeEstimate / 12)) * 100 : 0;

    let score: number;
    if (cohortId === 'financial-distress') score = 75 + Math.floor(rand() * 25);
    else if (cohortId === 'gambling-escalators') score = 55 + Math.floor(rand() * 30);
    else if (cohortId === 'high-risk-lending') score = 45 + Math.floor(rand() * 30);
    else if (cohortId === 'cohort-outliers') score = 50 + Math.floor(rand() * 25);
    else if (cohortId === 'new-pattern') score = 25 + Math.floor(rand() * 25);
    else if (cohortId === 'recovery-trajectory') score = 20 + Math.floor(rand() * 25);
    else score = 5 + Math.floor(rand() * 20);

    customers.push({
      id: `FVI-${cohortId.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      name: `${firstNames[Math.floor(rand() * firstNames.length)]} ${lastNames[Math.floor(rand() * lastNames.length)]}`,
      cohortIds: [cohortId],
      incomeBand,
      accountType: accountTypes[Math.floor(rand() * accountTypes.length)],
      state: states[Math.floor(rand() * states.length)],
      tenure: tenures[Math.floor(rand() * tenures.length)],
      incomeEstimate,
      monthlySpend,
      fviScore: score,
      riskLevel: getRiskLevel(score),
    });
  }

  return customers;
}

// Pre-generate customers for all cohorts
const cohortCustomerMap: Record<string, FVICustomer[]> = {};
cohorts.forEach(c => {
  const count = c.id === 'low-level-recreational' ? 25 : Math.min(c.customerCount, 25);
  cohortCustomerMap[c.id] = generateCustomersForCohort(c.id, count);
});

export const getCustomersForCohort = (cohortId: string): FVICustomer[] => {
  return cohortCustomerMap[cohortId] || [];
};

export const getCohortTrend = (cohortId: string): CohortTrendPoint[] => {
  const cohort = cohorts.find(c => c.id === cohortId);
  if (!cohort) return [];
  const rand = seededRandom(cohortId.length * 500);
  const baseCount = cohort.customerCount;

  return months.map((month, i) => {
    const trendFactor = cohort.trend === 'growing' ? 1 - (5 - i) * 0.04 : cohort.trend === 'shrinking' ? 1 + (5 - i) * 0.03 : 1 + (rand() - 0.5) * 0.05;
    const avgSpend = cohort.avgFviScore * 8 + rand() * 200;
    return {
      month,
      customerCount: Math.round(baseCount * trendFactor),
      avgCategorySpend: Math.round(avgSpend),
    };
  });
};

export const getSubSegmentBreakdown = (cohortId: string, dimension: 'income' | 'account' | 'geography' | 'tenure'): SubSegmentBreakdown[] => {
  const customers = getCustomersForCohort(cohortId);
  const keyFn: Record<string, (c: FVICustomer) => string> = {
    income: c => c.incomeBand,
    account: c => c.accountType,
    geography: c => c.state,
    tenure: c => c.tenure,
  };
  const counts: Record<string, number> = {};
  customers.forEach(c => {
    const key = keyFn[dimension](c);
    counts[key] = (counts[key] || 0) + 1;
  });
  const total = customers.length;
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
};

export const getCohortMetrics = (cohortId: string) => {
  const customers = getCustomersForCohort(cohortId);
  if (customers.length === 0) return { avgMonthlySpend: 0, avgIncomePct: 0, avgVelocity: 0, avgFrequency: 0 };

  let totalSpend = 0, totalPct = 0, pctCount = 0, totalVelocity = 0;
  customers.forEach(c => {
    const latest = c.monthlySpend[c.monthlySpend.length - 1];
    const prev = c.monthlySpend[c.monthlySpend.length - 2];
    const spend = latest.gambling + latest.paydayLending + latest.adultContent + latest.cashAdvances + latest.alcoholTobacco;
    const prevSpend = prev.gambling + prev.paydayLending + prev.adultContent + prev.cashAdvances + prev.alcoholTobacco;
    totalSpend += spend;
    if (c.incomeEstimate) { totalPct += (spend / (c.incomeEstimate / 12)) * 100; pctCount++; }
    if (prevSpend > 0) totalVelocity += ((spend - prevSpend) / prevSpend) * 100;
  });

  return {
    avgMonthlySpend: Math.round(totalSpend / customers.length),
    avgIncomePct: pctCount > 0 ? Math.round((totalPct / pctCount) * 10) / 10 : 0,
    avgVelocity: Math.round((totalVelocity / customers.length) * 10) / 10,
    avgFrequency: cohortId === 'gambling-escalators' ? 14 : cohortId === 'financial-distress' ? 22 : cohortId === 'high-risk-lending' ? 8 : 4,
  };
};

// Sensitivity Matrix types and data
export interface SensitivityCategory {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  flaggedCustomers: number;
  avgMonthlySpend: number;
  momVelocity: number;
  pctOfIncome: number;
  escalationRate: number;
  interventionCoverage: number;
}

export interface SensitivityTier {
  tier: 1 | 2 | 3;
  label: string;
  description: string;
  categories: SensitivityCategory[];
}

export const matrixThresholds = {
  flaggedCustomers: { green: 20, yellow: 50, orange: 100 },
  avgMonthlySpend: { green: 100, yellow: 300, orange: 600 },
  momVelocity: { green: 10, yellow: 30, orange: 60 },
  pctOfIncome: { green: 3, yellow: 7, orange: 15 },
  escalationRate: { green: 5, yellow: 15, orange: 30 },
  interventionCoverage: { green: 80, yellow: 50, orange: 25 }, // inverted — lower is worse
};

export const sensitivityTiers: SensitivityTier[] = [
  {
    tier: 1,
    label: 'Tier 1 — High Sensitivity',
    description: 'Categories requiring immediate attention and monitoring',
    categories: [
      { id: 'gambling', name: 'Gambling', tier: 1, flaggedCustomers: 136, avgMonthlySpend: 487, momVelocity: 42, pctOfIncome: 8.2, escalationRate: 24, interventionCoverage: 38 },
      { id: 'adult-content', name: 'Adult Content / Services', tier: 1, flaggedCustomers: 54, avgMonthlySpend: 127, momVelocity: 12, pctOfIncome: 2.1, escalationRate: 8, interventionCoverage: 15 },
      { id: 'illicit-adjacent', name: 'Illicit Substance-Adjacent', tier: 1, flaggedCustomers: 19, avgMonthlySpend: 214, momVelocity: 28, pctOfIncome: 4.5, escalationRate: 31, interventionCoverage: 22 },
    ],
  },
  {
    tier: 2,
    label: 'Tier 2 — Moderate Sensitivity',
    description: 'Patterns that warrant monitoring in context',
    categories: [
      { id: 'alcohol', name: 'Alcohol', tier: 2, flaggedCustomers: 312, avgMonthlySpend: 189, momVelocity: 8, pctOfIncome: 3.4, escalationRate: 6, interventionCoverage: 12 },
      { id: 'tobacco-vape', name: 'Tobacco / Vape', tier: 2, flaggedCustomers: 187, avgMonthlySpend: 94, momVelocity: 5, pctOfIncome: 1.8, escalationRate: 4, interventionCoverage: 8 },
      { id: 'firearms', name: 'Firearms & Ammunition', tier: 2, flaggedCustomers: 43, avgMonthlySpend: 267, momVelocity: 15, pctOfIncome: 2.9, escalationRate: 11, interventionCoverage: 5 },
      { id: 'payday-bnpl', name: 'Payday Loans / BNPL Stacking', tier: 2, flaggedCustomers: 134, avgMonthlySpend: 412, momVelocity: 35, pctOfIncome: 9.7, escalationRate: 19, interventionCoverage: 42 },
    ],
  },
  {
    tier: 3,
    label: 'Tier 3 — Contextual',
    description: 'Only flagged when part of broader patterns',
    categories: [
      { id: 'cash-advances', name: 'Cash Advances', tier: 3, flaggedCustomers: 89, avgMonthlySpend: 341, momVelocity: 22, pctOfIncome: 5.8, escalationRate: 14, interventionCoverage: 28 },
      { id: 'crypto-onramps', name: 'Crypto On-Ramps', tier: 3, flaggedCustomers: 67, avgMonthlySpend: 523, momVelocity: 48, pctOfIncome: 6.1, escalationRate: 21, interventionCoverage: 10 },
      { id: 'pawn-shops', name: 'Pawn Shops', tier: 3, flaggedCustomers: 28, avgMonthlySpend: 156, momVelocity: 18, pctOfIncome: 4.2, escalationRate: 17, interventionCoverage: 19 },
      { id: 'late-night-spikes', name: 'Late-Night Velocity Spikes', tier: 3, flaggedCustomers: 74, avgMonthlySpend: 278, momVelocity: 67, pctOfIncome: 3.9, escalationRate: 26, interventionCoverage: 7 },
    ],
  },
];

export const getMatrixCellRisk = (
  dimension: keyof typeof matrixThresholds,
  value: number
): RiskLevel => {
  const t = matrixThresholds[dimension];
  const inverted = dimension === 'interventionCoverage';
  if (inverted) {
    if (value >= t.green) return 'green';
    if (value >= t.yellow) return 'monitor';
    if (value >= t.orange) return 'alert';
    return 'critical';
  }
  if (value <= t.green) return 'green';
  if (value <= t.yellow) return 'monitor';
  if (value <= t.orange) return 'alert';
  return 'critical';
};

export const getMerchantMappingsForCohort = (cohortId: string): MerchantMapping[] => {
  const cohort = cohorts.find(c => c.id === cohortId);
  if (!cohort) return merchantMappings;
  const categories = cohort.topCategories.map(c => c.toLowerCase());
  const relevant = merchantMappings.filter(m => {
    const cat = m.category.toLowerCase();
    return categories.some(c => c.includes('gambling') && cat.includes('gambling')) ||
           categories.some(c => c.includes('payday') && (cat.includes('payday') || cat.includes('rent'))) ||
           categories.some(c => c.includes('adult') && cat.includes('adult')) ||
           categories.some(c => c.includes('cash') && cat.includes('gambling'));
  });
  return relevant.length > 0 ? relevant : merchantMappings.slice(0, 8);
};
