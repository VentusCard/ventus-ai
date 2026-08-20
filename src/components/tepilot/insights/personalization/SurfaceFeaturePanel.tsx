import { useEffect, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnitEconomicsCard } from "./UnitEconomicsCard";

export type Surface = "rewards" | "product" | "relationship";

const FEATURES: Record<Surface, { title: string; items: { label: string; detail: string }[] }> = {
  rewards: {
    title: "Key features",
    items: [
      { label: "Seasonal spend curves", detail: "Offer timing follows the customer's own category rhythm." },
      { label: "Persona affinity ranking", detail: "Deals ordered by fit against detected behavioral signals." },
      { label: "Generated from live signals", detail: "Every offer traces back to observable transaction evidence." },
      { label: "Redemption-ready", detail: "Surfaces directly in the wallet experience — no separate campaign." },
    ],
  },
  product: {
    title: "Key features",
    items: [
      { label: "Next-best-product fit", detail: "Signals scored against the full product catalog." },
      { label: "Evidence-grounded rationale", detail: "Each recommendation carries the behavior that triggered it." },
      { label: "Channel routing", detail: "Delivered through the customer's most responsive surface." },
      { label: "Eligibility guardrails", detail: "Suppression rules applied before anything reaches the customer." },
    ],
  },
  relationship: {
    title: "Key features",
    items: [
      { label: "Grounded assistant", detail: "Answers built from this customer's own signals, not generic copy." },
      { label: "Proactive nudges", detail: "Life-event and financial signals prompt the right check-in." },
      { label: "Banker escalation", detail: "Complex threads hand off with full context attached." },
      { label: "Protection cues", detail: "Wellness and risk indicators surface before they become problems." },
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
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2">
          {!hasSelection ? (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg bg-slate-50/40 px-4 text-center">
              <p className="text-[11.5px] text-slate-400 leading-relaxed max-w-[220px]">
                Select a customer to see how this surface is personalized.
              </p>
            </div>
          ) : (
            config.items.map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "border border-slate-200 rounded-md bg-slate-50/50 px-2.5 py-2 transition-all duration-300",
                  revealed > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                )}
              >
                <div className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-500 mt-[1px] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-slate-900 leading-snug">{item.label}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <UnitEconomicsCard surface={surface} />
    </div>
  );
}
