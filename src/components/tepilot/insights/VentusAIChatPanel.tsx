import { useState, useRef, useEffect } from "react";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import ReactMarkdown from "react-markdown";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTabContext } from "@/lib/ventusAiTabContext";

const PLATFORM_CONTEXT = {
  role: "Ventus AI Banking Intelligence Co-Pilot",
  platformDescription:
    "You are the AI co-pilot for a bank-wide customer intelligence and personalization platform. You have access to insights across all modules.",
  bankwideMetrics: {
    totalAccounts: "109M",
    totalUsers: "68.2M",
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
  modules: {
    categoryConsolidation: "Analyzes spending across 12 lifestyle pillars with budgeting insights.",
    competitorOutflow: "Tracks deposit flight to neobanks. Identifies $4.2B annual outflow.",
    customerInsights: "Wellness alerts dashboard showing behavioral stress signals.",
    personalizedDeals: "Unified deals, perks, and gamification surface: seasonal deal intelligence, merchant activation, location perks, and achievement-driven engagement programs.",
    lifeEvents: "Predictive life event detection with proactive product recommendations.",
    nextBestProduct: "Segment builder for next-best-offer campaigns.",
    wmCopilot: "Wealth management AI assistant for advisor-level analysis.",
  },
};

interface VentusAIChatPanelProps {
  activeTab: string;
  onClose: () => void;
  /** Optional extra context specific to the current view (e.g. selected opportunity id). */
  contextExtras?: Record<string, unknown>;
}

export function VentusAIChatPanel({ activeTab, onClose, contextExtras }: VentusAIChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tabContext = getTabContext(activeTab);

  const context = {
    ...PLATFORM_CONTEXT,
    currentModule: tabContext.label,
    currentModuleContext: {
      tabKey: activeTab,
      summary: tabContext.summary,
      keyData: tabContext.keyData,
      suggestedNav: tabContext.suggestedNav,
      onScreenItems: tabContext.onScreenItems,
      ...(contextExtras ?? {}),
    },
  };

  const { messages, isLoading, sendMessage } = useAdvisorChat({
    advisorContext: context,
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

  const quickActions = tabContext.quickActions ?? [];
  const currentLabel = tabContext.label;

  return (
    <div className="w-[260px] shrink-0 border-l border-slate-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900">
            <span className="text-[10px] font-black text-white leading-tight">V</span>
          </div>
          <span className="text-xs font-semibold text-slate-700">Ventus AI</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Quick actions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                  className="px-2 py-1 text-[11px] rounded-md bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-200 hover:border-blue-200 disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Viewing: <span className="font-medium text-slate-500">{currentLabel}</span>
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "text-[12px] leading-relaxed rounded-lg px-2.5 py-2",
              msg.role === "user"
                ? "bg-blue-600 text-white ml-4"
                : "bg-slate-100 text-slate-700 mr-2"
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
        ))}

        {isLoading && (
          <div className="flex items-center gap-1.5 text-slate-400 px-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-[11px]">Analyzing…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-2">
        <div className="flex items-center gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask Ventus AI…"
            className="flex-1 text-[12px] px-2.5 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 placeholder:text-slate-400"
            disabled={isLoading}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="h-7 w-7 shrink-0 text-slate-400 hover:text-blue-600"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
