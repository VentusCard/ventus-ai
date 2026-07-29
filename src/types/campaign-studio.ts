import type { LifeEventCriteria, DemographicFilters } from './segment';

// Product catalog item
export interface CatalogProduct {
  name: string;
  category: ProductCategory;
  penetrationRate: number; // percentage of base who hold this
}

export type ProductCategory = 
  | 'credit_cards' 
  | 'deposit_accounts' 
  | 'loans' 
  | 'investments' 
  | 'insurance' 
  | 'digital_services';

export type ProductMode = 'has' | 'lacks';

// Campaign brief from AI
export interface CampaignBrief {
  campaign_name: string;
  subject_line: string;
  email_body: string;
  push_copy: string;
  sms_copy: string;
  in_app_copy: string;
  cta_text: string;
  cta_link: string;
  imagery_direction: string;
  offer_type: string;
  offer_value: string;
  offer_validity_days: number;
}

// Cross-sell strategy chip
export interface StrategyChip {
  id: string;
  label: string;
  description: string;
}

// Campaign goal
export interface CampaignGoal {
  id: string;
  label: string;
  icon: string;
}

// Metro area
export interface MetroArea {
  id: string;
  name: string;
  region: string;
  population: number;
}

// Full campaign studio state
export interface CampaignStudioState {
  selectedPillars: string[];
  lifeEventCriteria: LifeEventCriteria;
  selectedProducts: Record<string, ProductMode>;
  selectedRegions: string[];
  selectedMetros: string[];
  areaType: string;
  demographicFilters: DemographicFilters;
  crossSellStrategies: string[];
  upsellStrategies: string[];
  campaignGoal: string;
  generatedBrief: CampaignBrief | null;
}

// Dimension chip for the reusable chip cloud
export interface DimensionChip {
  id: string;
  label: string;
  description?: string;
}
