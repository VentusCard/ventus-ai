import type { 
  CardProduct, 
  GeographicRegion, 
  AgeRange, 
  BankwideMetrics,
  SpendingGap,
  CrossSellOpportunity,
  CrossSellMatrixCell,
  BankwideFilters,
  PillarDetail,
  StateSpendingData,
  SpendingTimingHighlight,
  RevenueOpportunity,
} from '@/types/bankwide';
import { PILLAR_COLORS, LIFESTYLE_PILLARS } from '@/lib/sampleData';

// Lifestyle pillars (12 pillars matching the single customer view)
const PILLARS = LIFESTYLE_PILLARS;

// Base data for 120M accounts from 75M users
const TOTAL_ACCOUNTS = 120_000_000;
const TOTAL_USERS = 75_000_000;
const TOTAL_ANNUAL_SPEND = 385_000_000_000; // $385B

// Card products with realistic distributions
export const CARD_PRODUCTS: CardProduct[] = [
  {
    name: 'Cashback Card',
    accountCount: 38_500_000,
    uniqueUsers: 32_000_000,
    penetrationRate: 42.7,
    avgSpendPerAccount: 3_200,
    avgSpendPerUser: 3_850,
    topPillar: 'Food & Dining',
    pillarDistribution: {
      'Food & Dining': 18,
      'Travel & Exploration': 6,
      'Style & Beauty': 14,
      'Home & Living': 9,
      'Entertainment & Culture': 8,
      'Health & Wellness': 6,
      'Financial & Aspirational': 3,
      'Family & Community': 4,
      'Sports & Active Living': 20,
      'Technology & Digital Life': 4,
      'Pets': 10,
      'Miscellaneous & Unclassified': 4
    },
    crossSellScore: 8.2
  },
  {
    name: 'Custom Cashback Card',
    accountCount: 29_000_000,
    uniqueUsers: 24_500_000,
    penetrationRate: 32.7,
    avgSpendPerAccount: 2_900,
    avgSpendPerUser: 3_400,
    topPillar: 'Style & Beauty',
    pillarDistribution: {
      'Food & Dining': 15,
      'Travel & Exploration': 6,
      'Style & Beauty': 17,
      'Home & Living': 10,
      'Entertainment & Culture': 8,
      'Health & Wellness': 6,
      'Financial & Aspirational': 4,
      'Family & Community': 5,
      'Sports & Active Living': 18,
      'Technology & Digital Life': 5,
      'Pets': 9,
      'Miscellaneous & Unclassified': 5
    },
    crossSellScore: 7.5
  },
  {
    name: 'Travel Card',
    accountCount: 19_500_000,
    uniqueUsers: 17_800_000,
    penetrationRate: 23.7,
    avgSpendPerAccount: 4_850,
    avgSpendPerUser: 5_300,
    topPillar: 'Travel & Exploration',
    pillarDistribution: {
      'Food & Dining': 14,
      'Travel & Exploration': 28,
      'Style & Beauty': 9,
      'Home & Living': 5,
      'Entertainment & Culture': 11,
      'Health & Wellness': 4,
      'Financial & Aspirational': 3,
      'Family & Community': 2,
      'Sports & Active Living': 18,
      'Technology & Digital Life': 3,
      'Pets': 7,
      'Miscellaneous & Unclassified': 2
    },
    crossSellScore: 6.8
  },
  {
    name: 'Airline Card',
    accountCount: 13_200_000,
    uniqueUsers: 12_400_000,
    penetrationRate: 16.5,
    avgSpendPerAccount: 4_100,
    avgSpendPerUser: 4_350,
    topPillar: 'Travel & Exploration',
    pillarDistribution: {
      'Food & Dining': 11,
      'Travel & Exploration': 36,
      'Style & Beauty': 8,
      'Home & Living': 3,
      'Entertainment & Culture': 10,
      'Health & Wellness': 3,
      'Financial & Aspirational': 2,
      'Family & Community': 2,
      'Sports & Active Living': 19,
      'Technology & Digital Life': 3,
      'Pets': 8,
      'Miscellaneous & Unclassified': 2
    },
    crossSellScore: 5.4
  },
  {
    name: 'Hotel Card',
    accountCount: 10_500_000,
    uniqueUsers: 9_900_000,
    penetrationRate: 13.2,
    avgSpendPerAccount: 4_450,
    avgSpendPerUser: 4_700,
    topPillar: 'Travel & Exploration',
    pillarDistribution: {
      'Food & Dining': 13,
      'Travel & Exploration': 32,
      'Style & Beauty': 9,
      'Home & Living': 4,
      'Entertainment & Culture': 11,
      'Health & Wellness': 3,
      'Financial & Aspirational': 2,
      'Family & Community': 2,
      'Sports & Active Living': 18,
      'Technology & Digital Life': 2,
      'Pets': 7,
      'Miscellaneous & Unclassified': 3
    },
    crossSellScore: 4.9
  },
  {
    name: 'Premium Travel Card',
    accountCount: 9_300_000,
    uniqueUsers: 9_100_000,
    penetrationRate: 12.1,
    avgSpendPerAccount: 9_800,
    avgSpendPerUser: 10_000,
    topPillar: 'Travel & Exploration',
    pillarDistribution: {
      'Food & Dining': 16,
      'Travel & Exploration': 30,
      'Style & Beauty': 8,
      'Home & Living': 4,
      'Entertainment & Culture': 10,
      'Health & Wellness': 4,
      'Financial & Aspirational': 3,
      'Family & Community': 2,
      'Sports & Active Living': 17,
      'Technology & Digital Life': 3,
      'Pets': 6,
      'Miscellaneous & Unclassified': 3
    },
    crossSellScore: 3.2
  }
];

// Geographic regions with states
export const GEOGRAPHIC_REGIONS: GeographicRegion[] = [
  {
    name: 'Northeast',
    type: 'region',
    userCount: 8_000_000,
    accountCount: 12_500_000,
    avgAccountsPerUser: 1.56,
    totalSpend: 32_000_000_000,
    children: [
      { name: 'New York', type: 'state', userCount: 2_500_000, accountCount: 4_000_000, avgAccountsPerUser: 1.60, totalSpend: 10_500_000_000 },
      { name: 'Pennsylvania', type: 'state', userCount: 1_800_000, accountCount: 2_800_000, avgAccountsPerUser: 1.56, totalSpend: 7_200_000_000 },
      { name: 'Massachusetts', type: 'state', userCount: 1_200_000, accountCount: 1_900_000, avgAccountsPerUser: 1.58, totalSpend: 5_000_000_000 },
      { name: 'New Jersey', type: 'state', userCount: 1_100_000, accountCount: 1_700_000, avgAccountsPerUser: 1.55, totalSpend: 4_400_000_000 },
      { name: 'Other Northeast', type: 'state', userCount: 1_400_000, accountCount: 2_100_000, avgAccountsPerUser: 1.50, totalSpend: 4_900_000_000 }
    ]
  },
  {
    name: 'Southeast',
    type: 'region',
    userCount: 10_000_000,
    accountCount: 15_000_000,
    avgAccountsPerUser: 1.50,
    totalSpend: 38_000_000_000,
    children: [
      { name: 'Florida', type: 'state', userCount: 2_800_000, accountCount: 4_200_000, avgAccountsPerUser: 1.50, totalSpend: 11_000_000_000 },
      { name: 'Georgia', type: 'state', userCount: 1_500_000, accountCount: 2_250_000, avgAccountsPerUser: 1.50, totalSpend: 5_700_000_000 },
      { name: 'North Carolina', type: 'state', userCount: 1_400_000, accountCount: 2_100_000, avgAccountsPerUser: 1.50, totalSpend: 5_300_000_000 },
      { name: 'Virginia', type: 'state', userCount: 1_200_000, accountCount: 1_800_000, avgAccountsPerUser: 1.50, totalSpend: 4_600_000_000 },
      { name: 'Other Southeast', type: 'state', userCount: 3_100_000, accountCount: 4_650_000, avgAccountsPerUser: 1.50, totalSpend: 11_400_000_000 }
    ]
  },
  {
    name: 'Midwest',
    type: 'region',
    userCount: 9_000_000,
    accountCount: 14_000_000,
    avgAccountsPerUser: 1.56,
    totalSpend: 35_000_000_000,
    children: [
      { name: 'Illinois', type: 'state', userCount: 2_000_000, accountCount: 3_100_000, avgAccountsPerUser: 1.55, totalSpend: 7_800_000_000 },
      { name: 'Ohio', type: 'state', userCount: 1_600_000, accountCount: 2_500_000, avgAccountsPerUser: 1.56, totalSpend: 6_200_000_000 },
      { name: 'Michigan', type: 'state', userCount: 1_400_000, accountCount: 2_200_000, avgAccountsPerUser: 1.57, totalSpend: 5_500_000_000 },
      { name: 'Wisconsin', type: 'state', userCount: 900_000, accountCount: 1_400_000, avgAccountsPerUser: 1.56, totalSpend: 3_500_000_000 },
      { name: 'Other Midwest', type: 'state', userCount: 3_100_000, accountCount: 4_800_000, avgAccountsPerUser: 1.55, totalSpend: 12_000_000_000 }
    ]
  },
  {
    name: 'Southwest',
    type: 'region',
    userCount: 8_000_000,
    accountCount: 13_000_000,
    avgAccountsPerUser: 1.63,
    totalSpend: 33_000_000_000,
    children: [
      { name: 'Texas', type: 'state', userCount: 3_500_000, accountCount: 5_700_000, avgAccountsPerUser: 1.63, totalSpend: 14_500_000_000 },
      { name: 'Arizona', type: 'state', userCount: 1_200_000, accountCount: 1_950_000, avgAccountsPerUser: 1.63, totalSpend: 4_900_000_000 },
      { name: 'Oklahoma', type: 'state', userCount: 800_000, accountCount: 1_300_000, avgAccountsPerUser: 1.63, totalSpend: 3_300_000_000 },
      { name: 'New Mexico', type: 'state', userCount: 600_000, accountCount: 980_000, avgAccountsPerUser: 1.63, totalSpend: 2_500_000_000 },
      { name: 'Other Southwest', type: 'state', userCount: 1_900_000, accountCount: 3_070_000, avgAccountsPerUser: 1.62, totalSpend: 7_800_000_000 }
    ]
  },
  {
    name: 'West',
    type: 'region',
    userCount: 10_000_000,
    accountCount: 16_000_000,
    avgAccountsPerUser: 1.60,
    totalSpend: 42_000_000_000,
    children: [
      { name: 'California', type: 'state', userCount: 5_000_000, accountCount: 8_000_000, avgAccountsPerUser: 1.60, totalSpend: 21_000_000_000 },
      { name: 'Washington', type: 'state', userCount: 1_200_000, accountCount: 1_920_000, avgAccountsPerUser: 1.60, totalSpend: 5_000_000_000 },
      { name: 'Oregon', type: 'state', userCount: 800_000, accountCount: 1_280_000, avgAccountsPerUser: 1.60, totalSpend: 3_300_000_000 },
      { name: 'Nevada', type: 'state', userCount: 600_000, accountCount: 960_000, avgAccountsPerUser: 1.60, totalSpend: 2_500_000_000 },
      { name: 'Other West', type: 'state', userCount: 2_400_000, accountCount: 3_840_000, avgAccountsPerUser: 1.60, totalSpend: 10_200_000_000 }
    ]
  }
];

// Age ranges
export const AGE_RANGES: AgeRange[] = [
  {
    range: '18-24',
    label: 'Gen Z',
    userCount: 5_000_000,
    accountCount: 6_000_000,
    avgSpendPerAccount: 1_800,
    pillarSpending: {
      'Style & Beauty': 32,
      'Food & Dining': 24,
      'Entertainment & Culture': 18,
      'Pets': 12,
      'Health & Wellness': 6,
      'Miscellaneous & Unclassified': 8
    }
  },
  {
    range: '25-34',
    label: 'Millennials',
    userCount: 12_000_000,
    accountCount: 18_000_000,
    avgSpendPerAccount: 2_600,
    pillarSpending: {
      'Style & Beauty': 28,
      'Food & Dining': 22,
      'Travel & Exploration': 18,
      'Entertainment & Culture': 12,
      'Pets': 10,
      'Health & Wellness': 5,
      'Miscellaneous & Unclassified': 5
    }
  },
  {
    range: '35-44',
    label: 'Gen X (Younger)',
    userCount: 10_000_000,
    accountCount: 16_000_000,
    avgSpendPerAccount: 3_200,
    pillarSpending: {
      'Style & Beauty': 26,
      'Travel & Exploration': 22,
      'Food & Dining': 20,
      'Home & Living': 12,
      'Pets': 10,
      'Health & Wellness': 5,
      'Miscellaneous & Unclassified': 5
    }
  },
  {
    range: '45-54',
    label: 'Gen X (Older)',
    userCount: 9_000_000,
    accountCount: 15_000_000,
    avgSpendPerAccount: 3_400,
    pillarSpending: {
      'Travel & Exploration': 28,
      'Style & Beauty': 24,
      'Food & Dining': 18,
      'Home & Living': 12,
      'Health & Wellness': 8,
      'Financial & Aspirational': 5,
      'Miscellaneous & Unclassified': 5
    }
  },
  {
    range: '55-64',
    label: 'Boomers (Younger)',
    userCount: 6_000_000,
    accountCount: 10_000_000,
    avgSpendPerAccount: 2_900,
    pillarSpending: {
      'Travel & Exploration': 32,
      'Style & Beauty': 22,
      'Food & Dining': 16,
      'Health & Wellness': 12,
      'Home & Living': 10,
      'Miscellaneous & Unclassified': 8
    }
  },
  {
    range: '65+',
    label: 'Seniors',
    userCount: 3_000_000,
    accountCount: 5_000_000,
    avgSpendPerAccount: 2_200,
    pillarSpending: {
      'Style & Beauty': 28,
      'Health & Wellness': 24,
      'Food & Dining': 18,
      'Travel & Exploration': 14,
      'Home & Living': 10,
      'Miscellaneous & Unclassified': 6
    }
  }
];

