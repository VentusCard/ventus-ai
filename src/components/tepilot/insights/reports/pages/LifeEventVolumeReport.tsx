import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { LIFE_EVENT_CONFIG, type DetectedLifeEvent } from "@/types/dashboardClient";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";
import { seededRand } from "../../dashboard/useDashboardRange";

type EventKey = DetectedLifeEvent["eventType"];

function fmtNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

const COLORS: Record<string, string> = {
  retirement: "#f59e0b",
  education: "#3b82f6",
  home_purchase: "#10b981",
  wealth_transfer: "#8b5cf6",
  business_liquidity: "#64748b",
  family_formation: "#ec4899",
  elder_care: "#f43f5e",
};

export function LifeEventVolumeReport({ onBack }: { onBack: () => void }) {
  const eventKeys = Object.keys(LIFE_EVENT_CONFIG) as EventKey[];

  return (
    <ReportPageShell
      title="Life-event volume"
      category="Lifestyle"
      description="Detected life events by month and event type across the portfolio."
      onBack={onBack}
      defaultPreset="ytd"
    >
      {({ range }) => {
        const months = useMemo(() => {
          const out: { month: string; date: Date }[] = [];
          const cur = new Date(range.start);
          cur.setDate(1);
          while (cur <= range.end) {
            out.push({
              month: cur.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
              date: new Date(cur),
            });
            cur.setMonth(cur.getMonth() + 1);
          }
          return out;
        }, [range.start, range.end]);

        const data = useMemo(
          () =>
            months.map((m, mi) => {
              const row: Record<string, number | string> = { month: m.month };
              eventKeys.forEach((k, ki) => {
                const base = 800 + ki * 250;
                row[k] = Math.round(base * (0.6 + seededRand(range.seed + mi, ki * 9) * 1.4));
              });
              return row;
            }),
          [months, eventKeys, range.seed],
        );

        const totals = useMemo(() => {
          return eventKeys
            .map((k) => {
              let total = 0;
              data.forEach((row) => (total += row[k] as number));
              const lastMonth = (data[data.length - 1]?.[k] as number) ?? 0;
              const prevMonth = (data[data.length - 2]?.[k] as number) ?? lastMonth;
              const mom = prevMonth === 0 ? 0 : ((lastMonth - prevMonth) / prevMonth) * 100;
              return { key: k, label: LIFE_EVENT_CONFIG[k].label, total, mom };
            })
            .sort((a, b) => b.total - a.total);
        }, [data, eventKeys]);

        return (
          <>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => fmtNum(v as number)}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        background: "white",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {eventKeys.map((k) => (
                      <Bar
                        key={k}
                        dataKey={k}
                        stackId="events"
                        name={LIFE_EVENT_CONFIG[k].label}
                        fill={COLORS[k] ?? "#94a3b8"}
                        isAnimationActive={false}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ReportDataTable
              caption={`Event totals (${range.label})`}
              rows={totals}
              rowKey={(r) => r.key}
              columns={[
                {
                  key: "label",
                  header: "Event type",
                  render: (r) => (
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-sm"
                        style={{ background: COLORS[r.key] ?? "#94a3b8" }}
                      />
                      {r.label}
                    </div>
                  ),
                },
                { key: "t", header: "Detected", align: "right", render: (r) => fmtNum(r.total) },
                {
                  key: "mom",
                  header: "MoM Δ",
                  align: "right",
                  render: (r) => (
                    <span className={r.mom >= 0 ? "text-emerald-600" : "text-rose-600"}>
                      {r.mom >= 0 ? "+" : ""}
                      {r.mom.toFixed(1)}%
                    </span>
                  ),
                },
              ]}
            />
          </>
        );
      }}
    </ReportPageShell>
  );
}
