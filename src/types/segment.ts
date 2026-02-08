export type TargetingMode = 'life_event' | 'lifestyle' | 'product';

export interface LifeEventCriteria {
  eventTypes: string[];
  minConfidence: number;
  timingWindow?: string;
}

export interface LifestyleCriteria {
  pillars: string[];
  spendingThreshold: 'top_10' | 'top_20' | 'top_30' | 'above_average';
  minMonthlySpend?: number;
}

export interface ProductCriteria {
  hasProducts: string[];
  lacksProducts: string[];
  spendingPatterns?: Record<string, string>;
}

export interface SavedSegment {
  id: string;
  name: string;
  targetingMode: TargetingMode;
  lifeEventCriteria?: LifeEventCriteria;
  lifestyleCriteria?: LifestyleCriteria;
  productCriteria?: ProductCriteria;
  demographicFilters?: {
    ageRanges: string[];
    regions: string[];
  };
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
}

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