// Calculate spending gaps
export function getSpendingGaps(filters: BankwideFilters): SpendingGap[] {
  const gaps: SpendingGap[] = [
    {
      type: 'cross-sell',
      title: 'Travel Card Cross-Sell Opportunity',
      currentState: '8.2M Cashback Card holders travel 5+ times/year',
      potentialState: 'Could hold Travel Card for better rewards',
      opportunityAmount: 2_400_000_000,
      affectedUsers: 8_200_000,
      priority: 'high',
      recommendations: [
        'Launch targeted Travel Card acquisition campaign',
        'Offer sign-up bonus for existing customers',
        'Highlight travel rewards comparison in app'
      ]
    },
    {
      type: 'pillar',
      title: 'Low Health & Wellness Penetration',
      currentState: 'Only 15% of cardholders spend on Health & Wellness',
      potentialState: 'National average is 28% for gym/wellness spending',
      opportunityAmount: 3_200_000_000,
      affectedUsers: 38_000_000,
      priority: 'high',
      recommendations: [
        'Partner with major gym chains for bonus rewards',
        'Add wellness tracking features to app',
        'Launch fitness rewards program'
      ]
    },
    {
      type: 'geographic',
      title: 'Southeast Region Underperformance',
      currentState: 'Southeast has 1.50 accounts/user vs 1.56 national avg',
      potentialState: 'Bringing Southeast to national average',
      opportunityAmount: 1_800_000_000,
      affectedUsers: 10_000_000,
      priority: 'medium',
      recommendations: [
        'Increase regional marketing spend',
        'Partner with Southeast-specific merchants',
        'Launch geo-targeted acquisition campaigns'
      ]
    },
    {
      type: 'demographic',
      title: 'Gen Z Low Engagement',
      currentState: 'Gen Z (18-24) has $1,800 avg spend vs $2,600 bank avg',
      potentialState: 'Increase Gen Z engagement to millennial levels',
      opportunityAmount: 4_800_000_000,
      affectedUsers: 5_000_000,
      priority: 'high',
      recommendations: [
        'Launch student card product',
        'Add social media integration and rewards',
        'Partner with Gen Z-focused brands'
      ]
    },
    {
      type: 'cross-sell',
      title: 'Hotel Card Upsell to Travel Card Holders',
      currentState: '3.1M Travel Card holders book hotels 4+ times/year',
      potentialState: 'Add Hotel Card for enhanced hotel rewards',
      opportunityAmount: 890_000_000,
      affectedUsers: 3_100_000,
      priority: 'medium',
      recommendations: [
        'In-app Hotel Card promotion for Travel Card holders',
        'Bundle offer: Travel + Hotel cards with joint benefits',
        'Show hotel spending analysis in app'
      ]
    },
    {
      type: 'pillar',
      title: 'Dining & Entertainment Rewards Gap',
      currentState: 'Only 22% of users maximize dining rewards potential',
      potentialState: 'Increase dining category penetration to 40%',
      opportunityAmount: 2_100_000_000,
      affectedUsers: 18_500_000,
      priority: 'high',
      recommendations: [
        'Partner with popular restaurant chains for exclusive offers',
        'Launch dining rewards multiplier program',
        'Create food delivery service partnerships'
      ]
    },
    {
      type: 'pillar',
      title: 'Sports & Active Living Underutilization',
      currentState: '12% of customers actively use cards for sports/fitness',
      potentialState: 'Expand to 25% with targeted sports partnerships',
      opportunityAmount: 1_600_000_000,
      affectedUsers: 9_750_000,
      priority: 'medium',
      recommendations: [
        'Partner with sporting goods retailers',
        'Offer enhanced rewards for fitness memberships',
        'Create athlete endorsement programs'
      ]
    },
    {
      type: 'demographic',
      title: 'Family & Childcare Spending Opportunity',
      currentState: 'Only 8% penetration in family/childcare categories',
      potentialState: 'Target families with dedicated rewards program',
      opportunityAmount: 1_950_000_000,
      affectedUsers: 12_000_000,
      priority: 'low',
      recommendations: [
        'Launch family-focused cashback card',
        'Partner with childcare providers and education services',
        'Create back-to-school bonus categories'
      ]
    },
    {
      type: 'demographic',
      title: 'Gen X Home & Living Underutilization',
      currentState: 'Gen X (35-54) only spends 12% on Home & Living vs 18% potential',
      potentialState: 'Increase Home & Living penetration among homeowners',
      opportunityAmount: 2_850_000_000,
      affectedUsers: 19_000_000,
      priority: 'high',
      recommendations: [
        'Partner with home improvement retailers (Home Depot, Lowe\'s)',
        'Create home renovation bonus category program',
        'Offer elevated rewards on furniture and home decor',
        'Launch smart home technology cashback partnerships'
      ]
    },
    {
      type: 'geographic',
      title: 'Millennial Travel Spending - Northeast Region',
      currentState: 'Millennials in Northeast spend 14% on travel vs 22% national avg',
      potentialState: 'Align Northeast millennial travel spend with national patterns',
      opportunityAmount: 1_680_000_000,
      affectedUsers: 2_400_000,
      priority: 'medium',
      recommendations: [
        'Launch Northeast-specific travel card with regional airline partnerships',
        'Partner with Amtrak and regional travel providers',
        'Create NYC/Boston weekend getaway bonus categories',
        'Target high-income millennial professionals with travel benefits'
      ]
    }
  ];

  // Sort by opportunity amount (highest first)
  return gaps.sort((a, b) => b.opportunityAmount - a.opportunityAmount);
}

// Calculate cross-sell opportunities
export function getCrossSellOpportunities(filters: BankwideFilters): CrossSellOpportunity[] {
  return [
    {
      currentCard: 'Cashback Card',
      recommendedCard: 'Travel Card',
      userCount: 8_200_000,
      estimatedAnnualIncrease: 2_400_000_000,
      conversionProbability: 18.5
    },
    {
      currentCard: 'Travel Card',
      recommendedCard: 'Hotel Card',
      userCount: 3_100_000,
      estimatedAnnualIncrease: 890_000_000,
      conversionProbability: 14.2
    },
    {
      currentCard: 'Cashback Card',
      recommendedCard: 'Airline Card',
      userCount: 2_800_000,
      estimatedAnnualIncrease: 720_000_000,
      conversionProbability: 12.8
    },
    {
      currentCard: 'Custom Cashback Card',
      recommendedCard: 'Travel Card',
      userCount: 4_500_000,
      estimatedAnnualIncrease: 1_100_000_000,
      conversionProbability: 15.3
    },
    {
      currentCard: 'Travel Card',
      recommendedCard: 'Premium Travel Card',
      userCount: 1_200_000,
      estimatedAnnualIncrease: 980_000_000,
      conversionProbability: 8.7
    },
    {
      currentCard: 'Airline Card',
      recommendedCard: 'Hotel Card',
      userCount: 1_800_000,
      estimatedAnnualIncrease: 450_000_000,
      conversionProbability: 11.4
    }
  ];
}

// Get overall metrics based on filters
export function getBankwideMetrics(filters: BankwideFilters): BankwideMetrics {
  // Apply filters to calculate metrics
  let filteredAccounts = TOTAL_ACCOUNTS;
  let filteredUsers = TOTAL_USERS;
  let filteredSpend = TOTAL_ANNUAL_SPEND;

  // Filter by card products
  if (filters.cardProducts.length > 0) {
    const selectedProducts = CARD_PRODUCTS.filter(p => 
      filters.cardProducts.includes(p.name)
    );
    filteredAccounts = selectedProducts.reduce((sum, p) => sum + p.accountCount, 0);
    filteredUsers = selectedProducts.reduce((sum, p) => sum + p.uniqueUsers, 0);
    filteredSpend = selectedProducts.reduce((sum, p) => sum + (p.accountCount * p.avgSpendPerAccount), 0);
  }

  // Filter by regions
  if (filters.regions.length > 0) {
    const selectedRegions = GEOGRAPHIC_REGIONS.filter(r => 
      filters.regions.includes(r.name)
    );
    const regionTotal = selectedRegions.reduce((sum, r) => sum + r.accountCount, 0);
    const regionUsers = selectedRegions.reduce((sum, r) => sum + r.userCount, 0);
    const regionSpend = selectedRegions.reduce((sum, r) => sum + r.totalSpend, 0);
    
    if (selectedRegions.length > 0) {
      filteredAccounts = Math.min(filteredAccounts, regionTotal);
      filteredUsers = Math.min(filteredUsers, regionUsers);
      filteredSpend = Math.min(filteredSpend, regionSpend);
    }
  }

  // Filter by age ranges
  if (filters.ageRanges.length > 0) {
    const selectedAges = AGE_RANGES.filter(a => 
      filters.ageRanges.includes(a.range)
    );
    const ageTotal = selectedAges.reduce((sum, a) => sum + a.accountCount, 0);
    const ageUsers = selectedAges.reduce((sum, a) => sum + a.userCount, 0);
    const ageSpend = selectedAges.reduce((sum, a) => sum + (a.accountCount * a.avgSpendPerAccount), 0);
    
    if (selectedAges.length > 0) {
      filteredAccounts = Math.min(filteredAccounts, ageTotal);
      filteredUsers = Math.min(filteredUsers, ageUsers);
      filteredSpend = Math.min(filteredSpend, ageSpend);
    }
  }

  return {
    totalAccounts: filteredAccounts,
    totalUsers: filteredUsers,
    avgAccountsPerUser: filteredAccounts / filteredUsers,
    totalAnnualSpend: filteredSpend,
    activeAccountRate: 78.5,
    crossSellRate: ((filteredAccounts - filteredUsers) / filteredUsers) * 100,
    avgTransactionsPerAccount: 42,
    topSpendingPillar: 'Style & Beauty'
  };
}

// Get pillar distribution based on filters
export function getPillarDistribution(filters: BankwideFilters): Record<string, number> {
  let productsToAggregate = CARD_PRODUCTS;
  if (filters.cardProducts.length > 0) {
    productsToAggregate = CARD_PRODUCTS.filter(p => 
      filters.cardProducts.includes(p.name)
    );
  }

  // If no products match filters, return empty distribution
  if (productsToAggregate.length === 0) {
    const emptyDistribution: Record<string, number> = {};
    PILLARS.forEach(pillar => {
      emptyDistribution[pillar] = 0;
    });
    return emptyDistribution;
  }

  // Calculate actual dollar amounts for each pillar
  const pillarSpending: Record<string, number> = {};
  let totalSpend = 0;
  
  productsToAggregate.forEach(card => {
    const cardTotalSpend = card.accountCount * card.avgSpendPerAccount;
    totalSpend += cardTotalSpend;
    
    Object.entries(card.pillarDistribution).forEach(([pillar, percentage]) => {
      const pillarAmount = cardTotalSpend * (percentage / 100);
      pillarSpending[pillar] = (pillarSpending[pillar] || 0) + pillarAmount;
    });
  });

  // Convert dollar amounts to percentages
  const pillarPercentages: Record<string, number> = {};
  PILLARS.forEach(pillar => {
    const amount = pillarSpending[pillar] || 0;
    pillarPercentages[pillar] = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
  });

  return pillarPercentages;
}

// Get filtered card products
export function getFilteredCardProducts(filters: BankwideFilters): CardProduct[] {
  if (filters.cardProducts.length === 0) {
    return CARD_PRODUCTS;
  }
  return CARD_PRODUCTS.filter(p => filters.cardProducts.includes(p.name));
}

// Get filtered regions
export function getFilteredRegions(filters: BankwideFilters): GeographicRegion[] {
  if (filters.regions.length === 0) {
    return GEOGRAPHIC_REGIONS;
  }
  return GEOGRAPHIC_REGIONS.filter(r => filters.regions.includes(r.name));
}

