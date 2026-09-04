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
  GamificationMetrics,
  ManagedAchievement,
  PillarDeepDiveCell,
} from '@/types/bankwide';
import { PILLAR_COLORS, LIFESTYLE_PILLARS } from '@/lib/sampleData';
import { BOOK_CUSTOMERS } from '@/lib/bookScale';


// Lifestyle pillars (12 pillars matching the single customer view)
const PILLARS = LIFESTYLE_PILLARS;

// Base data: accounts per user held at 1.6, sized off the canonical book.
const TOTAL_USERS = BOOK_CUSTOMERS;
const TOTAL_ACCOUNTS = Math.round(BOOK_CUSTOMERS * 1.6);

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
    userCount: 12_124_444,
    accountCount: 18_944_445,
    avgAccountsPerUser: 1.56,
    totalSpend: 48_497_777_778,
    children: [
      { name: 'New York', type: 'state', userCount: 3_788_889, accountCount: 6_062_222, avgAccountsPerUser: 1.60, totalSpend: 15_913_333_333 },
      { name: 'Pennsylvania', type: 'state', userCount: 2_728_000, accountCount: 4_243_556, avgAccountsPerUser: 1.56, totalSpend: 10_912_000_000 },
      { name: 'Massachusetts', type: 'state', userCount: 1_818_666, accountCount: 2_879_556, avgAccountsPerUser: 1.58, totalSpend: 7_577_777_778 },
      { name: 'New Jersey', type: 'state', userCount: 1_667_111, accountCount: 2_576_444, avgAccountsPerUser: 1.55, totalSpend: 6_668_444_445 },
      { name: 'Other Northeast', type: 'state', userCount: 2_121_778, accountCount: 3_182_667, avgAccountsPerUser: 1.50, totalSpend: 7_426_222_222 }
    ]
  },
  {
    name: 'Southeast',
    type: 'region',
    userCount: 15_155_556,
    accountCount: 22_733_333,
    avgAccountsPerUser: 1.50,
    totalSpend: 57_591_111_111,
    children: [
      { name: 'Florida', type: 'state', userCount: 4_243_556, accountCount: 6_365_333, avgAccountsPerUser: 1.50, totalSpend: 16_671_111_111 },
      { name: 'Georgia', type: 'state', userCount: 2_273_333, accountCount: 3_410_000, avgAccountsPerUser: 1.50, totalSpend: 8_638_666_667 },
      { name: 'North Carolina', type: 'state', userCount: 2_121_778, accountCount: 3_182_667, avgAccountsPerUser: 1.50, totalSpend: 8_032_444_444 },
      { name: 'Virginia', type: 'state', userCount: 1_818_667, accountCount: 2_728_000, avgAccountsPerUser: 1.50, totalSpend: 6_971_555_556 },
      { name: 'Other Southeast', type: 'state', userCount: 4_698_222, accountCount: 7_047_333, avgAccountsPerUser: 1.50, totalSpend: 17_277_333_333 }
    ]
  },
  {
    name: 'Midwest',
    type: 'region',
    userCount: 13_640_000,
    accountCount: 21_217_778,
    avgAccountsPerUser: 1.56,
    totalSpend: 53_044_444_445,
    children: [
      { name: 'Illinois', type: 'state', userCount: 3_031_111, accountCount: 4_698_222, avgAccountsPerUser: 1.55, totalSpend: 11_821_333_333 },
      { name: 'Ohio', type: 'state', userCount: 2_424_889, accountCount: 3_788_889, avgAccountsPerUser: 1.56, totalSpend: 9_396_444_445 },
      { name: 'Michigan', type: 'state', userCount: 2_121_778, accountCount: 3_334_222, avgAccountsPerUser: 1.57, totalSpend: 8_335_555_556 },
      { name: 'Wisconsin', type: 'state', userCount: 1_364_000, accountCount: 2_121_778, avgAccountsPerUser: 1.56, totalSpend: 5_304_444_444 },
      { name: 'Other Midwest', type: 'state', userCount: 4_698_222, accountCount: 7_274_667, avgAccountsPerUser: 1.55, totalSpend: 18_186_666_667 }
    ]
  },
  {
    name: 'Southwest',
    type: 'region',
    userCount: 12_124_444,
    accountCount: 19_702_222,
    avgAccountsPerUser: 1.63,
    totalSpend: 50_013_333_333,
    children: [
      { name: 'Texas', type: 'state', userCount: 5_304_444, accountCount: 8_638_667, avgAccountsPerUser: 1.63, totalSpend: 21_975_555_556 },
      { name: 'Arizona', type: 'state', userCount: 1_818_667, accountCount: 2_955_333, avgAccountsPerUser: 1.62, totalSpend: 7_426_222_222 },
      { name: 'Oklahoma', type: 'state', userCount: 1_212_444, accountCount: 1_970_222, avgAccountsPerUser: 1.63, totalSpend: 5_001_333_333 },
      { name: 'New Mexico', type: 'state', userCount: 909_333, accountCount: 1_485_244, avgAccountsPerUser: 1.63, totalSpend: 3_788_888_889 },
      { name: 'Other Southwest', type: 'state', userCount: 2_879_556, accountCount: 4_652_756, avgAccountsPerUser: 1.62, totalSpend: 11_821_333_333 }
    ]
  },
  {
    name: 'West',
    type: 'region',
    userCount: 15_155_556,
    accountCount: 24_248_889,
    avgAccountsPerUser: 1.60,
    totalSpend: 63_653_333_333,
    children: [
      { name: 'California', type: 'state', userCount: 7_577_778, accountCount: 12_124_445, avgAccountsPerUser: 1.60, totalSpend: 31_826_666_666 },
      { name: 'Washington', type: 'state', userCount: 1_818_667, accountCount: 2_909_867, avgAccountsPerUser: 1.60, totalSpend: 7_577_777_778 },
      { name: 'Oregon', type: 'state', userCount: 1_212_445, accountCount: 1_939_911, avgAccountsPerUser: 1.60, totalSpend: 5_001_333_333 },
      { name: 'Nevada', type: 'state', userCount: 909_333, accountCount: 1_454_933, avgAccountsPerUser: 1.60, totalSpend: 3_788_888_889 },
      { name: 'Other West', type: 'state', userCount: 3_637_333, accountCount: 5_819_733, avgAccountsPerUser: 1.60, totalSpend: 15_458_666_667 }
    ]
  }
];

