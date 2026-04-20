import { Fragment } from "react";
import { ChevronRight, Check, Plane, GraduationCap, Home, TrendingUp, Heart, ShoppingBag, Utensils, Dumbbell, Music, Briefcase, Leaf, Star } from "lucide-react";

export interface ProductCard {
  type: "behavioral" | "life_event";
  product_name: string;
  quote: string;
  signal_label: string;
  theme: string;
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
  customerName: string;
}

export default function ProductCardsPhoneView({ cards }: Props) {
  if (!cards.length) return null;

  // Show exactly two cards side by side
  const displayCards = cards.slice(0, 2);

  return (
    <div className="px-2 py-3">
      <div className="flex items-stretch">
        {displayCards.map((card, i) => {
          const style = THEME_STYLES[card.theme] || THEME_STYLES.lifestyle;
          const benefits = (THEME_BENEFITS[card.theme] || THEME_BENEFITS.lifestyle).slice(0, 3);
          const value = THEME_VALUE[card.theme] || THEME_VALUE.lifestyle;
          const isFirst = i === 0;

          return (
            <Fragment key={i}>
              {!isFirst && (
                <div
                  className="w-px bg-slate-200 mx-1 self-stretch"
                  aria-hidden
                />
              )}
              <div className="flex-1 min-w-0">
                <div
                  className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col"
                  style={{
                    borderTop: `3px solid ${style.accent}`,
                    animation: `phone-card-reveal 0.4s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <div className="p-2.5 flex flex-col flex-1">
                    <p className="text-[11px] font-bold text-slate-800 leading-tight mb-1 line-clamp-2">{card.product_name}</p>
                    <p className="text-[9px] text-slate-500 italic leading-snug mb-1.5 line-clamp-3">"{card.quote}"</p>
                    <div className="space-y-1 mb-2 flex-1">
                      {benefits.map((b, bi) => (
                        <div key={bi} className="flex items-start gap-1">
                          <Check className="w-2.5 h-2.5 mt-0.5 shrink-0" style={{ color: style.accent }} />
                          <span className="text-[9px] text-slate-600 leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] font-bold mb-1.5 leading-tight" style={{ color: style.accent }}>
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
            </Fragment>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[9px] text-slate-300 text-center px-4 mt-2">
        Recommendations based on your financial profile
      </p>

      <style>{`
        @keyframes phone-card-reveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
