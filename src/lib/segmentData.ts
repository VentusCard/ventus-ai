import type { 
  SavedSegment, 
  SegmentTemplate,
  LifeEventCriteria,
  LifestyleCriteria,
  ProductCriteria,
} from '@/types/segment';
import { CARD_PRODUCTS } from './mockBankwideData';

import { BOOK_CUSTOMERS } from '@/lib/bookScale';
const BASE_USERS = BOOK_CUSTOMERS;

// Life event detection rates
const LIFE_EVENT_RATES: Record<string, number> = {
  retirement: 0.042,
  education: 0.038,
  family: 0.055,
  home: 0.032,
  elder_care: 0.028,
  business: 0.018,
  wealth_transfer: 0.022,
};

// Lifestyle threshold multipliers
const THRESHOLD_MULTIPLIERS: Record<string, number> = {
  top_10: 0.10,
  top_20: 0.20,
  top_30: 0.30,
  above_average: 0.50,
};

// Estimate audience size based on criteria
export function estimateAudienceSize(
  lifeEventCriteria?: LifeEventCriteria,
  lifestyleCriteria?: LifestyleCriteria,
  productCriteria?: ProductCriteria
): number {
  let multiplier = 1.0;

  if (lifeEventCriteria && lifeEventCriteria.eventTypes.length > 0) {
    const eventMultiplier = lifeEventCriteria.eventTypes.reduce((sum, event) => {
      return sum + (LIFE_EVENT_RATES[event] || 0.03);
    }, 0);
    multiplier *= eventMultiplier;
  }

  if (lifestyleCriteria && lifestyleCriteria.pillars.length > 0) {
    const threshold = THRESHOLD_MULTIPLIERS[lifestyleCriteria.spendingThreshold] || 0.20;
    const pillarFactor = Math.pow(threshold, lifestyleCriteria.pillars.length * 0.3);
    multiplier *= pillarFactor;
  }

  if (productCriteria && productCriteria.hasProducts.length > 0) {
    const productPenetration = productCriteria.hasProducts.reduce((sum, productName) => {
      const product = CARD_PRODUCTS.find(cp => cp.name === productName);
      return sum + ((product?.penetrationRate || 10) / 100);
    }, 0);
    multiplier *= productPenetration / productCriteria.hasProducts.length;

    if (productCriteria.lacksProducts.length > 0) {
      multiplier *= 0.7;
    }
  }

  const estimated = Math.floor(BASE_USERS * multiplier);
  return Math.max(10_000, Math.min(estimated, BASE_USERS));
}

