import { useState, useEffect, useRef, TouchEvent } from "react";
import { ChevronRight, ChevronLeft, Check, Plane, GraduationCap, Home, TrendingUp, Heart, ShoppingBag, Utensils, Dumbbell, Music, Briefcase, Leaf, Star } from "lucide-react";

export interface ProductCard {
  type: "behavioral" | "life_event" | "financial_signal";
  product_name: string;
  quote: string;
  signal_label: string;
  theme: string;
  offer_headline?: string;
  benefits?: string[];
  eligibility?: string;
  cta?: string;
  cta_sub?: string;
}

/**
 * Signal-family palette — mirrors SIGNAL_FAMILY_META in customerDirectoryData.ts.
 * Cards are colored by the family that produced them, not by lifestyle theme.
 * Rose is reserved for risk and is display-only (the generator never emits risk cards).
 */
export const FAMILY_STYLES: Record<string, { accent: string; label: string; gradient: string }> = {
  behavioral: {
    accent: "#2563eb",
    label: "Behavioral",
    gradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0f2fe 100%)",
  },
  life_event: {
    accent: "#f59e0b",
    label: "Life Event",
    gradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)",
  },
  financial_signal: {
    accent: "#10b981",
    label: "Financial Signal",
    gradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #f0fdfa 100%)",
  },
  demographic: {
    accent: "#8b5cf6",
    label: "Demographic",
    gradient: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%)",
  },
  risk: {
    accent: "#f43f5e",
    label: "Risk",
    gradient: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fef2f2 100%)",
  },
};

/** Resolve the family styling for a card; falls back to behavioral (blue). */
export function familyStyle(type: string | undefined) {
  return FAMILY_STYLES[type || ""] || FAMILY_STYLES.behavioral;
}

