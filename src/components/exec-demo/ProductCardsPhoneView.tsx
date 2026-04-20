import { useState, useEffect, useRef, TouchEvent } from "react";
import { ChevronRight, ChevronLeft, Check, Plane, GraduationCap, Home, TrendingUp, Heart, ShoppingBag, Utensils, Dumbbell, Music, Briefcase, Leaf, Star } from "lucide-react";

export interface ProductCard {
  type: "behavioral" | "life_event";
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

const THEME_STYLES: Record<string, { accent: string; text: string; icon: typeof Plane }> = {
  travel: { accent: "#3b82f6", text: "#1e3a5f", icon: Plane },
  dining: { accent: "#f59e0b", text: "#92400e", icon: Utensils },
  fitness: { accent: "#10b981", text: "#065f46", icon: Dumbbell },
  shopping: { accent: "#ec4899", text: "#9d174d", icon: ShoppingBag },
  entertainment: { accent: "#8b5cf6", text: "#4c1d95", icon: Music },
  home: { accent: "#10b981", text: "#065f46", icon: Home },
  education: { accent: "#6366f1", text: "#3730a3", icon: GraduationCap },
  retirement: { accent: "#f59e0b", text: "#92400e", icon: TrendingUp },
  family: { accent: "#f472b6", text: "#9d174d", icon: Heart },
  business: { accent: "#0ea5e9", text: "#0c4a6e", icon: Briefcase },
  wellness: { accent: "#14b8a6", text: "#115e59", icon: Leaf },
  lifestyle: { accent: "#64748b", text: "#334155", icon: Star },
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

              return (
                <div key={i} className="w-full shrink-0 px-1">
                  <div
                    className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col"
                    style={{ borderTop: `3px solid ${style.accent}` }}
                  >
                    <div className={`${compact ? "p-2.5" : "p-3"} flex flex-col flex-1`}>
                      <p className="text-[12px] font-bold text-slate-800 leading-tight mb-1 line-clamp-2">{card.product_name}</p>
                      <p className="text-[10px] text-slate-500 italic leading-snug mb-2 line-clamp-3">"{card.quote}"</p>
                      <div className="space-y-1 mb-2 flex-1">
                        {benefits.map((b, bi) => (
                          <div key={bi} className="flex items-start gap-1.5">
                            <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: style.accent }} />
                            <span className="text-[10px] text-slate-600 leading-snug">{b}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-bold mb-1.5 leading-tight" style={{ color: style.accent }}>
                        Est. {value}
                      </p>
                      <button
                        className="w-full py-1.5 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-0.5"
                        style={{ background: style.accent }}
                      >
                        Learn More <ChevronRight className="w-3 h-3" />
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
