import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SIGNAL_FAMILY_META, type DirectoryCustomer } from "@/lib/customerDirectoryData";

export type SortKey = "name" | "tier" | "value" | "signals";

const TIER_RANK: Record<string, number> = { Mass: 0, Preferred: 1, Premier: 2, Private: 3 };

export function totalSignals(c: DirectoryCustomer) {
  return SIGNAL_FAMILY_META.reduce((n, m) => n + c[m.field].length, 0);
}

function valueScore(c: DirectoryCustomer) {
  const m = c.relationshipValue.match(/([\d.]+)(k|M)/i);
  if (!m) return 0;
  return parseFloat(m[1]) * (m[2].toLowerCase() === "m" ? 1000 : 1);
}

export function sortCustomers(list: DirectoryCustomer[], key: SortKey, dir: "asc" | "desc") {
  const factor = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    switch (key) {
      case "name":
        return a.name.localeCompare(b.name) * factor;
      case "tier":
        return (TIER_RANK[a.tier] - TIER_RANK[b.tier]) * factor;
      case "value":
        return (valueScore(a) - valueScore(b)) * factor;
      case "signals":
        return (totalSignals(a) - totalSignals(b)) * factor;
    }
  });
}

interface Props {
  customers: DirectoryCustomer[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onSelect: (id: string) => void;
  selectedId?: string | null;
}

const COLUMNS: { key: SortKey | null; label: string; className?: string }[] = [
  { key: "name", label: "Customer" },
  { key: null, label: "Segment" },
  { key: null, label: "City" },
  { key: "tier", label: "Tier" },
  { key: "value", label: "Relationship value" },
  { key: "signals", label: "Signals" },
  { key: null, label: "Last activity" },
];

export function CustomerResultsTable({ customers, sortKey, sortDir, onSort, onSelect, selectedId }: Props) {
  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className="px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                >
                  {col.key ? (
                    <button
                      onClick={() => onSort(col.key as SortKey)}
                      className="inline-flex items-center gap-1 hover:text-slate-700"
                    >
                      {col.label}
                      {sortKey === col.key &&
                        (sortDir === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors",
                  selectedId === c.id ? "bg-blue-50" : "hover:bg-blue-50/40",
                )}
              >
                <td
                  className={cn(
                    "px-3 py-2.5 border-l-2",
                    selectedId === c.id ? "border-blue-500" : "border-transparent",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-semibold text-slate-900">{c.name}</span>
                    {c.synthetic && (
                      <span className="rounded border border-slate-200 bg-slate-50 px-1 py-px text-[8.5px] font-medium uppercase tracking-wide text-slate-400">
                        illustrative
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{c.email}</div>
                </td>
                <td className="px-3 py-2.5 text-[11.5px] text-slate-600 whitespace-nowrap">{c.segment}</td>
                <td className="px-3 py-2.5 text-[11.5px] text-slate-600 whitespace-nowrap">{c.city}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-[10px] text-slate-600 border border-slate-200 rounded-full px-2 py-0.5">
                    {c.tier}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[11.5px] text-slate-800 font-medium tabular-nums whitespace-nowrap">
                  {c.relationshipValue}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
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
                </td>
                <td className="px-3 py-2.5 text-[11px] text-slate-500 whitespace-nowrap">{c.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {customers.length === 0 && (
        <div className="p-8 text-center text-xs text-slate-400">No customers match those criteria.</div>
      )}
    </div>
  );
}
