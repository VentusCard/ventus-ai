import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight, ArrowDownLeft, Radar, Mail, MessageCircle, Workflow, Users, Clock3, History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROSTER, WEEKLY_STATS, type Person } from "./coworkerInboxData";
import {
  makeStreamEntry, seedStream, relativeTime, clockTime, dayLabel, dayKey,
  type StreamEntry, type StreamKind,
} from "./coworkerStreamData";

const MAX_ENTRIES = 120;
const TRICKLE_MIN_MS = 12000;
const TRICKLE_JITTER_MS = 8000;

const KIND_STYLES: Record<StreamKind, { dot: string; label: string; badge: string }> = {
  advisor:    { dot: "bg-purple-500",  label: "Advisor",    badge: "bg-purple-50 text-purple-700 border-purple-200" },
  leadership: { dot: "bg-amber-500",   label: "Leadership", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  signal:     { dot: "bg-blue-500",    label: "Signal",     badge: "bg-blue-50 text-blue-700 border-blue-200" },
  reply:      { dot: "bg-emerald-500", label: "Reply",      badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  handoff:    { dot: "bg-sky-500",     label: "Hand-off",   badge: "bg-sky-50 text-sky-700 border-sky-200" },
};

type FilterKey = "all" | "sent" | "replies" | "signals" | "handoffs";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "replies", label: "Replies" },
  { key: "signals", label: "Signals" },
  { key: "handoffs", label: "Hand-offs" },
];

function matchesFilter(e: StreamEntry, f: FilterKey) {
  if (f === "all") return true;
  if (f === "sent") return e.kind === "advisor" || e.kind === "leadership";
  if (f === "replies") return e.kind === "reply";
  if (f === "signals") return e.kind === "signal";
  return e.kind === "handoff";
}

