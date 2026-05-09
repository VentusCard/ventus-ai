import { useState, useEffect, useCallback, useRef } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const TX_STREAM_DELAY = 1200;
const AGENT_DELAY = 600;
const SPINNER_DURATION = 400;
const AUTO_REPLAY_INTERVAL = 12000;

const transactions = [
  { desc: "Titleist.com · $58.00 · Feb 22" },
  { desc: "United Airlines · $412.00 · Feb 28" },
  { desc: "REI Co-op · $43.20 · Mar 6" },
  { desc: "Patagonia · $89.00 · Mar 11" },
  { desc: "REI #045 · $124.99 · Mar 14" },
];

const agents = [
  {
    name: "Merchant Identifier",
    desc: "Resolves merchant identity for each transaction as it arrives.",
    threshold: 1,
    thresholdLabel: "Tags each transaction on arrival",
  },
  {
    name: "Category Classifier",
    desc: "Places transactions into lifestyle pillars. Confidence rises with volume.",
    threshold: 2,
    thresholdLabel: "Confidence rising — 2 transactions matched",
  },
  {
    name: "Intent Detector",
    desc: "Identifies behavioral intent from spending sequences.",
    threshold: 3,
    thresholdLabel: "Pattern threshold met",
  },
  {
    name: "Life Event Analyzer",
    desc: "Detects 20+ life events from transaction patterns.",
    threshold: 4,
    thresholdLabel: "Life event signal detected",
  },
  {
    name: "Spend Velocity Engine",
    desc: "Compares spend against the customer's 90-day baseline.",
    threshold: 4,
    thresholdLabel: "Compared against 90-day baseline",
  },
  {
    name: "Offer Match Engine",
    desc: "Activates personalized offers once profile confidence is sufficient.",
    threshold: 5,
    thresholdLabel: "Profile confidence sufficient",
  },
];

const summaryPills = [
  { text: "Outdoor Enthusiast", color: "rgba(59,130,246,0.15)", textColor: "#60a5fa" },
  { text: "Pre-Summer Trip", color: "rgba(139,92,246,0.15)", textColor: "#a78bfa" },
  { text: "Vacation Upcoming", color: "rgba(249,115,22,0.15)", textColor: "#fb923c" },
  { text: "Loyalty Decay Risk", color: "rgba(239,68,68,0.15)", textColor: "#f87171" },
  { text: "Travel Active", color: "rgba(20,184,166,0.15)", textColor: "#2dd4bf" },
  { text: "High Intent", color: "rgba(34,197,94,0.15)", textColor: "#4ade80" },
];

type AgentState = "inactive" | "loading" | "done";

