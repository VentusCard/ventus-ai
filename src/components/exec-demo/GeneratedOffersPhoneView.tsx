import { useState, useEffect, useCallback } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import type { RollupOfferGroup } from "./NextOfferRationale";
import { getColor } from "./ExecDemoIntelPanel";

interface Props {
  offerGroups: RollupOfferGroup[];
  customerName: string;
}

export default function GeneratedOffersPhoneView({ offerGroups, customerName }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const groups = offerGroups.filter(g => g.deals.filter(d => d.signal !== "suppress").length > 0);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? "right" : "left");
    setCurrent(idx);
  }, [current]);

  // Auto-rotate every 5s
  useEffect(() => {
    if (groups.length <= 1) return;
    const timer = setInterval(() => {
      setDirection("right");
      setCurrent(prev => (prev + 1) % groups.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [groups.length]);

  if (groups.length === 0) return null;

  const active = groups[current % groups.length];
  const c = getColor(active.pillar);
  const activeDeals = active.deals.filter(d => d.signal !== "suppress");

  return (
    <div className="px-3 py-3 space-y-2">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-bold text-slate-700">
          Curated for {customerName.split(" ")[0]}
        </span>
      </div>

      {/* Collection Card */}
      <div
        key={`${active.pillar}::${active.rollup}`}
        className="rounded-2xl overflow-hidden border border-slate-100"
        style={{
          background: "linear-gradient(145deg, #f8fafc, #ffffff)",
          animation: `collection-slide-${direction} 0.35s ease-out`,
        }}
      >
        {/* Collection header */}
        <div className="px-4 pt-3.5 pb-2">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
            style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
          >
            <span style={{ color: c.dot }}>✦</span>
            {active.rollup}
          </span>
          <p className="text-[14px] font-semibold text-slate-800 leading-snug mt-1.5">
            {active.collectionMessage || `Discover curated picks from ${active.rollup}`}
          </p>
        </div>

        {/* Deal pills – compact wrapped layout */}
        <div className="flex flex-wrap gap-1.5 px-4 pb-3.5">
          {activeDeals.map((deal) => (
            <span
              key={deal.id}
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-100 bg-white text-slate-700 shadow-sm"
            >
              {deal.merchant} · {deal.rewardValue}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation dots + arrows */}
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
