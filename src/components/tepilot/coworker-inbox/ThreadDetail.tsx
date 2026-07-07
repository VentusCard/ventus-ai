import { Info } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import type { Person, Thread } from "./coworkerInboxData";

interface Props {
  thread: Thread | null;
  peopleById: Record<string, Person>;
}

export function ThreadDetail({ thread, peopleById }: Props) {
  if (!thread) {
    return (
      <div className="h-full flex items-center justify-center text-[13px] text-slate-500">
        Select a thread to view the conversation.
      </div>
    );
  }

  const recipient = peopleById[thread.recipientId];

  return (
    <div className="flex flex-col h-full">
      {/* Subject header */}
      <div className="shrink-0 px-6 py-4 border-b border-slate-200">
        <h2 className="text-[16px] font-semibold text-slate-900">{thread.subject}</h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Between <span className="font-medium text-slate-700">Ventus AI</span> and{" "}
          <span className="font-medium text-slate-700">{recipient?.name}</span>
          {recipient ? ` · ${recipient.title}` : ""}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 bg-slate-50/40">
        {thread.messages.map((m) => (
          <MessageBubble key={m.id} message={m} recipient={recipient} />
        ))}
      </div>

      {/* Reply composer (disabled) */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
          <textarea
            disabled
            placeholder={`Reply to Ventus AI…`}
            className="w-full resize-none bg-transparent text-[13px] text-slate-500 placeholder:text-slate-400 outline-none min-h-[40px] cursor-not-allowed"
          />
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Info className="w-3 h-3" />
              Static demo — replies are pre-scripted.
            </div>
            <button
              type="button"
              disabled
              className="text-[12px] font-medium px-3 py-1 rounded bg-slate-200 text-slate-400 cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
