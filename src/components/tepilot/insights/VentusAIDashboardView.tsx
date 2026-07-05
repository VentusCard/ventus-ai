import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import { AnalystDashboardView } from "./dashboard/AnalystDashboardView";
import type { TabValue } from "./AnalyticsContainer";

const LEADERSHIP_CONTEXT = {
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

const QUICK_ACTIONS = [
  "Where are we losing deposits?",
  "Top growth pillars this quarter",
  "Which segments need a leadership brief?",
  "Biggest cross-sell opportunities",
];

interface VentusAIDashboardViewProps {
  onNavigate: (tab: TabValue) => void;
}

export function VentusAIDashboardView({ onNavigate }: VentusAIDashboardViewProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage } = useAdvisorChat({
    advisorContext: LEADERSHIP_CONTEXT,
    functionName: "bankwide-chat",
  });

  useEffect(() => {
    if (messages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleQuickAction = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full min-h-0 -m-4">
      {/* Dashboard */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <AnalystDashboardView onNavigate={onNavigate} />
      </div>

      {/* Leadership chat */}
      <div className="shrink-0 border-t border-slate-200 bg-slate-50">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 shrink-0">
              <span className="text-[10px] font-black text-white leading-tight">V</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                Ventus AI · Leadership briefing
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                Ask the co-pilot about your bankwide book.
              </div>
            </div>
          </div>
          {messages.length === 0 && (
            <div className="hidden md:flex flex-wrap gap-1.5 justify-end">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => handleQuickAction(a)}
                  disabled={isLoading}
                  className="px-2 py-1 text-[11px] rounded-md bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-200 hover:border-blue-200 disabled:opacity-50"
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 pb-2">
          <div className="max-h-[200px] overflow-y-auto space-y-2 rounded-md bg-white border border-slate-200 p-2.5">
            {messages.length === 0 ? (
              <p className="text-[12px] text-slate-400 py-4 text-center">
                Ask about your book — bankwide metrics, growth pillars, outflow, life-event signals.
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-[12px] leading-relaxed rounded-lg px-2.5 py-2 max-w-[85%]",
                    msg.role === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-xs max-w-none [&_p]:text-[12px] [&_p]:leading-relaxed [&_p]:my-1 [&_li]:text-[12px] [&_strong]:text-slate-900 [&_h1]:text-[13px] [&_h2]:text-[13px] [&_h3]:text-[12px] [&_ul]:my-1 [&_ol]:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-1.5 text-slate-400 px-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[11px]">Analyzing…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask Ventus AI about your bankwide book…"
              className="flex-1 text-[12px] px-3 py-2 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 placeholder:text-slate-400"
              disabled={isLoading}
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-8 w-8 shrink-0 text-slate-400 hover:text-blue-600"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
