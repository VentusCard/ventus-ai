import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getSpendingTimingHighlights } from "@/lib/mockBankwideData";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import type { BankwideFilters, SpendingTimingHighlight } from "@/types/bankwide";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function weekToMonth(week: number): number {
  return Math.min(11, Math.floor((week - 1) / 4.33));
}

function aggregateWeeklyToMonthly(weeklyData: { week: number; spend: number }[]): number[] {
  const monthly = new Array(12).fill(0);
  weeklyData.forEach(({ week, spend }) => {
    monthly[weekToMonth(week)] += spend;
  });
  return monthly;
}

function getHeatColor(value: number, max: number): string {
  if (max === 0) return 'bg-slate-50';
  const intensity = value / max;
  if (intensity > 0.8) return 'bg-blue-700 text-white';
  if (intensity > 0.6) return 'bg-blue-500 text-white';
  if (intensity > 0.4) return 'bg-blue-400 text-white';
  if (intensity > 0.2) return 'bg-blue-200 text-slate-700';
  if (intensity > 0.05) return 'bg-blue-100 text-slate-600';
  return 'bg-slate-50 text-slate-400';
}

interface SeasonalSpendingHeatmapProps {
  filters: BankwideFilters;
}

export function SeasonalSpendingHeatmap({ filters }: SeasonalSpendingHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<{ category: string; month: number } | null>(null);
  const [sortBy, setSortBy] = useState<'amount' | 'predictability'>('amount');

  const highlights = useMemo(() => getSpendingTimingHighlights(filters, sortBy), [filters, sortBy]);

  const { monthlyData, globalMax } = useMemo(() => {
    let max = 0;
    const data = highlights.map(h => {
      const monthly = aggregateWeeklyToMonthly(h.weeklySpendData);
      monthly.forEach(v => { if (v > max) max = v; });
      return { ...h, monthlySpend: monthly };
    });
    return { monthlyData: data, globalMax: max };
  }, [highlights]);

  const selectedHighlight = useMemo(() => {
    if (!selectedCell) return null;
    return monthlyData.find(h => (h.subcategory || h.category) === selectedCell.category) || null;
  }, [selectedCell, monthlyData]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Click any cell to see merchant deal recommendations for that category and time window.
        </p>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setSortBy('amount')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              sortBy === 'amount' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            By Volume
          </button>
          <button
            onClick={() => setSortBy('predictability')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              sortBy === 'predictability' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            By Predictability
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2 pr-4 min-w-[220px]">
                Category
              </th>
              {MONTHS.map(m => (
                <th key={m} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2 w-[60px]">
                  {m}
                </th>
              ))}
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2 pl-4 min-w-[100px]">
                Annual
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2 pl-2 min-w-[50px]">
                Pred.
              </th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((item) => {
              const label = item.subcategory || item.category;
              return (
                <tr key={label} className="group">
                  <td className="pr-4 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-slate-700 truncate">{label}</span>
                      {item.subcategory && (
                        <span className="text-[10px] text-slate-400 truncate">({item.category})</span>
                      )}
                    </div>
                  </td>
                  {item.monthlySpend.map((spend, monthIdx) => (
                    <td key={monthIdx} className="p-0.5">
                      <Popover
                        open={selectedCell?.category === label && selectedCell?.month === monthIdx}
                        onOpenChange={(open) => {
                          if (open) setSelectedCell({ category: label, month: monthIdx });
                          else setSelectedCell(null);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className={`w-full h-8 rounded text-[10px] font-medium transition-all hover:ring-2 hover:ring-blue-400 ${getHeatColor(spend, globalMax)}`}
                          >
                            {spend > 0 ? `${(spend / 1_000_000).toFixed(0)}M` : '—'}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" side="bottom">
                          <div className="space-y-3">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{label}</p>
                              <p className="text-xs text-slate-500">{MONTHS[monthIdx]} Spend: {formatCurrency(spend)}</p>
                            </div>
                            {item.topMerchants.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Top Merchants</p>
                                {item.topMerchants.map((m, i) => (
                                  <div key={i} className="bg-slate-50 rounded-lg p-2.5">
                                    <div className="flex justify-between items-start">
                                      <span className="text-sm font-medium text-slate-800">{m.name}</span>
                                      <Badge variant="secondary" className="text-[10px] bg-slate-200 text-slate-600">
                                        {m.peakWeeks}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Annual: {formatCurrency(m.spend)}</p>
                                    <p className="text-xs text-blue-700 mt-1.5 leading-snug">{m.dealRecommendation}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="pt-2 border-t border-slate-200">
                              <p className="text-xs text-slate-600 leading-snug">
                                <Calendar className="inline w-3 h-3 mr-1 text-slate-400" />
                                {item.dealTimingRecommendation}
                              </p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  ))}
                  <td className="text-right pl-4 py-1">
                    <span className="text-sm font-semibold text-slate-800">
                      ${(item.totalAnnualSpend / 1_000_000_000).toFixed(1)}B
                    </span>
                  </td>
                  <td className="text-center pl-2 py-1">
                    <span className={`text-xs font-bold ${
                      item.predictabilityScore >= 90 ? 'text-emerald-600' :
                      item.predictabilityScore >= 75 ? 'text-blue-600' :
                      'text-amber-600'
                    }`}>
                      {item.predictabilityScore}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2">
        <span className="text-xs text-slate-500">Spend intensity:</span>
        <div className="flex gap-1">
          {['bg-slate-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-500', 'bg-blue-700'].map((c, i) => (
            <div key={i} className={`w-6 h-4 rounded ${c}`} />
          ))}
        </div>
        <span className="text-xs text-slate-400">Low → High</span>
      </div>
    </div>
  );
}
