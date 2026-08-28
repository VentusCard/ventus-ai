import { Sparkles, Mail, BellRing, LayoutTemplate, MessageSquare, TrendingUp, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTONOMOUS_ACTIVITY, type ActivityAction } from "./data/autonomousActivity";

const ACTION_META: Record<ActivityAction, { icon: React.ElementType; tone: string }> = {
  "Email sent": { icon: Mail, tone: "bg-blue-50 text-blue-700 border-blue-200" },
  "App push": { icon: BellRing, tone: "bg-sky-50 text-sky-700 border-sky-200" },
  "In-app": { icon: LayoutTemplate, tone: "bg-violet-50 text-violet-700 border-violet-200" },
  SMS: { icon: MessageSquare, tone: "bg-teal-50 text-teal-700 border-teal-200" },
  Optimized: { icon: TrendingUp, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Held: { icon: PauseCircle, tone: "bg-amber-50 text-amber-700 border-amber-200" },
};


const ROW_HEIGHT = 36; // px per row (py-2 + text line ~ 36px)
const VISIBLE_ROWS = 3;

export function AutonomousActivityFeed() {
  const doubled = [...AUTONOMOUS_ACTIVITY, ...AUTONOMOUS_ACTIVITY];

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
      <div
        className="overflow-hidden relative"
        style={{ height: ROW_HEIGHT * VISIBLE_ROWS }}
      >
        <div
          className="flex flex-col will-change-transform"
          style={{ animation: `ventus-activity-marquee ${AUTONOMOUS_ACTIVITY.length * 2.5}s linear infinite` }}
        >
          {doubled.map((a, idx) => {
            const meta = ACTION_META[a.action];
            const Icon = meta.icon;
            return (
              <div
                key={`${a.id}-${idx}`}
                className="flex items-center gap-3 px-3 border-b border-slate-100"
                style={{ height: ROW_HEIGHT }}
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
        <style>{`
          @keyframes ventus-activity-marquee {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
        `}</style>
      </div>
    </div>
  );
}
