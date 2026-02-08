import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Zap } from "lucide-react";
import { getCampaignMetricsSummary } from "@/lib/campaignData";

export function CampaignMetricsSummary() {
  const metrics = getCampaignMetricsSummary();

  const cards = [
    {
      label: "Active Campaigns",
      value: metrics.activeCampaigns.toString(),
      icon: Zap,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Reach",
      value: `${(metrics.totalReach / 1_000_000).toFixed(1)}M`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Revenue Generated",
      value: `$${(metrics.totalRevenue / 1_000_000).toFixed(1)}M`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Avg Activation Rate",
      value: `${metrics.avgActivationRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