// Get filtered age ranges
export function getFilteredAgeRanges(filters: BankwideFilters): AgeRange[] {
  if (filters.ageRanges.length === 0) {
    return AGE_RANGES;
  }
  return AGE_RANGES.filter(a => filters.ageRanges.includes(a.range));
}

// Get cross-sell matrix (6x6 grid)
export function getCrossSellMatrix(filters: BankwideFilters = { cardProducts: [], regions: [], ageRanges: [] }): CrossSellMatrixCell[][] {
  // Row products = filtered by user selection (or all if no filter)
  const rowProducts = filters.cardProducts.length > 0
    ? CARD_PRODUCTS.filter(p => filters.cardProducts.includes(p.name))
    : CARD_PRODUCTS;
  
  // Column products = ALWAYS all 6 cards
  const colProducts = CARD_PRODUCTS;
  
  // Calculate filter multiplier based on regions and age ranges
  let userMultiplier = 1.0;
  
  if (filters.regions.length > 0) {
    const selectedRegions = GEOGRAPHIC_REGIONS.filter(r => filters.regions.includes(r.name));
    const totalBankUsers = GEOGRAPHIC_REGIONS.reduce((sum, r) => sum + r.userCount, 0);
    const regionUsers = selectedRegions.reduce((sum, r) => sum + r.userCount, 0);
    userMultiplier *= (regionUsers / totalBankUsers);
  }
  
  if (filters.ageRanges.length > 0) {
    const selectedAges = AGE_RANGES.filter(a => filters.ageRanges.includes(a.range));
    const totalBankUsers = AGE_RANGES.reduce((sum, a) => sum + a.userCount, 0);
    const ageUsers = selectedAges.reduce((sum, a) => sum + a.userCount, 0);
    userMultiplier *= (ageUsers / totalBankUsers);
  }
  
  const matrix: CrossSellMatrixCell[][] = [];

  rowProducts.forEach((fromProduct) => {
    const row: CrossSellMatrixCell[] = [];
    
    colProducts.forEach((toProduct) => {
      // Diagonal cells (same card by name) = none
      if (fromProduct.name === toProduct.name) {
        row.push({
          fromCard: fromProduct.name,
          toCard: toProduct.name,
          annualOpportunity: 0,
          potentialUsers: 0,
          opportunityLevel: 'none'
        });
        return;
      }

      // Calculate realistic cross-sell opportunities based on:
      // 1. Users with fromCard who don't have toCard
      // 2. Spending pattern alignment (pillar overlap)
      // 3. Average spend increase potential

      // Estimate users with fromCard but not toCard (15-40% depending on card compatibility)
      const pillarOverlap = calculatePillarOverlap(fromProduct, toProduct);
      const crossSellRate = 0.02 + (pillarOverlap * 0.06); // 2% to 8% based on pillar alignment
      const potentialUsers = Math.floor(fromProduct.uniqueUsers * crossSellRate * userMultiplier);

      // Calculate annual opportunity based on incremental spend (20% of toCard's average spend)
      const incrementalSpendRate = 0.20; // 20% incremental spend assumption
      const annualOpportunity = potentialUsers * toProduct.avgSpendPerAccount * incrementalSpendRate;

      // Determine opportunity level (adjusted for incremental spend)
      let opportunityLevel: 'high' | 'medium' | 'low' | 'none';
      if (annualOpportunity >= 2_000_000_000) {
        opportunityLevel = 'high';
      } else if (annualOpportunity >= 1_000_000_000) {
        opportunityLevel = 'medium';
      } else {
        opportunityLevel = 'low';
      }

      row.push({
        fromCard: fromProduct.name,
        toCard: toProduct.name,
        annualOpportunity,
        potentialUsers,
        opportunityLevel
      });
    });
    
    matrix.push(row);
  });

  return matrix;
}

// Helper function to calculate pillar distribution overlap between two cards
function calculatePillarOverlap(card1: CardProduct, card2: CardProduct): number {
  const pillars = Object.keys(card1.pillarDistribution);
  let totalOverlap = 0;
  
  pillars.forEach(pillar => {
    const val1 = card1.pillarDistribution[pillar] || 0;
    const val2 = card2.pillarDistribution[pillar] || 0;
    // Use minimum of the two percentages as the overlap
    totalOverlap += Math.min(val1, val2);
  });
  
  // Normalize to 0-1 scale (max possible overlap is 100)
  return totalOverlap / 100;
}

// Get detailed pillar data based on filters
export function getPillarDetails(filters: BankwideFilters): PillarDetail[] {
  const filteredProducts = getFilteredCardProducts(filters);
  const products = filteredProducts.length > 0 ? filteredProducts : CARD_PRODUCTS;
  
  const totalSpendAcrossProducts = products.reduce((sum, p) => sum + (p.accountCount * p.avgSpendPerAccount), 0);
  
  return PILLARS.map(pillarName => {
    // Calculate total spend in this pillar across filtered products
    const pillarSpend = products.reduce((sum, product) => {
      const pillarPercentage = (product.pillarDistribution[pillarName] || 0) / 100;
      const productTotalSpend = product.accountCount * product.avgSpendPerAccount;
      return sum + (productTotalSpend * pillarPercentage);
    }, 0);
    
    // Estimate account count (assuming 70% of accounts have some spend in each pillar)
    const totalAccounts = products.reduce((sum, p) => sum + p.accountCount, 0);
    const accountCount = Math.floor(totalAccounts * 0.70 * (pillarSpend / totalSpendAcrossProducts));
    
    // Estimate transaction count (avg 12 transactions per account per year in each pillar)
    const transactionCount = Math.floor(accountCount * 12);
    
    const percentageOfTotal = (pillarSpend / totalSpendAcrossProducts) * 100;
    const avgSpendPerAccount = accountCount > 0 ? pillarSpend / accountCount : 0;
    
    // Get top 3 card products for this pillar
    const productsByPillar = products
      .map(p => ({
        name: p.name,
        spend: (p.accountCount * p.avgSpendPerAccount) * ((p.pillarDistribution[pillarName] || 0) / 100)
      }))
      .filter(p => p.spend > 0)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 3);
    
    // Get top 3 regions (mock data - could be filtered by regions later)
    const topRegions = [
      { name: "West", spend: pillarSpend * 0.28 },
      { name: "Northeast", spend: pillarSpend * 0.24 },
      { name: "Southeast", spend: pillarSpend * 0.22 },
    ];
    
    // Age breakdown (mock percentages)
    const ageBreakdown: Record<string, number> = {
      "18-24": 8,
      "25-34": 28,
      "35-44": 24,
      "45-54": 20,
      "55-64": 13,
      "65+": 7,
    };
    
    return {
      pillarName,
      totalSpend: pillarSpend,
      accountCount,
      transactionCount,
      percentageOfTotal,
      avgSpendPerAccount,
      color: PILLAR_COLORS[pillarName] || '#64748b',
      topCardProducts: productsByPillar,
      topRegions,
      ageBreakdown,
    };
  }).sort((a, b) => b.totalSpend - a.totalSpend);
}