// Segment templates focused on targeting criteria (no campaign-specific data)
export const SEGMENT_TEMPLATES: SegmentTemplate[] = [
  // Life Event Templates
  // Life Event Templates
  {
    id: 'new-parent-segment',
    name: 'New Parents',
    description: 'Customers showing baby-related spending signals indicating new or expecting parents',
    category: 'life_event',
    iconHint: 'Baby',
    suggestedAudience: { targetingMode: 'life_event' },
    estimatedSize: 4_125_000,
    priority: 'high',
    suggestedGoal: 'life_event',
    recommendedProductId: 'high_yield_savings',
    automatedTrigger: 'Baby-related spending detected (nursery, pediatrician, baby supplies)',
  },
  {
    id: 'pre-retiree-segment',
    name: 'Pre-Retirees',
    description: 'Customers aged 55-64 showing retirement planning signals and increased travel',
    category: 'life_event',
    iconHint: 'Plane',
    suggestedAudience: { targetingMode: 'life_event' },
    estimatedSize: 3_150_000,
    priority: 'high',
    suggestedGoal: 'life_event',
    recommendedProductId: 'wealth_suite',
    automatedTrigger: 'Retirement planning signals (401k changes, pension inquiries, travel increase)',
  },
  {
    id: 'home-buyers-segment',
    name: 'Home Buyers',
    description: 'Customers showing home purchase signals from furniture, moving, and home improvement spend',
    category: 'life_event',
    iconHint: 'Home',
    suggestedAudience: { targetingMode: 'life_event' },
    estimatedSize: 2_400_000,
    priority: 'medium',
    suggestedGoal: 'life_event',
    recommendedProductId: 'home_mortgage',
    automatedTrigger: 'Home purchase signals (mortgage research, moving expenses, furniture stores)',
  },

  // Lifestyle Cohort Templates
  {
    id: 'travel-enthusiasts-segment',
    name: 'Travel Enthusiasts',
    description: 'Top 20% spenders in travel, airlines, and hotels categories',
    category: 'lifestyle',
    iconHint: 'Plane',
    suggestedAudience: { targetingMode: 'lifestyle' },
    estimatedSize: 15_000_000,
    priority: 'high',
    suggestedGoal: 'cross_sell',
    recommendedProductId: 'travel_card',
    automatedTrigger: 'Crosses top 20% travel spending threshold',
  },
  {
    id: 'fitness-wellness-segment',
    name: 'Fitness & Wellness',
    description: 'Customers with high gym, sports, and health-related spending',
    category: 'lifestyle',
    iconHint: 'Dumbbell',
    suggestedAudience: { targetingMode: 'lifestyle' },
    estimatedSize: 8_500_000,
    priority: 'medium',
    suggestedGoal: 'brand_awareness',
    recommendedProductId: 'cashback_card',
    automatedTrigger: 'High wellness spending detected (gym, supplements, activewear)',
  },
  {
    id: 'foodies-segment',
    name: 'Food & Dining Enthusiasts',
    description: 'Top restaurant and food delivery spenders',
    category: 'lifestyle',
    iconHint: 'UtensilsCrossed',
    suggestedAudience: { targetingMode: 'lifestyle' },
    estimatedSize: 12_000_000,
    priority: 'high',
    suggestedGoal: 'brand_awareness',
    recommendedProductId: 'rewards_card',
    automatedTrigger: 'Consistent dining spend above $500/month for 3+ months',
  },
  {
    id: 'pet-parents-segment',
    name: 'Pet Parents',
    description: 'Customers with consistent pet store, vet, and pet service spending',
    category: 'lifestyle',
    iconHint: 'PawPrint',
    suggestedAudience: { targetingMode: 'lifestyle' },
    estimatedSize: 18_750_000,
    priority: 'medium',
    suggestedGoal: 'seasonal',
    recommendedProductId: 'cashback_card',
    automatedTrigger: 'Recurring pet-related spending (vet visits, pet stores, grooming)',
  },

  // Cross-Sell / Product Templates
  {
    id: 'cashback-high-travel-segment',
    name: 'Cashback Users with Travel Spend',
    description: 'Cashback cardholders who frequently spend on travel but lack a travel card',
    category: 'cross_sell',
    iconHint: 'ArrowUpRight',
    suggestedAudience: { targetingMode: 'product' },
    estimatedSize: 6_400_000,
    priority: 'high',
    suggestedGoal: 'cross_sell',
    recommendedProductId: 'travel_card',
    automatedTrigger: 'Cashback cardholder exceeds $2K/quarter travel spend without travel card',
  },
  {
    id: 'travel-card-no-hotel-segment',
    name: 'Travel Card without Hotel Card',
    description: 'Travel card holders with high hotel spend who could benefit from Hotel Card',
    category: 'cross_sell',
    iconHint: 'Building2',
    suggestedAudience: { targetingMode: 'product' },
    estimatedSize: 4_200_000,
    priority: 'medium',
    suggestedGoal: 'cross_sell',
    recommendedProductId: 'premium_card',
    automatedTrigger: 'Travel cardholder with $1K+/month hotel spend and no premium card',
  },
  {
    id: 'premium-upgrade-eligible-segment',
    name: 'Premium Upgrade Eligible',
    description: 'High-spend basic cardholders who qualify for premium tier upgrade',
    category: 'cross_sell',
    iconHint: 'Crown',
    suggestedAudience: { targetingMode: 'product' },
    estimatedSize: 3_200_000,
    priority: 'medium',
    suggestedGoal: 'upsell',
    recommendedProductId: 'premium_card',
    automatedTrigger: 'Basic cardholder exceeds $5K/month total spend for 6+ months',
  },

  // Seasonal Templates
  {
    id: 'holiday-travelers-segment',
    name: 'Holiday Travelers',
    description: 'Travel spenders likely to book holiday trips',
    category: 'seasonal',
    iconHint: 'Snowflake',
    suggestedAudience: { targetingMode: 'lifestyle' },
    estimatedSize: 22_500_000,
    priority: 'high',
    seasonalWindow: 'Nov 1 - Dec 31',
    suggestedGoal: 'seasonal',
    recommendedProductId: 'travel_card',
    automatedTrigger: 'Holiday travel booking pattern detected (Oct–Nov)',
  },
  {
    id: 'back-to-school-parents-segment',
    name: 'Back-to-School Parents',
    description: 'Parents with education and family signals for back-to-school season',
    category: 'seasonal',
    iconHint: 'GraduationCap',
    suggestedAudience: { targetingMode: 'life_event' },
    estimatedSize: 6_975_000,
    priority: 'medium',
    seasonalWindow: 'Jul 15 - Sep 15',
    suggestedGoal: 'seasonal',
    recommendedProductId: 'cashback_card',
    automatedTrigger: 'Education-related spending spike (Jul–Aug)',
  },
  {
    id: 'tax-season-financial-segment',
    name: 'Tax Season Financial',
    description: 'High earners and financially active customers during tax season',
    category: 'seasonal',
    iconHint: 'Calculator',
    suggestedAudience: { targetingMode: 'lifestyle' },
    estimatedSize: 9_000_000,
    priority: 'low',
    seasonalWindow: 'Jan 15 - Apr 15',
    suggestedGoal: 'seasonal',
    recommendedProductId: 'wealth_suite',
    automatedTrigger: 'Tax preparation spending detected (Jan–Mar)',
  },
];

