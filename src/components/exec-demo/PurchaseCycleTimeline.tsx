import { useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, Flame, BarChart3 } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { PersonaSynthesis } from "./ExecDemoIntelPanel";
import type { Transaction, SignalEntry } from "./execDemoData";
import NextOfferRationale from "./NextOfferRationale";
import type { GeneratedOffer } from "./NextOfferRationale";

interface ChipData {
  pillar: string;
  label: string;
  count: number;
  totalSpend: number;
  frequency?: string;
}

interface Props {
  chips: ChipData[];
  transactions: Transaction[];
  signalMap: Record<number, SignalEntry>;
  personaSynthesis?: PersonaSynthesis | null;
  generatedOffers?: GeneratedOffer[] | null;
  offersLoading?: boolean;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CURRENT_MONTH = new Date().getMonth();

function parseMonth(dateStr: string): number | null {
  if (!dateStr) return null;
  if (dateStr.includes("-")) {
    const m = parseInt(dateStr.split("-")[1], 10);
    return isNaN(m) ? null : m - 1;
  }
  const m = parseInt(dateStr.split("/")[0], 10);
  return isNaN(m) ? null : m - 1;
}

function formatSpend(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${Math.round(amount)}`;
}

interface SeasonalRow {
  label: string;
  pillar: string;
  monthlySpend: number[];
  peak: number;
  monthsUntilPeak: number;
  totalSpend: number;
  count: number;
  velocity: number;
  concentration: { months: string; pct: number } | null;
}




export default function PurchaseCycleTimeline({ chips, transactions, signalMap, personaSynthesis, generatedOffers, offersLoading }: Props) {
  const rows: SeasonalRow[] = useMemo(() => {
    const rollups = personaSynthesis?.pillarRollups;

    // If we have persona rollups, group by rollup label
    if (rollups && rollups.length > 0) {
      return rollups
        .map(rollup => {
          const months = new Array(12).fill(0);
          let total = 0;
          let count = 0;

          // Use txIndices if available, otherwise categoryIndices mapped through signalMap
          const indices = rollup.txIndices ?? rollup.categoryIndices ?? [];
          indices.forEach(idx => {
            const tx = transactions[idx];
            if (!tx) return;
            const month = parseMonth(tx.date);
            if (month === null) return;
            const amount = parseFloat(String(tx.amount).replace(/[$,]/g, "")) || 0;
            months[month] += amount;
            total += amount;
            count += 1;
          });

          if (count < 2) return null;

          const peak = months.indexOf(Math.max(...months));
          const monthsUntil = peak >= CURRENT_MONTH ? peak - CURRENT_MONTH : 12 - CURRENT_MONTH + peak;

          const recentMonths = [0, 1, 2].map(i => months[(CURRENT_MONTH - i + 12) % 12]);
          const priorMonths = [3, 4, 5].map(i => months[(CURRENT_MONTH - i + 12) % 12]);
          const recentAvg = recentMonths.reduce((a, b) => a + b, 0) / 3;
          const priorAvg = priorMonths.reduce((a, b) => a + b, 0) / 3;
          const velocity = priorAvg > 0 ? Math.round(((recentAvg - priorAvg) / priorAvg) * 100) : 0;

          let bestSum = 0, bestStart = 0;
          for (let s = 0; s < 12; s++) {
            const sum3 = months[s] + months[(s + 1) % 12] + months[(s + 2) % 12];
            if (sum3 > bestSum) { bestSum = sum3; bestStart = s; }
          }
          const pct = total > 0 ? Math.round((bestSum / total) * 100) : 0;
          const concentration = pct >= 40 ? {
            months: `${MONTHS[bestStart]}-${MONTHS[(bestStart + 2) % 12]}`,
            pct,
          } : null;

          return {
            label: rollup.label,
            pillar: rollup.pillar,
            monthlySpend: months,
            peak,
            monthsUntilPeak: monthsUntil === 0 ? 0 : monthsUntil,
            totalSpend: total,
            count,
            velocity,
            concentration,
          };
        })
        .filter((r): r is SeasonalRow => r !== null)
        .sort((a, b) => a.monthsUntilPeak - b.monthsUntilPeak)
        .slice(0, 7);
    }

    // Fallback: group by signal pillar::label (original behavior)
    const categoryMonthly = new Map<string, { pillar: string; months: number[]; total: number; count: number }>();

    transactions.forEach((tx, idx) => {
      const signal = signalMap[idx];
      if (!signal) return;
      const month = parseMonth(tx.date);
      if (month === null) return;
      const amount = parseFloat(String(tx.amount).replace(/[$,]/g, "")) || 0;
      const key = `${signal.pillar}::${signal.label}`;

      let entry = categoryMonthly.get(key);
      if (!entry) {
        entry = { pillar: signal.pillar, months: new Array(12).fill(0), total: 0, count: 0 };
        categoryMonthly.set(key, entry);
      }
      entry.months[month] += amount;
      entry.total += amount;
      entry.count += 1;
    });

    return Array.from(categoryMonthly.entries())
      .filter(([, v]) => v.count >= 2)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 7)
      .map(([key, data]) => {
        const label = key.split("::")[1];
        const peak = data.months.indexOf(Math.max(...data.months));
        const monthsUntil = peak >= CURRENT_MONTH ? peak - CURRENT_MONTH : 12 - CURRENT_MONTH + peak;

        const recentMonths = [0, 1, 2].map(i => data.months[(CURRENT_MONTH - i + 12) % 12]);
        const priorMonths = [3, 4, 5].map(i => data.months[(CURRENT_MONTH - i + 12) % 12]);
        const recentAvg = recentMonths.reduce((a, b) => a + b, 0) / 3;
        const priorAvg = priorMonths.reduce((a, b) => a + b, 0) / 3;
        const velocity = priorAvg > 0 ? Math.round(((recentAvg - priorAvg) / priorAvg) * 100) : 0;

        let bestSum = 0, bestStart = 0;
        for (let s = 0; s < 12; s++) {
          const sum3 = data.months[s] + data.months[(s + 1) % 12] + data.months[(s + 2) % 12];
          if (sum3 > bestSum) { bestSum = sum3; bestStart = s; }
        }
        const pct = data.total > 0 ? Math.round((bestSum / data.total) * 100) : 0;
        const concentration = pct >= 40 ? {
          months: `${MONTHS[bestStart]}-${MONTHS[(bestStart + 2) % 12]}`,
          pct,
        } : null;

        return {
          label,
          pillar: data.pillar,
          monthlySpend: data.months,
          peak,
          monthsUntilPeak: monthsUntil === 0 ? 0 : monthsUntil,
          totalSpend: data.total,
          count: data.count,
          velocity,
          concentration,
        };
      })
      .sort((a, b) => a.monthsUntilPeak - b.monthsUntilPeak);
  }, [transactions, signalMap, personaSynthesis]);




  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-slate-300">Analyzing seasonal patterns...</span>
      </div>
    );
  }

  const globalMax = Math.max(...rows.flatMap(r => r.monthlySpend), 1);




  return (
    <div style={{ animation: "exec-card-reveal 0.4s ease-out" }}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Calendar className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Seasonal Spend Intelligence
        </span>
      </div>

      {/* Month legend bar + Rows with vertical "now" line */}
      <div className="relative">
        <div className="flex gap-px mb-2 px-[74px]">
          {MONTHS.map((m) => (
            <span
              key={m}
              className="flex-1 text-center text-[7px] font-medium"
              style={{ color: "#94a3b8" }}
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
            const rowMax = Math.max(...row.monthlySpend, 1);

            return (
              <div
                key={`${row.pillar}::${row.label}`}
                className="flex items-center gap-2"
                style={{ animation: `exec-card-reveal 0.35s ease-out ${ri * 0.06}s both` }}
              >
                <div className="w-[130px] shrink-0 text-right pr-1">
                  <span className="text-[10px] font-semibold block leading-tight" style={{ color: c.text }}>
                    {row.label}
                  </span>
                </div>

                <div className="flex gap-px flex-1 h-[18px] items-end">
                  {row.monthlySpend.map((val, mi) => {
                    const norm = rowMax > 0 ? val / rowMax : 0;
                    const isPeak = mi === row.peak && val > 0;
                    const isEmpty = val === 0;
                    return (
                      <div
                        key={mi}
                        className="flex-1 rounded-sm relative"
                        style={{
                          height: isEmpty ? "3px" : `${Math.max(20, norm * 100)}%`,
                          background: isEmpty
                            ? "#e2e8f0"
                            : isPeak
                            ? c.dot
                            : `${c.dot}${Math.round(norm * 40 + 10).toString(16).padStart(2, "0")}`,
                        }}
                      />
                    );
                  })}
                </div>

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

                  {row.velocity !== 0 && (
                    row.velocity >= 0 ? (
                      <span className="inline-flex items-center text-[8px] font-bold text-emerald-600">
                        <TrendingUp className="w-2.5 h-2.5" />+{row.velocity}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[8px] font-bold text-red-400">
                        <TrendingDown className="w-2.5 h-2.5" />{row.velocity}%
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Vertical "Now" line */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
          style={{
            left: `calc(74px + (100% - 74px - 80px) * ${(CURRENT_MONTH + 0.5) / 12})`,
            width: "1px",
          }}
        >
          <span className="text-[6px] font-bold text-blue-500 -translate-x-1/2 whitespace-nowrap mb-0.5">Now</span>
          <div className="flex-1 w-px" style={{ background: "rgba(59,130,246,0.5)", backgroundImage: "repeating-linear-gradient(to bottom, #3b82f6 0px, #3b82f6 3px, transparent 3px, transparent 6px)" }} />
        </div>
      </div>

      {/* Insight callout */}
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
            <BarChart3 className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Spending Pattern Insight
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {(() => {
              const withConc = rows.filter(r => r.concentration);
              const withVelocity = rows.filter(r => Math.abs(r.velocity) >= 15);

              if (withConc.length > 0) {
                const top = withConc[0];
                const c = getColor(top.pillar);
                return (
                  <>
                    <span className="font-semibold" style={{ color: c.text }}>{top.label}</span>
                    {" "}spend clusters in{" "}
                    <span className="font-bold text-slate-800">{top.concentration!.months}</span>
                    {" "}({top.concentration!.pct}% of total — {formatSpend(top.totalSpend)})
                    {top.velocity > 0 && (
                      <span className="text-emerald-600 font-semibold"> · accelerating +{top.velocity}%</span>
                    )}
                  </>
                );
              }

              if (withVelocity.length > 0) {
                const top = withVelocity.sort((a, b) => Math.abs(b.velocity) - Math.abs(a.velocity))[0];
                const c = getColor(top.pillar);
                const direction = top.velocity > 0 ? "accelerating" : "decelerating";
                return (
                  <>
                    <span className="font-semibold" style={{ color: c.text }}>{top.label}</span>
                    {" "}is {direction} at{" "}
                    <span className="font-bold text-slate-800">{top.velocity > 0 ? "+" : ""}{top.velocity}%</span>
                    {" "}— peaks in {MONTHS[top.peak]} ({formatSpend(top.monthlySpend[top.peak])})
                  </>
                );
              }

              const upcoming = rows.find(r => r.monthsUntilPeak > 0) || rows[0];
              const c = getColor(upcoming.pillar);
              return (
                <>
                  <span className="font-semibold" style={{ color: c.text }}>{upcoming.label}</span>
                  {" "}peaks in{" "}
                  <span className="font-bold text-slate-800">{MONTHS[upcoming.peak]}</span>
                  {" "}— {formatSpend(upcoming.monthlySpend[upcoming.peak])} projected
                </>
              );
            })()}
          </p>
        </div>
      )}

      {/* ═══ NEXT-OFFER RECOMMENDATIONS ═══ */}
      <div className="mt-4">
        <NextOfferRationale offers={generatedOffers || null} personaSynthesis={personaSynthesis || null} loading={!!offersLoading} />
      </div>

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