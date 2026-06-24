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
import { getCompetitorOutflows } from "@/lib/mockBankwideData";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { deltaFor } from "../../dashboard/useDashboardRange";

function fmtMoney(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

const RISK_TONE: Record<string, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  low: "bg-slate-50 text-slate-600 border-slate-200",
};

export function OutflowCompetitorReport({ onBack }: { onBack: () => void }) {
  const rows = useMemo(
    () => [...getCompetitorOutflows()].sort((a, b) => b.estimatedOutflow - a.estimatedOutflow),
    [],
  );
  const total = rows.reduce((s, r) => s + r.estimatedOutflow, 0);

  return (
    <ReportPageShell
      title="Outflow to competitors"
      category="Outflow"
      description="ACH and payee-detected outflow by destination institution."
      onBack={onBack}
    >
      {({ range }) => {
        const data = rows.slice(0, 12).map((r) => ({ name: r.institution, value: r.estimatedOutflow }));
        return (
          <>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <div className="h-[320px]">
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
                      tickFormatter={(v) => fmtMoney(v as number)}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                      width={180}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        background: "white",
                      }}
                      formatter={(v: number) => [fmtMoney(v), "Outflow"]}
                    />
                    <Bar dataKey="value" fill="#f97316" radius={[0, 2, 2, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ReportDataTable
              caption={`Competitor outflow (${range.label})`}
              rows={rows}
              rowKey={(r) => r.institution}
              columns={[
                { key: "name", header: "Institution", render: (r) => r.institution },
                { key: "cat", header: "Category", render: (r) => r.productCategory },
                {
                  key: "risk",
                  header: "Risk",
                  render: (r) => (
                    <span
                      className={`inline-block text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${RISK_TONE[r.riskLevel] ?? "bg-slate-50 text-slate-600"}`}
                    >
                      {r.riskLevel}
                    </span>
                  ),
                },
                { key: "outflow", header: "Outflow", align: "right", render: (r) => fmtMoney(r.estimatedOutflow) },
                {
                  key: "share",
                  header: "Share",
                  align: "right",
                  render: (r) => `${((r.estimatedOutflow / total) * 100).toFixed(1)}%`,
                },
                { key: "cust", header: "Customers", align: "right", render: (r) => fmtNum(r.affectedCustomers) },
                {
                  key: "delta",
                  header: "Δ vs comp.",
                  align: "right",
                  render: (r) => {
                    const d = deltaFor(range, `comp-${r.institution}`);
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
        );
      }}
    </ReportPageShell>
  );
}
