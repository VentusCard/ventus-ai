import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { LayoutDashboard } from "lucide-react";
import {
  CARD_PRODUCTS,
  GEOGRAPHIC_REGIONS,
  getBankwideMetrics,
  getPillarDistribution,
  getRevenueOpportunities,
} from "@/lib/mockBankwideData";
import { PILLAR_COLORS } from "@/lib/sampleData";
import type { TabValue } from "../AnalyticsContainer";
import { ChartCard } from "./ChartCard";
import { MetricTile } from "./MetricTile";
import { DashboardToolbar } from "./DashboardToolbar";
import { InsightStrip } from "./InsightStrip";
import {
  dailySeries,
  deltaFor,
  useDashboardRange,
} from "./useDashboardRange";

interface AnalystDashboardViewProps {
  onNavigate: (tab: TabValue) => void;
  onOpenOpportunity?: (opportunityId: string) => void;
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

function fmtDateTick(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const EMPTY_FILTERS = { cardProducts: [], regions: [], ageRanges: [] };

export function AnalystDashboardView({ onNavigate, onOpenOpportunity, renderVentusSliver }: AnalystDashboardViewProps) {
  const { range, preset, setPreset, setCustom, compare, setCompare } =
    useDashboardRange("30d");

  const metrics = useMemo(() => getBankwideMetrics(EMPTY_FILTERS), []);
  const pillarDist = useMemo(() => getPillarDistribution(EMPTY_FILTERS), []);
  const opportunities = useMemo(() => getRevenueOpportunities(EMPTY_FILTERS), []);

  // Scale total annual spend to the selected range
  const days = Math.max(
    1,
    Math.round((+range.end - +range.start) / 86_400_000) + 1,
  );
  const rangeSpend = (metrics.totalAnnualSpend / 365) * days;
  const rangeTransactions =
    metrics.avgTransactionsPerAccount * (days / 30) * metrics.totalAccounts;

  const spendSeries = useMemo(
    () =>
      dailySeries(range, rangeSpend, "spend").map((d) => ({
        date: fmtDateTick(d.date),
        value: d.value,
      })),
    [range, rangeSpend],
  );

  const pillarData = useMemo(
    () =>
      Object.entries(pillarDist)
        .map(([name, pct]) => ({ name, value: pct, fill: PILLAR_COLORS[name] ?? "#94a3b8" }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [pillarDist],
  );

  const topPillars = pillarData.slice(0, 6);

  const cardSpendData = useMemo(
    () =>
      CARD_PRODUCTS.map((p) => ({
        name: p.name,
        spend: (p.accountCount * p.avgSpendPerAccount * days) / 365,
      })).sort((a, b) => b.spend - a.spend),
    [days],
  );

  const regionData = useMemo(
    () =>
      GEOGRAPHIC_REGIONS.slice(0, 8)
        .map((r) => ({ name: r.name, spend: (r.totalSpend * days) / 365 }))
        .sort((a, b) => b.spend - a.spend),
    [days],
  );

  const tiles = [
    {
      key: "accounts",
      label: "Total accounts",
      value: fmtNum(metrics.totalAccounts),
      seriesScale: metrics.totalAccounts,
      hint: "vs comparison",
      onOpenDetail: () => onNavigate("dashboard"),
    },
    {
      key: "users",
      label: "Unique users",
      value: fmtNum(metrics.totalUsers),
      seriesScale: metrics.totalUsers,
      hint: `${metrics.avgAccountsPerUser.toFixed(2)} accts/user`,
      onOpenDetail: () => onNavigate("dashboard"),
    },
    {
      key: "spend",
      label: "Card spend",
      value: fmtCurrency(rangeSpend),
      seriesScale: rangeSpend,
      hint: range.label.toLowerCase(),
      onOpenDetail: () => onNavigate("dashboard"),
    },
    {
      key: "txn",
      label: "Transactions",
      value: fmtNum(rangeTransactions),
      seriesScale: rangeTransactions,
      hint: `${metrics.avgTransactionsPerAccount}/acct/mo`,
      onOpenDetail: () => onNavigate("wallet-share"),
    },
    {
      key: "active",
      label: "Active acct rate",
      value: `${metrics.activeAccountRate.toFixed(1)}%`,
      seriesScale: metrics.activeAccountRate,
      hint: "30-day active",
      onOpenDetail: () => onNavigate("customer-insights"),
    },
    {
      key: "wallet",
      label: "Wallet share",
      value: "38.4%",
      seriesScale: 100,
      hint: "share of card wallet",
      onOpenDetail: () => onNavigate("wallet-share"),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Page header */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-slate-500" />
          <h2 className="text-[15px] font-semibold text-slate-900">
            Analytics
          </h2>
          <span className="text-[11px] text-slate-400">
            Portfolio-wide enrichment intelligence
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

      <InsightStrip
        opportunities={opportunities}
        onOpen={(id) => onOpenOpportunity?.(id)}
      />


      {renderVentusSliver?.()}

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {tiles.map((t) => (
          <MetricTile
            key={t.key}
            label={t.label}
            value={t.value}
            delta={deltaFor(range, t.key)}
            hint={t.hint}
            range={range}
            seriesKey={t.key}
            seriesScale={t.seriesScale}
            onOpenDetail={t.onOpenDetail}
          />
        ))}
      </div>

      {/* Row: spend over time + pillar donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ChartCard
          title="Card spend over time"
          value={fmtCurrency(rangeSpend)}
          hint={range.label}
          className="lg:col-span-2 min-h-[260px]"
          onOpenDetail={() => onNavigate("dashboard")}
        >
          <div className="h-[200px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendSeries} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v) => fmtCurrency(v as number)}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    background: "white",
                  }}
                  formatter={(v: number) => [fmtCurrency(v), "Spend"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={1.75}
                  fill="url(#spendFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Spend by lifestyle pillar"
          hint="Share of total"
          className="min-h-[260px]"
          onOpenDetail={() => onNavigate("dashboard")}
        >
          <div className="flex items-center gap-3 h-[200px]">
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
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ background: p.fill }}
                  />
                  <span className="text-slate-700 truncate flex-1">{p.name}</span>
                  <span className="text-slate-500 tabular-nums">
                    {p.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row: top pillars table + spend by card product */}
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
                        <span
                          className="w-1.5 h-1.5 rounded-sm"
                          style={{ background: p.fill }}
                        />
                        <span className="text-slate-700 truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="text-right tabular-nums text-slate-700">
                      {p.value.toFixed(1)}%
                    </td>
                    <td className="text-right tabular-nums text-slate-700">
                      {fmtCurrency((rangeSpend * p.value) / 100)}
                    </td>
                    <td
                      className={`text-right tabular-nums text-[11px] ${
                        d === null
                          ? "text-slate-400"
                          : d >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
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
          title="Spend by card product"
          hint={range.label}
          onOpenDetail={() => onNavigate("dashboard")}
        >
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cardSpendData}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtCurrency(v as number)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#475569" }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    background: "white",
                  }}
                  formatter={(v: number) => [fmtCurrency(v), "Spend"]}
                />
                <Bar dataKey="spend" fill="#2563eb" radius={[0, 2, 2, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row: regions + opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard
          title="Spend by region"
          hint="Top 8 regions"
          onOpenDetail={() => onNavigate("dashboard")}
        >
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionData}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtCurrency(v as number)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#475569" }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    background: "white",
                  }}
                  formatter={(v: number) => [fmtCurrency(v), "Spend"]}
                />
                <Bar dataKey="spend" fill="#10b981" radius={[0, 2, 2, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
                onClick={() => onNavigate("dashboard")}
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
                  <div className="text-[12px] font-medium text-slate-800 truncate">
                    {op.gapTitle}
                  </div>
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
    </div>
  );
}
