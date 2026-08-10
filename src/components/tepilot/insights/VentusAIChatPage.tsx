import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";

export const LEADERSHIP_CONTEXT = {
  role: "Ventus AI briefing analyst for bank executive leadership",
  audience: "CEO, Chief Retail Officer, Chief Data Officer, Head of Wealth",
  responseGuidance:
    "Answer in an executive tone: 2–4 concise bullet points, quantify with bankwide metrics where possible, no code, no jargon. Frame as strategic implications for the leadership team.",
  currentModule: "Ventus AI Dashboard — Leadership Briefing",
  bankwideMetrics: {
    totalAccounts: "120M",
    totalUsers: "75M",
    totalAnnualSpend: "$385B",
    avgAccountsPerUser: 1.6,
    activeAccountRate: "87.3%",
    crossSellRate: "34.2%",
    topSpendingPillar: "Food & Dining",
  },
  hotTrends: [
    "Travel & Exploration spending up 12% MoM — strongest growth pillar",
    "Neobank outflow at $4.2B annually with deposit flight rate trending up",
    "Home Purchase life event signals up 8% QoQ across 2.1M households",
    "Holiday spending wave beginning in Q4 — gift & travel categories accelerating",
    "Sports & Active Living is the #2 pillar by spend volume across all card products",
  ],
};

export const VENTUS_QUICK_ACTIONS = [
  "Where are we losing deposits?",
  "Top growth pillars this quarter",
  "Which segments need a leadership brief?",
  "Biggest cross-sell opportunities",
];

interface VentusAIChatPageProps {
  /** Prompt queued from another surface (e.g. the dashboard sliver chips). */
  pendingPrompt?: string | null;
  onPendingPromptConsumed?: () => void;
  active?: boolean;
}

export function VentusAIChatPage({ pendingPrompt, onPendingPromptConsumed, active = true }: VentusAIChatPageProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage } = useAdvisorChat({
    advisorContext: LEADERSHIP_CONTEXT,
    functionName: "bankwide-chat",
  });

  const handleSend = useCallback(
    (value?: string) => {
      const text = (value ?? input).trim();
      if (!text || isLoading) return;
      sendMessage(text);
      setInput("");
    },
    [input, isLoading, sendMessage],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  useEffect(() => {
    if (active) setTimeout(() => inputRef.current?.focus(), 40);
  }, [active]);

  useEffect(() => {
    if (!pendingPrompt) return;
    handleSend(pendingPrompt);
    onPendingPromptConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Gradient hero header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-t-xl px-6 py-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30">
            <span className="text-lg font-black text-blue-400 leading-none">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Ventus AI · Leadership briefing</h1>
            <p className="text-xs text-blue-200/70 mt-0.5">Ask the co-pilot about your bankwide book.</p>
          </div>
        </div>
      </div>

      {/* Chat body */}
      <div className="flex-1 min-h-0 bg-white border border-t-0 border-slate-200 rounded-b-xl flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">How can I help you today?</p>
              <p className="text-xs text-slate-400 max-w-md">
                I have full context on bankwide spending, segments, competitor outflows, and life-event
                signals.
              </p>
              <div className="flex flex-wrap gap-2 mt-5 justify-center">
                {VENTUS_QUICK_ACTIONS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 border border-slate-200 text-slate-800",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-slate max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-slate-500">Analyzing…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask Ventus AI about your bankwide book…"
              className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
