import { useEffect, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Surface = "rewards" | "product" | "relationship";

const FEATURES: Record<Surface, { title: string; items: { label: string; detail: string }[] }> = {
  rewards: {
    title: "Key features",
    items: [
      { label: "Context-specific curation", detail: "Collections built per signal group, each with its own reason line." },
      { label: "Hyper-personalized messaging", detail: "Copy written to the customer's behavior, never generic offer text." },
      { label: "Semantic deal search", detail: "Natural-language queries matched across the full catalog." },
      { label: "Timing intelligence", detail: "Expiring and in-season offers pushed ahead of the next spend window." },
    ],
  },
  product: {
    title: "Key features",
    items: [
      { label: "Signal-triggered recommendations", detail: "Every card names the behavior or life event behind it." },
      { label: "Offer construction", detail: "Headline, benefits, eligibility and value range generated per customer." },
      { label: "Lifestyle theming", detail: "Visual treatment and CTA adapt to the customer's dominant pillar." },
      { label: "Channel-ready delivery", detail: "The same card renders in-app, as email, or as SMS." },
    ],
  },
  relationship: {
    title: "Key features",
    items: [
      { label: "Grounded assistant", detail: "Answers from this customer's signals, deals and detected events." },
      { label: "Proactive nudges", detail: "Life-event and financial changes trigger the right check-in." },
      { label: "Banker escalation", detail: "Hands off with full signal context attached." },
      { label: "Protection cues", detail: "Wellness and habit-shift indicators surface early." },
    ],
  },
};

export function SurfaceFeaturePanel({
  surface,
  customerKey,
}: {
  surface: Surface;
  customerKey?: string | null;
}) {
  const config = FEATURES[surface];
  const hasSelection = Boolean(customerKey);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    if (!hasSelection) return;
    const timers = config.items.map((_, i) =>
      window.setTimeout(() => setRevealed(i + 1), 120 * (i + 1)),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [customerKey, surface, hasSelection, config.items.length]);

  return (
    <div className="lg:col-span-1 min-h-0 flex flex-col gap-4">
      {/* Key features */}
      <div className="flex-1 min-h-0 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="shrink-0 px-3.5 py-2.5 border-b border-slate-200 bg-slate-50/60 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <h2 className="text-sm font-semibold text-slate-900">{config.title}</h2>
        </div>
        <div
          className={cn(
            "flex-1 min-h-0 overflow-y-auto px-3 py-2.5 flex flex-col gap-2",
            !hasSelection && "opacity-60 grayscale pointer-events-none select-none",
          )}
        >
          {config.items.map((item, i) => (
            <div
              key={item.label}
              className={cn(
                "flex-1 min-h-[64px] border border-slate-200 rounded-md bg-slate-50/50 px-2.5 py-2 transition-all duration-300",
                !hasSelection || revealed > i
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-1",
              )}
            >
              <div className="flex items-start gap-1.5 h-full">
                <Check
                  className={cn(
                    "w-3.5 h-3.5 mt-[1px] shrink-0",
                    hasSelection ? "text-blue-500" : "text-slate-400",
                  )}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[12px] font-semibold leading-snug",
                      hasSelection ? "text-slate-900" : "text-slate-500",
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
