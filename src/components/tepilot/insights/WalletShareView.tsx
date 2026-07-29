import { WalletShareMetricsCards } from "./WalletShareMetricsCards";
import { CompetitorOutflowTable } from "./CompetitorOutflowTable";
import { OutflowByCategoryChart } from "./OutflowByCategoryChart";
import { WinBackRecommendations } from "./WinBackRecommendations";
import { WalletShareTrendChart } from "./WalletShareTrendChart";
import { getWalletShareMetrics, getCompetitorOutflows, getWinBackRecommendations, getWalletShareTrend, getOutflowByCategory } from "@/lib/mockBankwideData";
import { Wallet } from "lucide-react";
import { TabHeader } from "./TabHeader";

export function WalletShareView() {
  const metrics = getWalletShareMetrics();
  const outflows = getCompetitorOutflows();
  const winBacks = getWinBackRecommendations();
  const trend = getWalletShareTrend();
  const byCategory = getOutflowByCategory();

  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Wallet className="w-4 h-4" />}
        title="Outflow Analysis"
        subtitle="ACH outflows mapped to competitor products and life obligations"
        howItWorks="Ventus traces every ACH outflow — rent, loans, subscriptions, insurance — and maps them to competitor products and life obligations using intent signals."
        whyItMatters="Sizes the exact revenue leaking to competitors and surfaces targeted win-back and cross-sell plays per segment."
      />

      {/* Headline metrics */}
      <WalletShareMetricsCards metrics={metrics} />

      {/* Two-column: chart + trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OutflowByCategoryChart data={byCategory} />
        <WalletShareTrendChart data={trend} />
      </div>

      {/* Competitor table */}
      <CompetitorOutflowTable data={outflows} />

      {/* Win-back recommendations */}
      <WinBackRecommendations data={winBacks} />
    </div>
  );
}
