import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getPillarDistribution, getBankwideMetrics } from "@/lib/mockBankwideData";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { deltaFor } from "../../dashboard/useDashboardRange";

const EMPTY = { cardProducts: [], regions: [], ageRanges: [] };

function fmt(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

export function LifestylePillarReport({ onBack }: { onBack: () => void }) {
  const pillarDist = useMemo(() => getPillarDistribution(EMPTY), []);
  const metrics = useMemo(() => getBankwideMetrics(EMPTY), []);
  const rows = Object.entries(pillarDist)
    .map(([name, pct]) => ({ name, pct, fill: PILLAR_COLORS[name] ?? "#94a3b8" }))
    .filter((r) => r.pct > 0)
    .sort((a, b) => b.pct - a.pct);

  return (
    <ReportPageShell
      title="Lifestyle pillar share"
      category="Lifestyle"
      description="Share of card spend across the 12 lifestyle pillars."
      onBack={onBack}
    >
      {({ range }) => {
        const days = Math.max(1, Math.round((+range.end - +range.start) / 86_400_000) + 1);
        const rangeSpend = (metrics.totalAnnualSpend / 365) * days;
        return (
          <>
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-6">
                <div className="w-[220px] h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rows}
                        dataKey="pct"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={1}
                        stroke="white"
                        strokeWidth={1}
                        isAnimationActive={false}
                      >
                        {rows.map((r) => (
                          <Cell key={r.name} fill={r.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {rows.slice(0, 8).map((r) => (
                    <div key={r.name} className="flex items-center gap-2 text-[12px]">
                      <span className="w-2 h-2 rounded-sm" style={{ background: r.fill }} />
                      <span className="text-slate-700 truncate flex-1">{r.name}</span>
                      <span className="tabular-nums text-slate-500">{r.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <ReportDataTable
              caption={`Pillars (${range.label})`}
              rows={rows}
              rowKey={(r) => r.name}
              columns={[
                {
                  key: "name",
                  header: "Pillar",
                  render: (r) => (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-sm" style={{ background: r.fill }} />
                      {r.name}
                    </div>
                  ),
                },
                { key: "pct", header: "Share", align: "right", render: (r) => `${r.pct.toFixed(2)}%` },
                {
                  key: "spend",
                  header: "Est. spend",
                  align: "right",
                  render: (r) => fmt((rangeSpend * r.pct) / 100),
                },
                {
                  key: "delta",
                  header: "Δ vs comp.",
                  align: "right",
                  render: (r) => {
                    const d = deltaFor(range, `pillar-${r.name}`);
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
