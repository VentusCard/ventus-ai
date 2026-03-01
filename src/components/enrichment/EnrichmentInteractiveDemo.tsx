import { useState, useEffect, useCallback, useRef } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const AGENT_DELAY = 800;
const SPINNER_DURATION = 500;
const AUTO_REPLAY_INTERVAL = 15000;

const agents = [
  {
    name: "Merchant Identifier",
    outputs: [
      { label: "Merchant", value: "REI Co-op" },
      { label: "Category", value: "Outdoor & Sporting Goods" },
      { label: "Type", value: "Retail Chain" },
      { label: "Location", value: "Physical Store, Chicago IL" },
    ],
  },
  {
    name: "Category Classifier",
    outputs: [
      { label: "Primary Pillar", value: "Outdoor & Adventure" },
      { label: "Sub-category", value: "Hiking & Camping" },
      { label: "Spend Velocity", value: "Above Average" },
    ],
  },
  {
    name: "Intent Detector",
    outputs: [
      { label: "Purchase Intent", value: "Pre-summer trip planning" },
      { label: "Travel Intent", value: "Domestic outdoor trip detected" },
      { label: "Loyalty Signal", value: "Moderate, decay risk present" },
    ],
  },
  {
    name: "Life Event Analyzer",
    outputs: [
      { label: "Life Event", value: "Vacation Upcoming (87% confidence)" },
      { label: "Secondary Signal", value: "Possible relocation research" },
      { label: "Travel Pattern", value: "3 outdoor purchases in 60 days" },
    ],
  },
  {
    name: "Travel Detection",
    outputs: [
      { label: "Travel Profile", value: "Active" },
      { label: "Destinations", value: "Chicago home base, Mountain West frequent" },
      { label: "Airline Loyalty", value: "United MileagePlus detected" },
      { label: "Hotel Pattern", value: "Boutique and outdoor lodges" },
    ],
  },
  {
    name: "Confidence Validator",
    outputs: [
      { label: "Overall Confidence", value: "94%" },
      { label: "Signal Strength", value: "Strong" },
      { label: "Output Status", value: "Validated ✓" },
      { label: "Ready for", value: "Activation" },
    ],
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
  const [agentStates, setAgentStates] = useState<AgentState[]>(agents.map(() => "inactive"));
  const [showSummary, setShowSummary] = useState(false);
  const [confidenceWidth, setConfidenceWidth] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const autoReplayRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (autoReplayRef.current) {
      clearTimeout(autoReplayRef.current);
      autoReplayRef.current = null;
    }
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const runSequence = useCallback(() => {
    clearAllTimeouts();
    setAgentStates(agents.map(() => "inactive"));
    setShowSummary(false);
    setConfidenceWidth(0);
    setIsRunning(true);

    agents.forEach((_, i) => {
      const startTime = i * AGENT_DELAY + 300;
      // Start loading
      schedule(() => {
        setAgentStates((prev) => {
          const next = [...prev];
          next[i] = "loading";
          return next;
        });
      }, startTime);
      // Done
      schedule(() => {
        setAgentStates((prev) => {
          const next = [...prev];
          next[i] = "done";
          return next;
        });
      }, startTime + SPINNER_DURATION);
    });

    // Show summary after all agents
    const summaryTime = agents.length * AGENT_DELAY + SPINNER_DURATION + 500;
    schedule(() => {
      setShowSummary(true);
      setTimeout(() => setConfidenceWidth(94), 200);
      setIsRunning(false);
    }, summaryTime);

    // Auto-replay
    autoReplayRef.current = setTimeout(() => {
      runSequence();
    }, summaryTime + AUTO_REPLAY_INTERVAL);
    timeoutsRef.current.push(autoReplayRef.current);
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

  const pillColors = [
    { bg: "rgba(59,130,246,0.12)", text: "#93c5fd" },
    { bg: "rgba(139,92,246,0.12)", text: "#c4b5fd" },
    { bg: "rgba(249,115,22,0.12)", text: "#fdba74" },
    { bg: "rgba(20,184,166,0.12)", text: "#5eead4" },
  ];

  return (
    <div ref={sectionRef}>
      {/* Raw Transaction Input Card */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="rounded-xl p-5 border border-gray-200 bg-white shadow-sm">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Raw Transaction</p>
          <p className="font-mono text-gray-800 text-base md:text-lg">
            REI #045 &bull; $124.99 &bull; Chicago, IL &bull; March 14
          </p>
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
              {/* Connector line */}
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

              {/* Agent Card */}
              <div
                className="rounded-xl p-5 transition-all duration-500 border-2"
                style={{
                  background: isDone ? "#ffffff" : "#f9fafb",
                  borderColor: state === "loading" ? "#3b82f6" : isDone ? "#3b82f6" : "#e5e7eb",
                  boxShadow: isActive
                    ? "0 0 20px rgba(59,130,246,0.15), 0 4px 12px rgba(0,0,0,0.05)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  opacity: state === "inactive" ? 0.5 : 1,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Status icon */}
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors duration-300"
                    style={{
                      background: isDone ? "#dcfce7" : state === "loading" ? "#dbeafe" : "#f3f4f6",
                    }}
                  >
                    {state === "loading" && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                    {isDone && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    {state === "inactive" && (
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <p className="font-bold text-sm" style={{ color: "#0a0f1e" }}>{agent.name}</p>
                </div>

                {/* Outputs */}
                {isDone && (
                  <div className="flex flex-wrap gap-1.5 mt-3 animate-fade-in">
                    {agent.outputs.map((output, j) => {
                      const c = pillColors[j % pillColors.length];
                      return (
                        <span
                          key={output.label}
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                          style={{ background: c.bg, color: c.text }}
                        >
                          {output.label}: {output.value}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final connector to summary */}
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

        {/* Confidence bar */}
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

        {/* Recommended action */}
        <div className="rounded-lg p-3" style={{ background: "#111827" }}>
          <p className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-1">Recommended Action</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Serve Delta miles offer + REI cashback deal + outdoor gear travel insurance upsell today.
          </p>
        </div>
      </div>

      {/* Replay button */}
      <div className="max-w-2xl mx-auto mt-6 flex justify-center">
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