// Sample saved segments for demo
export const SAVED_SEGMENTS: SavedSegment[] = [
  {
    id: 'seg-001',
    name: 'Travel-Heavy Cashback Users',
    targetingMode: 'product',
    productCriteria: {
      hasProducts: ['Cashback'],
      lacksProducts: ['Travel'],
    },
    estimatedSize: 8_200_000,
    createdAt: '2026-01-10',
    lastExportedAt: '2026-02-05',
    exportCount: 3,
  },
  {
    id: 'seg-002',
    name: 'New Parents (Baby Signal)',
    targetingMode: 'life_event',
    lifeEventCriteria: {
      eventTypes: ['family'],
      minConfidence: 0.7,
    },
    estimatedSize: 4_125_000,
    createdAt: '2025-12-20',
    lastExportedAt: '2026-02-01',
    exportCount: 5,
  },
  {
    id: 'seg-003',
    name: 'Fitness & Wellness Top 20%',
    targetingMode: 'lifestyle',
    lifestyleCriteria: {
      pillars: ['Health & Wellness', 'Sports & Active Living'],
      spendingThreshold: 'top_20',
    },
    estimatedSize: 5_625_000,
    createdAt: '2026-01-25',
    lastExportedAt: '2026-01-28',
    exportCount: 2,
  },
  {
    id: 'seg-004',
    name: 'High-Spend Basic Cardholders',
    targetingMode: 'product',
    productCriteria: {
      hasProducts: ['Cashback'],
      lacksProducts: ['Premium Travel'],
    },
    estimatedSize: 3_200_000,
    createdAt: '2025-12-15',
    exportCount: 0,
  },
];

// Get segment metrics summary
export function getSegmentMetricsSummary() {
  const totalContacts = SAVED_SEGMENTS.reduce((sum, s) => sum + s.estimatedSize, 0);
  const recentExports = SAVED_SEGMENTS.filter(s => s.lastExportedAt).length;
  const modeBreakdown = {
    life_event: SAVED_SEGMENTS.filter(s => s.targetingMode === 'life_event').length,
    lifestyle: SAVED_SEGMENTS.filter(s => s.targetingMode === 'lifestyle').length,
    product: SAVED_SEGMENTS.filter(s => s.targetingMode === 'product').length,
  };

  return {
    savedSegments: SAVED_SEGMENTS.length,
    totalContacts,
    recentExports,
    modeBreakdown,
    totalExports: SAVED_SEGMENTS.reduce((sum, s) => sum + s.exportCount, 0),
  };
}