// Age ranges
export const AGE_RANGES: AgeRange[] = [
  {
    range: '18-24',
    label: 'Gen Z',
    userCount: 7_577_778,
    accountCount: 9_093_333,
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
    userCount: 18_186_667,
    accountCount: 27_280_000,
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
    userCount: 15_155_555,
    accountCount: 24_248_889,
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
    userCount: 13_640_000,
    accountCount: 22_733_333,
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
    userCount: 9_093_333,
    accountCount: 15_155_556,
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
    userCount: 4_546_667,
    accountCount: 7_577_778,
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
    // Competitor financial institutions
    { institution: 'Marcus by Goldman Sachs', type: 'neobank', productCategory: 'High-Yield Savings', estimatedOutflow: 4_800_000_000, affectedCustomers: 1_240_000, trend: 'growing', detectionMethod: 'ACH routing number', avgTransferAmount: 3_870, riskLevel: 'high' },
    { institution: 'Ally Bank', type: 'neobank', productCategory: 'High-Yield Savings', estimatedOutflow: 3_200_000_000, affectedCustomers: 980_000, trend: 'growing', detectionMethod: 'ACH routing number', avgTransferAmount: 3_265, riskLevel: 'high' },
    { institution: 'Rocket Mortgage', type: 'fintech', productCategory: 'Mortgage Refinance', estimatedOutflow: 2_900_000_000, affectedCustomers: 145_000, trend: 'stable', detectionMethod: 'Payee name match', avgTransferAmount: 1_680, riskLevel: 'high' },
    { institution: 'SoFi', type: 'fintech', productCategory: 'Personal Loans', estimatedOutflow: 1_800_000_000, affectedCustomers: 620_000, trend: 'growing', detectionMethod: 'ACH routing number', avgTransferAmount: 2_903, riskLevel: 'medium' },
    { institution: 'Wealthfront', type: 'brokerage', productCategory: 'Investment', estimatedOutflow: 1_600_000_000, affectedCustomers: 340_000, trend: 'growing', detectionMethod: 'ACH routing number', avgTransferAmount: 4_706, riskLevel: 'medium' },
    { institution: 'Robinhood', type: 'brokerage', productCategory: 'Investment', estimatedOutflow: 1_400_000_000, affectedCustomers: 890_000, trend: 'stable', detectionMethod: 'ACH pattern analysis', avgTransferAmount: 1_573, riskLevel: 'medium' },
    { institution: 'Apple Card', type: 'fintech', productCategory: 'Credit Cards', estimatedOutflow: 1_300_000_000, affectedCustomers: 760_000, trend: 'growing', detectionMethod: 'Payee name match', avgTransferAmount: 1_711, riskLevel: 'medium' },
    { institution: 'Affirm', type: 'bnpl', productCategory: 'BNPL / Lending', estimatedOutflow: 1_200_000_000, affectedCustomers: 1_100_000, trend: 'growing', detectionMethod: 'Payee name match', avgTransferAmount: 1_091, riskLevel: 'low' },
    // Rent & Housing
    { institution: 'RentCafe / Yardi', type: 'rent', productCategory: 'Rent / Housing', estimatedOutflow: 6_200_000_000, affectedCustomers: 2_850_000, trend: 'stable', detectionMethod: 'Payee name match', avgTransferAmount: 1_820, riskLevel: 'high' },
    { institution: 'Apartments.com (CoStar)', type: 'rent', productCategory: 'Rent / Housing', estimatedOutflow: 3_100_000_000, affectedCustomers: 1_420_000, trend: 'growing', detectionMethod: 'ACH payee analysis', avgTransferAmount: 1_760, riskLevel: 'high' },
    // Auto Loans
    { institution: 'Toyota Financial Services', type: 'auto_loan', productCategory: 'Auto Loans', estimatedOutflow: 2_400_000_000, affectedCustomers: 680_000, trend: 'stable', detectionMethod: 'Payee name match', avgTransferAmount: 485, riskLevel: 'medium' },
    { institution: 'Capital One Auto Finance', type: 'auto_loan', productCategory: 'Auto Loans', estimatedOutflow: 1_900_000_000, affectedCustomers: 540_000, trend: 'stable', detectionMethod: 'ACH routing number', avgTransferAmount: 510, riskLevel: 'medium' },
    // Student Loans
    { institution: 'Navient', type: 'student_loan', productCategory: 'Student Loans', estimatedOutflow: 1_700_000_000, affectedCustomers: 920_000, trend: 'declining', detectionMethod: 'Payee name match', avgTransferAmount: 340, riskLevel: 'medium' },
    { institution: 'Nelnet', type: 'student_loan', productCategory: 'Student Loans', estimatedOutflow: 1_300_000_000, affectedCustomers: 710_000, trend: 'declining', detectionMethod: 'Payee name match', avgTransferAmount: 310, riskLevel: 'low' },
    // Utilities
    { institution: 'ConEdison / Duke Energy', type: 'utility', productCategory: 'Utilities', estimatedOutflow: 2_100_000_000, affectedCustomers: 3_200_000, trend: 'stable', detectionMethod: 'Payee name match', avgTransferAmount: 185, riskLevel: 'low' },
    // Insurance Premiums
    { institution: 'Geico / Progressive', type: 'insurance', productCategory: 'Insurance Premiums', estimatedOutflow: 1_900_000_000, affectedCustomers: 1_650_000, trend: 'growing', detectionMethod: 'Payee name match', avgTransferAmount: 220, riskLevel: 'low' },
    { institution: 'State Farm', type: 'insurance', productCategory: 'Insurance Premiums', estimatedOutflow: 1_400_000_000, affectedCustomers: 1_180_000, trend: 'stable', detectionMethod: 'ACH payee analysis', avgTransferAmount: 245, riskLevel: 'low' },
    // Childcare & Tuition
    { institution: 'Bright Horizons / KinderCare', type: 'childcare', productCategory: 'Childcare / Tuition', estimatedOutflow: 1_600_000_000, affectedCustomers: 380_000, trend: 'growing', detectionMethod: 'Payee name match', avgTransferAmount: 1_420, riskLevel: 'medium' },
    // Subscriptions
    { institution: 'Streaming & SaaS (aggregated)', type: 'subscription', productCategory: 'Subscriptions', estimatedOutflow: 1_100_000_000, affectedCustomers: 4_100_000, trend: 'growing', detectionMethod: 'Recurring pattern detection', avgTransferAmount: 45, riskLevel: 'low' },
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
      outflowVolume: 4_200_000_000,
      avgTransferAmount: 3_387,
      topPersona: 'Financial Optimizer',
      timeToAction: 'Act within 14 days',
      channelStrategy: ['In-App', 'Email', 'Push'],
      successMetric: 'Deposit return within 60 days',
      trend: 'growing',
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
      outflowVolume: 2_610_000_000,
      avgTransferAmount: 18_000,
      topPersona: 'Aspirational Homeowner',
      timeToAction: 'Act within 30 days',
      channelStrategy: ['Branch', 'Email', 'Phone'],
      successMetric: 'Mortgage application started within 45 days',
      trend: 'stable',
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
      outflowVolume: 1_780_000_000,
      avgTransferAmount: 2_000,
      topPersona: 'Wealth Builder',
      timeToAction: 'Act within 21 days',
      channelStrategy: ['In-App', 'Push', 'Email'],
      successMetric: 'Investment account opened within 30 days',
      trend: 'growing',
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
      outflowVolume: 1_320_000_000,
      avgTransferAmount: 1_200,
      topPersona: 'Digital Shopper',
      timeToAction: 'Act within 7 days',
      channelStrategy: ['In-App', 'Push'],
      successMetric: 'Pay-in-4 adoption within 14 days',
      trend: 'growing',
    },
    {
      id: 'wb-5',
      outflowPattern: '2.85M customers with monthly rent ACH to property management platforms',
      competitor: 'RentCafe / Yardi / Apartments.com',
      affectedCustomers: 2_850_000,
      behavioralContext: 'Renters aged 22-38, 41% show income growth signals. TEpilot detects "Aspirational Homeowner" persona — high savings rate alongside rent payments suggests mortgage readiness.',
      recommendedAction: 'Offer rent-reporting to credit bureaus as a free perk. Cross-sell first-time homebuyer mortgage products to renters with 12+ months of on-time ACH rent payments.',
      estimatedRecapture: 1_860_000_000,
      confidence: 76,
      segmentTags: ['Renters', 'Homebuyer Pipeline', 'Credit Building'],
      outflowVolume: 5_130_000_000,
      avgTransferAmount: 1_800,
      topPersona: 'Aspirational Homeowner',
      timeToAction: 'Act within 60 days',
      channelStrategy: ['Email', 'In-App', 'Branch'],
      successMetric: 'Credit report opt-in within 30 days',
      trend: 'stable',
    },
    {
      id: 'wb-6',
      outflowPattern: '1.22M customers with auto loan payments to external lenders',
      competitor: 'Toyota Financial / Capital One Auto',
      affectedCustomers: 1_220_000,
      behavioralContext: 'Auto loan holders with avg remaining balance of $18K. TEpilot detects 34% have improved credit scores since origination — prime candidates for refinancing at lower rates.',
      recommendedAction: 'Launch auto refi campaign targeting customers whose credit profile has improved since original loan. Offer 0.5% rate reduction with automatic payment from checking.',
      estimatedRecapture: 720_000_000,
      confidence: 81,
      segmentTags: ['Auto Refi', 'Credit Improved', 'Rate Reduction'],
      outflowVolume: 2_196_000_000,
      avgTransferAmount: 1_800,
      topPersona: 'Practical Optimizer',
      timeToAction: 'Act within 30 days',
      channelStrategy: ['Email', 'Phone', 'Branch'],
      successMetric: 'Refi application within 45 days',
      trend: 'declining',
    },
    {
      id: 'wb-7',
      outflowPattern: '920K customers with student loan payments to Navient/Nelnet',
      competitor: 'Navient / Nelnet',
      affectedCustomers: 920_000,
      behavioralContext: 'Graduates aged 24-35 with avg $32K remaining balance. TEpilot shows "Career Ascender" persona — rising income but debt burden limiting investment and savings growth.',
      recommendedAction: 'Offer student loan consolidation with employer contribution matching program. Bundle with high-yield savings to redirect freed-up cash flow.',
      estimatedRecapture: 540_000_000,
      confidence: 72,
      segmentTags: ['Student Debt', 'Young Professionals', 'Consolidation'],
      outflowVolume: 2_944_000_000,
      avgTransferAmount: 3_200,
      topPersona: 'Career Ascender',
      timeToAction: 'Act within 45 days',
      channelStrategy: ['Email', 'In-App', 'Push'],
      successMetric: 'Consolidation inquiry within 30 days',
      trend: 'stable',
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
    { category: 'Rent / Housing', volume: 9_300_000_000, color: 'hsl(20, 90%, 55%)' },
    { category: 'High-Yield Savings', volume: 8_000_000_000, color: 'hsl(217, 91%, 60%)' },
    { category: 'Auto Loans', volume: 4_300_000_000, color: 'hsl(35, 92%, 50%)' },
    { category: 'Insurance Premiums', volume: 3_300_000_000, color: 'hsl(48, 96%, 53%)' },
    { category: 'Student Loans', volume: 3_000_000_000, color: 'hsl(280, 70%, 55%)' },
    { category: 'Investment / Brokerage', volume: 3_000_000_000, color: 'hsl(262, 83%, 58%)' },
    { category: 'Mortgage Refinance', volume: 2_900_000_000, color: 'hsl(142, 71%, 45%)' },
    { category: 'Utilities', volume: 2_100_000_000, color: 'hsl(180, 60%, 45%)' },
    { category: 'BNPL / Lending', volume: 1_800_000_000, color: 'hsl(340, 82%, 52%)' },
    { category: 'Childcare / Tuition', volume: 1_600_000_000, color: 'hsl(310, 65%, 50%)' },
    { category: 'Credit Cards', volume: 1_300_000_000, color: 'hsl(25, 95%, 53%)' },
    { category: 'Subscriptions', volume: 1_100_000_000, color: 'hsl(200, 75%, 50%)' },
  ];
}

