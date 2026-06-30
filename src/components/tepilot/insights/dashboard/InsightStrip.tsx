import { Sparkles, ArrowRight, TrendingUp, AlertCircle } from "lucide-react";
import type { RevenueOpportunity } from "@/types/bankwide";
import { cn } from "@/lib/utils";

interface InsightStripProps {
  opportunities: RevenueOpportunity[];
  onSeeWhy?: () => void;
}

const PRIORITY_STYLE: Record<
  RevenueOpportunity["priority"],
  { tone: string; icon: typeof Sparkles; label: string }
> = {
  high: { tone: "text-amber-700 bg-amber-50 border-amber-100", icon: AlertCircle, label: "High priority" },
  medium: { tone: "text-blue-700 bg-blue-50 border-blue-100", icon: TrendingUp, label: "Opportunity" },
  low: { tone: "text-slate-600 bg-slate-50 border-slate-100", icon: Sparkles, label: "Signal" },
};

function compactDollars(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function InsightStrip({ opportunities, onSeeWhy }: InsightStripProps) {
  const top = opportunities.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
      <div className="flex divide-x divide-slate-100">
        {top.map((op) => {
          const style = PRIORITY_STYLE[op.priority];
          const Icon = style.icon;
          return (
            <div key={op.id} className="flex-1 min-w-0 p-3 flex gap-3">
              <div
                className={cn(
                  "shrink-0 w-7 h-7 rounded border flex items-center justify-center",
                  style.tone,
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">
                    {style.label}
                  </span>
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    {compactDollars(op.totalOpportunityAmount)} · {(op.affectedUsers / 1e6).toFixed(1)}M users
                  </span>
                </div>
                <div className="text-[13px] font-medium text-slate-900 leading-tight mt-0.5 truncate">
                  {op.gapTitle}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {op.strategicInsight}
                </div>
              </div>
              {onSeeWhy && (
                <button
                  onClick={onSeeWhy}
                  className="shrink-0 self-start text-[11px] text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5 mt-0.5"
                >
                  See why
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