// State spending data for all 50 states + DC + PR
const STATE_SPENDING_BASE: StateSpendingData[] = [
  { stateCode: "CA", stateName: "California", region: "West", totalSpend: 42_000_000_000, userCount: 8_500_000, accountCount: 13_600_000, topPillars: [{ pillar: "Style & Beauty", percentage: 24, spend: 10_080_000_000 }, { pillar: "Travel & Exploration", percentage: 20, spend: 8_400_000_000 }, { pillar: "Technology & Digital Life", percentage: 16, spend: 6_720_000_000 }] },
  { stateCode: "TX", stateName: "Texas", region: "Southwest", totalSpend: 35_000_000_000, userCount: 7_200_000, accountCount: 11_500_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 22, spend: 7_700_000_000 }, { pillar: "Food & Dining", percentage: 19, spend: 6_650_000_000 }, { pillar: "Travel & Exploration", percentage: 17, spend: 5_950_000_000 }] },
  { stateCode: "FL", stateName: "Florida", region: "Southeast", totalSpend: 28_000_000_000, userCount: 5_800_000, accountCount: 9_300_000, topPillars: [{ pillar: "Travel & Exploration", percentage: 26, spend: 7_280_000_000 }, { pillar: "Entertainment & Culture", percentage: 18, spend: 5_040_000_000 }, { pillar: "Health & Wellness", percentage: 15, spend: 4_200_000_000 }] },
  { stateCode: "NY", stateName: "New York", region: "Northeast", totalSpend: 32_000_000_000, userCount: 6_500_000, accountCount: 10_400_000, topPillars: [{ pillar: "Food & Dining", percentage: 22, spend: 7_040_000_000 }, { pillar: "Entertainment & Culture", percentage: 19, spend: 6_080_000_000 }, { pillar: "Style & Beauty", percentage: 17, spend: 5_440_000_000 }] },
  { stateCode: "PA", stateName: "Pennsylvania", region: "Northeast", totalSpend: 14_000_000_000, userCount: 3_200_000, accountCount: 5_100_000, topPillars: [{ pillar: "Home & Living", percentage: 21, spend: 2_940_000_000 }, { pillar: "Food & Dining", percentage: 19, spend: 2_660_000_000 }, { pillar: "Health & Wellness", percentage: 16, spend: 2_240_000_000 }] },
  { stateCode: "IL", stateName: "Illinois", region: "Midwest", totalSpend: 15_500_000_000, userCount: 3_400_000, accountCount: 5_400_000, topPillars: [{ pillar: "Food & Dining", percentage: 23, spend: 3_565_000_000 }, { pillar: "Sports & Active Living", percentage: 18, spend: 2_790_000_000 }, { pillar: "Entertainment & Culture", percentage: 15, spend: 2_325_000_000 }] },
  { stateCode: "OH", stateName: "Ohio", region: "Midwest", totalSpend: 12_000_000_000, userCount: 2_900_000, accountCount: 4_600_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 24, spend: 2_880_000_000 }, { pillar: "Home & Living", percentage: 19, spend: 2_280_000_000 }, { pillar: "Food & Dining", percentage: 17, spend: 2_040_000_000 }] },
  { stateCode: "GA", stateName: "Georgia", region: "Southeast", totalSpend: 12_500_000_000, userCount: 2_800_000, accountCount: 4_500_000, topPillars: [{ pillar: "Travel & Exploration", percentage: 21, spend: 2_625_000_000 }, { pillar: "Food & Dining", percentage: 18, spend: 2_250_000_000 }, { pillar: "Entertainment & Culture", percentage: 16, spend: 2_000_000_000 }] },
  { stateCode: "NC", stateName: "North Carolina", region: "Southeast", totalSpend: 11_000_000_000, userCount: 2_600_000, accountCount: 4_200_000, topPillars: [{ pillar: "Home & Living", percentage: 22, spend: 2_420_000_000 }, { pillar: "Sports & Active Living", percentage: 19, spend: 2_090_000_000 }, { pillar: "Travel & Exploration", percentage: 16, spend: 1_760_000_000 }] },
  { stateCode: "MI", stateName: "Michigan", region: "Midwest", totalSpend: 10_500_000_000, userCount: 2_500_000, accountCount: 4_000_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 25, spend: 2_625_000_000 }, { pillar: "Home & Living", percentage: 20, spend: 2_100_000_000 }, { pillar: "Food & Dining", percentage: 16, spend: 1_680_000_000 }] },
  { stateCode: "NJ", stateName: "New Jersey", region: "Northeast", totalSpend: 11_500_000_000, userCount: 2_400_000, accountCount: 3_800_000, topPillars: [{ pillar: "Style & Beauty", percentage: 22, spend: 2_530_000_000 }, { pillar: "Food & Dining", percentage: 19, spend: 2_185_000_000 }, { pillar: "Travel & Exploration", percentage: 17, spend: 1_955_000_000 }] },
  { stateCode: "VA", stateName: "Virginia", region: "Southeast", totalSpend: 10_000_000_000, userCount: 2_200_000, accountCount: 3_500_000, topPillars: [{ pillar: "Travel & Exploration", percentage: 23, spend: 2_300_000_000 }, { pillar: "Technology & Digital Life", percentage: 19, spend: 1_900_000_000 }, { pillar: "Food & Dining", percentage: 16, spend: 1_600_000_000 }] },
  { stateCode: "WA", stateName: "Washington", region: "West", totalSpend: 10_500_000_000, userCount: 2_100_000, accountCount: 3_400_000, topPillars: [{ pillar: "Technology & Digital Life", percentage: 26, spend: 2_730_000_000 }, { pillar: "Travel & Exploration", percentage: 20, spend: 2_100_000_000 }, { pillar: "Food & Dining", percentage: 15, spend: 1_575_000_000 }] },
  { stateCode: "AZ", stateName: "Arizona", region: "Southwest", totalSpend: 8_500_000_000, userCount: 1_900_000, accountCount: 3_000_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 24, spend: 2_040_000_000 }, { pillar: "Travel & Exploration", percentage: 21, spend: 1_785_000_000 }, { pillar: "Health & Wellness", percentage: 17, spend: 1_445_000_000 }] },
  { stateCode: "MA", stateName: "Massachusetts", region: "Northeast", totalSpend: 9_500_000_000, userCount: 1_800_000, accountCount: 2_900_000, topPillars: [{ pillar: "Education & Learning", percentage: 23, spend: 2_185_000_000 }, { pillar: "Technology & Digital Life", percentage: 20, spend: 1_900_000_000 }, { pillar: "Food & Dining", percentage: 18, spend: 1_710_000_000 }] },
  { stateCode: "TN", stateName: "Tennessee", region: "Southeast", totalSpend: 7_500_000_000, userCount: 1_700_000, accountCount: 2_700_000, topPillars: [{ pillar: "Entertainment & Culture", percentage: 25, spend: 1_875_000_000 }, { pillar: "Food & Dining", percentage: 20, spend: 1_500_000_000 }, { pillar: "Sports & Active Living", percentage: 17, spend: 1_275_000_000 }] },
  { stateCode: "IN", stateName: "Indiana", region: "Midwest", totalSpend: 7_000_000_000, userCount: 1_600_000, accountCount: 2_600_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 26, spend: 1_820_000_000 }, { pillar: "Home & Living", percentage: 21, spend: 1_470_000_000 }, { pillar: "Food & Dining", percentage: 17, spend: 1_190_000_000 }] },
  { stateCode: "MO", stateName: "Missouri", region: "Midwest", totalSpend: 6_500_000_000, userCount: 1_500_000, accountCount: 2_400_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 23, spend: 1_495_000_000 }, { pillar: "Food & Dining", percentage: 20, spend: 1_300_000_000 }, { pillar: "Home & Living", percentage: 18, spend: 1_170_000_000 }] },
  { stateCode: "MD", stateName: "Maryland", region: "Northeast", totalSpend: 8_000_000_000, userCount: 1_500_000, accountCount: 2_400_000, topPillars: [{ pillar: "Travel & Exploration", percentage: 22, spend: 1_760_000_000 }, { pillar: "Technology & Digital Life", percentage: 19, spend: 1_520_000_000 }, { pillar: "Food & Dining", percentage: 17, spend: 1_360_000_000 }] },
  { stateCode: "WI", stateName: "Wisconsin", region: "Midwest", totalSpend: 6_000_000_000, userCount: 1_400_000, accountCount: 2_200_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 27, spend: 1_620_000_000 }, { pillar: "Food & Dining", percentage: 19, spend: 1_140_000_000 }, { pillar: "Home & Living", percentage: 16, spend: 960_000_000 }] },
  { stateCode: "CO", stateName: "Colorado", region: "West", totalSpend: 7_500_000_000, userCount: 1_400_000, accountCount: 2_200_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 28, spend: 2_100_000_000 }, { pillar: "Travel & Exploration", percentage: 22, spend: 1_650_000_000 }, { pillar: "Health & Wellness", percentage: 16, spend: 1_200_000_000 }] },
  { stateCode: "MN", stateName: "Minnesota", region: "Midwest", totalSpend: 6_500_000_000, userCount: 1_350_000, accountCount: 2_150_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 25, spend: 1_625_000_000 }, { pillar: "Home & Living", percentage: 21, spend: 1_365_000_000 }, { pillar: "Travel & Exploration", percentage: 17, spend: 1_105_000_000 }] },
  { stateCode: "SC", stateName: "South Carolina", region: "Southeast", totalSpend: 5_500_000_000, userCount: 1_250_000, accountCount: 2_000_000, topPillars: [{ pillar: "Travel & Exploration", percentage: 24, spend: 1_320_000_000 }, { pillar: "Sports & Active Living", percentage: 20, spend: 1_100_000_000 }, { pillar: "Food & Dining", percentage: 17, spend: 935_000_000 }] },
  { stateCode: "AL", stateName: "Alabama", region: "Southeast", totalSpend: 5_000_000_000, userCount: 1_200_000, accountCount: 1_900_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 26, spend: 1_300_000_000 }, { pillar: "Food & Dining", percentage: 21, spend: 1_050_000_000 }, { pillar: "Family & Community", percentage: 16, spend: 800_000_000 }] },
  { stateCode: "LA", stateName: "Louisiana", region: "Southeast", totalSpend: 4_800_000_000, userCount: 1_150_000, accountCount: 1_850_000, topPillars: [{ pillar: "Food & Dining", percentage: 28, spend: 1_344_000_000 }, { pillar: "Entertainment & Culture", percentage: 22, spend: 1_056_000_000 }, { pillar: "Travel & Exploration", percentage: 15, spend: 720_000_000 }] },
  { stateCode: "KY", stateName: "Kentucky", region: "Southeast", totalSpend: 4_500_000_000, userCount: 1_100_000, accountCount: 1_750_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 25, spend: 1_125_000_000 }, { pillar: "Home & Living", percentage: 21, spend: 945_000_000 }, { pillar: "Food & Dining", percentage: 18, spend: 810_000_000 }] },
  { stateCode: "OR", stateName: "Oregon", region: "West", totalSpend: 5_200_000_000, userCount: 1_050_000, accountCount: 1_700_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 26, spend: 1_352_000_000 }, { pillar: "Technology & Digital Life", percentage: 21, spend: 1_092_000_000 }, { pillar: "Travel & Exploration", percentage: 18, spend: 936_000_000 }] },
  { stateCode: "OK", stateName: "Oklahoma", region: "Southwest", totalSpend: 4_200_000_000, userCount: 1_000_000, accountCount: 1_600_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 24, spend: 1_008_000_000 }, { pillar: "Food & Dining", percentage: 20, spend: 840_000_000 }, { pillar: "Home & Living", percentage: 18, spend: 756_000_000 }] },
  { stateCode: "CT", stateName: "Connecticut", region: "Northeast", totalSpend: 5_000_000_000, userCount: 900_000, accountCount: 1_450_000, topPillars: [{ pillar: "Style & Beauty", percentage: 23, spend: 1_150_000_000 }, { pillar: "Travel & Exploration", percentage: 21, spend: 1_050_000_000 }, { pillar: "Food & Dining", percentage: 18, spend: 900_000_000 }] },
  { stateCode: "UT", stateName: "Utah", region: "West", totalSpend: 4_000_000_000, userCount: 850_000, accountCount: 1_350_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 30, spend: 1_200_000_000 }, { pillar: "Family & Community", percentage: 22, spend: 880_000_000 }, { pillar: "Travel & Exploration", percentage: 16, spend: 640_000_000 }] },
  { stateCode: "IA", stateName: "Iowa", region: "Midwest", totalSpend: 3_500_000_000, userCount: 800_000, accountCount: 1_280_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 24, spend: 840_000_000 }, { pillar: "Home & Living", percentage: 22, spend: 770_000_000 }, { pillar: "Food & Dining", percentage: 18, spend: 630_000_000 }] },
  { stateCode: "NV", stateName: "Nevada", region: "West", totalSpend: 4_500_000_000, userCount: 780_000, accountCount: 1_250_000, topPillars: [{ pillar: "Entertainment & Culture", percentage: 28, spend: 1_260_000_000 }, { pillar: "Travel & Exploration", percentage: 24, spend: 1_080_000_000 }, { pillar: "Food & Dining", percentage: 16, spend: 720_000_000 }] },
  { stateCode: "AR", stateName: "Arkansas", region: "Southeast", totalSpend: 3_200_000_000, userCount: 750_000, accountCount: 1_200_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 25, spend: 800_000_000 }, { pillar: "Food & Dining", percentage: 21, spend: 672_000_000 }, { pillar: "Home & Living", percentage: 18, spend: 576_000_000 }] },
  { stateCode: "MS", stateName: "Mississippi", region: "Southeast", totalSpend: 2_800_000_000, userCount: 700_000, accountCount: 1_120_000, topPillars: [{ pillar: "Food & Dining", percentage: 24, spend: 672_000_000 }, { pillar: "Sports & Active Living", percentage: 22, spend: 616_000_000 }, { pillar: "Family & Community", percentage: 17, spend: 476_000_000 }] },
  { stateCode: "KS", stateName: "Kansas", region: "Midwest", totalSpend: 3_200_000_000, userCount: 700_000, accountCount: 1_120_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 26, spend: 832_000_000 }, { pillar: "Food & Dining", percentage: 20, spend: 640_000_000 }, { pillar: "Home & Living", percentage: 18, spend: 576_000_000 }] },
  { stateCode: "NM", stateName: "New Mexico", region: "Southwest", totalSpend: 2_500_000_000, userCount: 520_000, accountCount: 830_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 25, spend: 625_000_000 }, { pillar: "Travel & Exploration", percentage: 22, spend: 550_000_000 }, { pillar: "Health & Wellness", percentage: 17, spend: 425_000_000 }] },
  { stateCode: "NE", stateName: "Nebraska", region: "Midwest", totalSpend: 2_300_000_000, userCount: 480_000, accountCount: 770_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 27, spend: 621_000_000 }, { pillar: "Food & Dining", percentage: 20, spend: 460_000_000 }, { pillar: "Home & Living", percentage: 18, spend: 414_000_000 }] },
  { stateCode: "ID", stateName: "Idaho", region: "West", totalSpend: 2_200_000_000, userCount: 450_000, accountCount: 720_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 30, spend: 660_000_000 }, { pillar: "Travel & Exploration", percentage: 21, spend: 462_000_000 }, { pillar: "Home & Living", percentage: 16, spend: 352_000_000 }] },
  { stateCode: "WV", stateName: "West Virginia", region: "Southeast", totalSpend: 1_800_000_000, userCount: 430_000, accountCount: 690_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 24, spend: 432_000_000 }, { pillar: "Home & Living", percentage: 22, spend: 396_000_000 }, { pillar: "Food & Dining", percentage: 18, spend: 324_000_000 }] },
  { stateCode: "HI", stateName: "Hawaii", region: "West", totalSpend: 2_000_000_000, userCount: 360_000, accountCount: 580_000, topPillars: [{ pillar: "Travel & Exploration", percentage: 32, spend: 640_000_000 }, { pillar: "Food & Dining", percentage: 20, spend: 400_000_000 }, { pillar: "Sports & Active Living", percentage: 18, spend: 360_000_000 }] },
  { stateCode: "NH", stateName: "New Hampshire", region: "Northeast", totalSpend: 1_900_000_000, userCount: 340_000, accountCount: 550_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 26, spend: 494_000_000 }, { pillar: "Travel & Exploration", percentage: 22, spend: 418_000_000 }, { pillar: "Home & Living", percentage: 17, spend: 323_000_000 }] },
  { stateCode: "ME", stateName: "Maine", region: "Northeast", totalSpend: 1_600_000_000, userCount: 330_000, accountCount: 530_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 27, spend: 432_000_000 }, { pillar: "Travel & Exploration", percentage: 22, spend: 352_000_000 }, { pillar: "Home & Living", percentage: 18, spend: 288_000_000 }] },
  { stateCode: "MT", stateName: "Montana", region: "West", totalSpend: 1_400_000_000, userCount: 270_000, accountCount: 430_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 32, spend: 448_000_000 }, { pillar: "Travel & Exploration", percentage: 23, spend: 322_000_000 }, { pillar: "Home & Living", percentage: 15, spend: 210_000_000 }] },
  { stateCode: "RI", stateName: "Rhode Island", region: "Northeast", totalSpend: 1_300_000_000, userCount: 260_000, accountCount: 420_000, topPillars: [{ pillar: "Food & Dining", percentage: 24, spend: 312_000_000 }, { pillar: "Style & Beauty", percentage: 21, spend: 273_000_000 }, { pillar: "Entertainment & Culture", percentage: 18, spend: 234_000_000 }] },
  { stateCode: "DE", stateName: "Delaware", region: "Northeast", totalSpend: 1_200_000_000, userCount: 240_000, accountCount: 390_000, topPillars: [{ pillar: "Travel & Exploration", percentage: 23, spend: 276_000_000 }, { pillar: "Style & Beauty", percentage: 21, spend: 252_000_000 }, { pillar: "Food & Dining", percentage: 18, spend: 216_000_000 }] },
  { stateCode: "SD", stateName: "South Dakota", region: "Midwest", totalSpend: 1_100_000_000, userCount: 220_000, accountCount: 350_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 28, spend: 308_000_000 }, { pillar: "Home & Living", percentage: 22, spend: 242_000_000 }, { pillar: "Travel & Exploration", percentage: 16, spend: 176_000_000 }] },
  { stateCode: "ND", stateName: "North Dakota", region: "Midwest", totalSpend: 1_000_000_000, userCount: 190_000, accountCount: 300_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 27, spend: 270_000_000 }, { pillar: "Home & Living", percentage: 23, spend: 230_000_000 }, { pillar: "Food & Dining", percentage: 17, spend: 170_000_000 }] },
  { stateCode: "AK", stateName: "Alaska", region: "West", totalSpend: 1_100_000_000, userCount: 180_000, accountCount: 290_000, topPillars: [{ pillar: "Travel & Exploration", percentage: 28, spend: 308_000_000 }, { pillar: "Sports & Active Living", percentage: 25, spend: 275_000_000 }, { pillar: "Home & Living", percentage: 16, spend: 176_000_000 }] },
  { stateCode: "VT", stateName: "Vermont", region: "Northeast", totalSpend: 900_000_000, userCount: 160_000, accountCount: 260_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 29, spend: 261_000_000 }, { pillar: "Travel & Exploration", percentage: 23, spend: 207_000_000 }, { pillar: "Food & Dining", percentage: 17, spend: 153_000_000 }] },
  { stateCode: "WY", stateName: "Wyoming", region: "West", totalSpend: 800_000_000, userCount: 145_000, accountCount: 230_000, topPillars: [{ pillar: "Sports & Active Living", percentage: 32, spend: 256_000_000 }, { pillar: "Travel & Exploration", percentage: 24, spend: 192_000_000 }, { pillar: "Home & Living", percentage: 15, spend: 120_000_000 }] },
  { stateCode: "DC", stateName: "Washington D.C.", region: "Northeast", totalSpend: 2_500_000_000, userCount: 170_000, accountCount: 270_000, topPillars: [{ pillar: "Food & Dining", percentage: 24, spend: 600_000_000 }, { pillar: "Travel & Exploration", percentage: 22, spend: 550_000_000 }, { pillar: "Entertainment & Culture", percentage: 19, spend: 475_000_000 }] },
  { stateCode: "PR", stateName: "Puerto Rico", region: "Southeast", totalSpend: 1_800_000_000, userCount: 420_000, accountCount: 670_000, topPillars: [{ pillar: "Travel & Exploration", percentage: 26, spend: 468_000_000 }, { pillar: "Food & Dining", percentage: 22, spend: 396_000_000 }, { pillar: "Entertainment & Culture", percentage: 17, spend: 306_000_000 }] },
];

