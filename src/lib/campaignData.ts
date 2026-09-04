import type { 
  Campaign, 
  CampaignTemplate, 
  AudienceSegment,
  CampaignMetrics,
} from '@/types/campaign';



// Campaign templates derived from revenue opportunities
export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  // Life Event Templates
  {
    id: 'new-parent-529',
    name: 'New Parent 529 Plan',
    description: 'Target new parents with college savings plan offers based on baby-related spending signals',
    category: 'life_event',
    iconHint: 'Baby',
    suggestedAudience: {
      targetingMode: 'life_event',
      lifeEventCriteria: {
        eventTypes: ['family'],
        minConfidence: 0.7,
        timingWindow: '0-12 months',
      },
    },
    suggestedOffer: {
      type: 'product_discount',
      value: 'First 6 months fee waived',
      validityDays: 90,
    },
    suggestedMessages: [
      {
        channel: 'email',
        subject: 'Start {first_name}\'s college fund with a special offer',
        body: 'Congratulations on your growing family! Start saving for their future with our 529 College Savings Plan.',
        ctaText: 'Open 529 Account',
        ctaLink: '/products/529-plan',
      },
    ],
    estimatedImpact: 2_400_000,
    conversionRate: 4.2,
    priority: 'high',
  },
  {
    id: 'pre-retiree-travel',
    name: 'Pre-Retiree Travel Card Upgrade',
    description: 'Target customers nearing retirement with increased travel spend for premium travel card',
    category: 'life_event',
    iconHint: 'Plane',
    suggestedAudience: {
      targetingMode: 'life_event',
      lifeEventCriteria: {
        eventTypes: ['retirement'],
        minConfidence: 0.65,
        timingWindow: '0-24 months',
      },
      demographicFilters: {
        ageRanges: ['55-64'],
        regions: [],
      },
    },
    suggestedOffer: {
      type: 'points_multiplier',
      value: '3X points on travel for first year',
      validityDays: 365,
    },
    suggestedMessages: [
      {
        channel: 'email',
        subject: 'Ready to explore, {first_name}? Here\'s 3X travel points',
        body: 'Your travel spending has increased by 40%. Upgrade to our Premium Travel Card and earn 3X points on every trip.',
        ctaText: 'Upgrade Now',
        ctaLink: '/products/premium-travel-card',
      },
    ],
    estimatedImpact: 1_800_000,
    conversionRate: 3.8,
    priority: 'high',
  },
  {
    id: 'home-purchase-heloc',
    name: 'Home Buyer HELOC Offer',
    description: 'Target customers showing home purchase signals for HELOC cross-sell',
    category: 'life_event',
    iconHint: 'Home',
    suggestedAudience: {
      targetingMode: 'life_event',
      lifeEventCriteria: {
        eventTypes: ['home'],
        minConfidence: 0.6,
      },
    },
    suggestedOffer: {
      type: 'product_discount',
      value: 'No closing costs + 0.25% rate discount',
      validityDays: 180,
    },
    suggestedMessages: [
      {
        channel: 'email',
        subject: 'Unlock your home\'s equity, {first_name}',
        body: 'As a new homeowner, access competitive HELOC rates with no closing costs.',
        ctaText: 'Learn More',
        ctaLink: '/products/heloc',
      },
    ],
    estimatedImpact: 1_500_000,
    conversionRate: 2.8,
    priority: 'medium',
  },

  // Lifestyle Cohort Templates
  {
    id: 'travel-enthusiasts-rewards',
    name: 'Travel Enthusiasts Premium',
    description: 'Target high-travel spenders for premium travel card conversion',
    category: 'lifestyle',
    iconHint: 'Plane',
    suggestedAudience: {
      targetingMode: 'lifestyle',
      lifestyleCriteria: {
        pillars: ['Travel & Exploration'],
        spendingThreshold: 'top_20',
      },
    },
    suggestedOffer: {
      type: 'points_multiplier',
      value: '5X points on first $5,000 travel spend',
      merchantPartner: 'Major Airlines',
      validityDays: 90,
    },
    suggestedMessages: [
      {
        channel: 'push',
        body: '🌍 {first_name}, your {top_pillar} spending is impressive! Earn 5X points on your next trip.',
        ctaText: 'Claim Offer',
        ctaLink: '/offers/travel-5x',
      },
    ],
    estimatedImpact: 3_200_000,
    conversionRate: 5.2,
    priority: 'high',
  },
  {
    id: 'fitness-wellness-rewards',
    name: 'Fitness Enthusiasts Wellness',
    description: 'Target fitness-focused customers with health and wellness partnership offers',
    category: 'lifestyle',
    iconHint: 'Dumbbell',
    suggestedAudience: {
      targetingMode: 'lifestyle',
      lifestyleCriteria: {
        pillars: ['Health & Wellness', 'Sports & Active Living'],
        spendingThreshold: 'top_30',
      },
    },
    suggestedOffer: {
      type: 'cashback',
      value: '10% cashback at fitness retailers',
      merchantPartner: 'Equinox, Lululemon, REI',
      validityDays: 60,
    },
    suggestedMessages: [
      {
        channel: 'in_app',
        body: 'Fuel your fitness goals with 10% cashback at top wellness brands!',
        ctaText: 'Activate Offer',
        ctaLink: '/offers/wellness-cashback',
      },
    ],
    estimatedImpact: 1_600_000,
    conversionRate: 4.5,
    priority: 'medium',
  },
  {
    id: 'foodies-dashpass',
    name: 'Foodies DashPass Premium',
    description: 'Target high food & dining spenders for delivery partnership',
    category: 'lifestyle',
    iconHint: 'UtensilsCrossed',
    suggestedAudience: {
      targetingMode: 'lifestyle',
      lifestyleCriteria: {
        pillars: ['Food & Dining'],
        spendingThreshold: 'top_20',
      },
    },
    suggestedOffer: {
      type: 'product_discount',
      value: 'Free DashPass for 6 months',
      merchantPartner: 'DoorDash',
      validityDays: 30,
    },
    suggestedMessages: [
      {
        channel: 'email',
        subject: '{first_name}, your dining rewards just got better!',
        body: 'You spend ${savings_estimate} annually on food delivery. Get free DashPass and save even more.',
        ctaText: 'Get DashPass Free',
        ctaLink: '/offers/dashpass',
      },
    ],
    estimatedImpact: 2_100_000,
    conversionRate: 6.8,
    priority: 'high',
  },
  {
    id: 'pet-parents-rewards',
    name: 'Pet Parents Loyalty',
    description: 'Target pet owners with pet store and vet partnership offers',
    category: 'lifestyle',
    iconHint: 'PawPrint',
    suggestedAudience: {
      targetingMode: 'lifestyle',
      lifestyleCriteria: {
        pillars: ['Pets'],
        spendingThreshold: 'above_average',
      },
    },
    suggestedOffer: {
      type: 'cashback',
      value: '5% cashback at pet retailers',
      merchantPartner: 'Chewy, PetSmart, Petco',
      validityDays: 90,
    },
    suggestedMessages: [
      {
        channel: 'push',
        body: '🐾 Spoil your furry friend! 5% cashback on all pet purchases.',
        ctaText: 'See Offer',
        ctaLink: '/offers/pet-cashback',
      },
    ],
    estimatedImpact: 890_000,
    conversionRate: 4.1,
    priority: 'medium',
  },

  // Cross-Sell Templates
  {
    id: 'cashback-to-travel',
    name: 'Cashback to Travel Conversion',
    description: 'Convert Cashback cardholders with high travel spend to Travel Card',
    category: 'cross_sell',
    iconHint: 'ArrowUpRight',
    suggestedAudience: {
      targetingMode: 'product',
      productCriteria: {
        hasProducts: ['Cashback Card'],
        lacksProducts: ['Travel Card', 'Premium Travel Card'],
        spendingPatterns: { 'Travel & Exploration': 'high' },
      },
    },
    suggestedOffer: {
      type: 'points_multiplier',
      value: '75,000 bonus points + first year annual fee waived',
      validityDays: 90,
    },
    suggestedMessages: [
      {
        channel: 'email',
        subject: '{first_name}, you\'re leaving travel rewards on the table',
        body: 'You spent ${savings_estimate} on travel last year with your Cashback Card. Switch to Travel Card and earn 3X points.',
        ctaText: 'Compare Cards',
        ctaLink: '/products/travel-card/compare',
      },
    ],
    estimatedImpact: 2_400_000,
    conversionRate: 3.2,
    priority: 'high',
  },
  {
    id: 'hotel-card-addon',
    name: 'Hotel Card Add-on',
    description: 'Add Hotel Card to Travel Card holders with high hotel spend',
    category: 'cross_sell',
    iconHint: 'Building2',
    suggestedAudience: {
      targetingMode: 'product',
      productCriteria: {
        hasProducts: ['Travel Card'],
        lacksProducts: ['Hotel Card'],
      },
    },
    suggestedOffer: {
      type: 'points_multiplier',
      value: '50,000 bonus points + free night certificate',
      validityDays: 60,
    },
    suggestedMessages: [
      {
        channel: 'in_app',
        body: 'Complete your travel toolkit! Add Hotel Card for 10X points on hotels.',
        ctaText: 'Add Hotel Card',
        ctaLink: '/products/hotel-card',
      },
    ],
    estimatedImpact: 890_000,
    conversionRate: 4.5,
    priority: 'medium',
  },
  {
    id: 'premium-upgrade',
    name: 'Premium Tier Upgrade',
    description: 'Upgrade high-spend basic cardholders to premium tier',
    category: 'cross_sell',
    iconHint: 'Crown',
    suggestedAudience: {
      targetingMode: 'product',
      productCriteria: {
        hasProducts: ['Cashback Card', 'Custom Cashback Card'],
        lacksProducts: ['Premium Travel Card'],
      },
    },
    suggestedOffer: {
      type: 'product_upgrade',
      value: 'First year annual fee credited back as statement credit',
      validityDays: 45,
    },
    suggestedMessages: [
      {
        channel: 'email',
        subject: 'You\'ve earned premium status, {first_name}',
        body: 'Your spending pattern qualifies you for our Premium card with enhanced benefits.',
        ctaText: 'Upgrade to Premium',
        ctaLink: '/products/premium/upgrade',
      },
    ],
    estimatedImpact: 1_950_000,
    conversionRate: 2.8,
    priority: 'medium',
  },

  // Seasonal Templates
  {
    id: 'holiday-travel-boost',
    name: 'Holiday Travel Boost',
    description: 'Seasonal campaign for holiday travel booking bonus',
    category: 'seasonal',
    iconHint: 'Snowflake',
    suggestedAudience: {
      targetingMode: 'lifestyle',
      lifestyleCriteria: {
        pillars: ['Travel & Exploration'],
        spendingThreshold: 'above_average',
      },
    },
    suggestedOffer: {
      type: 'points_multiplier',
      value: '5X points on holiday travel bookings',
      validityDays: 45,
    },
    suggestedMessages: [
      {
        channel: 'email',
        subject: '✈️ {first_name}, earn 5X on holiday travel!',
        body: 'Book your holiday trips now and earn 5X points on all travel purchases.',
        ctaText: 'Book & Earn',
        ctaLink: '/offers/holiday-travel',
      },
    ],
    estimatedImpact: 1_200_000,
    conversionRate: 5.5,
    priority: 'high',
    seasonalWindow: 'Nov 1 - Dec 31',
  },
  {
    id: 'back-to-school',
    name: 'Back-to-School Savings',
    description: 'Target parents with back-to-school spending offers',
    category: 'seasonal',
    iconHint: 'GraduationCap',
    suggestedAudience: {
      targetingMode: 'life_event',
      lifeEventCriteria: {
        eventTypes: ['education', 'family'],
        minConfidence: 0.5,
      },
    },
    suggestedOffer: {
      type: 'cashback',
      value: '5% cashback at office and school supply stores',
      merchantPartner: 'Staples, Office Depot, Target',
      validityDays: 60,
    },
    suggestedMessages: [
      {
        channel: 'push',
        body: '📚 Back-to-school savings! 5% cashback on school supplies.',
        ctaText: 'Activate Now',
        ctaLink: '/offers/back-to-school',
      },
    ],
    estimatedImpact: 950_000,
    conversionRate: 4.2,
    priority: 'medium',
    seasonalWindow: 'Jul 15 - Sep 15',
  },
  {
    id: 'tax-season-rewards',
    name: 'Tax Season Financial',
    description: 'Target high earners during tax season for financial products',
    category: 'seasonal',
    iconHint: 'Calculator',
    suggestedAudience: {
      targetingMode: 'lifestyle',
      lifestyleCriteria: {
        pillars: ['Financial & Aspirational'],
        spendingThreshold: 'top_30',
      },
    },
    suggestedOffer: {
      type: 'product_discount',
      value: 'Free financial planning consultation',
      validityDays: 90,
    },
    suggestedMessages: [
      {
        channel: 'email',
        subject: '{first_name}, maximize your tax refund',
        body: 'Tax season is here. Book a free consultation with our financial advisors.',
        ctaText: 'Book Consultation',
        ctaLink: '/services/financial-planning',
      },
    ],
    estimatedImpact: 680_000,
    conversionRate: 2.1,
    priority: 'low',
    seasonalWindow: 'Jan 15 - Apr 15',
  },
];

