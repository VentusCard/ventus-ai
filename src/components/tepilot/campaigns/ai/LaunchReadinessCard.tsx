import { Rocket, Check, X, AlertTriangle } from "lucide-react";
import { assessReadiness, type AiBriefContext } from "@/lib/campaignAiEngine";

interface Props {
  ctx: AiBriefContext;
  guardrailsPassed: boolean;
}

export function LaunchReadinessCard({ ctx, guardrailsPassed }: Props) {
  const readiness = assessReadiness(ctx, guardrailsPassed);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Rocket className="w-4 h-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-900">Launch readiness</p>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${readiness.ready ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${readiness.score}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-900 tabular-nums">{readiness.score}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mb-3">
        {readiness.items.map((item) => {
          const Icon = item.ok ? Check : item.blocking ? X : AlertTriangle;
          const tone = item.ok
            ? "text-emerald-600 bg-emerald-50 border-emerald-200"
            : item.blocking
              ? "text-rose-600 bg-rose-50 border-rose-200"
              : "text-amber-600 bg-amber-50 border-amber-200";
          return (
            <div key={item.id} className="flex items-start gap-2 py-1.5 border-b border-slate-100">
              <span className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 mt-0.5 ${tone}`}>
                <Icon className="w-2.5 h-2.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-900 leading-tight">{item.label}</p>
                <p className="text-[10px] text-slate-500 leading-snug truncate">{item.detail}</p>
              </div>
              {!item.ok && !item.blocking && (
                <span className="text-[9px] uppercase tracking-wide text-amber-600 shrink-0">optional</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!readiness.ready}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Rocket className="w-3.5 h-3.5" />
          Launch campaign
        </button>
        <p className="text-[11px] text-slate-500">
          {readiness.ready
            ? "All blocking checks are clear. Launch queues the send for the recommended window."
            : "Blocking checks are still open — clear them and the launch unlocks."}
        </p>
      </div>
    </div>
  );
}
