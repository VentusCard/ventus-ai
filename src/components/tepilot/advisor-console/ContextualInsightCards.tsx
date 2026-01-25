import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Plane, ShoppingBag } from "lucide-react";
import { EnrichedTransaction } from "@/types/transaction";
import { aggregateByPillar } from "@/lib/aggregations";

interface ContextualInsightCardsProps {
  enrichedTransactions: EnrichedTransaction[];
}

export function ContextualInsightCards({ enrichedTransactions }: ContextualInsightCardsProps) {
  if (enrichedTransactions.length === 0) {
    return null;
  }

  // Calculate date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Compute metrics
  const totalSpend = enrichedTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Get most recent pillar data (last 30 days)
  const recentTransactions = enrichedTransactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
  const recentPillarAggregates = aggregateByPillar(recentTransactions);
  const topRecentPillar = recentPillarAggregates.sort((a, b) => b.totalSpend - a.totalSpend)[0];
  
  const travelTransactions = enrichedTransactions.filter(
    t => t.travel_context?.is_travel_related
  );
  const travelSpend = travelTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Count unique trips (assuming travel_period_start indicates unique trips)
  const uniqueTripPeriods = new Set(
    travelTransactions
      .map(t => t.travel_context?.travel_period_start)
      .filter(Boolean)
  );
  const travelTrips = uniqueTripPeriods.size;

  // Calculate trend (compare last 30 days vs previous 30 days)
  
  const recentSpend = enrichedTransactions
    .filter(t => new Date(t.date) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const previousSpend = enrichedTransactions
    .filter(t => new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const trendPercentage = previousSpend > 0 
    ? ((recentSpend - previousSpend) / previousSpend) * 100 
    : 0;

  const cards = [
    {
      icon: DollarSign,
      label: "Total Spending",
      value: `$${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      subtitle: "Last 6 months",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-600"
    },
    {
      icon: ShoppingBag,
      label: "Recent Top Category",
      value: topRecentPillar?.pillar || "N/A",
      subtitle: `$${topRecentPillar?.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 0} (30 days)`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-600"
    },
    ...(travelTrips > 0 ? [{
      icon: Plane,
      label: "Travel Activity",
      value: `${travelTrips} trip${travelTrips !== 1 ? 's' : ''}`,
      subtitle: `$${travelSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} spent`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-600"
    }] : []),
    ...(previousSpend > 0 ? [{
      icon: trendPercentage >= 0 ? TrendingUp : TrendingDown,
      label: "30-Day Trend",
      value: `${trendPercentage >= 0 ? '+' : ''}${trendPercentage.toFixed(1)}%`,
      subtitle: "vs previous month",
      color: trendPercentage >= 0 ? "text-orange-600" : "text-red-600",
      bgColor: trendPercentage >= 0 ? "bg-orange-50" : "bg-red-50",
      borderColor: trendPercentage >= 0 ? "border-orange-600" : "border-red-600"
    }] : [])
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, idx) => (
        <Card 
          key={idx} 
          className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${card.borderColor}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
            </div>
            <p className="text-lg font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
