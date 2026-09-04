import { useEffect, useState } from "react";
import { TrendingUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LtvLiftResult } from "@/lib/personalizationLtvLift";

interface LtvLiftSliverProps {
  result: LtvLiftResult;
  /** False when no customer is selected — renders muted like Key Features. */
  hasSelection: boolean;
}

/**
 * Compact "Anticipated LTV Lift" card shown above Key Features.
 * Collapsed by default (~25% of the column height); expanding pushes
 * Key Features down.
 */
export function LtvLiftSliver({ result, hasSelection }: LtvLiftSliverProps) {
  const [expanded, setExpanded] = useState(false);

  // Collapse again whenever the customer changes.
  useEffect(() => {
    setExpanded(false);
  }, [result.driverHint, hasSelection]);

  return (
    <div
      className={cn(
        "shrink-0 border border-slate-200 rounded-lg bg-white overflow-hidden transition-all duration-300",
        expanded ? "max-h-[55%]" : "h-[12.5%] min-h-[64px]",
        !hasSelection && "opacity-60 grayscale select-none",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full h-full min-h-[64px] px-3.5 flex flex-col justify-center text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
              hasSelection ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400",
            )}
          >
            <TrendingUp className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-slate-900 leading-snug">
              Anticipated LTV Lift
            </p>
            <p className="text-[11.5px] text-slate-400 leading-relaxed mt-0.5 truncate">
              {result.driverHint}
            </p>
          </div>
          <span
            className={cn(
              "flex items-baseline gap-1 px-2.5 py-1 rounded-md text-[19px] font-bold tabular-nums shrink-0",
              hasSelection
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-400",
            )}
          >
            {result.display}
            <span className="text-[10.5px] font-medium text-slate-400">/ customer / yr</span>
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </div>

        {/* Expanded detail lines */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="pt-2.5 mt-2.5 border-t border-slate-100 space-y-1.5">
              {result.lines.map((line) => (
                <div key={line.label} className="flex items-center justify-between gap-3">
                  <span className="text-[11.5px] text-slate-500">{line.label}</span>
                  <span className="text-[11.5px] font-semibold text-slate-800 tabular-nums">
                    {line.display}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
