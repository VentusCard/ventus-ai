import { useEffect, useMemo, useState } from "react";
import { Users, Gem, CalendarHeart, ShieldAlert, Search, Radar, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmtCount, scaleSample, shareOf } from "@/lib/bookScale";
import { getSignalFamilyStats, type SignalSegmentSeed } from "@/lib/intelligenceSignalStats";
import { synthesizeSegmentSample } from "@/lib/segmentSampleSynthesis";


function parseValueK(value: string) {
  const m = value.match(/([\d.]+)\s*(k|M)/i);
  if (!m) return 0;
  return parseFloat(m[1]) * (m[2].toLowerCase() === "m" ? 1000 : 1);
}

import { TabHeader } from "../TabHeader";
import { CustomerPortfolioStats } from "./CustomerPortfolioStats";
import { CustomerSearchBar } from "./CustomerSearchBar";
import {
  CustomerResultsTable,
  sortCustomers,
  totalSignals,
  type SortKey,
} from "./CustomerResultsTable";
import { CustomerDetailPanel } from "./CustomerDetailPanel";
import {
  CUSTOMER_DIRECTORY,
  SIGNAL_FAMILY_META,
  type DirectoryCustomer,
  type SignalFamily,
} from "@/lib/customerDirectoryData";

type QuickStart = "value" | "life-event" | "risk";

const STOP_WORDS = new Set([
  "with", "this", "that", "their", "from", "soon", "here", "away", "under",
  "over", "into", "have", "held", "keep", "very", "than", "then", "they",
  "underway", "sight", "play", "rising",
]);

function haystack(c: DirectoryCustomer) {
  return [
    c.name,
    c.email,
    c.city,
    c.segment,
    c.tier,
    ...c.products,
    ...SIGNAL_FAMILY_META.flatMap((m) => c[m.field].map((s) => `${s.label} ${s.evidence}`)),
  ]
    .join(" ")
    .toLowerCase();
}

export type CustomerSegmentSeed = SignalSegmentSeed;

interface CustomersDirectoryViewProps {
  segment?: CustomerSegmentSeed | null;
  onClearSegment?: () => void;
}

