import { useMemo } from "react";
import { Sparkles, TrendingUp, ShieldCheck, AlertTriangle, SplitSquareHorizontal } from "lucide-react";
import { checkGuardrails } from "@/lib/campaignAiEngine";
import type { MessageCard } from "../sections/buildMessageCards";

interface Props {
  cards: MessageCard[];
  featuredIdx: number;
  onSelect: (idx: number) => void;
}

export function MessageCopilot({ cards, featuredIdx, onSelect }: Props) {
  const results = useMemo(
    () => cards.map((c, i) => ({ card: c, idx: i, gr: checkGuardrails(c.subject, c.body, `${i}`) })),
    [cards],
  );

  if (results.length === 0) return null;

  const featured = results[Math.min(featuredIdx, results.length - 1)];
  const ranked = [...results].sort((a, b) => b.gr.predictedLiftPct - a.gr.predictedLiftPct);
  const [champion, challenger] = ranked;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600">
          <Sparkles className="w-3 h-3 text-white" />
        </span>
        <p className="text-xs font-semibold text-slate-900">Copy copilot</p>
        <span className="text-[10px] text-slate-400">predicted lift, tone, and guardrails per variant</span>
      </div>

      {/* per-variant strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {results.map((r) => {
          const active = r.idx === featured.idx;
          const clean = r.gr.status === "pass";
          return (
            <button
              key={r.idx}
              type="button"
              onClick={() => onSelect(r.idx)}
              className={`text-left rounded-lg border px-2.5 py-2 transition-colors ${
                active ? "border-blue-400 bg-blue-50/60" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[9px] font-mono text-slate-400">{String(r.idx + 1).padStart(2, "0")}</span>
                {clean ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                )}
                <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 tabular-nums">
                  <TrendingUp className="w-2.5 h-2.5" />+{r.gr.predictedLiftPct}%
                </span>
              </div>
              <p className="text-[10px] text-slate-700 leading-snug line-clamp-2">{r.card.anchor}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{r.gr.tone}</p>
            </button>
          );
        })}
      </div>

      {/* featured detail */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
          <Metric label="Predicted lift vs. control" value={`+${featured.gr.predictedLiftPct}%`} />
          <Metric label="Tone" value={featured.gr.tone} />
          <Metric label="Reading level" value={featured.gr.readingLevel} />
          <Metric
            label="Guardrails"
            value={featured.gr.status === "pass" ? "All clear" : `${featured.gr.issues.length} to review`}
          />
        </div>

        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Why this message</p>
        <p className="text-[11px] text-slate-700 leading-snug mb-2">{featured.card.why}</p>

        {featured.gr.issues.length > 0 ? (
          <div className="space-y-1">
            {featured.gr.issues.map((iss, i) => (
              <div
                key={`${iss.rule}-${i}`}
                className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5"
              >
                <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-amber-900 leading-tight">
                    {iss.rule}: {iss.note}
                  </p>
                  {iss.fix && <p className="text-[10px] text-amber-700 leading-snug mt-0.5">Suggested fix — {iss.fix}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <p className="text-[11px] text-emerald-800">
              Passes tone, compliance, length, and the vaguely-specific rule — no exact amounts or counts quoted back.
            </p>
          </div>
        )}
      </div>

      {/* A/B recommendation */}
      {challenger && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <SplitSquareHorizontal className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-900 leading-snug">
            <span className="font-semibold">Recommended A/B split:</span> run{" "}
            <span className="font-medium">{champion.card.anchor}</span> at 70% against{" "}
            <span className="font-medium">{challenger.card.anchor}</span> at 30% — they anchor on different signal
            families, so the read tells you which signal is actually driving response.
          </p>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-xs font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function allGuardrailsPass(cards: MessageCard[]): boolean {
  if (cards.length === 0) return false;
  return cards.every((c, i) => checkGuardrails(c.subject, c.body, `${i}`).status === "pass");
}
