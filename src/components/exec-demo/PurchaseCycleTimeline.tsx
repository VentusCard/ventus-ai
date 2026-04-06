import { useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, Flame } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";

interface ChipData {
  pillar: string;
  label: string;
  count: number;
  totalSpend: number;
  frequency?: string;
}

interface Props {
  chips: ChipData[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Seasonal archetypes — deterministic curves per category
const SEASONAL_CURVES: Record<string, number[]> = {
  Airlines:     [0.4, 0.3, 0.6, 0.5, 0.7, 1.0, 1.0, 0.9, 0.5, 0.3, 0.6, 0.8],
  Hotels:       [0.3, 0.3, 0.5, 0.5, 0.7, 1.0, 1.0, 0.9, 0.5, 0.3, 0.5, 0.7],
  Rideshare:    [0.6, 0.6, 0.7, 0.7, 0.8, 0.9, 0.8, 0.8, 0.7, 0.7, 0.8, 1.0],
  Grocery:      [0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.8, 0.9, 0.8, 0.8, 1.0, 1.0],
  Dining:       [0.5, 0.7, 0.6, 0.7, 0.8, 0.9, 0.8, 0.8, 0.7, 0.7, 0.9, 1.0],
  "Fast Casual": [0.7, 0.7, 0.7, 0.8, 0.8, 0.8, 0.8, 0.8, 0.9, 0.8, 0.8, 0.7],
  Gym:          [1.0, 0.9, 0.8, 0.7, 0.7, 0.6, 0.5, 0.5, 0.7, 0.7, 0.6, 0.6],
  Spa:          [0.5, 0.8, 0.6, 0.6, 0.9, 0.7, 0.6, 0.6, 0.7, 0.6, 0.7, 1.0],
  Apparel:      [0.5, 0.5, 0.7, 0.8, 0.6, 0.5, 0.7, 0.9, 0.7, 0.6, 1.0, 1.0],
  "Athletic Wear": [1.0, 0.8, 0.7, 0.7, 0.8, 0.7, 0.6, 0.8, 0.9, 0.7, 0.9, 0.8],
  Streaming:    [0.8, 0.7, 0.7, 0.7, 0.7, 0.6, 0.7, 0.7, 0.8, 0.8, 0.9, 1.0],
  Events:       [0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.0, 0.9, 0.7, 0.8, 0.5, 0.6],
  "Home Improvement": [0.3, 0.4, 0.7, 1.0, 1.0, 0.9, 0.8, 0.7, 0.7, 0.5, 0.3, 0.3],
  Furniture:    [0.5, 0.6, 0.6, 0.7, 0.8, 0.7, 0.7, 0.8, 0.9, 0.6, 0.7, 0.5],
  "Pet Care":   [0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.8, 0.8, 0.7, 0.7, 0.7, 0.9],
  Education:    [0.4, 0.4, 0.4, 0.5, 0.6, 0.5, 0.6, 1.0, 1.0, 0.7, 0.5, 0.4],
  Pharmacy:     [0.9, 0.8, 0.7, 0.6, 0.6, 0.6, 0.6, 0.6, 0.7, 0.8, 0.9, 1.0],
  "Sporting Goods": [0.6, 0.5, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.7, 0.6, 0.8, 0.9],
  Gas:          [0.6, 0.6, 0.7, 0.7, 0.9, 1.0, 1.0, 0.9, 0.7, 0.7, 0.7, 0.8],
  Transit:      [0.8, 0.8, 0.8, 0.8, 0.8, 0.7, 0.6, 0.6, 0.9, 0.9, 0.8, 0.7],
  Beauty:       [0.6, 0.7, 0.7, 0.8, 0.9, 0.8, 0.7, 0.7, 0.8, 0.7, 0.9, 1.0],
  Supplements:  [1.0, 0.9, 0.8, 0.7, 0.7, 0.7, 0.6, 0.6, 0.8, 0.7, 0.7, 0.7],
  Software:     [0.8, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.9, 1.0],
};

const DEFAULT_CURVE = [0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.8, 0.8, 0.7, 0.7, 0.8, 0.9];

function getCurve(label: string): number[] {
  return SEASONAL_CURVES[label] || DEFAULT_CURVE;
}

function peakMonth(curve: number[]): number {
  return curve.indexOf(Math.max(...curve));
}

// Simulated current month index (April = 3)
const CURRENT_MONTH = 3;

function formatSpend(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${Math.round(amount)}`;
}

// Deterministic YoY trend from chip data
function yoyTrend(chip: ChipData): number {
  const hash = Array.from(chip.label).reduce((a, c) => a + c.charCodeAt(0), 0);
  return ((hash % 40) - 12); // Range roughly -12% to +27%
}

interface SeasonalRow {
  label: string;
  pillar: string;
  curve: number[];
  peak: number;
  monthsUntilPeak: number;
  totalSpend: number;
  count: number;
  trend: number;
}

export default function PurchaseCycleTimeline({ chips }: Props) {
  const rows: SeasonalRow[] = useMemo(() => {
    // Take top categories by spend
    return chips
      .slice(0, 7)
      .map((c) => {
        const curve = getCurve(c.label);
        const peak = peakMonth(curve);
        const monthsUntil = peak >= CURRENT_MONTH ? peak - CURRENT_MONTH : 12 - CURRENT_MONTH + peak;
        return {
          label: c.label,
          pillar: c.pillar,
          curve,
          peak,
          monthsUntilPeak: monthsUntil === 0 ? 0 : monthsUntil,
          totalSpend: c.totalSpend,
          count: c.count,
          trend: yoyTrend(c),
        };
      })
      .sort((a, b) => a.monthsUntilPeak - b.monthsUntilPeak);
  }, [chips]);

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-slate-300">Analyzing seasonal patterns...</span>
      </div>
    );
  }

  return (
    <div style={{ animation: "exec-card-reveal 0.4s ease-out" }}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Calendar className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Seasonal Spend Intelligence
        </span>
      </div>

      {/* Month legend bar */}
      <div className="flex gap-px mb-2 px-[74px]">
        {MONTHS.map((m, i) => (
          <span
            key={m}
            className="flex-1 text-center text-[7px] font-medium"
            style={{
              color: i === CURRENT_MONTH ? "#3b82f6" : "#94a3b8",
              fontWeight: i === CURRENT_MONTH ? 700 : 400,
            }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {rows.map((row, ri) => {
          const c = getColor(row.pillar);
          const isAtPeak = row.monthsUntilPeak === 0;
          const isNearPeak = row.monthsUntilPeak <= 2;

          return (
            <div
              key={`${row.pillar}::${row.label}`}
              className="flex items-center gap-2"
              style={{ animation: `exec-card-reveal 0.35s ease-out ${ri * 0.06}s both` }}
            >
              {/* Label */}
              <div className="w-[66px] shrink-0 text-right pr-1">
                <span className="text-[10px] font-semibold truncate block" style={{ color: c.text }}>
                  {row.label}
                </span>
              </div>

              {/* Mini heatmap bar */}
              <div className="flex gap-px flex-1 h-[18px] items-end">
                {row.curve.map((val, mi) => {
                  const isCurrentMonth = mi === CURRENT_MONTH;
                  const isPeak = mi === row.peak;
                  return (
                    <div
                      key={mi}
                      className="flex-1 rounded-sm relative"
                      style={{
                        height: `${Math.max(20, val * 100)}%`,
                        background: isPeak
                          ? c.dot
                          : isCurrentMonth
                          ? `${c.dot}90`
                          : `${c.dot}${Math.round(val * 40 + 10).toString(16).padStart(2, "0")}`,
                        outline: isCurrentMonth ? `1.5px solid #3b82f6` : undefined,
                        outlineOffset: "0.5px",
                      }}
                    />
                  );
                })}
              </div>

              {/* Peak indicator + trend */}
              <div className="w-[72px] shrink-0 flex items-center gap-1">
                {isAtPeak ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${c.dot}20`,
                      color: c.dot,
                      animation: "purchase-pulse 2s ease-in-out infinite",
                    }}
                  >
                    <Flame className="w-2.5 h-2.5" /> PEAK
                  </span>
                ) : isNearPeak ? (
                  <span className="text-[9px] font-semibold text-amber-600">
                    ↑ {row.monthsUntilPeak}mo
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400">
                    {row.monthsUntilPeak}mo
                  </span>
                )}

                {row.trend >= 0 ? (
                  <span className="inline-flex items-center text-[8px] font-bold text-emerald-600">
                    <TrendingUp className="w-2.5 h-2.5" />+{row.trend}%
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[8px] font-bold text-red-400">
                    <TrendingDown className="w-2.5 h-2.5" />{row.trend}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight callout — upcoming peak season */}
      {rows[0] && (
        <div
          className="mt-3 rounded-lg px-3 py-2.5 border"
          style={{
            background: "linear-gradient(135deg, rgba(96,165,250,.06), rgba(167,139,250,.06))",
            borderColor: "rgba(96,165,250,.2)",
            animation: "exec-card-reveal 0.4s ease-out 0.5s both",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Next Seasonal Peak
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {(() => {
              const upcoming = rows.find((r) => r.monthsUntilPeak > 0) || rows[0];
              const c = getColor(upcoming.pillar);
              const avgPer = upcoming.totalSpend / upcoming.count;
              const peakMultiplier = upcoming.curve[upcoming.peak];
              const projectedPeak = avgPer * peakMultiplier * 1.3;
              return (
                <>
                  <span className="font-semibold" style={{ color: c.text }}>{upcoming.label}</span>
                  {" "}peaks in{" "}
                  <span className="font-bold text-slate-800">{MONTHS[upcoming.peak]}</span>
                  {" "}— projected ~{formatSpend(projectedPeak)}/mo
                  {upcoming.trend > 0 && (
                    <span className="text-emerald-600 font-semibold"> (+{upcoming.trend}% YoY)</span>
                  )}
                </>
              );
            })()}
          </p>
        </div>
      )}

      <style>{`
        @keyframes purchase-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); box-shadow: 0 0 8px currentColor; }
        }
        @keyframes exec-card-reveal {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
