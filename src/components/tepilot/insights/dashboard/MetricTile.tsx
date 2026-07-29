import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { ChartCard } from "./ChartCard";
import { cn } from "@/lib/utils";
import { dailySeries, type DashboardRange } from "./useDashboardRange";

interface MetricTileProps {
  label: string;
  value: string;
  delta: number | null;
  hint?: string;
  range: DashboardRange;
  seriesKey: string;
  /** Used to scale sparkline magnitude — arbitrary, only shape matters. */
  seriesScale: number;
  onOpenDetail?: () => void;
}

export function MetricTile({
  label,
  value,
  delta,
  hint,
  range,
  seriesKey,
  seriesScale,
  onOpenDetail,
}: MetricTileProps) {
  const data = dailySeries(range, seriesScale, seriesKey);
  const positive = (delta ?? 0) >= 0;
  const flat = delta === 0;

  return (
    <ChartCard title={label} onOpenDetail={onOpenDetail} bodyClassName="px-4 pb-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[22px] font-semibold text-slate-900 leading-none tabular-nums">
            {value}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            {delta === null ? (
              <span className="text-[11px] text-slate-400">No comparison</span>
            ) : (
              <>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded",
                    flat
                      ? "bg-slate-50 text-slate-500"
                      : positive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700",
                  )}
                >
                  {flat ? (
                    <Minus className="w-3 h-3" />
                  ) : positive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {flat ? "0%" : `${positive ? "+" : ""}${delta.toFixed(1)}%`}
                </span>
                {hint && <span className="text-[11px] text-slate-400 truncate">{hint}</span>}
              </>
            )}
          </div>
        </div>
        <div className="h-9 w-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={positive ? "#10b981" : "#f43f5e"}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
}
