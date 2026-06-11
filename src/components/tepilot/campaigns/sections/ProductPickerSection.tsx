import { useMemo, useRef, useState } from "react";
import { PRODUCT_FLOWS, type ProductFlow } from "@/lib/productAutomatedFlows";
import { getProductMechanics } from "@/lib/productCatalogExtras";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeftRight, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AGE_RANGES,
  REGIONS,
  INCOME_BANDS,
  ACCOUNT_TENURE_OPTIONS,
  FICO_RANGES,
} from "@/types/segment";

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
};

const RELATIONSHIP_DEPTH_OPTIONS = [
  { value: "any", label: "Any depth" },
  { value: "single", label: "Single product" },
  { value: "multi", label: "Multi-product" },
  { value: "primary", label: "Primary bank" },
] as const;

interface DemoFilters {
  ageRanges: string[];
  incomeBands: string[];
  ficoRanges: string[];
  regions: string[];
  accountTenure: string;
  relationshipDepth: string;
}

const DEFAULT_FILTERS: DemoFilters = {
  ageRanges: AGE_RANGES.map((a) => a),
  incomeBands: INCOME_BANDS.map((b) => b.value),
  ficoRanges: FICO_RANGES.map((f) => f.value),
  regions: REGIONS.map((r) => r),
  accountTenure: "all",
  relationshipDepth: "any",
};

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProductPickerSection({ selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DemoFilters>(DEFAULT_FILTERS);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = PRODUCT_FLOWS.find((p) => p.id === selectedId);
  const mechanics = selected ? getProductMechanics(selected.id, selected.category) : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCT_FLOWS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    ).slice(0, 12);
  }, [query]);

  const activeCount =
    (AGE_RANGES.length - filters.ageRanges.length) +
    (INCOME_BANDS.length - filters.incomeBands.length) +
    (FICO_RANGES.length - filters.ficoRanges.length) +
    (REGIONS.length - filters.regions.length) +
    (filters.accountTenure !== "all" ? 1 : 0) +
    (filters.relationshipDepth !== "any" ? 1 : 0);

  const toggleArr = (key: keyof DemoFilters, value: string) => {
    setFilters((f) => {
      const cur = f[key] as string[];
      return {
        ...f,
        [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      };
    });
  };

  const tenureFactor: Record<string, number> = {
    all: 1,
    new: 0.25,
    established: 0.45,
    loyal: 0.3,
  };
  const depthFactor: Record<string, number> = {
    any: 1,
    single: 0.4,
    multi: 0.45,
    primary: 0.25,
  };

  const groupRatios = {
    Age: filters.ageRanges.length / AGE_RANGES.length,
    Income: filters.incomeBands.length / INCOME_BANDS.length,
    FICO: filters.ficoRanges.length / FICO_RANGES.length,
    Region: filters.regions.length / REGIONS.length,
  };
  const emptyGroup = Object.entries(groupRatios).find(([, r]) => r === 0)?.[0];
  const retention =
    groupRatios.Age *
    groupRatios.Income *
    groupRatios.FICO *
    groupRatios.Region *
    (tenureFactor[filters.accountTenure] ?? 1) *
    (depthFactor[filters.relationshipDepth] ?? 1);
  const baseline = selected?.estimatedAudience ?? 0;
  const estimatedReach = Math.round(baseline * retention);
  const tightest = (Object.entries({
    Age: { sel: filters.ageRanges.length, total: AGE_RANGES.length },
    Income: { sel: filters.incomeBands.length, total: INCOME_BANDS.length },
    FICO: { sel: filters.ficoRanges.length, total: FICO_RANGES.length },
    Region: { sel: filters.regions.length, total: REGIONS.length },
  }) as [string, { sel: number; total: number }][])
    .filter(([, v]) => v.sel < v.total && v.sel > 0)
    .sort((a, b) => a[1].sel / a[1].total - b[1].sel / b[1].total)[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
        <p className="text-sm font-semibold text-slate-900">Pick a product</p>
        <Badge variant="outline" className="text-[10px] border-slate-200 bg-white">
          {PRODUCT_FLOWS.length} available
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-3 mb-3 items-start">
        {/* Search / Selected product column */}
        {selected && mechanics ? (
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
              <button
                type="button"
                onClick={() => {
                  onSelect("");
                  setQuery("");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                className="shrink-0 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeftRight className="w-3 h-3" />
                Change product
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug mb-2">{selected.positioning}</p>
            <div className="rounded-md bg-white border border-slate-200 px-2.5 py-1.5">
              <p className="text-xs font-medium text-slate-900 leading-snug">{mechanics.tagline}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{mechanics.fee}</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${PRODUCT_FLOWS.length} products — cards, deposits, lending, wealth, insurance…`}
              className="h-8 pl-8 text-xs bg-white border-slate-200"
            />
            {query.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-md border border-slate-200 bg-white max-h-[280px] overflow-y-auto shadow-md">
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
        )}

        {/* Right column: Filters + Audience panel */}
        <div className="space-y-3">

        {/* Filters column */}
        <div className="rounded-md border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="w-full flex items-center gap-2 px-2.5 h-8 text-left hover:bg-slate-50 transition-colors rounded-md"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-xs font-medium text-slate-700 shrink-0">Filters</span>
            {activeCount > 0 ? (
              <Badge className="h-4 px-1.5 text-[10px] bg-slate-900 text-white hover:bg-slate-900">
                {activeCount}
              </Badge>
            ) : (
              <span className="text-[10px] text-slate-400 truncate">
                Age · Income · Tenure · FICO · Region · Depth
              </span>
            )}
            <span className="ml-auto flex items-center gap-1 shrink-0">
              {activeCount > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters(DEFAULT_FILTERS);
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-900 underline"
                >
                  Reset
                </span>
              )}
              {filtersOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </span>
          </button>

          {filtersOpen && (
            <div className="border-t border-slate-200 p-3 space-y-3 max-h-[360px] overflow-y-auto">
              <ChipGroup
                label="Age"
                options={[...AGE_RANGES].map((a) => ({ value: a, label: a }))}
                selected={filters.ageRanges}
                onToggle={(v) => toggleArr("ageRanges", v)}
              />
              <ChipGroup
                label="Income"
                options={[...INCOME_BANDS]}
                selected={filters.incomeBands}
                onToggle={(v) => toggleArr("incomeBands", v)}
              />
              <ChipGroup
                label="FICO"
                options={[...FICO_RANGES]}
                selected={filters.ficoRanges}
                onToggle={(v) => toggleArr("ficoRanges", v)}
              />
              <ChipGroup
                label="Region"
                options={[...REGIONS].map((r) => ({ value: r, label: r }))}
                selected={filters.regions}
                onToggle={(v) => toggleArr("regions", v)}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Tenure</p>
                  <Select
                    value={filters.accountTenure}
                    onValueChange={(v) => setFilters((f) => ({ ...f, accountTenure: v }))}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TENURE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Relationship</p>
                  <Select
                    value={filters.relationshipDepth}
                    onValueChange={(v) => setFilters((f) => ({ ...f, relationshipDepth: v }))}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_DEPTH_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {selected && (
          <AudiencePanel
            estimatedReach={estimatedReach}
            emptyGroup={emptyGroup}
          />
        )}
        </div>
      </div>
    </div>
  );
}

function AudiencePanel({
  estimatedReach,
  emptyGroup,
}: {
  estimatedReach: number;
  emptyGroup?: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Addressable population</p>
      {emptyGroup ? (
        <>
          <p className="text-xl font-semibold text-slate-900 leading-tight tabular-nums">0</p>
          <p className="text-[11px] text-rose-600 mt-1 leading-snug">
            No customers match — re-enable at least one option in {emptyGroup}.
          </p>
        </>
      ) : (
        <>
          <p className="text-2xl font-semibold text-slate-900 leading-tight tabular-nums">{fmt(estimatedReach)}</p>
          <p className="text-[11px] text-slate-500 leading-snug">Eligible customers after filters</p>
        </>
      )}
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isSel = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors",
                isSel
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductRow({ product, onClick }: { product: ProductFlow; onClick: () => void }) {
  const Icon = product.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 h-8 text-left border-l-2 border-transparent bg-white hover:bg-slate-50 transition-colors",
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
      <span className="text-xs truncate flex-1 text-slate-700">{product.name}</span>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">{product.category}</span>
      <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">{fmt(product.estimatedAudience)}</span>
    </button>
  );
}
