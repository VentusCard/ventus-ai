import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Lock,
  Save,
  Radar,
  Clock,
  ArrowUpRight,
  Mail,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSaveSequence, PLAYBOOK_STAGES } from "@/hooks/useSaveSequence";
import { SaveSequence } from "@/components/tepilot/common/SaveSequence";
import { TEAM_DESTINATIONS, type TeamDestination } from "./coworkerInboxData";
import {
  COWORKER_PLAYBOOKS,
  COWORKER_EXAMPLES,
  type CoworkerExample,
  type Playbook,
  type PlaybookRule,
  type SignalFamily,
} from "./coworkerPersonaData";
import { PulseDot } from "@/components/tepilot/common/PulseDot";

const ACCENT_DOT: Record<TeamDestination["accent"], string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
};

const ALL_SIGNALS: SignalFamily[] = [
  "Life event",
  "Financial",
  "Behavioral",
  "Demographic",
  "Risk",
];

type RuleGroupKey = "always" | "sometimes" | "never";

const clone = (pb: Playbook): Playbook => ({
  ...pb,
  always: pb.always.map((r) => ({ ...r })),
  sometimes: pb.sometimes.map((r) => ({ ...r })),
  never: pb.never.map((r) => ({ ...r })),
  signals: [...pb.signals],
  delivery: { ...pb.delivery },
});

const newId = (teamId: string, group: RuleGroupKey) =>
  `${teamId}-${group}-${Math.random().toString(36).slice(2, 10)}`;