// Get state spending data with optional filtering
export function getStateSpendingData(filters: BankwideFilters): StateSpendingData[] {
  let data = [...STATE_SPENDING_BASE];
  
  // Filter by regions
  if (filters.regions.length > 0) {
    data = data.filter(state => filters.regions.includes(state.region));
  }
  
  return data;
}

// Generate 52-week spending data with seasonal patterns
function generateWeeklySpendData(
  baseSpend: number,
  peakWeeks: number[],
  peakMultiplier: number = 2.5
): Array<{ week: number; month: string; spend: number }> {
  const months = ['Jan', 'Jan', 'Jan', 'Jan', 'Feb', 'Feb', 'Feb', 'Feb', 'Mar', 'Mar', 'Mar', 'Mar', 'Mar',
    'Apr', 'Apr', 'Apr', 'Apr', 'May', 'May', 'May', 'May', 'Jun', 'Jun', 'Jun', 'Jun', 'Jun',
    'Jul', 'Jul', 'Jul', 'Jul', 'Aug', 'Aug', 'Aug', 'Aug', 'Aug', 'Sep', 'Sep', 'Sep', 'Sep',
    'Oct', 'Oct', 'Oct', 'Oct', 'Nov', 'Nov', 'Nov', 'Nov', 'Dec', 'Dec', 'Dec', 'Dec', 'Dec'];
  
  return Array.from({ length: 52 }, (_, i) => {
    const week = i + 1;
    let multiplier = 1;
    
    // Calculate distance to nearest peak week for smooth curve
    const minDistance = Math.min(...peakWeeks.map(pw => Math.abs(week - pw)));
    if (minDistance <= 4) {
      multiplier = 1 + (peakMultiplier - 1) * Math.exp(-minDistance * 0.5);
    }
    
    // Add some random variation
    const variance = 0.9 + Math.random() * 0.2;
    
    return {
      week,
      month: months[i],
      spend: Math.round(baseSpend * multiplier * variance)
    };
  });
}

