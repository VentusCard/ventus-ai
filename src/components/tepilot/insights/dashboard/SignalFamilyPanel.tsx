import { ArrowRight, X } from "lucide-react";
import { fmtCount, type SignalFamilyStats } from "@/lib/intelligenceSignalStats";
import type { SignalFamily } from "@/lib/customerDirectoryData";
import { Sparkline } from "./Sparkline";

interface SignalFamilyPanelProps {
  family: SignalFamilyStats;
  families: SignalFamilyStats[];
  onSwitchFamily: (key: SignalFamily) => void;
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
  families,
  onSwitchFamily,
  onClose,
  onOpenSignal,
}: SignalFamilyPanelProps) {
  const total =
    family.confidence.strong + family.confidence.likely + family.confidence.emerging;

  return (
    <div className="col-span-full rounded-lg border border-slate-300 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${family.chip}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${family.dot}`} />
              {family.label}
            </span>
            <span className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none">
              {fmtCount(family.customers)}
            </span>
            <span
              className={`text-[11px] tabular-nums ${family.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}
            >
              {family.delta >= 0 ? "+" : ""}
              {family.delta.toFixed(1)}% · 24h
            </span>
            <Sparkline data={family.sparkline} width={96} height={20} />
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            {family.confidence.strong}% strong · {family.confidence.likely}% likely ·{" "}
            {family.confidence.emerging}% emerging · click any signal to open that segment in
            Customers
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden lg:flex items-center gap-1">
            {families
              .filter((f) => f.key !== family.key)
              .map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => onSwitchFamily(f.key)}
                  className="px-2 py-1 rounded-md border border-slate-200 bg-white text-[10.5px] font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  {f.label}
                </button>
              ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Collapse signal family"
            className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="px-4 pt-3">
        <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100">
          <span
            className="bg-slate-800"
            style={{ width: `${(family.confidence.strong / total) * 100}%` }}
          />
          <span
            className="bg-slate-400"
            style={{ width: `${(family.confidence.likely / total) * 100}%` }}
          />
          <span
            className="bg-slate-200"
            style={{ width: `${(family.confidence.emerging / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Signals */}
      <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
        {family.topSignals.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onOpenSignal(family.key, s.label)}
            className="group text-left rounded-md border border-slate-200 bg-white px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-semibold text-slate-900 truncate flex-1">
                {s.label}
              </span>
              <span
                className={`px-1.5 py-[1px] rounded-full border text-[9.5px] font-medium uppercase tracking-wide shrink-0 ${CONFIDENCE_CHIP[s.confidence]}`}
              >
                {s.confidence}
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
              <Sparkline data={s.trend} width={56} height={16} stroke="#94a3b8" />
              <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-400 group-hover:text-blue-700 transition-colors">
                Open segment
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
