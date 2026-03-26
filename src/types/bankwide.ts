export interface CardProduct {
  name: string;
  accountCount: number;
  uniqueUsers: number;
  penetrationRate: number;
  avgSpendPerAccount: number;
  avgSpendPerUser: number;
  topPillar: string;
  pillarDistribution: Record<string, number>;
  crossSellScore: number;
}

export interface GeographicRegion {
  name: string;
  type: 'region' | 'state';
  userCount: number;
  accountCount: number;
  avgAccountsPerUser: number;
  totalSpend: number;
  children?: GeographicRegion[];
}

export interface AgeRange {
  range: string;
  label: string;
  userCount: number;
  accountCount: number;
  avgSpendPerAccount: number;
  pillarSpending: Record<string, number>;
}

export interface SpendingGap {
  type: 'pillar' | 'geographic' | 'demographic' | 'cross-sell';
  title: string;
  currentState: string;
  potentialState: string;
  opportunityAmount: number;
  affectedUsers: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
}

// Unified Revenue Opportunity that combines gaps with merchant-specific timing and win-win pitches
export interface MerchantPartnershipPitch {
  merchantName: string;
  merchantLogo?: string;
  merchantCategory: string;
  // What we're asking the merchant to do
  proposedDeal: string;
  // Why this is good for the merchant
  merchantBenefit: string;
  // Why this is good for the bank
  bankBenefit: string;
  // Timing
  peakQuarter: string;
  negotiationDeadline: string;
  deploymentWindow: string;
  // Metrics
  estimatedRevenueCapture: number;
  targetedUserCount: number;
  projectedConversionRate: number;
  // Predictability
  patternConfidence: number;
  patternReason: string;
}

export interface RevenueOpportunity {
  id: string;
  // Gap info
  gapTitle: string;
  gapType: 'pillar' | 'geographic' | 'demographic' | 'cross-sell';
  iconHint?: 'gen-z' | 'health' | 'travel' | 'dining' | 'home' | 'geographic' | 'cross-sell' | 'sports' | 'family' | 'tech';
  currentState: string;
  potentialState: string;
  totalOpportunityAmount: number;
  affectedUsers: number;
  priority: 'high' | 'medium' | 'low';
  // Strategic context
  strategicInsight: string;
  // Merchant partnerships that can address this gap
  merchantPartnerships: MerchantPartnershipPitch[];
}

export interface BankwideFilters {
  cardProducts: string[];
  regions: string[];
  ageRanges: string[];
}

export interface BankwideMetrics {
  totalAccounts: number;
  totalUsers: number;
  avgAccountsPerUser: number;
  totalAnnualSpend: number;
  activeAccountRate: number;
  crossSellRate: number;
  avgTransactionsPerAccount: number;
  topSpendingPillar: string;
}

export interface CrossSellOpportunity {
  currentCard: string;
  recommendedCard: string;
  userCount: number;
  estimatedAnnualIncrease: number;
  conversionProbability: number;
}

export interface CrossSellMatrixCell {
  fromCard: string;
  toCard: string;
  annualOpportunity: number;
  potentialUsers: number;
  opportunityLevel: 'high' | 'medium' | 'low' | 'none';
}

export interface PillarDetail {
  pillarName: string;
  totalSpend: number;
  accountCount: number;
  transactionCount: number;
  percentageOfTotal: number;
  avgSpendPerAccount: number;
  color: string;
  topCardProducts: Array<{ name: string; spend: number }>;
  topRegions: Array<{ name: string; spend: number }>;
  ageBreakdown: Record<string, number>;
}

export interface StateSpendingData {
  stateCode: string;
  stateName: string;
  region: string;
  totalSpend: number;
  userCount: number;
  accountCount: number;
  topPillars: Array<{
    pillar: string;
    percentage: number;
    spend: number;
  }>;
}

export interface SpendingTimingHighlight {
  category: string;
  subcategory?: string;
  peakWeeks: string;
  peakSeason: string;
  avgWeeklySpend: number;
  totalAnnualSpend: number;
  yoyGrowth: number;
  dealTimingRecommendation: string;
  weeklySpendData: Array<{ week: number; month: string; spend: number }>;
  topMerchants: Array<{ name: string; peakWeeks: string; spend: number; dealRecommendation: string }>;
  color: string;
  predictabilityScore: number;
  predictabilityReason: string;
}

