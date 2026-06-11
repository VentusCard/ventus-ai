import { useEffect, useState } from "react";
import { Sparkles, Zap, Pause, FilePlus2, TrendingUp, ShieldOff, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTONOMOUS_ACTIVITY, type ActivityAction } from "./data/autonomousActivity";

const ACTION_META: Record<ActivityAction, { icon: React.ElementType; tone: string }> = {
  Enrolled: { icon: Zap, tone: "bg-blue-50 text-blue-700 border-blue-200" },
  Paused: { icon: Pause, tone: "bg-amber-50 text-amber-700 border-amber-200" },
  Drafted: { icon: FilePlus2, tone: "bg-violet-50 text-violet-700 border-violet-200" },
  Optimized: { icon: TrendingUp, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Suppressed: { icon: ShieldOff, tone: "bg-slate-50 text-slate-600 border-slate-200" },
  Detected: { icon: Radar, tone: "bg-sky-50 text-sky-700 border-sky-200" },
};

export function AutonomousActivityFeed() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setOffset((o) => (o + 1) % AUTONOMOUS_ACTIVITY.length), 6000);
    return () => clearInterval(t);
  }, []);

  const ordered = [
    ...AUTONOMOUS_ACTIVITY.slice(offset),
    ...AUTONOMOUS_ACTIVITY.slice(0, offset),
  ].slice(0, 5);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center justify-center w-5 h-5">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[12px] font-semibold text-slate-800">
            Ventus — autonomous activity
          </span>
          <span className="text-[11px] text-slate-400">running 24/7 inside your guardrails</span>
        </div>
        <button className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors">
          View all →
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {ordered.map((a, idx) => {
          const meta = ACTION_META[a.action];
          const Icon = meta.icon;
          return (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2 transition-colors",
                idx === 0 ? "bg-blue-50/40" : "hover:bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10.5px] font-semibold uppercase tracking-wider shrink-0",
                  meta.tone,
                )}
              >
                <Icon className="w-3 h-3" />
                {a.action}
              </span>
              <span className="flex-1 min-w-0 text-[12.5px] text-slate-700 truncate">
                {a.description}
              </span>
              {a.affected && (
                <span className="text-[11px] font-medium text-slate-500 shrink-0">
                  {a.affected}
                </span>
              )}
              <span className="text-[10.5px] text-slate-400 shrink-0 w-16 text-right">
                {a.timeAgo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
