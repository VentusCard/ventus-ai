import { useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, Flame, BarChart3, Crosshair } from "lucide-react";
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

interface ProbabilityRow {
  label: string;
  pillar: string;
  prob30: number;
  prob60: number;
  prob90: number;
  confidence: "High" | "Medium" | "Low";
  count: number;
  lastMonthAgo: number;
  activeMonths: number;
}

function calcRecency(monthlySpend: number[]): number {
  for (let offset = 0; offset < 12; offset++) {
    const mi = (CURRENT_MONTH - offset + 12) % 12;
    if (monthlySpend[mi] > 0) {
      if (offset === 0) return 1.0;
      if (offset === 1) return 0.85;
      if (offset === 2) return 0.6;
      return Math.max(0.1, 1 - offset * 0.15);
    }
  }
  return 0.1;
}

function calcFrequency(monthlySpend: number[]): number {
  const active = monthlySpend.filter(v => v > 0).length;
  return active / 12;
}

function calcSeasonality(monthlySpend: number[], windowMonths: number): number {
  const peakSpend = Math.max(...monthlySpend, 1);
  let sum = 0;
  for (let i = 1; i <= windowMonths; i++) {
    const mi = (CURRENT_MONTH + i) % 12;
    sum += monthlySpend[mi] / peakSpend;
  }
  return sum / windowMonths;
}

function lastPurchaseMonthsAgo(monthlySpend: number[]): number {
  for (let offset = 0; offset < 12; offset++) {
    const mi = (CURRENT_MONTH - offset + 12) % 12;
    if (monthlySpend[mi] > 0) return offset;
  }
  return 12;
}

function clampProb(v: number): number {
  return Math.max(1, Math.min(99, Math.round(v * 100)));
}

function formatDaysEstimate(activeMonths: number): string {
  const days = Math.min(90, Math.round(30 / Math.max(activeMonths, 1)));
  if (days <= 7) return `~${days}d`;
  if (days <= 30) return `~${Math.round(days / 7)}wk`;
  return `~${Math.round(days / 30)}mo`;
}

function buildReasonString(
  activeMonths: number,
  velocity: number,
  monthlySpend: number[],
  lastMonthAgo: number,
  peak: number,
): string {
  const parts: string[] = [];

  // Cadence
  if (activeMonths >= 10) parts.push("Weekly cadence");
  else if (activeMonths >= 6) parts.push("Bi-monthly pattern");
  else if (activeMonths >= 3) parts.push("Quarterly pattern");
  else parts.push("Occasional");

  // Velocity
  if (Math.abs(velocity) >= 15) {
    parts.push(velocity > 0 ? `accelerating +${velocity}%` : `declining ${velocity}%`);
  }

  // Seasonality — check if next month historically has spend
  const nextMonth = (CURRENT_MONTH + 1) % 12;
  if (monthlySpend[nextMonth] > 0) {
    parts.push("peak season");
  } else if (monthlySpend[peak] > 0) {
    parts.push(`peaks in ${MONTHS[peak]}`);
  }

  // Recency
  if (lastMonthAgo >= 3) {
    parts.push(`last seen ${lastMonthAgo}mo ago`);
  }

  return parts.join(" · ");
}

