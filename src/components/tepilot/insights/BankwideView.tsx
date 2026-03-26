import { useState } from "react";
import { Microscope } from "lucide-react";
import { BankwideFilters } from "./BankwideFilters";
import { BankwideMetrics } from "./BankwideMetrics";
import { BankwidePillarExplorer } from "./BankwidePillarExplorer";
import { PillarRegionHeatmap } from "./PillarRegionHeatmap";
import { PillarAgeHeatmap } from "./PillarAgeHeatmap";
import { PillarTimingGrid } from "./PillarTimingGrid";
import { RevenueOpportunitiesCard } from "./RevenueOpportunitiesCard";
import { CrossSellMatrix } from "./CrossSellMatrix";
import { PillarDeepDiveHeatmap } from "./PillarDeepDiveHeatmap";
import { Button } from "@/components/ui/button";

import {
  getBankwideMetrics,
  getCrossSellMatrix,
  getRevenueOpportunities,
} from "@/lib/mockBankwideData";
import type { BankwideFilters as Filters } from "@/types/bankwide";

export function BankwideView() {
  const [filters, setFilters] = useState<Filters>({
    cardProducts: [],
    regions: [],
    ageRanges: [],
  });
  const [showDeepDive, setShowDeepDive] = useState(false);

  const metrics = getBankwideMetrics(filters);
  const crossSellMatrix = getCrossSellMatrix(filters);
  const revenueOpportunities = getRevenueOpportunities(filters);

  return (
    <div className="space-y-4">
      {/* Intro Text */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-lg border border-slate-200">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Lifestyle Pillar Intelligence Dashboard (Example)</h2>
        <p className="text-slate-600">
          Ventus AI's 12 lifestyle pillars consolidate millions of merchant categories into actionable consumer segments.
          Explore how spending patterns vary by <strong>region</strong>, <strong>age group</strong>, and <strong>seasonal timing</strong> across
          120 million accounts from 75 million users — and identify high-impact deployment windows for deals and campaigns.
        </p>
      </div>

      {/* Filters */}
      <BankwideFilters filters={filters} onChange={setFilters} />

      {/* Overview Metrics */}
      <BankwideMetrics metrics={metrics} />

      {/* 12-Pillar Interactive Grid */}
      <BankwidePillarExplorer filters={filters} />

      {/* Pillar Deep Dive Toggle */}
      <div className="flex justify-center">
        <Button
          variant={showDeepDive ? "default" : "outline"}
          onClick={() => setShowDeepDive(!showDeepDive)}
          className="gap-2"
        >
          <Microscope className="h-4 w-4" />
          {showDeepDive ? "Hide Pillar Deep Dive" : "Pillar Deep Dive"}
        </Button>
      </div>

      {/* Pillar Deep Dive Heatmap */}
      {showDeepDive && <PillarDeepDiveHeatmap />}

      {/* Pillar × Region Heatmap */}
      <PillarRegionHeatmap filters={filters} />

      {/* Pillar × Age Heatmap */}
      <PillarAgeHeatmap filters={filters} />

      {/* Pillar Seasonal Timing */}
      <PillarTimingGrid />

      {/* Revenue Opportunities */}
      <RevenueOpportunitiesCard opportunities={revenueOpportunities} />

      {/* Cross-Sell Matrix */}
      <CrossSellMatrix matrixData={crossSellMatrix} />
    </div>
  );
}
