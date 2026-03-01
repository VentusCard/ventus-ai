import { useEffect, useState, useCallback, useRef } from "react";

const transactions = [
  { merchant: "United Airlines", amount: "$412.00", date: "Feb 28" },
  { merchant: "Titleist.com", amount: "$58.00", date: "Feb 22" },
  { merchant: "REI Co-op", amount: "$43.20", date: "Mar 6" },
  { merchant: "Patagonia", amount: "$89.00", date: "Mar 11" },
  { merchant: "REI Co-op", amount: "$127.43", date: "Mar 14" },
];

// Progressive profile build: after each tx index, what tags/confidence exist
const profileStages = [
  { pills: [{ color: "blue", label: "Outdoor & Adventure" }], confidence: 40 },
  { pills: [{ color: "blue", label: "Outdoor & Adventure" }], confidence: 55 },
  {
    pills: [
      { color: "blue", label: "Outdoor & Adventure" },
      { color: "orange", label: "Loyalty Decay Detected" },
    ],
    confidence: 78,
  },
  {
    pills: [
      { color: "blue", label: "Outdoor & Adventure" },
      { color: "orange", label: "Loyalty Decay Detected" },
      { color: "purple", label: "Pre-Summer Trip Planning" },
    ],
    confidence: 86,
  },
  {
    pills: [
      { color: "blue", label: "Outdoor & Adventure" },
      { color: "orange", label: "Loyalty Decay Detected" },
      { color: "purple", label: "Pre-Summer Trip Planning" },
      { color: "teal", label: "Life Event: Vacation Upcoming" },
    ],
    confidence: 94,
    action: "Serve Delta miles offer + REI cashback deal today",
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  purple: { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
  orange: { bg: "rgba(249,115,22,0.15)", text: "#fb923c" },
  teal: { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
};

const TX_INTERVAL = 1500;
const HOLD_DURATION = 2500;
const CYCLE_DURATION = TX_INTERVAL * transactions.length + HOLD_DURATION;

const EnrichmentMockup = () => {
  const [cardVisible, setCardVisible] = useState(false);
  const [visibleTxCount, setVisibleTxCount] = useState(0);
  const [targetConfidence, setTargetConfidence] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setCardVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const runCycle = useCallback(() => {
    clearTimeouts();
    setVisibleTxCount(0);
    setTargetConfidence(0);

    transactions.forEach((_, i) => {
      schedule(() => {
        setVisibleTxCount(i + 1);
        setTargetConfidence(profileStages[i].confidence);
      }, (i + 1) * TX_INTERVAL);
    });

    // Reset after hold
    schedule(() => {
      setVisibleTxCount(0);
      setTargetConfidence(0);
      // Small delay then restart
      schedule(() => runCycle(), 600);
    }, CYCLE_DURATION);
  }, [clearTimeouts, schedule]);

  useEffect(() => {
    if (!cardVisible) return;
    runCycle();
    return () => clearTimeouts();
  }, [cardVisible, runCycle, clearTimeouts]);

  const currentStage = visibleTxCount > 0 ? profileStages[visibleTxCount - 1] : null;
  const visibleTxs = transactions.slice(0, visibleTxCount).reverse(); // newest first

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden animate-float"
        style={{
          background: "#0a0f1e",
          border: "1px solid #1e2d4a",
          transform: "rotate(-2deg)",
          maxWidth: 480,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-[#1e2d4a]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-white text-xs font-medium tracking-wide">
            Transaction Enrichment Engine
          </span>
          <span className="ml-auto text-[10px] text-emerald-400 font-mono">Live</span>
        </div>

        <div className="grid grid-cols-2 gap-4 px-5 py-4" style={{ height: 200 }}>
          {/* Left: Transaction Feed */}
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono font-semibold text-blue-400 tracking-widest uppercase">
              Transaction Feed (Rolling)
            </span>
            <div className="mt-2 space-y-1 overflow-hidden" style={{ maxHeight: 150 }}>
              {visibleTxs.map((tx, i) => (
                <div
                  key={`${tx.merchant}-${tx.date}-${i}`}
                  className="font-mono text-[10px] leading-tight px-2 py-1 rounded transition-all duration-400"
                  style={{
                    color: i === 0 ? "#e2e8f0" : "#64748b",
                    background: i === 0 ? "rgba(59,130,246,0.1)" : "transparent",
                    opacity: 1,
                    animation: i === 0 ? "fade-in 0.4s ease-out" : undefined,
                  }}
                >
                  <span className="text-gray-300">{tx.merchant}</span>
                  <span className="text-gray-500 mx-1">·</span>
                  <span className="text-gray-400">{tx.amount}</span>
                  <span className="text-gray-500 mx-1">·</span>
                  <span className="text-gray-500">{tx.date}</span>
                  {i === 0 && <span className="text-blue-400 ml-1">←</span>}
                </div>
              ))}
              {visibleTxCount === 0 && (
                <div className="font-mono text-[10px] text-gray-600 px-2 py-1">
                  Awaiting transactions...
                </div>
              )}
            </div>
          </div>

          {/* Right: Enriched Output */}
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-widest uppercase">
              Enriched Output
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {currentStage?.pills.map((pill, i) => {
                const c = colorMap[pill.color] ?? colorMap.blue;
                return (
                  <span
                    key={pill.label}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      background: c.bg,
                      color: c.text,
                      animation: "fade-in 0.4s ease-out",
                    }}
                  >
                    {pill.label}
                  </span>
                );
              })}
            </div>

            {/* Confidence */}
            {currentStage && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500">Confidence</span>
                  <span className="text-[10px] font-semibold text-emerald-400 font-mono">
                    {currentStage.confidence}%
                  </span>
                </div>
                <div className="h-1 w-full rounded-full" style={{ background: "#1a2332" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${targetConfidence}%`,
                      background: "linear-gradient(90deg, #10b981, #34d399)",
                      transition: "width 800ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation — always reserve space */}
        <div className="px-5 pb-4" style={{ height: 52 }}>
          <div
            className="rounded-lg px-3 py-2 text-[10px] text-blue-200 leading-relaxed transition-opacity duration-500"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
              opacity: currentStage?.action ? 1 : 0,
            }}
          >
            <span className="font-semibold text-blue-400">Recommended Action:</span>{" "}
            Serve Delta miles offer + REI cashback deal today
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrichmentMockup;
