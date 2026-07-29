import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollapsibleCard } from "./CollapsibleCard";
import { getPillarTimingData, type PillarTimingEntry } from "@/lib/mockBankwideData";

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function MiniSparkBars({ monthly, color }: { monthly: number[]; color: string }) {
  const max = Math.max(...monthly);
  return (
    <div className="flex items-end gap-[2px] h-8">
      {monthly.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
          <div
            className="w-full rounded-sm transition-all"
            style={{
              height: `${(val / max) * 28}px`,
              backgroundColor: color,
              opacity: 0.25 + (val / max) * 0.75,
            }}
          />
          <span className="text-[8px] text-slate-400 leading-none">{MONTHS[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function PillarTimingGrid() {
  const data = getPillarTimingData();

  const previewContent = (
    <div className="text-sm text-slate-500">
      Seasonal spending patterns across 12 pillars — Travel peaks in summer, Health & Wellness surges Q1, Tech ramps Q4.
    </div>
  );

  return (
    <CollapsibleCard
      defaultExpanded={true}
      title="Pillar Seasonal Timing Intelligence"
      description="Monthly spending distribution and optimal deal deployment windows per lifestyle pillar"
      icon={<Calendar className="h-5 w-5 text-primary" />}
      previewContent={previewContent}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((entry: PillarTimingEntry) => (
          <div
            key={entry.pillar}
            className="p-3 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-semibold text-slate-700 line-clamp-1">{entry.pillar}</span>
              </div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium" style={{ backgroundColor: `${entry.color}20`, color: entry.color }}>
                {entry.peakQuarter}
              </Badge>
            </div>

            {/* Sparkline */}
            <MiniSparkBars monthly={entry.monthly} color={entry.color} />

            {/* Deployment tip */}
            <p className="text-[10px] text-slate-500 mt-2 leading-tight line-clamp-2">
              {entry.deploymentTip}
            </p>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