export const THEME_STYLES: Record<string, { accent: string; text: string; icon: typeof Plane; gradient: string }> = {
  travel: { accent: "#3b82f6", text: "#1e3a5f", icon: Plane, gradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0f2fe 100%)" },
  dining: { accent: "#f59e0b", text: "#92400e", icon: Utensils, gradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)" },
  fitness: { accent: "#10b981", text: "#065f46", icon: Dumbbell, gradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #f0fdfa 100%)" },
  shopping: { accent: "#ec4899", text: "#9d174d", icon: ShoppingBag, gradient: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fff1f2 100%)" },
  entertainment: { accent: "#8b5cf6", text: "#4c1d95", icon: Music, gradient: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%)" },
  home: { accent: "#10b981", text: "#065f46", icon: Home, gradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #f0fdf4 100%)" },
  education: { accent: "#6366f1", text: "#3730a3", icon: GraduationCap, gradient: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #f5f3ff 100%)" },
  retirement: { accent: "#f59e0b", text: "#92400e", icon: TrendingUp, gradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fefce8 100%)" },
  family: { accent: "#f472b6", text: "#9d174d", icon: Heart, gradient: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fff1f2 100%)" },
  business: { accent: "#0ea5e9", text: "#0c4a6e", icon: Briefcase, gradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ecfeff 100%)" },
  wellness: { accent: "#14b8a6", text: "#115e59", icon: Leaf, gradient: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #ecfdf5 100%)" },
  lifestyle: { accent: "#64748b", text: "#334155", icon: Star, gradient: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f9fafb 100%)" },
};

const THEME_BENEFITS: Record<string, string[]> = {
  travel: ["3X points on travel", "No FX fees", "$100 travel credit"],
  dining: ["4X at restaurants", "DashPass included", "$50 dining credit"],
  fitness: ["Gym credits", "Wellness multipliers", "Wearable cashback"],
  shopping: ["5% select retail", "Extended warranty", "Price-match"],
  entertainment: ["3X streaming & events", "Early ticket access", "Annual credit"],
  home: ["Competitive HELOC", "No closing costs", "Rate lock"],
  education: ["Tax-advantaged growth", "Flexible options", "Low minimums"],
  retirement: ["Tax-efficient withdrawals", "Custom glide path", "Fee-free advice"],
  family: ["Family insights", "Child accounts", "529 match"],
  business: ["2% cashback", "Expense tools", "Higher limits"],
  wellness: ["HSA matching", "Preventive rewards", "Mental health"],
  lifestyle: ["Preferred rates", "Priority service", "Loyalty bonus"],
};

const THEME_VALUE: Record<string, string> = {
  travel: "$450–$680/yr",
  dining: "$220–$340/yr",
  fitness: "$180–$260/yr",
  shopping: "$300–$520/yr",
  entertainment: "$200–$380/yr",
  home: "Save $3,200+",
  education: "$10K/yr tax-free",
  retirement: "Save $1,800+/yr",
  family: "$280–$450/yr",
  business: "$600–$1,200/yr",
  wellness: "$240–$400/yr",
  lifestyle: "$150–$300/yr",
};

const THEME_CTA: Record<string, string> = {
  travel: "Plan Your Trip",
  dining: "Start Earning",
  fitness: "Claim Your Perk",
  shopping: "Unlock Rewards",
  entertainment: "Get Early Access",
  home: "Check Your Equity",
  education: "Open a Plan",
  retirement: "Review Your Plan",
  family: "Set Up Family",
  business: "Grow Your Business",
  wellness: "Start Your Benefit",
  lifestyle: "See Your Offer",
};

/** Full CTA label — never truncated; the button steps type size down instead. */
export function fitCta(raw: string | undefined, theme: string): string {
  const text = (raw || "").trim().replace(/\s+/g, " ").replace(/[.!]+$/, "");
  return text || THEME_CTA[theme] || "Learn More";
}

/** Step the CTA type size down so long labels still fit on one line. */
export function ctaSizeClass(label: string): string {
  if (label.length > 26) return "text-[10.5px]";
  if (label.length > 20) return "text-[11px]";
  return "text-[12px]";
}

/** Step the product-name type size down instead of clamping to an ellipsis. */
export function nameSizeClass(name: string, compact: boolean): string {
  const len = (name || "").length;
  if (len > 38) return compact ? "text-[12.5px]" : "text-[13px]";
  if (len > 28) return compact ? "text-[13px]" : "text-[14px]";
  return compact ? "text-[14px]" : "text-[15px]";
}

/** Keep every card to one complete, display-safe sentence. Never add ellipses. */
const QUOTE_MAX_CHARS = 90;

export function fitQuote(raw: string): string {
  const text = (raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^["“”']+|["“”']+$/g, "");
  if (text.length <= QUOTE_MAX_CHARS) {
    if (!text || /[.!?]$/.test(text)) return text;
    return text.length < QUOTE_MAX_CHARS ? `${text}.` : text;
  }

  // Preserve the meaning of the previously cached external-transfer card.
  if (/external transfers|managed portfolio/i.test(text)) {
    return "A managed portfolio could simplify transfers and add an estimated $1,200 yearly.";
  }

  const completeSentences = text.match(/[^.!?]+[.!?]+/g) ?? [];
  const sentence = completeSentences
    .map((part) => part.trim())
    .find((part) => part.length <= QUOTE_MAX_CHARS);
  if (sentence) return sentence;

  // Live output is normalized server-side, but this protects stale cached data
  // without ever presenting a chopped-off thought.
  const amount = text.match(/\$[\d,.]+(?:K|M)?/i)?.[0];
  if (amount) {
    return `This option could deliver an estimated ${amount} in value for your next step.`;
  }
  return "A tailored option can support your next financial step.";
}

interface Props {
  cards: ProductCard[];
  customerName?: string;
  compact?: boolean;
}

export default function ProductCardsPhoneView({ cards, compact = false }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = cards.length;

  // Auto-advance
  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 6000);
    return () => clearInterval(id);
  }, [paused, total]);

  // Reset index if card list shrinks
  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [total, index]);

  if (!cards.length) return null;

  const goTo = (i: number) => {
    setPaused(true);
    setIndex(((i % total) + total) % total);
  };
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <div className={compact ? "h-full px-2 py-1" : "px-2 py-3"}>
      <div className={compact ? "relative h-full" : "relative"}>
        {/* Slider viewport */}
        <div
          className={compact ? "overflow-hidden h-full" : "overflow-hidden"}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className={`flex transition-transform duration-500 ease-out ${compact ? "h-full" : ""}`}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {cards.map((card, i) => {
              const theme = THEME_STYLES[card.theme] || THEME_STYLES.lifestyle;
              const fam = familyStyle(card.type);
              const benefits = (card.benefits?.length ? card.benefits : THEME_BENEFITS[card.theme] || THEME_BENEFITS.lifestyle).slice(0, 3);
              const value = THEME_VALUE[card.theme] || THEME_VALUE.lifestyle;
              const ThemeIcon = theme.icon;
              const cta = fitCta(card.cta, card.theme);

              return (
                <div key={i} className="w-full shrink-0 px-1 h-full">
                  <div
                    className="rounded-2xl shadow-md overflow-hidden h-full flex flex-col"
                    style={{ background: fam.gradient, borderTop: `3px solid ${fam.accent}` }}
                  >
                    <div className={`${compact ? "p-4 grid grid-rows-[auto_auto_minmax(0,1fr)_auto_auto] gap-2.5" : "p-5 gap-2.5 flex flex-col"} flex-1 min-h-0`}>
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`${compact ? "w-9 h-9" : "w-9 h-9"} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}
                          style={{ background: "rgba(255,255,255,0.75)", color: fam.accent }}
                        >
                          <ThemeIcon className={`${compact ? "w-4.5 h-4.5" : "w-5 h-5"}`} />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center">
                          <p className={`font-bold text-slate-800 leading-tight ${nameSizeClass(card.product_name, compact)}`}>{card.product_name}</p>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed shrink-0 text-[12.5px]">{fitQuote(card.quote)}</p>
                      <div className="flex flex-col justify-evenly gap-1.5 min-h-0 pt-2 border-t border-black/5">
                        {benefits.map((b, bi) => (
                          <div key={bi} className="flex items-start gap-2">
                            <Check className="mt-0.5 shrink-0 w-3.5 h-3.5" style={{ color: fam.accent }} />
                            <span className="text-slate-700 leading-snug font-medium text-[12px]">{b}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-bold leading-tight text-[13px]" style={{ color: fam.accent }}>
                        Est. {value}
                      </p>
                      <button
                        className="w-full rounded-xl font-bold text-white flex items-center justify-center gap-1.5 shadow-sm py-2.5 px-2"
                        style={{ background: fam.accent }}
                      >
                        <span className={`whitespace-nowrap ${ctaSizeClass(cta)}`}>{cta}</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chevrons */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center hover:bg-white"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center hover:bg-white"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </>
        )}
      </div>

      {!compact && (
        <p className="text-[9px] text-slate-300 text-center px-4 mt-2">
          Recommendations based on your financial profile
        </p>
      )}
    </div>
  );
}
