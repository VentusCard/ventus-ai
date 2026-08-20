import { useEffect, useMemo, useState } from "react";
import { Users, Gem, CalendarHeart, ShieldAlert, Search, Radar, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

export interface CustomerSegmentSeed {
  family: SignalFamily;
  label: string;
}

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
    setQuery(segment.label);
    setFamilies(new Set([segment.family]));
  }, [segment]);

  const hasFilters = query.trim().length > 0 || families.size > 0 || tiers.size > 0 || !!quickStart;

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
    if (quickStart === "life-event") list = list.filter((c) => c.lifeEvents.length > 0);
    if (quickStart === "risk") list = list.filter((c) => c.riskFlags.length > 0);
    return sortCustomers(list, quickStart === "value" ? "value" : sortKey, quickStart === "value" ? "desc" : sortDir);
  }, [query, families, tiers, quickStart, sortKey, sortDir]);

  const selected = selectedId ? CUSTOMER_DIRECTORY.find((c) => c.id === selectedId) ?? null : null;
  const recentlyViewed = recentIds
    .map((id) => CUSTOMER_DIRECTORY.find((c) => c.id === id))
    .filter(Boolean) as DirectoryCustomer[];

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
        title="Customers"
        subtitle="Search your book and open any customer's five signal families"
        howItWorks="Every profile is assembled from enriched transaction behavior. Signals are assigned once, following the priority ladder: Life Event, then Financial, then Spending Habit, then Demographic, then Risk."
        whyItMatters="Bankers stop guessing. One search returns behavioral context, the financial obligations already in play, and the next best conversation to have."
      />

      {segment && (
        <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2">
          <Radar className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-slate-900 truncate">
              Segment exported from signal: {segment.label}
            </div>
            <div className="text-[11px] text-slate-600">
              Filtered to customers carrying this signal family · {filtered.length}{" "}
              {filtered.length === 1 ? "match" : "matches"} in the sample book
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
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {filtered.length} {filtered.length === 1 ? "customer" : "customers"} ·{" "}
                {filtered.reduce((n, c) => n + totalSignals(c), 0)} signals
              </span>
              <button
                onClick={clearAll}
                className="text-[10px] font-medium text-slate-400 hover:text-slate-700 underline underline-offset-2"
              >
                Clear all
              </button>
            </div>
            <CustomerResultsTable
              customers={filtered}
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
