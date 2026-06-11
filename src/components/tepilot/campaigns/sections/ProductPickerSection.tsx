import { useMemo, useState } from "react";
import { PRODUCT_FLOWS, type ProductFlow, type FlowCategory } from "@/lib/productAutomatedFlows";
import { getProductMechanics } from "@/lib/productCatalogExtras";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: FlowCategory[] = ["Cards", "Deposits", "Lending", "Wealth", "Insurance"];
type FilterKey = "All" | FlowCategory;
const FILTERS: FilterKey[] = ["All", ...CATEGORY_ORDER];

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
  const [filter, setFilter] = useState<FilterKey>("All");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: PRODUCT_FLOWS.length };
    for (const cat of CATEGORY_ORDER) {
      map[cat] = PRODUCT_FLOWS.filter((p) => p.category === cat).length;
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCT_FLOWS.filter((p) => {
      if (filter !== "All" && p.category !== filter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, query]);

  // Group only when "All" is active and there's no query; otherwise flat list.
  const groupedView = filter === "All" && !query.trim();
  const grouped = useMemo(() => {
    if (!groupedView) return null;
    const map: Record<string, ProductFlow[]> = {};
    for (const p of filtered) (map[p.category] ||= []).push(p);
    return map;
  }, [filtered, groupedView]);

  const selected = PRODUCT_FLOWS.find((p) => p.id === selectedId);
  const mechanics = selected ? getProductMechanics(selected.id, selected.category) : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
        <p className="text-sm font-semibold text-slate-900">Pick a product</p>
        <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">
          {PRODUCT_FLOWS.length} available
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4">
        {/* Left: filters + search + dense list */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-medium border transition-colors",
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400",
                    )}
                  >
                    {f}
                    <span className={cn("text-[10px] tabular-nums", active ? "text-slate-300" : "text-slate-400")}>
                      {counts[f]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative ml-auto w-44">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="h-7 pl-6 text-xs bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white max-h-[360px] overflow-y-auto">
            {groupedView ? (
              CATEGORY_ORDER.map((cat) => {
                const items = grouped?.[cat] ?? [];
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <div className="sticky top-0 z-10 bg-slate-50 px-2.5 py-1 border-b border-slate-200">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                        {cat} <span className="text-slate-400 ml-1">{items.length}</span>
                      </p>
                    </div>
                    {items.map((p) => (
                      <ProductRow
                        key={p.id}
                        product={p}
                        selected={p.id === selectedId}
                        onClick={() => onSelect(p.id)}
                      />
                    ))}
                  </div>
                );
              })
            ) : filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-500">No products match.</div>
            ) : (
              filtered.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  selected={p.id === selectedId}
                  onClick={() => onSelect(p.id)}
                  showCategory
                />
              ))
            )}
          </div>
        </div>

        {/* Right: dense detail panel (sticky) */}
        {selected && mechanics && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 self-start lg:sticky lg:top-4">
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
                <div className="space-y-0.5">
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
            <ul className="space-y-0.5">
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
    </div>
  );
}

function ProductRow({
  product,
  selected,
  onClick,
  showCategory,
}: {
  product: ProductFlow;
  selected: boolean;
  onClick: () => void;
  showCategory?: boolean;
}) {
  const Icon = product.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 h-8 text-left border-l-2 transition-colors",
        selected
          ? "border-slate-900 bg-slate-50"
          : "border-transparent bg-white hover:bg-slate-50",
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 shrink-0", selected ? "text-slate-900" : "text-slate-500")} />
      <span className={cn("text-xs truncate flex-1", selected ? "font-semibold text-slate-900" : "text-slate-700")}>
        {product.name}
      </span>
      {showCategory && (
        <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">{product.category}</span>
      )}
      <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">{fmt(product.estimatedAudience)}</span>
    </button>
  );
}
