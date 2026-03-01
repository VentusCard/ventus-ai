import { useEffect, useState } from "react";

const metrics = [
  { label: "Total Accounts", value: "120M" },
  { label: "Total Annual Spend", value: "$385B" },
  { label: "Active Account Rate", value: "78.5%" },
];

const pillars = [
  { label: "Travel & Exploration", pct: 20.4, color: "#3b82f6" },
  { label: "Food & Dining", pct: 18.2, color: "#8b5cf6" },
  { label: "Health & Wellness", pct: 14.1, color: "#14b8a6" },
  { label: "Shopping & Retail", pct: 12.3, color: "#f59e0b" },
  { label: "Financial & Aspirational", pct: 9.8, color: "#22c55e" },
];

const HeroAnalyticsCard = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(0);
      setTimeout(() => setPhase(1), 400);
      setTimeout(() => setPhase(2), 900);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md rounded-2xl p-5" style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="rounded-lg px-3 py-2.5 text-center transition-all duration-500"
            style={{
              background: "#0a0f1e",
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "translateY(0)" : "translateY(10px)",
              transitionDelay: `${i * 100}ms`,
            }}
          >
            <p className="text-white text-base font-bold">{m.value}</p>
            <p className="text-gray-500 text-[9px] uppercase tracking-wider mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Pillar bars */}
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Spending by Lifestyle Pillar</p>
      <div className="space-y-2.5">
        {pillars.map((p, i) => (
          <div
            key={p.label}
            className="transition-all duration-500"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "translateX(0)" : "translateX(12px)",
              transitionDelay: `${i * 100}ms`,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-300 text-[11px]">{p.label}</span>
              <span className="text-gray-400 text-[10px] font-semibold">{p.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-700/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: phase >= 2 ? `${(p.pct / 25) * 100}%` : "0%",
                  background: p.color,
                  transitionDelay: `${i * 100 + 300}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroAnalyticsCard;
