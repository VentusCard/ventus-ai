import { useMemo } from "react";
import { PRODUCT_FLOWS, type ProductFlow, type FlowCategory } from "@/lib/productAutomatedFlows";
import { getProductMechanics } from "@/lib/productCatalogExtras";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: FlowCategory[] = ["Cards", "Deposits", "Lending", "Wealth", "Insurance"];

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProductPickerSection({ selectedId, onSelect }: Props) {
  const grouped = useMemo(() => {
    const map: Record<string, ProductFlow[]> = {};
    for (const p of PRODUCT_FLOWS) {
      (map[p.category] ||= []).push(p);
    }
    return map;
  }, []);

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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        {/* Grid of products */}
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat] ?? [];
            if (!items.length) return null;
            return (
              <div key={cat}>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">{cat}</p>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                  {items.map((p) => {
                    const Icon = p.icon;
                    const isSelected = p.id === selectedId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelect(p.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all",
                          isSelected
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                            : "border-slate-200 bg-white hover:border-slate-400",
                        )}
                      >
                        <span className={cn(
                          "flex items-center justify-center w-7 h-7 rounded-md shrink-0",
                          isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
                        )}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-medium text-slate-900 leading-tight line-clamp-2">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && mechanics && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 self-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900">
                <selected.icon className="w-4 h-4 text-white" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{selected.name}</p>
                <p className="text-[11px] text-slate-500">{selected.category}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-snug mb-3">{selected.positioning}</p>

            <div className="rounded-md border border-slate-200 bg-white px-3 py-2 mb-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">How it works</p>
              <p className="text-xs text-slate-900 font-medium leading-snug">{mechanics.tagline}</p>
              <p className="text-[11px] text-slate-500 mt-1">{mechanics.fee}</p>
            </div>

            {mechanics.rateTable && mechanics.rateTable.length > 0 && (
              <div className="rounded-md border border-slate-200 bg-white p-2 mb-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 px-1">Rate card</p>
                <div className="space-y-1">
                  {mechanics.rateTable.map((r) => (
                    <div key={r.tier} className="flex items-baseline justify-between gap-2 text-xs px-1">
                      <span className="text-slate-700 truncate">{r.tier}</span>
                      <span className="font-mono font-semibold text-slate-900 shrink-0">{r.rate}</span>
                    </div>
                  ))}
                </div>
                {mechanics.rateTable.some((r) => r.note) && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 space-y-0.5">
                    {mechanics.rateTable.filter((r) => r.note).map((r) => (
                      <p key={r.tier} className="text-[10px] text-slate-500 px-1">{r.tier}: {r.note}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Key features</p>
            <ul className="space-y-1">
              {mechanics.features.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                  <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span className="leading-snug">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
