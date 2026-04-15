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
  travel: ["3X points on travel & dining", "No foreign transaction fees", "$100 annual travel credit"],
  dining: ["4X points at restaurants", "Complimentary DashPass", "$50 dining credit annually"],
  fitness: ["Gym membership credits", "Wellness reward multipliers", "Wearable purchase cashback"],
  shopping: ["5% cashback on select retail", "Extended warranty protection", "Price-match guarantee"],
  entertainment: ["3X on streaming & events", "Early-access concert tickets", "Annual entertainment credit"],
  home: ["Competitive HELOC rates", "No closing costs", "Rate lock guarantee"],
  education: ["Tax-advantaged growth", "Flexible investment options", "Low account minimums"],
  retirement: ["Tax-efficient withdrawals", "Personalized glide path", "Fee-free advisory sessions"],
  family: ["Family spending insights", "Child account linking", "College savings match"],
  business: ["2% cashback on operations", "Expense management tools", "Higher credit limits"],
  wellness: ["HSA contribution matching", "Preventive care rewards", "Mental health benefits"],
  lifestyle: ["Preferred rates across products", "Priority customer service", "Annual loyalty bonus"],
};

const THEME_VALUE: Record<string, string> = {
  travel: "$450–$680/yr in travel rewards",
  dining: "$220–$340/yr in dining cashback",
  fitness: "$180–$260/yr in wellness credits",
  shopping: "$300–$520/yr in retail cashback",
  entertainment: "$200–$380/yr in entertainment value",
  home: "Save $3,200+ in closing costs",
  education: "Tax-free growth up to $10K/yr",
  retirement: "Save $1,800+/yr in advisory fees",
  family: "$280–$450/yr in family benefits",
  business: "$600–$1,200/yr in cashback",
  wellness: "$240–$400/yr in health savings",
  lifestyle: "$150–$300/yr in loyalty rewards",
};

interface Props {
  cards: ProductCard[];
  customerName: string;
}

export default function ProductCardsPhoneView({ cards, customerName }: Props) {
  const firstName = customerName.split(" ")[0];
  const sortedCards = [...cards].sort((a, b) => a.type === 'life_event' ? -1 : b.type === 'life_event' ? 1 : 0);

  return (
    <div className="px-3 py-3 space-y-3">

      {/* Cards */}
      {sortedCards.map((card, i) => {
        const style = THEME_STYLES[card.theme] || THEME_STYLES.lifestyle;
        const Icon = style.icon;
        const benefits = THEME_BENEFITS[card.theme] || THEME_BENEFITS.lifestyle;
        const value = THEME_VALUE[card.theme] || THEME_VALUE.lifestyle;

        return (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
            style={{
              borderLeft: `3px solid ${style.accent}`,
              animation: `phone-card-reveal 0.4s ease-out ${i * 0.18}s both`,
            }}
          >
            <div className="p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color: style.accent }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: style.accent }}>
                  {card.signal_label}
                </span>
              </div>
              <p className="text-[13px] font-bold text-slate-800 leading-snug mb-1">{card.product_name}</p>
              <p className="text-[11px] text-slate-500 italic leading-relaxed mb-2">"{card.quote}"</p>
              <div className="space-y-1.5 mb-2">
                {benefits.map((b, bi) => (
                  <div key={bi} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: style.accent }} />
                    <span className="text-[11px] text-slate-600 leading-snug">{b}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-bold mb-2.5" style={{ color: style.accent }}>Est. value: {value}</p>
              <button className="w-full py-2 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-1" style={{ background: style.accent }}>
                Learn More <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      <p className="text-[9px] text-slate-300 text-center px-4">
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