export function getGamificationMetrics(): GamificationMetrics {
  const achievements: ManagedAchievement[] = [
    { id: "a1", title: "Diversified Spender", description: "Spend in 5+ lifestyle pillars within 90 days", icon: "Trophy", category: "Spending Diversity", targetValue: 5, triggerLogic: "Unique pillar count ≥ 5 in rolling 90d", isActive: true, completionRate: 72, inProgressRate: 18, reward: { type: "points", value: 500, fulfillment: "automatic", monthlyBudgetCap: 200000 } },
    { id: "a2", title: "Wellness Investor", description: "Spend $200+ on health & wellness in a month", icon: "Heart", category: "Wellness", targetValue: 200, triggerLogic: "Health & Wellness pillar monthly spend ≥ $200", isActive: true, completionRate: 23, inProgressRate: 34, reward: { type: "gift_card", value: 10, merchantName: "Target", fulfillment: "automatic", monthlyBudgetCap: 80000 } },
    { id: "a3", title: "Travel Planner", description: "Book 2+ trips with advance booking (30+ days out)", icon: "Plane", category: "Travel", targetValue: 2, triggerLogic: "Travel bookings ≥ 2 with lead time > 30 days", isActive: true, completionRate: 14, inProgressRate: 22, reward: { type: "cashback", value: 3, fulfillment: "automatic", monthlyBudgetCap: 150000 } },
    { id: "a4", title: "Foodie Explorer", description: "Try 10+ unique restaurant merchants in 60 days", icon: "Utensils", category: "Dining", targetValue: 10, triggerLogic: "Unique restaurant MCCs ≥ 10 in 60d", isActive: true, completionRate: 45, inProgressRate: 28, reward: { type: "points", value: 300, fulfillment: "automatic", monthlyBudgetCap: 120000 } },
    { id: "a5", title: "Home Builder", description: "Spend $500+ on home improvement in a quarter", icon: "Home", category: "Home", targetValue: 500, triggerLogic: "Home & Living pillar quarterly spend ≥ $500", isActive: true, completionRate: 31, inProgressRate: 19, reward: { type: "gift_card", value: 15, merchantName: "Amazon", fulfillment: "manual_approval", monthlyBudgetCap: 60000 } },
    { id: "a6", title: "Savings Streak", description: "Maintain positive savings flow for 3 consecutive months", icon: "TrendingUp", category: "Savings", targetValue: 3, triggerLogic: "Net savings positive for 3 consecutive months", isActive: true, completionRate: 38, inProgressRate: 25, reward: { type: "points", value: 1000, fulfillment: "automatic", monthlyBudgetCap: 100000 } },
    { id: "a7", title: "Active Lifestyle", description: "Spend across Sports & Active Living 4+ times/month", icon: "Dumbbell", category: "Engagement", targetValue: 4, triggerLogic: "Sports & Active Living txn count ≥ 4/month", isActive: true, completionRate: 29, inProgressRate: 31, reward: { type: "cashback", value: 2, fulfillment: "automatic", monthlyBudgetCap: 90000 } },
    { id: "a8", title: "Community Champion", description: "Make 3+ donations or community purchases in a quarter", icon: "Users", category: "Community", targetValue: 3, triggerLogic: "Family & Community pillar txn count ≥ 3/quarter", isActive: false, completionRate: 12, inProgressRate: 15 },
  ];

  return {
    enrolledUsers: 28_400_000,
    enrollmentRate: 63,
    avgHealthScore: 47,
    totalUnlocks: 89_200_000,
    avgUnlocksPerUser: 3.1,
    engagementLift: 18.7,
    achievements,
    recommendations: [
      { title: "Launch 'Wellness Week' Campaign", description: "Only 23% have Wellness Investor badge. Pair with health merchant deals to boost adoption by an estimated 12%.", impact: "+$4.2M annual revenue", priority: "high" },
      { title: "Travel Planner Incentive", description: "At 14% completion, add advance-booking cashback incentive. Travel planners have 2.3x higher CLV.", impact: "+$8.1M annual revenue", priority: "high" },
      { title: "Reactivate Community Champion", description: "Currently paused — 15% in progress. Re-enable with $5 donation match to drive engagement in underserved segment.", impact: "+1.2M engaged users", priority: "medium" },
    ],
  };
}

