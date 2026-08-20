import { EXTERNAL_SOURCES, getSignalCoverage, fmtCount } from "@/lib/intelligenceSignalStats";

export function ExternalIntelligenceCard() {
  const c = getSignalCoverage();
  return (
    <div className="rounded-md border border-slate-200 bg-white h-full flex flex-col">
      <div className="flex items-baseline justify-between px-4 pt-3 pb-2">
        <div>
          <div className="text-[12px] font-medium text-slate-700">External intelligence</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Layered on top of first-party transaction signals
          </div>
        </div>
        <div className="text-right">
          <div className="text-[16px] font-semibold text-slate-900 tabular-nums leading-tight">
            {fmtCount(c.externalSignals24h)}
          </div>
          <div className="text-[10px] text-slate-500">ingested (24h)</div>
        </div>
      </div>
      <div className="px-4 pb-4">
      <table className="w-full text-[12px]">

        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
            <th className="text-left font-medium py-1.5">Source</th>
            <th className="text-left font-medium py-1.5">Signals added</th>
            <th className="text-right font-medium py-1.5">Match</th>
          </tr>
        </thead>
        <tbody>
          {EXTERNAL_SOURCES.map((s) => (
            <tr key={s.name} className="border-b border-slate-50 last:border-0">
              <td className="py-1.5 text-slate-800">{s.name}</td>
              <td className="py-1.5 text-slate-500 truncate">{s.signalsAdded}</td>
              <td className="py-1.5 text-right tabular-nums text-slate-700">{s.matchRate.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
