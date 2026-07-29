import { useEffect, useMemo, useRef, useState } from "react";

type HighlightTarget = "pillars" | "lifeEvents" | "segments";

type ChatTurn = {
  id: string;
  question: string;
  typingMs: number;
  answer: string;
  highlight: HighlightTarget;
};

const CONVERSATION: ChatTurn[] = [
  {
    id: "spend",
    question: "What are customers spending the most on?",
    typingMs: 800,
    answer:
      "Travel & Exploration leads at 26.9% of total spend — $33,980 across 14 customers. Financial & Aspirational follows at 26.4% with $33,329.",
    highlight: "pillars",
  },
  {
    id: "life-events",
    question: "What life events are we seeing?",
    typingMs: 600,
    answer:
      "21 life events detected this period — 14 Notable at 83.9% confidence and 7 Opportunity signals at 81.4%. Top signals include real estate activity, travel patterns, and family formation.",
    highlight: "lifeEvents",
  },
  {
    id: "segments",
    question: "Who are our highest value segments?",
    typingMs: 700,
    answer:
      "Retired customers average $2,650 in spend — the highest of any segment. New and expecting parents follow at $1,105 average across 2 customers.",
    highlight: "segments",
  },
];

const HEADER_STATS = [
  { value: "22", label: "customers enriched" },
  { value: "218", label: "transactions analyzed" },
  { value: "$126k", label: "total spend" },
  { value: "90%", label: "avg confidence" },
];

const PILLARS = [
  { name: "Travel & Exploration", pct: 26.9, key: "travel" },
  { name: "Financial & Aspirational", pct: 26.4, key: "financial" },
  { name: "Home & Living", pct: 15.4, key: "home" },
  { name: "Family & Community", pct: 12.8, key: "family" },
  { name: "Style & Beauty", pct: 11.9, key: "style" },
  { name: "Food & Dining", pct: 2.8, key: "food" },
];

const TOP_MERCHANTS = [
  { name: "Real Estate Attorney", spend: "$15,300" },
  { name: "Delta Air Lines", spend: "$8,860" },
  { name: "The Plaza Hotel", spend: "$8,500" },
  { name: "Home Depot", spend: "$7,847" },
  { name: "Marriott", spend: "$7,206" },
];

const SEGMENTS = [
  { name: "Family-oriented", count: "4 customers", glow: false },
  { name: "Frequent Traveler", count: "3", glow: false },
  { name: "New/Expecting Parent", count: "2", glow: true },
  { name: "Retired", count: "1", glow: true },
];

const QUESTION_READ_MS = 900;
const ANSWER_READ_MS = 4200;
const PAUSE_BETWEEN_TURNS_MS = 2000;
const PAUSE_BETWEEN_CYCLES_MS = 2000;

type Phase = "question" | "typing" | "answer" | "pause";

const TypingDots = () => (
  <div className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-2xl rounded-tl-sm w-fit">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-gray-400"
        style={{
          animation: "ci-typing-bounce 1s infinite ease-in-out",
          animationDelay: `${i * 150}ms`,
        }}
      />
    ))}
  </div>
);