// ─── Pillar × Region Matrix ───────────────────────────────────────────────

export interface PillarRegionCell {
  pillar: string;
  region: string;
  spend: number;
  userCount: number;
  percentOfRegion: number;
  color: string;
}

export function getPillarRegionMatrix(_filters: BankwideFilters): PillarRegionCell[] {
  const regions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];
  const regionSpends = [32_000_000_000, 38_000_000_000, 35_000_000_000, 33_000_000_000, 42_000_000_000];
  const regionUsers = [8_000_000, 10_000_000, 9_000_000, 8_000_000, 10_000_000];

  // Skew multipliers per pillar per region (relative to average)
  const skews: Record<string, number[]> = {
    'Food & Dining':              [1.1, 1.0, 1.05, 0.95, 1.15],
    'Travel & Exploration':       [0.9, 1.1, 0.7,  0.85, 1.4],
    'Style & Beauty':             [1.3, 0.9, 0.85, 0.95, 1.1],
    'Home & Living':              [0.85, 1.15, 1.2, 1.1, 0.8],
    'Entertainment & Culture':    [1.2, 0.95, 0.9, 1.0, 1.15],
    'Health & Wellness':          [1.0, 0.9, 0.95, 1.1, 1.3],
    'Financial & Aspirational':   [1.25, 0.85, 0.9, 0.95, 1.15],
    'Family & Community':         [0.9, 1.2, 1.15, 1.1, 0.8],
    'Sports & Active Living':     [0.85, 1.0, 1.2, 1.15, 1.1],
    'Technology & Digital Life':   [1.15, 0.85, 0.9, 0.95, 1.35],
    'Pets':                       [0.9, 1.1, 1.15, 1.05, 0.9],
    'Miscellaneous & Unclassified': [1.0, 1.0, 1.0, 1.0, 1.0],
  };

  // Base pillar share of total spend
  const pillarShares: Record<string, number> = {
    'Food & Dining': 0.16,
    'Travel & Exploration': 0.14,
    'Style & Beauty': 0.13,
    'Home & Living': 0.09,
    'Entertainment & Culture': 0.10,
    'Health & Wellness': 0.06,
    'Financial & Aspirational': 0.04,
    'Family & Community': 0.05,
    'Sports & Active Living': 0.12,
    'Technology & Digital Life': 0.05,
    'Pets': 0.04,
    'Miscellaneous & Unclassified': 0.02,
  };

  const result: PillarRegionCell[] = [];
  for (const pillar of PILLARS) {
    const baseShare = pillarShares[pillar] || 0.05;
    const pillarSkews = skews[pillar] || [1, 1, 1, 1, 1];
    for (let r = 0; r < regions.length; r++) {
      const spend = Math.round(regionSpends[r] * baseShare * pillarSkews[r]);
      const userCount = Math.round(regionUsers[r] * baseShare * pillarSkews[r] * 0.6);
      const percentOfRegion = +((spend / regionSpends[r]) * 100).toFixed(1);
      result.push({
        pillar,
        region: regions[r],
        spend,
        userCount,
        percentOfRegion,
        color: PILLAR_COLORS[pillar] || '#64748b',
      });
    }
  }
  return result;
}

// ─── Pillar × Age Matrix ──────────────────────────────────────────────────

export interface PillarAgeCell {
  pillar: string;
  ageGroup: string;
  spend: number;
  spendIndex: number; // 100 = average
  color: string;
}

export function getPillarAgeMatrix(_filters: BankwideFilters): PillarAgeCell[] {
  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
  const ageBaseSpend = [10_800_000_000, 46_800_000_000, 51_200_000_000, 51_000_000_000, 33_000_000_000];

  // Index multipliers: which pillars over/under-index by age (100 = avg)
  const indices: Record<string, number[]> = {
    'Food & Dining':              [130, 120, 100, 90, 85],
    'Travel & Exploration':       [60,  90,  110, 135, 140],
    'Style & Beauty':             [155, 130, 95,  80, 70],
    'Home & Living':              [40,  80,  130, 120, 110],
    'Entertainment & Culture':    [145, 125, 95,  80, 65],
    'Health & Wellness':          [70,  85,  100, 115, 145],
    'Financial & Aspirational':   [45,  80,  110, 130, 135],
    'Family & Community':         [50,  90,  140, 120, 95],
    'Sports & Active Living':     [120, 130, 105, 85, 65],
    'Technology & Digital Life':   [150, 140, 100, 70, 50],
    'Pets':                       [80,  100, 120, 110, 95],
    'Miscellaneous & Unclassified': [100, 100, 100, 100, 100],
  };

  const pillarShares: Record<string, number> = {
    'Food & Dining': 0.16, 'Travel & Exploration': 0.14, 'Style & Beauty': 0.13,
    'Home & Living': 0.09, 'Entertainment & Culture': 0.10, 'Health & Wellness': 0.06,
    'Financial & Aspirational': 0.04, 'Family & Community': 0.05,
    'Sports & Active Living': 0.12, 'Technology & Digital Life': 0.05,
    'Pets': 0.04, 'Miscellaneous & Unclassified': 0.02,
  };

  const result: PillarAgeCell[] = [];
  for (const pillar of PILLARS) {
    const baseShare = pillarShares[pillar] || 0.05;
    const pillarIndices = indices[pillar] || [100, 100, 100, 100, 100];
    for (let a = 0; a < ageGroups.length; a++) {
      const idx = pillarIndices[a];
      const spend = Math.round(ageBaseSpend[a] * baseShare * (idx / 100));
      result.push({
        pillar,
        ageGroup: ageGroups[a],
        spend,
        spendIndex: idx,
        color: PILLAR_COLORS[pillar] || '#64748b',
      });
    }
  }
  return result;
}

