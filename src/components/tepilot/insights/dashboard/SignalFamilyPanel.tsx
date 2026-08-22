import { ArrowRight, X } from "lucide-react";
import { fmtCount, type SignalFamilyStats } from "@/lib/intelligenceSignalStats";
import type { SignalFamily } from "@/lib/customerDirectoryData";
import { Sparkline } from "./Sparkline";

interface SignalFamilyPanelProps {
  family: SignalFamilyStats;
  onClose: () => void;
  onOpenSignal: (family: SignalFamily, label: string) => void;
}


export function SignalFamilyPanel({
  family,
  onClose,
  onOpenSignal,
}: SignalFamilyPanelProps) {
  return (
    <div className="col-span-full rounded-lg border border-slate-300 bg-white shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
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
        {family.topSignals.map((s) => (
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
                className="px-1.5 py-[1px] rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-[9.5px] font-medium tracking-wide shrink-0 tabular-nums"
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

    </div>
  );
}
