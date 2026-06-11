import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Activity,
  UserCircle,
  AlertTriangle,
  CalendarHeart,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
} from "lucide-react";
import type { ProductFlow } from "@/lib/productAutomatedFlows";
import {
  buildAudienceFunnel,
  getProductExclusions,
  SIGNAL_FAMILIES,
  FAMILY_META,
  FAMILY_POLARITY,
  FAMILY_REASONS,
  type ExclusionType,
} from "@/lib/productCatalogExtras";

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
};

const FAMILY_ICON: Record<ExclusionType, React.ComponentType<{ className?: string }>> = {
  "life-event": CalendarHeart,
  behavioral: Activity,
  financial: DollarSign,
  demographic: UserCircle,
  risk: AlertTriangle,
};

interface Props {
  product?: ProductFlow;
}

export function ExclusionFunnelSection({ product }: Props) {
  const [expanded, setExpanded] = useState<ExclusionType | null>(null);
  const [disabled, setDisabled] = useState<Set<ExclusionType>>(new Set());

  if (!product) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 opacity-60">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
          <p className="text-sm font-semibold text-slate-900">Audience &amp; signal contributions</p>
        </div>
        <p className="text-xs text-slate-500 text-center py-8">
          Pick a product above to see how each signal family shapes the addressable audience.
        </p>
      </div>
    );
  }

  const exclusions = getProductExclusions(product.id, product.category);
  const funnel = buildAudienceFunnel(product.estimatedAudience, exclusions, disabled);

  const toggleFamily = (fam: ExclusionType) => {
    setDisabled((prev) => {
      const next = new Set(prev);
      if (next.has(fam)) next.delete(fam);
      else next.add(fam);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
        <p className="text-sm font-semibold text-slate-900">Audience &amp; signal contributions</p>
        <Badge variant="outline" className="text-[10px] border-slate-200 bg-white ml-auto">
          {fmt(product.estimatedAudience)} eligible → {fmt(funnel.finalCount)} addressable
        </Badge>
      </div>

      {/* 5 signal-family cards */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {SIGNAL_FAMILIES.map((fam) => {
          const meta = FAMILY_META[fam];
          const Icon = FAMILY_ICON[fam];
          const data = funnel.byFamily[fam];
          const polarity = FAMILY_POLARITY[fam];
          const isExpanded = expanded === fam;
          const isDisabled = disabled.has(fam);
          return (
            <div
              key={fam}
              className={cn(
                "relative rounded-lg p-3 transition-all text-white",
                meta.solid,
                isExpanded && "ring-2 ring-white ring-offset-2 ring-offset-white shadow-md",
                isDisabled && "opacity-40",
              )}
            >
              {/* +/− polarity toggle (top-right) */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFamily(fam);
                    }}
                    aria-label={`${isDisabled ? "Enable" : "Disable"} ${meta.label}`}
                    className={cn(
                      "absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors",
                      isDisabled
                        ? "border-white/60 bg-transparent text-white/70 hover:bg-white/10"
                        : "border-white/70 bg-white/15 text-white hover:bg-white/25",
                    )}
                  >
                    {polarity === "plus" ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="end"
                  className="w-64 p-3 bg-white border-slate-200 text-slate-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("flex items-center justify-center w-6 h-6 rounded-md", meta.iconBg)}>
                      <Icon className={cn("w-3.5 h-3.5", meta.iconColor)} />
                    </span>
                    <p className="text-xs font-semibold text-slate-900">{meta.label}</p>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mb-2">{FAMILY_REASONS[fam].intro}</p>
                  <ul className="space-y-1">
                    {FAMILY_REASONS[fam].reasons.map((r) => (
                      <li key={r} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                        <span
                          className={cn(
                            "mt-1 w-1 h-1 rounded-full shrink-0",
                            polarity === "plus" ? "bg-emerald-500" : "bg-rose-500",
                          )}
                        />
                        <span className="leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                    Click the {polarity === "plus" ? "+" : "−"} again to {isDisabled ? "re-enable" : "disable"} this family in the funnel.
                  </p>
                </PopoverContent>
              </Popover>

              <button
                onClick={() => setExpanded(isExpanded ? null : fam)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-1.5 mb-2 pr-6">
                  <Icon className="w-4 h-4 text-white shrink-0" />
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-white/80 ml-auto" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-white/80 ml-auto" />
                  )}
                </div>
                <p className="text-[12px] font-semibold text-white leading-tight">{meta.label}</p>
              </button>
            </div>
          );
        })}
      </div>


      {/* Expanded panel */}
      {expanded && (
        <ExpandedPanel
          family={expanded}
          signals={funnel.byFamily[expanded].signals}
          removed={funnel.byFamily[expanded].removed}
          baseForRates={product.estimatedAudience}
          onClose={() => setExpanded(null)}
        />
      )}

      {/* Final addressable footer */}
      <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Final addressable audience
            {disabled.size > 0 && (
              <span className="text-slate-400"> · {disabled.size} family{disabled.size > 1 ? "ies" : ""} disabled</span>
            )}
          </span>
        </div>
        <span className="text-base font-mono font-semibold text-slate-900">{fmt(funnel.finalCount)}</span>
      </div>
    </div>
  );
}

function ExpandedPanel({
  family,
  signals,
  removed,
  baseForRates,
  onClose,
}: {
  family: ExclusionType;
  signals: ReturnType<typeof getProductExclusions>;
  removed: number;
  baseForRates: number;
  onClose: () => void;
}) {
  const meta = FAMILY_META[family];
  const Icon = FAMILY_ICON[family];
  const polarity = FAMILY_POLARITY[family];
  return (
    <div className={cn("rounded-lg border border-slate-200 border-l-4 bg-slate-50 p-3 mb-3", meta.border)}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("flex items-center justify-center w-7 h-7 rounded-md shrink-0", meta.iconBg)}>
          <Icon className={cn("w-4 h-4", meta.iconColor)} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 leading-tight">{meta.label}</p>
          <p className="text-[11px] text-slate-500">
            {signals.length} contributing signals · {polarity === "plus" ? "+" : "−"}{fmt(removed)} from prior stage
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900"
        >
          Collapse <ChevronUp className="w-3 h-3" />
        </button>
      </div>

      {signals.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-3 text-center">
          No {meta.label.toLowerCase()} are filtering this product right now.
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {signals.map((s) => (
            <li key={s.id} className="rounded-md border border-slate-200 bg-white p-2">
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <p className="text-xs font-medium text-slate-900 leading-tight">{s.label}</p>
                <span className="text-[10px] font-mono text-slate-600 shrink-0">
                  {polarity === "plus" ? "+" : "−"}{fmt(Math.round(baseForRates * s.removedPct))}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{s.rationale}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
