import { useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";
import { SeasonalSpendingHeatmap } from "./SeasonalSpendingHeatmap";
import { CategoryExtensionOpportunities } from "./CategoryExtensionOpportunities";
import { TimingIntelligenceCalendar } from "./TimingIntelligenceCalendar";
import { BankwideFilters as BankwideFiltersComponent } from "./BankwideFilters";
import { Flame, Puzzle, Calendar, Sparkles } from "lucide-react";
import type { BankwideFilters } from "@/types/bankwide";
import { TabHeader } from "./TabHeader";

interface RewardsAnalyticsDashboardProps {
  hideHeader?: boolean;
}

export function RewardsAnalyticsDashboard({ hideHeader = false }: RewardsAnalyticsDashboardProps) {
  const [filters, setFilters] = useState<BankwideFilters>({
    cardProducts: [],
    regions: [],
    ageRanges: [],
  });

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <TabHeader
          icon={<Sparkles className="w-4 h-4" />}
          title="Next-Deal Intelligence"
          subtitle="Seasonal spend curves, category gaps, and persona affinity scoring"
          howItWorks="Ventus analyzes seasonal spend curves, category gaps, and persona affinity to recommend which deals to pursue and when to deploy them."
          whyItMatters="Maximizes deal ROI by timing rewards and perks to peak customer demand windows."
        />
      )}

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

      {/* Section 2: Lifestyle Extension Opportunities */}
      <CollapsibleCard
        title="Lifestyle Extension Opportunities"
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
