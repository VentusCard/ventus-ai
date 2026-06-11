import { useMemo, useState } from "react";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { Route } from "lucide-react";
import { NextProductKpiStrip } from "./next-product/NextProductKpiStrip";
import { CohortFilters, type LifeStageFilter, type SortKey } from "./next-product/CohortFilters";
import { CohortProductHeatmap } from "./next-product/CohortProductHeatmap";
import { CohortDrilldownPanel } from "./next-product/CohortDrilldownPanel";
import { COHORTS, topProductFor } from "./next-product/data/cohorts";

export function SegmentTargetingView() {
  const [lifeStage, setLifeStage] = useState<LifeStageFilter>("All");
  const [sort, setSort] = useState<SortKey>("score");
  const [selectedId, setSelectedId] = useState<string | null>(COHORTS[0].id);

  const visible = useMemo(() => {
    const filtered = lifeStage === "All" ? COHORTS : COHORTS.filter((c) => c.lifeStage === lifeStage);
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "audience") return b.audience - a.audience;
      if (sort === "momentum") return b.momentum - a.momentum;
      const aTop = a.scores[topProductFor(a).id] ?? 0;
      const bTop = b.scores[topProductFor(b).id] ?? 0;
      return bTop - aTop;
    });
    return sorted;
  }, [lifeStage, sort]);

  const selected = visible.find((c) => c.id === selectedId) ?? visible[0] ?? null;

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Route className="w-4 h-4" />}
        title="Next-product"
        subtitle="Customer cohorts ranked by the product Automated Flows is most likely to fire next — read-only intelligence rolled up from live signals."
        howItWorks="Ventus aggregates every automated-flow signal across the book and scores each customer cohort against the product catalog. The heatmap shows the strongest next-product fit per cohort, with the feeding flows visible on drill-down."
        whyItMatters="Bankers see where opportunity concentrates without authoring a single campaign — and which Automated Flows are doing the heavy lifting under the hood."
      />

      <NextProductKpiStrip />
      <CohortFilters lifeStage={lifeStage} onLifeStage={setLifeStage} sort={sort} onSort={setSort} />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 min-w-0">
          <CohortProductHeatmap
            cohorts={visible}
            selectedId={selected?.id ?? null}
            onSelect={(id) => setSelectedId(id)}
          />
        </div>
        <div className="col-span-4 min-w-0">
          <CohortDrilldownPanel cohort={selected} />
        </div>
      </div>
    </div>
  );
}
