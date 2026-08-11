import { useState } from "react";
import {
  SIGNALS,
  TEAMS,
  DESTINATIONS,
  createSourceGroups,
  chipClass,
} from "./CapabilitiesView";
import { cn } from "@/lib/utils";
import { Database, Cpu, Layers, Users, Send, GitBranch, X } from "lucide-react";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";
import { useExecDemoSession } from "@/lib/execDemoSessionStore";

type Selection = { stage: string; key: string } | null;
type Status = "live" | "partial" | "idle";

const ENGINE_STEPS = [
  { label: "Ingest", sublabel: "Multi-rail streams normalized", readout: "streaming" },
  { label: "Resolve", sublabel: "Identity + merchant resolution", readout: "sub-second" },
  { label: "Classify", sublabel: "3-tier taxonomy assignment", readout: "3-tier" },
  { label: "Enrich", sublabel: "Signal synthesis across 5 layers", readout: "5 layers" },
  { label: "Score", sublabel: "Confidence, recency, evidence", readout: "scored" },
];

const STAGE_VALUE: Record<string, string> = {
  sources: "Bank-native rails you already run",
  engine: "Raw strings become resolved, classified, scored behavior",
  signals: "Five signal families per customer",
  teams: "Every team reads the same canonical signal",
  destinations: "Activated in the systems of record you already use",
};

const DOT: Record<Status, string> = {
  live: "bg-emerald-500",
  partial: "bg-amber-500",
  idle: "bg-slate-300",
};

function StatusDot({ status }: { status: Status }) {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0">
      {status === "live" && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
      )}
      <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", DOT[status])} />
    </span>
  );
}

function Chip({
  label,
  readout,
  icon: Icon,
  status,
  active,
  dimmed,
  tint,
  onClick,
}: {
  label: string;
  readout: string;
  icon?: React.ElementType;
  status: Status;
  active?: boolean;
  dimmed?: boolean;
  tint?: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-left transition-all",
        tint ?? "bg-white text-slate-700 border-slate-200",
        active ? "ring-2 ring-slate-900/10 border-slate-400 shadow-sm" : onClick && "hover:border-slate-400",
        dimmed && "opacity-40",
      )}
    >
      <StatusDot status={status} />
      {Icon && <Icon className="w-3 h-3 shrink-0 opacity-70" />}
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold leading-tight truncate">{label}</span>
        <span className="block text-[9.5px] opacity-70 leading-tight truncate">{readout}</span>
      </span>
    </Tag>
  );
}

function Stage({
  index,
  title,
  value,
  icon: Icon,
  meta,
  children,
  last,
}: {
  index: number;
  title: string;
  value: string;
  icon: React.ElementType;
  meta: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm flex items-stretch min-h-0 flex-1">
        <div className="flex flex-col items-center justify-center gap-1 px-2 border-r border-slate-100 bg-slate-50/70 rounded-l-lg shrink-0 w-9">
          <span className="text-[10px] font-bold text-slate-900">{index}</span>
          <Icon className="w-3 h-3 text-slate-400" />
        </div>
        <div className="min-w-0 flex-1 p-2 flex flex-col justify-center">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <div className="min-w-0 flex items-baseline gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-900 shrink-0">
                {title}
              </span>
              <span className="text-[10px] text-slate-500 truncate">{value}</span>
            </div>
            <span className="text-[9.5px] font-mono text-slate-400 shrink-0">{meta}</span>
          </div>
          {children}
        </div>
      </div>
      {!last && (
        <div className="shrink-0 h-3 flex justify-center" aria-hidden>
          <div className="w-px h-full bg-slate-300" />
        </div>
      )}
    </>
  );
}

