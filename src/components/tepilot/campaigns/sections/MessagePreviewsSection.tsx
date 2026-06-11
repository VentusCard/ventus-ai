import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarHeart, TrendingUp, Sparkles, Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { ProductFlow } from "@/lib/productAutomatedFlows";
import {
  buildProfileForProduct,
  type OfferAngle,
  type OfferBank,
  type OfferExample,
} from "@/lib/productCatalogExtras";

// ── visuals ──────────────────────────────────────────────────────────────────

const ANGLE_VISUAL: Record<OfferAngle, { icon: React.ComponentType<{ className?: string }>; border: string; iconBg: string; iconColor: string; label: string }> = {
  BEHAVIORAL: { icon: Activity,      border: "border-l-blue-400",    iconBg: "bg-blue-50",    iconColor: "text-blue-600",    label: "Behavioral" },
  LIFE_EVENT: { icon: CalendarHeart, border: "border-l-amber-400",   iconBg: "bg-amber-50",   iconColor: "text-amber-600",   label: "Life event" },
  FINANCIAL:  { icon: TrendingUp,    border: "border-l-emerald-400", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", label: "Financial journey" },
};

const FAMILY_PREFIX = (n: number): { code: string; color: string } => {
  if (n <= 3)  return { code: `B${n}`,  color: "bg-blue-50 text-blue-700 border-blue-200" };
  if (n <= 6)  return { code: `L${n}`,  color: "bg-amber-50 text-amber-700 border-amber-200" };
  if (n <= 9)  return { code: `D${n}`,  color: "bg-violet-50 text-violet-700 border-violet-200" };
  if (n <= 12) return { code: `F${n}`,  color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  return { code: `R${n}`, color: "bg-rose-50 text-rose-700 border-rose-200" };
};

// ── component ────────────────────────────────────────────────────────────────

interface Props {
  product?: ProductFlow;
}

export function MessagePreviewsSection({ product }: Props) {
  const productId = product?.id;

  const { data: bank, isLoading, isError } = useQuery<OfferBank>({
    queryKey: ["campaign-offers", productId],
    enabled: !!product,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (!product) throw new Error("no product");
      const profile = buildProfileForProduct(product.id, product.category);
      const { data, error } = await supabase.functions.invoke("generate-campaign-offers", {
        body: {
          product: {
            id: product.id,
            name: product.name,
            category: product.category,
            positioning: product.positioning,
            signals: product.signals,
          },
          profile,
        },
      });
      if (error) throw error;
      return data as OfferBank;
    },
  });

  const examples = bank?.examples ?? [];
  const totalSlots = 5;

  // staggered reveal
  const [revealedCount, setRevealedCount] = useState(0);
  const [processingDone, setProcessingDone] = useState<Set<number>>(new Set());
  useEffect(() => {
    setRevealedCount(0);
    setProcessingDone(new Set());
    if (!productId || isLoading || !bank) return;
    const stepMs = 350;
    const processingMs = 450;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < totalSlots; i++) {
      timers.push(setTimeout(() => setRevealedCount((c) => Math.max(c, i + 1)), i * stepMs));
      timers.push(setTimeout(() => setProcessingDone((p) => { const n = new Set(p); n.add(i); return n; }), i * stepMs + processingMs));
    }
    return () => timers.forEach(clearTimeout);
  }, [productId, isLoading, bank]);

  // ── empty state ────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 opacity-60">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
          <p className="text-sm font-semibold text-slate-900">Personalized message previews</p>
        </div>
        <p className="text-xs text-slate-500 text-center py-8">
          Pick a product above to preview personalized variations.
        </p>
      </div>
    );
  }

  // ── shell ──────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
        <p className="text-sm font-semibold text-slate-900">Personalized message previews</p>
        <Badge variant="outline" className="text-[10px] border-slate-200 bg-white ml-auto">
          {bank
            ? `${bank.total_variations.toLocaleString()} variations · 5 shown`
            : isError
              ? "fallback"
              : "loading…"}
        </Badge>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        Campaign Engine reads 15 dimension cards (H/M/L) for{" "}
        <span className="font-medium text-slate-700">{product.name}</span>.
      </p>
      {bank && bank.decision === "SEND" && bank.variation_space && (
        <p className="text-[10px] text-slate-500 font-mono mb-3">
          {bank.variation_space.plays_qualified?.length ?? 0} plays × ({bank.variation_space.primary_spend_categories_qualified?.length ?? 0} primary + {bank.variation_space.secondary_spend_categories_qualified?.length ?? 0} secondary + {bank.variation_space.life_events_qualified?.length ?? 0} life events + {bank.variation_space.financial_angles_qualified?.length ?? 0} financial + {bank.variation_space.demographic_angles_qualified?.length ?? 0} demographic) × {bank.variation_space.anchors_available?.length ?? 0} anchors × {bank.variation_space.tone_registers_available?.length ?? 0} tones × {bank.variation_space.proof_modes?.length ?? 0} proof × {bank.variation_space.offer_constructions?.length ?? 0} constructions = {bank.total_variations.toLocaleString()}
        </p>
      )}


      {bank && bank.decision !== "SEND" ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-900">
              {bank.decision === "SUPPRESS" ? "Send suppressed" : "Audience trimmed"}
            </p>
            <p className="text-xs text-rose-700 mt-0.5">{bank.suppress_reason ?? "Risk or floor gate triggered."}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const ex: OfferExample | undefined = examples[idx];
            const state: "pending" | "processing" | "ready" =
              idx >= revealedCount
                ? "pending"
                : processingDone.has(idx) && ex
                  ? "ready"
                  : "processing";

            const visual = ex ? ANGLE_VISUAL[ex.angle] : ANGLE_VISUAL.BEHAVIORAL;

            if (state === "pending") {
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50"
                  style={{ minHeight: 260 }}
                  aria-hidden
                />
              );
            }

            if (state === "processing" || !ex) {
              return (
                <div
                  key={idx}
                  className={cn("rounded-lg border border-slate-200 border-l-4 bg-white p-3 flex flex-col animate-fade-in", visual.border)}
                  style={{ minHeight: 260 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("flex items-center justify-center w-6 h-6 rounded-md", visual.iconBg)}>
                      <Loader2 className={cn("w-3.5 h-3.5 animate-spin", visual.iconColor)} />
                    </span>
                    <div className="h-2.5 w-20 rounded bg-slate-100 animate-pulse" />
                  </div>
                  <div className="rounded-md border border-slate-100 bg-slate-50 px-2.5 py-2 mb-2 space-y-1.5">
                    <div className="h-2 w-14 rounded bg-slate-200 animate-pulse" />
                    <div className="h-2.5 w-full rounded bg-slate-200 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 mb-3 flex-1">
                    <div className="h-2 w-full rounded bg-slate-100 animate-pulse" />
                    <div className="h-2 w-11/12 rounded bg-slate-100 animate-pulse" />
                    <div className="h-2 w-9/12 rounded bg-slate-100 animate-pulse" />
                  </div>
                  <div className="h-6 w-24 rounded-full bg-slate-100 animate-pulse" />
                </div>
              );
            }

            const Icon = visual.icon;
            return (
              <div
                key={idx}
                className={cn("rounded-lg border border-slate-200 border-l-4 bg-white p-3 flex flex-col animate-fade-in", visual.border)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("flex items-center justify-center w-6 h-6 rounded-md shrink-0", visual.iconBg)}>
                    <Icon className={cn("w-3.5 h-3.5", visual.iconColor)} />
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 truncate">{visual.label}</p>
                </div>

                <div className="mb-2 flex flex-wrap gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-white">
                    {ex.play}
                  </span>
                  <span className="text-[9px] font-medium text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 truncate max-w-[120px]" title={ex.offer_anchor}>
                    {ex.offer_anchor}
                  </span>
                </div>

                <div className="rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 mb-2">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Subject</p>
                  <p className="text-xs font-semibold text-slate-900 leading-snug">{ex.subject}</p>
                </div>

                <p className="text-[11px] text-slate-700 leading-relaxed mb-3 flex-1">{ex.body}</p>

                <button className="self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-semibold hover:bg-slate-800 transition-colors mb-2">
                  {ex.cta}
                </button>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-500 leading-snug">{ex.why}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ex.cards_used.slice(0, 6).map((n) => {
                      const f = FAMILY_PREFIX(n);
                      return (
                        <span key={n} className={cn("text-[9px] font-mono font-semibold px-1 py-0.5 rounded border", f.color)}>
                          {f.code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isError && (
        <p className="mt-3 text-[10px] text-rose-600">
          Live engine unavailable — showing static placeholders.
        </p>
      )}
    </div>
  );
}
