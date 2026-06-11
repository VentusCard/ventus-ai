import { cn } from "@/lib/utils";

export type LifeStageFilter = "All" | "Young Pros" | "Families" | "Pre-Retirees" | "Retirees" | "SMB";
export type SortKey = "score" | "audience" | "momentum";

const LIFE_STAGES: LifeStageFilter[] = ["All", "Young Pros", "Families", "Pre-Retirees", "Retirees", "SMB"];
const SORTS: { id: SortKey; label: string }[] = [
  { id: "score", label: "Top score" },
  { id: "audience", label: "Audience size" },
  { id: "momentum", label: "Momentum" },
];

interface Props {
  lifeStage: LifeStageFilter;
  onLifeStage: (s: LifeStageFilter) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
}

export function CohortFilters({ lifeStage, onLifeStage, sort, onSort }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mr-1">
          Life stage
        </span>
        {LIFE_STAGES.map((s) => (
          <button
            key={s}
            onClick={() => onLifeStage(s)}
            className={cn(
              "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors",
              lifeStage === s
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mr-1">
          Sort by
        </span>
        {SORTS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSort(s.id)}
            className={cn(
              "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors",
              sort === s.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
