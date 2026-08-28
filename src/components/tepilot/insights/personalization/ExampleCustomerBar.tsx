import { useMemo, useState } from "react";
import { Search, X, ArrowRight, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchExampleCustomers } from "@/lib/personalizationExamples";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Live /demo session customer name, if a session has been run. */
  sessionName?: string | null;
  /** Renders inline (no border band / padding) so it can sit inside a card header row. */
  compact?: boolean;
}

export function ExampleCustomerBar({ selectedId, onSelect, sessionName, compact = false }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => searchExampleCustomers(query), [query]);
  const showSuggestions = open && query.trim().length > 0 && matches.length > 0;

  const pick = (id: string) => {
    onSelect(id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div
      className={cn(
        compact
          ? "flex flex-col gap-2"
          : "flex flex-col lg:flex-row lg:items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white",
      )}
    >
      <div className={cn("relative w-full", compact ? "" : "lg:max-w-sm")}>


        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches[0]) pick(matches[0].id);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={compact ? "Search customers by name, city, product, or signal" : "Search example customers by name, city, product, or signal"}
          className={cn(
            "w-full pl-9 pr-8 text-[13px] border border-slate-200 rounded-lg bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 focus:bg-white transition",
            compact ? "py-2" : "py-2",
          )}

        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {showSuggestions && (
          <div className="absolute z-30 left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg overflow-hidden">
            {matches.slice(0, 5).map((c) => (
              <button
                key={c.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c.id)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-slate-900 truncate">{c.name}</div>
                  <div className="text-[11px] text-slate-500 truncate tabular-nums">
                    Customer ID: {c.customerId}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {sessionName && (
          <button
            onClick={() => pick("session")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
              selectedId === "session"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50",
            )}
          >
            <Radio className="w-3 h-3" />
            Session · {sessionName.split(" ")[0]}
          </button>
        )}
      </div>
    </div>
  );
}
