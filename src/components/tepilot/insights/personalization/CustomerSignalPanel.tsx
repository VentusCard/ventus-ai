import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SIGNAL_FAMILY_META, type DirectorySignal } from "@/lib/customerDirectoryData";
import type { ExampleCustomer } from "@/lib/personalizationExamples";

const CONFIDENCE_STYLE: Record<DirectorySignal["confidence"], string> = {
  Emerging: "bg-white/70 text-slate-500",
  Likely: "bg-white/80 text-slate-600",
  Strong: "bg-white text-slate-800",
};

interface Props {
  customer: ExampleCustomer;
}

export function CustomerSignalPanel({ customer }: Props) {
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
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[12.5px] font-semibold text-slate-900 truncate">
            Signals detected — {customer.name}
          </h3>
          <p className="text-[10.5px] text-slate-500 mt-0.5 truncate">
            {customer.segment} · {customer.city} · {customer.lifestyleType}
          </p>
        </div>
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0">
          Ready
        </span>
      </div>

      <div className="p-3 space-y-3">
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
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} />
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                  {m.label}
                </span>
                <span className="text-[9.5px] text-slate-400 tabular-nums">{signals.length}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {signals.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No signals detected</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {signals.map((sig) => {
                    const key = `${m.key}:${sig.label}`;
                    const isOpen = expanded === key;
                    return (
                      <div key={key} className={isOpen ? "w-full" : ""}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : key)}
                          className={cn(
                            "inline-flex items-center gap-2 text-[11.5px] px-3 py-1.5 font-semibold rounded-full border transition-all duration-200",
                            m.chip,
                            isOpen ? "ring-2 ring-offset-1 ring-slate-200" : "hover:brightness-95",
                          )}
                        >
                          {sig.label}
                          {sig.source === "external" && (
                            <span className="text-[9px] font-bold uppercase tracking-wider rounded-full px-1.5 py-px bg-slate-900 text-white">
                              Ext
                            </span>
                          )}
                          <span
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-wider rounded-full px-1.5 py-px border border-white/60",
                              CONFIDENCE_STYLE[sig.confidence],
                            )}
                          >
                            {sig.confidence}
                          </span>
                        </button>
                        {isOpen && (
                          <p className="mt-1.5 text-[11px] text-slate-600 leading-snug border-l-2 border-slate-200 pl-2.5">
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
