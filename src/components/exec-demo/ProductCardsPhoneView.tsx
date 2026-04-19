import { useEffect, useState, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, Check, Plane, GraduationCap, Home, TrendingUp, Heart, ShoppingBag, Utensils, Dumbbell, Music, Briefcase, Leaf, Star } from "lucide-react";
import { getColor, type PillarRollup } from "./ExecDemoIntelPanel";
import type { LifeEvent } from "@/types/lifestyle-signals";

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

function formatSpend(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${Math.round(amount)}`;
}

interface Props {
  cards: ProductCard[];
  customerName: string;
  pillarRollups?: PillarRollup[];
  detectedLifeEvents?: LifeEvent[] | null;
}

interface ResolvedPill {
  label: string;
  count: number;
  spend: number;
  // For behavioral
  pillarColor?: { bg: string; text: string; dot: string };
  // For life event — amber
  isLifeEvent?: boolean;
}

function resolveLifeEventPill(card: ProductCard, lifeEvents: LifeEvent[] | null | undefined): ResolvedPill {
  const matching = lifeEvents?.find(
    e =>
      e.event_name.toLowerCase().includes(card.signal_label.toLowerCase()) ||
      card.signal_label.toLowerCase().includes(e.event_name.toLowerCase())
  );
  const label = matching?.event_name || card.signal_label;
  const count = matching?.evidence?.length ?? 0;
  const spend = matching
    ? matching.evidence.reduce(
        (s, ev) => s + Math.abs(parseFloat(String(ev.amount || "0").replace(/[$,]/g, "")) || 0),
        0
      )
    : 0;
  return { label, count, spend, isLifeEvent: true };
}

function resolveBehavioralPill(card: ProductCard, rollups: PillarRollup[] | undefined): ResolvedPill {
  const tokenize = (s: string) => s.toLowerCase().split(/[\s,&/-]+/).filter(w => w.length > 2);
  const cardTokens = new Set([...tokenize(card.signal_label), ...tokenize(card.theme || "")]);
  let best: PillarRollup | null = null;
  let bestScore = 0;
  (rollups || []).forEach(r => {
    const rTokens = [
      ...tokenize(r.label),
      ...tokenize(r.pillar),
      ...(r.categories || []).flatMap(tokenize),
    ];
    const score = rTokens.filter(t => cardTokens.has(t)).length;
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  });
  const matched: PillarRollup | null = bestScore > 0 ? best : (rollups && rollups[0]) || null;
  if (matched) {
    const pc = getColor(matched.pillar);
    return {
      label: matched.label,
      count: matched.totalCount ?? 0,
      spend: matched.totalSpend ?? 0,
      pillarColor: { bg: pc.bg, text: pc.text, dot: pc.dot },
    };
  }
  return {
    label: card.signal_label,
    count: 0,
    spend: 0,
    pillarColor: { bg: "rgba(59,130,246,0.12)", text: "#0c4a6e", dot: "#3b82f6" },
  };
}

interface SectionProps {
  title: string;
  cards: ProductCard[];
  pills: ResolvedPill[];
}

function CardSlideshow({ title, cards, pills }: SectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isPaused || cards.length <= 1) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi, isPaused, cards.length]);

  const handlePillClick = (i: number) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(i);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  };

  if (cards.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Section label */}
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">{title}</p>

      {/* Pill row */}
      <div className="flex flex-wrap items-center gap-1.5 px-1">
        {pills.map((pill, i) => {
          const isActive = i === selectedIndex;
          if (pill.isLifeEvent) {
            // Amber styling
            return (
              <button
                key={i}
                onClick={() => handlePillClick(i)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 transition-all"
                style={{
                  background: isActive ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.08)",
                  color: "#92400e",
                  border: isActive ? "1.5px solid #f59e0b" : "1px solid rgba(245,158,11,0.35)",
                  transform: isActive ? "scale(1.04)" : "scale(1)",
                }}
              >
                {pill.label}
                {pill.count > 0 && (
                  <span className="text-[9px] font-medium opacity-70 tabular-nums">
                    {pill.count} · {formatSpend(pill.spend)}
                  </span>
                )}
              </button>
            );
          }
          // Behavioral — ✦ + theme color
          const c = pill.pillarColor!;
          return (
            <button
              key={i}
              onClick={() => handlePillClick(i)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 transition-all"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${c.bg.replace(".12", ".25")}, ${c.bg.replace(".12", ".15")})`
                  : `linear-gradient(135deg, ${c.bg.replace(".12", ".15")}, ${c.bg.replace(".12", ".06")})`,
                color: c.text,
                border: isActive ? `1.5px solid ${c.dot}` : `1px solid ${c.dot}80`,
                transform: isActive ? "scale(1.04)" : "scale(1)",
              }}
            >
              <span style={{ color: c.dot }}>✦</span>
              {pill.label}
              {pill.count > 0 && (
                <span className="text-[9px] font-medium opacity-70 tabular-nums">
                  {pill.count} · {formatSpend(pill.spend)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {cards.map((card, i) => {
            const style = THEME_STYLES[card.theme] || THEME_STYLES.lifestyle;
            const benefits = THEME_BENEFITS[card.theme] || THEME_BENEFITS.lifestyle;
            const value = THEME_VALUE[card.theme] || THEME_VALUE.lifestyle;
            const isActive = i === selectedIndex;

            return (
              <div key={i} className="flex-[0_0_100%] min-w-0 pr-1">
                <div
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  style={{
                    borderLeft: `3px solid ${style.accent}`,
                    animation: isActive ? `phone-card-reveal 0.4s ease-out both` : undefined,
                  }}
                >
                  <div className="p-3.5">
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      {cards.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => handlePillClick(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all"
              style={{
                width: i === selectedIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === selectedIndex ? "#475569" : "#cbd5e1",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductCardsPhoneView({ cards, pillarRollups, detectedLifeEvents }: Props) {
  const lifeEventCards = useMemo(() => cards.filter(c => c.type === "life_event").slice(0, 2), [cards]);
  const behavioralCards = useMemo(() => cards.filter(c => c.type === "behavioral").slice(0, 2), [cards]);

  const lifeEventPills = useMemo(
    () => lifeEventCards.map(c => resolveLifeEventPill(c, detectedLifeEvents)),
    [lifeEventCards, detectedLifeEvents]
  );
  const behavioralPills = useMemo(
    () => behavioralCards.map(c => resolveBehavioralPill(c, pillarRollups)),
    [behavioralCards, pillarRollups]
  );

  if (!cards.length) return null;

  return (
    <div className="px-3 py-3 space-y-4">
      <CardSlideshow title="Life Events" cards={lifeEventCards} pills={lifeEventPills} />
      <CardSlideshow title="Shopping Habits" cards={behavioralCards} pills={behavioralPills} />

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
