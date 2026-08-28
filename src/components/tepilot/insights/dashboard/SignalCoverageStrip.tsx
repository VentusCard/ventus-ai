import { getSignalCoverage, fmtCount } from "@/lib/intelligenceSignalStats";

export function SignalCoverageStrip() {
  const c = getSignalCoverage();

  const tiles = [
    { label: "Customer profiles enriched", value: fmtCount(c.profilesEnriched), hint: `${c.coveragePct.toFixed(1)}% of ${fmtCount(c.totalCustomers)} customers` },
    { label: "Signals detected (24h)", value: fmtCount(c.signals24h), hint: "Across all five families" },
    { label: "Avg signals per customer", value: c.avgSignalsPerCustomer.toFixed(1), hint: "Behavioral, life event, financial, demographic, risk" },
    { label: "Life-event signals active", value: fmtCount(c.lifeEventsActive), hint: "In an open detection window" },
    { label: "External signals ingested (24h)", value: fmtCount(c.externalSignals24h), hint: "Bureau, property, auto, demographics" },
    { label: "Signal confidence: Strong", value: `${c.strongPct.toFixed(1)} %`, hint: "Remainder likely or emerging" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <div className="text-[11px] font-medium text-slate-700 leading-tight">{t.label}</div>
          <div className="text-[20px] font-semibold text-slate-900 leading-tight mt-1 tabular-nums">
            {t.value}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{t.hint}</div>
        </div>
      ))}
    </div>
  );
}

/** Compact one-line variant used as a caption under the signal-families header. */
export function SignalCoverageCaption() {
  const c = getSignalCoverage();
  const bits = [
    `${fmtCount(c.profilesEnriched)} profiles enriched (${c.coveragePct.toFixed(1)}%)`,
    `${fmtCount(c.signals24h)} signals in 24h`,
    `${c.avgSignalsPerCustomer.toFixed(1)} avg per customer`,
    `${fmtCount(c.lifeEventsActive)} life events active`,
    `${c.strongPct.toFixed(1)}% strong confidence`,
  ];
  return (
    <div className="text-[11px] text-slate-500 tabular-nums">
      {bits.join(" · ")}
    </div>
  );
}
