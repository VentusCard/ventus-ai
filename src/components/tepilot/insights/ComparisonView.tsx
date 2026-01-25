import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { BankwideMetrics } from "@/types/bankwide";

interface ComparisonViewProps {
  selectedMetrics: BankwideMetrics;
  bankAverageMetrics: BankwideMetrics;
}

export function ComparisonView({ selectedMetrics, bankAverageMetrics }: ComparisonViewProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    return num.toLocaleString();
  };

  const calculateDelta = (selected: number, average: number): number => {
    return ((selected - average) / average) * 100;
  };

  const DeltaIndicator = ({ delta }: { delta: number }) => {
    if (Math.abs(delta) < 0.5) {
      return (
        <div className="flex items-center gap-1 text-slate-500">
          <Minus className="h-4 w-4" />
          <span className="text-sm">~0%</span>
        </div>
      );
    }
    
    const isPositive = delta > 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{delta.toFixed(1)}%
        </span>
      </div>
    );
  };

  const comparisonMetrics = [
    {
      label: "Total Accounts",
      selected: formatNumber(selectedMetrics.totalAccounts),
      average: formatNumber(bankAverageMetrics.totalAccounts),
      delta: calculateDelta(selectedMetrics.totalAccounts, bankAverageMetrics.totalAccounts)
    },
    {
      label: "Unique Users",
      selected: formatNumber(selectedMetrics.totalUsers),
      average: formatNumber(bankAverageMetrics.totalUsers),
      delta: calculateDelta(selectedMetrics.totalUsers, bankAverageMetrics.totalUsers)
    },
    {
      label: "Avg Accounts per User",
      selected: selectedMetrics.avgAccountsPerUser.toFixed(2),
      average: bankAverageMetrics.avgAccountsPerUser.toFixed(2),
      delta: calculateDelta(selectedMetrics.avgAccountsPerUser, bankAverageMetrics.avgAccountsPerUser)
    },
    {
      label: "Total Annual Spend",
      selected: formatNumber(selectedMetrics.totalAnnualSpend),
      average: formatNumber(bankAverageMetrics.totalAnnualSpend),
      delta: calculateDelta(selectedMetrics.totalAnnualSpend, bankAverageMetrics.totalAnnualSpend)
    },
    {
      label: "Active Account Rate",
      selected: `${selectedMetrics.activeAccountRate.toFixed(1)}%`,
      average: `${bankAverageMetrics.activeAccountRate.toFixed(1)}%`,
      delta: calculateDelta(selectedMetrics.activeAccountRate, bankAverageMetrics.activeAccountRate)
    },
    {
      label: "Cross-Sell Rate",
      selected: `${selectedMetrics.crossSellRate.toFixed(1)}%`,
      average: `${bankAverageMetrics.crossSellRate.toFixed(1)}%`,
      delta: calculateDelta(selectedMetrics.crossSellRate, bankAverageMetrics.crossSellRate)
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison: Selected Segment vs Bank Average</CardTitle>
        <CardDescription>
          Compare key metrics between your filtered segment and the overall portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparisonMetrics.map((metric, index) => (
            <div 
              key={index} 
              className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="font-medium">{metric.label}</div>
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Selected</p>
                <p className="text-lg font-semibold text-primary">{metric.selected}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Bank Avg</p>
                <p className="text-lg font-semibold">{metric.average}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Delta</p>
                <DeltaIndicator delta={metric.delta} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm">
            <strong className="text-primary">Insight:</strong>{' '}
            {selectedMetrics.avgAccountsPerUser > bankAverageMetrics.avgAccountsPerUser
              ? `This segment shows higher cross-sell engagement with ${selectedMetrics.avgAccountsPerUser.toFixed(2)} accounts per user vs ${bankAverageMetrics.avgAccountsPerUser.toFixed(2)} bank average.`
              : `This segment has cross-sell opportunity with ${selectedMetrics.avgAccountsPerUser.toFixed(2)} accounts per user vs ${bankAverageMetrics.avgAccountsPerUser.toFixed(2)} bank average.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
