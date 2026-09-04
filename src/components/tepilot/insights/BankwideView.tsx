import { useState } from "react";
import { Microscope } from "lucide-react";
import { BankwideFilters } from "./BankwideFilters";
import { BankwideMetrics } from "./BankwideMetrics";
import { BankwidePillarExplorer } from "./BankwidePillarExplorer";
import { PillarTimingGrid } from "./PillarTimingGrid";
import { RevenueOpportunitiesCard } from "./RevenueOpportunitiesCard";
import { CrossSellMatrix } from "./CrossSellMatrix";
import { PillarDeepDiveHeatmap } from "./PillarDeepDiveHeatmap";


import {
  getBankwideMetrics,
  getCrossSellMatrix,
  getRevenueOpportunities,
} from "@/lib/mockBankwideData";
import type { BankwideFilters as Filters } from "@/types/bankwide";
import { TabHeader } from "./TabHeader";
import { BarChart3 } from "lucide-react";

export function BankwideView() {
  const [filters, setFilters] = useState<Filters>({
    cardProducts: [],
    regions: [],
    ageRanges: [],
  });
  

  const metrics = getBankwideMetrics(filters);
  const crossSellMatrix = getCrossSellMatrix(filters);
  const revenueOpportunities = getRevenueOpportunities(filters);

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<BarChart3 className="w-4 h-4" />}
        title="Lifestyle Pillar Intelligence"
        subtitle="12 lifestyle pillars across 109M accounts from 68.2M users"
        howItWorks="Ventus classifies every transaction into 12 lifestyle pillars using 3-level semantic labeling — not MCC codes. Patterns are updated in real time across your full customer base."
        whyItMatters="Reveals behavioral segments traditional BI cannot see, enabling data-driven product and campaign decisions at the portfolio level."
      />

      {/* Filters */}
      <BankwideFilters filters={filters} onChange={setFilters} />

      {/* Overview Metrics */}
      <BankwideMetrics metrics={metrics} />

      {/* 12-Pillar Interactive Grid */}
      <BankwidePillarExplorer filters={filters} />

      {/* Pillar Deep Dive Heatmap */}
      <PillarDeepDiveHeatmap />

      {/* Pillar Seasonal Timing */}
      <PillarTimingGrid />

      {/* Revenue Opportunities */}
      <RevenueOpportunitiesCard opportunities={revenueOpportunities} />

      {/* Cross-Sell Matrix */}
      <CrossSellMatrix matrixData={crossSellMatrix} />
    </div>
  );
}
