import { useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, Lock, Save, Radar, Clock, ArrowUpRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TEAM_DESTINATIONS, type TeamDestination } from "./coworkerInboxData";
import { COWORKER_PLAYBOOKS, type PlaybookRule } from "./coworkerPersonaData";

const ACCENT_DOT: Record<TeamDestination["accent"], string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
};

export function CoworkerPersonaSettingsView() {
  const [selectedId, setSelectedId] = useState(TEAM_DESTINATIONS[0].id);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const team = useMemo(
    () => TEAM_DESTINATIONS.find((t) => t.id === selectedId) ?? TEAM_DESTINATIONS[0],
    [selectedId],
  );
  const playbook = COWORKER_PLAYBOOKS[team.id];

  const isOn = (rule: PlaybookRule) => overrides[rule.id] ?? rule.on ?? true;
  const toggle = (rule: PlaybookRule) =>
    setOverrides((prev) => ({ ...prev, [rule.id]: !(prev[rule.id] ?? rule.on ?? true) }));

  return (
    <div className="flex h-full min-h-0 gap-3">
      {/* Left rail — coworkers */}
      <div className="w-[248px] flex-none rounded-lg border border-slate-200 bg-white overflow-y-auto">
        <div className="px-3 py-2.5 border-b border-slate-200">
          <p className="text-[12px] font-semibold text-slate-900">Coworkers</p>
          <p className="text-[11px] text-slate-500">{TEAM_DESTINATIONS.length} playbooks</p>
        </div>
        <div className="p-1.5 space-y-1">
          {TEAM_DESTINATIONS.map((t) => {
            const active = t.id === selectedId;
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
                  <span className={cn("h-2 w-2 rounded-full flex-none", ACCENT_DOT[t.accent])} />
                  <span className="text-[12.5px] font-medium text-slate-900 truncate">
                    {t.name.replace("Coworker for ", "")}
                  </span>
                </div>
                <p className="mt-0.5 pl-4 text-[11px] text-slate-500 truncate">{t.emailType}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel — playbook */}
      <div className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white flex flex-col min-h-0">
        {/* Identity */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full flex-none", ACCENT_DOT[team.accent])} />
              <h3 className="text-[14px] font-semibold text-slate-900 truncate">{team.name}</h3>
            </div>
            <p className="mt-1 text-[11.5px] text-slate-500">
              {playbook.audience} · {team.emailType} · {playbook.delivery.frequency}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.success("Playbook saved for this session")}
            className="flex-none inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-medium text-slate-50 hover:bg-slate-800"
          >
            <Save className="h-3.5 w-3.5" />
            Save playbook
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {/* Mission */}
          <section>
            <SectionLabel>Mission</SectionLabel>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-700">{playbook.mission}</p>
          </section>

          {/* Three settings lines */}
          <RuleGroup
            title="What it always does"
            hint="Standing behavior, every cycle"
            tone="always"
            rules={playbook.always}
            isOn={isOn}
            onToggle={toggle}
          />
          <RuleGroup
            title="What it sometimes does"
            hint="Conditional — runs only when the trigger fires"
            tone="sometimes"
            rules={playbook.sometimes}
            isOn={isOn}
            onToggle={toggle}
          />
          <RuleGroup
            title="What it never does"
            hint="Governed by the bank — not editable"
            tone="never"
            rules={playbook.never}
            isOn={isOn}
            onToggle={toggle}
          />

          {/* Signals */}
          <section>
            <SectionLabel>
              <Radar className="inline h-3 w-3 mr-1 -mt-px" />
              Signals it watches
            </SectionLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {playbook.signals.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* Tone + escalation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <SectionLabel>Tone &amp; length</SectionLabel>
              <dl className="mt-2 space-y-1.5">
                <Row label="Tone" value={playbook.tone} />
                <Row label="Word cap" value={playbook.wordCap} />
                <Row label="Disclaimer" value={playbook.disclaimer} />
              </dl>
            </section>
            <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <SectionLabel>
                <ArrowUpRight className="inline h-3 w-3 mr-1 -mt-px" />
                Escalation
              </SectionLabel>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-700">{playbook.escalation}</p>
            </section>
          </div>
        </div>

        {/* Delivery footer */}
        <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Send window: <b className="font-semibold text-slate-900">{playbook.delivery.sendWindow}</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            Frequency: <b className="font-semibold text-slate-900">{playbook.delivery.frequency}</b>
          </span>
          <span>
            Reply SLA: <b className="font-semibold text-slate-900">{playbook.delivery.replySla}</b>
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">{children}</p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[12px]">
      <dt className="w-[74px] flex-none text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}

const TONE_STYLES = {
  always: {
    border: "border-emerald-200",
    bg: "bg-emerald-50/50",
    title: "text-emerald-800",
    rowOn: "border-emerald-200 bg-white",
  },
  sometimes: {
    border: "border-amber-200",
    bg: "bg-amber-50/50",
    title: "text-amber-800",
    rowOn: "border-amber-200 bg-white",
  },
  never: {
    border: "border-rose-200",
    bg: "bg-rose-50/50",
    title: "text-rose-800",
    rowOn: "border-rose-200 bg-white",
  },
} as const;

function RuleGroup({
  title,
  hint,
  tone,
  rules,
  isOn,
  onToggle,
}: {
  title: string;
  hint: string;
  tone: keyof typeof TONE_STYLES;
  rules: PlaybookRule[];
  isOn: (rule: PlaybookRule) => boolean;
  onToggle: (rule: PlaybookRule) => void;
}) {
  const styles = TONE_STYLES[tone];
  const locked = tone === "never";
  const activeCount = locked ? rules.length : rules.filter(isOn).length;

  return (
    <section className={cn("rounded-lg border p-3", styles.border, styles.bg)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn("text-[12.5px] font-semibold", styles.title)}>{title}</p>
        <span className="text-[11px] text-slate-500">
          {locked ? `${rules.length} locked` : `${activeCount} of ${rules.length} on`}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>

      <ul className="mt-2.5 space-y-1.5">
        {rules.map((rule) => {
          const on = locked ? true : isOn(rule);
          return (
            <li key={rule.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => !locked && onToggle(rule)}
                className={cn(
                  "w-full rounded-md border px-2.5 py-2 text-left transition-colors",
                  locked
                    ? "border-rose-200 bg-white cursor-default"
                    : on
                      ? cn(styles.rowOn, "hover:bg-slate-50")
                      : "border-slate-200 bg-slate-50 hover:bg-white",
                )}
              >
                <div className="flex items-start gap-2">
                  {locked ? (
                    <Lock className="mt-px h-3.5 w-3.5 flex-none text-rose-500" />
                  ) : on ? (
                    <CheckCircle2
                      className={cn(
                        "mt-px h-3.5 w-3.5 flex-none",
                        tone === "always" ? "text-emerald-600" : "text-amber-600",
                      )}
                    />
                  ) : (
                    <CircleDashed className="mt-px h-3.5 w-3.5 flex-none text-slate-400" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-[12.5px] leading-snug",
                        on ? "text-slate-800" : "text-slate-500",
                      )}
                    >
                      {rule.text}
                    </p>
                    {rule.when && (
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-600">When:</span> {rule.when}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