// Sample active campaigns for demo
export const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Q1 Travel Card Acquisition',
    objective: 'Convert Cashback holders with high travel spend',
    status: 'active',
    audience: {
      id: 'aud-001',
      name: 'Travel-Heavy Cashback Users',
      targetingMode: 'product',
      productCriteria: {
        hasProducts: ['Cashback Card'],
        lacksProducts: ['Travel Card'],
      },
      estimatedSize: 8_200_000,
    },
    messages: [
      {
        channel: 'email',
        subject: 'You\'re missing out on travel rewards',
        body: 'Switch to Travel Card and earn 3X on every trip.',
        ctaText: 'Learn More',
        ctaLink: '/products/travel-card',
      },
    ],
    offer: {
      type: 'points_multiplier',
      value: '75,000 bonus points',
      validityDays: 90,
    },
    schedule: {
      startDate: '2026-01-15',
      endDate: '2026-03-31',
    },
    budget: 2_500_000,
    createdAt: '2026-01-10',
    metrics: {
      reach: 8_200_000,
      impressions: 24_600_000,
      activations: 328_000,
      activationRate: 4.0,
      revenueGenerated: 18_400_000,
      roi: 7.36,
    },
  },
  {
    id: 'camp-002',
    name: 'New Parent 529 Campaign',
    objective: 'Cross-sell 529 plans to new parents',
    status: 'active',
    audience: {
      id: 'aud-002',
      name: 'New Parents (Baby Signal Detected)',
      targetingMode: 'life_event',
      lifeEventCriteria: {
        eventTypes: ['family'],
        minConfidence: 0.7,
      },
      estimatedSize: 4_125_000,
    },
    messages: [
      {
        channel: 'email',
        subject: 'Start their future today',
        body: 'Open a 529 College Savings Plan with no fees for 6 months.',
        ctaText: 'Open Account',
        ctaLink: '/products/529',
      },
    ],
    offer: {
      type: 'product_discount',
      value: '6 months fee waived',
      validityDays: 60,
    },
    schedule: {
      startDate: '2026-01-01',
      endDate: '2026-06-30',
    },
    budget: 1_200_000,
    createdAt: '2025-12-20',
    metrics: {
      reach: 4_125_000,
      impressions: 8_250_000,
      activations: 165_000,
      activationRate: 4.0,
      revenueGenerated: 4_950_000,
      roi: 4.13,
    },
  },
  {
    id: 'camp-003',
    name: 'Fitness Enthusiasts Q1',
    objective: 'Drive engagement with wellness merchant partners',
    status: 'scheduled',
    audience: {
      id: 'aud-003',
      name: 'Fitness & Wellness Top 20%',
      targetingMode: 'lifestyle',
      lifestyleCriteria: {
        pillars: ['Health & Wellness', 'Sports & Active Living'],
        spendingThreshold: 'top_20',
      },
      estimatedSize: 5_625_000,
    },
    messages: [
      {
        channel: 'push',
        body: '💪 New Year fitness goals? Earn 10% cashback at top gyms!',
        ctaText: 'Activate',
        ctaLink: '/offers/fitness',
      },
    ],
    offer: {
      type: 'cashback',
      value: '10% cashback',
      merchantPartner: 'Equinox, Lululemon',
      validityDays: 45,
    },
    schedule: {
      startDate: '2026-02-01',
      endDate: '2026-03-15',
    },
    budget: 800_000,
    createdAt: '2026-01-25',
  },
  {
    id: 'camp-004',
    name: 'Premium Card Winter Push',
    objective: 'Upgrade high-spend basic cardholders',
    status: 'paused',
    audience: {
      id: 'aud-004',
      name: 'High-Spend Basic Cardholders',
      targetingMode: 'product',
      productCriteria: {
        hasProducts: ['Cashback Card'],
        lacksProducts: ['Premium Travel Card'],
      },
      estimatedSize: 3_200_000,
    },
    messages: [
      {
        channel: 'email',
        subject: 'You\'ve earned premium status',
        body: 'Upgrade to Premium and get first year fee waived.',
        ctaText: 'Upgrade Now',
        ctaLink: '/products/premium',
      },
    ],
    offer: {
      type: 'product_upgrade',
      value: 'First year fee waived',
      validityDays: 30,
    },
    schedule: {
      startDate: '2026-01-01',
      endDate: '2026-02-28',
    },
    budget: 600_000,
    createdAt: '2025-12-15',
    metrics: {
      reach: 3_200_000,
      impressions: 6_400_000,
      activations: 64_000,
      activationRate: 2.0,
      revenueGenerated: 1_920_000,
      roi: 3.2,
    },
  },
];

// Get campaign metrics summary
export function getCampaignMetricsSummary() {
  const activeCampaigns = SAMPLE_CAMPAIGNS.filter(c => c.status === 'active');
  const totalReach = activeCampaigns.reduce((sum, c) => sum + c.audience.estimatedSize, 0);
  const totalRevenue = activeCampaigns.reduce((sum, c) => sum + (c.metrics?.revenueGenerated || 0), 0);
  const avgActivationRate = activeCampaigns.length > 0
    ? activeCampaigns.reduce((sum, c) => sum + (c.metrics?.activationRate || 0), 0) / activeCampaigns.length
    : 0;

  return {
    activeCampaigns: activeCampaigns.length,
    totalReach,
    totalRevenue,
    avgActivationRate,
    totalBudget: SAMPLE_CAMPAIGNS.reduce((sum, c) => sum + c.budget, 0),
  };
}
