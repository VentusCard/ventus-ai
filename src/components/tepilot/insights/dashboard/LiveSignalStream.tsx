import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { SIGNAL_STREAM } from "@/lib/intelligenceSignalStats";
import { SIGNAL_FAMILY_META } from "@/lib/customerDirectoryData";
import { PulseDot } from "@/components/tepilot/common/PulseDot";

const FAMILY_CHIP = Object.fromEntries(SIGNAL_FAMILY_META.map((m) => [m.key, m]));
const VISIBLE = 6;

export function LiveSignalStream() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setOffset((o) => (o + 1) % SIGNAL_STREAM.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  const rows = Array.from({ length: VISIBLE }, (_, i) => SIGNAL_STREAM[(offset + i) % SIGNAL_STREAM.length]);

  return (
    <div className="rounded-md border border-slate-200 bg-white h-full flex flex-col">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[12px] font-medium text-slate-700">Live signal stream</span>
        </div>
        <span className="text-[11px] text-slate-400">signal → evidence</span>
      </div>
      <div className="px-4 pb-4 space-y-1">

        {rows.map((r, i) => {
          const meta = FAMILY_CHIP[r.family];
          return (
            <div
              key={`${r.signal}-${i}`}
              className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0"
            >
              <PulseDot colorClass={meta?.dot ?? "bg-slate-400"} sizeClass="w-1.5 h-1.5" delayMs={i * 220} className="shrink-0" />
              <span className="text-[12px] font-medium text-slate-900 truncate max-w-[42%]">{r.signal}</span>
              <span className="text-slate-300 text-[11px] shrink-0">→</span>
              <span className="text-[11px] text-slate-500 truncate flex-1">{r.evidence}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                  r.source === "external"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {r.source === "external" ? "External" : "First-party"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
