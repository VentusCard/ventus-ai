import { useState, useRef, useEffect } from "react";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import ReactMarkdown from "react-markdown";
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users,
  BarChart3, Wallet, Heart, CalendarHeart,
  Route, Briefcase, Send, Loader2, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabValue = 'dashboard' | 'targeting' | 'wallet-share' | 'customer-insights' | 'personalized-deals' | 'personalized-relationship';

interface VentusAIWelcomeViewProps {
  onNavigate: (tab: TabValue) => void;
}

const HOT_TRENDS = [
  {
    label: "Travel & Exploration",
    value: "↑ 12% MoM",
    detail: "Strongest growth pillar across 17.8M users",
    icon: TrendingUp,
    accent: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Neobank Outflow",
    value: "$4.2B annually",
    detail: "Deposit flight rate trending up — 3.2% of base",
    icon: AlertTriangle,
    accent: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
  },
  {
    label: "Home Purchase Signals",
    value: "↑ 8% QoQ",
    detail: "Life event detection across 2.1M households",
    icon: TrendingUp,
    accent: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
  },
  {
    label: "Holiday Spending Wave",
    value: "Starting Q4",
    detail: "Seasonal pattern: gift & travel categories accelerating",
    icon: DollarSign,
    accent: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
  },
  {
    label: "Portfolio Overview",
    value: "$385B annual spend",
    detail: "109M accounts across 68.2M unique users",
    icon: Users,
    accent: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
  },
];

const SUGGESTED_PROMPTS = [
  "Grow net new assets this quarter",
  "Where are deposits leaking to competitors?",
  "Which households are ready for wealth advice?",
  "Who's financially vulnerable and should be protected?",
];

type NavGroup = "featured" | "grow" | "protect" | "operate";
const NAV_CARDS: { tab: TabValue; label: string; description: string; icon: React.ElementType; group: NavGroup }[] = [
  { tab: "personalized-relationship", label: "Personalized Relationship", description: "Customer insights, life events, assistant activity, and WM Coworker", icon: Briefcase, group: "featured" },
  { tab: "targeting", label: "Next-Best Product", description: "Segment-level product recommendations", icon: Route, group: "grow" },
  { tab: "personalized-relationship", label: "Personalized Relationship", description: "Customer insights, life events, assistant activity, and WM Coworker", icon: CalendarHeart, group: "grow" },
  { tab: "personalized-deals", label: "Personalized Deals", description: "Deals, perks, and engagement programs", icon: Sparkles, group: "grow" },
  { tab: "wallet-share", label: "Outflow Detection", description: "Competitor deposit-flight tracking", icon: Wallet, group: "protect" },
  { tab: "dashboard", label: "Category Consolidation", description: "Pillar-level spend analysis", icon: BarChart3, group: "operate" },
];

const NAV_GROUPS: { key: NavGroup; label: string }[] = [
  { key: "grow", label: "Grow — acquire & deepen" },
  { key: "protect", label: "Protect — retain & manage risk" },
  { key: "operate", label: "Operate — run the book" },
];

