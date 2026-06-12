import { cn } from "@/lib/utils";
import { CohortDef, PRODUCTS, topProductFor } from "./data/cohorts";

function formatAudience(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function scoreShade(score: number): string {
  // sky scale, deeper = stronger
  if (score >= 80) return "bg-sky-600 text-white";
  if (score >= 65) return "bg-sky-500 text-white";
  if (score >= 50) return "bg-sky-300 text-sky-900";
  if (score >= 35) return "bg-sky-100 text-sky-900";
  if (score >= 20) return "bg-slate-100 text-slate-700";
  return "bg-white text-slate-400";
}

interface Props {
  cohorts: CohortDef[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CohortProductHeatmap({ cohorts, selectedId, onSelect }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="sticky left-0 bg-slate-50 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px] px-3 py-2 w-[260px] min-w-[260px]">
                Cohort
              </th>
              <th className="text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px] px-2 py-2 w-[64px]">
                Audience
              </th>
              {PRODUCTS.map((p) => (
                <th
                  key={p.id}
                  className="text-center font-semibold text-slate-500 uppercase tracking-wider text-[10px] px-1.5 py-2"
                >
                  {p.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c) => {
              const top = topProductFor(c);
              const isSelected = selectedId === c.id;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "border-b border-slate-100 cursor-pointer transition-colors",
                    isSelected ? "bg-slate-50" : "hover:bg-slate-50/60",
                  )}
                >
                  <td className="sticky left-0 bg-inherit px-3 py-2 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900 text-[12px] leading-tight">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-tight">
                        {c.lifeStage} · {c.dominantPillars.slice(0, 2).join(" + ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right text-slate-700 tabular-nums">
                    {formatAudience(c.audience)}
                  </td>
                  {PRODUCTS.map((p) => {
                    const score = c.scores[p.id] ?? 0;
                    const isTop = p.id === top.id;
                    return (
                      <td key={p.id} className="px-1 py-1 text-center">
                        <div
                          className={cn(
                            "mx-auto w-12 h-8 rounded flex items-center justify-center font-semibold tabular-nums text-[11px]",
                            scoreShade(score),
                            isTop && "ring-2 ring-slate-900 ring-offset-1 ring-offset-white",
                          )}
                        >
                          {score}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[10px] text-slate-500">
        <span>Outlined cell = cohort's next product. Click any row for drill-down.</span>
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider font-semibold">Signal</span>
          {[10, 30, 50, 70, 85].map((s) => (
            <div
              key={s}
              className={cn(
                "w-6 h-3 rounded flex items-center justify-center font-semibold text-[9px]",
                scoreShade(s),
              )}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