export function CustomersDirectoryView({ segment, onClearSegment }: CustomersDirectoryViewProps = {}) {
  const [query, setQuery] = useState("");
  const [families, setFamilies] = useState<Set<SignalFamily>>(new Set());
  const [tiers, setTiers] = useState<Set<string>>(new Set());
  const [quickStart, setQuickStart] = useState<QuickStart | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!segment) return;
    setQuickStart(null);
    setSelectedId(null);
    setTiers(new Set());
    setQuery("");
    setFamilies(new Set([segment.family]));
  }, [segment]);

  const hasFilters =
    query.trim().length > 0 || families.size > 0 || tiers.size > 0 || !!quickStart || !!segment;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = CUSTOMER_DIRECTORY.filter((c) => {
      if (q && !haystack(c).includes(q)) return false;
      if (tiers.size > 0 && !tiers.has(c.tier)) return false;
      for (const f of families) {
        const meta = SIGNAL_FAMILY_META.find((m) => m.key === f)!;
        if (c[meta.field].length === 0) return false;
      }
      return true;
    });

    // Signal-level segment: narrow to customers whose signals in that family
    // share meaningful words with the exported signal. Falls back to the whole
    // family when nothing matches, so the segment is never empty.
    if (segment && segment.scope !== "family") {
      const meta = SIGNAL_FAMILY_META.find((m) => m.key === segment.family);
      const words = segment.label
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
      if (meta && words.length > 0) {
        const narrowed = list.filter((c) =>
          c[meta.field].some((s) => {
            const text = `${s.label} ${s.evidence}`.toLowerCase();
            return words.some((w) => text.includes(w));
          }),
        );
        if (narrowed.length > 0) list = narrowed;
      }
    }

    if (quickStart === "life-event") list = list.filter((c) => c.lifeEvents.length > 0);
    if (quickStart === "risk") list = list.filter((c) => c.riskFlags.length > 0);
    return sortCustomers(list, quickStart === "value" ? "value" : sortKey, quickStart === "value" ? "desc" : sortDir);
  }, [query, families, tiers, quickStart, sortKey, sortDir, segment]);

  // Illustrative profiles standing in for the full book-level cohort behind an
  // exported segment. Deterministic per segment; excluded from metrics/exports.
  const synthetic = useMemo(
    () => (segment ? synthesizeSegmentSample(segment, 24) : []),
    [segment],
  );

  const displayed = useMemo(() => {
    if (!segment) return filtered;
    const q = query.trim().toLowerCase();
    const extras = synthetic.filter((c) => {
      if (q && !haystack(c).includes(q)) return false;
      if (tiers.size > 0 && !tiers.has(c.tier)) return false;
      return true;
    });
    return sortCustomers([...filtered, ...extras], sortKey, sortDir);
  }, [segment, filtered, synthetic, query, tiers, sortKey, sortDir]);

  const pool = useMemo(() => [...CUSTOMER_DIRECTORY, ...synthetic], [synthetic]);
  const selected = selectedId ? pool.find((c) => c.id === selectedId) ?? null : null;
  const recentlyViewed = recentIds
    .map((id) => CUSTOMER_DIRECTORY.find((c) => c.id === id))
    .filter(Boolean) as DirectoryCustomer[];

  // Book-scale population for the current selection. A signal segment reports
  // the real cohort behind the signal; ad-hoc filters scale the sampled slice.
  const population = useMemo(() => {
    if (segment) {
      if (segment.customers > 0) return segment.customers;
      const fam = getSignalFamilyStats().find((f) => f.key === segment.family);
      if (fam) {
        const key = segment.label.toLowerCase();
        const match =
          fam.topSignals.find((s) => s.label.toLowerCase() === key) ??
          fam.topSignals.find(
            (s) => key.includes(s.label.toLowerCase()) || s.label.toLowerCase().includes(key),
          );
        return match?.customers ?? fam.customers;
      }
    }
    return scaleSample(filtered.length, CUSTOMER_DIRECTORY.length);
  }, [segment, filtered.length]);

  const metrics = useMemo(() => {
    const sampleCustomers = Math.max(filtered.length, 1);
    const sampleSignals = filtered.reduce((n, c) => n + totalSignals(c), 0);
    const sampleValueK = filtered.reduce((n, c) => n + parseValueK(c.relationshipValue), 0);
    const factor = population / sampleCustomers;
    const valueK = sampleValueK * factor;
    return {
      customers: population,
      customersLabel: fmtCount(population),
      signals: Math.round(sampleSignals * factor),
      signalsLabel: fmtCount(sampleSignals * factor),
      sharePct: shareOf(population) * 100,
      valueLabel:
        valueK >= 1_000_000
          ? `$${(valueK / 1_000_000).toFixed(1)}B`
          : valueK >= 1000
            ? `$${(valueK / 1000).toFixed(1)}M`
            : `$${Math.round(valueK)}K`,
      sampleSize: filtered.length,
    };
  }, [filtered, population]);


  const segmentFamilyMeta = segment
    ? SIGNAL_FAMILY_META.find((m) => m.key === segment.family) ?? null
    : null;
  const segmentFamilyLabel = segmentFamilyMeta?.label ?? "signal";

  const segmentSlug = (segment?.label ?? "customer-segment")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  const handleExportCsv = () => {
    if (filtered.length === 0) return;
    const header = [
      "Name", "Email", "City", "Segment", "Tier", "Relationship Value",
      "Products", "Life Events", "Financial Signals", "Spending Habits",
      "Demographic Signals", "Risk Flags", "Total Signals",
    ];
    const rows = filtered.map((c) => [
      c.name, c.email, c.city, c.segment, c.tier, c.relationshipValue,
      c.products.join("; "),
      c.lifeEvents.length, c.financialSignals.length, c.spendingHabits.length,
      c.demographicSignals.length, c.riskFlags.length, totalSignals(c),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${segmentSlug}-${filtered.length}-customers.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      `Exported ${filtered.length} customers to CSV` +
        (segment ? " — real profiles only; sample rows are illustrative" : ""),
    );
  };

  const handleCopyJson = () => {
    if (filtered.length === 0) return;
    navigator.clipboard.writeText(
      JSON.stringify(
        filtered.map((c) => ({
          id: c.id, name: c.name, email: c.email, city: c.city, segment: c.segment,
          tier: c.tier, relationshipValue: c.relationshipValue, products: c.products,
          totalSignals: totalSignals(c),
        })),
        null,
        2,
      ),
    );
    toast.success(
      `Copied ${filtered.length} customer records as JSON` +
        (segment ? " — real profiles only; sample rows are illustrative" : ""),
    );
  };

  const handleCopyList = () => {
    if (filtered.length === 0) return;
    navigator.clipboard.writeText(filtered.map((c) => `${c.name} <${c.email}>`).join("\n"));
    toast.success(`Copied ${filtered.length} customers to clipboard`);
  };

  const openCustomer = (id: string) => {
    setSelectedId(id);
    setRecentIds((prev) => [id, ...prev.filter((p) => p !== id)].slice(0, 5));
  };


  const handleSort = (key: SortKey) => {
    setQuickStart(null);
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const clearAll = () => {
    onClearSegment?.();
    setQuery("");
    setFamilies(new Set());
    setTiers(new Set());
    setQuickStart(null);
  };

  const toggleFamily = (f: SignalFamily) => {
    setQuickStart(null);
    setFamilies((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  const toggleTier = (t: string) => {
    setTiers((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const quickStartCards = [
    {
      key: "value" as QuickStart,
      icon: Gem,
      title: "Highest-value relationships",
      note: "Start where the book concentrates",
    },
    {
      key: "life-event" as QuickStart,
      icon: CalendarHeart,
      title: "Customers with a new life event",
      note: "Time-sensitive conversations",
    },
    {
      key: "risk" as QuickStart,
      icon: ShieldAlert,
      title: "Customers carrying risk signals",
      note: "Review before outreach",
    },
  ];

  return (
    <div className="space-y-3">
      <TabHeader
        icon={<Users className="w-4 h-4" />}
        title="Customer Segments"
        subtitle="Search your book and open any customer's five signal families"
        howItWorks="Every profile is assembled from enriched transaction behavior. Signals are assigned once, following the priority ladder: Life Event, then Financial, then Spending Habit, then Demographic, then Risk."
        whyItMatters="Bankers stop guessing. One search returns behavioral context, the financial obligations already in play, and the next best conversation to have."
      />

      {segment && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2.5">
          <div className="flex items-start gap-2.5">
            <Radar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12.5px] font-semibold text-slate-900 truncate">
                  {segment.scope === "family"
                    ? `Segment: all ${segmentFamilyLabel} customers`
                    : `Segment exported from signal: ${segment.label}`}
                </span>
                {segmentFamilyMeta && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10.5px] font-medium ${segmentFamilyMeta.chip}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${segmentFamilyMeta.dot}`} />
                    {segmentFamilyMeta.label}
                  </span>
                )}
                <span
                  className={`text-[10.5px] font-medium tabular-nums ${segment.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {segment.delta >= 0 ? "+" : ""}
                  {segment.delta.toFixed(1)}% · 24h
                </span>
              </div>

              {segment.evidence && (
                <div className="text-[11px] text-slate-600 mt-1 truncate">{segment.evidence}</div>
              )}

              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-[11px] text-slate-700">
                  <span className="font-semibold tabular-nums">{fmtCount(population)}</span> customers in the book
                </span>
                <span className="text-[11px] text-slate-500">
                  {displayed.length} representative profiles shown to illustrate the cohort
                </span>
              </div>

              {/* Scale bar: the visible sliver vs the full cohort conveys magnitude. */}
              <div className="flex items-center gap-2 mt-1.5">
                <div className="h-1 flex-1 max-w-[200px] rounded-full overflow-hidden bg-white">
                  <div
                    className={segmentFamilyMeta?.barStrong ?? "bg-blue-600"}
                    style={{
                      width: `${Math.max(1.5, Math.min(100, (displayed.length / Math.max(population, 1)) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[10.5px] text-slate-500 tabular-nums">
                  {displayed.length} shown of {fmtCount(population)} · every profile represents ~
                  {fmtCount(Math.round(population / Math.max(displayed.length, 1)))} customers
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 flex-1 max-w-[220px] rounded-full overflow-hidden bg-white flex">
                  <div className={segmentFamilyMeta?.barStrong ?? "bg-blue-600"} style={{ width: `${segment.confidence.strong}%` }} />
                  <div className={segmentFamilyMeta?.barLikely ?? "bg-blue-400"} style={{ width: `${segment.confidence.likely}%` }} />
                  <div className={segmentFamilyMeta?.barEmerging ?? "bg-blue-200"} style={{ width: `${segment.confidence.emerging}%` }} />
                </div>
                <span className="text-[10.5px] text-slate-500 tabular-nums">
                  {segment.confidence.strong}% strong · {segment.confidence.likely}% likely ·{" "}
                  {segment.confidence.emerging}% emerging
                </span>
              </div>
            </div>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 border border-slate-200 bg-white rounded-md px-2 py-1 transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
              Clear segment
            </button>
          </div>
        </div>
      )}


      <CustomerPortfolioStats />

      <CustomerSearchBar
        query={query}
        onQueryChange={(v) => {
          setQuery(v);
          setQuickStart(null);
        }}
        suggestions={filtered}
        onSelect={openCustomer}
        families={families}
        onToggleFamily={toggleFamily}
        tiers={tiers}
        onToggleTier={toggleTier}
        recentlyViewed={recentlyViewed}
        hasFilters={hasFilters}
        onClear={clearAll}
        metrics={hasFilters ? metrics : null}
        canExport={filtered.length > 0}
        onExportCsv={handleExportCsv}
        onCopyJson={handleCopyJson}
        onCopyList={handleCopyList}
      />

      {!hasFilters && !selected ? (
        <div className="border border-slate-200 rounded-lg bg-white p-8 text-center">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-400 mb-2.5">
            <Search className="w-4 h-4" />
          </div>
          <h3 className="text-[14px] font-semibold text-slate-900">Start with a search</h3>
          <p className="text-[11.5px] text-slate-500 mt-1">
            Look up any customer by name, city, segment, product, or a signal we detected — or pick a
            starting point below.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4 max-w-3xl mx-auto text-left">
            {quickStartCards.map((c) => (
              <button
                key={c.key}
                onClick={() => setQuickStart(c.key)}
                className="border border-slate-200 rounded-lg px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
              >
                <c.icon className="w-4 h-4 text-slate-400 mb-1.5" />
                <div className="text-[12px] font-semibold text-slate-900 leading-tight">{c.title}</div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">{c.note}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-3",
            selected && "xl:grid-cols-[minmax(0,1fr)_420px]",
          )}
        >
          <div className="space-y-2 min-w-0">

            {hasFilters && displayed.length > 0 && (
              <div className="text-[10px] text-slate-400 mb-1.5">
                {segment ? (
                  <>
                    Showing {displayed.length} representative profiles — the full cohort is{" "}
                    <span className="font-semibold text-slate-600">{fmtCount(population)} customers</span>{" "}
                    (1 profile ≈ {fmtCount(Math.round(population / Math.max(displayed.length, 1)))} customers).
                  </>
                ) : (
                  <>
                    Showing a representative sample of {filtered.length} profiles from{" "}
                    {fmtCount(population)} matching customers.
                  </>
                )}
              </div>
            )}
            <CustomerResultsTable
              customers={displayed}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              onSelect={openCustomer}
              selectedId={selectedId}
            />

          </div>
          {selected && (
            <CustomerDetailPanel customer={selected} onBack={() => setSelectedId(null)} />
          )}
        </div>
      )}
    </div>
  );
}