const CustomerIntelligenceChatDashboard = () => {
  const [turnIndex, setTurnIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [cycleKey, setCycleKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const turn = CONVERSATION[turnIndex];

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (phase === "question") {
      timerRef.current = setTimeout(() => setPhase("typing"), QUESTION_READ_MS);
    } else if (phase === "typing") {
      timerRef.current = setTimeout(() => setPhase("answer"), turn.typingMs);
    } else if (phase === "answer") {
      timerRef.current = setTimeout(() => setPhase("pause"), ANSWER_READ_MS);
    } else if (phase === "pause") {
      const isLast = turnIndex === CONVERSATION.length - 1;
      const wait = isLast ? PAUSE_BETWEEN_CYCLES_MS : PAUSE_BETWEEN_TURNS_MS;
      timerRef.current = setTimeout(() => {
        if (isLast) {
          setTurnIndex(0);
          setCycleKey((k) => k + 1);
        } else {
          setTurnIndex((i) => i + 1);
        }
        setPhase("question");
      }, wait);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, turnIndex, turn.typingMs]);

  const visibleTurns = useMemo(() => {
    const items: Array<{
      turn: ChatTurn;
      showQuestion: boolean;
      showTyping: boolean;
      showAnswer: boolean;
      key: string;
    }> = [];

    for (let i = 0; i <= turnIndex; i++) {
      const t = CONVERSATION[i];
      const isActive = i === turnIndex;
      items.push({
        turn: t,
        showQuestion: true,
        showTyping: isActive && phase === "typing",
        showAnswer: isActive ? phase === "answer" || phase === "pause" : true,
        key: `${cycleKey}-${i}`,
      });
    }
    return items;
  }, [turnIndex, phase, cycleKey]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [phase, turnIndex, cycleKey]);

  // Active highlight only while answer is on screen
  const activeHighlight: HighlightTarget | null =
    phase === "answer" || phase === "pause" ? turn.highlight : null;

  const isPillarHighlighted = (key: string) =>
    activeHighlight === "pillars" && (key === "travel" || key === "financial");

  const lifeEventsHighlighted = activeHighlight === "lifeEvents";
  const segmentsHighlighted = activeHighlight === "segments";

  return (
    <div
      className="rounded-2xl bg-white"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
        padding: 24,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <p className="text-[11px] font-mono text-gray-500">
          Customer Intelligence · Powered by Ventus
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr]">
        {/* Left: Chat */}
        <div className="lg:pr-6">
          <div
            className="rounded-xl overflow-hidden flex flex-col h-[520px]"
            style={{
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E7EB",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <p className="text-sm font-bold text-gray-900 leading-tight">Your Bank AI Assistant</p>
              <p className="text-[11px] leading-tight mt-0.5" style={{ color: "#9CA3AF" }}>Powered by Ventus</p>
            </div>

            {/* Chat scroll area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 scroll-smooth"
            >
              <div className="flex flex-col gap-3">
                {visibleTurns.map((item) => (
                  <div key={item.key} className="flex flex-col gap-2">
                    {item.showQuestion && (
                      <div
                        className="self-end max-w-[88%] px-3.5 py-2 rounded-2xl rounded-tr-sm text-white text-[12.5px] leading-snug"
                        style={{
                          backgroundColor: "#2563EB",
                          animation: "ci-fade-up 320ms ease-out both",
                        }}
                      >
                        {item.turn.question}
                      </div>
                    )}

                    {item.showTyping && (
                      <div
                        className="self-start"
                        style={{ animation: "ci-fade-up 200ms ease-out both" }}
                      >
                        <TypingDots />
                      </div>
                    )}

                    {item.showAnswer && (
                      <div
                        className="self-start max-w-[92%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-gray-800 text-[12.5px] leading-snug bg-white"
                        style={{
                          border: "1px solid #E5E7EB",
                          animation: "ci-fade-up 320ms ease-out both",
                        }}
                      >
                        {item.turn.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dashboard */}
        <div
          className="mt-6 lg:mt-0 lg:border-l lg:border-gray-200 lg:pl-6"
          style={{ borderColor: "#E5E7EB" }}
        >
          {/* Top stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {HEADER_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-lg p-3"
                style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
              >
                <p className="text-[22px] font-bold text-gray-900 leading-tight">
                  {s.value}
                </p>
                <p className="text-[10.5px] text-gray-500 mt-0.5 leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Three side-by-side panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar distribution */}
            <div
              className="rounded-lg bg-white overflow-hidden transition-all duration-300"
              style={{
                border:
                  activeHighlight === "pillars"
                    ? "1px solid #93C5FD"
                    : "1px solid #E5E7EB",
                boxShadow:
                  activeHighlight === "pillars"
                    ? "0 0 0 3px rgba(59,130,246,0.10)"
                    : "none",
              }}
            >
              <div
                className="px-4 py-2.5"
                style={{ backgroundColor: "#F3F4F6" }}
              >
                <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-600">
                  Lifestyle Pillar Distribution
                </p>
              </div>
              <div className="p-4 space-y-2.5">
                {PILLARS.map((p) => {
                  const highlighted = isPillarHighlighted(p.key);
                  return (
                    <div
                      key={p.key}
                      className="rounded-md pl-2 pr-2 py-1.5 transition-all duration-300"
                      style={{
                        borderLeft: highlighted
                          ? "3px solid #2563EB"
                          : "3px solid transparent",
                        backgroundColor: highlighted ? "#EFF6FF" : "transparent",
                        boxShadow: highlighted
                          ? "0 0 12px rgba(37,99,235,0.15)"
                          : "none",
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p
                          className="text-[11.5px] font-medium transition-colors"
                          style={{ color: highlighted ? "#1D4ED8" : "#374151" }}
                        >
                          {p.name}
                        </p>
                        <p
                          className="text-[11px] font-mono font-semibold transition-colors"
                          style={{ color: highlighted ? "#1D4ED8" : "#111827" }}
                        >
                          {p.pct}%
                        </p>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: "#F3F4F6" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(p.pct / 30) * 100}%`,
                            backgroundColor: highlighted ? "#2563EB" : "#93C5FD",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top merchants */}
            <div
              className="rounded-lg bg-white overflow-hidden"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <div
                className="px-4 py-2.5"
                style={{ backgroundColor: "#F3F4F6" }}
              >
                <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-600">
                  Top Merchants by Spend
                </p>
              </div>
              <div className="p-4 space-y-2">
                {TOP_MERCHANTS.map((m, i) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between py-1.5"
                    style={{
                      borderBottom:
                        i < TOP_MERCHANTS.length - 1
                          ? "1px solid #F3F4F6"
                          : "none",
                    }}
                  >
                    <p className="text-[11.5px] text-gray-700 font-medium truncate">
                      {m.name}
                    </p>
                    <p className="text-[11.5px] font-mono font-semibold text-gray-900 flex-shrink-0 ml-2">
                      {m.spend}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer segments */}
            <div
              className="rounded-lg bg-white overflow-hidden transition-all duration-300"
              style={{
                border: segmentsHighlighted
                  ? "1px solid #93C5FD"
                  : "1px solid #E5E7EB",
                boxShadow: segmentsHighlighted
                  ? "0 0 0 3px rgba(59,130,246,0.10)"
                  : "none",
              }}
            >
              <div
                className="px-4 py-2.5"
                style={{ backgroundColor: "#F3F4F6" }}
              >
                <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-600">
                  Customer Segments
                </p>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {SEGMENTS.map((s) => {
                  const glow = segmentsHighlighted && s.glow;
                  return (
                    <div
                      key={s.name}
                      className="rounded-full px-3 py-1.5 flex items-center gap-2 transition-all duration-300"
                      style={{
                        backgroundColor: glow ? "#DBEAFE" : "#EFF6FF",
                        border: glow
                          ? "1px solid #60A5FA"
                          : "1px solid #BFDBFE",
                        boxShadow: glow
                          ? "0 0 10px rgba(37,99,235,0.25)"
                          : "none",
                      }}
                    >
                      <p className="text-[11px] font-semibold text-gray-900">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {s.count}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Life events summary */}
          <div
            className="mt-4 rounded-lg bg-white overflow-hidden transition-all duration-300"
            style={{
              border: lifeEventsHighlighted
                ? "1px solid #93C5FD"
                : "1px solid #E5E7EB",
              boxShadow: lifeEventsHighlighted
                ? "0 0 0 3px rgba(59,130,246,0.10)"
                : "none",
            }}
          >
            <div
              className="px-4 py-2.5"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-600">
                Life Events Detected
              </p>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              {[
                { value: "21", label: "events this period", tone: "neutral" },
                { value: "14", label: "Notable · 83.9% confidence", tone: "blue" },
                { value: "7", label: "Opportunity · 81.4% confidence", tone: "amber" },
              ].map((e) => (
                <div
                  key={e.label}
                  className="rounded-md p-3"
                  style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
                >
                  <p
                    className="text-[18px] font-bold leading-tight"
                    style={{
                      color:
                        e.tone === "blue"
                          ? "#2563EB"
                          : e.tone === "amber"
                          ? "#D97706"
                          : "#111827",
                    }}
                  >
                    {e.value}
                  </p>
                  <p className="text-[10.5px] text-gray-500 mt-0.5 leading-snug">
                    {e.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ci-fade-up {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes ci-typing-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CustomerIntelligenceChatDashboard;
