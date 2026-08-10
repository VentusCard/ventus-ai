import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  CUSTOMER_DIRECTORY,
  SIGNAL_FAMILY_META,
  type DirectoryCustomer,
} from "@/lib/customerDirectoryData";

function totalSignals(c: DirectoryCustomer) {
  return SIGNAL_FAMILY_META.reduce((n, m) => n + c[m.field].length, 0);
}

export function CustomerPortfolioStats() {
  const stats = useMemo(() => {
    const book = CUSTOMER_DIRECTORY;
    const withLifeEvent = book.filter((c) => c.lifeEvents.length > 0).length;
    const withFinancial = book.filter((c) => c.financialSignals.length > 0).length;
    const withRisk = book.filter((c) => c.riskFlags.length > 0).length;
    const signals = book.reduce((n, c) => n + totalSignals(c), 0);
    const byFamily = SIGNAL_FAMILY_META.map((m) => ({
      ...m,
      count: book.reduce((n, c) => n + c[m.field].length, 0),
    }));
    return { count: book.length, withLifeEvent, withFinancial, withRisk, signals, byFamily };
  }, []);

  // Enterprise-scale book (national retail + preferred footprint).
  // The 15 records below are a sampled slice of this population.
  const SCALE = 68_200_000 / Math.max(stats.count, 1);
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return `${Math.round(n)}`;
  };
  const scaled = (n: number) => fmt(n * SCALE);

  const tiles = [
    { label: "Customers in book", value: "68.2M", note: "Enriched and signal-ready" },
    { label: "Active life events", value: scaled(stats.withLifeEvent), note: "Time-sensitive conversations" },
    { label: "Financial obligations", value: scaled(stats.withFinancial), note: "Loans, leases, investments" },
    { label: "Carrying risk signals", value: scaled(stats.withRisk), note: "Monitor before outreach" },
    { label: "Signals detected", value: scaled(stats.signals), note: "Across five families" },
  ];

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
            Signal distribution across the book
          </span>
          <span className="text-[10px] text-slate-400">{scaled(stats.signals)} total</span>
        </div>
        <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100">
          {stats.byFamily.map((f) => (
            <div
              key={f.key}
              className={cn(f.dot)}
              style={{ width: `${(f.count / Math.max(stats.signals, 1)) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {stats.byFamily.map((f) => (
            <span key={f.key} className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className={cn("w-1.5 h-1.5 rounded-full", f.dot)} />
              {f.label}
              <span className="text-slate-800 font-semibold tabular-nums">{scaled(f.count)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
