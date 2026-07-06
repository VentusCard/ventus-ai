import { cn } from "@/lib/utils";
import type { Person, Thread } from "./coworkerInboxData";

interface Props {
  threads: Thread[];
  peopleById: Record<string, Person>;
  selectedThreadId: string | null;
  onSelect: (id: string) => void;
}

export function ThreadList({ threads, peopleById, selectedThreadId, onSelect }: Props) {
  if (threads.length === 0) {
    return (
      <div className="p-6 text-[13px] text-slate-500 text-center">No threads match this filter.</div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {threads.map((t) => {
        const person = peopleById[t.recipientId];
        const active = t.id === selectedThreadId;
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t.id)}
              className={cn(
                "w-full text-left px-4 py-3 transition-colors",
                active ? "bg-purple-50/70" : "hover:bg-slate-50"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[12px] font-semibold text-slate-900 truncate">
                  Ventus AI → {person?.name ?? "Unknown"}
                </span>
                <span className="text-[10.5px] text-slate-500 shrink-0">{t.updatedAt}</span>
              </div>
              <div className={cn("text-[13px] mb-0.5 truncate", t.unread ? "font-semibold text-slate-900" : "text-slate-800")}>
                {t.subject}
              </div>
              <div className="text-[12px] text-slate-500 line-clamp-1">{t.preview}</div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
