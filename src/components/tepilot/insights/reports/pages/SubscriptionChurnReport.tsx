import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { getSubscriptionTrend, getTopSubscriptions } from "@/lib/mockSubscriptionData";
import { ReportPageShell } from "../ReportPageShell";
import { ReportDataTable } from "../ReportDataTable";

function fmtMoney(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

export function SubscriptionChurnReport({ onBack }: { onBack: () => void }) {
  const trend = useMemo(() => getSubscriptionTrend(), []);
  const top = useMemo(() => getTopSubscriptions(), []);

  return (
    <ReportPageShell
      title="Subscription churn cohort"
      category="Retention"
      description="Monthly subscription spend with new vs. churned subscribers."
      onBack={onBack}
    >
      {() => (
        <>
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmtNum(v as number)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmtMoney(v as number)}
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
                  <Bar yAxisId="left" dataKey="newSubscribers" name="New" fill="#10b981" isAnimationActive={false} />
                  <Bar yAxisId="left" dataKey="churnedSubscribers" name="Churned" fill="#f43f5e" isAnimationActive={false} />
                  <Line
                    yAxisId="right"
                    dataKey="totalSpend"
                    name="Total spend"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <ReportDataTable
            caption="Top subscription merchants"
            rows={top}
            rowKey={(r) => r.merchant}
            columns={[
              { key: "rank", header: "#", align: "right", render: (r) => r.rank },
              { key: "m", header: "Merchant", render: (r) => r.merchant },
              { key: "c", header: "Category", render: (r) => r.category },
              { key: "s", header: "Subscribers", align: "right", render: (r) => fmtNum(r.subscriberCount) },
              { key: "v", header: "Monthly $", align: "right", render: (r) => fmtMoney(r.monthlyVolume) },
              {
                key: "mom",
                header: "MoM Δ",
                align: "right",
                render: (r) => (
                  <span className={r.momChange >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {r.momChange >= 0 ? "+" : ""}
                    {r.momChange.toFixed(1)}%
                  </span>
                ),
              },
              { key: "t", header: "Avg tenure", align: "right", render: (r) => `${r.avgTenureMonths} mo` },
            ]}
          />
        </>
      )}
    </ReportPageShell>
  );
}
