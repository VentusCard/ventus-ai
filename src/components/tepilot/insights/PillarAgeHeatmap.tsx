import { Users } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getPillarAgeMatrix, type PillarAgeCell } from "@/lib/mockBankwideData";
import type { BankwideFilters } from "@/types/bankwide";

interface Props {
  filters: BankwideFilters;
}

const AGE_GROUPS = ['18-24', '25-34', '35-44', '45-54', '55+'];

function formatCompact(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function getIndexColor(index: number): string {
  if (index >= 140) return 'hsl(0, 72%, 50%)';     // deep red — strong over-index
  if (index >= 120) return 'hsl(25, 90%, 52%)';     // orange
  if (index >= 110) return 'hsl(38, 92%, 50%)';     // amber
  if (index >= 90) return 'hsl(142, 60%, 45%)';     // green — average
  if (index >= 70) return 'hsl(210, 60%, 55%)';     // blue — under-index
  return 'hsl(220, 50%, 65%)';                       // cool blue — low
}

function getIndexLabel(index: number): string {
  if (index >= 140) return 'Strong Over-index';
  if (index >= 120) return 'Over-index';
  if (index >= 110) return 'Slightly Above Avg';
  if (index >= 90) return 'Average';
  if (index >= 70) return 'Below Average';
  return 'Under-index';
}

export function PillarAgeHeatmap({ filters }: Props) {
  const data = getPillarAgeMatrix(filters);
  const pillars = [...new Set(data.map(d => d.pillar))];

  const getCell = (pillar: string, age: string): PillarAgeCell | undefined =>
    data.find(d => d.pillar === pillar && d.ageGroup === age);

  // Find strongest skew for preview
  const extremes = data.filter(d => d.spendIndex >= 140 || d.spendIndex <= 50);
  const topSkew = extremes.sort((a, b) => b.spendIndex - a.spendIndex)[0];

  const previewContent = (
    <div className="text-sm text-slate-500">
      {topSkew && (
        <>
          <span className="font-medium" style={{ color: topSkew.color }}>{topSkew.pillar}</span>
          {' '}over-indexes at <span className="text-primary font-medium">{topSkew.spendIndex}</span> for ages {topSkew.ageGroup}.{' '}
        </>
      )}
      Color scale shows spend index vs average (100 = baseline).
    </div>
  );

  return (
    <CollapsibleCard
      defaultExpanded={true}
      title="Pillar × Age Group Analysis"
      description="Spend index by lifestyle pillar and demographics — 100 = average, higher = over-indexes"
      icon={<Users className="h-5 w-5 text-primary" />}
      previewContent={previewContent}
    >
      <TooltipProvider delayDuration={100}>
        <div className="overflow-x-auto">
          {/* Legend */}
          <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
            <span className="font-medium">Index Scale:</span>
            {[
              { label: '≤70 Under', color: 'hsl(220, 50%, 65%)' },
              { label: '70-90 Below', color: 'hsl(210, 60%, 55%)' },
              { label: '90-110 Avg', color: 'hsl(142, 60%, 45%)' },
              { label: '110-120 Above', color: 'hsl(38, 92%, 50%)' },
              { label: '120-140 Over', color: 'hsl(25, 90%, 52%)' },
              { label: '140+ Strong', color: 'hsl(0, 72%, 50%)' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-48">Pillar</th>
                {AGE_GROUPS.map(a => (
                  <th key={a} className="text-center py-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pillars.map(pillar => {
                const pillarColor = data.find(d => d.pillar === pillar)?.color || '#64748b';
                return (
                  <tr key={pillar} className="border-t border-slate-100">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pillarColor }} />
                        <span className="font-medium text-slate-700 text-xs">{pillar}</span>
                      </div>
                    </td>
                    {AGE_GROUPS.map(age => {
                      const cell = getCell(pillar, age);
                      if (!cell) return <td key={age} />;
                      const bgColor = getIndexColor(cell.spendIndex);
                      return (
                        <td key={age} className="py-1.5 px-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="rounded-md py-2 px-2 text-center cursor-default transition-transform hover:scale-105"
                                style={{ backgroundColor: bgColor, color: 'white' }}
                              >
                                <div className="font-bold text-xs">{cell.spendIndex}</div>
                                <div className="text-[10px] mt-0.5 opacity-85">{formatCompact(cell.spend)}</div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div className="text-xs space-y-1">
                                <div className="font-semibold">{pillar} — Age {age}</div>
                                <div>Index: {cell.spendIndex} ({getIndexLabel(cell.spendIndex)})</div>
                                <div>Spend: {formatCompact(cell.spend)}</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TooltipProvider>
    </CollapsibleCard>
  );
}
