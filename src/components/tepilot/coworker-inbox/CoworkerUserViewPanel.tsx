import { useMemo, useState } from "react";
import { Sparkles, ShieldCheck, Check, Mail, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TEAM_DESTINATIONS, type TeamDestination } from "./coworkerInboxData";
import {
  COWORKER_USER_VIEWS,
  type QueueItem,
  type RolePanel,
  type UserWorkspace,
} from "./coworkerUserViewData";
import { PulseDot } from "@/components/tepilot/common/PulseDot";

const ACCENT_DOT: Record<TeamDestination["accent"], string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
};

const ACCENT_BAR: Record<TeamDestination["accent"], string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
};

const ACCENT_AVATAR: Record<TeamDestination["accent"], string> = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
};

const TONE_CHIP: Record<QueueItem["tone"], string> = {
  action: "border-slate-300 bg-slate-900 text-slate-50",
  review: "border-slate-300 bg-white text-slate-700",
  info: "border-slate-200 bg-white text-slate-500",
};

const TONE_DOT: Record<QueueItem["tone"], string> = {
  action: "bg-emerald-500",
  review: "bg-amber-500",
  info: "bg-slate-400",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">{children}</p>
  );
}

export function CoworkerUserViewPanel() {
  const [selectedId, setSelectedId] = useState(TEAM_DESTINATIONS[0].id);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const team = useMemo(
    () => TEAM_DESTINATIONS.find((t) => t.id === selectedId) ?? TEAM_DESTINATIONS[0],
    [selectedId],
  );
  const ws: UserWorkspace = COWORKER_USER_VIEWS[team.id];

  const openCount = ws.queue.filter((q) => !done[q.id]).length;

  const handleAction = (item: QueueItem) => {
    setDone((prev) => ({ ...prev, [item.id]: true }));
    toast.success(`${item.action} — ${ws.person.name.split(" ")[0]}'s queue updated`);
  };

  return (
    <div className="flex h-full min-h-0 gap-3">
      {/* Left rail — coworkers */}
      <div className="w-[248px] flex-none rounded-lg border border-slate-200 bg-white overflow-y-auto">
        <div className="px-3 py-2.5 border-b border-slate-200">
          <p className="text-[12px] font-semibold text-slate-900">Coworkers</p>
          <p className="text-[11px] text-slate-500">{TEAM_DESTINATIONS.length} logins</p>
        </div>
        <div className="p-1.5 space-y-1">
          {TEAM_DESTINATIONS.map((t) => {
            const active = t.id === selectedId;
            const person = COWORKER_USER_VIEWS[t.id]?.person;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  "w-full text-left rounded-md px-2.5 py-2 transition-colors border",
                  active
                    ? "bg-slate-50 border-slate-300"
                    : "bg-white border-transparent hover:bg-slate-50",
                )}
              >
                <div className="flex items-center gap-2">
                  <PulseDot colorClass={ACCENT_DOT[t.accent]} sizeClass="h-2 w-2" />
                  <span className="text-[12.5px] font-medium text-slate-900 truncate">
                    {t.name.replace("Coworker for ", "")}
                  </span>
                </div>
                <p className="mt-0.5 pl-4 text-[11px] text-slate-500 truncate">
                  {person ? `${person.name} · ${person.title}` : t.emailType}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel — the person's logged-in workspace */}
      <div className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white flex flex-col min-h-0">
        {/* Identity bar */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "h-9 w-9 flex-none rounded-full border flex items-center justify-center text-[12px] font-semibold",
                ACCENT_AVATAR[team.accent],
              )}
            >
              {ws.person.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-slate-900 truncate">
                  {ws.person.name}
                </h3>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-px text-[10.5px] font-medium text-slate-600">
                  {ws.person.title}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-slate-500 truncate">{ws.person.scope}</p>
            </div>
          </div>
          <div className="flex-none flex items-center gap-2">
            <span className="hidden lg:inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-600">
              <Eye className="h-3.5 w-3.5" />
              Viewing as — read-only preview
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600">
              <PulseDot colorClass={ACCENT_DOT[team.accent]} sizeClass="h-2 w-2" />
              {openCount} open
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {ws.kpis.map((k) => (
              <div key={k.label} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
                  {k.label}
                </p>
                <p className="mt-1 text-[19px] font-semibold leading-none text-slate-900">
                  {k.value}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Today from Ventus */}
          <section className="rounded-lg border border-slate-200 bg-white">
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-[12.5px] font-semibold text-slate-900 truncate">
                  {ws.brief.title}
                </p>
              </div>
              <span className="flex-none text-[11px] text-slate-400">{ws.brief.sentAgo}</span>
            </div>
            <div className="px-3.5 py-3">
              <p className="text-[12.5px] leading-relaxed text-slate-700">{ws.brief.body}</p>
              <ul className="mt-2 space-y-1.5">
                {ws.brief.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-[12px] leading-relaxed text-slate-600">
                    <span
                      className={cn(
                        "mt-[6px] h-1.5 w-1.5 flex-none rounded-full",
                        ACCENT_BAR[team.accent],
                      )}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Work queue + role panel */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <section className="rounded-lg border border-slate-200 bg-white">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <SectionLabel>Work queue</SectionLabel>
                <span className="text-[11px] text-slate-400">{openCount} to act on</span>
              </div>
              <div className="divide-y divide-slate-100">
                {ws.queue.map((item) => {
                  const isDone = !!done[item.id];
                  return (
                    <div
                      key={item.id}
                      className={cn("px-3.5 py-2.5 flex gap-2.5", isDone && "opacity-50")}
                    >
                      <span
                        className={cn(
                          "mt-[6px] h-1.5 w-1.5 flex-none rounded-full",
                          TONE_DOT[item.tone],
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-medium text-slate-900">{item.title}</p>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                          {item.evidence}
                        </p>
                        <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-slate-400">
                          {item.meta}
                        </p>
                      </div>
                      <div className="flex-none self-center">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <Check className="h-3.5 w-3.5" />
                            Done
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAction(item)}
                            className={cn(
                              "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors hover:opacity-90",
                              TONE_CHIP[item.tone],
                            )}
                          >
                            {item.action}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <RolePanelCard panel={ws.panel} accent={team.accent} />
          </div>

          {/* Only Ventus sees this */}
          <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-slate-500" />
              <p className="text-[12.5px] font-semibold text-slate-900">Only Ventus sees this</p>
              <span className="text-[11px] text-slate-500">
                from semantic enrichment of raw transaction data — not the core system
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {ws.unique.map((u) => (
                <div key={u.title} className="rounded-md border border-slate-200 bg-white p-2.5">
                  <p className="text-[12px] font-semibold text-slate-900">{u.title}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">{u.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Access footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/70 flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 flex-none text-slate-400" />
          <p className="text-[11.5px] text-slate-600">{ws.access}</p>
        </div>
      </div>
    </div>
  );
}

function RolePanelCard({
  panel,
  accent,
}: {
  panel: RolePanel;
  accent: TeamDestination["accent"];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="px-3.5 py-2.5 border-b border-slate-100">
        <SectionLabel>{panel.title}</SectionLabel>
      </div>

      {panel.kind === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {panel.columns.map((c) => (
                  <th
                    key={c}
                    className="px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {panel.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={cn(
                        "px-3.5 py-2 text-[12px]",
                        i === 0 ? "font-medium text-slate-900" : "text-slate-600",
                        cell.startsWith("-") && "text-rose-600",
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panel.kind === "bars" && (
        <div className="px-3.5 py-3 space-y-2.5">
          {panel.rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] font-medium text-slate-800">{r.label}</span>
                <span className="text-[11.5px] text-slate-600">
                  {r.value}
                  {r.sub && <span className="ml-1.5 text-slate-400">{r.sub}</span>}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn("h-full rounded-full", ACCENT_BAR[accent])}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {panel.kind === "list" && (
        <div className="divide-y divide-slate-100">
          {panel.rows.map((r) => (
            <div key={`${r.label}-${r.value}`} className="px-3.5 py-2.5 flex items-start gap-3">
              <span className="w-[70px] flex-none text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {r.label}
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-slate-900">{r.value}</p>
                {r.sub && <p className="text-[11.5px] text-slate-500">{r.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
