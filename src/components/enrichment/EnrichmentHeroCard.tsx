import { useEffect, useState, useCallback } from "react";

const transactions = [
  {
    raw: "REI • $127.43 • March 14",
    pills: [
      { color: "blue", label: "Outdoor & Adventure" },
      { color: "purple", label: "Pre-Summer Trip Planning" },
      { color: "orange", label: "Loyalty Decay Detected" },
      { color: "teal", label: "Life Event: Vacation Upcoming" },
    ],
    confidence: 94,
    action: "Serve Delta miles offer + REI cashback deal today",
  },
  {
    raw: "Whole Foods • $210.40 • March 16",
    pills: [
      { color: "blue", label: "Health Conscious" },
      { color: "purple", label: "Premium Grocery Shopper" },
      { color: "teal", label: "Wellness Lifestyle" },
      { color: "green", label: "High Disposable Income" },
    ],
    confidence: 91,
    action: "Surface organic meal-kit partnership + wellness rewards",
  },
  {
    raw: "United Airlines • $890.00 • March 18",
    pills: [
      { color: "blue", label: "Frequent Traveler" },
      { color: "purple", label: "Business Travel Pattern" },
      { color: "orange", label: "Miles Optimizer" },
      { color: "teal", label: "Life Event: Relocation Possible" },
    ],
    confidence: 95,
    action: "Activate travel insurance cross-sell + lounge access offer",
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  purple: { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
  orange: { bg: "rgba(249,115,22,0.15)", text: "#fb923c" },
  teal: { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
  green: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
};

const CYCLE = 6000;
const FILL = 1500;

const EnrichmentHeroCard = () => {
  const [index, setIndex] = useState(0);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const startCycle = useCallback(() => {
    setPillsVisible(false);
    setBarWidth(0);
    const t1 = setTimeout(() => setPillsVisible(true), 300);
    const t2 = setTimeout(() => setBarWidth(transactions[index].confidence), 350);
    const t3 = setTimeout(() => {
      setPillsVisible(false);
      setBarWidth(0);
    }, CYCLE - 800);
    return [t1, t2, t3];
  }, [index]);

  useEffect(() => {
    const timers = startCycle();
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % transactions.length);
    }, CYCLE);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [startCycle]);

  const tx = transactions[index];

  return (
    <div
      className="rounded-2xl shadow-2xl overflow-hidden"
      style={{
        background: "#111827",
        border: "1px solid #1e2d4a",
        transform: "rotate(-2deg)",
        maxWidth: 440,
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
          Transaction Enrichment Engine
        </span>
        <span className="ml-auto text-[10px] text-emerald-400 font-mono">Live</span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Raw input */}
        <div>
          <span className="text-[10px] font-mono font-semibold text-blue-400 tracking-widest uppercase">
            Raw Input
          </span>
          <div
            className="mt-1.5 rounded-lg px-3 py-2 font-mono text-sm text-gray-300 transition-all duration-300"
            style={{ background: "#0a0f1e" }}
          >
            {tx.raw}
          </div>
        </div>

        {/* Pipeline connector */}
        <div className="flex justify-center">
          <div className="relative w-px h-12" style={{ background: "#1e2d4a" }}>
            <div
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
              style={{
                background: "#3b82f6",
                boxShadow: "0 0 8px 3px rgba(59,130,246,0.6)",
                animation: "pipeline-dot 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Enriched output */}
        <div>
          <span className="text-[10px] font-mono font-semibold text-emerald-400 tracking-widest uppercase">
            Enriched Output
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {tx.pills.map((pill, i) => {
              const c = colorMap[pill.color] ?? colorMap.blue;
              return (
                <span
                  key={pill.label}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{
                    background: c.bg,
                    color: c.text,
                    opacity: pillsVisible ? 1 : 0,
                    transform: pillsVisible ? "translateY(0)" : "translateY(6px)",
                    transition: `opacity 400ms ease-out ${i * 100}ms, transform 400ms ease-out ${i * 100}ms`,
                  }}
                >
                  {pill.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Confidence */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-400">Confidence Score</span>
            <span className="text-[11px] font-semibold text-emerald-400 font-mono">
              {barWidth > 0 ? `${tx.confidence}%` : "0%"}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full" style={{ background: "#1a2332" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${barWidth}%`,
                background: "linear-gradient(90deg, #10b981, #34d399)",
                transition: barWidth > 0
                  ? `width ${FILL}ms cubic-bezier(0.16, 1, 0.3, 1)`
                  : "width 400ms ease-in",
              }}
            />
          </div>
        </div>

        {/* Recommendation */}
        <div
          className="rounded-lg px-3 py-2 text-[11px] text-blue-200 leading-relaxed transition-opacity duration-500"
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.25)",
            opacity: pillsVisible ? 1 : 0,
          }}
        >
          <span className="font-semibold text-blue-400">Recommended Action:</span>{" "}
          {tx.action}
        </div>
      </div>
    </div>
  );
};

export default EnrichmentHeroCard;
