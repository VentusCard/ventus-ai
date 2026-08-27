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

/**
 * Keep the quote a complete thought. If copy runs past the space the card can
 * show, trim back to the last sentence boundary that fits rather than cutting
 * mid-word. Applies to live-generated and cached snapshot copy alike.
 */
const QUOTE_MAX_CHARS = 165;

export function fitQuote(raw: string): string {
  const text = (raw || "").trim().replace(/\s+/g, " ");
  if (text.length <= QUOTE_MAX_CHARS) return text;

  const window = text.slice(0, QUOTE_MAX_CHARS + 1);
  const lastSentence = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! "),
  );
  if (lastSentence > 60) return text.slice(0, lastSentence + 1).trim();

  // No usable sentence break — end cleanly on a word boundary.
  const lastSpace = window.lastIndexOf(" ");
  const clipped = text.slice(0, lastSpace > 60 ? lastSpace : QUOTE_MAX_CHARS).trim();
  return clipped.replace(/[,;:\-—]$/, "") + "…";
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
    <div className={compact ? "px-2 py-1" : "px-2 py-3"}>
      <div className="relative">
        {/* Slider viewport */}
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {cards.map((card, i) => {
              const style = THEME_STYLES[card.theme] || THEME_STYLES.lifestyle;
              const benefits = (THEME_BENEFITS[card.theme] || THEME_BENEFITS.lifestyle).slice(0, 3);
              const value = THEME_VALUE[card.theme] || THEME_VALUE.lifestyle;
              const ThemeIcon = style.icon;

              return (
                <div key={i} className="w-full shrink-0 px-1 h-full">
                  <div
                    className="rounded-2xl shadow-md overflow-hidden h-full flex flex-col"
                    style={{ background: style.gradient, borderTop: `3px solid ${style.accent}` }}
                  >
                    <div className={`${compact ? "p-4 gap-2.5" : "p-5 gap-2.5"} flex flex-col flex-1`}>
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`${compact ? "w-9 h-9" : "w-9 h-9"} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}
                          style={{ background: "rgba(255,255,255,0.75)", color: style.accent }}
                        >
                          <ThemeIcon className={`${compact ? "w-4.5 h-4.5" : "w-5 h-5"}`} />
                        </div>
                        <p className={`font-bold text-slate-800 leading-tight line-clamp-2 flex-1 ${compact ? "text-[14px]" : "text-[15px]"}`}>{card.product_name}</p>
                      </div>
                      <p className={`text-slate-600 italic leading-snug ${compact ? "text-[12px] line-clamp-3" : "text-[12px] line-clamp-3"}`}>"{card.quote}"</p>
                      <div className="space-y-1.5 flex-1">
                        {benefits.map((b, bi) => (
                          <div key={bi} className="flex items-start gap-2">
                            <Check className={`mt-0.5 shrink-0 ${compact ? "w-3.5 h-3.5" : "w-3.5 h-3.5"}`} style={{ color: style.accent }} />
                            <span className={`text-slate-700 leading-snug font-medium ${compact ? "text-[12px]" : "text-[12px]"}`}>{b}</span>
                          </div>
                        ))}
                      </div>
                      <p className={`font-bold leading-tight ${compact ? "text-[12px]" : "text-[12px]"}`} style={{ color: style.accent }}>
                        Est. {value}
                      </p>
                      <button
                        className={`w-full rounded-xl font-bold text-white flex items-center justify-center gap-1 shadow-sm ${compact ? "py-2.5 text-[12px]" : "py-2.5 text-[12px]"}`}
                        style={{ background: style.accent }}
                      >
                        Learn More <ChevronRight className={`${compact ? "w-3.5 h-3.5" : "w-3.5 h-3.5"}`} />
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

      {/* Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to card ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-slate-700" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
            />
          ))}
        </div>
      )}

      {!compact && (
        <p className="text-[9px] text-slate-300 text-center px-4 mt-2">
          Recommendations based on your financial profile
        </p>
      )}
    </div>
  );
}
