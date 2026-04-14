import { useState, useEffect, useCallback } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import type { RollupOfferGroup } from "./NextOfferRationale";
import { getColor } from "./ExecDemoIntelPanel";

const COLLECTION_IMAGES: { keywords: string[]; url: string }[] = [
  { keywords: ["travel", "flight", "airline", "airport", "luggage", "vacation"], url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop" },
  { keywords: ["coffee", "cafe", "latte", "espresso"], url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop" },
  { keywords: ["dining", "restaurant", "food", "culinary", "brunch"], url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop" },
  { keywords: ["fitness", "gym", "workout", "exercise", "athletic"], url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop" },
  { keywords: ["outdoor", "hiking", "adventure", "nature", "camping"], url: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=200&fit=crop" },
  { keywords: ["tech", "gadget", "electronic", "device", "digital"], url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop" },
  { keywords: ["fashion", "clothing", "style", "apparel", "luxury"], url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=200&fit=crop" },
  { keywords: ["wellness", "spa", "health", "meditation", "yoga"], url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=200&fit=crop" },
  { keywords: ["pet", "dog", "cat", "animal"], url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=200&fit=crop" },
  { keywords: ["home", "furniture", "decor", "interior"], url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=200&fit=crop" },
  { keywords: ["grocery", "organic", "market", "fresh"], url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop" },
  { keywords: ["entertainment", "music", "streaming", "concert"], url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop" },
  { keywords: ["auto", "car", "vehicle", "driving"], url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=200&fit=crop" },
  { keywords: ["beauty", "skincare", "cosmetic", "makeup"], url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=200&fit=crop" },
  { keywords: ["education", "learning", "book", "study"], url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop" },
  { keywords: ["wine", "beer", "cocktail", "drink", "bar"], url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=200&fit=crop" },
  { keywords: ["golf", "sport", "tennis", "running"], url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop" },
  { keywords: ["garden", "plant", "flower", "nursery"], url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop" },
  { keywords: ["subscription", "box", "delivery", "streaming"], url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop" },
  { keywords: ["invest", "finance", "wealth", "saving"], url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop" },
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=200&fit=crop";

function getCollectionImage(rollup: string, pillar?: string): string {
  const theme = (rollup + " " + (pillar || "")).toLowerCase();
  for (const entry of COLLECTION_IMAGES) {
    if (entry.keywords.some(k => theme.includes(k))) return entry.url;
  }
  return DEFAULT_IMAGE;
}

interface Props {
  offerGroups: RollupOfferGroup[];
  customerName: string;
}

export default function GeneratedOffersPhoneView({ offerGroups, customerName }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [expandedGroup, setExpandedGroup] = useState<RollupOfferGroup | null>(null);

  const groups = offerGroups.filter(g => g.deals.filter(d => d.signal !== "suppress").length > 0);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? "right" : "left");
    setCurrent(idx);
  }, [current]);

  useEffect(() => {
    if (groups.length <= 1 || expandedGroup) return;
    const timer = setInterval(() => {
      setDirection("right");
      setCurrent(prev => (prev + 1) % groups.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [groups.length, expandedGroup]);

  if (groups.length === 0) return null;

  // ── Deal Detail View ──
  if (expandedGroup) {
    const deals = expandedGroup.deals.filter(d => d.signal !== "suppress");
    const imgSrc = getCollectionImage(expandedGroup.rollup, expandedGroup.pillar);
    const c = getColor(expandedGroup.pillar || "");

    return (
      <div className="px-0 py-0 flex flex-col h-full" style={{ animation: "detail-slide-in 0.25s ease-out" }}>
        {/* Header */}
        <button
          onClick={() => setExpandedGroup(null)}
          className="flex items-center gap-1.5 px-3 pt-3 pb-1.5 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[11px] font-medium">Back</span>
        </button>

        {/* Banner */}
        <div className="h-[90px] w-full overflow-hidden">
          <img src={imgSrc} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="px-3 pt-2.5 pb-1">
          <p className="text-[13px] font-bold text-slate-800">{expandedGroup.rollup}</p>
          <p className="text-[10px] text-slate-500">{deals.length} offer{deals.length !== 1 ? "s" : ""} available</p>
        </div>

        {/* Deal list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2" style={{ scrollbarWidth: "none" }}>
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-xl border border-slate-100 bg-white p-3 flex items-start justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-800 truncate">{deal.merchant}</p>
                {deal.product_name && (
                  <p className="text-[11px] text-slate-500 truncate">{deal.product_name}</p>
                )}
                {deal.message && (
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{deal.message}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {deal.reward_value && (
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: c.dot }}
                  >
                    {deal.reward_value}
                  </span>
                )}
                <button
                  className="text-[9px] font-semibold px-2.5 py-1 rounded-full border transition-colors"
                  style={{ borderColor: c.dot, color: c.dot }}
                >
                  {deal.cta_button_text || "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes detail-slide-in {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  }

  // ── Carousel View ──
  const active = groups[current % groups.length];
  const activeDeals = active.deals.filter(d => d.signal !== "suppress");
  const imgSrc = getCollectionImage(active.rollup, active.pillar);

  return (
    <div className="px-3 py-3 space-y-2" style={{ overflow: 'hidden', scrollbarWidth: 'none' }}>
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-bold text-slate-700">
          Curated for {customerName.split(" ")[0]}
        </span>
      </div>

      <div
        key={`${active.pillar}::${active.rollup}`}
        className="rounded-2xl overflow-hidden border border-slate-100 flex flex-col min-h-[160px] cursor-pointer hover:shadow-md transition-shadow"
        style={{
          background: "linear-gradient(145deg, #f8fafc, #ffffff)",
          animation: `collection-slide-${direction} 0.35s ease-out`,
        }}
        onClick={() => setExpandedGroup(active)}
      >
        <div className="h-[80px] w-full overflow-hidden">
          <img src={imgSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="px-4 pt-2.5 pb-1.5 flex-1">
          <p className="text-[13px] font-semibold text-slate-800 leading-snug">
            {active.collectionMessage || `Discover curated picks from ${active.rollup}`}
          </p>
        </div>
        <div className="flex items-center gap-1 px-4 pb-3 overflow-hidden">
          {activeDeals.map((deal) => (
            <span
              key={deal.id}
              className="inline-flex items-center text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-slate-100 bg-white text-slate-600 shadow-sm truncate shrink min-w-0"
            >
              {deal.merchant}
            </span>
          ))}
        </div>
      </div>

      {groups.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={() => goTo((current - 1 + groups.length) % groups.length)}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-slate-500" />
          </button>
          <div className="flex gap-1.5">
            {groups.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === current % groups.length
                    ? "bg-slate-700 scale-125"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => goTo((current + 1) % groups.length)}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes collection-slide-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes collection-slide-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
