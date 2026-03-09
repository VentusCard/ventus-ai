export type TargetingMode = 'life_event' | 'lifestyle' | 'product';

export type TimingWindow = '0-3_months' | '3-6_months' | '6-12_months' | '12-24_months';
export type RecencyWindow = '30_days' | '60_days' | '90_days';
export type SpendingLevel = 'low' | 'medium' | 'high';
export type AccountTenure = 'new' | 'established' | 'loyal' | 'all';
export type IncomeBand = 'under_50k' | '50k_100k' | '100k_150k' | 'over_150k';

export interface SignalThreshold {
  minAmount: number;
  lookbackMonths: number;
}

export interface DemographicFilters {
  ageRanges: string[];
  regions: string[];
  incomeBands: string[];
  accountTenure: AccountTenure;
  ficoRanges?: string[];
  signalThreshold?: SignalThreshold;
}

export interface LifeEventCriteria {
  eventTypes: string[];
  minConfidence: number;
  timingWindow?: TimingWindow;
}

export interface LifestyleCriteria {
  pillars: string[];
  spendingThreshold: 'top_10' | 'top_20' | 'top_30' | 'above_average';
  minMonthlySpend?: number;
  recency?: RecencyWindow;
}

export interface ProductCriteria {
  hasProducts: string[];
  lacksProducts: string[];
  spendingPatterns?: Record<string, SpendingLevel>;
  minProductAge?: number;
}

export interface SavedSegment {
  id: string;
  name: string;
  targetingMode: TargetingMode;
  lifeEventCriteria?: LifeEventCriteria;
  lifestyleCriteria?: LifestyleCriteria;
  productCriteria?: ProductCriteria;
  demographicFilters?: DemographicFilters;
  estimatedSize: number;
  createdAt: string;
  lastExportedAt?: string;
  exportCount: number;
}

export interface SegmentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'life_event' | 'lifestyle' | 'cross_sell' | 'seasonal';
  iconHint: string;
  suggestedAudience: Partial<SavedSegment>;
  estimatedSize: number;
  priority: 'high' | 'medium' | 'low';
  seasonalWindow?: string;
  suggestedGoal?: string;
  recommendedProductId?: string;
  automatedTrigger?: string;
}

// Constants for filter options
export const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] as const;
export const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West', 'Northwest'] as const;
export const INCOME_BANDS = [
  { value: 'under_50k', label: 'Under $50K' },
  { value: '50k_100k', label: '$50K - $100K' },
  { value: '100k_150k', label: '$100K - $150K' },
  { value: 'over_150k', label: '$150K+' },
] as const;
export const ACCOUNT_TENURE_OPTIONS = [
  { value: 'all', label: 'All Tenures' },
  { value: 'new', label: 'New (< 1 year)' },
  { value: 'established', label: 'Established (1-5 years)' },
  { value: 'loyal', label: 'Loyal (5+ years)' },
] as const;
export const TIMING_WINDOWS = [
  { value: '0-3_months', label: 'Within 3 months' },
  { value: '3-6_months', label: '3-6 months' },
  { value: '6-12_months', label: '6-12 months' },
  { value: '12-24_months', label: '12-24 months' },
] as const;
export const RECENCY_OPTIONS = [
  { value: '30_days', label: 'Last 30 days' },
  { value: '60_days', label: 'Last 60 days' },
  { value: '90_days', label: 'Last 90 days' },
] as const;

export const FICO_RANGES = [
  { value: 'excellent', label: 'Excellent (750+)' },
  { value: 'good', label: 'Good (700-749)' },
  { value: 'fair', label: 'Fair (650-699)' },
  { value: 'building', label: 'Building (<650)' },
] as const;

export const LOOKBACK_OPTIONS = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
  { value: 24, label: '24 months' },
  { value: 36, label: '36 months' },
] as const;

// Life event types for targeting
export const LIFE_EVENTS = [
  { id: 'retirement', name: 'Retirement Planning', detectionRate: 0.042, icon: 'Sunset' },
  { id: 'education', name: 'Education Funding', detectionRate: 0.038, icon: 'GraduationCap' },
  { id: 'family', name: 'Family Formation', detectionRate: 0.055, icon: 'Baby' },
  { id: 'home', name: 'Home Purchase', detectionRate: 0.032, icon: 'Home' },
  { id: 'elder_care', name: 'Elder Care', detectionRate: 0.028, icon: 'Heart' },
  { id: 'business', name: 'Business Liquidity', detectionRate: 0.018, icon: 'Briefcase' },
  { id: 'wealth_transfer', name: 'Wealth Transfer', detectionRate: 0.022, icon: 'Gift' },
] as const;

export type LifeEventId = typeof LIFE_EVENTS[number]['id'];
