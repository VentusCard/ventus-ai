import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { BOOK_CUSTOMERS, fmtCount } from "@/lib/bookScale";
import { getSignalCoverage, getSignalFamilyStats } from "@/lib/intelligenceSignalStats";
import { PulseDot } from "@/components/tepilot/common/PulseDot";

export function CustomerPortfolioStats() {
  const { coverage, families, totalSignals } = useMemo(() => {
    const coverage = getSignalCoverage();
    const families = getSignalFamilyStats();
    // A customer can carry several signals inside a family; family headcount
    // times the family's average depth gives the signal volume.
    const totalSignals = Math.round(
      coverage.profilesEnriched * coverage.avgSignalsPerCustomer,
    );
    return { coverage, families, totalSignals };
  }, []);

  const familyCount = (key: string) => families.find((f) => f.key === key)?.customers ?? 0;

  const tiles = [
    { label: "Customers in book", value: fmtCount(BOOK_CUSTOMERS), note: "Enriched and signal-ready" },
    { label: "Active life events", value: fmtCount(familyCount("life_event")), note: "Time-sensitive conversations" },
    { label: "Financial obligations", value: fmtCount(familyCount("financial")), note: "Loans, leases, investments" },
    { label: "Carrying risk signals", value: fmtCount(familyCount("risk")), note: "Monitor before outreach" },
    { label: "Signals detected", value: fmtCount(totalSignals), note: "Across five families" },
  ];

  const familyTotal = families.reduce((n, f) => n + f.customers, 0);

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className="border border-slate-200 rounded-lg bg-white px-3 py-2.5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              {t.label}
            </div>
            <div className="text-[22px] font-bold text-slate-900 leading-tight mt-0.5 tabular-nums">
              {t.value}
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">{t.note}</div>
          </div>
        ))}
      </div>

      <div className="border border-slate-200 rounded-lg bg-white px-3 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Customers covered by each signal family
          </span>
          <span className="text-[10px] text-slate-400">
            {fmtCount(coverage.profilesEnriched)} profiles enriched
          </span>
        </div>
        <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100">
          {families.map((f) => (
            <div
              key={f.key}
              className={cn(f.dot)}
              style={{ width: `${(f.customers / Math.max(familyTotal, 1)) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {families.map((f, i) => (
            <span key={f.key} className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
              <PulseDot colorClass={f.dot} sizeClass="w-1.5 h-1.5" delayMs={i * 260} />
              {f.label}
              <span className="text-slate-800 font-semibold tabular-nums">
                {fmtCount(f.customers)}
              </span>
              <span className="text-slate-400 tabular-nums">
                {((f.customers / BOOK_CUSTOMERS) * 100).toFixed(1)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
