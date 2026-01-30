import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Bot className="w-5 h-5 text-primary" />
      </div>
      <div className="bg-card border rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot" style={{ animationDelay: "200ms" }} />
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
};
