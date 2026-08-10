import { Search, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SIGNAL_FAMILY_META,
  type DirectoryCustomer,
  type SignalFamily,
} from "@/lib/customerDirectoryData";

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  suggestions: DirectoryCustomer[];
  onSelect: (id: string) => void;
  families: Set<SignalFamily>;
  onToggleFamily: (f: SignalFamily) => void;
  tiers: Set<string>;
  onToggleTier: (t: string) => void;
  recentlyViewed: DirectoryCustomer[];
  hasFilters: boolean;
  onClear: () => void;
}

const TIERS = ["Mass", "Preferred", "Premier", "Private"];

export function CustomerSearchBar({
  query,
  onQueryChange,
  suggestions,
  onSelect,
  families,
  onToggleFamily,
  tiers,
  onToggleTier,
  recentlyViewed,
  hasFilters,
  onClear,
}: Props) {
  return (
    <div className="border border-slate-200 rounded-lg bg-white p-4">
      <div className="relative max-w-3xl mx-auto">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions[0]) onSelect(suggestions[0].id);
          }}
          placeholder="Search your book by name, city, segment, product, or signal"
          className="w-full pl-10 pr-9 py-2.5 text-[13px] border border-slate-200 rounded-lg bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 focus:bg-white transition"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {query.trim().length > 0 && suggestions.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg overflow-hidden">
            {suggestions.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-slate-900 truncate">{c.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {c.segment} · {c.city}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
        {SIGNAL_FAMILY_META.map((m) => {
          const active = families.has(m.key);
          return (
            <button
              key={m.key}
              onClick={() => onToggleFamily(m.key)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                active ? m.chip : "border-slate-200 text-slate-500 hover:bg-slate-50",
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", active ? m.dot : "bg-slate-300")} />
              {m.label}
            </button>
          );
        })}
        <span className="w-px h-4 bg-slate-200 mx-1" />
        {TIERS.map((t) => {
          const active = tiers.has(t);
          return (
            <button
              key={t}
              onClick={() => onToggleTier(t)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50",
              )}
            >
              {t}
            </button>
          );
        })}
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-[10px] font-medium text-slate-400 hover:text-slate-700 underline underline-offset-2 ml-1"
          >
            Clear all
          </button>
        )}
      </div>

      {recentlyViewed.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Recently viewed
          </span>
          {recentlyViewed.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] text-slate-600 hover:bg-slate-50"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
