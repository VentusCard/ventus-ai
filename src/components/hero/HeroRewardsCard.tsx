import { useEffect, useState } from "react";

const tags = ["Outdoor Enthusiast", "Domestic Traveler", "Family"];
const offers = [
  { name: "REI 10% Back", match: 96 },
  { name: "Delta Miles 2x", match: 94 },
  { name: "Patagonia 15% Back", match: 91 },
];

const HeroRewardsCard = () => {
  const [phase, setPhase] = useState(0); // 0=tags, 1=offers filling

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 600);
    return () => clearTimeout(t);
  }, []);

  // Loop: reset and replay every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(0);
      setTimeout(() => setPhase(1), 600);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
          <span className="text-blue-400 font-bold text-sm">SM</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Sarah M.</p>
          <p className="text-gray-500 text-xs">Premium Checking · Chicago, IL</p>
        </div>
      </div>

      {/* Animated tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-500"
            style={{
              background: "rgba(59,130,246,0.15)",
              color: "#60a5fa",
              opacity: phase >= 0 ? 1 : 0,
              transform: phase >= 0 ? "translateY(0)" : "translateY(8px)",
              transitionDelay: `${i * 150}ms`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Animated offer rows */}
      <div className="space-y-3">
        {offers.map((offer, i) => (
          <div
            key={offer.name}
            className="flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-500"
            style={{
              background: "#0a0f1e",
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "translateX(0)" : "translateX(16px)",
              transitionDelay: `${i * 200}ms`,
            }}
          >
            <div>
              <p className="text-white text-sm font-medium">{offer.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "#1e2d4a" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      background: "#3b82f6",
                      width: phase >= 1 ? `${offer.match}%` : "0%",
                      transitionDelay: `${i * 200 + 300}ms`,
                    }}
                  />
                </div>
                <span className="text-gray-500 text-xs">{offer.match}%</span>
              </div>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-300"
              style={{
                background: phase >= 1 ? "rgba(34,197,94,0.15)" : "transparent",
                color: phase >= 1 ? "#4ade80" : "transparent",
                transitionDelay: `${i * 200 + 600}ms`,
              }}
            >
              Matched
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroRewardsCard;
