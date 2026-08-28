import { useEffect, useState } from "react";
import { Activity, CalendarHeart, TrendingUp, Sparkles, Layers, ChevronLeft, ChevronRight, RefreshCw, FileJson, Users } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/campaign-studio";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/campaignStudioData";
import {
  type VariantBreakdown,
} from "@/lib/campaignCatalogVariants";
import { buildMessageCards, type MessageCard } from "./buildMessageCards";
import { buildSamplePayload } from "./buildSamplePayload";
import { MessageCopilot, allGuardrailsPass } from "../ai/MessageCopilot";

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 1 : 1)}K`;
  return n.toLocaleString();
}




// ── visuals ──────────────────────────────────────────────────────────────────

type AnchorVisual = {
  icon: React.ComponentType<{ className?: string }>;
  border: string;
  borderTone: string; // hex-ish slate for left block border
  iconBg: string;
  iconColor: string;
  dotBg: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  label: string;
};

const ANCHOR_VISUAL: Record<MessageCard["anchorFamily"], AnchorVisual> = {
  BEHAVIOR:         { icon: Layers,        border: "border-l-blue-400",    borderTone: "border-l-blue-400",    iconBg: "bg-blue-50",    iconColor: "text-blue-600",    dotBg: "bg-blue-500",    chipBg: "bg-blue-50",    chipBorder: "border-blue-200",    chipText: "text-blue-700",    label: "Spending behavior" },
  LIFE_EVENT:       { icon: CalendarHeart, border: "border-l-amber-400",   borderTone: "border-l-amber-400",   iconBg: "bg-amber-50",   iconColor: "text-amber-600",   dotBg: "bg-amber-500",   chipBg: "bg-amber-50",   chipBorder: "border-amber-200",   chipText: "text-amber-700",   label: "Life-event hook" },
  DEMOGRAPHIC:      { icon: TrendingUp,    border: "border-l-emerald-400", borderTone: "border-l-emerald-400", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", dotBg: "bg-emerald-500", chipBg: "bg-emerald-50", chipBorder: "border-emerald-200", chipText: "text-emerald-700", label: "Demographic fit" },
  FINANCIAL_SIGNAL: { icon: Activity,      border: "border-l-slate-400",   borderTone: "border-l-slate-400",   iconBg: "bg-slate-50",   iconColor: "text-slate-600",   dotBg: "bg-slate-500",   chipBg: "bg-slate-50",   chipBorder: "border-slate-200",   chipText: "text-slate-700",   label: "Financial signal" },
};

interface Props {
  product?: CatalogProduct;
  variants?: VariantBreakdown;
  offers?: string[];
  campaignLink?: string;
  onGuardrailChange?: (allPass: boolean) => void;
}

export function MessagePreviewsSection({ product, variants, offers = [], campaignLink = "", onGuardrailChange }: Props) {
  const productName = product?.name ?? "";

  const totalSlots = 5;

  // staggered reveal
  const [revealedCount, setRevealedCount] = useState(0);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [regenSeed, setRegenSeed] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);

  const handleRegenerate = () => {
    setRegenSeed((s) => s + 1);
    setFeaturedIdx(0);
    setIsSpinning(true);
    window.setTimeout(() => setIsSpinning(false), 400);
  };

  // Reset seed when product changes
  useEffect(() => { setRegenSeed(0); }, [productName]);

  const cards: MessageCard[] = product && variants
    ? buildMessageCards(product, variants, offers, campaignLink, regenSeed)
    : [];

  const guardrailsPass = cards.length > 0 && allGuardrailsPass(cards);
  useEffect(() => {
    onGuardrailChange?.(guardrailsPass);
  }, [guardrailsPass, onGuardrailChange]);



  useEffect(() => {
    setRevealedCount(0);
    setFeaturedIdx(0);
    if (!productName) return;
    const stepMs = 220;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < totalSlots; i++) {
      timers.push(setTimeout(() => setRevealedCount((c) => Math.max(c, i + 1)), i * stepMs));
    }
    return () => timers.forEach(clearTimeout);
  }, [productName, regenSeed]);

  // ── empty state ────────────────────────────────────────────────────────────
  if (!product || !variants) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 opacity-60">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
          <p className="text-sm font-semibold text-slate-900">Micro-Segment Personalized Campaign Output</p>
        </div>
        <p className="text-xs text-slate-500 text-center py-8">
          Pick a product above to preview the campaigns it can author.
        </p>
      </div>
    );
  }

  const shownCount = Math.min(totalSlots, cards.length);
  const revealedShown = Math.min(shownCount, revealedCount);
  const maxFeaturedIdx = Math.max(0, revealedShown - 1);
  const safeFeaturedIdx = Math.min(featuredIdx, maxFeaturedIdx);
  const featuredCard = cards[safeFeaturedIdx];
  const featuredVisual = featuredCard ? ANCHOR_VISUAL[featuredCard.anchorFamily] : ANCHOR_VISUAL.BEHAVIOR;

  const goPrev = () => {
    if (revealedShown <= 1) return;
    setFeaturedIdx((i) => (i - 1 + revealedShown) % revealedShown);
  };
  const goNext = () => {
    if (revealedShown <= 1) return;
    setFeaturedIdx((i) => (i + 1) % revealedShown);
  };

  const pad2 = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span>
        <p className="text-sm font-semibold text-slate-900">Micro-Segment Personalized Campaign Output</p>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={!product}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 transition-transform", isSpinning && "animate-spin")} />
          Regenerate
        </button>
      </div>

      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
          if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
        }}
        className="flex gap-4 focus:outline-none"
        aria-label="Campaign deck navigator"
      >
        {/* ── Prominent left counter ───────────────────────────────────── */}
        <div
          className={cn(
            "shrink-0 w-[160px] rounded-lg border border-slate-200 border-l-4 bg-white p-3 flex flex-col",
            featuredVisual.border,
          )}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Micro-segments
          </p>
          <p className="text-[44px] leading-none font-semibold tabular-nums text-slate-900 mt-1">
            {variants.total.toLocaleString()}
          </p>
          <div className="mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 transition-colors underline decoration-dotted decoration-slate-300 underline-offset-2"
                >
                  view logic
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={6}
                className="w-[360px] bg-white border-slate-200 text-slate-700 p-3"
              >
                <p className="text-[11px] font-semibold text-slate-900 mb-2">
                  Variation Logic:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <FormulaCell
                    label="Spending Behavior × plays"
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

          <div className="mt-auto pt-3 border-t border-slate-100">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Example
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[18px] leading-none font-mono tabular-nums text-slate-700">
                {pad2(safeFeaturedIdx + 1)}
              </span>
              <span className="text-[13px] leading-none font-mono tabular-nums text-slate-400">
                / {pad2(shownCount || 0)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug mt-1">
              shown below
            </p>
            {featuredCard?.estimatedReach ? (
              <div className="mt-2 flex items-center gap-1 text-slate-700">
                <Users className="w-3 h-3 text-slate-400" />
                <span className="text-[12px] font-semibold tabular-nums">
                  ~{formatReach(featuredCard.estimatedReach)}
                </span>
                <span className="text-[10px] text-slate-500">customers</span>
              </div>
            ) : null}

          </div>
        </div>


        {/* ── Right: family chip + arrows + fanned deck ────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            {featuredCard ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider",
                  featuredVisual.chipBg,
                  featuredVisual.chipBorder,
                  featuredVisual.chipText,
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", featuredVisual.dotBg)} />
                {featuredVisual.label}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Loading…</span>
            )}

            <div className="flex-1" />

            <button
              type="button"
              onClick={goPrev}
              disabled={revealedShown <= 1}
              className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous campaign"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={revealedShown <= 1}
              className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next campaign"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <FannedDeck
            cards={cards.slice(0, shownCount)}
            revealedCount={revealedShown}
            activeIdx={safeFeaturedIdx}
            onSelect={setFeaturedIdx}
          />
        </div>
      </div>

      <MessageCopilot
        cards={cards.slice(0, shownCount)}
        featuredIdx={safeFeaturedIdx}
        onSelect={setFeaturedIdx}
      />



      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={() => setSampleOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 hover:border-blue-700 transition-colors"
        >
          <FileJson className="w-3.5 h-3.5" />
          Sample Output
        </button>
      </div>

      <Dialog open={sampleOpen} onOpenChange={setSampleOpen}>
        <DialogContent className="max-w-2xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Sample Output</DialogTitle>
            <DialogDescription className="text-slate-500">
              CRM-ready audience payload for {product.name} — 5 sample sends.
            </DialogDescription>
          </DialogHeader>
          <pre className="font-mono text-[11px] text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-md max-h-[60vh] overflow-auto">
{JSON.stringify(buildSamplePayload(product, cards), null, 2)}
          </pre>
        </DialogContent>

      </Dialog>

    </div>
  );
}

// ── fanned deck ──────────────────────────────────────────────────────────────

function FannedDeck({
  cards,
  revealedCount,
  activeIdx,
  onSelect,
}: {
  cards: MessageCard[];
  revealedCount: number;
  activeIdx: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <div
      className="relative w-full"
      style={{ minHeight: 300, perspective: "1200px" }}
    >
      {cards.map((card, idx) => {
        const visual = ANCHOR_VISUAL[card.anchorFamily];
        const isRevealed = idx < revealedCount;
        const offset = idx - activeIdx; // negative = behind-left, positive = behind-right
        const abs = Math.abs(offset);

        // Active card on top; further cards step further behind.
        const translateX = offset * 22; // px
        const translateY = abs * 14;    // px
        const rotate = offset * 2.4;    // deg
        const scale = 1 - abs * 0.035;
        const opacity = isRevealed ? Math.max(0.45, 1 - abs * 0.18) : 0;
        const zIndex = 50 - abs;
        const isActive = offset === 0;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(idx)}
            aria-label={isActive ? "Active campaign" : `Bring campaign ${idx + 1} to front`}
            aria-current={isActive}
            tabIndex={isActive ? 0 : -1}
            className={cn(
              "absolute left-0 right-0 mx-auto text-left rounded-lg border border-slate-200 border-l-4 bg-white p-4 flex flex-col transition-all duration-300 ease-out",
              visual.border,
              isActive ? "shadow-md cursor-default" : "shadow-sm cursor-pointer hover:-translate-y-1",
            )}
            style={{
              top: 0,
              maxWidth: 640,
              transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg) scale(${scale})`,
              transformOrigin: "center top",
              opacity,
              zIndex,
              pointerEvents: isRevealed ? "auto" : "none",
            }}
          >
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-white">
                {card.play}
              </span>
              <span
                className="text-[10px] font-medium text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 truncate max-w-[280px]"
                title={card.anchor}
              >
                {card.anchor}
              </span>
              {card.estimatedReach ? (
                <span
                  className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 bg-white tabular-nums"
                  title="Estimated eligible customers"
                >
                  <Users className="w-3 h-3 text-slate-400" />
                  ~{formatReach(card.estimatedReach)} reach
                </span>
              ) : null}
            </div>


            <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 mb-2">
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Subject</p>
              <p className="text-sm font-semibold text-slate-900 leading-snug">{card.subject}</p>
            </div>

            <p className="text-[12px] text-slate-700 leading-relaxed mb-3">{card.body}</p>

            <div className="flex items-center justify-between gap-3 flex-wrap mt-auto">
              {card.ctaHref ? (
                <a
                  href={card.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  tabIndex={isActive ? 0 : -1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors no-underline"
                >
                  {card.cta}
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-semibold">
                  {card.cta}
                </span>
              )}

              <div className="flex items-start gap-1.5 min-w-0">
                <Sparkles className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-snug">{card.why}</p>
              </div>
            </div>
          </button>
        );
      })}
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
