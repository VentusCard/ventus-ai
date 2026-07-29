export interface SubscriptionEntry {
  rank: number;
  merchant: string;
  category: string;
  subscriberCount: number;
  monthlyVolume: number;
  momChange: number;
  avgTenureMonths: number;
}

export interface SubscriptionCategory {
  category: string;
  totalSpend: number;
  subscriberCount: number;
  color: string;
}

export interface SubscriptionTrendPoint {
  month: string;
  totalSpend: number;
  newSubscribers: number;
  churnedSubscribers: number;
}

export interface ChurnSignal {
  merchant: string;
  category: string;
  cancellationRate: number;
  momCancellationChange: number;
  context: string;
  affectedCustomers: number;
}

export function getSubscriptionMetrics() {
  return {
    totalMonthlySpend: 18_420_000,
    avgSubscriptionsPerCustomer: 4.7,
    momGrowth: 3.2,
    churnRate: 2.8,
    totalActiveSubscriptions: 1_284_000,
  };
}

export function getTopSubscriptions(): SubscriptionEntry[] {
  return [
    { rank: 1, merchant: "Netflix", category: "Streaming", subscriberCount: 142_300, monthlyVolume: 2_134_500, momChange: 1.2, avgTenureMonths: 28 },
    { rank: 2, merchant: "Spotify", category: "Streaming", subscriberCount: 128_700, monthlyVolume: 1_287_000, momChange: 2.1, avgTenureMonths: 24 },
    { rank: 3, merchant: "Amazon Prime", category: "Shopping", subscriberCount: 118_400, monthlyVolume: 1_658_600, momChange: 0.8, avgTenureMonths: 36 },
    { rank: 4, merchant: "YouTube Premium", category: "Streaming", subscriberCount: 94_200, monthlyVolume: 1_130_400, momChange: 5.4, avgTenureMonths: 14 },
    { rank: 5, merchant: "Apple iCloud", category: "Software", subscriberCount: 89_100, monthlyVolume: 267_300, momChange: 3.1, avgTenureMonths: 32 },
    { rank: 6, merchant: "Disney+", category: "Streaming", subscriberCount: 76_500, monthlyVolume: 688_500, momChange: -4.2, avgTenureMonths: 18 },
    { rank: 7, merchant: "Planet Fitness", category: "Fitness", subscriberCount: 68_300, monthlyVolume: 1_707_500, momChange: 1.8, avgTenureMonths: 16 },
    { rank: 8, merchant: "DoorDash DashPass", category: "Food Delivery", subscriberCount: 62_400, monthlyVolume: 623_400, momChange: 6.3, avgTenureMonths: 10 },
    { rank: 9, merchant: "ChatGPT Plus", category: "Software", subscriberCount: 58_200, monthlyVolume: 1_164_000, momChange: 12.1, avgTenureMonths: 8 },
    { rank: 10, merchant: "Hulu", category: "Streaming", subscriberCount: 54_800, monthlyVolume: 877_200, momChange: -1.3, avgTenureMonths: 22 },
    { rank: 11, merchant: "Microsoft 365", category: "Software", subscriberCount: 51_200, monthlyVolume: 511_800, momChange: 1.6, avgTenureMonths: 30 },
    { rank: 12, merchant: "Peloton", category: "Fitness", subscriberCount: 34_500, monthlyVolume: 1_518_000, momChange: -2.8, avgTenureMonths: 20 },
    { rank: 13, merchant: "NYT Digital", category: "News", subscriberCount: 32_100, monthlyVolume: 545_700, momChange: 4.7, avgTenureMonths: 26 },
    { rank: 14, merchant: "Uber One", category: "Food Delivery", subscriberCount: 29_800, monthlyVolume: 297_800, momChange: 8.2, avgTenureMonths: 7 },
    { rank: 15, merchant: "Adobe Creative Cloud", category: "Software", subscriberCount: 27_400, monthlyVolume: 1_507_000, momChange: 0.4, avgTenureMonths: 34 },
    { rank: 16, merchant: "Paramount+", category: "Streaming", subscriberCount: 24_600, monthlyVolume: 147_600, momChange: -6.1, avgTenureMonths: 12 },
    { rank: 17, merchant: "HelloFresh", category: "Food Delivery", subscriberCount: 22_300, monthlyVolume: 1_561_000, momChange: -3.5, avgTenureMonths: 9 },
    { rank: 18, merchant: "Audible", category: "Streaming", subscriberCount: 19_800, monthlyVolume: 297_000, momChange: 1.0, avgTenureMonths: 22 },
    { rank: 19, merchant: "Calm", category: "Fitness", subscriberCount: 18_200, monthlyVolume: 254_800, momChange: 2.4, avgTenureMonths: 15 },
    { rank: 20, merchant: "Wall Street Journal", category: "News", subscriberCount: 16_900, monthlyVolume: 676_000, momChange: 3.8, avgTenureMonths: 28 },
  ];
}

