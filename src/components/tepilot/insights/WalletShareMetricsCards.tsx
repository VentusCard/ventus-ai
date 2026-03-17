import { TrendingDown, DollarSign, Building2, RotateCcw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/formatHelper";
import type { WalletShareMetricsData } from "@/types/bankwide";

interface Props {
  metrics: WalletShareMetricsData;
}

const cards = [
  { key: 'depositFlightRate' as const, label: 'Deposit Flight Rate', icon: TrendingDown, format: 'pct', trendKey: 'depositFlightTrend' as const, trendLabel: 'vs last quarter', negative: true },
  { key: 'annualOutflowVolume' as const, label: 'Annual Outflow Volume', icon: DollarSign, format: 'currency', trendKey: 'outflowTrend' as const, trendLabel: 'YoY growth', negative: true },
  { key: 'topCompetitor' as const, label: 'Top Competitor', icon: Building2, format: 'text' },
  { key: 'winBackOpportunity' as const, label: 'Win-Back Opportunity', icon: RotateCcw, format: 'currency' },
];

export function WalletShareMetricsCards({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = metrics[card.key];
        let display: string;
        if (card.format === 'pct') display = formatPercentage(value as number);
        else if (card.format === 'currency') display = formatCurrency(value as number);
        else display = value as string;

        const trend = card.trendKey ? metrics[card.trendKey] : undefined;

        return (
          <div
            key={card.key}
            className="rounded-xl border border-border bg-card p-5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</span>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{display}</p>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${card.negative ? 'text-red-400' : 'text-emerald-400'}`}>
                {card.negative ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                +{trend}% {card.trendLabel}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
