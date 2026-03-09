import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ChevronDown, X, Check } from "lucide-react";
import { DEMO_PRODUCTS } from "@/lib/samplePersonaGenerator";
import type { WealthTier } from "@/lib/samplePersonaGenerator";

export type TierProductMap = Record<WealthTier, { id: string; name: string }[]>;

interface TierProductSelectorProps {
  value: TierProductMap;
  onChange: (value: TierProductMap) => void;
}

const TIER_CONFIG: { tier: WealthTier; color: string; label: string }[] = [
  { tier: "Mass Market", color: "hsl(var(--primary))", label: "Mass Market" },
  { tier: "Affluent", color: "#f59e0b", label: "Affluent" },
  { tier: "HNW", color: "#8b5cf6", label: "HNW" },
];

function TierRow({
  tier,
  color,
  label,
  selected,
  onToggle,
}: {
  tier: WealthTier;
  color: string;
  label: string;
  selected: { id: string; name: string }[];
  onToggle: (product: { id: string; name: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center gap-3" ref={ref}>
      {/* Tier label */}
      <div className="w-24 shrink-0">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${color}15`, color }}
        >
          {label}
        </span>
      </div>

      {/* Selected products + dropdown trigger */}
      <div className="flex-1 relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-1.5 flex-wrap min-h-[32px] px-2.5 py-1 rounded-md border border-border bg-background text-left hover:border-primary/40 transition-colors"
        >
          {selected.length === 0 ? (
            <span className="text-xs text-muted-foreground">Select products…</span>
          ) : (
            selected.map((p) => (
              <Badge
                key={p.id}
                variant="secondary"
                className="text-[10px] gap-1 px-1.5 py-0 h-5 cursor-pointer hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(p);
                }}
              >
                <CreditCard className="w-2.5 h-2.5" />
                {p.name}
                <X className="w-2.5 h-2.5 ml-0.5" />
              </Badge>
            ))
          )}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
            {DEMO_PRODUCTS.map((product) => {
              const isSelected = selected.some((s) => s.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => onToggle({ id: product.id, name: product.name })}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-slate-800 font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-primary border-primary" : "border-border"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  <CreditCard className="w-3 h-3 shrink-0" />
                  {product.name}
                  <span className="ml-auto text-[10px] text-muted-foreground capitalize">
                    {product.category.replace("_", " ")}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function TierProductSelector({ value, onChange }: TierProductSelectorProps) {
  const handleToggle = (tier: WealthTier, product: { id: string; name: string }) => {
    const current = value[tier];
    const exists = current.some((p) => p.id === product.id);
    const updated = exists
      ? current.filter((p) => p.id !== product.id)
      : [...current, product];
    onChange({ ...value, [tier]: updated });
  };

  return (
    <div className="p-3 rounded-lg border border-border bg-background space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Products by Segment</span>
      </div>
      {TIER_CONFIG.map(({ tier, color, label }) => (
        <TierRow
          key={tier}
          tier={tier}
          color={color}
          label={label}
          selected={value[tier]}
          onToggle={(p) => handleToggle(tier, p)}
        />
      ))}
    </div>
  );
}
