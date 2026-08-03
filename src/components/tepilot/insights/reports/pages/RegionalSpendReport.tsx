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
import { GEOGRAPHIC_REGIONS } from "@/lib/mockBankwideData";
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

export function RegionalSpendReport({ onBack }: { onBack: () => void }) {
  const regions = useMemo(
    () => [...GEOGRAPHIC_REGIONS].sort((a, b) => b.totalSpend - a.totalSpend),
    [],
  );

  return (
    <ReportPageShell
      title="Spend by region"
      category="Lifestyle"
      description="Account count, total spend, and $/user across US regions."
      onBack={onBack}
    >
      {({ range }) => {
        const days = Math.max(1, Math.round((+range.end - +range.start) / 86_400_000) + 1);
        const scale = days / 365;
        const data = regions.map((r) => ({
          name: r.name,
          spend: r.totalSpend * scale,
        }));
        return (
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
                      tickFormatter={(v) => fmtMoney(v as number)}
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
                      formatter={(v: number) => [fmtMoney(v), "Spend"]}
                    />
                    <Bar dataKey="spend" fill="#10b981" radius={[0, 2, 2, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ReportDataTable
              caption={`Regions (${range.label})`}
              rows={regions}
              rowKey={(r) => r.name}
              columns={[
                { key: "name", header: "Region", render: (r) => r.name },
                { key: "accounts", header: "Accounts", align: "right", render: (r) => fmtNum(r.accountCount) },
                { key: "users", header: "Users", align: "right", render: (r) => fmtNum(r.userCount) },
                {
                  key: "spend",
                  header: "Spend",
                  align: "right",
                  render: (r) => fmtMoney(r.totalSpend * scale),
                },
                {
                  key: "perUser",
                  header: "$/user",
                  align: "right",
                  render: (r) => fmtMoney((r.totalSpend * scale) / r.userCount),
                },
                {
                  key: "delta",
                  header: "Δ vs comp.",
                  align: "right",
                  render: (r) => {
                    const d = deltaFor(range, `region-${r.name}`);
                    if (d === null) return <span className="text-slate-400">—</span>;
                    return (
                      <span className={d >= 0 ? "text-emerald-600" : "text-rose-600"}>
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
