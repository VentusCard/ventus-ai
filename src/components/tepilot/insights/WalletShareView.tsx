import { WalletShareMetricsCards } from "./WalletShareMetricsCards";
import { CompetitorOutflowTable } from "./CompetitorOutflowTable";
import { OutflowByCategoryChart } from "./OutflowByCategoryChart";
import { WinBackRecommendations } from "./WinBackRecommendations";
import { WalletShareTrendChart } from "./WalletShareTrendChart";
import { getWalletShareMetrics, getCompetitorOutflows, getWinBackRecommendations, getWalletShareTrend, getOutflowByCategory } from "@/lib/mockBankwideData";
import { Info } from "lucide-react";

export function WalletShareView() {
  const metrics = getWalletShareMetrics();
  const outflows = getCompetitorOutflows();
  const winBacks = getWinBackRecommendations();
  const trend = getWalletShareTrend();
  const byCategory = getOutflowByCategory();

  return (
    <div className="space-y-6">
      {/* Differentiator banner */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Ventus Advantage</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Other platforms detect where money is leaving. Ventus AI tells you <em>why</em> — connecting outflow patterns to customer personas, life events, and behavioral signals to power precision win-back campaigns.
          </p>
        </div>
      </div>

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
