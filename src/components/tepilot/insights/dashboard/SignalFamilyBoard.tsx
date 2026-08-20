import { ArrowUpRight } from "lucide-react";
import { getSignalFamilyStats, fmtCount } from "@/lib/intelligenceSignalStats";

interface SignalFamilyBoardProps {
  onOpenFamily?: (section: "customers" | "risk") => void;
}

export function SignalFamilyBoard({ onOpenFamily }: SignalFamilyBoardProps) {
  const families = getSignalFamilyStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      {families.map((f) => {
        const total = f.confidence.strong + f.confidence.likely + f.confidence.emerging;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onOpenFamily?.(f.key === "risk" ? "risk" : "customers")}
            className="group text-left rounded-md border border-slate-200 bg-white p-3 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${f.chip}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
                {f.label}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[20px] font-semibold text-slate-900 tabular-nums leading-none">
                {fmtCount(f.customers)}
              </span>
              <span className={`text-[11px] tabular-nums ${f.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {f.delta >= 0 ? "+" : ""}{f.delta.toFixed(1)}%
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">customers carrying this family · 24h</div>

            <div className="mt-2.5 space-y-1">
              {f.topSignals.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-700 truncate flex-1">{s.label}</span>
                  <span className="text-slate-500 tabular-nums shrink-0">{fmtCount(s.customers)}</span>
                </div>
              ))}
            </div>

            <div className="mt-2.5">
              <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100">
                <span className="bg-slate-800" style={{ width: `${(f.confidence.strong / total) * 100}%` }} />
                <span className="bg-slate-400" style={{ width: `${(f.confidence.likely / total) * 100}%` }} />
                <span className="bg-slate-200" style={{ width: `${(f.confidence.emerging / total) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>{f.confidence.strong}% strong</span>
                <span>{f.confidence.likely}% likely</span>
                <span>{f.confidence.emerging}% emerging</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