function ConfidenceBadge({ confidence }: { confidence: "High" | "Medium" | "Low" }) {
  const styles = {
    High: { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "High" },
    Medium: { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Med" },
    Low: { bg: "rgba(148,163,184,0.1)", color: "#64748b", label: "Low" },
  };
  const s = styles[confidence];
  return (
    <span
      className="text-[7px] font-bold uppercase px-1 py-[1px] rounded"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export default function PurchaseCycleTimeline({ chips, transactions, signalMap }: Props) {
  const rows: SeasonalRow[] = useMemo(() => {
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
  }, [transactions, signalMap]);

  // Next-Purchase Probability computation
  const probabilityRows: ProbabilityRow[] = useMemo(() => {
    if (rows.length === 0) return [];

    return rows
      .map(row => {
        const recency = calcRecency(row.monthlySpend);
        const frequency = calcFrequency(row.monthlySpend);

        const s1 = calcSeasonality(row.monthlySpend, 1);
        const s2 = calcSeasonality(row.monthlySpend, 2);
        const s3 = calcSeasonality(row.monthlySpend, 3);

        const prob30 = clampProb(recency * 0.40 + frequency * 0.35 + s1 * 0.25);
        const prob60 = clampProb(recency * 0.40 + frequency * 0.35 + s2 * 0.25);
        const prob90 = clampProb(recency * 0.40 + frequency * 0.35 + s3 * 0.25);

        const confidence: "High" | "Medium" | "Low" =
          row.count > 6 ? "High" : row.count >= 3 ? "Medium" : "Low";

        return {
          label: row.label,
          pillar: row.pillar,
          prob30,
          prob60,
          prob90,
          confidence,
          count: row.count,
          lastMonthAgo: lastPurchaseMonthsAgo(row.monthlySpend),
          activeMonths: row.monthlySpend.filter(v => v > 0).length,
        };
      })
      .sort((a, b) => b.prob30 - a.prob30)
      .slice(0, 6);
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[11px] text-slate-300">Analyzing seasonal patterns...</span>
      </div>
    );
  }

  const globalMax = Math.max(...rows.flatMap(r => r.monthlySpend), 1);

  // Build insight sentence for probability section
  const probInsight = (() => {
    if (probabilityRows.length === 0) return null;
    const top = probabilityRows[0];
    const c = getColor(top.pillar);

    const cadenceWord = top.activeMonths >= 10
      ? "near-weekly"
      : top.activeMonths >= 6
      ? "regular monthly"
      : top.activeMonths >= 3
      ? "periodic"
      : "occasional";

    const timeframe = top.lastMonthAgo === 0
      ? "this month"
      : top.lastMonthAgo === 1
      ? "last month"
      : `${top.lastMonthAgo} months ago`;

    const nextMonth = MONTHS[(CURRENT_MONTH + 1) % 12];

    let secondary = "";
    if (probabilityRows.length > 1) {
      const second = probabilityRows[1];
      if (second.prob30 >= 40) {
        secondary = ` ${second.label} also likely (${second.prob30}%) based on ${second.activeMonths}/12 months active.`;
      }
    }

    return {
      color: c.text,
      label: top.label,
      text: `${top.label} purchase expected in ${nextMonth} (${top.prob30}% probability) based on ${cadenceWord} cadence — last seen ${timeframe}.${secondary}`,
    };
  })();

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
                <div className="w-[66px] shrink-0 text-right pr-1">
                  <span className="text-[10px] font-semibold truncate block" style={{ color: c.text }}>
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

      {/* ═══ NEXT-PURCHASE PROBABILITY ═══ */}
      {probabilityRows.length > 0 && (
        <div
          className="mt-4"
          style={{ animation: "exec-card-reveal 0.4s ease-out 0.6s both" }}
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <Crosshair className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Next-Purchase Probability
            </span>
          </div>

          {/* Probability cards */}
          <div className="space-y-1.5">
            {probabilityRows.map((pr, ri) => {
              const c = getColor(pr.pillar);
              const matchingRow = rows.find(r => r.label === pr.label && r.pillar === pr.pillar);
              const velocity = matchingRow?.velocity ?? 0;
              const peak = matchingRow?.peak ?? 0;
              const monthlySpend = matchingRow?.monthlySpend ?? new Array(12).fill(0);
              const reason = buildReasonString(pr.activeMonths, velocity, monthlySpend, pr.lastMonthAgo, peak);
              const daysEst = formatDaysEstimate(pr.activeMonths);

              const cardBg = pr.prob30 >= 70
                ? "rgba(16,185,129,0.05)"
                : pr.prob30 >= 40
                ? "rgba(245,158,11,0.04)"
                : "rgba(148,163,184,0.04)";

              return (
                <div
                  key={`prob-${pr.pillar}::${pr.label}`}
                  className="rounded-lg px-3 py-2 border"
                  style={{
                    background: cardBg,
                    borderColor: `${c.dot}18`,
                    animation: `exec-card-reveal 0.35s ease-out ${0.7 + ri * 0.08}s both`,
                  }}
                >
                  {/* Top line: name + prob + timing */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold" style={{ color: c.text }}>
                      {pr.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400">{daysEst}</span>
                      <span
                        className="text-[12px] font-black tabular-nums"
                        style={{ color: pr.prob30 >= 70 ? "#059669" : pr.prob30 >= 40 ? "#d97706" : "#94a3b8" }}
                      >
                        {pr.prob30}%
                      </span>
                    </div>
                  </div>

                  {/* Gradient bar */}
                  <div className="relative h-[6px] rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${pr.prob30}%`,
                        background: `linear-gradient(90deg, ${c.dot}90, ${c.dot})`,
                        transition: "width 0.6s ease-out",
                      }}
                    />
                    {/* Confidence badge overlaid at right end */}
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <ConfidenceBadge confidence={pr.confidence} />
                    </div>
                  </div>

                  {/* Reason sub-text */}
                  <p className="text-[8px] text-slate-400 mt-1 leading-snug">{reason}</p>
                </div>
              );
            })}
          </div>

          {/* Predictive insight card */}
          {probInsight && (
            <div
              className="mt-2.5 rounded-lg px-3 py-2.5 border"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,.06), rgba(16,185,129,.04))",
                borderColor: "rgba(139,92,246,.18)",
                animation: "exec-card-reveal 0.4s ease-out 1.1s both",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Crosshair className="w-3 h-3 text-violet-500" />
                <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">
                  Predictive Insight
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold" style={{ color: probInsight.color }}>{probInsight.label}</span>
                {" "}{probInsight.text.slice(probInsight.label.length)}
              </p>
            </div>
          )}
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