const PLATFORM_CONTEXT = {
  role: "Ventus AI Banking Intelligence Co-Pilot",
  platformDescription: "You are the AI co-pilot for a bank-wide customer intelligence and personalization platform. You have access to insights across all modules.",
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
    categoryConsolidation: "Analyzes spending across 12 lifestyle pillars (Food & Dining, Travel, Style & Beauty, etc.) with budgeting insights, pillar distribution by card product, and age/region heatmaps.",
    competitorOutflow: "Tracks deposit flight to neobanks, fintechs, and brokerages. Identifies $4.2B annual outflow with win-back recommendations.",
    customerInsights: "Wellness alerts dashboard showing behavioral stress signals, optimization opportunities, and sentiment analysis across the customer base.",
    personalizedDeals: "Unified deals, perks, and gamification surface: seasonal deal intelligence, merchant partnership activation, location-based perks, and achievement-driven engagement programs.",
    lifeEvents: "Predictive life event detection (home purchase, new baby, retirement, etc.) with proactive product recommendations.",
    nextBestProduct: "Segment builder with demographic, lifestyle, and product targeting for next-best-offer campaigns.",
    wmCopilot: "Wealth management AI assistant for advisor-level client analysis and portfolio intelligence.",
    wealthIntelligence: "Book-level wealth intelligence that combines money movement, life events, targeting, and campaign activation.",
  },
  cardProducts: [
    "Cashback Card (38.5M accounts, top pillar: Food & Dining)",
    "Custom Cashback Card (29M accounts, top pillar: Style & Beauty)",
    "Travel Card (19.5M accounts, top pillar: Travel & Exploration)",
    "Airline Card (13.2M accounts, top pillar: Travel & Exploration)",
    "Hotel Card (10.5M accounts, top pillar: Travel & Exploration)",
    "Premium Travel Card (9.3M accounts, avg spend $9,800/account)",
  ],
};

export function VentusAIWelcomeView({ onNavigate }: VentusAIWelcomeViewProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useAdvisorChat({
    advisorContext: PLATFORM_CONTEXT,
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

  return (
    <div className="min-h-full -m-4">
      {/* Gradient Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-8 pt-10 pb-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30">
              <span className="text-lg font-black text-blue-400 leading-tight">V</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Ventus AI</h1>
              <p className="text-sm text-blue-200/70">Banking intelligence — ask an objective, jump to a desk</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            State an objective in plain language, or jump straight to a desk below.
          </p>

          {/* Hot Trends Strip */}
          <div className="mt-6 grid grid-cols-5 gap-3">
            {HOT_TRENDS.map((trend) => {
              const Icon = trend.icon;
              return (
                <div
                  key={trend.label}
                  className={cn(
                    "rounded-lg border p-3 backdrop-blur-sm transition-all hover:scale-[1.02]",
                    trend.border,
                    trend.bg
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={cn("w-3.5 h-3.5", trend.accent)} />
                    <span className="text-[11px] font-semibold text-white/90 truncate">{trend.label}</span>
                  </div>
                  <p className={cn("text-lg font-bold leading-tight", trend.accent)}>{trend.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">{trend.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-50 px-8 pb-2">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Chat Messages */}
            <div className="h-[340px] overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">How can I help you today?</p>
                  <p className="text-xs text-slate-400 max-w-md">
                    I have full context on spending trends, customer segments, competitor outflows, life events, and all platform modules.
                  </p>
                  {/* Suggested Prompts */}
                  <div className="flex flex-wrap gap-2 mt-5 justify-center">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => { setInput(""); sendMessage(prompt); }}
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
                          : "bg-slate-50 border border-slate-200 text-slate-800"
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
                    <span className="text-xs text-slate-500">Analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-200 p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Tell Ventus an objective — or ask about trends, segments, risk…"
                className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 placeholder:text-slate-400"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-auto"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="px-8 pt-6 pb-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          {/* Flagship */}
          {(() => {
            const w = NAV_CARDS.find((c) => c.group === "featured");
            if (!w) return null;
            const Icon = w.icon;
            return (
              <button
                onClick={() => onNavigate(w.tab)}
                className="group mb-5 flex w-full items-center gap-4 rounded-2xl border-2 border-blue-200 bg-white p-5 text-left transition hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-900">{w.label}</p>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Flagship</span>
                  </div>
                  <p className="text-xs text-slate-500">{w.description}</p>
                </div>
                <span className="flex flex-none items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })()}

          {NAV_GROUPS.map((g) => (
            <div key={g.key} className="mb-4">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{g.label}</h2>
              <div className="grid grid-cols-4 gap-3">
                {NAV_CARDS.filter((c) => c.group === g.key).map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.tab}
                      onClick={() => onNavigate(card.tab)}
                      className="group text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                          <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">{card.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{card.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
