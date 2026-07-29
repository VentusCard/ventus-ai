import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message, Person } from "./coworkerInboxData";

interface Props {
  message: Message;
  recipient: Person;
}

export function MessageBubble({ message, recipient }: Props) {
  const isVentus = message.author === "ventus";
  const authorName = isVentus ? "Ventus AI" : recipient.name;
  const authorInitials = isVentus ? "V" : recipient.initials;

  return (
    <div className={cn("flex gap-3", isVentus ? "" : "")}>
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold",
          isVentus ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-700"
        )}
      >
        {isVentus ? <Sparkles className="w-4 h-4" /> : authorInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={cn("text-[13px] font-semibold", isVentus ? "text-purple-700" : "text-slate-900")}>
            {authorName}
          </span>
          <span className="text-[11px] text-slate-500">{message.timestamp}</span>
        </div>
        <div
          className={cn(
            "rounded-lg border px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap",
            isVentus
              ? "bg-purple-50/60 border-purple-200 text-slate-800"
              : "bg-white border-slate-200 text-slate-800"
          )}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}
