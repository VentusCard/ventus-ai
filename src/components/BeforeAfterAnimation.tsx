import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowDown, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

const transactions = [
  { merchant: "Walgreens", amount: "$47.20", date: "Feb 10" },
  { merchant: "Buy Buy Baby", amount: "$134.00", date: "Feb 18" },
  { merchant: "Walgreens", amount: "$62.30", date: "Feb 25" },
  { merchant: "Amazon Baby Registry", amount: "$89.00", date: "Mar 2" },
  { merchant: "Walgreens", amount: "$51.10", date: "Mar 9" },
];

const profileStages = [
  {
    pills: [{ label: "Pharmacy Shopper", color: "bg-blue-100 text-blue-700" }],
    confidence: 30,
  },
  {
    pills: [
      { label: "Pharmacy Shopper", color: "bg-blue-100 text-blue-700" },
      { label: "Baby Care Shopping", color: "bg-purple-100 text-purple-700" },
    ],
    confidence: 55,
  },
  {
    pills: [
      { label: "Baby Care Shopping", color: "bg-purple-100 text-purple-700" },
      { label: "Formula & Diapers Pattern", color: "bg-teal-100 text-teal-700" },
    ],
    confidence: 74,
  },
  {
    pills: [
      { label: "Baby Care Shopping", color: "bg-purple-100 text-purple-700" },
      { label: "Formula & Diapers Pattern", color: "bg-teal-100 text-teal-700" },
      { label: "Life Event: New Baby", color: "bg-green-100 text-green-700" },
    ],
    confidence: 89,
  },
  {
    pills: [
      { label: "New Parent", color: "bg-blue-100 text-blue-700" },
      { label: "Baby Care Shopping", color: "bg-purple-100 text-purple-700" },
      { label: "Formula & Diapers Pattern", color: "bg-teal-100 text-teal-700" },
      { label: "Life Event: New Baby", color: "bg-green-100 text-green-700" },
    ],
    confidence: 97,
  },
];

const TX_INTERVAL = 1500;
const HOLD = 2500;

const BeforeAfterAnimation = () => {
  const [visibleTxCount, setVisibleTxCount] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

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
    setBarWidth(0);

    transactions.forEach((_, i) => {
      schedule(() => {
        setVisibleTxCount(i + 1);
        setBarWidth(profileStages[i].confidence);
      }, (i + 1) * TX_INTERVAL);
    });

    // Hold then reset
    schedule(() => {
      setVisibleTxCount(0);
      setBarWidth(0);
      schedule(() => runCycle(), 600);
    }, TX_INTERVAL * transactions.length + HOLD);
  }, [clearTimeouts, schedule]);

  const handleReplay = useCallback(() => {
    runCycle();
  }, [runCycle]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runCycle();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeouts();
    };
  }, [runCycle, clearTimeouts]);

  const currentStage = visibleTxCount > 0 ? profileStages[visibleTxCount - 1] : null;
  const visibleTxs = transactions.slice(0, visibleTxCount);

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: 460 }}>
      <p className="text-xs text-gray-400 text-right mb-3">
        {visibleTxCount > 0 ? `${visibleTxCount} of ${transactions.length} transactions` : "Waiting for data..."}
      </p>

      <div className="space-y-4">
        {/* Transaction Feed */}
        <div
          className="rounded-xl p-6 transition-all duration-500"
          style={{ background: "#f8f9fa" }}
        >
          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">
            Transaction Feed
          </p>
          <div className="space-y-1" style={{ height: 180, overflow: "hidden" }}>
            {visibleTxs.map((tx, i) => (
              <div
                key={`${tx.merchant}-${tx.date}`}
                className="font-mono text-xs sm:text-sm text-gray-700 px-3 py-1.5 rounded transition-all duration-300 truncate"
                style={{
                  background: i === visibleTxs.length - 1 ? "rgba(59,130,246,0.06)" : "transparent",
                  animation: i === visibleTxs.length - 1 ? "fade-in 0.4s ease-out" : undefined,
                }}
              >
                {tx.merchant} · {tx.amount} · {tx.date}
                {i === visibleTxs.length - 1 && (
                  <span className="text-blue-500 ml-2 text-xs font-semibold">← new</span>
                )}
              </div>
            ))}
            {visibleTxCount === 0 && (
              <p className="text-sm text-gray-400 px-3 py-1.5">Streaming transactions...</p>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div
          className="flex justify-center transition-all duration-500"
          style={{
            opacity: visibleTxCount > 0 ? 1 : 0,
            transform: visibleTxCount > 0 ? "scaleY(1)" : "scaleY(0)",
          }}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-px h-8 bg-blue-300 relative overflow-hidden">
              <div className="absolute inset-0 w-full h-4 bg-blue-500 blur-sm animate-[arrow-glow_1.5s_ease-in-out_infinite]" />
            </div>
            <ArrowDown className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        {/* Enriched Profile (progressive) */}
        <div
          className="rounded-xl p-6 transition-all duration-700"
          style={{
            background: "#0a0f1e",
            opacity: currentStage ? 1 : 0,
            transform: currentStage ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-[10px] font-bold tracking-widest text-green-400 uppercase mb-3">
            Enriched Profile (Building...)
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {currentStage?.pills.map((p, i) => (
              <span
                key={p.label}
                className={`text-xs font-medium px-3 py-1 rounded-full ${p.color}`}
                style={{ animation: "fade-in 0.3s ease-out" }}
              >
                {p.label}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-400">Confidence Score</span>
              <span className="text-[11px] font-bold text-green-400">
                {currentStage ? `${currentStage.confidence}%` : "0%"}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                style={{
                  width: `${barWidth}%`,
                  transition: "width 800ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Replay */}
        <div className="flex justify-center pt-1">
          <button
            onClick={handleReplay}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Replay
          </button>
        </div>

        {/* Learn more */}
        <div className="flex justify-center pt-3">
          <Link to="/enrichment" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterAnimation;