const EnrichmentInteractiveDemo = () => {
  const [streamedTxCount, setStreamedTxCount] = useState(0);
  const [agentStates, setAgentStates] = useState<AgentState[]>(agents.map(() => "inactive"));
  const [showSummary, setShowSummary] = useState(false);
  const [confidenceWidth, setConfidenceWidth] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const runSequence = useCallback(() => {
    clearAllTimeouts();
    setStreamedTxCount(0);
    setAgentStates(agents.map(() => "inactive"));
    setShowSummary(false);
    setConfidenceWidth(0);
    setIsRunning(true);

    // Stream transactions in one at a time
    transactions.forEach((_, txIdx) => {
      const txTime = (txIdx + 1) * TX_STREAM_DELAY;
      schedule(() => {
        setStreamedTxCount(txIdx + 1);

        // After each tx, fire agents whose threshold is met
        agents.forEach((agent, agentIdx) => {
          if (agent.threshold === txIdx + 1) {
            const agentStart = AGENT_DELAY;
            schedule(() => {
              setAgentStates((prev) => {
                const next = [...prev];
                next[agentIdx] = "loading";
                return next;
              });
            }, agentStart);
            schedule(() => {
              setAgentStates((prev) => {
                const next = [...prev];
                next[agentIdx] = "done";
                return next;
              });
            }, agentStart + SPINNER_DURATION);
          }
        });
      }, txTime);
    });

    // Show summary after all
    const summaryTime = (transactions.length + 1) * TX_STREAM_DELAY + AGENT_DELAY + SPINNER_DURATION + 300;
    schedule(() => {
      setShowSummary(true);
      setTimeout(() => setConfidenceWidth(94), 200);
      setIsRunning(false);
    }, summaryTime);

    // Auto-replay
    schedule(() => runSequence(), summaryTime + AUTO_REPLAY_INTERVAL);
  }, [clearAllTimeouts, schedule]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runSequence();
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      clearAllTimeouts();
    };
  }, [runSequence, clearAllTimeouts]);

  const visibleTxs = transactions.slice(0, streamedTxCount);

  return (
    <div ref={sectionRef}>
      {/* Transaction History Stream */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="rounded-xl p-5 border border-gray-200 bg-white shadow-sm">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
            Transaction History
          </p>
          <div className="space-y-1 overflow-hidden" style={{ height: 190 }}>
            {visibleTxs.map((tx, i) => (
              <div
                key={i}
                className="font-mono text-xs md:text-sm text-gray-700 px-3 py-1.5 rounded transition-all duration-300 truncate"
                style={{
                  background: i === visibleTxs.length - 1 ? "rgba(59,130,246,0.06)" : "transparent",
                  animation: "fade-in 0.4s ease-out",
                }}
              >
                {tx.desc}
                {i === visibleTxs.length - 1 && (
                  <span className="text-blue-500 ml-2 text-xs font-semibold">← new</span>
                )}
              </div>
            ))}
            {streamedTxCount === 0 && (
              <div className="font-mono text-xs md:text-sm text-gray-400 px-3 py-1.5">
                Streaming transactions...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Pipeline */}
      <div className="max-w-2xl mx-auto space-y-0">
        {agents.map((agent, i) => {
          const state = agentStates[i];
          const isActive = state === "loading" || state === "done";
          const isDone = state === "done";

          return (
            <div key={agent.name}>
              {i > 0 && (
                <div className="flex justify-center">
                  <div className="relative w-px h-8" style={{ background: isActive ? "#3b82f6" : "#d1d5db" }}>
                    {isActive && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "#3b82f6",
                          boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                          animation: "pipeline-dot 1.5s ease-in-out infinite",
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              <div
                className="rounded-xl p-4 md:p-5 transition-all duration-500 border-2"
                style={{
                  background: isDone ? "#ffffff" : "#f9fafb",
                  borderColor: state === "loading" ? "#3b82f6" : isDone ? "#3b82f6" : "#e5e7eb",
                  boxShadow: isActive
                    ? "0 0 20px rgba(59,130,246,0.15), 0 4px 12px rgba(0,0,0,0.05)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  opacity: state === "inactive" ? 0.5 : 1,
                }}
              >
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div
                      className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full shrink-0 transition-colors duration-300"
                      style={{
                        background: isDone ? "#dcfce7" : state === "loading" ? "#dbeafe" : "#f3f4f6",
                      }}
                    >
                      {state === "loading" && <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 animate-spin" />}
                      {isDone && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />}
                      {state === "inactive" && <span className="w-2 h-2 rounded-full bg-gray-300" />}
                    </div>
                    <p className="font-bold text-xs sm:text-sm" style={{ color: "#0a0f1e" }}>Multi-rail Enrichment</p>
                  </div>
                  {isDone && (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-medium whitespace-nowrap"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}
                    >
                      Analyzed {streamedTxCount} txns
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-[11px] sm:text-xs ml-7 sm:ml-9 mb-1">{agent.desc}</p>
                {isDone && (
                  <div className="ml-7 sm:ml-9 mt-2 animate-fade-in">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
                    >
                      {agent.thresholdLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final connector */}
      {showSummary && (
        <div className="flex justify-center max-w-2xl mx-auto">
          <div className="relative w-px h-8" style={{ background: "#3b82f6" }}>
            <div
              className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
              style={{
                background: "#3b82f6",
                boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                animation: "pipeline-dot 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      )}

      {/* Enriched Profile Summary */}
      <div
        className="max-w-2xl mx-auto rounded-xl p-6 transition-all duration-700"
        style={{
          background: "#0a0f1e",
          opacity: showSummary ? 1 : 0,
          transform: showSummary ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-3">
          Enriched Profile
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {summaryPills.map((pill) => (
            <span
              key={pill.text}
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: pill.color, color: pill.textColor }}
            >
              {pill.text}
            </span>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-400">Overall Confidence</span>
            <span className="text-[11px] font-bold text-emerald-400 font-mono">94%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "#1a2332" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${confidenceWidth}%`,
                background: "linear-gradient(90deg, #10b981, #34d399)",
                transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        </div>

        <div className="rounded-lg p-3" style={{ background: "#111827" }}>
          <p className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-1">Recommended Action</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Serve Delta miles offer + REI cashback deal + outdoor gear travel insurance upsell today.
          </p>
        </div>
      </div>

      {/* Footnote */}
      <div className="max-w-2xl mx-auto mt-4">
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Ventus enriches profiles continuously — every new transaction refines the signal. Most meaningful patterns emerge after 5–10 transactions within a rolling 90-day window.
        </p>
      </div>

      {/* Replay */}
      <div className="max-w-2xl mx-auto mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => !isRunning && runSequence()}
          disabled={isRunning}
          className="gap-2 border-gray-300 text-gray-600 hover:text-gray-900"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Replay
        </Button>
      </div>
    </div>
  );
};

export default EnrichmentInteractiveDemo;
