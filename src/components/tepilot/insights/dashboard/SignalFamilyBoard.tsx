import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getSignalFamilyStats, fmtCount } from "@/lib/intelligenceSignalStats";
import type { SignalFamily } from "@/lib/customerDirectoryData";
import { Sparkline } from "./Sparkline";
import { SignalFamilyPanel } from "./SignalFamilyPanel";

interface SignalFamilyBoardProps {
  onOpenSignal?: (family: SignalFamily, label: string) => void;
}

export function SignalFamilyBoard({ onOpenSignal }: SignalFamilyBoardProps) {
  const families = getSignalFamilyStats();
  const [expanded, setExpanded] = useState<SignalFamily | null>("life_event");

  const active = expanded ? families.find((f) => f.key === expanded) ?? null : null;

  return (
    <div className="space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      {families.map((f) => {
        const total = f.confidence.strong + f.confidence.likely + f.confidence.emerging;
        const isActive = expanded === f.key;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => setExpanded(isActive ? null : f.key)}
            aria-expanded={isActive}
            className={`group text-left rounded-md border p-3 hover:shadow-sm transition-all ${f.tint} ${f.cardBorder} ${f.cardBorderHover} ${isActive ? `ring-2 ${f.cardRing} shadow-sm` : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${f.chip}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
                {f.label}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-all ${isActive ? "rotate-180 text-slate-700" : "text-slate-300 group-hover:text-slate-600"}`}
              />
            </div>

            <div className="mt-2.5 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none">
                    {fmtCount(f.customers)}
                  </span>
                  <span
                    className={`text-[11px] tabular-nums ${f.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {f.delta >= 0 ? "+" : ""}
                    {f.delta.toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">customers · 24h</div>
              </div>
              <Sparkline data={f.sparkline} width={70} height={24} stroke={f.sparklineColor} />
            </div>

            <div className="mt-2.5">
              <div className="flex h-1.5 rounded-full overflow-hidden bg-white/60">
                <span
                  className={f.barStrong}
                  style={{ width: `${(f.confidence.strong / total) * 100}%` }}
                />
                <span
                  className={f.barLikely}
                  style={{ width: `${(f.confidence.likely / total) * 100}%` }}
                />
                <span
                  className={f.barEmerging}
                  style={{ width: `${(f.confidence.emerging / total) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>{f.confidence.strong}% strong</span>
                <span className="text-slate-400 group-hover:text-slate-700 transition-colors">
                  {f.topSignals.length} signals
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>

    {active && (
      <SignalFamilyPanel
        key={active.key}
        family={active}
        onClose={() => setExpanded(null)}
        onOpenSignal={(f, label) => onOpenSignal?.(f, label)}
      />
    )}
    </div>
  );
}