export function CoworkerLiveStreamView() {
  const [entries, setEntries] = useState<StreamEntry[]>(() => seedStream(MAX_ENTRIES));
  const [filter, setFilter] = useState<FilterKey>("all");
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [counts, setCounts] = useState(() => ({
    emails: WEEKLY_STATS.emailsSent,
    replies: WEEKLY_STATS.repliesCount,
    signals: WEEKLY_STATS.signalsSurfaced,
    actions: WEEKLY_STATS.actionsToday,
  }));
  const newestIdRef = useRef<string | null>(null);

  // Occasionally a new exchange is added to the log
  useEffect(() => {
    let timer: number;
    const schedule = () => {
      const delay = TRICKLE_MIN_MS + Math.random() * TRICKLE_JITTER_MS;
      timer = window.setTimeout(() => {
        const entry = makeStreamEntry();
        newestIdRef.current = entry.id;
        setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
        setCounts((c) => ({
          emails: c.emails + (entry.kind === "advisor" || entry.kind === "leadership" ? 1 : 0),
          replies: c.replies + (entry.kind === "reply" ? 1 : 0),
          signals: c.signals + (entry.kind === "signal" ? 1 : 0),
          actions: c.actions + 1,
        }));
        schedule();
      }, delay);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  // Age the "last exchange" readings in the side panel
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const peopleById = useMemo(() => {
    const map: Record<string, Person> = {};
    for (const p of ROSTER) map[p.id] = p;
    return map;
  }, []);

  const visible = entries.filter(
    (e) => matchesFilter(e, filter) && (!personFilter || e.personId === personFilter)
  );

  const days = useMemo(() => {
    const groups: { key: number; label: string; entries: StreamEntry[] }[] = [];
    for (const e of visible) {
      const key = dayKey(e.at);
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.entries.push(e);
      else groups.push({ key, label: dayLabel(e.at, now), entries: [e] });
    }
    return groups;
  }, [visible, now]);

  const collaborators = useMemo(() => {
    return ROSTER.map((p) => {
      const theirs = entries.filter((e) => e.personId === p.id);
      return {
        person: p,
        exchanges: theirs.length,
        lastAt: theirs[0]?.at,
      };
    }).sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0));
  }, [entries]);

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="space-y-3 pb-6">
        {/* History header */}
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-slate-500" />
            <span className="text-[13px] font-semibold text-slate-900">Activity history</span>
            <span className="text-[12px] text-slate-500">
              Last 3 days · {counts.actions.toLocaleString()} logged actions
            </span>
          </div>

          <div className="flex items-center gap-4 text-[12px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-semibold text-slate-900 tabular-nums">{counts.emails.toLocaleString()}</span> sent this week
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-900 tabular-nums">{counts.replies.toLocaleString()}</span> replies
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Radar className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-900 tabular-nums">{counts.signals.toLocaleString()}</span> signals
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                filter === f.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {f.label}
            </button>
          ))}
          {personFilter && (
            <button
              type="button"
              onClick={() => setPersonFilter(null)}
              className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[12px] font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              {peopleById[personFilter]?.name} · clear
            </button>
          )}
        </div>

        {/* Log + people */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Clock3 className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-[13px] font-semibold text-slate-900">What was sent and what came back</h3>
              <span className="text-[11.5px] text-slate-500 ml-auto tabular-nums">
                {visible.length} logged
              </span>
            </div>

            {days.map((g) => (
              <section key={g.key} data-testid="activity-day-group">
                <div className="px-4 py-2 bg-slate-50 border-y border-slate-100 flex items-center gap-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">{g.label}</h4>
                  <span className="text-[11px] text-slate-400 ml-auto tabular-nums">
                    {g.entries.length} logged
                  </span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {g.entries.map((e) => {
                    const s = KIND_STYLES[e.kind];
                    const person = e.personId ? peopleById[e.personId] : undefined;
                    const isNewest = e.id === newestIdRef.current;
                    return (
                      <li
                        key={e.id}
                        className={cn(
                          "px-4 py-2 flex items-start gap-3 border-l-2 transition-colors duration-700",
                          e.direction === "in"
                            ? "border-l-emerald-300"
                            : e.direction === "out"
                              ? "border-l-slate-300"
                              : "border-l-blue-200",
                          isNewest ? "bg-emerald-50/70" : "hover:bg-slate-50/60"
                        )}
                        style={isNewest ? { animation: "fade-in 0.35s ease-out" } : undefined}
                      >
                        <span className="shrink-0 w-[58px] pt-0.5 text-[11px] tabular-nums text-slate-500">
                          {clockTime(e.at)}
                        </span>
                        <span className={cn("shrink-0 mt-[7px] h-2 w-2 rounded-full", s.dot)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("text-[10px] font-semibold uppercase tracking-wider border px-1.5 py-0.5 rounded", s.badge)}>
                              {s.label}
                            </span>
                            {e.direction === "out" && <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />}
                            {e.direction === "in" && <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />}
                            {e.kind === "handoff" && <Workflow className="w-3.5 h-3.5 text-sky-500" />}
                            <span className="text-[13px] text-slate-900 font-medium">{e.title}</span>
                          </div>
                          <div className="text-[12px] text-slate-600 mt-0.5">{e.detail}</div>
                          {person && (
                            <button
                              type="button"
                              onClick={() => setPersonFilter(person.id)}
                              className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                            >
                              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[8px] font-bold">
                                {person.initials}
                              </span>
                              {person.name}
                              <span className={cn(
                                "text-[9px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded border",
                                person.role === "advisor"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              )}>
                                {person.role === "advisor" ? "ADV" : "LEAD"}
                              </span>
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            {visible.length === 0 && (
              <div className="px-4 py-8 text-center text-[12px] text-slate-500">
                Nothing logged for this filter yet.
              </div>
            )}
          </div>

          {/* Working with */}
          <div className="rounded-lg border border-slate-200 bg-white self-start">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="text-[13px] font-semibold text-slate-900">Working with</h3>
              </div>
              <p className="text-[11.5px] text-slate-500 mt-0.5">
                Sample of {ROSTER.length} of {WEEKLY_STATS.collaboratorsTotal.toLocaleString()} colleagues · exchanges on record
              </p>
            </div>
            <ul className="divide-y divide-slate-100">
              {collaborators.map(({ person, exchanges, lastAt }) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => setPersonFilter(personFilter === person.id ? null : person.id)}
                    className={cn(
                      "w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-colors",
                      personFilter === person.id ? "bg-slate-50" : "hover:bg-slate-50/60"
                    )}
                  >
                    <div className="shrink-0 w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10.5px] font-bold">
                      {person.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] font-medium text-slate-900 truncate">{person.name}</span>
                        <span className={cn(
                          "text-[9.5px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded border",
                          person.role === "advisor"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}>
                          {person.role === "advisor" ? "ADV" : "LEAD"}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 truncate">{person.title}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] font-semibold text-slate-800 tabular-nums">{exchanges}</div>
                      <div className="text-[9.5px] text-slate-500">
                        {lastAt ? relativeTime(lastAt, now) : "none"}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <Clock3 className="w-3 h-3" />
          Static demo — activity, threads, and stats are illustrative.
        </div>
      </div>
    </div>
  );
}
