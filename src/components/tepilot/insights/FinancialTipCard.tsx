import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EnrichedTransaction } from "@/types/transaction";
import { generateFinancialTip, FinancialTip } from "@/lib/wellnessIntelligenceEngine";
import { supabase } from "@/integrations/supabase/client";
import {
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Send,
  Bot,
  User,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FinancialTipCardProps {
  enrichedTransactions: EnrichedTransaction[];
}

export function FinancialTipCard({ enrichedTransactions }: FinancialTipCardProps) {
  const tip = useMemo(() => generateFinancialTip(enrichedTransactions), [enrichedTransactions]);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responded, setResponded] = useState(false);

  const openChatWithResponse = async (preset: "acknowledged" | "needs_help") => {
    const userMsg = preset === "acknowledged"
      ? "Got it, I'll do that!"
      : "I don't have enough funds right now.";

    const initialMessages: ChatMessage[] = [
      { role: "assistant", content: tip.message },
      { role: "user", content: userMsg },
    ];

    setMessages(initialMessages);
    setChatOpen(true);
    setResponded(true);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("consumer-chat", {
        body: {
          message: userMsg,
          conversationHistory: [{ role: "assistant", content: tip.message }],
          context: {
            mode: "financial-tip-chat",
            tipCategory: tip.category,
            tipMessage: tip.message,
            customerResponse: preset,
            systemPrompt: "You are a friendly, empowering financial coach inside a banking app. The customer just received a financial tip and responded. Help them take action. Never use words like 'stress', 'risk', or 'danger'. Frame everything as opportunity and optimization. Keep responses concise (2-3 sentences max).",
          },
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: "assistant" as const,
        content: data?.message || "That's a great step! I'm here if you need any more guidance on managing your finances.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant" as const,
        content: preset === "acknowledged"
          ? "That's great to hear! Setting up an automatic payment a few days early can make this effortless. Would you like me to help you set that up?"
          : "No worries — that's completely normal. Let's look at a few small adjustments that could free up some room. Would you like to see where you could trim $50-100 this month?",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("consumer-chat", {
        body: {
          message: inputValue,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          context: {
            mode: "financial-tip-chat",
            tipCategory: tip.category,
            systemPrompt: "You are a friendly, empowering financial coach. Keep responses concise (2-3 sentences). Never use alarming language.",
          },
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: "assistant" as const,
        content: data?.message || "I'm here to help! Let me know if you have any other questions.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant" as const,
        content: "I appreciate you sharing that. Let me suggest a few practical steps you can take today.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="border-slate-200 bg-white h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Smart Financial Tip
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Tip content */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-white/80 shrink-0">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-700 border-blue-200">
                    {tip.category}
                  </Badge>
                  {tip.potentialSavings && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
                      <DollarSign className="h-2.5 w-2.5 mr-0.5" />
                      Save {tip.potentialSavings}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mt-2">
                  {tip.message}
                </p>
              </div>
            </div>
          </div>

          {/* Response buttons */}
          {!responded ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                onClick={() => openChatWithResponse("acknowledged")}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Got it, I'll do that
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                onClick={() => openChatWithResponse("needs_help")}
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                I don't have enough funds
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-slate-200 text-slate-600"
              onClick={() => setChatOpen(true)}
            >
              <Bot className="h-3.5 w-3.5 mr-1.5" />
              Continue conversation
            </Button>
          )}

          {/* Logged indicator */}
          {responded && (
            <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
              <CheckCircle className="h-2.5 w-2.5" />
              Your response has been shared with your financial advisor
            </p>
          )}
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0">
          <DialogHeader className="p-4 pb-3 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-blue-600" />
              Financial Tip Chat
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 ml-auto">
                {tip.category}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[320px] p-4">
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    )}
                  >
                    {msg.content}
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
                  <div className="bg-slate-100 rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-slate-100">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="text-sm h-9"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" className="h-9 px-3" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
