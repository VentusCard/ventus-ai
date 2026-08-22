import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ArrowUp, Compass, FileText, LineChart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import { PromptRail } from "./ventus-chat/PromptRail";
import { ContextPanel } from "./ventus-chat/ContextPanel";
import { ChatMessage } from "./ventus-chat/ChatMessage";
import { PriorityBriefing } from "./ventus-chat/PriorityBriefing";
import { getRevenueOpportunities } from "@/lib/mockBankwideData";
import { getVentusPriorityCards } from "@/lib/ventusPriorityCards";

const EMPTY_FILTERS = { cardProducts: [], regions: [], ageRanges: [] };

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

const CAPABILITY_CARDS = [
  {
    icon: LineChart,
    title: "Explain a shift",
    body: "Break down what moved in the book and why.",
    prompt: "What changed most in bankwide spending this quarter, and why?",
  },
  {
    icon: Compass,
    title: "Find the opportunity",
    body: "Surface the highest-value segment to act on next.",
    prompt: "Biggest cross-sell opportunities",
  },
  {
    icon: FileText,
    title: "Draft the brief",
    body: "Turn the signals into a leadership-ready summary.",
    prompt: "Draft a one-page brief for the retail leadership team",
  },
];

const LOADING_STEPS = [
  "Reading bankwide spend…",
  "Matching segments and life-event signals…",
  "Drafting the briefing…",
];

interface VentusAIChatPageProps {
  /** Prompt queued from another surface (e.g. the dashboard sliver chips). */
  pendingPrompt?: string | null;
  onPendingPromptConsumed?: () => void;
  active?: boolean;
  onNavigate?: (tab: string) => void;
  /** Deep-link into the priority briefing report for an opportunity. */
  onOpenOpportunity?: (opportunityId: string) => void;
}

export function VentusAIChatPage({
  pendingPrompt,
  onPendingPromptConsumed,
  active = true,
  onNavigate,
  onOpenOpportunity,
}: VentusAIChatPageProps) {
  const [input, setInput] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const priorityCards = useMemo(
    () => getVentusPriorityCards(getRevenueOpportunities(EMPTY_FILTERS)),
    [],
  );

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
      requestAnimationFrame(() => {
        if (inputRef.current) inputRef.current.style.height = "auto";
        inputRef.current?.focus();
      });
    },
    [input, isLoading, sendMessage],
  );

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) handleSend(lastUser.content);
  }, [messages, handleSend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (active) setTimeout(() => inputRef.current?.focus(), 40);
  }, [active]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const id = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1800);
    return () => clearInterval(id);
  }, [isLoading]);

  useEffect(() => {
    if (!pendingPrompt) return;
    handleSend(pendingPrompt);
    onPendingPromptConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  const hasMessages = messages.length > 0;
  const followUps = VENTUS_QUICK_ACTIONS.filter((q) => !messages.some((m) => m.content === q)).slice(0, 3);
  const showFollowUps =
    hasMessages && !isLoading && messages[messages.length - 1]?.role === "assistant" && followUps.length > 0;

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <PromptRail onSelect={handleSend} />

      {/* Center column */}
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <span className="text-base font-black leading-none text-white">V</span>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-slate-900">
                Ask Ventus AI · Leadership briefing
              </h1>
              <p className="text-[11px] text-slate-500">
                Grounded on 75M customers · 120M accounts · $385B annual spend
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10.5px] font-medium text-emerald-700 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live context
          </span>
        </header>

        {/* Transcript */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto w-full max-w-[760px] space-y-6">
            {!hasMessages ? (
              <div className="pt-2">
                <PriorityBriefing
                  cards={priorityCards}
                  onAsk={(prompt) => handleSend(prompt)}
                  onOpenOpportunity={onOpenOpportunity}
                  onNavigate={onNavigate}
                />

                <div className="my-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10.5px] uppercase tracking-wide text-slate-400">
                    Or ask anything
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600">
                    <span className="text-xl font-black leading-none text-white">V</span>
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Your bankwide briefing analyst
                  </h2>
                  <p className="mx-auto mt-1 max-w-md text-[12.5px] leading-relaxed text-slate-500">
                    Ask about spending shifts, competitor outflow, segments, life-event signals, and what
                    leadership should do next.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {CAPABILITY_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.title}
                        onClick={() => handleSend(card.prompt)}
                        className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm"
                      >
                        <Icon className="mb-2 h-4 w-4 text-blue-600" />
                        <p className="text-[13px] font-semibold text-slate-800">{card.title}</p>
                        <p className="mt-1 text-[11.5px] leading-snug text-slate-500">{card.body}</p>
                        <p className="mt-2.5 text-[11px] italic leading-snug text-blue-600">"{card.prompt}"</p>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-5 text-center text-[10.5px] text-slate-400">
                  Grounded on transaction enrichment, pillar rollups, competitor outflow, and life-event
                  detection across the bankwide book.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  onRegenerate={
                    msg.role === "assistant" && i === messages.length - 1 && !isLoading ? regenerate : undefined
                  }
                />
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="animate-pulse text-[12px]">{LOADING_STEPS[loadingStep]}</span>
              </div>
            )}

            {showFollowUps && (
              <div className="flex flex-wrap gap-2 pt-1">
                {followUps.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto w-full max-w-[760px]">
            <div
              className={cn(
                "rounded-xl border bg-white transition-colors",
                isLoading ? "border-slate-200" : "border-slate-300 focus-within:border-blue-400",
              )}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 160)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Ventus AI about your bankwide book…"
                disabled={isLoading}
                className="max-h-40 w-full resize-none bg-transparent px-4 pt-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] text-slate-500">
                    Scope: Bankwide book
                  </span>
                  <span className="hidden text-[10.5px] text-slate-400 sm:inline">
                    Enter to send · Shift+Enter for a new line
                  </span>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    isLoading || !input.trim()
                      ? "bg-slate-100 text-slate-400"
                      : "bg-slate-900 text-white hover:bg-slate-800",
                  )}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContextPanel
        metrics={LEADERSHIP_CONTEXT.bankwideMetrics}
        hotTrends={LEADERSHIP_CONTEXT.hotTrends}
        onNavigate={onNavigate}
      />
    </div>
  );
}
