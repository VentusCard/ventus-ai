import { useEffect, useState } from "react";

const lifestyleTiles = [
  { label: "Travel", stat: "12 trips/yr", color: "#3b82f6" },
  { label: "Dining", stat: "$840/mo", color: "#8b5cf6" },
  { label: "Wellness", stat: "6x/week", color: "#10b981" },
];

const HeroLifestyleCard = () => {
  const [phase, setPhase] = useState(0); // 0=initial, 1=badge, 2=tiles

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Loop every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(0);
      setTimeout(() => setPhase(1), 400);
      setTimeout(() => setPhase(2), 900);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <span className="text-blue-400 font-bold text-sm">JM</span>
        </div>
        <div>
          <p className="text-white font-semibold">Jessica Martinez</p>
          <div
            className="mt-0.5 transition-all duration-500"
            style={{
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "translateY(0)" : "translateY(6px)",
            }}
          >
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}
            >
              ✦ Wellness Explorer
            </span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Lifestyle Signals</p>
      <div className="space-y-2.5">
        {lifestyleTiles.map((tile, i) => (
          <div
            key={tile.label}
            className="flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-500"
            style={{
              background: "#0a0f1e",
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "translateX(0)" : "translateX(16px)",
              transitionDelay: `${i * 150}ms`,
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full transition-all duration-700"
                style={{
                  background: tile.color,
                  boxShadow: phase >= 2 ? `0 0 8px ${tile.color}60` : "none",
                  transitionDelay: `${i * 150 + 400}ms`,
                }}
              />
              <span className="text-white text-sm font-medium">{tile.label}</span>
            </div>
            <span className="text-gray-400 text-xs font-medium">{tile.stat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroLifestyleCard;
