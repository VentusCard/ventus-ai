// Deal categories used throughout TePilot
export type DealCategory = 
  | 'Food & Dining'
  | 'Travel & Exploration'
  | 'Entertainment & Culture'
  | 'Sports & Active Living'
  | 'Style & Beauty'
  | 'Health & Wellness'
  | 'Home & Living'
  | 'Technology & Digital Life'
  | 'Family & Community'
  | 'Pets'
  | 'Financial & Aspirational'
  | 'Automotive';

export interface AvailableDeal {
  id: string;
  merchantName: string;
  category: DealCategory;
  subcategory: string;
  dealTitle: string;
  dealDescription: string;
  rewardValue: string;
  rewardType: 'cashback' | 'points' | 'discount';
  validUntil: string;
  popularity: 'trending' | 'popular' | 'new' | 'featured';
  activationCount: number;
  averageRedemption: number;
  minPurchase?: number;
}

export const DEAL_CATEGORIES: Record<DealCategory, { icon: string; color: string; label: string }> = {
  'Food & Dining': { icon: '🍽️', color: 'bg-orange-100 text-orange-700', label: 'Food & Dining' },
  'Travel & Exploration': { icon: '✈️', color: 'bg-blue-100 text-blue-700', label: 'Travel' },
  'Entertainment & Culture': { icon: '🎭', color: 'bg-purple-100 text-purple-700', label: 'Entertainment' },
  'Sports & Active Living': { icon: '🏃', color: 'bg-green-100 text-green-700', label: 'Sports' },
  'Style & Beauty': { icon: '👗', color: 'bg-pink-100 text-pink-700', label: 'Style' },
  'Health & Wellness': { icon: '💚', color: 'bg-emerald-100 text-emerald-700', label: 'Wellness' },
  'Home & Living': { icon: '🏠', color: 'bg-amber-100 text-amber-700', label: 'Home' },
  'Technology & Digital Life': { icon: '💻', color: 'bg-indigo-100 text-indigo-700', label: 'Tech' },
  'Family & Community': { icon: '👨‍👩‍👧', color: 'bg-rose-100 text-rose-700', label: 'Family' },
  'Pets': { icon: '🐕', color: 'bg-yellow-100 text-yellow-700', label: 'Pets' },
  'Financial & Aspirational': { icon: '💰', color: 'bg-slate-100 text-slate-700', label: 'Finance' },
  'Automotive': { icon: '🚗', color: 'bg-red-100 text-red-700', label: 'Auto' },
};

