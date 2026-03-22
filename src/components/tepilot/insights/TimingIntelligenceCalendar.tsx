import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSpendingTimingHighlights } from "@/lib/mockBankwideData";
import { formatCurrency } from "@/lib/formatHelper";
import { Calendar, Clock, AlertCircle, ChevronDown, TrendingUp } from "lucide-react";
import type { BankwideFilters, SpendingTimingHighlight } from "@/types/bankwide";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseWeekRanges(peakWeeks: string): number[] {
  const weeks: number[] = [];
  const matches = peakWeeks.matchAll(/(\d+)(?:-(\d+))?/g);
  for (const m of matches) {
    const start = parseInt(m[1]);
    const end = m[2] ? parseInt(m[2]) : start;
    for (let w = start; w <= end; w++) weeks.push(w);
  }
  return weeks;
}

function weeksToMonths(weeks: number[]): number[] {
  const months = new Set<number>();
  weeks.forEach(w => months.add(Math.min(11, Math.floor((w - 1) / 4.33))));
  return Array.from(months).sort((a, b) => a - b);
}

interface TimingIntelligenceCalendarProps {
  filters: BankwideFilters;
}

export function TimingIntelligenceCalendar({ filters }: TimingIntelligenceCalendarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [view, setView] = useState<'timeline' | 'deadlines'>('timeline');

  const highlights = useMemo(() => {
    return getSpendingTimingHighlights(filters, 'predictability').map(h => ({
      ...h,
      peakMonths: weeksToMonths(parseWeekRanges(h.peakWeeks)),
      deployMonths: weeksToMonths(parseWeekRanges(h.peakWeeks).map(w => Math.max(1, w - 2))),
    }));
  }, [filters]);

  // Determine "current quarter" urgency
  const currentMonth = new Date().getMonth(); // 0-indexed
  const urgentDeals = useMemo(() => {
    return highlights.filter(h => {
      const deployStart = h.deployMonths[0] ?? 0;
      return deployStart >= currentMonth && deployStart <= currentMonth + 3;
    });
  }, [highlights, currentMonth]);

  const totalQuarterlyRevenue = urgentDeals.reduce((s, h) => s + h.totalAnnualSpend, 0);

  return (
    <div className="space-y-4">
      {/* Urgency Summary */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <div>
            <p className="text-xs text-amber-700 font-medium">
              {urgentDeals.length} deal{urgentDeals.length !== 1 ? 's' : ''} needing deployment in next 90 days
            </p>
            <p className="text-xs text-amber-500">
              {formatCurrency(totalQuarterlyRevenue)} addressable spend this quarter
            </p>
          </div>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5 ml-auto">
          <button
            onClick={() => setView('timeline')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setView('deadlines')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === 'deadlines' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Deadlines
          </button>
        </div>
      </div>

      {view === 'timeline' ? (
        <TimelineView
          highlights={highlights}
          expandedCategory={expandedCategory}
          onToggle={setExpandedCategory}
        />
      ) : (
        <DeadlineView highlights={highlights} currentMonth={currentMonth} />
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 pt-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2.5 rounded-sm bg-emerald-400" />
          <span>Deploy Window</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2.5 rounded-sm bg-blue-500" />
          <span>Peak Spending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2.5 rounded-sm bg-amber-400" />
          <span>Negotiate By</span>
        </div>
      </div>
    </div>
  );
}

function TimelineView({
  highlights,
  expandedCategory,
  onToggle,
}: {
  highlights: (SpendingTimingHighlight & { peakMonths: number[]; deployMonths: number[] })[];
  expandedCategory: string | null;
  onToggle: (cat: string | null) => void;
}) {
  return (
    <div className="space-y-1">
      {/* Month headers */}
      <div className="flex items-center">
        <div className="w-[200px] shrink-0" />
        <div className="flex-1 grid grid-cols-12 gap-0.5">
          {MONTHS.map(m => (
            <div key={m} className="text-center text-[10px] font-semibold text-slate-400 uppercase">
              {m}
            </div>
          ))}
        </div>
        <div className="w-[80px] shrink-0" />
      </div>

      {highlights.map((h) => {
        const label = h.subcategory || h.category;
        const isExpanded = expandedCategory === label;

        return (
          <div key={label}>
            <button
              className="w-full flex items-center hover:bg-slate-50 rounded-lg py-1 transition-colors"
              onClick={() => onToggle(isExpanded ? null : label)}
            >
              <div className="w-[200px] shrink-0 flex items-center gap-2 pr-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                <span className="text-xs font-medium text-slate-700 truncate text-left">{label}</span>
              </div>
              <div className="flex-1 grid grid-cols-12 gap-0.5">
                {Array.from({ length: 12 }, (_, i) => {
                  const isPeak = h.peakMonths.includes(i);
                  const isDeploy = h.deployMonths.includes(i) && !isPeak;
                  const isNegotiate = h.deployMonths[0] !== undefined && i === Math.max(0, h.deployMonths[0] - 1);
                  return (
                    <div
                      key={i}
                      className={`h-6 rounded-sm transition-all ${
                        isPeak ? 'bg-blue-500' :
                        isDeploy ? 'bg-emerald-400' :
                        isNegotiate ? 'bg-amber-400' :
                        'bg-slate-100'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="w-[80px] shrink-0 flex items-center justify-end gap-1">
                <Badge variant="secondary" className={`text-[10px] ${
                  h.predictabilityScore >= 90 ? 'bg-emerald-100 text-emerald-700' :
                  h.predictabilityScore >= 75 ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {h.predictabilityScore}%
                </Badge>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isExpanded && (
              <div className="ml-[200px] mr-[80px] py-2 space-y-2">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">{h.predictabilityReason}</p>
                      <p className="text-xs text-slate-600 font-medium">Annual: {formatCurrency(h.totalAnnualSpend)} · YoY: +{h.yoyGrowth}%</p>
                    </div>
                  </div>
                </div>
                {h.topMerchants.map((m, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-slate-800">{m.name}</span>
                      <span className="text-xs text-slate-500">{formatCurrency(m.spend)}/yr</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 mb-1.5">{m.peakWeeks}</Badge>
                    <p className="text-xs text-blue-700 leading-snug">{m.dealRecommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeadlineView({
  highlights,
  currentMonth,
}: {
  highlights: (SpendingTimingHighlight & { peakMonths: number[]; deployMonths: number[] })[];
  currentMonth: number;
}) {
  // Sort by urgency (closest deploy window first)
  const sorted = useMemo(() => {
    return [...highlights].sort((a, b) => {
      const aFirst = a.deployMonths[0] ?? 12;
      const bFirst = b.deployMonths[0] ?? 12;
      // Normalize relative to current month
      const aDist = (aFirst - currentMonth + 12) % 12;
      const bDist = (bFirst - currentMonth + 12) % 12;
      return aDist - bDist;
    });
  }, [highlights, currentMonth]);

  return (
    <div className="space-y-2">
      {sorted.map(h => {
        const label = h.subcategory || h.category;
        const deployStart = h.deployMonths[0] ?? 0;
        const dist = (deployStart - currentMonth + 12) % 12;
        const isUrgent = dist <= 2;
        const isSoon = dist <= 4;

        return (
          <Card key={label} className={`p-3 border ${isUrgent ? 'border-red-200 bg-red-50' : isSoon ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                <span className="text-sm font-medium text-slate-800 truncate">{label}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className={`font-medium ${isUrgent ? 'text-red-700' : isSoon ? 'text-amber-700' : 'text-slate-600'}`}>
                    Deploy: {h.deployMonths.map(m => MONTHS[m]).join('-')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Peak: {h.peakMonths.map(m => MONTHS[m]).join('-')}</span>
                </div>
                <span className="text-slate-600 font-semibold">{formatCurrency(h.totalAnnualSpend)}</span>
                <Badge variant="secondary" className={`text-[10px] ${
                  isUrgent ? 'bg-red-200 text-red-800' : isSoon ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isUrgent ? 'URGENT' : isSoon ? 'UPCOMING' : `${dist}mo out`}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-snug">{h.dealTimingRecommendation}</p>
          </Card>
        );
      })}
    </div>
  );
}
