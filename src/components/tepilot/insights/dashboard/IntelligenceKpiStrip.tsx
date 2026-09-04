import { PulseDot } from "@/components/tepilot/common/PulseDot";
import { getSignalCoverage, fmtCount } from "@/lib/intelligenceSignalStats";

type Tile = {
  label: string;
  dot: string;
  value: React.ReactNode;
  foot: React.ReactNode;
};

export function IntelligenceKpiStrip() {
  // Every figure here comes from the canonical book scale so the strip agrees
  // with the coverage strip and External Intelligence card further down.
  const c = getSignalCoverage();
  // Activations are the slice of the 24h signal flow that reached a destination.
  const activations24h = Math.round(c.signals24h * 0.0129);

  const tiles: Tile[] = [
    {
      label: "Customers profile enriched",
      dot: "#2563EB",
      value: fmtCount(c.profilesEnriched),
      foot: (
        <span className="text-emerald-600">
          ▲ 1.2% <span className="text-slate-400">vs last week</span>
        </span>
      ),
    },
    {
      label: "Enrichment coverage",
      dot: "#1E9E6A",
      value: (
        <>
          {c.coveragePct.toFixed(1)}
          <span className="text-[11px] font-medium text-slate-400">&nbsp;%</span>
        </>
      ),
      foot: <span className="text-slate-400">Rail-agnostic enrichment</span>,
    },
    {
      label: "External signals ingested (24h)",
      dot: "#1E9E6A",
      value: fmtCount(c.externalSignals24h),
      foot: (
        <span className="text-emerald-600">
          ▲ 2.1% <span className="text-slate-400">today</span>
        </span>
      ),
    },
    {
      label: "Activations routed (24h)",
      dot: "#6D4AD4",
      value: fmtCount(activations24h),
      foot: (
        <span className="text-emerald-600">
          ▲ 8.4% <span className="text-slate-400">vs avg</span>
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white sm:divide-x lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="min-w-0 px-3.5 py-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <PulseDot color={t.dot} sizeClass="h-1.5 w-1.5" />
            <span className="truncate">{t.label}</span>
          </div>
          <div className="mt-1 text-[18px] font-semibold leading-none tracking-tight tabular-nums text-slate-900">
            {t.value}
          </div>
          <div className="mt-1 font-mono text-[10.5px] leading-none">{t.foot}</div>
        </div>
      ))}
    </div>
  );
}
