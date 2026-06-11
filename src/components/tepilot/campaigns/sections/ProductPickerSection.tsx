import { useMemo, useState } from "react";
import { PRODUCT_FLOWS, type ProductFlow } from "@/lib/productAutomatedFlows";
import { getProductMechanics } from "@/lib/productCatalogExtras";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
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

const DEFAULT_AGE: [number, number] = [25, 65];
const DEFAULT_INCOME: [number, number] = [50, 200]; // in $K
const DEFAULT_GENDER = ["female", "male", "other"];
const DEFAULT_REGION = "all";
const HOUSEHOLD_TYPES = [
  { id: "single", label: "Single" },
  { id: "couple", label: "Couple" },
  { id: "family-kids", label: "Family with kids" },
  { id: "empty-nester", label: "Empty nester" },
];

export function ProductPickerSection({ selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");

  // Filter state — presentational only.
  const [age, setAge] = useState<[number, number]>(DEFAULT_AGE);
  const [income, setIncome] = useState<[number, number]>(DEFAULT_INCOME);
  const [gender, setGender] = useState<string[]>(DEFAULT_GENDER);
  const [region, setRegion] = useState<string>(DEFAULT_REGION);
  const [household, setHousehold] = useState<string[]>(HOUSEHOLD_TYPES.map((h) => h.id));

  const resetFilters = () => {
    setAge(DEFAULT_AGE);
    setIncome(DEFAULT_INCOME);
    setGender(DEFAULT_GENDER);
    setRegion(DEFAULT_REGION);
    setHousehold(HOUSEHOLD_TYPES.map((h) => h.id));
  };

  const toggleHousehold = (id: string) => {
    setHousehold((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

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

      <div className="grid grid-cols-10 gap-4">
        {/* Left: product search + selected product detail (~70%) */}
        <div className="col-span-7">
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

              <div className="rounded-md bg-white border border-slate-200 px-2.5 py-1.5">
                <p className="text-xs font-medium text-slate-900 leading-snug">{mechanics.tagline}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{mechanics.fee}</p>
              </div>
            </div>
          )}

          {!selected && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">Search and pick a product to see its mechanics.</p>
            </div>
          )}
        </div>

        {/* Right: standard audience filters sidebar (~30%) — matches left column height */}
        <aside className="col-span-3 rounded-lg border border-slate-200 bg-slate-50 p-3 flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-xs font-semibold text-slate-900">Audience filters</p>
            <button
              onClick={resetFilters}
              className="ml-auto text-[10px] text-slate-500 hover:text-slate-900 underline-offset-2 hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 mt-3 space-y-4">
            {/* Age */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-[11px] font-medium text-slate-700">Age range</label>
                <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                  {age[0]} – {age[1]}
                </span>
              </div>
              <Slider
                min={18}
                max={85}
                step={1}
                value={age}
                onValueChange={(v) => setAge([v[0], v[1]] as [number, number])}
                className="py-1"
              />
            </div>

            {/* Income */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-[11px] font-medium text-slate-700">Household income</label>
                <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                  ${income[0]}K – ${income[1]}K{income[1] >= 500 ? "+" : ""}
                </span>
              </div>
              <Slider
                min={0}
                max={500}
                step={10}
                value={income}
                onValueChange={(v) => setIncome([v[0], v[1]] as [number, number])}
                className="py-1"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1.5">Gender</label>
              <ToggleGroup
                type="multiple"
                value={gender}
                onValueChange={(v) => setGender(v.length === 0 ? gender : v)}
                className="grid grid-cols-3 gap-1"
              >
                <ToggleGroupItem
                  value="female"
                  className="h-7 text-[10px] data-[state=on]:bg-slate-900 data-[state=on]:text-white border border-slate-200 bg-white text-slate-600"
                >
                  Female
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="male"
                  className="h-7 text-[10px] data-[state=on]:bg-slate-900 data-[state=on]:text-white border border-slate-200 bg-white text-slate-600"
                >
                  Male
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="other"
                  className="h-7 text-[10px] data-[state=on]:bg-slate-900 data-[state=on]:text-white border border-slate-200 bg-white text-slate-600"
                >
                  Other
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Region */}
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1.5">Region</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all">All regions</SelectItem>
                  <SelectItem value="northeast">Northeast</SelectItem>
                  <SelectItem value="midwest">Midwest</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Household type */}
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1.5">Household type</label>
              <div className="space-y-1.5">
                {HOUSEHOLD_TYPES.map((h) => (
                  <label key={h.id} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                    <Checkbox
                      checked={household.includes(h.id)}
                      onCheckedChange={() => toggleHousehold(h.id)}
                      className="h-3.5 w-3.5 border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                    />
                    <span>{h.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-snug pt-2 mt-2 border-t border-slate-200 shrink-0">
            Applied to the addressable audience in Section 2.
          </p>
        </aside>

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