// ─── Pillar Timing / Seasonality ──────────────────────────────────────────

export interface PillarTimingEntry {
  pillar: string;
  monthly: number[]; // 12 values (Jan-Dec), normalized 0-100
  peakQuarter: string;
  deploymentTip: string;
  color: string;
}

export function getPillarTimingData(): PillarTimingEntry[] {
  return [
    { pillar: 'Food & Dining', monthly: [70, 65, 72, 78, 82, 85, 88, 90, 80, 75, 95, 100], peakQuarter: 'Q4', deploymentTip: 'Activate holiday dining deals in Oct for seasonal ramp', color: PILLAR_COLORS['Food & Dining'] },
    { pillar: 'Travel & Exploration', monthly: [40, 45, 60, 75, 85, 100, 95, 90, 70, 50, 45, 55], peakQuarter: 'Q2-Q3', deploymentTip: 'Launch travel promotions by April to capture summer bookings', color: PILLAR_COLORS['Travel & Exploration'] },
    { pillar: 'Style & Beauty', monthly: [65, 60, 75, 80, 85, 78, 72, 88, 92, 85, 95, 100], peakQuarter: 'Q4', deploymentTip: 'Back-to-school Aug push + holiday gifting Nov-Dec', color: PILLAR_COLORS['Style & Beauty'] },
    { pillar: 'Home & Living', monthly: [55, 60, 80, 90, 95, 100, 85, 80, 75, 70, 65, 60], peakQuarter: 'Q2', deploymentTip: 'Spring home improvement surge — activate deals by March', color: PILLAR_COLORS['Home & Living'] },
    { pillar: 'Entertainment & Culture', monthly: [60, 55, 65, 70, 80, 90, 95, 85, 75, 80, 90, 100], peakQuarter: 'Q4', deploymentTip: 'Summer concerts + holiday entertainment peak — dual activation', color: PILLAR_COLORS['Entertainment & Culture'] },
    { pillar: 'Health & Wellness', monthly: [100, 95, 85, 75, 70, 72, 68, 65, 80, 78, 70, 60], peakQuarter: 'Q1', deploymentTip: 'New Year resolution surge — activate wellness deals in Jan', color: PILLAR_COLORS['Health & Wellness'] },
    { pillar: 'Financial & Aspirational', monthly: [90, 85, 95, 100, 60, 55, 50, 55, 70, 80, 75, 85], peakQuarter: 'Q1', deploymentTip: 'Tax season Q1 drives financial product interest', color: PILLAR_COLORS['Financial & Aspirational'] },
    { pillar: 'Family & Community', monthly: [55, 60, 65, 70, 85, 90, 80, 100, 95, 75, 70, 80], peakQuarter: 'Q3', deploymentTip: 'Back-to-school Aug peak — family spending surge', color: PILLAR_COLORS['Family & Community'] },
    { pillar: 'Sports & Active Living', monthly: [85, 80, 90, 95, 100, 95, 90, 85, 92, 88, 70, 60], peakQuarter: 'Q2', deploymentTip: 'Spring/summer sports seasons — activate by March', color: PILLAR_COLORS['Sports & Active Living'] },
    { pillar: 'Technology & Digital Life', monthly: [70, 65, 68, 72, 75, 78, 80, 82, 90, 95, 100, 98], peakQuarter: 'Q4', deploymentTip: 'Product launches Sept-Nov drive tech spending peak', color: PILLAR_COLORS['Technology & Digital Life'] },
    { pillar: 'Pets', monthly: [80, 75, 78, 82, 88, 90, 85, 80, 85, 90, 95, 100], peakQuarter: 'Q4', deploymentTip: 'Holiday pet gifting + consistent year-round spend', color: PILLAR_COLORS['Pets'] },
    { pillar: 'Miscellaneous & Unclassified', monthly: [80, 80, 85, 85, 90, 90, 85, 85, 90, 90, 95, 100], peakQuarter: 'Q4', deploymentTip: 'Seasonal general spending follows retail calendar', color: PILLAR_COLORS['Miscellaneous & Unclassified'] },
  ];
}

// ─── Pillar Deep Dive — Age × Region Heatmap ──────────────────────────────

const AGE_GROUPS = ['18-24', '25-34', '35-44', '45-54', '55+'] as const;
const GEN_LABELS: Record<string, string> = {
  '18-24': 'Gen-Z',
  '25-34': 'Millennials',
  '35-44': 'Gen-X',
  '45-54': 'Boomers I',
  '55+': 'Boomers II',
};
const REGIONS_DD = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'] as const;