// Get spending timing highlights
export function getSpendingTimingHighlights(
  filters: BankwideFilters,
  sortBy: 'amount' | 'predictability' = 'amount'
): SpendingTimingHighlight[] {
  // High-volume categories (sorted by amount)
  const amountHighlights: SpendingTimingHighlight[] = [
    {
      category: 'Food & Dining',
      peakWeeks: 'Weeks 47-52',
      peakSeason: 'Holiday Season',
      avgWeeklySpend: 185_000_000,
      totalAnnualSpend: 9_620_000_000,
      yoyGrowth: 8,
      dealTimingRecommendation: 'Partner with restaurants for holiday catering deals starting Week 45. Launch Thanksgiving and Christmas dining promotions 2 weeks before peak weeks for maximum engagement.',
      weeklySpendData: generateWeeklySpendData(185_000_000, [22, 23, 24, 25, 48, 49, 50, 51, 52], 2.2),
      topMerchants: [
        { name: 'DoorDash', peakWeeks: 'Weeks 48-52', spend: 890_000_000, dealRecommendation: 'Offer 20% cashback on family meal orders starting Week 46 to capture Thanksgiving prep traffic.' },
        { name: 'Starbucks', peakWeeks: 'Weeks 47-52', spend: 720_000_000, dealRecommendation: 'Partner for holiday drink promotions and gift card bonuses in Week 47-48 before peak gifting.' },
        { name: 'Cheesecake Factory', peakWeeks: 'Weeks 50-52', spend: 540_000_000, dealRecommendation: 'Launch reservation bonus offers in Week 49 to capture holiday dinner bookings.' }
      ],
      color: '#F97316',
      predictabilityScore: 78,
      predictabilityReason: '78% of annual holiday dining spend occurs within a consistent 6-week window each year.'
    },
    {
      category: 'Travel & Exploration',
      peakWeeks: 'Weeks 1-4, 22-26',
      peakSeason: 'New Year + Summer',
      avgWeeklySpend: 142_000_000,
      totalAnnualSpend: 7_384_000_000,
      yoyGrowth: 15,
      dealTimingRecommendation: 'Launch travel packages in Week 48-50 to capture January bookings. Summer promotion campaigns should start Week 18 for June-July travel peaks.',
      weeklySpendData: generateWeeklySpendData(142_000_000, [1, 2, 3, 4, 22, 23, 24, 25, 26, 27, 28], 2.8),
      topMerchants: [
        { name: 'Delta Airlines', peakWeeks: 'Weeks 1-4, 24-28', spend: 1_200_000_000, dealRecommendation: 'Offer bonus miles on bookings made in Weeks 48-50 for January travel and Week 18-20 for summer trips.' },
        { name: 'Marriott Hotels', peakWeeks: 'Weeks 22-32', spend: 980_000_000, dealRecommendation: 'Push points multiplier promotions in Week 18-20 when families are booking summer vacations.' },
        { name: 'Airbnb', peakWeeks: 'Weeks 22-30', spend: 750_000_000, dealRecommendation: 'Partner for early-bird vacation rental discounts in Weeks 10-14 to capture summer planners.' }
      ],
      color: '#0EA5E9',
      predictabilityScore: 72,
      predictabilityReason: 'Bimodal pattern - 72% of travel bookings follow consistent January + Summer peaks.'
    },
    {
      category: 'Style & Beauty',
      peakWeeks: 'Weeks 46-52',
      peakSeason: 'Black Friday → Holidays',
      avgWeeklySpend: 168_000_000,
      totalAnnualSpend: 8_736_000_000,
      yoyGrowth: 6,
      dealTimingRecommendation: 'Coordinate fashion deals with Black Friday (Week 47). Holiday gift-giving promotions should run Weeks 48-51 with early bird specials starting Week 45.',
      weeklySpendData: generateWeeklySpendData(168_000_000, [47, 48, 49, 50, 51, 52], 3.0),
      topMerchants: [
        { name: 'Nordstrom', peakWeeks: 'Weeks 47-52', spend: 680_000_000, dealRecommendation: 'Activate Black Friday bonus rewards in Week 47 and extend through Cyber Week for maximum engagement.' },
        { name: 'Sephora', peakWeeks: 'Weeks 46-51', spend: 520_000_000, dealRecommendation: 'Launch beauty gift set cashback offers Week 46 to capture early holiday shoppers.' },
        { name: 'Nike', peakWeeks: 'Weeks 47-52', spend: 490_000_000, dealRecommendation: 'Partner for exclusive sneaker drop rewards in Week 47-48 during peak gift-buying season.' }
      ],
      color: '#EC4899',
      predictabilityScore: 85,
      predictabilityReason: '85% of annual fashion/beauty spend concentrates in the same 7-week holiday window.'
    },
    {
      category: 'Sports & Active Living',
      peakWeeks: 'Weeks 1-6',
      peakSeason: 'New Year Resolutions',
      avgWeeklySpend: 98_000_000,
      totalAnnualSpend: 5_096_000_000,
      yoyGrowth: 22,
      dealTimingRecommendation: 'Gym and fitness partnerships are most effective in January. Launch resolution campaigns in Week 52 for maximum Week 1-6 engagement.',
      weeklySpendData: generateWeeklySpendData(98_000_000, [1, 2, 3, 4, 5, 6, 34, 35], 2.5),
      topMerchants: [
        { name: 'Equinox', peakWeeks: 'Weeks 1-8', spend: 420_000_000, dealRecommendation: 'Offer membership signup bonuses in Week 52 to capture New Year resolution momentum.' },
        { name: 'Dick\'s Sporting Goods', peakWeeks: 'Weeks 1-6, 32-36', spend: 380_000_000, dealRecommendation: 'Launch fitness equipment cashback in Week 1-2 and back-to-sports promotions Week 32.' },
        { name: 'Peloton', peakWeeks: 'Weeks 1-6', spend: 290_000_000, dealRecommendation: 'Partner for extended financing offers Week 52-1 when home fitness purchases peak.' }
      ],
      color: '#22C55E',
      predictabilityScore: 88,
      predictabilityReason: '88% of new gym memberships and fitness equipment purchases happen in weeks 1-6 every year.'
    },
    {
      category: 'Entertainment & Culture',
      peakWeeks: 'Weeks 24-35',
      peakSeason: 'Summer',
      avgWeeklySpend: 112_000_000,
      totalAnnualSpend: 5_824_000_000,
      yoyGrowth: 11,
      dealTimingRecommendation: 'Summer entertainment deals peak with blockbuster releases. Partner with streaming services in Week 48-52 for holiday viewing promotions.',
      weeklySpendData: generateWeeklySpendData(112_000_000, [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], 2.0),
      topMerchants: [
        { name: 'AMC Theatres', peakWeeks: 'Weeks 24-30, 48-52', spend: 340_000_000, dealRecommendation: 'Time movie reward offers around blockbuster releases in Week 24-26 and holiday Week 51-52.' },
        { name: 'Ticketmaster', peakWeeks: 'Weeks 22-36', spend: 480_000_000, dealRecommendation: 'Partner for concert presale bonuses in Week 20-22 before summer tour season kicks off.' },
        { name: 'Netflix', peakWeeks: 'Weeks 48-52', spend: 290_000_000, dealRecommendation: 'Offer subscription bonus credits Week 48-50 when holiday viewing and gifting peaks.' }
      ],
      color: '#A855F7',
      predictabilityScore: 65,
      predictabilityReason: '65% predictable - dependent on movie release schedules and festival dates.'
    },
    {
      category: 'Health & Wellness',
      peakWeeks: 'Weeks 1-8',
      peakSeason: 'New Year + Winter',
      avgWeeklySpend: 76_000_000,
      totalAnnualSpend: 3_952_000_000,
      yoyGrowth: 18,
      dealTimingRecommendation: 'Wellness deals most effective January-February. Partner with pharmacies for flu season promotions in Weeks 40-48.',
      weeklySpendData: generateWeeklySpendData(76_000_000, [1, 2, 3, 4, 5, 6, 7, 8, 42, 43, 44, 45], 2.3),
      topMerchants: [
        { name: 'CVS Pharmacy', peakWeeks: 'Weeks 1-8, 40-48', spend: 520_000_000, dealRecommendation: 'Launch flu season wellness cashback Week 40-42 and New Year health promotion Week 1.' },
        { name: 'Walgreens', peakWeeks: 'Weeks 1-8, 42-46', spend: 440_000_000, dealRecommendation: 'Offer immunization bonus rewards Week 42-44 during peak flu shot season.' },
        { name: 'GNC', peakWeeks: 'Weeks 1-10', spend: 180_000_000, dealRecommendation: 'Partner for supplement bundle deals Week 52-2 when resolution shoppers stock up.' }
      ],
      color: '#14B8A6',
      predictabilityScore: 82,
      predictabilityReason: '82% of wellness spending follows New Year resolution + flu season patterns.'
    }
  ];

  // High-predictability subcategories (seasonal patterns)
  const predictabilityHighlights: SpendingTimingHighlight[] = [
    {
      category: 'Sports & Active Living',
      subcategory: 'Ski Equipment & Resorts',
      peakWeeks: 'Weeks 44-48',
      peakSeason: 'Pre-Ski Season',
      avgWeeklySpend: 42_000_000,
      totalAnnualSpend: 420_000_000,
      yoyGrowth: 12,
      dealTimingRecommendation: 'Every year, 96% of ski equipment purchases happen in November. Partner with ski retailers and resorts for early-bird deals starting Week 42.',
      weeklySpendData: generateWeeklySpendData(8_000_000, [44, 45, 46, 47, 48], 5.0),
      topMerchants: [
        { name: 'REI', peakWeeks: 'Weeks 44-48', spend: 85_000_000, dealRecommendation: 'Launch ski gear bundles in Week 42-43 before the Week 44 surge to capture early planners.' },
        { name: 'Vail Resorts', peakWeeks: 'Weeks 45-48', spend: 120_000_000, dealRecommendation: 'Push early-bird season pass promotions in Week 40-42 when families are booking winter trips.' },
        { name: 'Burton', peakWeeks: 'Weeks 44-47', spend: 45_000_000, dealRecommendation: 'Partner for Black Friday snowboard specials Week 47 when gift buyers peak.' }
      ],
      color: '#3B82F6',
      predictabilityScore: 96,
      predictabilityReason: 'Every year, 96% of annual ski equipment and resort bookings occur in Weeks 44-48. This pattern has held consistently for 5+ years.'
    },
    {
      category: 'Financial & Aspirational',
      subcategory: 'Tax Preparation Services',
      peakWeeks: 'Weeks 9-16',
      peakSeason: 'Tax Season',
      avgWeeklySpend: 38_000_000,
      totalAnnualSpend: 304_000_000,
      yoyGrowth: 5,
      dealTimingRecommendation: '98% of tax prep spending occurs March-April. Partner with tax services for early filer bonuses in Week 6-8.',
      weeklySpendData: generateWeeklySpendData(6_000_000, [9, 10, 11, 12, 13, 14, 15, 16], 6.0),
      topMerchants: [
        { name: 'TurboTax', peakWeeks: 'Weeks 9-16', spend: 95_000_000, dealRecommendation: 'Offer early filer cashback Week 6-8 to capture organized filers before the rush.' },
        { name: 'H&R Block', peakWeeks: 'Weeks 10-16', spend: 78_000_000, dealRecommendation: 'Partner for tax prep service discounts Week 9-10 when appointment bookings spike.' },
        { name: 'Jackson Hewitt', peakWeeks: 'Weeks 12-15', spend: 32_000_000, dealRecommendation: 'Target last-minute filers with bonus offers Week 14-15 near the April deadline.' }
      ],
      color: '#6366F1',
      predictabilityScore: 98,
      predictabilityReason: 'Tax deadline drives 98% predictable spending in Weeks 9-16. Last-minute filers spike in Week 15.'
    },
    {
      category: 'Style & Beauty',
      subcategory: 'Halloween Costumes & Decor',
      peakWeeks: 'Weeks 40-43',
      peakSeason: 'Halloween',
      avgWeeklySpend: 28_000_000,
      totalAnnualSpend: 112_000_000,
      yoyGrowth: 8,
      dealTimingRecommendation: '94% of Halloween spending concentrates in 4 weeks. Launch costume and decor deals in Week 38 to capture early shoppers.',
      weeklySpendData: generateWeeklySpendData(3_000_000, [40, 41, 42, 43], 9.0),
      topMerchants: [
        { name: 'Spirit Halloween', peakWeeks: 'Weeks 40-43', spend: 45_000_000, dealRecommendation: 'Launch costume category rewards in Week 38 to capture early shoppers with best selection.' },
        { name: 'Party City', peakWeeks: 'Weeks 41-43', spend: 32_000_000, dealRecommendation: 'Offer party supply bundles Week 40-41 when hosts are planning Halloween gatherings.' },
        { name: 'Amazon (costumes)', peakWeeks: 'Weeks 40-42', spend: 28_000_000, dealRecommendation: 'Activate Halloween category cashback Week 39-41 for last-minute online shoppers.' }
      ],
      color: '#F59E0B',
      predictabilityScore: 94,
      predictabilityReason: '94% of Halloween spending occurs in Weeks 40-43 every year without exception.'
    },
    {
      category: 'Food & Dining',
      subcategory: 'Valentine\'s Day Dining',
      peakWeeks: 'Weeks 5-6',
      peakSeason: 'Valentine\'s Day',
      avgWeeklySpend: 52_000_000,
      totalAnnualSpend: 104_000_000,
      yoyGrowth: 4,
      dealTimingRecommendation: 'Restaurant reservations for Valentine\'s spike 97% predictably in Weeks 5-6. Partner with restaurants for special prix fixe promotions.',
      weeklySpendData: generateWeeklySpendData(2_000_000, [5, 6], 25.0),
      topMerchants: [
        { name: 'OpenTable Restaurants', peakWeeks: 'Weeks 5-6', spend: 38_000_000, dealRecommendation: 'Partner for Valentine\'s reservation bonuses Week 3-4 when couples are booking tables.' },
        { name: 'Fine Dining Group', peakWeeks: 'Week 6', spend: 28_000_000, dealRecommendation: 'Offer prix fixe dining rewards Week 5-6 for premium Valentine\'s experiences.' },
        { name: '1-800-Flowers', peakWeeks: 'Weeks 5-6', spend: 22_000_000, dealRecommendation: 'Launch floral delivery cashback Week 4-5 to capture advance orders for guaranteed delivery.' }
      ],
      color: '#EF4444',
      predictabilityScore: 97,
      predictabilityReason: '97% of Valentine\'s dining and gift spending occurs in Weeks 5-6 - the most predictable holiday spending.'
    },
    {
      category: 'Family & Community',
      subcategory: 'Back-to-School Supplies',
      peakWeeks: 'Weeks 30-34',
      peakSeason: 'Back-to-School',
      avgWeeklySpend: 85_000_000,
      totalAnnualSpend: 425_000_000,
      yoyGrowth: 6,
      dealTimingRecommendation: '95% of back-to-school spending happens in a 5-week window. Launch supply deals in Week 28 to capture early planners.',
      weeklySpendData: generateWeeklySpendData(8_500_000, [30, 31, 32, 33, 34], 10.0),
      topMerchants: [
        { name: 'Target', peakWeeks: 'Weeks 30-34', spend: 145_000_000, dealRecommendation: 'Activate back-to-school category rewards Week 28-29 to capture early organizers.' },
        { name: 'Staples', peakWeeks: 'Weeks 31-34', spend: 95_000_000, dealRecommendation: 'Partner for office supply cashback Week 30-32 during peak school shopping season.' },
        { name: 'Amazon (school supplies)', peakWeeks: 'Weeks 30-33', spend: 88_000_000, dealRecommendation: 'Offer Prime back-to-school bonus Week 29-31 for convenient online shopping.' }
      ],
      color: '#8B5CF6',
      predictabilityScore: 95,
      predictabilityReason: 'School start dates make back-to-school spending 95% predictable in Weeks 30-34.'
    },
    {
      category: 'Travel & Exploration',
      subcategory: 'Summer Vacation Rentals',
      peakWeeks: 'Weeks 22-30',
      peakSeason: 'Summer',
      avgWeeklySpend: 125_000_000,
      totalAnnualSpend: 1_125_000_000,
      yoyGrowth: 18,
      dealTimingRecommendation: 'Summer rental bookings are 92% predictable. Early bird campaigns in Weeks 8-12 capture planners; last-minute deals in Week 20.',
      weeklySpendData: generateWeeklySpendData(42_000_000, [22, 23, 24, 25, 26, 27, 28, 29, 30], 3.0),
      topMerchants: [
        { name: 'Vrbo', peakWeeks: 'Weeks 22-30', spend: 380_000_000, dealRecommendation: 'Launch early-bird vacation rental bonuses Week 8-12 when families plan summer trips.' },
        { name: 'Airbnb', peakWeeks: 'Weeks 22-28', spend: 450_000_000, dealRecommendation: 'Offer booking cashback Week 10-14 to capture advance summer planners.' },
        { name: 'Beach house rentals', peakWeeks: 'Weeks 24-28', spend: 180_000_000, dealRecommendation: 'Partner for last-minute beach getaway deals Week 20-22 for spontaneous travelers.' }
      ],
      color: '#06B6D4',
      predictabilityScore: 92,
      predictabilityReason: '92% of vacation rental spending follows predictable summer patterns in Weeks 22-30.'
    },
    {
      category: 'Home & Living',
      subcategory: 'Pool & Patio Equipment',
      peakWeeks: 'Weeks 18-24',
      peakSeason: 'Spring → Early Summer',
      avgWeeklySpend: 48_000_000,
      totalAnnualSpend: 336_000_000,
      yoyGrowth: 14,
      dealTimingRecommendation: 'Pool and patio purchases spike 91% predictably as temperatures rise. Partner with home improvement stores in Week 16.',
      weeklySpendData: generateWeeklySpendData(12_000_000, [18, 19, 20, 21, 22, 23, 24], 4.0),
      topMerchants: [
        { name: 'Home Depot', peakWeeks: 'Weeks 18-24', spend: 125_000_000, dealRecommendation: 'Launch outdoor furniture cashback Week 16-17 before the Memorial Day rush.' },
        { name: 'Lowe\'s', peakWeeks: 'Weeks 18-22', spend: 98_000_000, dealRecommendation: 'Partner for patio and grill rewards Week 17-19 as backyard season begins.' },
        { name: 'Leslie\'s Pool', peakWeeks: 'Weeks 20-26', spend: 45_000_000, dealRecommendation: 'Offer pool opening supply bonuses Week 18-20 when homeowners prep for summer.' }
      ],
      color: '#10B981',
      predictabilityScore: 91,
      predictabilityReason: '91% of pool/patio spending occurs in Weeks 18-24 as homeowners prepare for summer.'
    },
    {
      category: 'Financial & Aspirational',
      subcategory: 'Holiday Gift Cards',
      peakWeeks: 'Weeks 49-52',
      peakSeason: 'Holiday Gifting',
      avgWeeklySpend: 95_000_000,
      totalAnnualSpend: 380_000_000,
      yoyGrowth: 3,
      dealTimingRecommendation: 'Gift card purchases are 99% concentrated in the final 4 weeks. Partner with major retailers for bonus value promotions.',
      weeklySpendData: generateWeeklySpendData(10_000_000, [49, 50, 51, 52], 9.0),
      topMerchants: [
        { name: 'Amazon Gift Cards', peakWeeks: 'Weeks 49-52', spend: 145_000_000, dealRecommendation: 'Offer bonus value promotions Week 49-50 when holiday gift card buying accelerates.' },
        { name: 'Apple Gift Cards', peakWeeks: 'Weeks 50-52', spend: 85_000_000, dealRecommendation: 'Partner for tech gift card bonuses Week 50-51 during peak electronics gifting.' },
        { name: 'Restaurant Gift Cards', peakWeeks: 'Weeks 51-52', spend: 68_000_000, dealRecommendation: 'Launch last-minute dining gift card rewards Week 51-52 for procrastinating gifters.' }
      ],
      color: '#DC2626',
      predictabilityScore: 99,
      predictabilityReason: '99% of holiday gift card purchases occur in Weeks 49-52 - the most predictable category.'
    }
  ];

  if (sortBy === 'predictability') {
    return predictabilityHighlights.sort((a, b) => b.predictabilityScore - a.predictabilityScore);
  }
  
  return amountHighlights.sort((a, b) => b.totalAnnualSpend - a.totalAnnualSpend);
}

