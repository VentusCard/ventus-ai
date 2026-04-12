import { useState, useRef, useEffect, useMemo } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import type { DetectedLifeEventResult, PersonalizedDealData } from "@/hooks/useDemoEnrichment";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  customer: DemoCustomer;
  enriched?: EnrichedTransaction[];
  detectedEvents?: DetectedLifeEventResult[];
  personalizedDeals?: PersonalizedDealData | null;
  initialMessage?: string | null;
  onInitialMessageConsumed?: () => void;
}

const QUICK_ACTIONS = [
  "How much did I spend on sports?",
  "Show my subscriptions",
  "Product recommendations",
  "Life event insights",
  "Where does most of my money go?",
  "My top merchants",
];

function buildContext(
  customer: DemoCustomer,
  enriched?: EnrichedTransaction[],
  detectedEvents?: DetectedLifeEventResult[],
  personalizedDeals?: PersonalizedDealData | null
) {
  const demographics = {
    name: customer.profile.name,
    age: customer.profile.demographics?.age,
    occupation: customer.profile.demographics?.occupation,
    familyStatus: customer.profile.demographics?.familyStatus,
    income: customer.profile.demographics?.incomeLevel || customer.profile.aum,
    segment: customer.profile.segment,
    holdings: customer.profile.holdings
      ? `Deposits: ${customer.profile.holdings.deposit}, Credit: ${customer.profile.holdings.credit}, Mortgage: ${customer.profile.holdings.mortgage}, Investments: ${customer.profile.holdings.investments}`
      : undefined,
  };

  let spendingSummary: any = null;
  if (enriched && enriched.length > 0) {
    const totalSpend = enriched.reduce((s, t) => s + Math.abs(t.amount || 0), 0);
    const totalTransactions = enriched.length;

    // By pillar
    const pillarMap: Record<string, { total: number; count: number; merchants: Record<string, number>; categories: Record<string, { total: number; count: number }> }> = {};
    for (const t of enriched) {
      const p = t.pillar || "Other";
      if (!pillarMap[p]) pillarMap[p] = { total: 0, count: 0, merchants: {}, categories: {} };
      pillarMap[p].total += Math.abs(t.amount || 0);
      pillarMap[p].count++;
      const m = t.normalized_merchant || t.merchant_name;
      pillarMap[p].merchants[m] = (pillarMap[p].merchants[m] || 0) + Math.abs(t.amount || 0);
      const cat = t.category || "Other";
      if (!pillarMap[p].categories[cat]) pillarMap[p].categories[cat] = { total: 0, count: 0 };
      pillarMap[p].categories[cat].total += Math.abs(t.amount || 0);
      pillarMap[p].categories[cat].count++;
    }

    const byPillar = Object.entries(pillarMap)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([pillar, d]) => ({
        pillar,
        total: Math.round(d.total),
        count: d.count,
        topMerchants: Object.entries(d.merchants)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([n]) => n),
        categories: Object.entries(d.categories)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 5)
          .map(([name, v]) => ({ name, total: Math.round(v.total), count: v.count })),
      }));

    // Subscriptions (Monthly/Weekly)
    const subscriptions: { merchant: string; amount: number; frequency: string }[] = [];
    const seen = new Set<string>();
    for (const t of enriched) {
      if ((t.purchase_frequency === "Monthly" || t.purchase_frequency === "Weekly") && !seen.has(t.normalized_merchant || t.merchant_name)) {
        seen.add(t.normalized_merchant || t.merchant_name);
        subscriptions.push({
          merchant: t.normalized_merchant || t.merchant_name,
          amount: Math.abs(t.amount || 0),
          frequency: t.purchase_frequency,
        });
      }
    }

    // Top merchants
    const merchantMap: Record<string, { total: number; count: number }> = {};
    for (const t of enriched) {
      const m = t.normalized_merchant || t.merchant_name;
      if (!merchantMap[m]) merchantMap[m] = { total: 0, count: 0 };
      merchantMap[m].total += Math.abs(t.amount || 0);
      merchantMap[m].count++;
    }
    const topMerchants = Object.entries(merchantMap)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([merchant, d]) => ({ merchant, total: Math.round(d.total), count: d.count }));

    spendingSummary = {
      totalSpend: Math.round(totalSpend),
      totalTransactions,
      byPillar,
      subscriptions: subscriptions.sort((a, b) => b.amount - a.amount),
      topMerchants,
    };
  }

  const lifeEvents = detectedEvents?.map((e) => ({
    name: e.event_name,
    confidence: e.confidence,
    talkingPoints: e.talking_points,
  }));

  const deals = personalizedDeals?.deals?.map((d) => ({
    brand: d.merchantName,
    offer: d.dealTitle,
    match: d.activationCount,
  }));

  return { demographics, spendingSummary, lifeEvents, deals };
}

export default function ConsumerAIChatView({ customer, enriched, detectedEvents, personalizedDeals, initialMessage, onInitialMessageConsumed }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);

  const context = useMemo(
    () => buildContext(customer, enriched, detectedEvents, personalizedDeals),
    [customer, enriched, detectedEvents, personalizedDeals]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (initialMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      sendMessage(initialMessage);
      onInitialMessageConsumed?.();
    }
  }, [initialMessage]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("consumer-chat", {
        body: {
          message: text,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
          context,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data?.message || "I'm here to help! Could you rephrase that?" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 px-4 py-3">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Hi {customer.profile.name.split(" ")[0]}! 👋
            </h3>
            <p className="text-xs text-slate-500 mb-4 max-w-[260px]">
              I can help you understand your spending, find subscriptions, and recommend products.
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[320px]">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-4 max-w-[280px]">
              This chatbot is not connected to a bank. Bank of America product info is used as reference.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-blue-600" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-[13px] max-w-[80%] overflow-hidden break-words",
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-slate max-w-none text-[13px] leading-snug [&_p]:text-[13px] [&_p]:mb-0.5 [&_p]:leading-snug [&_h1]:text-[14px] [&_h1]:mt-1 [&_h2]:text-[13px] [&_h2]:mt-1 [&_h3]:text-[13px] [&_h3]:mt-0.5 [&_ul]:mt-0.5 [&_ul]:mb-0.5 [&_ol]:mt-0.5 [&_li]:text-[13px] [&_li]:leading-tight [&_strong]:text-[13px] [&_em]:text-[13px] [&_a]:text-blue-600 [&_pre]:overflow-x-auto [&_pre]:text-[11px] [&_table]:text-[11px]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3 w-3 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Bot className="h-3 w-3 text-blue-600" />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick actions after conversation started */}
      {!showWelcome && !isLoading && (
        <div className="px-3 pb-1 flex gap-1 overflow-hidden flex-wrap shrink-0">
          {QUICK_ACTIONS.slice(0, 3).map((action) => (
            <button
              key={action}
              onClick={() => sendMessage(action)}
              className="px-2 py-1 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputValue);
          }}
          className="flex gap-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your spending..."
            className="text-sm h-9 rounded-full bg-slate-50 border-slate-200"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="h-9 w-9 rounded-full p-0 shrink-0"
            disabled={isLoading || !inputValue.trim()}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
