import { useState } from "react";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import { fmtCount, type SignalFamilyStats } from "@/lib/intelligenceSignalStats";
import type { SignalFamily } from "@/lib/customerDirectoryData";
import { Sparkline } from "./Sparkline";

interface SignalFamilyPanelProps {
  family: SignalFamilyStats;
  onClose: () => void;
  onOpenSignal: (family: SignalFamily, label: string) => void;
}

/** Static Tailwind classes: family color × strong-share intensity step. */
const STRONG_PILL: Record<SignalFamily, [string, string, string, string]> = {
  spending_habit: [
    "bg-blue-50 text-blue-600/80 border-blue-100",
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-blue-300 text-blue-900 border-blue-400",
    "bg-blue-700 text-white border-blue-700",
  ],
  life_event: [
    "bg-amber-50 text-amber-700/80 border-amber-100",
    "bg-amber-100 text-amber-800 border-amber-200",
    "bg-amber-300 text-amber-900 border-amber-400",
    "bg-amber-700 text-white border-amber-700",
  ],
  financial: [
    "bg-emerald-50 text-emerald-600/80 border-emerald-100",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-emerald-300 text-emerald-900 border-emerald-400",
    "bg-emerald-700 text-white border-emerald-700",
  ],
  demographic: [
    "bg-violet-50 text-violet-600/80 border-violet-100",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-violet-300 text-violet-900 border-violet-400",
    "bg-violet-700 text-white border-violet-700",
  ],
  risk: [
    "bg-rose-50 text-rose-600/80 border-rose-100",
    "bg-rose-100 text-rose-700 border-rose-200",
    "bg-rose-300 text-rose-900 border-rose-400",
    "bg-rose-700 text-white border-rose-700",
  ],
};

/** Signals shown before the drawer needs an explicit expand. */
const VISIBLE_LIMIT = 9;

/** 0 = faint, 3 = deepest. */
function pillStep(strongPct: number): 0 | 1 | 2 | 3 {
  if (strongPct >= 70) return 3;
  if (strongPct >= 55) return 2;
  if (strongPct >= 40) return 1;
  return 0;
}


export function SignalFamilyPanel({
  family,
  onClose,
  onOpenSignal,
}: SignalFamilyPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const ordered = [...family.topSignals].sort((a, b) => b.customers - a.customers);
  const visible = showAll ? ordered : ordered.slice(0, VISIBLE_LIMIT);
  const hidden = ordered.length - visible.length;

  return (
    <div className={`col-span-full rounded-lg border ${family.cardBorder} bg-white shadow-sm animate-in fade-in slide-in-from-top-1 duration-200`}>
      {/* Slim bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200">
        <span className="text-[11px] text-slate-500 truncate">
          Click any signal to open that segment in Customers
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Collapse signal family"
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>



      {/* Signals */}
      <div className="p-3 grid grid-cols-2 lg:grid-cols-3 gap-2">
        {visible.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onOpenSignal(family.key, s.label)}
            className={`group text-left rounded-md border border-slate-200 bg-white px-3 py-2.5 transition-colors ${family.rowHoverBorder} ${family.rowHover}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-semibold text-slate-900 truncate flex-1">
                {s.label}
              </span>
              <span
                title={`Strong ${s.confidence.strong}% · Likely ${s.confidence.likely}% · Emerging ${s.confidence.emerging}%`}
                className={`px-1.5 py-[1px] rounded-full border text-[9.5px] font-medium tracking-wide shrink-0 tabular-nums ${STRONG_PILL[family.key][pillStep(s.confidence.strong)]}`}
              >

                {s.confidence.strong}% strong
              </span>
            </div>

            <div className="text-[11px] text-slate-500 mt-1 truncate">{s.evidence}</div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-[14px] font-semibold text-slate-900 tabular-nums leading-none">
                {fmtCount(s.customers)}
              </span>
              <span
                className={`text-[10.5px] tabular-nums ${s.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {s.delta >= 0 ? "+" : ""}
                {s.delta.toFixed(1)}%
              </span>
              <Sparkline data={s.trend} width={56} height={16} stroke={family.sparklineColor} />

              <ArrowRight
                className={`ml-auto w-3 h-3 shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ${family.openText}`}
              />
            </div>

            {/* Evidence-strength split across this signal's population */}
            <div
              title={`Strong ${s.confidence.strong}% · Likely ${s.confidence.likely}% · Emerging ${s.confidence.emerging}%`}
              className="mt-2 h-1 w-full rounded-full overflow-hidden bg-slate-100 flex"
            >
              <div className={family.barStrong} style={{ width: `${s.confidence.strong}%` }} />
              <div className={family.barLikely} style={{ width: `${s.confidence.likely}%` }} />
              <div className={family.barEmerging} style={{ width: `${s.confidence.emerging}%` }} />
            </div>

          </button>
        ))}
      </div>

      {ordered.length > VISIBLE_LIMIT && (
        <div className="px-3 pb-3 -mt-1">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className={`w-full flex items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 bg-slate-50/60 py-2 text-[11.5px] font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900`}
          >
            {showAll ? "Show top 9 signals" : `Show all ${ordered.length} signals`}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}

    </div>
  );
}