// Unified Revenue Opportunities - combining gaps with merchant-specific timing and win-win pitches
export function getRevenueOpportunities(filters: BankwideFilters): RevenueOpportunity[] {
  const opportunities: RevenueOpportunity[] = [
    {
      id: 'gen-z-engagement',
      gapTitle: 'Gen Z Low Engagement',
      gapType: 'demographic',
      iconHint: 'gen-z',
      currentState: 'Gen Z (18-24) has $1,800 avg spend vs $2,600 bank avg',
      potentialState: 'Increase Gen Z engagement to millennial levels',
      totalOpportunityAmount: 4_800_000_000,
      affectedUsers: 5_000_000,
      priority: 'high',
      strategicInsight: 'Gen Z travel spending peaks during Spring Break (Weeks 10-14) and Summer (Weeks 22-30). Partner with brands that resonate with this demographic during these high-intent windows.',
      merchantPartnerships: [
        {
          merchantName: 'Delta Airlines',
          merchantCategory: 'Travel & Exploration',
          proposedDeal: '4x points on Delta flights for cardholders 18-24, with $50 statement credit on first booking',
          merchantBenefit: 'Capture brand loyalty early — Gen Z travelers will become premium customers within 5-7 years. Spring Break bookings drive 23% of annual Gen Z travel revenue.',
          bankBenefit: 'Increase Gen Z travel card adoption by estimated 340K new accounts. Projected $180M incremental annual spend from this segment.',
          peakQuarter: 'Q1 2026',
          negotiationDeadline: 'Oct 15, 2025',
          deploymentWindow: 'Jan 15 - Mar 20, 2026',
          estimatedRevenueCapture: 720_000_000,
          targetedUserCount: 1_200_000,
          projectedConversionRate: 12.5,
          patternConfidence: 88,
          patternReason: 'Spring Break travel bookings are 88% predictable in Weeks 10-14 every year.'
        },
        {
          merchantName: 'Spotify',
          merchantCategory: 'Entertainment & Culture',
          proposedDeal: '6 months free Spotify Premium with new card activation for ages 18-24',
          merchantBenefit: 'Acquire 400K+ potential lifetime subscribers at near-zero CAC. Convert trial users to paying customers post-promotion.',
          bankBenefit: 'Drive 520K new Gen Z card activations. Music streaming is #1 discretionary spend for this demo.',
          peakQuarter: 'Q3 2026',
          negotiationDeadline: 'Apr 15, 2026',
          deploymentWindow: 'Aug 1 - Sep 15, 2026 (Back to School)',
          estimatedRevenueCapture: 380_000_000,
          targetedUserCount: 850_000,
          projectedConversionRate: 18.2,
          patternConfidence: 91,
          patternReason: 'Back-to-school card activations peak 91% predictably in August.'
        },
        {
          merchantName: 'Uber',
          merchantCategory: 'Travel & Exploration',
          proposedDeal: '5x points on Uber rides + $25 monthly Uber Cash credit for cardholders under 25',
          merchantBenefit: 'Lock in habitual rideshare users before car ownership. Gen Z takes 3.2x more rideshares than millennials did at same age.',
          bankBenefit: 'High-frequency transaction category drives 8.4 swipes/month per user. Builds card-top-of-wallet behavior.',
          peakQuarter: 'Q4 2026',
          negotiationDeadline: 'Jul 15, 2026',
          deploymentWindow: 'Oct 1 - Dec 31, 2026 (Holiday Season)',
          estimatedRevenueCapture: 290_000_000,
          targetedUserCount: 1_400_000,
          projectedConversionRate: 22.8,
          patternConfidence: 85,
          patternReason: 'Holiday rideshare usage peaks in Q4 with 85% consistency year-over-year.'
        }
      ]
    },
    {
      id: 'health-wellness-penetration',
      gapTitle: 'Low Health & Wellness Penetration',
      gapType: 'pillar',
      iconHint: 'health',
      currentState: 'Only 15% of cardholders spend on Health & Wellness',
      potentialState: 'National average is 28% for gym/wellness spending',
      totalOpportunityAmount: 3_200_000_000,
      affectedUsers: 38_000_000,
      priority: 'high',
      strategicInsight: 'New Year resolution spending is the most predictable wellness window (Weeks 1-8, 88% confidence). Gym memberships and fitness equipment peak in January — partner BEFORE the surge.',
      merchantPartnerships: [
        {
          merchantName: 'Equinox',
          merchantCategory: 'Health & Wellness',
          proposedDeal: 'Waive $500 initiation fee + 3x points on membership for new cardholder signups',
          merchantBenefit: 'Acquire 85K high-LTV members at reduced CAC. Bank cardholders have 2.3x higher retention than walk-in signups.',
          bankBenefit: 'Drive $420M in annual recurring wellness spend. Premium gym members have 34% higher overall card utilization.',
          peakQuarter: 'Q1 2026',
          negotiationDeadline: 'Oct 15, 2025',
          deploymentWindow: 'Dec 26, 2025 - Feb 15, 2026',
          estimatedRevenueCapture: 840_000_000,
          targetedUserCount: 2_100_000,
          projectedConversionRate: 8.5,
          patternConfidence: 88,
          patternReason: '88% of new gym memberships are purchased in Weeks 1-6 every year.'
        },
        {
          merchantName: 'Peloton',
          merchantCategory: 'Health & Wellness',
          proposedDeal: '0% APR 24-month financing + 5x points on equipment and subscription',
          merchantBenefit: 'Reduce financing friction for $2,500+ purchases. Bank customers have 40% lower default rates on fitness equipment.',
          bankBenefit: 'Capture $290M in high-ticket home fitness purchases. Equipment buyers spend 3.2x more on wellness overall.',
          peakQuarter: 'Q1 2026',
          negotiationDeadline: 'Oct 15, 2025',
          deploymentWindow: 'Dec 20, 2025 - Jan 31, 2026',
          estimatedRevenueCapture: 290_000_000,
          targetedUserCount: 420_000,
          projectedConversionRate: 6.2,
          patternConfidence: 92,
          patternReason: '92% of home fitness equipment purchases occur in the 6 weeks around New Year.'
        },
        {
          merchantName: 'CVS Pharmacy',
          merchantCategory: 'Health & Wellness',
          proposedDeal: '4x points on all pharmacy and wellness purchases, with bonus rewards during flu season',
          merchantBenefit: 'Increase basket size by 18% through rewards motivation. Drive pharmacy loyalty in competitive market.',
          bankBenefit: 'High-frequency category (2.8 visits/month avg). Wellness spending correlates with long-term card retention.',
          peakQuarter: 'Q4 2026',
          negotiationDeadline: 'Jul 15, 2026',
          deploymentWindow: 'Oct 1 - Nov 30, 2026 (Flu Season)',
          estimatedRevenueCapture: 520_000_000,
          targetedUserCount: 8_500_000,
          projectedConversionRate: 24.5,
          patternConfidence: 82,
          patternReason: '82% of flu-related pharmacy spending occurs in Weeks 40-48.'
        }
      ]
    },
    {
      id: 'travel-cross-sell',
      gapTitle: 'Travel Card Cross-Sell Opportunity',
      gapType: 'cross-sell',
      iconHint: 'travel',
      currentState: '8.2M Cashback Card holders travel 5+ times/year',
      potentialState: 'Could hold Travel Card for better rewards',
      totalOpportunityAmount: 2_400_000_000,
      affectedUsers: 8_200_000,
      priority: 'high',
      strategicInsight: 'Summer vacation bookings peak Weeks 22-30 but are BOOKED in Weeks 8-14. Target cross-sell campaigns during booking season, not travel season.',
      merchantPartnerships: [
        {
          merchantName: 'Marriott',
          merchantCategory: 'Travel & Exploration',
          proposedDeal: 'Automatic Gold Elite status + 50K bonus points for Cashback Card holders who upgrade to Travel Card',
          merchantBenefit: 'Acquire 420K new loyalty members with proven travel spend. Gold members book 2.8x more nights than standard.',
          bankBenefit: 'Convert 420K accounts from Cashback to Travel Card (higher interchange). Projected $1.2B incremental travel spend.',
          peakQuarter: 'Q1 2026',
          negotiationDeadline: 'Oct 15, 2025',
          deploymentWindow: 'Feb 1 - Apr 15, 2026 (Booking Season)',
          estimatedRevenueCapture: 680_000_000,
          targetedUserCount: 2_400_000,
          projectedConversionRate: 5.2,
          patternConfidence: 92,
          patternReason: '92% of summer vacation bookings are made in Weeks 8-14.'
        },
        {
          merchantName: 'Expedia',
          merchantCategory: 'Travel & Exploration',
          proposedDeal: '10% statement credit on vacation packages booked through Expedia + Travel Card',
          merchantBenefit: 'Drive $380M in bookings from high-intent travelers. Bundle purchases average $2,400 vs $890 for flight-only.',
          bankBenefit: 'High-AOV transactions drive interchange revenue. Package bookers have 78% card renewal rate.',
          peakQuarter: 'Q2 2026',
          negotiationDeadline: 'Jan 15, 2026',
          deploymentWindow: 'Mar 15 - May 31, 2026',
          estimatedRevenueCapture: 480_000_000,
          targetedUserCount: 1_800_000,
          projectedConversionRate: 7.8,
          patternConfidence: 89,
          patternReason: '89% of vacation package purchases occur in the 10 weeks before peak travel.'
        },
        {
          merchantName: 'Hertz',
          merchantCategory: 'Travel & Exploration',
          proposedDeal: 'Free rental car upgrade + 3x points on all Hertz rentals with Travel Card',
          merchantBenefit: 'Fill mid-tier fleet (normally 40% vacancy). Bank customers rent 4.2 days avg vs 2.8 walk-up.',
          bankBenefit: 'Add ancillary travel category spend. Car renters also book 2.1x more hotels on same card.',
          peakQuarter: 'Q3 2026',
          negotiationDeadline: 'Apr 15, 2026',
          deploymentWindow: 'Jun 15 - Aug 31, 2026 (Peak Travel)',
          estimatedRevenueCapture: 245_000_000,
          targetedUserCount: 1_100_000,
          projectedConversionRate: 11.4,
          patternConfidence: 86,
          patternReason: '86% of rental car spend occurs during summer travel (Weeks 24-35).'
        }
      ]
    },
    {
      id: 'dining-entertainment-gap',
      gapTitle: 'Dining & Entertainment Rewards Gap',
      gapType: 'pillar',
      iconHint: 'dining',
      currentState: 'Only 22% of users maximize dining rewards potential',
      potentialState: 'Increase dining category penetration to 40%',
      totalOpportunityAmount: 2_100_000_000,
      affectedUsers: 18_500_000,
      priority: 'high',
      strategicInsight: 'Valentine\'s Day dining is 97% predictable (Weeks 5-6). Summer entertainment peaks Weeks 24-35. Partner for these high-confidence windows.',
      merchantPartnerships: [
        {
          merchantName: 'OpenTable Restaurants',
          merchantCategory: 'Food & Dining',
          proposedDeal: '5x points on OpenTable bookings + $30 dining credit for Valentine\'s reservations',
          merchantBenefit: 'Drive 280K incremental reservations during peak demand. Premium cardholders tip 22% higher.',
          bankBenefit: 'Capture $38M in Valentine\'s dining spend. OpenTable users dine out 3.4x monthly average.',
          peakQuarter: 'Q1 2026',
          negotiationDeadline: 'Nov 15, 2025',
          deploymentWindow: 'Jan 20 - Feb 14, 2026',
          estimatedRevenueCapture: 185_000_000,
          targetedUserCount: 2_800_000,
          projectedConversionRate: 14.2,
          patternConfidence: 97,
          patternReason: '97% of Valentine\'s dining reservations occur in Weeks 5-6.'
        },
        {
          merchantName: 'DoorDash',
          merchantCategory: 'Food & Dining',
          proposedDeal: 'Free DashPass (annual value $96) + 4x points on all delivery orders',
          merchantBenefit: 'Acquire 850K new DashPass subscribers. Bank cardholders order 2.4x more frequently than non-subscribers.',
          bankBenefit: 'High-frequency transactions (6.2 orders/month avg). Delivery spending increased 34% YoY in target demo.',
          peakQuarter: 'Q4 2026',
          negotiationDeadline: 'Jul 15, 2026',
          deploymentWindow: 'Oct 1 - Dec 31, 2026 (Holiday Season)',
          estimatedRevenueCapture: 420_000_000,
          targetedUserCount: 4_200_000,
          projectedConversionRate: 28.5,
          patternConfidence: 78,
          patternReason: 'Food delivery peaks during holiday season and cold weather months.'
        },
        {
          merchantName: 'Ticketmaster',
          merchantCategory: 'Entertainment & Culture',
          proposedDeal: 'Presale access + 4x points on concert and event tickets',
          merchantBenefit: 'Drive $480M in ticket sales through exclusive presale windows. Cardholders buy 2.8 tickets avg vs 2.1.',
          bankBenefit: 'High-AOV transactions ($180 avg). Event-goers also spend 45% more on dining/transportation same-day.',
          peakQuarter: 'Q2 2026',
          negotiationDeadline: 'Jan 15, 2026',
          deploymentWindow: 'Apr 1 - Jun 30, 2026 (Summer Tour Announcements)',
          estimatedRevenueCapture: 340_000_000,
          targetedUserCount: 3_100_000,
          projectedConversionRate: 16.8,
          patternConfidence: 65,
          patternReason: 'Concert spending is 65% predictable, dependent on tour announcements.'
        }
      ]
    },
    {
      id: 'gen-x-home-living',
      gapTitle: 'Gen X Home & Living Underutilization',
      gapType: 'demographic',
      iconHint: 'home',
      currentState: 'Gen X (35-54) only spends 12% on Home & Living vs 18% potential',
      potentialState: 'Increase Home & Living penetration among homeowners',
      totalOpportunityAmount: 2_850_000_000,
      affectedUsers: 19_000_000,
      priority: 'high',
      strategicInsight: 'Pool/patio equipment purchases peak Weeks 18-24 (91% confidence). Home improvement peaks in spring. Target Gen X homeowners before Memorial Day.',
      merchantPartnerships: [
        {
          merchantName: 'Home Depot',
          merchantCategory: 'Home & Living',
          proposedDeal: '5x points on all purchases + 18-month 0% financing on projects over $2,000',
          merchantBenefit: 'Increase average project size by 35%. Bank financing approval rate is 40% higher than store card.',
          bankBenefit: 'Capture $125M in spring home improvement surge. Project buyers have 89% card renewal rate.',
          peakQuarter: 'Q2 2026',
          negotiationDeadline: 'Jan 15, 2026',
          deploymentWindow: 'Apr 1 - Jun 15, 2026 (Spring Season)',
          estimatedRevenueCapture: 680_000_000,
          targetedUserCount: 4_200_000,
          projectedConversionRate: 8.9,
          patternConfidence: 91,
          patternReason: '91% of pool/patio spending occurs Weeks 18-24 as homeowners prep for summer.'
        },
        {
          merchantName: 'Lowe\'s',
          merchantCategory: 'Home & Living',
          proposedDeal: '4x points on appliances and outdoor equipment + free installation on major purchases',
          merchantBenefit: 'Drive $98M in appliance sales. Free installation increases conversion 42% on big-ticket items.',
          bankBenefit: 'High-AOV transactions ($850 avg). Appliance buyers renovate other areas within 18 months.',
          peakQuarter: 'Q2 2026',
          negotiationDeadline: 'Jan 15, 2026',
          deploymentWindow: 'May 1 - Jul 4, 2026 (Pre-Summer)',
          estimatedRevenueCapture: 520_000_000,
          targetedUserCount: 3_600_000,
          projectedConversionRate: 7.2,
          patternConfidence: 88,
          patternReason: '88% of outdoor equipment purchases occur in the 8 weeks before July 4th.'
        },
        {
          merchantName: 'Wayfair',
          merchantCategory: 'Home & Living',
          proposedDeal: '5x points + 15% statement credit on first $500+ furniture purchase',
          merchantBenefit: 'Acquire 380K new customers with proven home spending. First purchase leads to 2.4 additional purchases/year.',
          bankBenefit: 'Online furniture is growing 28% YoY. Wayfair shoppers have 45% higher discretionary spend overall.',
          peakQuarter: 'Q3 2026',
          negotiationDeadline: 'Apr 15, 2026',
          deploymentWindow: 'Aug 1 - Sep 30, 2026 (Back-to-Home)',
          estimatedRevenueCapture: 285_000_000,
          targetedUserCount: 2_100_000,
          projectedConversionRate: 11.5,
          patternConfidence: 74,
          patternReason: 'Furniture purchases peak in late summer as families prepare for fall.'
        }
      ]
    },
    {
      id: 'southeast-underperformance',
      gapTitle: 'Southeast Region Underperformance',
      gapType: 'geographic',
      iconHint: 'geographic',
      currentState: 'Southeast has 1.50 accounts/user vs 1.56 national avg',
      potentialState: 'Bringing Southeast to national average',
      totalOpportunityAmount: 1_800_000_000,
      affectedUsers: 10_000_000,
      priority: 'medium',
      strategicInsight: 'Southeast has unique seasonal patterns: hurricane prep (Aug-Sep), college football (Sep-Dec), spring break travel (Mar). Partner with regional merchants.',
      merchantPartnerships: [
        {
          merchantName: 'Publix',
          merchantCategory: 'Food & Dining',
          proposedDeal: '4x points on groceries + special hurricane prep bonus rewards in Aug-Sep',
          merchantBenefit: 'Increase market share in competitive Southeast grocery. Storm prep drives 340% basket size increase.',
          bankBenefit: 'High-frequency regional loyalty. Publix shoppers visit 2.2x/week, driving consistent card usage.',
          peakQuarter: 'Q3 2026',
          negotiationDeadline: 'Apr 15, 2026',
          deploymentWindow: 'Aug 1 - Sep 30, 2026 (Hurricane Season)',
          estimatedRevenueCapture: 380_000_000,
          targetedUserCount: 4_800_000,
          projectedConversionRate: 32.5,
          patternConfidence: 94,
          patternReason: '94% of Southeast hurricane prep shopping occurs in Aug-Sep annually.'
        },
        {
          merchantName: 'SEC Network / ESPN+',
          merchantCategory: 'Entertainment & Culture',
          proposedDeal: 'Free SEC Network subscription + 3x points on sports merchandise during football season',
          merchantBenefit: 'Acquire 520K new streaming subscribers. College football fans have 78% retention rate.',
          bankBenefit: 'Build regional brand loyalty through passion category. Football fans spend 3.1x on gameday dining.',
          peakQuarter: 'Q3 2026',
          negotiationDeadline: 'Apr 15, 2026',
          deploymentWindow: 'Aug 15 - Dec 15, 2026 (Football Season)',
          estimatedRevenueCapture: 195_000_000,
          targetedUserCount: 2_200_000,
          projectedConversionRate: 18.4,
          patternConfidence: 96,
          patternReason: '96% of college football spending occurs during the Sep-Dec season.'
        }
      ]
    }
  ];

  return opportunities.sort((a, b) => b.totalOpportunityAmount - a.totalOpportunityAmount);
}

