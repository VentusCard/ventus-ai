import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatBubble = ({ role, content }: ChatBubbleProps) => {
  const isUser = role === 'user';

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser 
            ? "bg-[#0064E0] text-white rounded-br-sm" 
            : "bg-muted text-foreground rounded-bl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};
