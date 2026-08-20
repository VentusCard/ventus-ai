import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { LayoutDashboard } from "lucide-react";
import {
  getBankwideMetrics,
  getPillarDistribution,
  getRevenueOpportunities,
} from "@/lib/mockBankwideData";
import { PILLAR_COLORS } from "@/lib/sampleData";
import type { TabValue } from "../AnalyticsContainer";
import type { SignalFamily } from "@/lib/customerDirectoryData";
import { ChartCard } from "./ChartCard";
import { DashboardToolbar } from "./DashboardToolbar";
import { InsightStrip } from "./InsightStrip";
import { SignalCoverageStrip } from "./SignalCoverageStrip";
import { SignalFamilyBoard } from "./SignalFamilyBoard";
import { LiveSignalStream } from "./LiveSignalStream";
import { TaxonomyCoverageCard } from "./TaxonomyCoverageCard";
import { ExternalIntelligenceCard } from "./ExternalIntelligenceCard";
import { deltaFor, useDashboardRange } from "./useDashboardRange";
import { getVentusPriorityCards } from "@/lib/ventusPriorityCards";

interface AnalystDashboardViewProps {
  onNavigate: (tab: TabValue) => void;
  onOpenOpportunity?: (opportunityId: string) => void;
  onOpenSection?: (section: "customers" | "risk") => void;
  onOpenSignalSegment?: (family: SignalFamily, label: string) => void;
  renderVentusSliver?: () => React.ReactNode;
}

