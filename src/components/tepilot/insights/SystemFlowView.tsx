import { useState } from "react";
import { TabHeader } from "./TabHeader";
import {
  SIGNALS,
  TEAMS,
  DESTINATIONS,
  createSourceGroups,
  chipClass,
} from "./CapabilitiesView";
import { cn } from "@/lib/utils";
import { ChevronDown, Database, Cpu, Layers, Users, Send } from "lucide-react";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";

type Selection = { stage: string; key: string } | null;

const ENGINE_STEPS = [
  { label: "Ingest", sublabel: "Multi-rail streams normalized" },
  { label: "Resolve", sublabel: "Identity + merchant resolution" },
  { label: "Classify", sublabel: "3-tier taxonomy assignment" },
  { label: "Enrich", sublabel: "Signal synthesis across 5 layers" },
  { label: "Score", sublabel: "Confidence, recency, evidence" },
];

function StageShell({
  index,
  title,
  caption,
  icon: Icon,
  children,
  detail,
  last,
}: {
  index: number;
  title: string;
  caption: string;
  icon: React.ElementType;
  children: React.ReactNode;
  detail?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="relative">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-900 text-white text-[11px] font-bold shrink-0">
            {index}
          </div>
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-slate-900 leading-tight uppercase tracking-wide">
              {title}
            </div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{caption}</div>
          </div>
        </div>
        <div className="p-4">{children}</div>
        {detail && <div className="border-t border-slate-100 bg-slate-50/70 p-4 rounded-b-xl">{detail}</div>}
      </div>
      {!last && (
        <div className="flex flex-col items-center py-2" aria-hidden>
          <div className="w-px h-5 bg-slate-300" />
          <div className="w-2 h-2 rotate-45 border-r border-b border-slate-300 -mt-1" />
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  sublabel,
  icon: Icon,
  active,
  dimmed,
  tint,
  onClick,
}: {
  label: string;
  sublabel?: string;
  icon?: React.ElementType;
  active?: boolean;
  dimmed?: boolean;
  tint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all",
        tint ?? "bg-white text-slate-700 border-slate-200",
        active ? "ring-2 ring-slate-900/10 border-slate-400 shadow-sm" : "hover:border-slate-400",
        dimmed && "opacity-40",
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold leading-tight truncate">{label}</span>
        {sublabel && (
          <span className="block text-[10.5px] opacity-70 leading-tight truncate mt-0.5">{sublabel}</span>
        )}
      </span>
      {onClick && (
        <ChevronDown
          className={cn("w-3 h-3 shrink-0 ml-auto transition-transform", active && "rotate-180")}
        />
      )}
    </button>
  );
}

function DetailList({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: { label: string; sublabel: string; icon?: React.ElementType }[];
}) {
  return (
    <div>
      <div className="text-[12px] font-semibold text-slate-900">{title}</div>
      {description && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{description}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 mt-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[12px] font-semibold text-slate-800 leading-tight">{item.label}</div>
            <div className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{item.sublabel}</div>
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

  const toggle = (stage: string, key: string) =>
    setSelection((cur) => (cur && cur.stage === stage && cur.key === key ? null : { stage, key }));

  const activeSource =
    selection?.stage === "source" ? sourceGroups.find((g) => g.provider === selection.key) : undefined;
  const activeSignal =
    selection?.stage === "signal" ? SIGNALS.find((s) => s.label === selection.key) : undefined;
  const activeTeam = selection?.stage === "team" ? TEAMS.find((t) => t.label === selection.key) : undefined;

  // Cross-stage highlighting: which signals a team consumes, which teams a signal feeds.
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
    <div className="p-6 max-w-6xl mx-auto">
      <TabHeader
        title="System Flow"
        subtitle="The full pipeline top to bottom — sources, engine, signal layers, the teams that consume them, and where output lands."
      />

      <div className="mt-6">
        <StageShell
          index={1}
          title="Data Sources"
          caption={`${sourceGroups.length} providers · ${totalInputs} inputs`}
          icon={Database}
          detail={
            activeSource ? (
              <DetailList
                title={activeSource.provider}
                description={activeSource.description}
                items={activeSource.inputs}
              />
            ) : undefined
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {sourceGroups.map((group) => (
              <Chip
                key={group.provider}
                label={group.provider}
                sublabel={`${group.inputs.length} inputs`}
                icon={group.icon}
                active={selection?.stage === "source" && selection.key === group.provider}
                onClick={() => toggle("source", group.provider)}
              />
            ))}
          </div>
        </StageShell>

        <StageShell index={2} title="Ventus AI Engine" caption="Enrichment pipeline" icon={Cpu}>
          <div className="flex items-center gap-3 mb-4">
            <img src={ventusLogoTransparent} alt="Ventus AI" className="h-6 w-auto" />
            <span className="text-[11px] text-slate-500">
              Every input is normalized, resolved, classified, and scored before it becomes a signal.
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {ENGINE_STEPS.map((step, i) => (
              <div
                key={step.label}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
              >
                <div className="text-[10px] font-mono text-slate-400">0{i + 1}</div>
                <div className="text-[12px] font-semibold text-slate-900 leading-tight mt-0.5">
                  {step.label}
                </div>
                <div className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{step.sublabel}</div>
              </div>
            ))}
          </div>
        </StageShell>

        <StageShell
          index={3}
          title="Signal Layers"
          caption="5 layers synthesized per customer"
          icon={Layers}
          detail={
            activeSignal ? (
              <DetailList
                title={`${activeSignal.label} signals`}
                description={activeSignal.description}
                items={activeSignal.items}
              />
            ) : undefined
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {SIGNALS.map((signal) => (
              <Chip
                key={signal.label}
                label={signal.label}
                sublabel={`${signal.items.length} detectors`}
                icon={signal.icon}
                tint={signal.tint}
                active={selection?.stage === "signal" && selection.key === signal.label}
                dimmed={!!relatedSignals && !relatedSignals.has(signal.label)}
                onClick={() => toggle("signal", signal.label)}
              />
            ))}
          </div>
        </StageShell>

        <StageShell
          index={4}
          title="Bank Teams"
          caption="Who consumes the signals"
          icon={Users}
          detail={
            activeTeam ? (
              <div>
                <div className="text-[12px] font-semibold text-slate-900">{activeTeam.label}</div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{activeTeam.description}</p>
                <div className="mt-3 space-y-2">
                  {(activeTeam.workflow ?? []).map((step, i) => (
                    <div
                      key={step.stage}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 flex gap-3"
                    >
                      <div className="text-[10px] font-mono text-slate-400 pt-0.5">0{i + 1}</div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-slate-800 leading-tight">
                          {step.stage}
                        </div>
                        <div className="text-[10.5px] text-slate-500 leading-snug mt-0.5">{step.text}</div>
                        {step.chips && step.chips.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {step.chips.map((chip) => (
                              <span
                                key={chip.label}
                                className={cn(
                                  "px-1.5 py-0.5 rounded border text-[10px] font-medium",
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
                  ))}
                </div>
              </div>
            ) : undefined
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {TEAMS.map((team) => (
              <Chip
                key={team.label}
                label={team.label}
                sublabel={`${team.items.length} workflows`}
                icon={team.icon}
                tint={team.tint}
                active={selection?.stage === "team" && selection.key === team.label}
                dimmed={!!relatedTeams && !relatedTeams.has(team.label)}
                onClick={() => toggle("team", team.label)}
              />
            ))}
          </div>
        </StageShell>

        <StageShell
          index={5}
          title="Destinations"
          caption="Where enriched output lands"
          icon={Send}
          last
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DESTINATIONS.map((dest) => (
              <Chip
                key={dest.label}
                label={dest.label}
                sublabel={dest.sublabel}
                icon={dest.icon}
                dimmed={!!relatedDestinations && !relatedDestinations.has(dest.label)}
              />
            ))}
          </div>
        </StageShell>
      </div>
    </div>
  );
}
