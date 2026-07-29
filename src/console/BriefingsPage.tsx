import { useMemo, useState } from "react";
import { ArrowRight, Check, Clock3, Inbox, Landmark, Mail, Slack, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useConsole, type ConsoleMoment, type ScenarioId } from "@/console/state";

type BriefingRole = "executive" | "consumer" | "wealth";

const ROLES: Array<{
  id: BriefingRole;
  label: string;
  scenario?: ScenarioId;
}> = [
  { id: "executive", label: "Executive" },
  { id: "consumer", label: "Consumer growth", scenario: "deposit-retention" },
  { id: "wealth", label: "Wealth growth", scenario: "wealth-growth" },
];

function statusLabel(status: ConsoleMoment["status"]): string {
  if (status === "queued") return "Needs review";
  if (status === "activated") return "Routed";
  if (status === "deferred") return "Deferred";
  return "Declined";
}

export default function BriefingsPage() {
  const { tenant, moments, scenarioMeta } = useConsole();
  const [role, setRole] = useState<BriefingRole>("executive");
  const selectedRole = ROLES.find((candidate) => candidate.id === role) ?? ROLES[0];
  const visibleMoments = useMemo(() => {
    const scoped = selectedRole.scenario
      ? moments.filter((moment) => moment.scenario === selectedRole.scenario)
      : moments;
    return [...scoped].sort((left, right) => {
      if (left.status === "queued" && right.status !== "queued") return -1;
      if (right.status === "queued" && left.status !== "queued") return 1;
      return right.opportunity.confidence - left.opportunity.confidence;
    });
  }, [moments, selectedRole.scenario]);

  const queued = visibleMoments.filter((moment) => moment.status === "queued").length;
  const routed = visibleMoments.filter((moment) => moment.status === "activated").length;
  const observed = visibleMoments.filter(
    (moment) => moment.decisionPackage?.outcome.observation,
  ).length;
  const briefingTitle = selectedRole.id === "executive"
    ? `${queued} decision${queued === 1 ? "" : "s"} need attention`
    : selectedRole.id === "consumer"
      ? `${queued} deposit relationship${queued === 1 ? "" : "s"} need attention`
      : `${queued} wealth moment${queued === 1 ? "" : "s"} need attention`;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b pb-5" style={{ borderColor: "var(--v2-rule)" }}>
        <div>
          <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
            Role-aware intelligence · workspace briefing
          </p>
          <h2 className="v2-display mt-2 text-3xl">What changed. What needs action.</h2>
        </div>
        <div className="inline-flex rounded-md border bg-white p-1" style={{ borderColor: "var(--v2-rule)" }}>
          {ROLES.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => setRole(candidate.id)}
              aria-pressed={role === candidate.id}
              className="rounded px-3 py-1.5 text-[11px] font-bold transition-colors"
              style={{
                color: role === candidate.id ? "white" : "var(--v2-ink-soft)",
                backgroundColor: role === candidate.id ? "var(--c-accent)" : "transparent",
              }}
            >
              {candidate.label}
            </button>
          ))}
        </div>
      </div>

      {visibleMoments.length === 0 ? (
        <div className="console-cell mt-5 flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
          <Inbox className="h-9 w-9" style={{ color: "var(--v2-ink-faint)" }} />
          <h3 className="v2-display mt-5 text-2xl">No briefing yet.</h3>
          <p className="v2-body mt-2 max-w-sm text-[13px]">
            Run an ingestion first. Coworker summarizes qualified moments; it
            does not create a separate decision.
          </p>
          <Link to="/app/moments" className="console-btn mt-6 !px-4 !py-2.5 !text-[12px]">
            Open Moments <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-px overflow-hidden rounded-lg border md:grid-cols-[1.45fr_repeat(3,0.55fr)]" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-rule)" }}>
            <div className="bg-white p-5">
              <p className="v2-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "var(--v2-ink-faint)" }}>
                Current briefing · {tenant.shortName}
              </p>
              <p className="mt-2 text-[22px] font-bold" style={{ color: "var(--v2-ink)" }}>{briefingTitle}</p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--v2-ink-soft)" }}>
                Prioritized from governed Growth Play decisions in this workspace.
              </p>
            </div>
            {[
              ["Needs review", queued],
              ["Routed", routed],
              ["Outcomes observed", observed],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-white p-5">
                <p className="console-stat text-[38px]" style={{ color: "var(--v2-ink)" }}>{value}</p>
                <p className="v2-mono mt-1 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="console-cell mt-5 overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b px-4 py-3" style={{ borderColor: "var(--v2-rule)" }}>
              <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>
                Priority changes
              </p>
              <span className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
                Console preview
              </span>
            </div>
            {visibleMoments.slice(0, 5).map((moment) => {
              const meta = scenarioMeta[moment.scenario];
              const Icon = moment.scenario === "deposit-retention" ? Landmark : TrendingUp;
              const isRouted = moment.status === "activated";
              return (
                <div key={moment.id} className="grid gap-3 border-b px-4 py-4 last:border-0 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto_auto]" style={{ borderColor: "var(--v2-rule)" }}>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-md" style={{ color: "var(--c-accent)", backgroundColor: "var(--c-accent-wash)" }}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>{moment.opportunity.type}</p>
                      <p className="mt-0.5 truncate text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>{meta.objective}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: "var(--v2-ink)" }}>{meta.actions[0]?.title}</p>
                    <p className="mt-0.5 text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                      {moment.opportunity.confidence}% confidence · {moment.sourceMode === "live" ? "live sandbox" : "fixture"}
                    </p>
                  </div>
                  <span className="flex items-center justify-end gap-1.5 text-[10px] font-bold" style={{ color: isRouted ? "var(--v2-verified)" : "var(--v2-ink-soft)" }}>
                    {isRouted ? <Check className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                    {statusLabel(moment.status)}
                  </span>
                  <Link
                    to={`/app/moments?moment=${encodeURIComponent(moment.id)}&source=briefing`}
                    className="inline-flex items-center justify-end gap-1 text-[11px] font-bold"
                    style={{ color: "var(--c-accent)" }}
                  >
                    Review <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-[#f7f6f2] px-4 py-3" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold" style={{ color: "var(--v2-verified)" }}>
                  <Inbox className="h-3.5 w-3.5" /> Console active
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                  <Mail className="h-3.5 w-3.5" /> Outlook · admin setup
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                  <Slack className="h-3.5 w-3.5" /> Slack · admin setup
                </span>
              </div>
              <Link to="/app/moments" className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--c-accent)" }}>
                Open all moments <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