// Curated subcategory insights per pillar → ageGroup → region
const SUBCATEGORY_MAP: Record<string, Record<string, Record<string, { sub: string; growth: number }>>> = {
  'Sports & Active Living': {
    '18-24': { Northeast: { sub: 'Rock Climbing', growth: 28 }, Southeast: { sub: 'Surfing', growth: 22 }, Midwest: { sub: 'CrossFit', growth: 19 }, Southwest: { sub: 'Pickleball', growth: 34 }, West: { sub: 'Skateboarding', growth: 25 } },
    '25-34': { Northeast: { sub: 'Golf', growth: 12 }, Southeast: { sub: 'Tennis', growth: 15 }, Midwest: { sub: 'Cycling', growth: 20 }, Southwest: { sub: 'Trail Running', growth: 18 }, West: { sub: 'Surfing', growth: 16 } },
    '35-44': { Northeast: { sub: 'Golf', growth: 8 }, Southeast: { sub: 'Boating', growth: 14 }, Midwest: { sub: 'Running', growth: 18 }, Southwest: { sub: 'Mountain Biking', growth: 21 }, West: { sub: 'Skiing', growth: 11 } },
    '45-54': { Northeast: { sub: 'Tennis', growth: 6 }, Southeast: { sub: 'Golf', growth: 9 }, Midwest: { sub: 'Fishing', growth: 7 }, Southwest: { sub: 'Golf', growth: 10 }, West: { sub: 'Hiking', growth: 15 } },
    '55+': { Northeast: { sub: 'Golf', growth: 4 }, Southeast: { sub: 'Fishing', growth: 5 }, Midwest: { sub: 'Bowling', growth: 3 }, Southwest: { sub: 'Walking Clubs', growth: 8 }, West: { sub: 'Hiking', growth: 22 } },
  },
  'Food & Dining': {
    '18-24': { Northeast: { sub: 'Ramen Shops', growth: 28 }, Southeast: { sub: 'Boba Tea', growth: 32 }, Midwest: { sub: 'Food Trucks', growth: 24 }, Southwest: { sub: 'Taco Joints', growth: 18 }, West: { sub: 'Poke Bowls', growth: 30 } },
    '25-34': { Northeast: { sub: 'Farm-to-Table', growth: 15 }, Southeast: { sub: 'Craft BBQ', growth: 12 }, Midwest: { sub: 'Brewpubs', growth: 17 }, Southwest: { sub: 'Mexican Fine Dining', growth: 20 }, West: { sub: 'Sushi', growth: 14 } },
    '35-44': { Northeast: { sub: 'Wine Bars', growth: 10 }, Southeast: { sub: 'Steakhouses', growth: 8 }, Midwest: { sub: 'Supper Clubs', growth: 6 }, Southwest: { sub: 'Tex-Mex', growth: 9 }, West: { sub: 'Organic Cafes', growth: 13 } },
    '45-54': { Northeast: { sub: 'Fine Dining', growth: 5 }, Southeast: { sub: 'Seafood', growth: 7 }, Midwest: { sub: 'Steakhouses', growth: 4 }, Southwest: { sub: 'Southwestern', growth: 6 }, West: { sub: 'Wine Country', growth: 11 } },
    '55+': { Northeast: { sub: 'Bakeries', growth: 3 }, Southeast: { sub: 'Southern Comfort', growth: 4 }, Midwest: { sub: 'Diners', growth: 2 }, Southwest: { sub: 'Comfort Food', growth: 5 }, West: { sub: 'Farmers Markets', growth: 8 } },
  },
  'Travel & Exploration': {
    '18-24': { Northeast: { sub: 'Hostels', growth: 35 }, Southeast: { sub: 'Beach Resorts', growth: 22 }, Midwest: { sub: 'Road Trips', growth: 28 }, Southwest: { sub: 'National Parks', growth: 31 }, West: { sub: 'Backpacking', growth: 26 } },
    '25-34': { Northeast: { sub: 'Boutique Hotels', growth: 18 }, Southeast: { sub: 'Cruises', growth: 14 }, Midwest: { sub: 'Lake Cabins', growth: 16 }, Southwest: { sub: 'Glamping', growth: 24 }, West: { sub: 'International', growth: 20 } },
    '35-44': { Northeast: { sub: 'Family Resorts', growth: 12 }, Southeast: { sub: 'Disney', growth: 10 }, Midwest: { sub: 'Waterpark Resorts', growth: 15 }, Southwest: { sub: 'Dude Ranches', growth: 19 }, West: { sub: 'Hawaii', growth: 11 } },
    '45-54': { Northeast: { sub: 'European Tours', growth: 8 }, Southeast: { sub: 'Caribbean', growth: 9 }, Midwest: { sub: 'National Parks', growth: 7 }, Southwest: { sub: 'Mexico Resorts', growth: 10 }, West: { sub: 'Alaska Cruises', growth: 13 } },
    '55+': { Northeast: { sub: 'River Cruises', growth: 6 }, Southeast: { sub: 'Gulf Coast', growth: 4 }, Midwest: { sub: 'Bus Tours', growth: 3 }, Southwest: { sub: 'RV Travel', growth: 9 }, West: { sub: 'Wine Tours', growth: 7 } },
  },
  'Health & Wellness': {
    '18-24': { Northeast: { sub: 'Pilates', growth: 32 }, Southeast: { sub: 'Yoga Studios', growth: 25 }, Midwest: { sub: 'Gym Memberships', growth: 18 }, Southwest: { sub: 'Hot Yoga', growth: 28 }, West: { sub: 'Meditation Apps', growth: 35 } },
    '25-34': { Northeast: { sub: 'Boutique Fitness', growth: 20 }, Southeast: { sub: 'Spin Classes', growth: 16 }, Midwest: { sub: 'CrossFit', growth: 14 }, Southwest: { sub: 'Wellness Retreats', growth: 22 }, West: { sub: 'Acupuncture', growth: 18 } },
    '35-44': { Northeast: { sub: 'Personal Training', growth: 10 }, Southeast: { sub: 'Spa Days', growth: 12 }, Midwest: { sub: 'Chiropractic', growth: 8 }, Southwest: { sub: 'Functional Medicine', growth: 15 }, West: { sub: 'Naturopathy', growth: 13 } },
    '45-54': { Northeast: { sub: 'Physical Therapy', growth: 6 }, Southeast: { sub: 'Golf Fitness', growth: 7 }, Midwest: { sub: 'Swimming', growth: 5 }, Southwest: { sub: 'Holistic Health', growth: 9 }, West: { sub: 'Supplements', growth: 11 } },
    '55+': { Northeast: { sub: 'Senior Yoga', growth: 4 }, Southeast: { sub: 'Water Aerobics', growth: 5 }, Midwest: { sub: 'Walking Groups', growth: 3 }, Southwest: { sub: 'Tai Chi', growth: 7 }, West: { sub: 'Senior Fitness', growth: 6 } },
  },
  'Style & Beauty': {
    '18-24': { Northeast: { sub: 'Thrift Stores', growth: 30 }, Southeast: { sub: 'Fast Fashion', growth: 22 }, Midwest: { sub: 'Sneakers', growth: 26 }, Southwest: { sub: 'Streetwear', growth: 28 }, West: { sub: 'Vintage', growth: 32 } },
    '25-34': { Northeast: { sub: 'Designer Brands', growth: 14 }, Southeast: { sub: 'Athleisure', growth: 18 }, Midwest: { sub: 'Workwear', growth: 12 }, Southwest: { sub: 'Western Wear', growth: 16 }, West: { sub: 'Sustainable Fashion', growth: 20 } },
    '35-44': { Northeast: { sub: 'Luxury Bags', growth: 8 }, Southeast: { sub: 'Jewelry', growth: 10 }, Midwest: { sub: 'Department Stores', growth: 5 }, Southwest: { sub: 'Boutiques', growth: 11 }, West: { sub: 'Skincare', growth: 15 } },
    '45-54': { Northeast: { sub: 'Fine Jewelry', growth: 6 }, Southeast: { sub: 'Cosmetics', growth: 7 }, Midwest: { sub: 'Classic Brands', growth: 4 }, Southwest: { sub: 'Spas', growth: 8 }, West: { sub: 'Anti-Aging', growth: 12 } },
    '55+': { Northeast: { sub: 'Classic Fashion', growth: 3 }, Southeast: { sub: 'Beauty Salons', growth: 4 }, Midwest: { sub: 'Catalog Shopping', growth: 2 }, Southwest: { sub: 'Comfort Brands', growth: 5 }, West: { sub: 'Dermatology', growth: 6 } },
  },
  'Home & Living': {
    '18-24': { Northeast: { sub: 'IKEA', growth: 24 }, Southeast: { sub: 'Apartment Decor', growth: 20 }, Midwest: { sub: 'Thrift Furniture', growth: 22 }, Southwest: { sub: 'Smart Home', growth: 28 }, West: { sub: 'Plant Shops', growth: 30 } },
    '25-34': { Northeast: { sub: 'Home Renovation', growth: 16 }, Southeast: { sub: 'Patio Furniture', growth: 14 }, Midwest: { sub: 'Hardware Stores', growth: 12 }, Southwest: { sub: 'Solar Panels', growth: 22 }, West: { sub: 'Interior Design', growth: 18 } },
    '35-44': { Northeast: { sub: 'Kitchen Remodel', growth: 10 }, Southeast: { sub: 'Pool Install', growth: 12 }, Midwest: { sub: 'Landscaping', growth: 8 }, Southwest: { sub: 'Outdoor Living', growth: 15 }, West: { sub: 'Smart Home', growth: 14 } },
    '45-54': { Northeast: { sub: 'Custom Furniture', growth: 6 }, Southeast: { sub: 'Deck Building', growth: 7 }, Midwest: { sub: 'Garage Systems', growth: 5 }, Southwest: { sub: 'Xeriscape', growth: 9 }, West: { sub: 'Wine Cellars', growth: 8 } },
    '55+': { Northeast: { sub: 'Downsizing', growth: 4 }, Southeast: { sub: 'Garden Centers', growth: 5 }, Midwest: { sub: 'Home Security', growth: 3 }, Southwest: { sub: 'Retirement Homes', growth: 7 }, West: { sub: 'Accessibility', growth: 6 } },
  },
  'Entertainment & Culture': {
    '18-24': { Northeast: { sub: 'Concert Tickets', growth: 30 }, Southeast: { sub: 'Music Festivals', growth: 26 }, Midwest: { sub: 'Gaming', growth: 24 }, Southwest: { sub: 'EDM Events', growth: 28 }, West: { sub: 'Streaming', growth: 22 } },
    '25-34': { Northeast: { sub: 'Broadway', growth: 14 }, Southeast: { sub: 'Live Music', growth: 16 }, Midwest: { sub: 'Sports Events', growth: 18 }, Southwest: { sub: 'Comedy Shows', growth: 15 }, West: { sub: 'Film Festivals', growth: 12 } },
    '35-44': { Northeast: { sub: 'Museums', growth: 8 }, Southeast: { sub: 'Theme Parks', growth: 10 }, Midwest: { sub: 'Family Shows', growth: 7 }, Southwest: { sub: 'Art Galleries', growth: 11 }, West: { sub: 'Wine Events', growth: 9 } },
    '45-54': { Northeast: { sub: 'Opera', growth: 5 }, Southeast: { sub: 'Jazz Clubs', growth: 6 }, Midwest: { sub: 'Symphony', growth: 4 }, Southwest: { sub: 'Art Shows', growth: 7 }, West: { sub: 'Theater', growth: 8 } },
    '55+': { Northeast: { sub: 'Classical Music', growth: 3 }, Southeast: { sub: 'Book Clubs', growth: 4 }, Midwest: { sub: 'Community Theater', growth: 2 }, Southwest: { sub: 'Cultural Tours', growth: 5 }, West: { sub: 'Art Classes', growth: 6 } },
  },
  'Technology & Digital Life': {
    '18-24': { Northeast: { sub: 'Gaming PCs', growth: 28 }, Southeast: { sub: 'VR Headsets', growth: 32 }, Midwest: { sub: 'Streaming Gear', growth: 24 }, Southwest: { sub: 'Drones', growth: 26 }, West: { sub: 'AI Tools', growth: 38 } },
    '25-34': { Northeast: { sub: 'Smart Watches', growth: 16 }, Southeast: { sub: 'Home Automation', growth: 18 }, Midwest: { sub: 'Laptops', growth: 12 }, Southwest: { sub: 'Electric Vehicles', growth: 22 }, West: { sub: 'SaaS Tools', growth: 20 } },
    '35-44': { Northeast: { sub: 'Home Office', growth: 10 }, Southeast: { sub: 'Security Cams', growth: 12 }, Midwest: { sub: 'Networking', growth: 8 }, Southwest: { sub: 'Solar Tech', growth: 14 }, West: { sub: 'Apple Products', growth: 11 } },
    '45-54': { Northeast: { sub: 'Tablets', growth: 5 }, Southeast: { sub: 'Smart TVs', growth: 7 }, Midwest: { sub: 'Printers', growth: 4 }, Southwest: { sub: 'Smart Thermostats', growth: 9 }, West: { sub: 'Phones', growth: 6 } },
    '55+': { Northeast: { sub: 'E-Readers', growth: 3 }, Southeast: { sub: 'Medical Devices', growth: 5 }, Midwest: { sub: 'Basic Phones', growth: 2 }, Southwest: { sub: 'Voice Assistants', growth: 7 }, West: { sub: 'Health Trackers', growth: 8 } },
  },
  'Family & Community': {
    '18-24': { Northeast: { sub: 'Volunteer Orgs', growth: 20 }, Southeast: { sub: 'Church Groups', growth: 15 }, Midwest: { sub: 'Youth Sports', growth: 18 }, Southwest: { sub: 'Community Gardens', growth: 22 }, West: { sub: 'Co-ops', growth: 24 } },
    '25-34': { Northeast: { sub: 'Daycare', growth: 16 }, Southeast: { sub: 'Preschool', growth: 14 }, Midwest: { sub: 'Family Outings', growth: 12 }, Southwest: { sub: 'Kids Activities', growth: 18 }, West: { sub: 'Nannies', growth: 20 } },
    '35-44': { Northeast: { sub: 'Private School', growth: 10 }, Southeast: { sub: 'Tutoring', growth: 12 }, Midwest: { sub: 'Sports Leagues', growth: 8 }, Southwest: { sub: 'Summer Camps', growth: 14 }, West: { sub: 'Music Lessons', growth: 11 } },
    '45-54': { Northeast: { sub: 'College Prep', growth: 6 }, Southeast: { sub: 'Family Vacations', growth: 7 }, Midwest: { sub: 'Community Events', growth: 5 }, Southwest: { sub: 'Family Reunions', growth: 8 }, West: { sub: 'College Tuition', growth: 9 } },
    '55+': { Northeast: { sub: 'Grandkids Gifts', growth: 4 }, Southeast: { sub: 'Church Donations', growth: 5 }, Midwest: { sub: 'Community Center', growth: 3 }, Southwest: { sub: 'Senior Groups', growth: 6 }, West: { sub: 'Estate Planning', growth: 7 } },
  },
  'Financial & Aspirational': {
    '18-24': { Northeast: { sub: 'Crypto', growth: 35 }, Southeast: { sub: 'Investing Apps', growth: 28 }, Midwest: { sub: 'Savings Apps', growth: 22 }, Southwest: { sub: 'Side Hustles', growth: 30 }, West: { sub: 'Stock Trading', growth: 32 } },
    '25-34': { Northeast: { sub: 'Index Funds', growth: 18 }, Southeast: { sub: 'Real Estate', growth: 16 }, Midwest: { sub: '401k', growth: 14 }, Southwest: { sub: 'REITs', growth: 20 }, West: { sub: 'Venture', growth: 22 } },
    '35-44': { Northeast: { sub: 'Tax Planning', growth: 10 }, Southeast: { sub: 'Insurance', growth: 8 }, Midwest: { sub: 'College Savings', growth: 12 }, Southwest: { sub: 'Property', growth: 14 }, West: { sub: 'Advisory', growth: 11 } },
    '45-54': { Northeast: { sub: 'Retirement Planning', growth: 6 }, Southeast: { sub: 'Annuities', growth: 5 }, Midwest: { sub: 'Estate Planning', growth: 7 }, Southwest: { sub: 'Downsizing', growth: 8 }, West: { sub: 'Wealth Mgmt', growth: 9 } },
    '55+': { Northeast: { sub: 'Fixed Income', growth: 3 }, Southeast: { sub: 'Medicare', growth: 4 }, Midwest: { sub: 'Social Security', growth: 2 }, Southwest: { sub: 'Pension', growth: 5 }, West: { sub: 'Trust Services', growth: 6 } },
  },
  'Pets': {
    '18-24': { Northeast: { sub: 'Dog Adoption', growth: 28 }, Southeast: { sub: 'Pet Costumes', growth: 22 }, Midwest: { sub: 'Cat Cafes', growth: 24 }, Southwest: { sub: 'Reptile Supplies', growth: 18 }, West: { sub: 'Pet Insurance', growth: 30 } },
    '25-34': { Northeast: { sub: 'Vet Care', growth: 16 }, Southeast: { sub: 'Dog Parks', growth: 14 }, Midwest: { sub: 'Pet Food', growth: 12 }, Southwest: { sub: 'Pet Tech', growth: 20 }, West: { sub: 'Premium Food', growth: 18 } },
    '35-44': { Northeast: { sub: 'Pet Sitting', growth: 10 }, Southeast: { sub: 'Boarding', growth: 8 }, Midwest: { sub: 'Grooming', growth: 7 }, Southwest: { sub: 'Dog Training', growth: 12 }, West: { sub: 'Holistic Pet Care', growth: 14 } },
    '45-54': { Northeast: { sub: 'Vet Specialists', growth: 5 }, Southeast: { sub: 'Pet Pharmacy', growth: 6 }, Midwest: { sub: 'Pet Supplies', growth: 4 }, Southwest: { sub: 'Horse Care', growth: 8 }, West: { sub: 'Pet Wellness', growth: 7 } },
    '55+': { Northeast: { sub: 'Companion Pets', growth: 3 }, Southeast: { sub: 'Bird Supplies', growth: 4 }, Midwest: { sub: 'Pet Meds', growth: 2 }, Southwest: { sub: 'Pet Grooming', growth: 5 }, West: { sub: 'Senior Pet Care', growth: 6 } },
  },
  'Miscellaneous & Unclassified': {
    '18-24': { Northeast: { sub: 'Subscriptions', growth: 20 }, Southeast: { sub: 'Gig Economy', growth: 18 }, Midwest: { sub: 'Online Shopping', growth: 16 }, Southwest: { sub: 'Marketplace Apps', growth: 22 }, West: { sub: 'Digital Services', growth: 24 } },
    '25-34': { Northeast: { sub: 'Delivery Services', growth: 14 }, Southeast: { sub: 'Moving Services', growth: 12 }, Midwest: { sub: 'Storage Units', growth: 10 }, Southwest: { sub: 'Auto Services', growth: 15 }, West: { sub: 'Ride Shares', growth: 16 } },
    '35-44': { Northeast: { sub: 'Dry Cleaning', growth: 6 }, Southeast: { sub: 'Lawn Care', growth: 8 }, Midwest: { sub: 'Car Wash', growth: 5 }, Southwest: { sub: 'Home Services', growth: 10 }, West: { sub: 'Cleaning Services', growth: 9 } },
    '45-54': { Northeast: { sub: 'Professional Services', growth: 4 }, Southeast: { sub: 'Auto Repair', growth: 5 }, Midwest: { sub: 'Handyman', growth: 3 }, Southwest: { sub: 'Pest Control', growth: 6 }, West: { sub: 'Landscaping', growth: 7 } },
    '55+': { Northeast: { sub: 'Tax Prep', growth: 2 }, Southeast: { sub: 'Legal Services', growth: 3 }, Midwest: { sub: 'Postal Services', growth: 1 }, Southwest: { sub: 'Notary', growth: 4 }, West: { sub: 'Accounting', growth: 5 } },
  },
};

