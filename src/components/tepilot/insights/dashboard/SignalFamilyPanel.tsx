import { ArrowRight, X } from "lucide-react";
import { fmtCount, type SignalFamilyStats } from "@/lib/intelligenceSignalStats";
import type { SignalFamily } from "@/lib/customerDirectoryData";
import { Sparkline } from "./Sparkline";

interface SignalFamilyPanelProps {
  family: SignalFamilyStats;
  onClose: () => void;
  onOpenSignal: (family: SignalFamily, label: string) => void;
}

const CONFIDENCE_CHIP: Record<string, string> = {
  strong: "bg-slate-900 text-white border-slate-900",
  likely: "bg-slate-100 text-slate-700 border-slate-200",
  emerging: "bg-white text-slate-500 border-slate-200",
};

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
      <div className="p-3 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
        {family.topSignals.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onOpenSignal(family.key, s.label)}
            className={`group text-left rounded-md border border-slate-200 bg-white px-2.5 py-2 transition-colors ${family.rowHoverBorder} ${family.rowHover}`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-semibold text-slate-900 truncate flex-1">
                {s.label}
              </span>
              <span
                className={`px-1 py-[1px] rounded-full border text-[9px] font-medium uppercase tracking-wide shrink-0 ${CONFIDENCE_CHIP[s.confidence]}`}
              >
                {s.confidence}
              </span>
            </div>

            <div className="text-[10.5px] text-slate-500 mt-0.5 truncate">{s.evidence}</div>

            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[13px] font-semibold text-slate-900 tabular-nums leading-none">
                {fmtCount(s.customers)}
              </span>
              <span
                className={`text-[10px] tabular-nums ${s.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {s.delta >= 0 ? "+" : ""}
                {s.delta.toFixed(1)}%
              </span>
              <Sparkline data={s.trend} width={44} height={14} stroke={family.sparklineColor} />
              <ArrowRight
                className={`ml-auto w-3 h-3 shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ${family.openText}`}
              />
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
