import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cohorts as FVI_COHORTS } from "@/lib/fviData";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { deltaFor } from "../../dashboard/useDashboardRange";

function fmtNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

const TREND_TONE: Record<string, string> = {
  growing: "text-rose-600",
  stable: "text-slate-500",
  shrinking: "text-emerald-600",
};

export function FviSummaryReport({ onBack }: { onBack: () => void }) {
  const rows = useMemo(
    () => [...FVI_COHORTS].sort((a, b) => b.customerCount - a.customerCount),
    [],
  );
  const data = rows.map((c) => ({
    name: c.name.length > 22 ? c.name.slice(0, 21) + "…" : c.name,
    customers: c.customerCount,
    fill: c.color,
  }));

  return (
    <ReportPageShell
      title="Financial vulnerability summary"
      category="Risk"
      description="Vulnerability cohorts, customer counts, and risk severity."
      onBack={onBack}
    >
      {({ range }) => (
        <>
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmtNum(v as number)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#475569" }}
                    axisLine={false}
                    tickLine={false}
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      background: "white",
                    }}
                    formatter={(v: number) => [fmtNum(v), "Customers"]}
                  />
                  <Bar dataKey="customers" radius={[0, 2, 2, 0]} isAnimationActive={false}>
                    {data.map((d, i) => (
                      <Bar key={i} dataKey="customers" fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <ReportDataTable
            caption={`Vulnerability cohorts (${range.label})`}
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              {
                key: "name",
                header: "Cohort",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: r.color }} />
                    <span className="font-medium text-slate-800">{r.name}</span>
                  </div>
                ),
              },
              { key: "cust", header: "Customers", align: "right", render: (r) => fmtNum(r.customerCount) },
              {
                key: "pct",
                header: "% portfolio",
                align: "right",
                render: (r) => `${r.totalPortfolioPercent.toFixed(2)}%`,
              },
              {
                key: "fvi",
                header: "Avg FVI",
                align: "right",
                render: (r) => r.avgFviScore.toFixed(0),
              },
              {
                key: "trend",
                header: "Trend",
                align: "right",
                render: (r) => (
                  <span className={TREND_TONE[r.trend] ?? "text-slate-500"}>
                    {r.trend} ({r.trendPercent >= 0 ? "+" : ""}
                    {r.trendPercent.toFixed(1)}%)
                  </span>
                ),
              },
              {
                key: "delta",
                header: "Δ vs comp.",
                align: "right",
                render: (r) => {
                  const d = deltaFor(range, `fvi-${r.id}`);
                  if (d === null) return <span className="text-slate-400">—</span>;
                  return (
                    <span className={d >= 0 ? "text-rose-600" : "text-emerald-600"}>
                      {d >= 0 ? "+" : ""}
                      {d.toFixed(1)}%
                    </span>
                  );
                },
              },
            ]}
          />
        </>
      )}
    </ReportPageShell>
  );
}
