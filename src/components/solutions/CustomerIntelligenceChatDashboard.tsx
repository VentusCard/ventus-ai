import { useEffect, useMemo, useRef, useState } from "react";

type ChatTurn = {
  id: string;
  question: string;
  typingMs: number;
  answer: string;
  highlight: "genz" | "pickleball" | "churn";
};

const CONVERSATION: ChatTurn[] = [
  {
    id: "genz",
    question: "What are Gen Z customers spending on?",
    typingMs: 800,
    answer:
      "Gen Z customers are concentrated in Food & Dining (34%), Entertainment (22%), and Health & Wellness (18%). Spending is heavily skewed toward delivery, streaming, and boutique fitness — with a notable spike in travel bookings this quarter.",
    highlight: "genz",
  },
  {
    id: "pickleball",
    question: "How much was spent on pickleball last quarter?",
    typingMs: 600,
    answer:
      "$284,000 across 1,240 transactions — up 47% from last quarter. Concentrated in customers aged 35-55 with a Sports & Active Living pillar score above 0.7.",
    highlight: "pickleball",
  },
  {
    id: "churn",
    question: "Which customers are most likely to churn?",
    typingMs: 800,
    answer:
      "34 customers show declining engagement — reduced transaction frequency over 60 days, no new product adoption, and decreasing average spend. Recommended: proactive outreach within 14 days.",
    highlight: "churn",
  },
];

const PILLARS = [
  { name: "Food & Dining", pct: 28.4, key: "food" },
  { name: "Entertainment", pct: 19.7, key: "entertainment" },
  { name: "Sports & Active Living", pct: 16.2, key: "sports" },
  { name: "Travel & Exploration", pct: 14.8, key: "travel" },
  { name: "Health & Wellness", pct: 12.1, key: "health" },
];

const QUESTION_READ_MS = 900;
const ANSWER_READ_MS = 4200;
const PAUSE_BETWEEN_TURNS_MS = 2000;
const PAUSE_BETWEEN_CYCLES_MS = 3000;

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

  // Build visible chat history: previous turns of the current cycle plus the active one.
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
        showQuestion: isActive ? phase !== "question" || true : true,
        showTyping: isActive && phase === "typing",
        showAnswer: isActive ? phase === "answer" || phase === "pause" : true,
        key: `${cycleKey}-${i}`,
      });
    }
    return items;
  }, [turnIndex, phase, cycleKey]);

  // Auto-scroll chat to bottom whenever phase or turn changes.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [phase, turnIndex, cycleKey]);

  // Determine highlight state for the dashboard.
  // Highlight is "active" once the answer starts and remains until the next question.
  const activeHighlight: ChatTurn["highlight"] | null =
    phase === "answer" || phase === "pause" ? turn.highlight : null;

  const isPillarHighlighted = (key: string) => {
    if (activeHighlight === "genz") return key === "food" || key === "entertainment";
    if (activeHighlight === "pickleball") return key === "sports";
    return false;
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 lg:gap-0">
        {/* Left: Chat (40%) */}
        <div className="lg:pr-6">
          <div
            ref={scrollRef}
            className="rounded-xl p-4 h-[420px] overflow-y-auto scroll-smooth"
            style={{
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E7EB",
            }}
          >
            <div className="flex flex-col gap-3">
              {visibleTurns.map((item) => (
                <div key={item.key} className="flex flex-col gap-2">
                  {/* User question (right) */}
                  {item.showQuestion && (
                    <div
                      className="self-end max-w-[85%] px-3.5 py-2 rounded-2xl rounded-tr-sm text-white text-[12.5px] leading-snug"
                      style={{
                        backgroundColor: "#2563EB",
                        animation: "ci-fade-up 320ms ease-out both",
                      }}
                    >
                      {item.turn.question}
                    </div>
                  )}

                  {/* Typing */}
                  {item.showTyping && (
                    <div
                      className="self-start"
                      style={{ animation: "ci-fade-up 200ms ease-out both" }}
                    >
                      <TypingDots />
                    </div>
                  )}

                  {/* AI answer (left) */}
                  {item.showAnswer && (
                    <div
                      className="self-start max-w-[90%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-gray-800 text-[12.5px] leading-snug bg-white"
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

        {/* Vertical divider */}
        <div className="hidden lg:block absolute" />

        {/* Right: Mini dashboard (60%) */}
        <div
          className="lg:pl-6 mt-6 lg:mt-0"
          style={{
            borderLeft: undefined,
          }}
        >
          <div className="hidden lg:block" />
          <div
            className="lg:border-l lg:border-gray-200 lg:-ml-6 lg:pl-6 h-full"
            style={{ borderColor: "#E5E7EB" }}
          >
            {/* Top stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { value: "22", label: "customers enriched" },
                { value: "218", label: "transactions analyzed" },
                { value: "90%", label: "avg confidence" },
              ].map((s) => (
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

            {/* Pillar distribution */}
            <div
              className="rounded-lg bg-white overflow-hidden"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <div
                className="px-4 py-2.5 flex items-center justify-between"
                style={{ backgroundColor: "#F3F4F6" }}
              >
                <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-600">
                  Lifestyle Pillar Distribution
                </p>
                {activeHighlight === "churn" && (
                  <div
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "#FEE2E2",
                      border: "1px solid #FCA5A5",
                      animation: "ci-fade-up 320ms ease-out both",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-[10px] font-semibold text-red-700">
                      34 at-risk customers
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2.5">
                {PILLARS.map((p) => {
                  const highlighted = isPillarHighlighted(p.key);
                  return (
                    <div
                      key={p.key}
                      className="rounded-md px-2 py-1.5 transition-all duration-300"
                      style={{
                        border: highlighted
                          ? "1px solid #3B82F6"
                          : "1px solid transparent",
                        backgroundColor: highlighted ? "#EFF6FF" : "transparent",
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
          </div>
        </div>
      </div>

      {/* Animations */}
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
