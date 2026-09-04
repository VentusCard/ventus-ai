import { useEffect, useState, type ComponentType } from "react";
import {
  Sparkles,
  Layers,
  MessageSquareText,
  Search,
  Clock,
  MapPin,
  Combine,
  CreditCard,
  Zap,
  Wrench,
  Palette,
  Smartphone,
  ShieldCheck,
  BadgePercent,
  ArrowRightLeft,
  Bot,
  Bell,
  UserPlus,
  Shield,
  MessagesSquare,
  Target,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LtvLiftSliver } from "./LtvLiftSliver";
import type { LtvLiftResult } from "@/lib/personalizationLtvLift";

export type Surface = "rewards" | "product" | "relationship";

type FeatureItem = {
  label: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
};

const FEATURES: Record<Surface, { title: string; items: FeatureItem[] }> = {
  rewards: {
    title: "Key features",
    items: [
      { label: "Context-specific curation", detail: "Collections built per signal group, each with its own reason line.", icon: Layers },
      { label: "Hyper-personalized messaging", detail: "Copy written to the customer's behavior, never generic offer text.", icon: MessageSquareText },
      { label: "Semantic deal search", detail: "Natural-language queries matched across the full catalog.", icon: Search },
      { label: "Timing intelligence", detail: "Expiring and in-season offers pushed ahead of the next spend window.", icon: Clock },
      { label: "Local Deals and Perks", detail: "Geo-targeted merchant discounts and place-based benefits surfaced by location.", icon: MapPin },
      { label: "Multiple Deal Aggregators", detail: "Owned, partner, and network offer sources combined into one coherent feed.", icon: Combine },
      { label: "Surface Financial Products", detail: "Relevant banking products woven into the rewards experience at the right moment.", icon: CreditCard },
    ],
  },
  product: {
    title: "Key features",
    items: [
      { label: "Signal-triggered recommendations", detail: "Every card names the behavior or life event behind it.", icon: Zap },
      { label: "Offer construction", detail: "Headline, benefits, eligibility and value range generated per customer.", icon: Wrench },
      { label: "Bank-brand customization", detail: "Visual treatment, tone, and CTA adapt to the bank's brand aesthetic while staying relevant to each customer.", icon: Palette },
      { label: "Channel-ready delivery", detail: "The same card renders in-app, as email, or as SMS.", icon: Smartphone },
      { label: "Eligibility pre-screening", detail: "Cards only surface when the customer's profile actually qualifies.", icon: ShieldCheck },
      { label: "Rate and term transparency", detail: "Estimated ranges shown up front, tuned to the customer's financial band.", icon: BadgePercent },
      { label: "Cross-sell sequencing", detail: "Products ordered so the next offer follows naturally from the last.", icon: ArrowRightLeft },
    ],
  },
  relationship: {
    title: "Key features",
    items: [
      { label: "Grounded assistant", detail: "Answers from this customer's signals, deals and detected events.", icon: Bot },
      { label: "Proactive nudges", detail: "Life-event and financial changes trigger the right check-in.", icon: Bell },
      { label: "Banker escalation", detail: "Hands off with full signal context attached.", icon: UserPlus },
      { label: "Protection cues", detail: "Wellness and habit-shift indicators surface early.", icon: Shield },
      { label: "Conversation memory", detail: "Follow-ups pick up where the last exchange left off, across sessions.", icon: MessagesSquare },
      { label: "Goal tracking", detail: "Stated goals stay attached to the thread and shape future guidance.", icon: Target },
      { label: "Privacy-first grounding", detail: "Answers drawn only from this customer's own consented data.", icon: Lock },
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
    <div className="lg:col-span-1 min-h-0 flex flex-col">
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
          {config.items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex-1 min-h-[64px] border border-slate-200 rounded-md bg-slate-50/50 px-3 py-2 transition-all duration-300",
                  !hasSelection || revealed > i
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1",
                )}
              >
                <div className="flex items-center gap-2.5 h-full">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                      hasSelection
                        ? "bg-blue-50 text-blue-500"
                        : "bg-slate-100 text-slate-400",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-[12.5px] font-semibold leading-snug",
                        hasSelection ? "text-slate-900" : "text-slate-500",
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