// ─── Wallet Share Intelligence Mock Data ────────────────────────────────

import type { CompetitorOutflow, WalletShareMetricsData, WinBackRecommendation, WalletShareTrendPoint } from '@/types/bankwide';

export function getWalletShareMetrics(): WalletShareMetricsData {
  return {
    depositFlightRate: 23.4,
    annualOutflowVolume: 18_200_000_000,
    topCompetitor: 'Marcus by Goldman Sachs',
    winBackOpportunity: 4_100_000_000,
    depositFlightTrend: 2.1,
    outflowTrend: 8.3,
  };
}

export function getCompetitorOutflows(): CompetitorOutflow[] {
  return [
    { institution: 'Marcus by Goldman Sachs', type: 'neobank', productCategory: 'High-Yield Savings', estimatedOutflow: 4_800_000_000, affectedCustomers: 1_240_000, trend: 'growing', detectionMethod: 'ACH routing number', avgTransferAmount: 3_870, riskLevel: 'high' },
    { institution: 'Ally Bank', type: 'neobank', productCategory: 'High-Yield Savings', estimatedOutflow: 3_200_000_000, affectedCustomers: 980_000, trend: 'growing', detectionMethod: 'ACH routing number', avgTransferAmount: 3_265, riskLevel: 'high' },
    { institution: 'Rocket Mortgage', type: 'fintech', productCategory: 'Mortgage Refinance', estimatedOutflow: 2_900_000_000, affectedCustomers: 145_000, trend: 'stable', detectionMethod: 'Payee name match', avgTransferAmount: 1_680, riskLevel: 'high' },
    { institution: 'SoFi', type: 'fintech', productCategory: 'Personal Loans', estimatedOutflow: 1_800_000_000, affectedCustomers: 620_000, trend: 'growing', detectionMethod: 'ACH routing number', avgTransferAmount: 2_903, riskLevel: 'medium' },
    { institution: 'Wealthfront', type: 'brokerage', productCategory: 'Investment', estimatedOutflow: 1_600_000_000, affectedCustomers: 340_000, trend: 'growing', detectionMethod: 'ACH routing number', avgTransferAmount: 4_706, riskLevel: 'medium' },
    { institution: 'Robinhood', type: 'brokerage', productCategory: 'Investment', estimatedOutflow: 1_400_000_000, affectedCustomers: 890_000, trend: 'stable', detectionMethod: 'ACH pattern analysis', avgTransferAmount: 1_573, riskLevel: 'medium' },
    { institution: 'Apple Card', type: 'fintech', productCategory: 'Credit Cards', estimatedOutflow: 1_300_000_000, affectedCustomers: 760_000, trend: 'growing', detectionMethod: 'Payee name match', avgTransferAmount: 1_711, riskLevel: 'medium' },
    { institution: 'Affirm', type: 'bnpl', productCategory: 'BNPL / Lending', estimatedOutflow: 1_200_000_000, affectedCustomers: 1_100_000, trend: 'growing', detectionMethod: 'Payee name match', avgTransferAmount: 1_091, riskLevel: 'low' },
  ];
}

export function getWinBackRecommendations(): WinBackRecommendation[] {
  return [
    {
      id: 'wb-1',
      outflowPattern: '1.24M customers sending monthly ACH to Marcus',
      competitor: 'Marcus by Goldman Sachs',
      affectedCustomers: 1_240_000,
      behavioralContext: 'Rate-sensitive savers, avg age 34, 68% detected recent income increase. TEpilot personas show "Financial Optimizer" archetype — they chase yield.',
      recommendedAction: 'Launch competitive 4.75% APY savings campaign targeting this segment. Bundle with cashback bonus on debit purchases to increase stickiness.',
      estimatedRecapture: 1_440_000_000,
      confidence: 87,
      segmentTags: ['Rate Shoppers', 'Income Growth', 'Age 25-40'],
    },
    {
      id: 'wb-2',
      outflowPattern: '145K customers with new mortgage payments to Rocket Mortgage',
      competitor: 'Rocket Mortgage',
      affectedCustomers: 145_000,
      behavioralContext: 'Home buyers aged 28-42 who started home improvement spending 3-6 months before mortgage application. Life event: "Home Purchase" detected by TEpilot.',
      recommendedAction: 'Deploy pre-emptive mortgage offer to customers showing home-buying signals (Zillow visits, furniture spending spikes) before they reach Rocket.',
      estimatedRecapture: 870_000_000,
      confidence: 79,
      segmentTags: ['Home Buyers', 'Life Event', 'Pre-emptive'],
    },
    {
      id: 'wb-3',
      outflowPattern: '890K customers funding Robinhood & Wealthfront accounts',
      competitor: 'Robinhood / Wealthfront',
      affectedCustomers: 890_000,
      behavioralContext: 'Young investors (avg age 29), 72% have subscription spending in fintech/tech. TEpilot detects "Wealth Builder" persona with growing discretionary income.',
      recommendedAction: 'Partner with in-house wealth management to offer zero-fee ETF portfolio with automated investing. Cross-sell from checking to investment account.',
      estimatedRecapture: 920_000_000,
      confidence: 74,
      segmentTags: ['Young Investors', 'Tech-Forward', 'Cross-Sell'],
    },
    {
      id: 'wb-4',
      outflowPattern: '1.1M customers with recurring Affirm payments',
      competitor: 'Affirm',
      affectedCustomers: 1_100_000,
      behavioralContext: 'BNPL users skewing younger (avg age 27), heavy e-commerce spenders. TEpilot shows high purchase frequency but lower credit utilization — prefer installments over revolving credit.',
      recommendedAction: 'Launch card-linked installment plan feature (Pay-in-4) to capture BNPL demand within existing card products. No new app required.',
      estimatedRecapture: 680_000_000,
      confidence: 82,
      segmentTags: ['BNPL Users', 'E-Commerce', 'Gen Z'],
    },
  ];
}

export function getWalletShareTrend(): WalletShareTrendPoint[] {
  return [
    { month: 'Apr 2025', outflowVolume: 1_320, flightRate: 19.8, winBackRate: 4.2 },
    { month: 'May 2025', outflowVolume: 1_380, flightRate: 20.1, winBackRate: 4.5 },
    { month: 'Jun 2025', outflowVolume: 1_410, flightRate: 20.6, winBackRate: 4.3 },
    { month: 'Jul 2025', outflowVolume: 1_450, flightRate: 21.0, winBackRate: 4.8 },
    { month: 'Aug 2025', outflowVolume: 1_520, flightRate: 21.4, winBackRate: 5.1 },
    { month: 'Sep 2025', outflowVolume: 1_490, flightRate: 21.2, winBackRate: 5.4 },
    { month: 'Oct 2025', outflowVolume: 1_540, flightRate: 21.8, winBackRate: 5.2 },
    { month: 'Nov 2025', outflowVolume: 1_580, flightRate: 22.1, winBackRate: 5.6 },
    { month: 'Dec 2025', outflowVolume: 1_620, flightRate: 22.5, winBackRate: 5.9 },
    { month: 'Jan 2026', outflowVolume: 1_680, flightRate: 22.9, winBackRate: 6.1 },
    { month: 'Feb 2026', outflowVolume: 1_710, flightRate: 23.1, winBackRate: 6.4 },
    { month: 'Mar 2026', outflowVolume: 1_750, flightRate: 23.4, winBackRate: 6.7 },
  ];
}

export function getOutflowByCategory(): Array<{ category: string; volume: number; color: string }> {
  return [
    { category: 'High-Yield Savings', volume: 8_000_000_000, color: 'hsl(217, 91%, 60%)' },
    { category: 'Mortgage Refinance', volume: 2_900_000_000, color: 'hsl(142, 71%, 45%)' },
    { category: 'Investment / Brokerage', volume: 3_000_000_000, color: 'hsl(262, 83%, 58%)' },
    { category: 'Credit Cards', volume: 1_300_000_000, color: 'hsl(25, 95%, 53%)' },
    { category: 'BNPL / Lending', volume: 1_800_000_000, color: 'hsl(340, 82%, 52%)' },
    { category: 'Insurance', volume: 1_200_000_000, color: 'hsl(48, 96%, 53%)' },
  ];
}
