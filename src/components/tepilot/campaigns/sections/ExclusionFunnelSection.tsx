import { useEffect, useState } from "react";
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
  ChevronUp,
  Plus,
  Minus,
  Circle,
  Loader2,
} from "lucide-react";
import type { ProductFlow } from "@/lib/productAutomatedFlows";
import {
  buildAudienceFunnel,
  getProductExclusions,
  getProductSignalRelevance,
  SIGNAL_FAMILIES,
  SIGNAL_RELEVANCE_META,
  FAMILY_META,
  type ExclusionType,
  type SignalRelevance,
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

const RELEVANCE_RANK: Record<SignalRelevance, number> = { useful: 0, neutral: 1, flag: 2 };

interface Props {
  product?: ProductFlow;
}

export function ExclusionFunnelSection({ product }: Props) {
  const [expanded, setExpanded] = useState<ExclusionType | null>(null);
  const [disabled, setDisabled] = useState<Set<ExclusionType>>(new Set());
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (!product) return;
    setRevealedCount(0);
    setExpanded(null);
    const total = 5;
    const id = setInterval(() => {
      setRevealedCount((c) => {
        if (c >= total) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 220);
    return () => clearInterval(id);
  }, [product?.id]);


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
  const relevance = getProductSignalRelevance(product.id, product.category);
  const funnel = buildAudienceFunnel(product.estimatedAudience, exclusions, relevance, disabled);

  const getFamilySignals = (fam: ExclusionType): { label: string; detail: string }[] => {
    if (fam === "life-event" || fam === "behavioral") {
      return product.signals
        .filter((s) => s.type === fam)
        .map((s) => ({ label: s.label, detail: s.evidence }));
    }
    return exclusions
      .filter((e) => e.type === fam)
      .map((e) => ({ label: e.label, detail: e.rationale }));
  };


  // Sort: useful → neutral → flag, then declaration order within each tier.
  const orderedFamilies = [...SIGNAL_FAMILIES].sort((a, b) => {
    const ra = RELEVANCE_RANK[relevance[a]];
    const rb = RELEVANCE_RANK[relevance[b]];
    if (ra !== rb) return ra - rb;
    return SIGNAL_FAMILIES.indexOf(a) - SIGNAL_FAMILIES.indexOf(b);
  });

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

      {/* 5 signal-family cards, ordered by per-product relevance */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {orderedFamilies.map((fam, idx) => {
          const meta = FAMILY_META[fam];
          const Icon = FAMILY_ICON[fam];
          const rel = relevance[fam];
          const relMeta = SIGNAL_RELEVANCE_META[rel];
          const isExpanded = expanded === fam;
          const isDisabled = disabled.has(fam);
          const canToggle = rel === "flag";

          const BadgeIcon = rel === "useful" ? Plus : rel === "flag" ? Minus : Circle;

          const state: "pending" | "processing" | "ready" =
            idx < revealedCount ? "ready" : idx === revealedCount ? "processing" : "pending";

          if (state === "pending") {
            return (
              <div
                key={fam}
                className="relative rounded-lg p-3 bg-slate-100 border border-dashed border-slate-200"
                style={{ minHeight: 84 }}
                aria-hidden
              />
            );
          }

          if (state === "processing") {
            return (
              <div
                key={fam}
                className={cn(
                  "relative rounded-lg p-3 text-white overflow-hidden animate-fade-in",
                  meta.solid,
                )}
                style={{ minHeight: 84 }}
              >
                <div className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                </div>
                <div className="flex items-center gap-1.5 mb-2 pr-6">
                  <Icon className="w-4 h-4 text-white shrink-0 opacity-70" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-3/4 rounded bg-white/30 animate-pulse" />
                  <div className="h-2 w-1/2 rounded bg-white/20 animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" />
              </div>
            );
          }

          return (
            <div
              key={fam}
              className={cn(
                "relative rounded-lg p-3 transition-all bg-white border-2 animate-fade-in",
                meta.cardBorder,
                meta.cardText,
                relMeta.cardOpacity,
                isExpanded && "ring-2 ring-offset-2 ring-offset-white shadow-md",
                isExpanded && meta.cardBorder.replace("border-", "ring-"),
                isDisabled && "opacity-40",
              )}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canToggle) toggleFamily(fam);
                    }}
                    aria-label={`${meta.label}: ${relMeta.label}`}
                    className={cn(
                      "absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors",
                      relMeta.badgeBg,
                      relMeta.badgeBorder,
                      relMeta.badgeText,
                      canToggle ? "hover:brightness-110 cursor-pointer" : "cursor-help",
                    )}
                  >
                    <BadgeIcon className={cn("w-3 h-3", rel === "neutral" && "fill-current")} />
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
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">{meta.label}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{relMeta.label}</p>
                    </div>
                  </div>
                  {(() => {
                    const items = getFamilySignals(fam);
                    const shown = items.slice(0, 5);
                    const extra = items.length - shown.length;
                    if (items.length === 0) {
                      return (
                        <p className="text-[11px] text-slate-500 italic leading-snug">
                          No product-specific signals — relying on universal checks.
                        </p>
                      );
                    }
                    return (
                      <>
                        <p className="text-[11px] text-slate-600 leading-snug mb-2">
                          Signals driving this family for {product.name}:
                        </p>
                        <ul className="space-y-1.5">
                          {shown.map((s) => (
                            <li key={s.label} className="flex items-start gap-1.5">
                              <span className={cn("mt-1.5 w-1 h-1 rounded-full shrink-0", relMeta.bulletColor)} />
                              <div className="min-w-0">
                                <p className="text-[11px] font-medium text-slate-900 leading-snug">{s.label}</p>
                                <p className="text-[10px] text-slate-600 leading-snug">{s.detail}</p>
                              </div>
                            </li>
                          ))}
                          {extra > 0 && (
                            <li className="text-[10px] text-slate-400 pl-3">+{extra} more</li>
                          )}
                        </ul>
                      </>
                    );
                  })()}

                  {canToggle && (
                    <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      Click the badge again to {isDisabled ? "re-enable" : "disable"} this family in the funnel.
                    </p>
                  )}
                </PopoverContent>
              </Popover>

              <button
                onClick={() => setExpanded(isExpanded ? null : fam)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-1.5 mb-2 pr-6">
                  <Icon className={cn("w-4 h-4 shrink-0", meta.cardText)} />
                </div>
                <p className={cn("text-[12px] font-semibold leading-tight", meta.cardText)}>{meta.label}</p>
              </button>
            </div>
          );

        })}
      </div>


      {/* Expanded panel */}
      {expanded && revealedCount >= 5 && (
        <ExpandedPanel
          family={expanded}
          relevance={relevance[expanded]}
          signals={funnel.byFamily[expanded].signals}
          removed={funnel.byFamily[expanded].removed}
          baseForRates={product.estimatedAudience}
          onClose={() => setExpanded(null)}
        />
      )}

      {/* Final addressable footer */}
      {revealedCount >= 5 && (
        <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between animate-fade-in">
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
      )}
    </div>
  );
}

function ExpandedPanel({
  family,
  relevance,
  signals,
  removed,
  baseForRates,
  onClose,
}: {
  family: ExclusionType;
  relevance: SignalRelevance;
  signals: ReturnType<typeof getProductExclusions>;
  removed: number;
  baseForRates: number;
  onClose: () => void;
}) {
  const meta = FAMILY_META[family];
  const Icon = FAMILY_ICON[family];
  const relMeta = SIGNAL_RELEVANCE_META[relevance];
  const sign = relevance === "flag" ? "−" : "+";
  return (
    <div className={cn("rounded-lg border border-slate-200 border-l-4 bg-slate-50 p-3 mb-3", meta.border)}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("flex items-center justify-center w-7 h-7 rounded-md shrink-0", meta.iconBg)}>
          <Icon className={cn("w-4 h-4", meta.iconColor)} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 leading-tight">{meta.label}</p>
          <p className="text-[11px] text-slate-500">
            {signals.length} contributing signals · {relMeta.label}
            {relevance === "flag" && <> · −{fmt(removed)} from prior stage</>}
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
                  {sign}{fmt(Math.round(baseForRates * s.removedPct))}
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
