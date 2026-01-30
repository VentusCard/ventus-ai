import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { PromptSuggestions } from "./PromptSuggestions";
import { generateChatPrompts } from "@/utils/generateChatPrompts";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Profile {
  lifestyle_goal?: string | null;
  selected_categories?: string[] | null;
}

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  profile?: Profile | null;
}
export const ChatPanel = ({
  messages,
  isLoading,
  onSendMessage,
  profile
}: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate prompts when messages change or on mount
  useEffect(() => {
    const prompts = generateChatPrompts(profile || null, messages);
    setSuggestedPrompts(prompts);
  }, [messages, profile]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };
  return <div className="h-full flex flex-col bg-gradient-to-br from-background via-background/95 to-primary/5 backdrop-blur-sm border-r">
      <div className="p-6 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Ventus AI</h2>
            <p className="text-sm text-muted-foreground">
              Ask me to find deals for you!
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">👋 Hi! I'm your deal finder assistant.</p>
              <p className="text-sm">
                Try asking: "Show me golf equipment deals under $200"
              </p>
            </div>}
          {messages.map((message, index) => <ChatMessage key={index} role={message.role} content={message.content} />)}
          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>

      <div className="p-6 border-t bg-card/50 backdrop-blur-sm">
        <PromptSuggestions 
          prompts={suggestedPrompts}
          onPromptClick={handlePromptClick}
          isLoading={isLoading}
        />
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask for deals..." disabled={isLoading} className="flex-1" />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>;
};