import { CalendarHeart, Gift, ArrowRight, Repeat } from "lucide-react";
import type { VentusPriorityCard, VentusCardTone } from "@/lib/ventusPriorityCards";
import { cn } from "@/lib/utils";

interface InsightStripProps {
  cards: VentusPriorityCard[];
  onOpen?: (card: VentusPriorityCard) => void;
}

const TONE_STYLE: Record<VentusCardTone, { tone: string; icon: typeof Gift }> = {
  "life-event": { tone: "text-violet-700 bg-violet-50 border-violet-100", icon: CalendarHeart },
  offer: { tone: "text-blue-700 bg-blue-50 border-blue-100", icon: Gift },
  flow: { tone: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: Repeat },
};

export function InsightStrip({ cards, onOpen }: InsightStripProps) {
  if (cards.length === 0) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {cards.map((card) => {
          const style = TONE_STYLE[card.tone];
          const Icon = style.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onOpen?.(card)}
              className="min-w-0 px-4 py-3 flex gap-3 text-left hover:bg-slate-50/70 transition-colors group"
            >
              <div
                className={cn(
                  "shrink-0 w-7 h-7 rounded border flex items-center justify-center",
                  style.tone,
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">
                    {card.label}
                  </span>
                  <span className="text-[11px] text-slate-500 tabular-nums truncate">
                    {card.metric}
                  </span>
                </div>
                <div className="text-[13px] font-medium text-slate-900 leading-tight mt-0.5 truncate">
                  {card.headline}
                </div>
                <div className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                  {card.insight}
                </div>
                <span className="mt-1.5 text-[11px] text-blue-600 inline-flex items-center gap-0.5 group-hover:gap-1 transition-all">
                  {card.cta}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
