import { useEffect, useState } from "react";
import { Sparkles, ChevronDown, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { buildAiBrief, type AiBriefContext, type AiNextAction } from "@/lib/campaignAiEngine";

interface Props {
  ctx: AiBriefContext;
  onAction: (action: AiNextAction) => void;
}

export function AiCampaignBrief({ ctx, onAction }: Props) {
  const brief = buildAiBrief(ctx);
  const [thinking, setThinking] = useState(false);
  const [openTrace, setOpenTrace] = useState(false);

  const stateKey = `${ctx.mode}|${ctx.productName}|${ctx.audience}|${ctx.offers.join(",")}|${ctx.step}`;
  useEffect(() => {
    setThinking(true);
    const t = window.setTimeout(() => setThinking(false), 520);
    return () => window.clearTimeout(t);
  }, [stateKey]);

  const hasConfidence = brief.confidenceHigh > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-slate-900 to-slate-800">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 shrink-0 mt-0.5">
          {thinking ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-300 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-300">Ventus AI campaign brief</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              live
            </span>
          </div>
          {thinking ? (
            <div className="mt-1.5 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-white/10 animate-pulse" />
            </div>
          ) : (
            <p className="text-sm text-white font-medium leading-snug mt-1">{brief.recommendation}</p>
          )}
        </div>
        {hasConfidence && !thinking && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Confidence</p>
            <p className="text-lg font-semibold text-white tabular-nums leading-tight">
              {brief.confidenceLow}–{brief.confidenceHigh}%
            </p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {brief.drivers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {brief.drivers.map((d) => (
              <span
                key={d}
                className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] text-slate-600"
              >
                {d}
              </span>
            ))}
          </div>
        )}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Recommended next steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {brief.actions.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onAction(a)}
                className="text-left rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 transition-colors p-2.5 group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="flex items-center justify-center w-4 h-4 rounded bg-slate-900 text-white text-[9px] font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-900 leading-tight">{a.label}</span>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 ml-auto shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">{a.detail}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => setOpenTrace((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            {openTrace ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            How Ventus got here
          </button>
          {openTrace && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {brief.reasoning.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-3 py-1 border-b border-slate-100">
                  <span className="text-[10px] uppercase tracking-wide text-slate-500 shrink-0">{r.label}</span>
                  <span className="text-[11px] text-slate-800 text-right">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
