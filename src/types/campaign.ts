export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export type TargetingMode = 'life_event' | 'lifestyle' | 'product';
export type CampaignChannel = 'email' | 'push' | 'in_app' | 'sms' | 'direct_mail';

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

export interface AudienceSegment {
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
}

export interface CampaignMessage {
  channel: CampaignChannel;
  subject?: string;
  body: string;
  ctaText: string;
  ctaLink: string;
}

export interface CampaignOffer {
  type: 'cashback' | 'points_multiplier' | 'product_discount' | 'product_upgrade';
  value: string;
  merchantPartner?: string;
  validityDays: number;
}

export interface CampaignMetrics {
  reach: number;
  impressions: number;
  activations: number;
  activationRate: number;
  revenueGenerated: number;
  roi: number;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: CampaignStatus;
  audience: AudienceSegment;
  messages: CampaignMessage[];
  offer: CampaignOffer;
  schedule: {
    startDate: string;
    endDate: string;
    deploymentWindow?: string;
  };
  budget: number;
  createdAt: string;
  metrics?: CampaignMetrics;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'life_event' | 'lifestyle' | 'cross_sell' | 'seasonal';
  iconHint: string;
  suggestedAudience: Partial<AudienceSegment>;
  suggestedOffer: CampaignOffer;
  suggestedMessages: Partial<CampaignMessage>[];
  estimatedImpact: number;
  conversionRate: number;
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
