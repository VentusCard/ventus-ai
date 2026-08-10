import { useMemo, useState } from "react";
import { Search, Users, X } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { cn } from "@/lib/utils";
import {
  CUSTOMER_DIRECTORY,
  SIGNAL_FAMILY_META,
  type DirectoryCustomer,
  type DirectorySignal,
  type SignalFamily,
} from "@/lib/customerDirectoryData";

const CONFIDENCE_STYLE: Record<DirectorySignal["confidence"], string> = {
  Emerging: "bg-slate-100 text-slate-500",
  Likely: "bg-slate-100 text-slate-600",
  Strong: "bg-slate-900/5 text-slate-700",
};

function signalCount(c: DirectoryCustomer, family: SignalFamily) {
  const meta = SIGNAL_FAMILY_META.find((m) => m.key === family)!;
  return c[meta.field].length;
}

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

export function CustomersDirectoryView() {
  const [query, setQuery] = useState("");
  const [families, setFamilies] = useState<Set<SignalFamily>>(new Set());
  const [selectedId, setSelectedId] = useState<string>(CUSTOMER_DIRECTORY[0].id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CUSTOMER_DIRECTORY.filter((c) => {
      if (q && !haystack(c).includes(q)) return false;
      for (const f of families) {
        if (signalCount(c, f) === 0) return false;
      }
      return true;
    });
  }, [query, families]);

  const selected =
    filtered.find((c) => c.id === selectedId) || filtered[0] || CUSTOMER_DIRECTORY[0];

  const toggleFamily = (f: SignalFamily) => {
    setFamilies((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  return (
    <div>
      <TabHeader
        icon={<Users className="w-4 h-4" />}
        title="Customers"
        subtitle="Search any customer and see the five signal families Ventus AI picked up"
        howItWorks="Every customer profile is assembled from enriched transaction behavior. Signals are assigned once, following the priority ladder: Life Event, then Financial, then Spending Habit, then Demographic, then Risk."
        whyItMatters="Bankers stop guessing. One search returns the behavioral context, the financial obligations already in play, and the next best conversation to have."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* Directory */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, city, segment or signal"
                className="w-full pl-8 pr-8 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {SIGNAL_FAMILY_META.map((m) => {
                const active = families.has(m.key);
                return (
                  <button
                    key={m.key}
                    onClick={() => toggleFamily(m.key)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                      active
                        ? m.chip
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", active ? m.dot : "bg-slate-300")} />
                    {m.label}
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              {filtered.length} of {CUSTOMER_DIRECTORY.length} customers
            </div>
          </div>

          <div className="overflow-y-auto max-h-[640px] divide-y divide-slate-100">
            {filtered.map((c) => {
              const isActive = c.id === selected.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 transition-colors",
                    isActive ? "bg-blue-50/70" : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-slate-900 truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-500 border border-slate-200 rounded-full px-1.5 py-px shrink-0">
                      {c.tier}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {c.segment} · {c.city}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {SIGNAL_FAMILY_META.map((m) => {
                      const n = c[m.field].length;
                      if (!n) return null;
                      return (
                        <span
                          key={m.key}
                          className={cn("rounded border px-1 py-px text-[9px] font-semibold", m.chip)}
                        >
                          {m.short} {n}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">No customers match that search.</div>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-slate-900">{selected.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {selected.email} · {selected.city}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                {[
                  ["Tier", selected.tier],
                  ["Age", selected.ageBand],
                  ["Tenure", selected.tenure],
                  ["Relationship", selected.relationshipValue],
                  ["Last activity", selected.lastActivity],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
                    <div className="text-slate-800 font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2.5">
              {selected.products.map((p) => (
                <span
                  key={p}
                  className="text-[10px] text-slate-600 bg-white border border-slate-200 rounded-full px-2 py-0.5"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {SIGNAL_FAMILY_META.map((m) => {
              const signals = selected[m.field];
              return (
                <div key={m.key}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {m.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{signals.length}</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  {signals.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No signals detected</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {signals.map((s) => (
                        <div
                          key={s.label}
                          className={cn("border rounded-md px-2.5 py-2", m.chip)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12px] font-semibold leading-tight">{s.label}</span>
                            <span
                              className={cn(
                                "text-[9px] font-medium rounded px-1.5 py-px shrink-0",
                                CONFIDENCE_STYLE[s.confidence]
                              )}
                            >
                              {s.confidence}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug mt-1">{s.evidence}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="border border-slate-200 rounded-md bg-slate-50/70 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Suggested next actions
              </div>
              <ul className="space-y-1">
                {selected.nextActions.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-[12px] text-slate-700">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
