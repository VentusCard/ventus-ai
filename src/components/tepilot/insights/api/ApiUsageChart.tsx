import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { buildUsageSeries, API_USAGE_RANGES, type ApiUsageRange } from "@/lib/apiUsageData";

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

export function ApiUsageChart() {
  const [range, setRange] = useState<ApiUsageRange>(30);
  const data = useMemo(() => buildUsageSeries(range), [range]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">API call volume</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Successful vs failed requests per day</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {API_USAGE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
                range === r ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="apiSuccessFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(v: string) => v.slice(5)}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompact}
              width={44}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 11,
                color: "#0f172a",
              }}
              formatter={(value: number, name: string) => [value.toLocaleString(), name === "success" ? "Success" : "Errors"]}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 11, color: "#64748b" }}
              formatter={(v) => (v === "success" ? "Success" : "Errors")}
            />
            <Area type="monotone" dataKey="success" stroke="#2563eb" strokeWidth={2} fill="url(#apiSuccessFill)" />
            <Area type="monotone" dataKey="error" stroke="#f43f5e" strokeWidth={1.5} fill="#f43f5e" fillOpacity={0.12} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
