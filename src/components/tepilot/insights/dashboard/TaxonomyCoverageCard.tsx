import { getTaxonomyCoverage } from "@/lib/intelligenceSignalStats";

export function TaxonomyCoverageCard() {
  const t = getTaxonomyCoverage();
  const stats = [
    { label: "Lifestyle pillars", value: `${t.pillars}` },
    { label: "Semantic tiers", value: `${t.tiers}-tier` },
    { label: "Merchant resolution", value: `${t.merchantResolutionPct.toFixed(1)} %` },
    { label: "Unclassified", value: `${t.unclassifiedPct.toFixed(1)} %` },
    { label: "Labels in vocabulary", value: t.labelsInVocabulary.toLocaleString() },
    { label: "New labels (30d)", value: `+${t.newLabels30d}` },
  ];

  return (
    <div className="rounded-md border border-slate-200 bg-white h-full flex flex-col">
      <div className="px-4 pt-3 pb-2">
        <div className="text-[12px] font-medium text-slate-700">Taxonomy coverage</div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          What the enrichment engine resolves on every transaction — not MCC codes
        </div>
      </div>
      <div className="px-4 pb-4 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[16px] font-semibold text-slate-900 tabular-nums leading-tight">{s.value}</div>
            <div className="text-[10px] text-slate-500 leading-snug">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
