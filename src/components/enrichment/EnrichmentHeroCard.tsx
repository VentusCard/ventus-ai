import { useEffect, useState, useCallback, useRef } from "react";

const transactions = [
  { merchant: "United Airlines", amount: "$412.00", date: "Feb 28" },
  { merchant: "Titleist.com", amount: "$58.00", date: "Feb 22" },
  { merchant: "REI Co-op", amount: "$43.20", date: "Mar 6" },
  { merchant: "Patagonia", amount: "$89.00", date: "Mar 11" },
  { merchant: "REI Co-op", amount: "$127.43", date: "Mar 14" },
];

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
const HOLD = 2500;
const CYCLE = TX_INTERVAL * transactions.length + HOLD;

const EnrichmentHeroCard = () => {
  const [visibleTxCount, setVisibleTxCount] = useState(0);
  const [targetConfidence, setTargetConfidence] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clear = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const sched = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const runCycle = useCallback(() => {
    clear();
    setVisibleTxCount(0);
    setTargetConfidence(0);

    transactions.forEach((_, i) => {
      sched(() => {
        setVisibleTxCount(i + 1);
        setTargetConfidence(profileStages[i].confidence);
      }, (i + 1) * TX_INTERVAL);
    });

    sched(() => {
      setVisibleTxCount(0);
      setTargetConfidence(0);
      sched(() => runCycle(), 600);
    }, CYCLE);
  }, [clear, sched]);

  useEffect(() => {
    runCycle();
    return () => clear();
  }, [runCycle, clear]);

  const currentStage = visibleTxCount > 0 ? profileStages[visibleTxCount - 1] : null;
  const visibleTxs = transactions.slice(0, visibleTxCount).reverse();

  return (
    <div
      className="rounded-2xl shadow-2xl overflow-hidden"
      style={{
        background: "#111827",
        border: "1px solid #1e2d4a",
        transform: "rotate(0deg)",
        width: 440,
        maxWidth: "100%",
        animation: "float 6s ease-in-out infinite",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-[#1e2d4a]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-white text-xs font-medium tracking-wide">
          Multi-rail Enrichment Engine
        </span>
        <span className="ml-auto text-[10px] text-emerald-400 font-mono">Live</span>
      </div>

      <div className="grid grid-cols-[1fr_0.85fr] gap-3 px-5 py-4" style={{ height: 180 }}>
        {/* Left: Feed */}
        <div className="overflow-hidden">
          <span className="text-[10px] font-mono font-semibold text-blue-400 tracking-widest uppercase">
            Transaction Feed
          </span>
          <div className="mt-2 space-y-0.5 overflow-hidden" style={{ maxHeight: 130 }}>
            {visibleTxs.map((tx, i) => (
              <div
                 key={`${tx.merchant}-${tx.date}-${i}`}
                 className="font-mono text-[9px] leading-tight px-1.5 py-0.5 rounded whitespace-nowrap"
                style={{
                  color: i === 0 ? "#e2e8f0" : "#64748b",
                  background: i === 0 ? "rgba(59,130,246,0.1)" : "transparent",
                  animation: i === 0 ? "fade-in 0.4s ease-out" : undefined,
                }}
              >
                {tx.merchant} · {tx.amount} · {tx.date}
                {i === 0 && <span className="text-blue-400 ml-1">←</span>}
              </div>
            ))}
            {visibleTxCount === 0 && (
              <div className="font-mono text-[9px] text-gray-600 px-1.5 py-0.5">Awaiting...</div>
            )}
          </div>
        </div>

        {/* Right: Profile */}
        <div className="overflow-hidden">
          <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-widest uppercase">
            Enriched Output
          </span>
          <div className="mt-2 flex flex-wrap gap-1">
            {currentStage?.pills.map((pill) => {
              const c = colorMap[pill.color] ?? colorMap.blue;
              return (
                <span
                  key={pill.label}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium"
                  style={{ background: c.bg, color: c.text, animation: "fade-in 0.4s ease-out" }}
                >
                  {pill.label}
                </span>
              );
            })}
          </div>
          {currentStage && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] text-gray-500">Confidence</span>
                <span className="text-[9px] font-semibold text-emerald-400 font-mono">
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
  );
};

export default EnrichmentHeroCard;
