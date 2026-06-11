// memo removed: empty-state branch must precede hooks
import { Activity, CalendarHeart, TrendingUp, Sparkles } from "lucide-react";
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
        {variants.map((v) => {
          const visual = ANGLE_VISUAL[v.angle];
          const Icon = visual.icon;
          return (
            <div
              key={v.angle}
              className={cn("rounded-lg border border-slate-200 border-l-4 bg-white p-3 flex flex-col", visual.border)}
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