function DetailList({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: { label: string; sublabel: string }[];
}) {
  return (
    <div>
      <div className="text-[12px] font-semibold text-slate-900">{title}</div>
      {description && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{description}</p>}
      <div className="space-y-1.5 mt-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
            <div className="text-[11.5px] font-semibold text-slate-800 leading-tight">{item.label}</div>
            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.sublabel}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SystemFlowView({ onOpenProducts }: { onOpenProducts?: () => void } = {}) {
  const sourceGroups = createSourceGroups(onOpenProducts);
  const totalInputs = sourceGroups.reduce((n, g) => n + g.inputs.length, 0);
  const [selection, setSelection] = useState<Selection>(null);
  const session = useExecDemoSession();

  const hasRun = session.hasRun;
  const liveSignalLabels = new Set<string>();
  if (hasRun) {
    if ((session.detectedLifeEvents?.length ?? 0) > 0) liveSignalLabels.add("Life Event");
    if ((session.enrichedTxs?.length ?? 0) > 0) {
      liveSignalLabels.add("Behavioral");
      liveSignalLabels.add("Financial");
      liveSignalLabels.add("Demographic");
    }
    if ((session.riskFlags?.flags?.length ?? 0) > 0) liveSignalLabels.add("Risk");
  }
  const signalStatus = (label: string): Status =>
    !hasRun ? "idle" : liveSignalLabels.has(label) ? "live" : "partial";
  const runStatus: Status = hasRun ? "live" : "idle";

  const toggle = (stage: string, key: string) =>
    setSelection((cur) => (cur && cur.stage === stage && cur.key === key ? null : { stage, key }));

  const activeSource =
    selection?.stage === "source" ? sourceGroups.find((g) => g.provider === selection.key) : undefined;
  const activeSignal =
    selection?.stage === "signal" ? SIGNALS.find((s) => s.label === selection.key) : undefined;
  const activeTeam = selection?.stage === "team" ? TEAMS.find((t) => t.label === selection.key) : undefined;

  const teamSignals = (teamLabel: string) => {
    const team = TEAMS.find((t) => t.label === teamLabel);
    const set = new Set<string>();
    for (const step of team?.workflow ?? []) {
      for (const chip of step.chips ?? []) if (chip.kind === "signal") set.add(chip.label);
    }
    return set;
  };
  const teamDestinations = (teamLabel: string) => {
    const team = TEAMS.find((t) => t.label === teamLabel);
    const set = new Set<string>(["Digital Banking App"]);
    for (const step of team?.workflow ?? []) {
      for (const chip of step.chips ?? []) if (chip.kind === "destination") set.add(chip.label);
    }
    return set;
  };

  const relatedSignals = activeTeam ? teamSignals(activeTeam.label) : null;
  const relatedDestinations = activeTeam ? teamDestinations(activeTeam.label) : null;
  const relatedTeams = activeSignal
    ? new Set(TEAMS.filter((t) => teamSignals(t.label).has(activeSignal.label)).map((t) => t.label))
    : null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header: thesis + outcome rail */}
      <div className="shrink-0 flex items-center justify-between gap-4 pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <GitBranch className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 leading-tight">System Flow</h2>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">
              One enrichment layer turns the rails you already run into customer intelligence every team
              activates — no bespoke pipeline per destination.
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-stretch gap-2 shrink-0">
          {[
            { k: "Pipeline", v: hasRun ? "Live session" : "Standing by", s: runStatus },
            { k: "Providers", v: `${sourceGroups.length} connected`, s: "live" as Status },
            { k: "Signal layers", v: `${liveSignalLabels.size || 0}/${SIGNALS.length} firing`, s: hasRun ? "live" : "idle" as Status },
            { k: "Activation", v: `${DESTINATIONS.length} destinations`, s: "live" as Status },
          ].map((m) => (
            <div key={m.k} className="rounded-md border border-slate-200 bg-white px-2.5 py-1">
              <div className="text-[9px] uppercase tracking-wide text-slate-400 leading-none">{m.k}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <StatusDot status={m.s} />
                <span className="text-[11px] font-semibold text-slate-800 leading-none">{m.v}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={cn("flex-1 min-h-0 grid gap-3", selection ? "grid-cols-[1fr_300px]" : "grid-cols-1")}>
        <div className="min-h-0 flex flex-col">
          <Stage
            index={1}
            title="Data Sources"
            value={STAGE_VALUE.sources}
            icon={Database}
            meta={`${sourceGroups.length} providers · ${totalInputs} inputs`}
          >
            <div className="grid grid-cols-3 xl:grid-cols-6 gap-1.5">
              {sourceGroups.map((group) => (
                <Chip
                  key={group.provider}
                  label={group.provider}
                  readout={`${group.inputs.length} inputs · live`}
                  icon={group.icon}
                  status="live"
                  active={selection?.stage === "source" && selection.key === group.provider}
                  onClick={() => toggle("source", group.provider)}
                />
              ))}
            </div>
          </Stage>

          <Stage
            index={2}
            title="Ventus AI Engine"
            value={STAGE_VALUE.engine}
            icon={Cpu}
            meta={hasRun ? "processing session" : "idle · ready"}
          >
            <div className="flex items-center gap-2">
              <img src={ventusLogoTransparent} alt="Ventus AI" className="h-4 w-auto shrink-0" />
              <div className="grid grid-cols-5 gap-1.5 flex-1 min-w-0">
                {ENGINE_STEPS.map((step) => (
                  <Chip
                    key={step.label}
                    label={step.label}
                    readout={step.readout}
                    status={runStatus}
                    tint="bg-slate-50 text-slate-700 border-slate-200"
                  />
                ))}
              </div>
            </div>
          </Stage>

          <Stage
            index={3}
            title="Signal Layers"
            value={STAGE_VALUE.signals}
            icon={Layers}
            meta={`${SIGNALS.length} families per customer`}
          >
            <div className="grid grid-cols-5 gap-1.5">
              {SIGNALS.map((signal) => (
                <Chip
                  key={signal.label}
                  label={signal.label}
                  readout={`${signal.items.length} detectors`}
                  icon={signal.icon}
                  tint={signal.tint}
                  status={signalStatus(signal.label)}
                  active={selection?.stage === "signal" && selection.key === signal.label}
                  dimmed={!!relatedSignals && !relatedSignals.has(signal.label)}
                  onClick={() => toggle("signal", signal.label)}
                />
              ))}
            </div>
          </Stage>

          <Stage
            index={4}
            title="Bank Teams"
            value={STAGE_VALUE.teams}
            icon={Users}
            meta={`${TEAMS.length} teams`}
          >
            <div className="grid grid-cols-3 gap-1.5">
              {TEAMS.map((team) => (
                <Chip
                  key={team.label}
                  label={team.label}
                  readout={`${team.items.length} workflows`}
                  icon={team.icon}
                  tint={team.tint}
                  status="live"
                  active={selection?.stage === "team" && selection.key === team.label}
                  dimmed={!!relatedTeams && !relatedTeams.has(team.label)}
                  onClick={() => toggle("team", team.label)}
                />
              ))}
            </div>
          </Stage>

          <Stage
            index={5}
            title="Destinations"
            value={STAGE_VALUE.destinations}
            icon={Send}
            meta={`${DESTINATIONS.length} channels of record`}
            last
          >
            <div className="grid grid-cols-3 xl:grid-cols-6 gap-1.5">
              {DESTINATIONS.map((dest) => (
                <Chip
                  key={dest.label}
                  label={dest.label}
                  readout={dest.sublabel}
                  icon={dest.icon}
                  status={hasRun ? "live" : "idle"}
                  dimmed={!!relatedDestinations && !relatedDestinations.has(dest.label)}
                />
              ))}
            </div>
          </Stage>
        </div>

        {selection && (
          <div className="min-h-0 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 shrink-0">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                Detail
              </span>
              <button
                type="button"
                onClick={() => setSelection(null)}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close detail"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              {activeSource && (
                <DetailList
                  title={activeSource.provider}
                  description={activeSource.description}
                  items={activeSource.inputs}
                />
              )}
              {activeSignal && (
                <DetailList
                  title={`${activeSignal.label} signals`}
                  description={activeSignal.description}
                  items={activeSignal.items}
                />
              )}
              {activeTeam && (
                <div>
                  <div className="text-[12px] font-semibold text-slate-900">{activeTeam.label}</div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{activeTeam.description}</p>
                  <div className="mt-3 space-y-1.5">
                    {(activeTeam.workflow ?? []).map((step, i) => (
                      <div key={step.stage} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
                        <div className="flex gap-2">
                          <span className="text-[9.5px] font-mono text-slate-400 pt-0.5">0{i + 1}</span>
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-semibold text-slate-800 leading-tight">
                              {step.stage}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-snug mt-0.5">{step.text}</div>
                            {step.chips && step.chips.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {step.chips.map((chip) => (
                                  <span
                                    key={chip.label}
                                    className={cn(
                                      "px-1.5 py-0.5 rounded border text-[9.5px] font-medium",
                                      chipClass(chip),
                                    )}
                                  >
                                    {chip.label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
