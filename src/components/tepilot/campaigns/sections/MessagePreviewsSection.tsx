import { useEffect, useState } from "react";
import { Activity, CalendarHeart, TrendingUp, Sparkles, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/campaign-studio";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/campaignStudioData";
import {
  type VariantBreakdown,
  CATALOG_GRAND_TOTAL,
} from "@/lib/campaignCatalogVariants";
import { buildMessageCards, type MessageCard } from "./buildMessageCards";

// ── visuals ──────────────────────────────────────────────────────────────────

const ANCHOR_VISUAL: Record<
  MessageCard["anchorFamily"],
  {
    icon: React.ComponentType<{ className?: string }>;
    border: string;
    iconBg: string;
    iconColor: string;
    label: string;
  }
> = {
  STACK:      { icon: Layers,        border: "border-l-blue-400",    iconBg: "bg-blue-50",    iconColor: "text-blue-600",    label: "Category stack" },
  LIFE_EVENT: { icon: CalendarHeart, border: "border-l-amber-400",   iconBg: "bg-amber-50",   iconColor: "text-amber-600",   label: "Life-event hook" },
  GOAL:       { icon: TrendingUp,    border: "border-l-emerald-400", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", label: "Financial-goal hook" },
  USAGE:      { icon: Activity,      border: "border-l-slate-400",   iconBg: "bg-slate-50",   iconColor: "text-slate-600",   label: "Activation nudge" },
};

interface Props {
  product?: CatalogProduct;
  variants?: VariantBreakdown;
  offers?: string[];
  campaignLink?: string;
}

export function MessagePreviewsSection({ product, variants, offers = [], campaignLink = "" }: Props) {
  const productName = product?.name ?? "";
  const cards: MessageCard[] = product && variants ? buildMessageCards(product, variants, offers, campaignLink) : [];


  const totalSlots = 5;

  // staggered reveal
  const [revealedCount, setRevealedCount] = useState(0);
  useEffect(() => {
    setRevealedCount(0);
    if (!productName) return;
    const stepMs = 220;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < totalSlots; i++) {
      timers.push(setTimeout(() => setRevealedCount((c) => Math.max(c, i + 1)), i * stepMs));
    }
    return () => timers.forEach(clearTimeout);
  }, [productName]);

  // ── empty state ────────────────────────────────────────────────────────────
  if (!product || !variants) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 opacity-60">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
          <p className="text-sm font-semibold text-slate-900">Personalized message previews</p>
        </div>
        <p className="text-xs text-slate-500 text-center py-8">
          Pick a product above to preview the campaigns it can author.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
        <p className="text-sm font-semibold text-slate-900">Personalized message previews</p>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="ml-auto">
              <Badge
                variant="outline"
                className="text-[10px] border-slate-200 bg-white tabular-nums cursor-pointer hover:bg-slate-50 transition-colors"
              >
                {variants.total.toLocaleString()} campaigns · {Math.min(totalSlots, cards.length)} shown
              </Badge>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="w-[360px] bg-white border-slate-200 text-slate-700 p-3"
          >
            <p className="text-[11px] font-semibold text-slate-900 mb-2">
              Variation Logic:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <FormulaCell
                label="Category stacks × plays"
                value={variants.stacks > 0 ? variants.stacks * variants.plays : 0}
                note={variants.stacks > 0 ? `${variants.stacks} × ${variants.plays}` : "not category-bearing"}
                tone="blue"
              />
              <FormulaCell
                label="Life-event hooks"
                value={variants.lifeEvents}
                note="one per qualifying event"
                tone="amber"
              />
              <FormulaCell
                label="Financial-goal hooks"
                value={variants.financialGoals}
                note="one per qualifying goal"
                tone="emerald"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: totalSlots }).map((_, idx) => {
          const card = cards[idx];
          const isRevealed = idx < revealedCount;

          if (!card) {
            return (
              <div
                key={idx}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3 flex items-center justify-center text-center"
                style={{ minHeight: 240 }}
              >
                <p className="text-[10px] text-slate-400 leading-snug">
                  No further anchors for this product —<br />
                  <span className="text-slate-500">honest small numbers</span>
                </p>
              </div>
            );
          }

          const visual = ANCHOR_VISUAL[card.anchorFamily];

          if (!isRevealed) {
            return (
              <div
                key={idx}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50"
                style={{ minHeight: 240 }}
                aria-hidden
              />
            );
          }

          const Icon = visual.icon;
          return (
            <div
              key={idx}
              className={cn(
                "rounded-lg border border-slate-200 border-l-4 bg-white p-3 flex flex-col animate-fade-in",
                visual.border,
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("flex items-center justify-center w-6 h-6 rounded-md shrink-0", visual.iconBg)}>
                  <Icon className={cn("w-3.5 h-3.5", visual.iconColor)} />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 truncate">
                  {visual.label}
                </p>
              </div>

              <div className="mb-2 flex flex-wrap gap-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-white">
                  {card.play}
                </span>
                <span
                  className="text-[9px] font-medium text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 truncate max-w-[140px]"
                  title={card.anchor}
                >
                  {card.anchor}
                </span>
              </div>

              <div className="rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 mb-2">
                <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Subject</p>
                <p className="text-xs font-semibold text-slate-900 leading-snug">{card.subject}</p>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed mb-3 flex-1">{card.body}</p>

              <button className="self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-semibold hover:bg-slate-800 transition-colors mb-2">
                {card.cta}
              </button>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-start gap-1.5">
                  <Sparkles className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-500 leading-snug">{card.why}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span>
          Catalog total · <span className="font-mono text-slate-700">{CATALOG_GRAND_TOTAL.toLocaleString()}</span> distinct
          campaigns across 44 products
        </span>
        <span className="font-mono">
          {PRODUCT_CATEGORY_LABELS[product.category]} · {variants.total.toLocaleString()} campaigns
        </span>
      </div>
    </div>
  );
}

function FormulaCell({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: number;
  note: string;
  tone: "blue" | "amber" | "emerald";
}) {
  const toneMap = {
    blue: "border-blue-200 bg-blue-50/40",
    amber: "border-amber-200 bg-amber-50/40",
    emerald: "border-emerald-200 bg-emerald-50/40",
  };
  return (
    <div className={cn("rounded-md border p-2", toneMap[tone])}>
      <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className="text-lg font-mono font-semibold text-slate-900 tabular-nums leading-tight">{value}</p>
      <p className="text-[9px] text-slate-500 leading-snug">{note}</p>
    </div>
  );
}
