import { useEffect, useState } from "react";

const clients = [
  {
    name: "Margaret Chen",
    aum: "$4.2M",
    event: "Retirement Planning",
    confidence: 91,
    timeline: "Q1 2026",
  },
  {
    name: "David Park",
    aum: "$1.8M",
    event: "Home Purchase",
    confidence: 87,
    timeline: "Q1 2026",
  },
];

const HeroWealthCard = () => {
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
    <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
      {/* Live indicator */}
      <div
        className="flex items-center gap-2 mb-5 transition-all duration-500"
        style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateY(0)" : "translateY(6px)" }}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        <span className="text-green-400 text-[11px] font-semibold tracking-wide">Live — 6 clients need attention</span>
      </div>

      {/* Client rows */}
      <div className="space-y-3">
        {clients.map((client, i) => (
          <div
            key={client.name}
            className="rounded-lg px-4 py-3.5 transition-all duration-500"
            style={{
              background: "#0a0f1e",
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "translateY(0)" : "translateY(16px)",
              transitionDelay: `${i * 150}ms`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-[10px]">{client.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{client.name}</p>
                  <p className="text-gray-500 text-[10px]">{client.aum}</p>
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
              >
                Urgent
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-[11px]">{client.event}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 w-16 rounded-full bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: phase >= 2 ? `${client.confidence}%` : "0%",
                        background: "#3b82f6",
                        transitionDelay: `${i * 150 + 400}ms`,
                      }}
                    />
                  </div>
                  <span className="text-blue-400 text-[10px] font-semibold">{client.confidence}%</span>
                  <span className="text-gray-500 text-[10px]">{client.timeline}</span>
                </div>
              </div>
              <button
                className="px-3 py-1 rounded text-[10px] font-semibold text-blue-400 transition-all duration-500"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  opacity: phase >= 2 ? 1 : 0,
                  transitionDelay: `${i * 150 + 600}ms`,
                }}
              >
                Prepare
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroWealthCard;
