import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Landmark,
  Loader2,
  Plug,
  Send,
  TrendingUp,
  X,
} from "lucide-react";
import {
  decisionPackageForMoment,
  useConsole,
  type ConsoleMoment,
  type ScenarioId,
} from "@/console/state";

const SCENARIOS: Array<{ id: ScenarioId; label: string; Icon: typeof Landmark }> = [
  { id: "deposit-retention", label: "Consumer Banking", Icon: Landmark },
  { id: "wealth-growth", label: "Wealth Management", Icon: TrendingUp },
];

function SourceChip({ moment }: { moment: ConsoleMoment }) {
  const live = moment.sourceMode === "live";
  return (
    <span
      className="v2-mono text-[9px] font-bold uppercase tracking-[0.1em]"
      style={{ color: live ? "var(--v2-verified)" : "var(--v2-amber)" }}
    >
      {live ? "● live sandbox" : "○ fixture"}
    </span>
  );
}

function StatusChip({ status }: { status: ConsoleMoment["status"] }) {
  if (status === "queued") return null;
  const label = status === "dismissed" ? "declined" : status;
  return (
    <span
      className="v2-mono text-[9px] font-bold uppercase tracking-[0.1em]"
      style={{ color: status === "activated" ? "var(--v2-verified)" : "var(--v2-ink-faint)" }}
    >
      {label}
    </span>
  );
}

