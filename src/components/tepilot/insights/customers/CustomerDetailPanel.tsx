import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SIGNAL_FAMILY_META,
  type DirectoryCustomer,
  type DirectorySignal,
} from "@/lib/customerDirectoryData";
import { PulseDot } from "@/components/tepilot/common/PulseDot";

const CONFIDENCE_STYLE: Record<DirectorySignal["confidence"], string> = {
  Emerging: "bg-white/70 text-slate-500",
  Likely: "bg-white/70 text-slate-600",
  Strong: "bg-white text-slate-800",
};

interface Props {
  customer: DirectoryCustomer;
  onBack: () => void;
}

export function CustomerDetailPanel({ customer, onBack }: Props) {
  return (
    <div className="xl:sticky xl:top-3 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-[16px] font-bold text-slate-900 leading-tight">{customer.name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {customer.email} · {customer.city}
              </p>
            </div>
            <button
              onClick={onBack}
              aria-label="Close customer profile"
              className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                ["Tier", customer.tier],
                ["Age", customer.ageBand],
                ["Tenure", customer.tenure],
                ["Relationship", customer.relationshipValue],
                ["Segment", customer.segment],
                ["Last activity", customer.lastActivity],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
                  <div className="text-[12px] text-slate-800 font-medium">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2.5">
              {customer.products.map((p) => (
                <span
                  key={p}
                  className="text-[10px] text-slate-600 bg-white border border-slate-200 rounded-full px-2 py-0.5"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-md bg-white p-3">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Suggested next actions
            </div>
            <ul className="space-y-1.5">
              {customer.nextActions.map((a) => (
                <li key={a} className="flex items-start gap-2 text-[11.5px] text-slate-700 leading-snug">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-4 py-2.5 border-b border-slate-200 flex flex-wrap gap-2">
          {SIGNAL_FAMILY_META.map((m) => (
            <span
              key={m.key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
                customer[m.field].length ? m.chip : "border-slate-200 text-slate-400",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  customer[m.field].length ? m.dot : "bg-slate-300",
                )}
              />
              {m.label}
              <span className="tabular-nums font-semibold">{customer[m.field].length}</span>
            </span>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {SIGNAL_FAMILY_META.map((m) => {
            const signals = customer[m.field];
            return (
              <div key={m.key}>
                <div className="flex items-center gap-2 mb-2">
                  <PulseDot colorClass={m.dot} sizeClass="w-1.5 h-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {m.label}
                  </span>
                  <span className="text-[10px] text-slate-400">{signals.length}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                {signals.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No signals detected</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {signals.map((s) => (
                      <div key={s.label} className={cn("border rounded-md px-2.5 py-2", m.chip)}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-semibold leading-tight">{s.label}</span>
                          <span
                            className={cn(
                              "text-[9px] font-medium rounded px-1.5 py-px shrink-0 border border-white/60",
                              CONFIDENCE_STYLE[s.confidence],
                            )}
                          >
                            {s.confidence}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug mt-1">{s.evidence}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