// Sample available deals for demonstration
export const availableDeals: AvailableDeal[] = [
  // Food & Dining
  {
    id: 'deal-001',
    merchantName: 'Sweetgreen',
    category: 'Food & Dining',
    subcategory: 'Fast Casual',
    dealTitle: '15% off your order',
    dealDescription: 'Healthy meals, great savings. Valid on all orders over $15.',
    rewardValue: '15% cashback',
    rewardType: 'cashback',
    validUntil: '2026-03-31',
    popularity: 'trending',
    activationCount: 45200,
    averageRedemption: 34,
  },
  {
    id: 'deal-002',
    merchantName: 'Chipotle',
    category: 'Food & Dining',
    subcategory: 'Fast Casual',
    dealTitle: 'Double Points Tuesday',
    dealDescription: 'Earn 2x points on all purchases every Tuesday.',
    rewardValue: '2x points',
    rewardType: 'points',
    validUntil: '2026-06-30',
    popularity: 'featured',
    activationCount: 89000,
    averageRedemption: 41,
  },
  {
    id: 'deal-003',
    merchantName: 'Starbucks',
    category: 'Food & Dining',
    subcategory: 'Coffee & Tea',
    dealTitle: '5% back on all drinks',
    dealDescription: 'Your morning coffee just got better. Valid on all beverage purchases.',
    rewardValue: '5% cashback',
    rewardType: 'cashback',
    validUntil: '2026-12-31',
    popularity: 'popular',
    activationCount: 156000,
    averageRedemption: 52,
  },
  // Travel & Exploration
  {
    id: 'deal-004',
    merchantName: 'Delta Airlines',
    category: 'Travel & Exploration',
    subcategory: 'Airlines',
    dealTitle: '3x miles on flights',
    dealDescription: 'Earn triple miles on all Delta flight bookings.',
    rewardValue: '3x miles',
    rewardType: 'points',
    validUntil: '2026-09-30',
    popularity: 'featured',
    activationCount: 78000,
    averageRedemption: 28,
  },
  {
    id: 'deal-005',
    merchantName: 'Marriott Hotels',
    category: 'Travel & Exploration',
    subcategory: 'Hotels',
    dealTitle: '10% off weekend stays',
    dealDescription: 'Save on weekend getaways at participating Marriott properties.',
    rewardValue: '10% discount',
    rewardType: 'discount',
    validUntil: '2026-06-30',
    popularity: 'trending',
    activationCount: 34500,
    averageRedemption: 22,
    minPurchase: 200,
  },
  // Entertainment & Culture
  {
    id: 'deal-006',
    merchantName: 'AMC Theatres',
    category: 'Entertainment & Culture',
    subcategory: 'Movies',
    dealTitle: '$5 off any ticket',
    dealDescription: 'Enjoy movies for less. Valid on all ticket purchases.',
    rewardValue: '$5 off',
    rewardType: 'discount',
    validUntil: '2026-05-31',
    popularity: 'popular',
    activationCount: 67000,
    averageRedemption: 45,
  },
  {
    id: 'deal-007',
    merchantName: 'Spotify',
    category: 'Entertainment & Culture',
    subcategory: 'Streaming',
    dealTitle: '3 months free Premium',
    dealDescription: 'New subscribers get 3 months of Spotify Premium free.',
    rewardValue: '3 months free',
    rewardType: 'discount',
    validUntil: '2026-04-30',
    popularity: 'featured',
    activationCount: 123000,
    averageRedemption: 67,
  },
  // Sports & Active Living
  {
    id: 'deal-008',
    merchantName: 'Nike',
    category: 'Sports & Active Living',
    subcategory: 'Athletic Apparel',
    dealTitle: '20% off new arrivals',
    dealDescription: 'Get the latest gear at a discount. Valid on new season items.',
    rewardValue: '20% off',
    rewardType: 'discount',
    validUntil: '2026-07-31',
    popularity: 'trending',
    activationCount: 89000,
    averageRedemption: 38,
    minPurchase: 100,
  },
  {
    id: 'deal-009',
    merchantName: 'Peloton',
    category: 'Sports & Active Living',
    subcategory: 'Fitness Equipment',
    dealTitle: '10% cashback on accessories',
    dealDescription: 'Earn cashback on all Peloton accessories and apparel.',
    rewardValue: '10% cashback',
    rewardType: 'cashback',
    validUntil: '2026-08-31',
    popularity: 'new',
    activationCount: 12000,
    averageRedemption: 29,
  },
  // Style & Beauty
  {
    id: 'deal-010',
    merchantName: 'Sephora',
    category: 'Style & Beauty',
    subcategory: 'Beauty',
    dealTitle: '5x points on skincare',
    dealDescription: 'Earn bonus points on all skincare purchases this month.',
    rewardValue: '5x points',
    rewardType: 'points',
    validUntil: '2026-03-31',
    popularity: 'trending',
    activationCount: 78000,
    averageRedemption: 44,
  },
  {
    id: 'deal-011',
    merchantName: 'Nordstrom',
    category: 'Style & Beauty',
    subcategory: 'Department Store',
    dealTitle: '8% cashback storewide',
    dealDescription: 'Shop and earn on everything from fashion to beauty.',
    rewardValue: '8% cashback',
    rewardType: 'cashback',
    validUntil: '2026-06-30',
    popularity: 'featured',
    activationCount: 56000,
    averageRedemption: 31,
  },
  // Health & Wellness
  {
    id: 'deal-012',
    merchantName: 'Whole Foods',
    category: 'Health & Wellness',
    subcategory: 'Organic Grocery',
    dealTitle: '5% back for Prime members',
    dealDescription: 'Amazon Prime members earn 5% back on all purchases.',
    rewardValue: '5% cashback',
    rewardType: 'cashback',
    validUntil: '2026-12-31',
    popularity: 'popular',
    activationCount: 234000,
    averageRedemption: 58,
  },
  {
    id: 'deal-013',
    merchantName: 'Equinox',
    category: 'Health & Wellness',
    subcategory: 'Fitness',
    dealTitle: 'First month free',
    dealDescription: 'Join Equinox and get your first month membership free.',
    rewardValue: '1 month free',
    rewardType: 'discount',
    validUntil: '2026-05-31',
    popularity: 'new',
    activationCount: 8900,
    averageRedemption: 12,
  },
  // Technology & Digital Life
  {
    id: 'deal-014',
    merchantName: 'Apple',
    category: 'Technology & Digital Life',
    subcategory: 'Electronics',
    dealTitle: '3% back on all Apple products',
    dealDescription: 'Use Apple Pay and earn 3% Daily Cash on Apple purchases.',
    rewardValue: '3% cashback',
    rewardType: 'cashback',
    validUntil: '2026-12-31',
    popularity: 'featured',
    activationCount: 189000,
    averageRedemption: 47,
  },
  {
    id: 'deal-015',
    merchantName: 'Best Buy',
    category: 'Technology & Digital Life',
    subcategory: 'Electronics Retail',
    dealTitle: '10% off open box items',
    dealDescription: 'Save big on certified open box products.',
    rewardValue: '10% off',
    rewardType: 'discount',
    validUntil: '2026-04-30',
    popularity: 'trending',
    activationCount: 45000,
    averageRedemption: 33,
  },
  // Home & Living
  {
    id: 'deal-016',
    merchantName: 'West Elm',
    category: 'Home & Living',
    subcategory: 'Furniture',
    dealTitle: '15% off first order',
    dealDescription: 'New customers save 15% on their first furniture purchase.',
    rewardValue: '15% off',
    rewardType: 'discount',
    validUntil: '2026-06-30',
    popularity: 'popular',
    activationCount: 23000,
    averageRedemption: 19,
    minPurchase: 300,
  },
  {
    id: 'deal-017',
    merchantName: 'Home Depot',
    category: 'Home & Living',
    subcategory: 'Home Improvement',
    dealTitle: '5% off with Pro Xtra',
    dealDescription: 'Pro Xtra members save 5% on all qualifying purchases.',
    rewardValue: '5% off',
    rewardType: 'discount',
    validUntil: '2026-12-31',
    popularity: 'featured',
    activationCount: 156000,
    averageRedemption: 42,
  },
  // Family & Community
  {
    id: 'deal-018',
    merchantName: 'Disney+',
    category: 'Family & Community',
    subcategory: 'Streaming',
    dealTitle: '6 months for price of 4',
    dealDescription: 'Get 6 months of Disney+ for the price of 4 months.',
    rewardValue: '33% savings',
    rewardType: 'discount',
    validUntil: '2026-05-31',
    popularity: 'trending',
    activationCount: 67000,
    averageRedemption: 54,
  },
  // Pets
  {
    id: 'deal-019',
    merchantName: 'Chewy',
    category: 'Pets',
    subcategory: 'Pet Supplies',
    dealTitle: '10% back on first order',
    dealDescription: 'New customers earn 10% cashback on their first order.',
    rewardValue: '10% cashback',
    rewardType: 'cashback',
    validUntil: '2026-07-31',
    popularity: 'popular',
    activationCount: 89000,
    averageRedemption: 61,
  },
  // Automotive
  {
    id: 'deal-020',
    merchantName: 'Shell',
    category: 'Automotive',
    subcategory: 'Gas Stations',
    dealTitle: '5¢ off per gallon',
    dealDescription: 'Save on every fill-up at participating Shell stations.',
    rewardValue: '5¢/gallon',
    rewardType: 'discount',
    validUntil: '2026-12-31',
    popularity: 'featured',
    activationCount: 234000,
    averageRedemption: 72,
  },
];