export default function MomentsPage() {
  const {
    tenant,
    connectorSession,
    connecting,
    connectError,
    connect,
    moments,
    ingesting,
    ingestError,
    ingest,
    activating,
    activateError,
    activate,
    defer,
    decline,
    scenarioMeta,
  } = useConsole();
  const [selectedId, setSelectedId] = useState<string | null>(moments[0]?.id ?? null);
  const [controlMode, setControlMode] = useState<"none" | "modify" | "defer" | "decline">("none");
  const [selectedActionId, setSelectedActionId] = useState("");
  const [responseReason, setResponseReason] = useState("");
  const selected = useMemo(
    () => moments.find((moment) => moment.id === selectedId) ?? moments[0] ?? null,
    [moments, selectedId],
  );
  const live = Boolean(connectorSession && connectorSession.expiresAt * 1000 > Date.now());

  useEffect(() => {
    if (!selectedId && moments[0]) setSelectedId(moments[0].id);
  }, [moments, selectedId]);

  useEffect(() => {
    if (!selected) return;
    const decision = selected.decisionPackage ?? decisionPackageForMoment(selected, tenant);
    setSelectedActionId(decision.recommendation.selectedAction.id);
    setControlMode("none");
    setResponseReason("");
  }, [selected, tenant]);

  if (moments.length === 0) {
    return (
      <div className="mx-auto flex min-h-[74vh] max-w-3xl flex-col items-center justify-center text-center">
        <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--v2-ink-faint)" }}>
          {tenant.name} · {tenant.product}
        </p>
        <h2 className="v2-display mt-6 text-5xl md:text-6xl">
          Run the decision<br />loop.
        </h2>
        <p className="v2-body mx-auto mt-6 max-w-md text-[16px]">
          Ingest a sanctioned stream, qualify a customer moment, and route a
          governed action into the employee workflow.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {SCENARIOS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => void ingest(id)} disabled={ingesting} className="console-btn !px-6 !py-3.5 !text-[15px]">
              {ingesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />} {label}
            </button>
          ))}
        </div>
        {!live && (
          <button onClick={() => void connect()} disabled={connecting} className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--c-accent)" }}>
            {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
            Connect live sandboxes
          </button>
        )}
        {(ingestError || connectError) && (
          <p className="mt-4 text-[13px] font-semibold" style={{ color: "var(--v2-amber)" }}>
            {ingestError ?? `${connectError} — fixtures remain clearly labeled.`}
          </p>
        )}
      </div>
    );
  }

  const decision = selected
    ? selected.decisionPackage ?? decisionPackageForMoment(selected, tenant)
    : null;
  const actions = selected ? scenarioMeta[selected.scenario].actions : [];
  const chosenAction = actions.find((action) => action.id === selectedActionId) ?? actions[0];

  const confirmResponse = () => {
    if (!selected) return;
    if (controlMode === "defer") defer(selected.id, responseReason || "Review later");
    if (controlMode === "decline") decline(selected.id, responseReason || "Not relevant");
    setControlMode("none");
    setResponseReason("");
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 xl:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
      <section className="min-w-0" aria-label="Qualified moments">
        <div className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <p className="v2-display text-[17px]">Qualified moments</p>
          <div className="flex items-center gap-4">
            {!live && (
              <button onClick={() => void connect()} disabled={connecting} className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "var(--c-accent)" }}>
                {connecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plug className="h-3 w-3" />} Connect
              </button>
            )}
            {SCENARIOS.map(({ id, label }) => (
              <button key={id} onClick={() => void ingest(id)} disabled={ingesting} className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--c-accent)" }}>
                {ingesting ? <Loader2 className="h-3 w-3 animate-spin" /> : "+"} {label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        {(ingestError || connectError) && (
          <p className="pb-3 text-[12px] font-semibold" style={{ color: "var(--v2-amber)" }}>{ingestError ?? connectError}</p>
        )}
        <div className="border-t" style={{ borderColor: "var(--v2-rule)" }}>
          {moments.map((moment) => {
            const isSelected = selected?.id === moment.id;
            return (
              <button
                key={moment.id}
                onClick={() => setSelectedId(moment.id)}
                className="relative block w-full border-b py-4 pl-4 pr-2 text-left transition-colors"
                style={{
                  borderColor: "var(--v2-rule)",
                  backgroundColor: isSelected ? "var(--c-accent-wash)" : "transparent",
                  opacity: moment.status === "declined" || moment.status === "dismissed" ? 0.5 : 1,
                }}
              >
                {isSelected && <span className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ backgroundColor: "var(--c-accent)" }} />}
                <div className="flex items-baseline justify-between gap-4">
                  <p className="min-w-0 truncate text-[15px] font-bold" style={{ color: "var(--v2-ink)" }}>
                    {moment.opportunity.type}
                  </p>
                  <span className="console-stat flex-none text-[24px]" style={{ color: isSelected ? "var(--c-accent)" : "var(--v2-ink)" }}>
                    {moment.opportunity.confidence}<span className="text-[13px]" style={{ color: "var(--v2-ink-faint)" }}>%</span>
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-[12px]" style={{ color: "var(--v2-ink-soft)" }}>
                    {scenarioMeta[moment.scenario].label} · {scenarioMeta[moment.scenario].objective}
                  </p>
                  <span className="flex flex-none items-center gap-2.5">
                    <StatusChip status={moment.status} />
                    <SourceChip moment={moment} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selected && decision && chosenAction && (
        <section className="min-w-0" aria-label="Decision package">
          <div className="flex items-start justify-between gap-6 border-b pb-5" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="min-w-0">
              <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
                {decision.growthPlay.objective} · {decision.growthPlay.primaryMetric.replaceAll("_", " ")}
              </p>
              <h2 className="v2-display mt-2 text-[28px] md:text-[34px]">{decision.moment.type}</h2>
              <p className="v2-body mt-2 max-w-2xl text-[14px]">{decision.moment.summary}</p>
            </div>
            <div className="flex-none text-right">
              <p className="console-stat text-[52px]" style={{ color: "var(--c-accent)" }}>
                {decision.moment.confidence}<span className="text-[22px]" style={{ color: "var(--v2-ink-faint)" }}>%</span>
              </p>
              <p className="v2-mono -mt-1 text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>confidence</p>
            </div>
          </div>

          <div className="grid gap-6 border-b py-5 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]" style={{ borderColor: "var(--v2-rule)" }}>
            <div>
              <p className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>Evidence</p>
              <div className="mt-3 space-y-3">
                {decision.moment.evidence.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--v2-ink)" }}>{item.label}</p>
                    <span className="v2-mono text-[10px]" style={{ color: "var(--v2-ink-soft)" }}>{item.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="flex items-center justify-between gap-3">
                <p className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>Recommended action</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: selected.policy.allowed ? "var(--v2-verified)" : "var(--v2-amber)" }}>
                  {selected.policy.allowed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {selected.policy.allowed ? "Policy cleared" : "Suppressed"}
                </span>
              </div>
              <p className="mt-3 text-[17px] font-bold" style={{ color: "var(--v2-ink)" }}>{chosenAction.title}</p>
              <p className="mt-1.5 text-[13px] leading-5" style={{ color: "var(--v2-ink-soft)" }}>{chosenAction.instructions}</p>
              <p className="v2-mono mt-3 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
                {chosenAction.ownerRole} · {chosenAction.destination}
              </p>
            </div>
          </div>

          <details className="group border-b py-3" style={{ borderColor: "var(--v2-rule)" }}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>
              Inspect evidence and decision method
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                {selected.opportunity.enriched.slice(0, 6).map((row) => (
                  <div key={`${row.raw}-${row.date}`} className="flex items-center gap-3 border-t py-2 first:border-t-0" style={{ borderColor: "var(--v2-rule)" }}>
                    <span className="v2-mono w-24 flex-none truncate text-[9px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>{row.src}</span>
                    <span className="v2-mono min-w-0 flex-1 truncate text-[10px]" style={{ color: "var(--v2-ink)" }}>{row.raw}</span>
                    <span className="flex-none text-[10px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>{row.tag}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] leading-5" style={{ color: "var(--v2-ink-soft)" }}>
                <p><strong style={{ color: "var(--v2-ink)" }}>Active:</strong> governed deterministic baseline</p>
                <p><strong style={{ color: "var(--v2-ink)" }}>Shadow:</strong> model-assisted planner for evaluation</p>
                <p><strong style={{ color: "var(--v2-ink)" }}>Source:</strong> {selected.sourceName}</p>
                <p><strong style={{ color: "var(--v2-ink)" }}>Receipt:</strong> {decision.decisionId} · schema {decision.schemaVersion}</p>
              </div>
            </div>
          </details>

          {selected.status === "activated" && selected.receipt ? (
            <div className="py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-[17px] font-bold" style={{ color: "var(--v2-verified)" }}>
                    <Check className="h-5 w-5" /> Delivered to the employee workflow
                  </p>
                  <p className="mt-1 text-[12px]" style={{ color: "var(--v2-ink-soft)" }}>
                    Decision, referral, and action remain linked by {decision.decisionId}.
                  </p>
                </div>
                <span className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>outcome window open</span>
              </div>
              <div className="mt-4 grid gap-px overflow-hidden rounded-md border sm:grid-cols-3" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-rule)" }}>
                {[
                  ["Decision receipt", selected.receipt.records?.decision, "Ventus ledger"],
                  ["Qualified referral", selected.receipt.records?.referral, "FSC routing"],
                  ["Employee task", selected.receipt.records?.task, "Action"],
                ].map(([label, record, fallback]) => (
                  <div key={label as string} className="bg-white p-3">
                    <p className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>{label as string}</p>
                    {record && typeof record === "object" && "url" in record ? (
                      <a href={record.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: "var(--c-accent)" }}>
                        Open record <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <p className="mt-2 text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>{fallback as string}</p>
                    )}
                  </div>
                ))}
              </div>
              {selected.receipt.warnings?.length ? (
                <details className="mt-3 text-[11px]" style={{ color: "var(--v2-amber)" }}>
                  <summary className="cursor-pointer font-semibold">Connector completed with {selected.receipt.warnings.length} warning(s)</summary>
                  {selected.receipt.warnings.map((warning) => <p key={warning.stage} className="mt-1">{warning.stage}: {warning.message}</p>)}
                </details>
              ) : null}
            </div>
          ) : selected.status === "deferred" || selected.status === "declined" || selected.status === "dismissed" ? (
            <div className="flex items-center gap-3 py-5">
              {selected.status === "deferred" ? <Clock3 className="h-5 w-5" /> : <X className="h-5 w-5" />}
              <div>
                <p className="text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>
                  {selected.status === "deferred" ? "Deferred for review" : "Declined by the operator"}
                </p>
                <p className="text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>The response is recorded and returned to the Growth Play.</p>
              </div>
            </div>
          ) : (
            <div className="py-5">
              {controlMode === "modify" && (
                <div className="mb-4 space-y-2">
                  {actions.map((action) => (
                    <label key={action.id} className="flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5" style={{ borderColor: selectedActionId === action.id ? "var(--c-accent)" : "var(--v2-rule)" }}>
                      <input type="radio" name="decision-action" checked={selectedActionId === action.id} onChange={() => setSelectedActionId(action.id)} className="mt-1" />
                      <span>
                        <span className="block text-[12px] font-bold" style={{ color: "var(--v2-ink)" }}>{action.title}</span>
                        <span className="block text-[10px]" style={{ color: "var(--v2-ink-soft)" }}>{action.ownerRole} · {action.destination}</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {(controlMode === "defer" || controlMode === "decline") && (
                <div className="mb-4">
                  <label className="v2-mono text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--v2-ink-faint)" }}>
                    {controlMode === "defer" ? "What needs review?" : "Why is this not appropriate?"}
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input value={responseReason} onChange={(event) => setResponseReason(event.target.value)} className="console-field !py-2.5 !text-[13px]" placeholder="Optional note" />
                    <button onClick={confirmResponse} className="console-btn !px-4 !py-2.5"><Check className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
              <button
                onClick={() => void activate(selected.id, selectedActionId)}
                disabled={!selected.policy.allowed || activating === selected.id || !live}
                className="console-btn w-full !py-4 !text-[15px]"
                title={!live ? "Connect the live sandbox to route this decision" : undefined}
              >
                {activating === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {selectedActionId === actions[0]?.id ? "Approve and route" : "Route modified action"}
              </button>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <button onClick={() => setControlMode(controlMode === "modify" ? "none" : "modify")} className="text-[12px] font-semibold" style={{ color: "var(--c-accent)" }}>Modify</button>
                  <button onClick={() => setControlMode("defer")} className="text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>Defer</button>
                  <button onClick={() => setControlMode("decline")} className="text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>Decline</button>
                </div>
                {!live && <span className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>live route requires connector session</span>}
              </div>
              {activateError && <p className="mt-3 text-[13px] font-semibold" style={{ color: "#b3261e" }}>{activateError}</p>}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