export function CoworkerPersonaSettingsView() {
  const [selectedId, setSelectedId] = useState(TEAM_DESTINATIONS[0].id);
  const [drafts, setDrafts] = useState<Record<string, Playbook>>({});
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const save = useSaveSequence({ stages: PLAYBOOK_STAGES });

  const team = useMemo(
    () => TEAM_DESTINATIONS.find((t) => t.id === selectedId) ?? TEAM_DESTINATIONS[0],
    [selectedId],
  );
  const playbook = drafts[team.id] ?? COWORKER_PLAYBOOKS[team.id];

  const applyDraft = (mutate: (pb: Playbook) => void) =>
    setDrafts((prev) => {
      const base = clone(prev[team.id] ?? COWORKER_PLAYBOOKS[team.id]);
      mutate(base);
      return { ...prev, [team.id]: base };
    });

  const update = (mutate: (pb: Playbook) => void) => save.run(() => applyDraft(mutate));


  const resetPlaybook = () => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[team.id];
      return next;
    });
    setOverrides((prev) => {
      const next: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (!k.startsWith(`${team.id}-`)) next[k] = v;
      }
      return next;
    });
    save.run();
    toast.success("Playbook reset to default");
  };

  const isOn = (rule: PlaybookRule) => overrides[rule.id] ?? rule.on ?? true;
  const toggle = (rule: PlaybookRule) =>
    save.run(() =>
      setOverrides((prev) => ({ ...prev, [rule.id]: !(prev[rule.id] ?? rule.on ?? true) })),
    );

  const editRule = (group: RuleGroupKey, id: string, patch: Partial<PlaybookRule>) =>
    update((pb) => {
      pb[group] = pb[group].map((r) => (r.id === id ? { ...r, ...patch } : r));
    });

  const addRule = (group: RuleGroupKey) =>
    update((pb) => {
      pb[group] = [
        ...pb[group],
        {
          id: newId(team.id, group),
          text: group === "never" ? "Never …" : "New rule",
          ...(group === "sometimes" ? { when: "Describe the trigger" } : {}),
          on: true,
        },
      ];
    });

  const removeRule = (group: RuleGroupKey, id: string) =>
    update((pb) => {
      pb[group] = pb[group].filter((r) => r.id !== id);
    });

  const toggleSignal = (s: SignalFamily) =>
    update((pb) => {
      pb.signals = pb.signals.includes(s)
        ? pb.signals.filter((x) => x !== s)
        : [...ALL_SIGNALS.filter((x) => pb.signals.includes(x) || x === s)];
    });

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
                  <PulseDot colorClass={ACCENT_DOT[t.accent]} sizeClass="h-2 w-2" />
                  <span className="text-[12.5px] font-medium text-slate-900 truncate">
                    {t.name.replace("Coworker for ", "")}
                  </span>
                  {drafts[t.id] && (
                    <span className="ml-auto rounded-full bg-slate-900 px-1.5 py-px text-[9.5px] font-semibold text-slate-50">
                      Edited
                    </span>
                  )}
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
              <PulseDot colorClass={ACCENT_DOT[team.accent]} sizeClass="h-2.5 w-2.5" />
              <h3 className="text-[14px] font-semibold text-slate-900 truncate">{team.name}</h3>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <EditableText
                value={playbook.audience}
                onCommit={(v) => update((pb) => (pb.audience = v))}
                className="text-[11.5px] text-slate-500"
              />
              <span>·</span>
              <span>{team.emailType}</span>
            </div>
          </div>
          <div className="flex-none flex items-center gap-2">
            <SaveSequence status={save.status} label={save.stageLabel} className="mr-1" />
            <button
              type="button"
              onClick={resetPlaybook}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => save.run()}
              disabled={save.isBusy}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-medium text-slate-50 hover:bg-slate-800"
            >
              <Save className="h-3.5 w-3.5" />
              Save playbook
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {/* Mission */}
          <section>
            <SectionLabel>Mission</SectionLabel>
            <EditableText
              value={playbook.mission}
              multiline
              onCommit={(v) => update((pb) => (pb.mission = v))}
              className="mt-1.5 block text-[12.5px] leading-relaxed text-slate-700"
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {/* Rules column */}
            <div className="min-w-0 space-y-4">
              {/* Three settings lines */}
              <RuleGroup
                title="What it always does"
                hint="Standing behavior, every cycle"
                tone="always"
                rules={playbook.always}
                isOn={isOn}
                onToggle={toggle}
                onEdit={(id, patch) => editRule("always", id, patch)}
                onAdd={() => addRule("always")}
                onRemove={(id) => removeRule("always", id)}
              />
              <RuleGroup
                title="What it sometimes does"
                hint="Conditional — runs only when the trigger fires"
                tone="sometimes"
                rules={playbook.sometimes}
                isOn={isOn}
                onToggle={toggle}
                onEdit={(id, patch) => editRule("sometimes", id, patch)}
                onAdd={() => addRule("sometimes")}
                onRemove={(id) => removeRule("sometimes", id)}
              />
              <RuleGroup
                title="What it never does"
                hint="Governed by the bank — editable, not toggleable"
                tone="never"
                rules={playbook.never}
                isOn={isOn}
                onToggle={toggle}
                onEdit={(id, patch) => editRule("never", id, patch)}
                onAdd={() => addRule("never")}
                onRemove={(id) => removeRule("never", id)}
              />

              {/* Signals */}
              <section>
                <SectionLabel>
                  <Radar className="inline h-3 w-3 mr-1 -mt-px" />
                  Signals it watches
                </SectionLabel>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ALL_SIGNALS.map((s) => {
                    const active = playbook.signals.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSignal(s)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          active
                            ? "border-slate-300 bg-slate-100 text-slate-800"
                            : "border-dashed border-slate-200 bg-white text-slate-400 hover:bg-slate-50",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Tone + escalation */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <SectionLabel>Tone &amp; length</SectionLabel>
                  <dl className="mt-2 space-y-1.5">
                    <Row
                      label="Tone"
                      value={playbook.tone}
                      onCommit={(v) => update((pb) => (pb.tone = v))}
                    />
                    <Row
                      label="Word cap"
                      value={playbook.wordCap}
                      onCommit={(v) => update((pb) => (pb.wordCap = v))}
                    />
                    <Row
                      label="Disclaimer"
                      value={playbook.disclaimer}
                      multiline
                      onCommit={(v) => update((pb) => (pb.disclaimer = v))}
                    />
                  </dl>
                </section>
                <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <SectionLabel>
                    <ArrowUpRight className="inline h-3 w-3 mr-1 -mt-px" />
                    Escalation
                  </SectionLabel>
                  <EditableText
                    value={playbook.escalation}
                    multiline
                    onCommit={(v) => update((pb) => (pb.escalation = v))}
                    className="mt-2 block text-[12px] leading-relaxed text-slate-700"
                  />
                </section>
              </div>
            </div>

            {/* Examples column */}
            <div className="min-w-0 lg:sticky lg:top-0">
              <ExamplesPanel team={team} example={COWORKER_EXAMPLES[team.id]} />
            </div>
          </div>
        </div>


        {/* Delivery footer */}
        <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Send window:
            <EditableText
              value={playbook.delivery.sendWindow}
              onCommit={(v) => update((pb) => (pb.delivery.sendWindow = v))}
              className="text-[11.5px] font-semibold text-slate-900"
            />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            Frequency:
            <EditableText
              value={playbook.delivery.frequency}
              onCommit={(v) => update((pb) => (pb.delivery.frequency = v))}
              className="text-[11.5px] font-semibold text-slate-900"
            />
          </span>
          <span className="inline-flex items-center gap-1.5">
            Reply SLA:
            <EditableText
              value={playbook.delivery.replySla}
              onCommit={(v) => update((pb) => (pb.delivery.replySla = v))}
              className="text-[11.5px] font-semibold text-slate-900"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

function EditableText({
  value,
  onCommit,
  multiline,
  className,
  placeholder,
}: {
  value: string;
  onCommit: (v: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const start = () => {
    setDraft(value);
    setEditing(true);
  };
  const commit = () => {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== value) onCommit(next);
  };

  if (editing) {
    const shared = {
      autoFocus: true,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setEditing(false);
        } else if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          commit();
        }
      },
      className: cn(
        "w-full rounded-md border border-slate-400 bg-white px-1.5 py-0.5 outline-none ring-2 ring-slate-900/5",
        className,
      ),
    };
    return multiline ? (
      <textarea {...shared} rows={3} onClick={(e) => e.stopPropagation()} />
    ) : (
      <input {...shared} onClick={(e) => e.stopPropagation()} />
    );
  }

  return (
    <span
      role="textbox"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        start();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          start();
        }
      }}
      className={cn(
        "cursor-text rounded-md px-1.5 py-0.5 -mx-1.5 hover:bg-slate-100/80 transition-colors",
        !value && "text-slate-400",
        className,
      )}
    >
      {value || placeholder || "—"}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">{children}</p>
  );
}

