import { useEffect, useState, useCallback } from "react";

const deals = [
  { name: "Perez Art Museum", deal: "15% off admission", category: "Arts", match: 94 },
  { name: "Zuma Miami", deal: "$50 dining credit", category: "Dining", match: 97 },
  { name: "Bayside Marketplace", deal: "10% back", category: "Shopping", match: 91 },
];

const HeroTravelCard = () => {
  // 0=fade-in tags, 1=deals filling, 2=hold, 3=fade-out
  const [phase, setPhase] = useState(0);

  const runCycle = useCallback(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 5200);
    return [t1, t2];
  }, []);

  useEffect(() => {
    let timers = runCycle();
    const interval = setInterval(() => {
      timers.forEach(clearTimeout);
      timers = runCycle();
    }, 6000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [runCycle]);

  const dealsVisible = phase === 1;

  return (
    <div
      className="w-full max-w-md rounded-2xl p-6"
      style={{
        background: "#111827",
        border: "1px solid #1e2d4a",
      }}
    >
      {/* Trip header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
          <span className="text-blue-400 font-bold text-sm">✈</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">John D.</p>
          <p className="text-gray-500 text-xs">Premium Checking · New York, NY</p>
        </div>
      </div>

      {/* Animated trip badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["Detected Trip", "Miami, FL", "Privacy-First"].map((tag, i) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-500"
            style={{
              background: i === 0 ? "rgba(59,130,246,0.15)" : i === 1 ? "rgba(34,197,94,0.12)" : "rgba(168,85,247,0.12)",
              color: i === 0 ? "#60a5fa" : i === 1 ? "#4ade80" : "#c084fc",
              opacity: 1,
              transform: "translateY(0)",
              transitionDelay: `${i * 150}ms`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Animated deal rows */}
      <div className="space-y-3">
        {deals.map((deal, i) => (
          <div
            key={deal.name}
            className="flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-500"
            style={{
              background: "#0a0f1e",
              opacity: dealsVisible ? 1 : 0,
              transform: dealsVisible ? "translateX(0)" : "translateX(16px)",
              transitionDelay: `${i * 200}ms`,
            }}
          >
            <div>
              <p className="text-white text-sm font-medium">{deal.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "#1e2d4a" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      background: "#3b82f6",
                      width: dealsVisible ? `${deal.match}%` : "0%",
                      transitionDelay: `${i * 200 + 300}ms`,
                    }}
                  />
                </div>
                <span className="text-gray-500 text-xs">{deal.match}%</span>
              </div>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-300"
              style={{
                background: dealsVisible ? "rgba(59,130,246,0.15)" : "transparent",
                color: dealsVisible ? "#60a5fa" : "transparent",
                transitionDelay: `${i * 200 + 600}ms`,
              }}
            >
              {deal.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroTravelCard;
