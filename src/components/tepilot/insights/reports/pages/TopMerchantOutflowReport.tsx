import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { getOutflowByCategory } from "@/lib/mockBankwideData";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";

function fmtMoney(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

export function TopMerchantOutflowReport({ onBack }: { onBack: () => void }) {
  const rows = useMemo(
    () => [...getOutflowByCategory()].sort((a, b) => b.volume - a.volume),
    [],
  );
  const total = rows.reduce((s, r) => s + r.volume, 0);

  return (
    <ReportPageShell
      title="Top merchant outflow"
      category="Outflow"
      description="Largest external outflow categories by total volume."
      onBack={onBack}
    >
      {({ range }) => (
        <>
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rows}
                      dataKey="volume"
                      nameKey="category"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={1}
                      stroke="white"
                      strokeWidth={1}
                      isAnimationActive={false}
                    >
                      {rows.map((r) => (
                        <Cell key={r.category} fill={r.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        background: "white",
                      }}
                      formatter={(v: number) => [fmtMoney(v), "Outflow"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {rows.map((r) => (
                  <div key={r.category} className="flex items-center gap-2 text-[12px]">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: r.color }} />
                    <span className="text-slate-700 truncate flex-1">{r.category}</span>
                    <span className="tabular-nums text-slate-500">{fmtMoney(r.volume)}</span>
                    <span className="tabular-nums text-slate-400 w-12 text-right">
                      {((r.volume / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ReportDataTable
            caption={`Outflow categories (${range.label})`}
            rows={rows}
            rowKey={(r) => r.category}
            columns={[
              {
                key: "name",
                header: "Category",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: r.color }} />
                    {r.category}
                  </div>
                ),
              },
              { key: "v", header: "Outflow", align: "right", render: (r) => fmtMoney(r.volume) },
              {
                key: "share",
                header: "Share",
                align: "right",
                render: (r) => `${((r.volume / total) * 100).toFixed(1)}%`,
              },
            ]}
          />
        </>
      )}
    </ReportPageShell>
  );
}
