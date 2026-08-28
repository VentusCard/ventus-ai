import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SIGNAL_FAMILY_META, type DirectorySignal } from "@/lib/customerDirectoryData";
import type { ExampleCustomer } from "@/lib/personalizationExamples";
import { PulseDot } from "@/components/tepilot/common/PulseDot";

const CONFIDENCE_STYLE: Record<DirectorySignal["confidence"], string> = {
  Emerging: "bg-white/70 text-slate-500",
  Likely: "bg-white/80 text-slate-600",
  Strong: "bg-white text-slate-800",
};

interface Props {
  customer: ExampleCustomer;
  /** Label of the signal currently driving the phone collection. */
  focusedLabel?: string | null;
  /** Labels that resolve to a generated collection. `null` = unknown (still generating). */
  availableLabels?: Set<string> | null;
  onSignalClick?: (signal: DirectorySignal) => void;
}

export function CustomerSignalPanel({
  customer,
  focusedLabel = null,
  availableLabels = null,
  onSignalClick,
}: Props) {
  const [revealed, setRevealed] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setRevealed(0);
    setExpanded(null);
    const timers = SIGNAL_FAMILY_META.map((_, i) =>
      window.setTimeout(() => setRevealed(i + 1), 120 * (i + 1)),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [customer.id]);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <p className="min-w-0 text-[14px] font-semibold text-slate-900 truncate">
          {customer.name}{" "}
          <span className="text-[12px] font-medium text-slate-500 tabular-nums">
            · {customer.customerId}
          </span>
        </p>
        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0">
          <PulseDot colorClass="bg-emerald-500" sizeClass="w-1.5 h-1.5" />
          Ready
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto exec-light-scroll pt-3 pr-1 space-y-3">
        {SIGNAL_FAMILY_META.map((m, i) => {
          const signals = customer[m.field as keyof ExampleCustomer] as DirectorySignal[];
          const isVisible = revealed > i;
          return (
            <div
              key={m.key}
              className={cn(
                "transition-all duration-300",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <PulseDot colorClass={m.dot} sizeClass="w-2 h-2" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {m.label}
                </span>
                <span className="text-[11px] text-slate-400 tabular-nums">{signals.length}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {signals.length === 0 ? (
                <p className="text-[12px] text-slate-400 italic">No signals detected</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {signals.map((sig) => {
                    const key = `${m.key}:${sig.label}`;
                    const isOpen = expanded === key;
                    const isFocused = focusedLabel === sig.label;
                    const hasCollection = availableLabels ? availableLabels.has(sig.label) : true;
                    return (
                      <div key={key} className={isOpen ? "w-full" : ""}>
                        <button
                          onClick={() => {
                            setExpanded(isOpen ? null : key);
                            onSignalClick?.(sig);
                          }}
                          title={
                            hasCollection
                              ? "Show this signal's deal collection"
                              : "No collection generated for this signal yet"
                          }
                          className={cn(
                            "inline-flex items-center gap-2 text-[13px] px-3.5 py-2.5 font-semibold rounded-full border transition-all duration-200",
                            m.chip,
                            !hasCollection && "opacity-55",
                            isFocused
                              ? "ring-2 ring-offset-1 ring-blue-400 shadow-sm"
                              : isOpen
                                ? "ring-2 ring-offset-1 ring-slate-200"
                                : "hover:brightness-95",
                          )}
                        >
                          {sig.label}
                          {sig.source === "external" && (
                            <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-1.5 py-px bg-slate-900 text-white">
                              Ext
                            </span>
                          )}
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider rounded-full px-1.5 py-px border border-white/60",
                              CONFIDENCE_STYLE[sig.confidence],
                            )}
                          >
                            {sig.confidence}
                          </span>
                        </button>
                        {isOpen && (
                          <p className="mt-2 text-[12px] text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-3">
                            {sig.evidence}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Greyed-out preview shown before a customer is selected. */
export function CustomerSignalSkeleton() {
  return (
    <div className="h-full flex flex-col min-h-0 opacity-70 select-none pointer-events-none">
      <div className="shrink-0 flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <p className="min-w-0 text-[14px] font-semibold text-slate-400 truncate">
          No customer selected
        </p>
        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          Idle
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden pt-3 pr-1 space-y-3">
        {SIGNAL_FAMILY_META.map((m) => (
          <div key={m.key}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("w-2 h-2 rounded-full opacity-40", m.dot)} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {m.label}
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className="h-[30px] rounded-full bg-slate-100 border border-slate-200 animate-pulse"
                  style={{ width: i === 0 ? 128 : 92 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
