import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Sparkles, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import { AnalystDashboardView } from "./dashboard/AnalystDashboardView";
import { FVIDashboard } from "./fvi/FVIDashboard";
import { CustomersDirectoryView } from "./customers/CustomersDirectoryView";
import { SubTabBar, type SubTabItem } from "./SubTabBar";
import { ReportsAndQueryView } from "./reports/ReportsAndQueryView";
import { QueryConsoleView } from "./QueryConsoleView";
import type { InteractiveReportId } from "./reports/interactiveReportsRegistry";
import { ShieldAlert, LayoutDashboard, FileBarChart, Terminal, Users } from "lucide-react";
import type { TabValue } from "./AnalyticsContainer";

const DASHBOARD_SECTIONS: SubTabItem[] = [
  { value: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { value: "customers", label: "Customers", icon: <Users className="w-3.5 h-3.5" /> },
  { value: "reports", label: "Reports", icon: <FileBarChart className="w-3.5 h-3.5" /> },
  { value: "query", label: "Query", icon: <Terminal className="w-3.5 h-3.5" /> },
  { value: "risk", label: "Risk", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
];

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

const SLIVER_CHIPS = QUICK_ACTIONS.slice(0, 2);

interface VentusAIDashboardViewProps {
  onNavigate: (tab: TabValue) => void;
  onOpenOpportunity?: (opportunityId: string) => void;
  onOpenInteractiveReport?: (id: InteractiveReportId, payload?: { opportunityId?: string }) => void;
  initialSection?: "overview" | "customers" | "reports" | "query" | "risk";
}

export function VentusAIDashboardView({ onNavigate, onOpenOpportunity, onOpenInteractiveReport, initialSection = "overview" }: VentusAIDashboardViewProps) {
  const [section, setSection] = useState<string>(initialSection);
  const [consoleQuery, setConsoleQuery] = useState<string | undefined>(undefined);
  useEffect(() => { setSection(initialSection); }, [initialSection]);

  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage } = useAdvisorChat({
    advisorContext: LEADERSHIP_CONTEXT,
    functionName: "bankwide-chat",
  });

  // Auto-expand when a message arrives
  useEffect(() => {
    if (messages.length > 0) setExpanded(true);
  }, [messages.length]);

  useEffect(() => {
    if (!expanded) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    // focus input after expand
    setTimeout(() => overlayInputRef.current?.focus(), 30);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const handleSend = useCallback(
    (value?: string) => {
      const text = (value ?? input).trim();
      if (!text || isLoading) return;
      sendMessage(text);
      setInput("");
      setExpanded(true);
    },
    [input, isLoading, sendMessage],
  );

  const renderSliver = () => (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className="group w-full text-left rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 shrink-0">
          <span className="text-sm font-black text-blue-300 leading-none">V</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-white truncate">
              Ask Ventus AI
            </span>
            <span className="text-[11px] text-blue-200/80 truncate hidden sm:inline">
              Leadership briefing — your bankwide book
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            Ask about outflow, growth pillars, life-event signals…
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          {SLIVER_CHIPS.map((chip) => (
            <span
              key={chip}
              onClick={(e) => {
                e.stopPropagation();
                handleSend(chip);
              }}
              className="px-2 py-1 text-[11px] rounded-md bg-white/10 text-blue-100 hover:bg-white/20 border border-white/10 transition-colors cursor-pointer"
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-blue-200 group-hover:text-white transition-colors shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );

  return (
    <>
      <div className="space-y-4">
        <SubTabBar items={DASHBOARD_SECTIONS} value={section} onChange={setSection} />
        {section === "overview" && (
          <AnalystDashboardView onNavigate={onNavigate} onOpenOpportunity={onOpenOpportunity} renderVentusSliver={renderSliver} />
        )}
        {section === "customers" && <CustomersDirectoryView />}
        {section === "reports" && (
          <ReportsAndQueryView
            onOpenInteractiveReport={onOpenInteractiveReport}
            onRunInConsole={(sql) => { setConsoleQuery(sql); setSection("query"); }}
          />
        )}
        {section === "query" && <QueryConsoleView initialQuery={consoleQuery} />}
        {section === "risk" && <FVIDashboard />}
      </div>

      {expanded && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
          {/* Gradient hero header */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-8 pt-6 pb-5 shrink-0">
            <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30">
                  <span className="text-lg font-black text-blue-400 leading-none">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Ventus AI · Leadership briefing
                  </h1>
                  <p className="text-xs text-blue-200/70 mt-0.5">
                    Ask the co-pilot about your bankwide book.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="text-slate-300 hover:text-white hover:bg-white/10 h-9 w-9"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat body */}
          <div className="flex-1 min-h-0 overflow-hidden bg-gradient-to-b from-slate-900/0 to-slate-50">
            <div className="max-w-5xl mx-auto h-full px-8 py-6">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 h-full flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        How can I help you today?
                      </p>
                      <p className="text-xs text-slate-400 max-w-md">
                        I have full context on bankwide spending, segments, competitor outflows,
                        and life-event signals.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-5 justify-center">
                        {QUICK_ACTIONS.map((prompt) => (
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
                      <div
                        key={i}
                        className={cn(
                          "flex",
                          msg.role === "user" ? "justify-end" : "justify-start",
                        )}
                      >
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
                      ref={overlayInputRef}
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
          </div>
        </div>
      )}
    </>
  );
}