// Helper function to get deals with optional filtering
export function getAvailableDeals(options?: {
  category?: string;
  search?: string;
  sortBy?: 'popularity' | 'activations' | 'newest';
}): AvailableDeal[] {
  let filtered = [...availableDeals];

  if (options?.category && options.category !== 'All') {
    filtered = filtered.filter(deal => deal.category === options.category);
  }

  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(
      deal =>
        deal.merchantName.toLowerCase().includes(searchLower) ||
        deal.dealTitle.toLowerCase().includes(searchLower) ||
        deal.subcategory.toLowerCase().includes(searchLower)
    );
  }

  if (options?.sortBy) {
    switch (options.sortBy) {
      case 'activations':
        filtered.sort((a, b) => b.activationCount - a.activationCount);
        break;
      case 'newest':
        filtered.sort((a, b) => (a.popularity === 'new' ? -1 : 1) - (b.popularity === 'new' ? -1 : 1));
        break;
      case 'popularity':
      default:
        const popularityOrder = { trending: 0, featured: 1, popular: 2, new: 3 };
        filtered.sort((a, b) => popularityOrder[a.popularity] - popularityOrder[b.popularity]);
        break;
    }
  }

  return filtered;
}

// Get all categories including "All" option
export function getDealCategories(): string[] {
  return ['All', ...Object.keys(DEAL_CATEGORIES)];
}
