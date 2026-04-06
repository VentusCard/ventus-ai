import { useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, Flame, BarChart3 } from "lucide-react";
import { getColor } from "./ExecDemoIntelPanel";
import type { Transaction, SignalEntry } from "./execDemoData";

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
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CURRENT_MONTH = new Date().getMonth();

function parseMonth(dateStr: string): number | null {
  // Handles "MM/DD", "MM/DD/YY", "MM/DD/YYYY", "YYYY-MM-DD"
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
  velocity: number; // recent vs historical spend momentum
  concentration: { months: string; pct: number } | null;
}

export default function PurchaseCycleTimeline({ chips, transactions, signalMap }: Props) {
  const rows: SeasonalRow[] = useMemo(() => {
    // Build per-category monthly spend from real transactions
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

    // Convert to rows, sorted by total spend
    return Array.from(categoryMonthly.entries())
      .filter(([, v]) => v.count >= 2) // need at least 2 txns
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 7)
      .map(([key, data]) => {
        const label = key.split("::")[1];
        const peak = data.months.indexOf(Math.max(...data.months));
        const monthsUntil = peak >= CURRENT_MONTH ? peak - CURRENT_MONTH : 12 - CURRENT_MONTH + peak;

        // Spend velocity: compare last 3 months vs previous 3
        const recentMonths = [0, 1, 2].map(i => data.months[(CURRENT_MONTH - i + 12) % 12]);
        const priorMonths = [3, 4, 5].map(i => data.months[(CURRENT_MONTH - i + 12) % 12]);
        const recentAvg = recentMonths.reduce((a, b) => a + b, 0) / 3;
        const priorAvg = priorMonths.reduce((a, b) => a + b, 0) / 3;
        const velocity = priorAvg > 0 ? Math.round(((recentAvg - priorAvg) / priorAvg) * 100) : 0;

        // Spend concentration: find the tightest 3-month window
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
  }, [transactions, signalMap]);

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-slate-300">Analyzing seasonal patterns...</span>
      </div>
    );
  }

  // Find global max for normalization
  const globalMax = Math.max(...rows.flatMap(r => r.monthlySpend), 1);

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
          const rowMax = Math.max(...row.monthlySpend, 1);

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

              {/* Mini heatmap bar — normalized per row */}
              <div className="flex gap-px flex-1 h-[18px] items-end">
                {row.monthlySpend.map((val, mi) => {
                  const norm = rowMax > 0 ? val / rowMax : 0;
                  const isCurrentMonth = mi === CURRENT_MONTH;
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
                          : isCurrentMonth
                          ? `${c.dot}90`
                          : `${c.dot}${Math.round(norm * 40 + 10).toString(16).padStart(2, "0")}`,
                        outline: isCurrentMonth ? `1.5px solid #3b82f6` : undefined,
                        outlineOffset: "0.5px",
                      }}
                    />
                  );
                })}
              </div>

              {/* Peak indicator + velocity */}
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

      {/* Insight callout — data-driven */}
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
              // Find most interesting insight: concentration or velocity
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

              // Fallback: upcoming peak
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
