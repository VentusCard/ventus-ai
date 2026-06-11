import { useMemo, useState } from "react";
import { PRODUCT_FLOWS, type ProductFlow } from "@/lib/productAutomatedFlows";
import { getProductMechanics } from "@/lib/productCatalogExtras";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
};

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProductPickerSection({ selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const selected = PRODUCT_FLOWS.find((p) => p.id === selectedId);
  const mechanics = selected ? getProductMechanics(selected.id, selected.category) : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCT_FLOWS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    ).slice(0, 12);
  }, [query]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
        <p className="text-sm font-semibold text-slate-900">Pick a product</p>
        <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">
          {PRODUCT_FLOWS.length} available
        </Badge>
      </div>

      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${PRODUCT_FLOWS.length} products — cards, deposits, lending, wealth, insurance…`}
          className="h-8 pl-8 text-xs bg-white border-slate-200"
        />
        {query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-md border border-slate-200 bg-white max-h-[280px] overflow-y-auto shadow-md">
            {results.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">No products match "{query}".</div>
            ) : (
              results.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onClick={() => {
                    onSelect(p.id);
                    setQuery("");
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>

      {selected && mechanics && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-900 shrink-0">
              <selected.icon className="w-3.5 h-3.5 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{selected.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{selected.category}</span>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] text-slate-500 font-mono">{fmt(selected.estimatedAudience)} eligible</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-snug mb-2">{selected.positioning}</p>

          <div className="rounded-md bg-white border border-slate-200 px-2.5 py-1.5 mb-2">
            <p className="text-xs font-medium text-slate-900 leading-snug">{mechanics.tagline}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{mechanics.fee}</p>
          </div>

          {mechanics.rateTable && mechanics.rateTable.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Rate card</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {mechanics.rateTable.map((r) => (
                  <div key={r.tier} className="flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="text-slate-700 truncate">
                      {r.tier}
                      {r.note && <span className="text-slate-400"> · {r.note}</span>}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 shrink-0">{r.rate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Key features</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {mechanics.features.map((f, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-snug">
                <span className="w-0.5 h-0.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, onClick }: { product: ProductFlow; onClick: () => void }) {
  const Icon = product.icon;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2.5 h-8 text-left border-l-2 border-transparent bg-white hover:bg-slate-50 transition-colors"
    >
      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
      <span className="text-xs truncate flex-1 text-slate-700">{product.name}</span>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">{product.category}</span>
      <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">{fmt(product.estimatedAudience)}</span>
    </button>
  );
}