function fmtCurrency(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtNum(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

const EMPTY_FILTERS = { cardProducts: [], regions: [], ageRanges: [] };

export function AnalystDashboardView({
  onNavigate,
  onOpenOpportunity,
  onOpenSection,
  onOpenSignalSegment,
  renderVentusSliver,
}: AnalystDashboardViewProps) {
  const { range, preset, setPreset, setCustom, compare, setCompare } = useDashboardRange("30d");

  const metrics = useMemo(() => getBankwideMetrics(EMPTY_FILTERS), []);
  const pillarDist = useMemo(() => getPillarDistribution(EMPTY_FILTERS), []);
  const opportunities = useMemo(() => getRevenueOpportunities(EMPTY_FILTERS), []);
  const priorityCards = useMemo(() => getVentusPriorityCards(opportunities), [opportunities]);

  const days = Math.max(1, Math.round((+range.end - +range.start) / 86_400_000) + 1);
  const rangeSpend = (metrics.totalAnnualSpend / 365) * days;
  const rangeTransactions =
    metrics.avgTransactionsPerAccount * (days / 30) * metrics.totalAccounts;

  const pillarData = useMemo(
    () =>
      Object.entries(pillarDist)
        .map(([name, pct]) => ({ name, value: pct, fill: PILLAR_COLORS[name] ?? "#94a3b8" }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [pillarDist],
  );

  const topPillars = pillarData.slice(0, 6);

  const portfolioContext = [
    { label: "Total accounts", value: fmtNum(metrics.totalAccounts) },
    { label: "Unique users", value: fmtNum(metrics.totalUsers) },
    { label: "Card spend", value: fmtCurrency(rangeSpend) },
    { label: "Transactions", value: fmtNum(rangeTransactions) },
    { label: "Active acct rate", value: `${metrics.activeAccountRate.toFixed(1)}%` },
    { label: "Wallet share", value: "38.4%" },
  ];

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
            <h2 className="text-[15px] font-semibold text-slate-900 whitespace-nowrap">
              Customer Intelligence Database
            </h2>
            <span className="text-[11px] text-slate-400">
              Every signal Ventus extracts across the portfolio
            </span>
          </div>
        </div>
        <DashboardToolbar
          range={range}
          preset={preset}
          setPreset={setPreset}
          setCustom={setCustom}
          compare={compare}
          setCompare={setCompare}
        />
      </div>

      <InsightStrip
        cards={priorityCards}
        onOpen={(card) => card.opportunityId && onOpenOpportunity?.(card.opportunityId)}
      />

      {renderVentusSliver?.()}

      {/* Signal coverage */}
      <SignalCoverageStrip />

      {/* Signal families */}
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[13px] font-semibold text-slate-900">Signal families</h3>
          <span className="text-[11px] text-slate-400">
            Behavioral → Life event → Financial → Demographic → Risk
          </span>
        </div>
        <SignalFamilyBoard
          onOpenSignal={(family, label) =>
            onOpenSignalSegment
              ? onOpenSignalSegment(family, label)
              : onOpenSection?.(family === "risk" ? "risk" : "customers")
          }
        />
      </div>

      {/* Live stream + taxonomy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LiveSignalStream />
        </div>
        <TaxonomyCoverageCard />
      </div>


      {/* Pillar mix + external intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard
          title="Spend by lifestyle pillar"
          hint="Share of enriched volume"
          className="min-h-[240px]"
          onOpenDetail={() => onNavigate("dashboard")}
        >
          <div className="flex items-center gap-3 h-[190px]">
            <div className="w-[110px] h-[110px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pillarData}
                    dataKey="value"
                    innerRadius={30}
                    outerRadius={52}
                    paddingAngle={1}
                    stroke="white"
                    strokeWidth={1}
                    isAnimationActive={false}
                  >
                    {pillarData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
              {topPillars.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: p.fill }} />
                  <span className="text-slate-700 truncate flex-1">{p.name}</span>
                  <span className="text-slate-500 tabular-nums">{p.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ExternalIntelligenceCard />
      </div>

      {/* Pillar table + opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard
          title="Top pillars by spend"
          hint={`${pillarData.length} pillars · ${range.label.toLowerCase()}`}
          onOpenDetail={() => onNavigate("dashboard")}
        >
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <th className="text-left font-medium py-1.5">Pillar</th>
                <th className="text-right font-medium py-1.5">Share</th>
                <th className="text-right font-medium py-1.5">Spend</th>
                <th className="text-right font-medium py-1.5">Δ</th>
              </tr>
            </thead>
            <tbody>
              {pillarData.slice(0, 8).map((p) => {
                const d = deltaFor(range, `pillar-${p.name}`);
                return (
                  <tr key={p.name} className="border-b border-slate-50 last:border-0">
                    <td className="py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-sm" style={{ background: p.fill }} />
                        <span className="text-slate-700 truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="text-right tabular-nums text-slate-700">{p.value.toFixed(1)}%</td>
                    <td className="text-right tabular-nums text-slate-700">
                      {fmtCurrency((rangeSpend * p.value) / 100)}
                    </td>
                    <td
                      className={`text-right tabular-nums text-[11px] ${
                        d === null ? "text-slate-400" : d >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {d === null ? "—" : `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ChartCard>

        <ChartCard
          title="Revenue opportunities"
          hint={`${opportunities.length} flagged`}
          onOpenDetail={() => onNavigate("dashboard")}
        >
          <div className="space-y-2">
            {opportunities.slice(0, 5).map((op) => (
              <button
                key={op.id}
                onClick={() => onOpenOpportunity?.(op.id)}
                className="w-full text-left flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 -mx-1 px-1 rounded"
              >
                <span
                  className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                    op.priority === "high"
                      ? "bg-amber-500"
                      : op.priority === "medium"
                        ? "bg-blue-500"
                        : "bg-slate-300"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-slate-800 truncate">{op.gapTitle}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {op.currentState} → {op.potentialState}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-semibold text-slate-900 tabular-nums">
                    {fmtCurrency(op.totalOpportunityAmount)}
                  </div>
                  <div className="text-[10px] text-slate-400 tabular-nums">
                    {(op.affectedUsers / 1e6).toFixed(1)}M users
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Portfolio context — scale only */}
      <div className="rounded-md border border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
          <span className="text-[10px] uppercase tracking-wide text-slate-400 shrink-0">
            Portfolio context
          </span>
          {portfolioContext.map((p) => (
            <div key={p.label} className="flex items-baseline gap-1.5">
              <span className="text-[13px] font-semibold text-slate-900 tabular-nums">{p.value}</span>
              <span className="text-[11px] text-slate-500">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
