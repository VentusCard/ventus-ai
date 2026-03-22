import { useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";
import { SeasonalSpendingHeatmap } from "./SeasonalSpendingHeatmap";
import { CategoryExtensionOpportunities } from "./CategoryExtensionOpportunities";
import { TimingIntelligenceCalendar } from "./TimingIntelligenceCalendar";
import { BankwideFilters as BankwideFiltersComponent } from "./BankwideFilters";
import { Flame, Puzzle, Calendar } from "lucide-react";
import type { BankwideFilters } from "@/types/bankwide";

export function RewardsAnalyticsDashboard() {
  const [filters, setFilters] = useState<BankwideFilters>({
    cardProducts: [],
    regions: [],
    ageRanges: [],
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Rewards Intelligence</h2>
        <p className="text-sm text-slate-500 mt-1">
          Discover which merchant deals to pursue and when to deploy them — powered by 3-level behavioral labeling, not just MCC codes.
        </p>
      </div>

      {/* Shared Filters */}
      <BankwideFiltersComponent filters={filters} onChange={setFilters} />

      {/* Section 1: Seasonal Spending Heatmap */}
      <CollapsibleCard
        title="Seasonal Spending Heatmap"
        description="12-month spending intensity across all lifestyle pillars and subcategories. Click any cell for merchant deal recommendations."
        icon={<Flame className="w-5 h-5 text-orange-500" />}
        defaultExpanded={true}
      >
        <SeasonalSpendingHeatmap filters={filters} />
      </CollapsibleCard>

      {/* Section 2: Category Extension Opportunities */}
      <CollapsibleCard
        title="Category Extension Opportunities"
        description="Cross-category deals that MCC codes would never connect. Behavioral signals reveal hidden product-market adjacencies."
        icon={<Puzzle className="w-5 h-5 text-violet-500" />}
        defaultExpanded={true}
      >
        <CategoryExtensionOpportunities />
      </CollapsibleCard>

      {/* Section 3: Timing Intelligence Calendar */}
      <CollapsibleCard
        title="Timing Intelligence Calendar"
        description="Strategic deployment windows with negotiation deadlines. Know exactly when to launch each merchant deal for maximum impact."
        icon={<Calendar className="w-5 h-5 text-blue-500" />}
        defaultExpanded={false}
      >
        <TimingIntelligenceCalendar filters={filters} />
      </CollapsibleCard>
    </div>
  );
}
