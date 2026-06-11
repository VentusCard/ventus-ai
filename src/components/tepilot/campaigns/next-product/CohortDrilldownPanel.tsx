import { CohortDef, rankedProductsFor } from "./data/cohorts";
import { cn } from "@/lib/utils";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";

function formatAudience(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

interface Props {
  cohort: CohortDef | null;
}

export function CohortDrilldownPanel({ cohort }: Props) {
  if (!cohort) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-[12px] text-slate-400 h-full flex items-center justify-center">
        Select a cohort to inspect its ranked next-product ladder and the Automated Flows feeding it.
      </div>
    );
  }

  const ranked = rankedProductsFor(cohort, 5);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Cohort</p>
        <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-tight">{cohort.name}</h3>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
          <span>{formatAudience(cohort.audience)} customers</span>
          <span>·</span>
          <span>{cohort.lifeStage}</span>
          <span>·</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              cohort.momentum >= 0 ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {cohort.momentum >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {cohort.momentum >= 0 ? "+" : ""}
            {cohort.momentum}% wk
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {cohort.dominantPillars.map((p) => (
            <span
              key={p}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
          Ranked next-product ladder
        </p>
        <div className="flex flex-col gap-1.5">
          {ranked.map((r, i) => {
            const flows = cohort.feedingFlows[r.product.id] ?? [];
            return (
              <div
                key={r.product.id}
                className="rounded-md border border-slate-200 bg-white p-2.5 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums w-4">
                      #{i + 1}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-900 truncate">
                      {r.product.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 tabular-nums">{r.score}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      r.score >= 80
                        ? "bg-sky-600"
                        : r.score >= 50
                          ? "bg-sky-500"
                          : "bg-sky-300",
                    )}
                    style={{ width: `${r.score}%` }}
                  />
                </div>
                {flows.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {flows.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
          Top signals feeding the score
        </p>
        <div className="flex flex-col gap-1.5">
          {cohort.topSignals.map((s) => (
            <div
              key={s.label}
              className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50/40 p-2"
            >
              <span
                className={cn(
                  "shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
                  s.type === "life-event"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-blue-50 text-blue-700 border-blue-200",
                )}
              >
                {s.type === "life-event" ? "Life Event" : "Behavioral"}
              </span>
              <span className="text-[11px] text-slate-700 leading-snug">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 leading-snug border-t border-slate-100 pt-2">
        Read-only intelligence. Campaign authoring lives in <span className="font-semibold">Campaign Builder</span>; per-product triggers live in <span className="font-semibold">Automated Flows</span>.
      </p>
    </div>
  );
}
