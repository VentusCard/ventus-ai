import { MapPin } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getPillarRegionMatrix, type PillarRegionCell } from "@/lib/mockBankwideData";
import type { BankwideFilters } from "@/types/bankwide";

interface Props {
  filters: BankwideFilters;
}

const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];

function formatCompact(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function formatUsers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function getCellOpacity(spend: number, maxSpend: number) {
  const min = 0.15;
  return min + (spend / maxSpend) * (1 - min);
}

export function PillarRegionHeatmap({ filters }: Props) {
  const data = getPillarRegionMatrix(filters);
  const maxSpend = Math.max(...data.map(d => d.spend));
  const pillars = [...new Set(data.map(d => d.pillar))];

  const getCell = (pillar: string, region: string): PillarRegionCell | undefined =>
    data.find(d => d.pillar === pillar && d.region === region);

  const topRegion = REGIONS.reduce((best, r) => {
    const total = data.filter(d => d.region === r).reduce((s, d) => s + d.spend, 0);
    return total > best.total ? { region: r, total } : best;
  }, { region: '', total: 0 });

  const previewContent = (
    <div className="text-sm text-slate-500">
      <span className="text-slate-900 font-medium">{topRegion.region}</span> leads with{' '}
      <span className="text-primary font-medium">{formatCompact(topRegion.total)}</span> total pillar spend.
      Travel dominates the West; Home & Living peaks in the Midwest.
    </div>
  );

  return (
    <CollapsibleCard
      defaultExpanded={true}
      title="Pillar × Region Analysis"
      description="Spending intensity across lifestyle pillars by geographic region"
      icon={<MapPin className="h-5 w-5 text-primary" />}
      previewContent={previewContent}
    >
      <TooltipProvider delayDuration={100}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-48">Pillar</th>
                {REGIONS.map(r => (
                  <th key={r} className="text-center py-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pillars.map(pillar => {
                const color = data.find(d => d.pillar === pillar)?.color || '#64748b';
                return (
                  <tr key={pillar} className="border-t border-slate-100">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-medium text-slate-700 text-xs">{pillar}</span>
                      </div>
                    </td>
                    {REGIONS.map(region => {
                      const cell = getCell(pillar, region);
                      if (!cell) return <td key={region} />;
                      const opacity = getCellOpacity(cell.spend, maxSpend);
                      return (
                        <td key={region} className="py-1.5 px-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="rounded-md py-2 px-2 text-center cursor-default transition-transform hover:scale-105"
                                style={{
                                  backgroundColor: color,
                                  opacity,
                                  color: opacity > 0.5 ? 'white' : '#1e293b',
                                }}
                              >
                                <div className="font-bold text-xs">{formatCompact(cell.spend)}</div>
                                <div className="text-[10px] mt-0.5" style={{ opacity: 0.85 }}>{cell.percentOfRegion}%</div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div className="text-xs space-y-1">
                                <div className="font-semibold">{pillar} — {region}</div>
                                <div>Spend: {formatCompact(cell.spend)}</div>
                                <div>Users: {formatUsers(cell.userCount)}</div>
                                <div>Share of region: {cell.percentOfRegion}%</div>
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
