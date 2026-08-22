import { CalendarHeart, Gift, Repeat, ArrowRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRIORITY_ACTION,
  getPriorityPrompt,
  type VentusCardTone,
  type VentusPriorityCard,
} from "@/lib/ventusPriorityCards";

const TONE_STYLE: Record<VentusCardTone, { tone: string; icon: typeof Gift }> = {
  "life-event": { tone: "text-violet-700 bg-violet-50 border-violet-100", icon: CalendarHeart },
  offer: { tone: "text-blue-700 bg-blue-50 border-blue-100", icon: Gift },
  flow: { tone: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: Repeat },
};

interface PriorityBriefingProps {
  cards: VentusPriorityCard[];
  /** Ask Ventus to expand on one priority in the transcript. */
  onAsk: (prompt: string) => void;
  /** Deep-link to the destination that acts on the priority. */
  onOpenOpportunity?: (opportunityId: string) => void;
  onNavigate?: (tab: string) => void;
}

/**
 * Ventus delivers the book's priorities as its opening turn — replaces the
 * standalone priority cards that used to sit on the Intelligence Database.
 */
export function PriorityBriefing({
  cards,
  onAsk,
  onOpenOpportunity,
  onNavigate,
}: PriorityBriefingProps) {
  if (cards.length === 0) return null;

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
        <span className="text-[12px] font-black leading-none text-white">V</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-relaxed text-slate-800">
          <span className="font-semibold">{cards.length} priorities in your book right now.</span>{" "}
          Each one is a signal Ventus already detected in enriched transactions — the segment,
          the addressable value, and the next step are below.
        </p>

        <div className="mt-3 space-y-2">
          {cards.map((card) => {
            const style = TONE_STYLE[card.tone];
            const Icon = style.icon;
            const action = PRIORITY_ACTION[card.tone];
            return (
              <div
                key={card.id}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border",
                      style.tone,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        {card.label}
                      </span>
                      <span className="truncate text-[11px] tabular-nums text-slate-500">
                        {card.metric}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[13px] font-medium leading-tight text-slate-900">
                      {card.headline}
                    </div>
                    <p className="mt-1 text-[11.5px] leading-snug text-slate-500">{card.insight}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onAsk(getPriorityPrompt(card))}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Brief me on this
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (card.opportunityId && onOpenOpportunity) {
                            onOpenOpportunity(card.opportunityId);
                            return;
                          }
                          onNavigate?.(action.tab);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-slate-800"
                      >
                        {card.opportunityId ? "Open the briefing report" : action.label}
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
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
