import { Card, CardContent } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, TrendingUp, Activity, Target } from "lucide-react";
import type { BankwideMetrics } from "@/types/bankwide";

interface BankwideMetricsProps {
  metrics: BankwideMetrics;
}

export function BankwideMetrics({ metrics }: BankwideMetricsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    return num.toLocaleString();
  };

  const metricsData = [
    {
      title: "Total Accounts",
      value: formatNumber(metrics.totalAccounts),
      subtitle: "Across all products",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Unique Users",
      value: formatNumber(metrics.totalUsers),
      subtitle: `${metrics.avgAccountsPerUser.toFixed(2)} avg accounts/user`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Annual Spend",
      value: formatNumber(metrics.totalAnnualSpend),
      subtitle: `$${(metrics.totalAnnualSpend / metrics.totalAccounts).toFixed(0)} per account`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Active Account Rate",
      value: `${metrics.activeAccountRate.toFixed(1)}%`,
      subtitle: "Transacted in last 30 days",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Avg Spending per Year",
      value: `$${(metrics.totalAnnualSpend / metrics.totalUsers).toFixed(0)}`,
      subtitle: "Per user annually",
      icon: Target,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "Avg Transactions",
      value: metrics.avgTransactionsPerAccount.toString(),
      subtitle: "Per account/month",
      icon: TrendingUp,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="hover:shadow-lg transition-shadow bg-white border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-slate-500">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                  <p className="text-xs text-slate-500">
                    {metric.subtitle}
                  </p>
                </div>
                <div className={`${metric.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
