import { EnrichedTransaction, PillarAggregate } from "@/types/transaction";
import { AIInsights } from "@/types/lifestyle-signals";
import { aggregateByPillar } from "./aggregations";
import { isIncome } from "./transactionFlow";

export interface FinancialPlanContext {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  currentNetWorth: number;
  goals: Array<{
    name: string;
    type: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    monthlyContribution: number;
    progressPercent: number;
    timeHorizon: string;
  }>;
  retirementProfile: {
    currentAge: number;
    retirementAge: number;
    yearsToRetirement: number;
    desiredRetirementIncome: number;
    socialSecurityEstimate: number;
    currentRetirementSavings: number;
  };
  taxAdvantagedAccounts: Array<{
    type: string;
    label: string;
    currentBalance: number;
    annualContribution: number;
    maxContribution: number;
    utilizationPercent: number;
  }>;
  assetAllocation: {
    current: { stocks: number; bonds: number; cash: number; realEstate: number };
    target: { stocks: number; bonds: number; cash: number; realEstate: number };
  };
  monteCarloResults?: {
    successRate: number;
    medianOutcome: number;
    worstCase: number;
    bestCase: number;
    targetGoal: number;
  };
  rmdEstimate?: {
    clientAge: number;
    totalRMDBalance: number;
    estimatedAnnualRMD: number;
  };
}

export interface AdvisorContext {
  overview: {
    totalTransactions: number;
    totalSpend: number;
    dateRange: { start: string; end: string };
    avgTransactionAmount: number;
  };
  topPillars: Array<{
    pillar: string;
    totalSpend: number;
    percentage: number;
    transactionCount: number;
    topSubcategories: Array<{ name: string; spend: number }>;
  }>;
  travelAnalysis?: {
    totalTravelSpend: number;
    travelTransactions: number;
    destinations: string[];
    travelPeriods: Array<{ start: string; end: string; destination: string }>;
  };
  lifeEvents: Array<{
    event: string;
    confidence: number;
    evidenceCount: number;
    keyInsights: string[];
  }>;
  topMerchants: Array<{
    merchant: string;
    totalSpend: number;
    visits: number;
    category: string;
  }>;
  sampleTransactions: Array<{
    date: string;
    merchant: string;
    amount: number;
    category: string;
    subcategory: string;
  }>;
  spendingTrends?: {
    monthlyAverage: number;
    highestSpendMonth?: string;
    growthRate?: number;
  };
  clientPsychology?: Array<{
    aspect: string;
    assessment: string;
    confidence: number;
  }>;
  financialPlan?: FinancialPlanContext;
}

export function buildAdvisorContext(
  transactions: EnrichedTransaction[],
  aiInsights: AIInsights | null
): AdvisorContext {
  if (transactions.length === 0) {
    return {
      overview: {
        totalTransactions: 0,
        totalSpend: 0,
        dateRange: { start: "", end: "" },
        avgTransactionAmount: 0,
      },
      topPillars: [],
      lifeEvents: [],
      topMerchants: [],
      sampleTransactions: [],
    };
  }

  // Overview Statistics
  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
  const dateRange = {
    start: dates[0].toISOString().split('T')[0],
    end: dates[dates.length - 1].toISOString().split('T')[0],
  };

  // Pillar Aggregations
  const pillarAggregates = aggregateByPillar(transactions);
  const topPillars = pillarAggregates
    .slice(0, 10)
    .map(p => ({
      pillar: p.pillar,
      totalSpend: Math.round(p.totalSpend),
      percentage: Math.round((p.totalSpend / totalSpend) * 100),
      transactionCount: p.transactionCount,
      topSubcategories: p.subcategories
        .slice(0, 3)
        .map(s => ({ name: s.subcategory, spend: Math.round(s.totalSpend) })),
    }));

  // Travel Analysis
  const travelTransactions = transactions.filter(
    t => t.trip_label
  );
  const travelSpend = travelTransactions.reduce((sum, t) => sum + t.amount, 0);
  const destinations = Array.from(
    new Set(
      travelTransactions
        .map(t => t.travel_context?.travel_destination)
        .filter(Boolean)
    )
  ) as string[];

  const travelPeriods = Array.from(
    new Set(
      travelTransactions
        .filter(t => t.travel_context?.travel_period_start)
        .map(t => JSON.stringify({
          start: t.travel_context!.travel_period_start!,
          end: t.travel_context!.travel_period_end!,
          destination: t.travel_context!.travel_destination!,
        }))
    )
  ).map(str => JSON.parse(str));

  const travelAnalysis = travelTransactions.length > 0 ? {
    totalTravelSpend: Math.round(travelSpend),
    travelTransactions: travelTransactions.length,
    destinations,
    travelPeriods,
  } : undefined;

  // Life Events from AI
  const lifeEvents = aiInsights?.detected_events.map(event => ({
    event: event.event_name,
    confidence: Math.round(event.confidence),
    evidenceCount: event.evidence.length,
    keyInsights: event.evidence.slice(0, 3).map(e => e.relevance),
  })) || [];

  // Top Merchants
  const merchantMap = new Map<string, { spend: number; visits: number; category: string }>();
  transactions.forEach(t => {
    const merchant = t.normalized_merchant || t.merchant_name;
    const existing = merchantMap.get(merchant) || { spend: 0, visits: 0, category: t.pillar };
    merchantMap.set(merchant, {
      spend: existing.spend + t.amount,
      visits: existing.visits + 1,
      category: t.pillar,
    });
  });

  const topMerchants = Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({
      merchant,
      totalSpend: Math.round(data.spend),
      visits: data.visits,
      category: data.category,
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 20);

  // Sample Transactions (significant ones)
  const significantTransactions = transactions
    .filter(t => t.amount > 100) // Only significant amounts
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 50)
    .map(t => ({
      date: t.date,
      merchant: t.normalized_merchant || t.merchant_name,
      amount: Math.round(t.amount),
      category: t.pillar,
      subcategory: t.subcategory,
    }));

  // Spending Trends
  const monthlyMap = new Map<string, number>();
  transactions.forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + t.amount);
  });

  const monthlySpends = Array.from(monthlyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const monthlyAverage = totalSpend / (monthlySpends.length || 1);
  const highestSpendMonth = monthlySpends.reduce((max, curr) => 
    curr[1] > max[1] ? curr : max
  , monthlySpends[0]);

  const spendingTrends = {
    monthlyAverage: Math.round(monthlyAverage),
    highestSpendMonth: highestSpendMonth?.[0],
  };

  return {
    overview: {
      totalTransactions: transactions.length,
      totalSpend: Math.round(totalSpend),
      dateRange,
      avgTransactionAmount: Math.round(totalSpend / transactions.length),
    },
    topPillars,
    travelAnalysis,
    lifeEvents,
    topMerchants,
    sampleTransactions: significantTransactions,
    spendingTrends,
  };
}
