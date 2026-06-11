import { useEffect, useState } from "react";
import { Activity, CalendarHeart, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductFlow } from "@/lib/productAutomatedFlows";
import { getProductMessageVariants, type MessageAngle } from "@/lib/productCatalogExtras";

const ANGLE_VISUAL: Record<MessageAngle, { icon: React.ComponentType<{ className?: string }>; border: string; iconBg: string; iconColor: string }> = {
  behavioral: {
    icon: Activity,
    border: "border-l-blue-400",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  "life-event": {
    icon: CalendarHeart,
    border: "border-l-amber-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  "financial-journey": {
    icon: TrendingUp,
    border: "border-l-emerald-400",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
};

interface Props {
  product?: ProductFlow;
}

export function MessagePreviewsSection({ product }: Props) {
  const productId = product?.id;
  const [revealedCount, setRevealedCount] = useState(0);
  const [processingDone, setProcessingDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!productId) {
      setRevealedCount(0);
      setProcessingDone(new Set());
      return;
    }
    setRevealedCount(0);
    setProcessingDone(new Set());
    const total = 3;
    const stepMs = 600;
    const processingMs = 450;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < total; i++) {
      timers.push(
        setTimeout(() => setRevealedCount((c) => Math.max(c, i + 1)), i * stepMs),
      );
      timers.push(
        setTimeout(
          () =>
            setProcessingDone((prev) => {
              const next = new Set(prev);
              next.add(i);
              return next;
            }),
          i * stepMs + processingMs,
        ),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [productId]);

  if (!product) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 opacity-60">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
          <p className="text-sm font-semibold text-slate-900">Personalized message previews</p>
        </div>
        <p className="text-xs text-slate-500 text-center py-8">
          Pick a product above to preview three personalized angles.
        </p>
      </div>
    );
  }

  const variants = getProductMessageVariants(product.id, product.name, product.category);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
        <p className="text-sm font-semibold text-slate-900">Personalized message previews</p>
        <Badge variant="outline" className="text-[10px] border-slate-200 bg-white ml-auto">
          3 angles
        </Badge>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        Three sample sends for <span className="font-medium text-slate-700">{product.name}</span> — one per personalization angle.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {variants.map((v, idx) => {
          const visual = ANGLE_VISUAL[v.angle];
          const Icon = visual.icon;

          const state: "pending" | "processing" | "ready" =
            idx >= revealedCount
              ? "pending"
              : processingDone.has(idx)
                ? "ready"
                : "processing";

          if (state === "pending") {
            return (
              <div
                key={v.angle}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50"
                style={{ minHeight: 220 }}
                aria-hidden
              />
            );
          }

          if (state === "processing") {
            return (
              <div
                key={v.angle}
                className={cn(
                  "rounded-lg border border-slate-200 border-l-4 bg-white p-3 flex flex-col animate-fade-in",
                  visual.border,
                )}
                style={{ minHeight: 220 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("flex items-center justify-center w-6 h-6 rounded-md", visual.iconBg)}>
                    <Loader2 className={cn("w-3.5 h-3.5 animate-spin", visual.iconColor)} />
                  </span>
                  <div className="h-2.5 w-24 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="rounded-md border border-slate-100 bg-slate-50 px-2.5 py-2 mb-2 space-y-1.5">
                  <div className="h-2 w-16 rounded bg-slate-200 animate-pulse" />
                  <div className="h-2.5 w-full rounded bg-slate-200 animate-pulse" />
                </div>
                <div className="space-y-1.5 mb-3 flex-1">
                  <div className="h-2 w-full rounded bg-slate-100 animate-pulse" />
                  <div className="h-2 w-11/12 rounded bg-slate-100 animate-pulse" />
                  <div className="h-2 w-9/12 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="h-6 w-28 rounded-full bg-slate-100 animate-pulse mb-2" />
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <Sparkles className="w-3 h-3 text-slate-300" />
                  <div className="h-2 w-40 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={v.angle}
              className={cn(
                "rounded-lg border border-slate-200 border-l-4 bg-white p-3 flex flex-col animate-fade-in",
                visual.border,
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("flex items-center justify-center w-6 h-6 rounded-md", visual.iconBg)}>
                  <Icon className={cn("w-3.5 h-3.5", visual.iconColor)} />
                </span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{v.angleLabel}</p>
              </div>

              <div className="rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 mb-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Subject</p>
                <p className="text-xs font-semibold text-slate-900 leading-snug">{v.subject}</p>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed mb-3 flex-1">{v.body}</p>

              <button
                className="self-start inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors mb-2"
              >
                {v.cta}
              </button>

              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                <Sparkles className="w-3 h-3 text-slate-400" />
                <p className="text-[10px] text-slate-500">
                  <span className="font-medium text-slate-600">Why this angle:</span> {v.signalTag}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
