import { ChevronRight, Sparkles, Plane, GraduationCap, Home, TrendingUp, Heart, ShoppingBag, Utensils, Dumbbell, Music, Briefcase, Leaf, Star } from "lucide-react";

export interface ProductCard {
  type: "behavioral" | "life_event";
  product_name: string;
  quote: string;
  signal_label: string;
  theme: string;
}

const THEME_STYLES: Record<string, { bg: string; accent: string; text: string; icon: typeof Plane }> = {
  travel: { bg: "#eef6ff", accent: "#3b82f6", text: "#1e3a5f", icon: Plane },
  dining: { bg: "#fef3e2", accent: "#f59e0b", text: "#92400e", icon: Utensils },
  fitness: { bg: "#ecfdf5", accent: "#10b981", text: "#065f46", icon: Dumbbell },
  shopping: { bg: "#fdf2f8", accent: "#ec4899", text: "#9d174d", icon: ShoppingBag },
  entertainment: { bg: "#f5f3ff", accent: "#8b5cf6", text: "#4c1d95", icon: Music },
  home: { bg: "#ecfdf5", accent: "#10b981", text: "#065f46", icon: Home },
  education: { bg: "#eef2ff", accent: "#6366f1", text: "#3730a3", icon: GraduationCap },
  retirement: { bg: "#fff7ed", accent: "#f59e0b", text: "#92400e", icon: TrendingUp },
  family: { bg: "#fdf2f8", accent: "#f472b6", text: "#9d174d", icon: Heart },
  business: { bg: "#f0f9ff", accent: "#0ea5e9", text: "#0c4a6e", icon: Briefcase },
  wellness: { bg: "#ecfdf5", accent: "#14b8a6", text: "#115e59", icon: Leaf },
  lifestyle: { bg: "#f8fafc", accent: "#64748b", text: "#334155", icon: Star },
};

interface Props {
  cards: ProductCard[];
  customerName: string;
}

export default function ProductCardsPhoneView({ cards, customerName }: Props) {
  const firstName = customerName.split(" ")[0];

  return (
    <div className="px-3 py-3 space-y-3">
      {/* Greeting */}
      <div className="flex items-center gap-1.5 px-1">
        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
        <span className="text-[11px] font-semibold text-slate-600">
          Recommended for {firstName}
        </span>
      </div>

      {cards.map((card, i) => {
        const style = THEME_STYLES[card.theme] || THEME_STYLES.lifestyle;
        const Icon = style.icon;

        if (card.type === "behavioral") {
          // Dark gradient card for behavioral
          return (
            <div
              key={i}
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${style.accent}, ${style.accent}cc)`,
                animation: `phone-card-reveal 0.4s ease-out ${i * 0.15}s both`,
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-8 translate-x-8 bg-white" />
              
              {/* Signal tag */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <Icon className="w-3.5 h-3.5 text-white/80" />
                <span className="text-[9px] font-semibold text-white/70 uppercase tracking-wider">
                  {card.signal_label}
                </span>
              </div>

              {/* Quote */}
              <p className="text-[13px] font-medium text-white leading-relaxed mb-3">
                "{card.quote}"
              </p>

              {/* Product pill */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2.5 py-1 rounded-full">
                  {card.product_name}
                </span>
                <button className="flex items-center gap-0.5 text-[10px] font-semibold text-white/90">
                  Learn More <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        }

        // Soft colored card for life event
        return (
          <div
            key={i}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: style.bg,
              animation: `phone-card-reveal 0.4s ease-out ${i * 0.15}s both`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-15 -translate-y-6 translate-x-6"
              style={{ background: style.accent }}
            />

            {/* Event tag */}
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="w-3.5 h-3.5" style={{ color: style.accent }} />
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: `${style.accent}99` }}>
                {card.signal_label}
              </span>
            </div>

            {/* Quote */}
            <p className="text-[13px] font-medium leading-relaxed mb-3" style={{ color: style.text }}>
              "{card.quote}"
            </p>

            {/* Product + CTA */}
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                style={{ background: style.accent }}
              >
                {card.product_name}
              </span>
              <button
                className="flex items-center gap-0.5 text-[10px] font-semibold"
                style={{ color: style.accent }}
              >
                Explore <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes phone-card-reveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