// Pipeline Status Types for Consumer Rewards Dashboard
// Gamification Management Types
export interface RewardConfig {
  type: 'points' | 'gift_card' | 'cashback' | 'custom';
  value: number;
  currency?: string;
  merchantName?: string;
  fulfillment: 'automatic' | 'manual_approval';
  monthlyBudgetCap?: number;
}

export interface ManagedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  targetValue: number;
  triggerLogic: string;
  isActive: boolean;
  completionRate: number;
  inProgressRate: number;
  reward?: RewardConfig;
}

export interface GamificationMetrics {
  enrolledUsers: number;
  enrollmentRate: number;
  avgHealthScore: number;
  totalUnlocks: number;
  avgUnlocksPerUser: number;
  engagementLift: number;
  achievements: ManagedAchievement[];
  recommendations: Array<{
    title: string;
    description: string;
    impact: string;
    priority: 'high' | 'medium';
  }>;
}

export type PipelineStage = 'not_started' | 'contacted' | 'negotiating' | 'contract_sent' | 'live';

export interface ContactLogEntry {
  date: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  summary: string;
}

export interface PipelineStatus {
  merchantName: string;
  opportunityId: string;
  status: PipelineStage;
  notes: string[];
  lastUpdated: string;
  contactLog: ContactLogEntry[];
}

// Wallet Share Intelligence Types
export interface CompetitorOutflow {
  institution: string;
  type: 'neobank' | 'brokerage' | 'fintech' | 'traditional' | 'bnpl' | 'crypto' | 'rent' | 'auto_loan' | 'student_loan' | 'utility' | 'insurance' | 'childcare' | 'subscription';
  productCategory: string;
  estimatedOutflow: number;
  affectedCustomers: number;
  trend: 'growing' | 'stable' | 'declining';
  detectionMethod: string;
  avgTransferAmount: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface WalletShareMetricsData {
  depositFlightRate: number;
  annualOutflowVolume: number;
  topCompetitor: string;
  winBackOpportunity: number;
  depositFlightTrend: number;
  outflowTrend: number;
}

export interface WinBackRecommendation {
  id: string;
  outflowPattern: string;
  competitor: string;
  affectedCustomers: number;
  behavioralContext: string;
  recommendedAction: string;
  estimatedRecapture: number;
  confidence: number;
  segmentTags: string[];
  outflowVolume: number;
  avgTransferAmount: number;
  topPersona: string;
  timeToAction: string;
  channelStrategy: string[];
  successMetric: string;
  trend: 'growing' | 'stable' | 'declining';
}

export interface WalletShareTrendPoint {
  month: string;
  outflowVolume: number;
  flightRate: number;
  winBackRate: number;
}

export interface MerchantDetail {
  name: string;
  product: string;
  msrp: string;
  link: string;
}

// Category Extension Opportunity — behaviorally adjacent deals that MCC codes can't connect
export interface CategoryExtensionOpportunity {
  id: string;
  sourcePillar: string;
  sourceCategory: string;
  sourceSubcategory: string;
  behavioralSignal: string;
  extensionProduct: string;
  extensionMerchant: string;
  extensionCategory: string;
  whyItFits: string;
  mccDisconnectNote: string;
  addressableUsers: number;
  estimatedRevenue: number;
  projectedConversionRate: number;
  confidenceScore: number;
  matchingPersonas: string[];
  topAgeRanges: string[];
  topRegions: string[];
  peakSpendingWeeks: string;
  optimalDeploymentWindow: string;
  deploymentRationale: string;
  priority: 'high' | 'medium' | 'low';
  merchantDetails: MerchantDetail[];
}

// Pillar Deep Dive Heatmap Types
export interface PillarDeepDiveCell {
  ageGroup: string;
  generationLabel: string;
  region: string;
  totalSpend: number;
  spendIndex: number;
  yoyGrowth: number;
  topSubcategory: string;
  subcategoryGrowth: number;
  userCount: number;
  color: string;
}