export function getSubscriptionCategories(): SubscriptionCategory[] {
  return [
    { category: "Streaming", totalSpend: 6_562_200, subscriberCount: 540_900, color: "#3B82F6" },
    { category: "Software", totalSpend: 3_450_100, subscriberCount: 225_900, color: "#8B5CF6" },
    { category: "Fitness", totalSpend: 3_480_300, subscriberCount: 121_000, color: "#10B981" },
    { category: "Food Delivery", totalSpend: 2_482_200, subscriberCount: 114_500, color: "#F59E0B" },
    { category: "Shopping", totalSpend: 1_658_600, subscriberCount: 118_400, color: "#EF4444" },
    { category: "News", totalSpend: 1_221_700, subscriberCount: 49_000, color: "#6366F1" },
  ];
}

export function getSubscriptionTrend(): SubscriptionTrendPoint[] {
  return [
    { month: "Apr '25", totalSpend: 15_200_000, newSubscribers: 42_000, churnedSubscribers: 28_000 },
    { month: "May '25", totalSpend: 15_480_000, newSubscribers: 45_200, churnedSubscribers: 30_100 },
    { month: "Jun '25", totalSpend: 15_310_000, newSubscribers: 38_500, churnedSubscribers: 35_800 },
    { month: "Jul '25", totalSpend: 15_670_000, newSubscribers: 50_300, churnedSubscribers: 29_400 },
    { month: "Aug '25", totalSpend: 15_920_000, newSubscribers: 48_100, churnedSubscribers: 31_200 },
    { month: "Sep '25", totalSpend: 16_150_000, newSubscribers: 44_800, churnedSubscribers: 27_600 },
    { month: "Oct '25", totalSpend: 16_540_000, newSubscribers: 52_400, churnedSubscribers: 26_800 },
    { month: "Nov '25", totalSpend: 17_020_000, newSubscribers: 58_100, churnedSubscribers: 32_500 },
    { month: "Dec '25", totalSpend: 17_680_000, newSubscribers: 64_200, churnedSubscribers: 28_900 },
    { month: "Jan '26", totalSpend: 17_410_000, newSubscribers: 41_300, churnedSubscribers: 45_200 },
    { month: "Feb '26", totalSpend: 17_890_000, newSubscribers: 55_600, churnedSubscribers: 33_100 },
    { month: "Mar '26", totalSpend: 18_420_000, newSubscribers: 60_800, churnedSubscribers: 34_700 },
  ];
}

export function getChurnSignals(): ChurnSignal[] {
  return [
    {
      merchant: "Disney+",
      category: "Streaming",
      cancellationRate: 8.4,
      momCancellationChange: 40,
      context: "Cancellation spike follows end of free-trial cohort from Q3 bundle promotion. 62% of cancellers were on the ad-supported tier.",
      affectedCustomers: 6_430,
    },
    {
      merchant: "Peloton",
      category: "Fitness",
      cancellationRate: 6.1,
      momCancellationChange: 28,
      context: "Seasonal dip correlates with spring outdoor activity increase. High overlap with running-shoe purchase signals.",
      affectedCustomers: 2_105,
    },
    {
      merchant: "Paramount+",
      category: "Streaming",
      cancellationRate: 9.2,
      momCancellationChange: 35,
      context: "Post-NFL season churn pattern. 71% male, 25-44 age range. Strong win-back potential with September re-engagement.",
      affectedCustomers: 2_263,
    },
    {
      merchant: "HelloFresh",
      category: "Food Delivery",
      cancellationRate: 7.8,
      momCancellationChange: 22,
      context: "Price sensitivity after 3rd month — most cancellers cite cost. 40% switch to Walmart+ or Instacart subscriptions within 30 days.",
      affectedCustomers: 1_739,
    },
  ];
}
