import { useMemo, useState } from "react";
import { Users, Crown, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROSTER, THREADS, type Person } from "./coworkerInboxData";
import { ThreadList } from "./ThreadList";
import { ThreadDetail } from "./ThreadDetail";

type Folder = "all" | "advisor" | "leadership";

const FOLDERS: { id: Folder; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "All threads", icon: Inbox },
  { id: "advisor", label: "Advisors", icon: Users },
  { id: "leadership", label: "Leadership", icon: Crown },
];

export function CoworkerInboxView() {
  const [folder, setFolder] = useState<Folder>("all");
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(THREADS[0]?.id ?? null);

  const peopleById = useMemo(() => {
    const map: Record<string, Person> = {};
    for (const p of ROSTER) map[p.id] = p;
    return map;
  }, []);

  const filteredThreads = useMemo(() => {
    return THREADS.filter((t) => {
      const person = peopleById[t.recipientId];
      if (!person) return false;
      if (folder !== "all" && person.role !== folder) return false;
      if (personFilter && t.recipientId !== personFilter) return false;
      return true;
    });
  }, [folder, personFilter, peopleById]);

  const selectedThread = filteredThreads.find((t) => t.id === selectedThreadId) ?? filteredThreads[0] ?? null;

  const advisors = ROSTER.filter((p) => p.role === "advisor");
  const leaders = ROSTER.filter((p) => p.role === "leadership");

  const handleFolderClick = (f: Folder) => {
    setFolder(f);
    setPersonFilter(null);
    const first = THREADS.find((t) => {
      const p = peopleById[t.recipientId];
      return f === "all" || (p && p.role === f);
    });
    setSelectedThreadId(first?.id ?? null);
  };

  const handlePersonClick = (id: string) => {
    setPersonFilter(id === personFilter ? null : id);
    const first = THREADS.find((t) => t.recipientId === id);
    if (first) setSelectedThreadId(first.id);
  };

  return (
    <div className="h-full rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="grid grid-cols-[220px_320px_1fr] h-full">
        {/* Folders + roster */}
        <aside className="border-r border-slate-200 bg-slate-50/60 overflow-y-auto">
          <div className="p-3">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">
              Folders
            </div>
            <ul className="space-y-0.5">
              {FOLDERS.map((f) => {
                const Icon = f.icon;
                const active = folder === f.id && !personFilter;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => handleFolderClick(f.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] transition-colors",
                        active ? "bg-purple-100 text-purple-800 font-medium" : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{f.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="p-3 border-t border-slate-200">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">
              Advisors
            </div>
            <ul className="space-y-0.5">
              {advisors.map((p) => (
                <RosterItem key={p.id} person={p} active={personFilter === p.id} onClick={() => handlePersonClick(p.id)} />
              ))}
            </ul>
          </div>

          <div className="p-3 border-t border-slate-200">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">
              Leadership
            </div>
            <ul className="space-y-0.5">
              {leaders.map((p) => (
                <RosterItem key={p.id} person={p} active={personFilter === p.id} onClick={() => handlePersonClick(p.id)} />
              ))}
            </ul>
          </div>
        </aside>

        {/* Thread list */}
        <div className="border-r border-slate-200 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-2.5">
            <div className="text-[12px] font-semibold text-slate-900">
              {personFilter
                ? `Threads with ${peopleById[personFilter]?.name}`
                : folder === "all"
                ? "All threads"
                : folder === "advisor"
                ? "Advisor threads"
                : "Leadership threads"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {filteredThreads.length} {filteredThreads.length === 1 ? "thread" : "threads"}
            </div>
          </div>
          <ThreadList
            threads={filteredThreads}
            peopleById={peopleById}
            selectedThreadId={selectedThread?.id ?? null}
            onSelect={setSelectedThreadId}
          />
        </div>

        {/* Thread detail */}
        <div className="overflow-hidden">
          <ThreadDetail thread={selectedThread} peopleById={peopleById} />
        </div>
      </div>
    </div>
  );
}

function RosterItem({ person, active, onClick }: { person: Person; active: boolean; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
          active ? "bg-purple-100" : "hover:bg-slate-100"
        )}
      >
        <div className="shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
          {person.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn("text-[12.5px] truncate", active ? "text-purple-800 font-medium" : "text-slate-800")}>
            {person.name}
          </div>
          <div className="text-[10.5px] text-slate-500 truncate">{person.title}</div>
        </div>
      </button>
    </li>
  );
}