function Row({
  label,
  value,
  onCommit,
  multiline,
}: {
  label: string;
  value: string;
  onCommit: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-2 text-[12px]">
      <dt className="w-[74px] flex-none text-slate-500 pt-0.5">{label}</dt>
      <dd className="min-w-0 flex-1">
        <EditableText
          value={value}
          multiline={multiline}
          onCommit={onCommit}
          className="text-[12px] text-slate-800"
        />
      </dd>
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
  onEdit,
  onAdd,
  onRemove,
}: {
  title: string;
  hint: string;
  tone: keyof typeof TONE_STYLES;
  rules: PlaybookRule[];
  isOn: (rule: PlaybookRule) => boolean;
  onToggle: (rule: PlaybookRule) => void;
  onEdit: (id: string, patch: Partial<PlaybookRule>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const styles = TONE_STYLES[tone];
  const locked = tone === "never";
  const activeCount = locked ? rules.length : rules.filter(isOn).length;

  return (
    <section className={cn("rounded-lg border p-3", styles.border, styles.bg)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn("text-[12.5px] font-semibold", styles.title)}>{title}</p>
        <span className="text-[11px] text-slate-500">
          {locked ? `${rules.length} governed` : `${activeCount} of ${rules.length} on`}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>

      <ul className="mt-2.5 space-y-1.5">
        {rules.map((rule) => {
          const on = locked ? true : isOn(rule);
          return (
            <li key={rule.id}>
              <div
                className={cn(
                  "group relative w-full rounded-md border px-2.5 py-2 text-left transition-colors",
                  locked
                    ? "border-rose-200 bg-white"
                    : on
                      ? styles.rowOn
                      : "border-slate-200 bg-slate-50",
                )}
              >
                <div className="flex items-start gap-2">
                  {locked ? (
                    <Lock className="mt-1 h-3.5 w-3.5 flex-none text-rose-500" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggle(rule)}
                      aria-label={on ? "Turn rule off" : "Turn rule on"}
                      className="mt-0.5 flex-none"
                    >
                      {on ? (
                        <CheckCircle2
                          className={cn(
                            "h-3.5 w-3.5",
                            tone === "always" ? "text-emerald-600" : "text-amber-600",
                          )}
                        />
                      ) : (
                        <CircleDashed className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                  )}
                  <div className="min-w-0 flex-1 pr-5">
                    <EditableText
                      value={rule.text}
                      onCommit={(v) => onEdit(rule.id, { text: v })}
                      multiline
                      className={cn(
                        "block text-[12.5px] leading-snug",
                        on ? "text-slate-800" : "text-slate-500",
                      )}
                    />
                    {tone === "sometimes" && (
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-600">When:</span>{" "}
                        <EditableText
                          value={rule.when ?? ""}
                          placeholder="Add a trigger"
                          onCommit={(v) => onEdit(rule.id, { when: v })}
                          className="text-[11px] text-slate-500"
                        />
                      </p>
                    )}
                    {tone !== "sometimes" && rule.when && (
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-600">When:</span>{" "}
                        <EditableText
                          value={rule.when}
                          onCommit={(v) => onEdit(rule.id, { when: v })}
                          className="text-[11px] text-slate-500"
                        />
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(rule.id)}
                    aria-label="Remove rule"
                    className="absolute right-1.5 top-1.5 rounded p-0.5 text-slate-300 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onAdd}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 bg-white/70 px-2.5 py-1.5 text-[11.5px] font-medium text-slate-600 hover:bg-white"
      >
        <Plus className="h-3.5 w-3.5" />
        Add rule
      </button>
    </section>
  );
}

function ExamplesPanel({
  team,
  example,
}: {
  team: TeamDestination;
  example?: CoworkerExample;
}) {
  if (!example) return null;
  const role = team.name.replace("Coworker for ", "");

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 px-3 py-2.5">
        <SectionLabel>
          <Mail className="inline h-3 w-3 mr-1 -mt-px" />
          Examples
        </SectionLabel>
        <span className="text-[11px] text-slate-500">First message it sends</span>
      </div>

      <div className="p-3 space-y-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-medium text-slate-600">
              <PulseDot colorClass={ACCENT_DOT[team.accent]} sizeClass="h-1.5 w-1.5" />
              Ventus AI · {role}
            </span>
            <span className="text-[10.5px] text-slate-400">{team.emailType}</span>
          </div>
          <p className="mt-2 text-[13px] font-semibold text-slate-900">{example.subject}</p>
          <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-relaxed text-slate-700">
            {example.body}
          </p>
        </div>

        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
            Reply and it will…
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {example.replyPrompts.map((p) => (
              <span
                key={p}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600"
              >
                “{p}”
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
