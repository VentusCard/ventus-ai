import { useState, useRef, useEffect } from "react";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import ReactMarkdown from "react-markdown";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TAB_QUICK_ACTIONS: Record<string, string[]> = {
  dashboard: ["Top spending pillars", "Budget variance alerts", "Pillar growth trends", "Segment spending breakdown"],
  "wallet-share": ["Outflow summary", "Top competitor threats", "Deposit flight trends", "Win-back opportunities"],
  "subscription-analytics": ["Subscription churn risk", "Revenue by subscription tier", "Trending subscriptions", "Cancellation patterns"],
  "rewards-intelligence": ["Seasonal deal opportunities", "Category extension gaps", "Top merchant partnerships", "Timing recommendations"],
  "deal-management": ["Pipeline status overview", "Expiring deals this month", "Top performing deals", "New deal recommendations"],
  "location-experience": ["Top geo-targeted perks", "Underserved regions", "Location engagement rates", "New perk opportunities"],
  gamification: ["Achievement completion rates", "Most popular badges", "Engagement lift from gamification", "New achievement ideas"],
  "life-events": ["Upcoming life event alerts", "Home purchase signals", "Retirement planning signals", "Product recommendations by event"],
  targeting: ["Top cross-sell opportunities", "Segment performance", "Next-best-offer gaps", "Campaign ROI summary"],
  "wm-copilot": ["High-value client risks", "Portfolio rebalancing alerts", "Advisor workload summary", "Client meeting prep"],
  
  "customer-insights": ["Wellness alert summary", "At-risk customers", "Behavioral stress signals", "Intervention recommendations"],
  "fvi-dashboard": ["Vulnerability cohort overview", "Rising risk segments", "Sensitivity drivers", "Policy impact analysis"],
  "fraud-aml": ["Fraud alert summary", "Suspicious activity trends"],
  "ai-assistant-activity": ["Top topics today", "Rising intents", "Unresolved questions", "Life-event signals from chat"],
};

const PLATFORM_CONTEXT = {
  role: "Ventus AI Banking Intelligence Co-Pilot",
  platformDescription:
    "You are the AI co-pilot for a bank-wide customer intelligence and personalization platform. You have access to insights across all modules.",
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
  modules: {
    categoryConsolidation: "Analyzes spending across 12 lifestyle pillars with budgeting insights.",
    competitorOutflow: "Tracks deposit flight to neobanks. Identifies $4.2B annual outflow.",
    customerInsights: "Wellness alerts dashboard showing behavioral stress signals.",
    rewardTripDetection: "Detects travel patterns and reward optimization opportunities.",
    dealManagement: "Merchant partnership pipeline with deal activation.",
    locationalPerks: "Geo-targeted perk aggregation for location-based experiences.",
    gamification: "Achievement engine managing financial wellness badges.",
    lifeEvents: "Predictive life event detection with proactive product recommendations.",
    nextBestProduct: "Segment builder for next-best-offer campaigns.",
    wmCopilot: "Wealth management AI assistant for advisor-level analysis.",
    
  },
};

const TAB_LABELS: Record<string, string> = {
  dashboard: "Lifestyle Analysis",
  "wallet-share": "Outflow Analysis",
  "subscription-analytics": "Subscription Analytics",
  "rewards-intelligence": "Next-Deal Intelligence",
  "deal-management": "Deal Management",
  "location-experience": "Locational Perk Aggregation",
  gamification: "Gamification",
  "life-events": "Life Event Detection",
  targeting: "Next-Best Product Engine",
  "wm-copilot": "WM Copilot",
  
  "customer-insights": "Customer Insights",
  "fvi-dashboard": "Financial Vulnerability",
  "fraud-aml": "Fraud/AML",
  "ai-assistant-activity": "AI Banking Assistant ",
};

interface VentusAIChatPanelProps {
  activeTab: string;
  onClose: () => void;
}

export function VentusAIChatPanel({ activeTab, onClose }: VentusAIChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const context = {
    ...PLATFORM_CONTEXT,
    currentModule: TAB_LABELS[activeTab] || activeTab,
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
              {(TAB_QUICK_ACTIONS[activeTab] || []).map((action) => (
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
              Viewing: <span className="font-medium text-slate-500">{TAB_LABELS[activeTab] || activeTab}</span>
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
