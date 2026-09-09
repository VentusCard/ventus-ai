import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-700 px-4 py-2.5 text-sm leading-relaxed text-white">
          {content}
        </div>
        {time && <span className="pr-1 text-[10px] text-slate-400">{time}</span>}
      </div>
    );
  }

  return (
    <div className="group flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-700">
        <span className="text-[12px] font-bold leading-none text-white">V</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-600">Ventus AI</span>
          {time && <span className="text-[10px] text-slate-400">{time}</span>}
        </div>

        <div
          className={cn(
            "max-w-none text-[13.5px] leading-[1.7] text-slate-600",
            // Paragraphs & headings
            "[&_p]:my-2.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
            "[&_h1]:mb-1.5 [&_h1]:mt-5 [&_h1]:text-[13.5px] [&_h1]:font-semibold [&_h1]:text-slate-900",
            "[&_h2]:mb-1.5 [&_h2]:mt-5 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:text-slate-900",
            "[&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-[10.5px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[0.12em] [&_h3]:text-slate-400",
            "[&_h1:first-child]:mt-0 [&_h2:first-child]:mt-0 [&_h3:first-child]:mt-0",
            // Lists
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-4 [&_ul]:marker:text-indigo-300",
            "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-4 [&_ol]:marker:text-slate-300",
            "[&_li]:pl-1 [&_li>p]:my-0 [&_li_ul]:my-1 [&_li_ol]:my-1",
            // Emphasis & inline code
            "[&_strong]:font-semibold [&_strong]:text-slate-900",
            "[&_code]:rounded [&_code]:bg-indigo-50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:text-indigo-700",
            "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:text-[12px] [&_pre_code]:bg-transparent [&_pre_code]:text-slate-100",
            "[&_a]:text-indigo-700 [&_a]:underline [&_a]:underline-offset-2",
            // Tables
            "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-slate-200/80 [&_table]:text-[12px]",
            "[&_th]:border-b [&_th]:border-slate-200/80 [&_th]:bg-indigo-50/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-[10.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-slate-400",
            "[&_td]:border-b [&_td]:border-slate-100 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:tabular-nums [&_td]:text-slate-600",
            "[&_tr:last-child_td]:border-b-0",
            // Rules & quotes
            "[&_hr]:my-5 [&_hr]:border-slate-100",
            "[&_blockquote]:my-2.5 [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-200 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500",
          )}
        >

          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
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
