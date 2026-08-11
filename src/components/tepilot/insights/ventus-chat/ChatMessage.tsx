import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  onRegenerate?: () => void;
}

export function ChatMessage({ role, content, timestamp, onRegenerate }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const time = timestamp
    ? timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : undefined;

  if (role === "user") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-900 px-4 py-2.5 text-sm leading-relaxed text-white">
          {content}
        </div>
        {time && <span className="pr-1 text-[10px] text-slate-400">{time}</span>}
      </div>
    );
  }

  return (
    <div className="group flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50">
        <span className="text-[12px] font-black leading-none text-blue-600">V</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-700">Ventus AI</span>
          {time && <span className="text-[10px] text-slate-400">{time}</span>}
        </div>
        <div
          className={cn(
            "prose prose-sm prose-slate max-w-none text-slate-700",
            "[&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&_li]:my-0.5 [&_strong]:text-slate-900",
            "[&_table]:text-[12px] [&_th]:text-slate-500",
          )}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div className="mt-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={copy}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10.5px] text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10.5px] text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