// Base spend amounts by age group (younger = lower base, older = higher)
const AGE_BASE_SPEND: Record<string, number> = {
  '18-24': 1_800_000,
  '25-34': 4_200_000,
  '35-44': 5_600_000,
  '45-54': 4_800_000,
  '55+': 3_200_000,
};

// Region multipliers
const REGION_MULT: Record<string, number> = {
  Northeast: 1.15,
  Southeast: 0.95,
  Midwest: 0.85,
  Southwest: 1.05,
  West: 1.20,
};

// Spend index variation seeds per pillar (deterministic)
const PILLAR_INDEX_SEEDS: Record<string, number[][]> = {};
function seedIndex(pillar: string): number[][] {
  if (PILLAR_INDEX_SEEDS[pillar]) return PILLAR_INDEX_SEEDS[pillar];
  let h = 0;
  for (let i = 0; i < pillar.length; i++) h = (h * 31 + pillar.charCodeAt(i)) | 0;
  const matrix: number[][] = [];
  for (let a = 0; a < 5; a++) {
    const row: number[] = [];
    for (let r = 0; r < 5; r++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      row.push(70 + (h % 80)); // 70-149
    }
    matrix.push(row);
  }
  PILLAR_INDEX_SEEDS[pillar] = matrix;
  return matrix;
}

export function getPillarDeepDive(pillar: string): PillarDeepDiveCell[] {
  const color = PILLAR_COLORS[pillar] || '#64748b';
  const indexMatrix = seedIndex(pillar);
  const subMap = SUBCATEGORY_MAP[pillar] || SUBCATEGORY_MAP['Miscellaneous & Unclassified'];
  const cells: PillarDeepDiveCell[] = [];

  AGE_GROUPS.forEach((age, ai) => {
    REGIONS_DD.forEach((region, ri) => {
      const idx = indexMatrix[ai][ri];
      const baseSpend = AGE_BASE_SPEND[age] * REGION_MULT[region];
      const spend = Math.round(baseSpend * (idx / 100));
      const subEntry = subMap[age]?.[region] || { sub: 'General', growth: 5 };
      const yoy = Math.round((idx - 100) * 0.3 + subEntry.growth * 0.4);
      
      cells.push({
        ageGroup: age,
        generationLabel: GEN_LABELS[age],
        region,
        totalSpend: spend,
        spendIndex: idx,
        yoyGrowth: yoy,
        topSubcategory: subEntry.sub,
        subcategoryGrowth: subEntry.growth,
        userCount: Math.round(spend / 42),
        color,
      });
    });
  });

  return cells;
}
