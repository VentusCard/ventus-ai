// The Moments workbench. Design language: typography is the interface —
// confidence numerals carry the hierarchy, hairlines replace boxes, and the
// page holds exactly one bold action. Left: the queue as a ledger of rows.
// Right: the selected moment with its evidence and the activation.

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Landmark,
  Loader2,
  Plug,
  TrendingUp,
  X,
} from "lucide-react";
import { useConsole, type ConsoleMoment, type ScenarioId } from "@/console/state";
import salesforceLogo from "@/assets/salesforce-logo.png";

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
  return (
    <span
      className="v2-mono text-[9px] font-bold uppercase tracking-[0.1em]"
      style={{ color: status === "activated" ? "var(--v2-verified)" : "var(--v2-ink-faint)" }}
    >
      {status}
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
    dismiss,
    scenarioMeta,
  } = useConsole();

  const [selectedId, setSelectedId] = useState<string | null>(moments[0]?.id ?? null);
  const selected = useMemo(
    () => moments.find((moment) => moment.id === selectedId) ?? moments[0] ?? null,
    [moments, selectedId],
  );
  useEffect(() => {
    if (!selectedId && moments[0]) setSelectedId(moments[0].id);
  }, [moments, selectedId]);

  const live = connectorSession && connectorSession.expiresAt * 1000 > Date.now();

  if (moments.length === 0) {
    return (
      <div className="mx-auto flex min-h-[74vh] max-w-3xl flex-col items-center justify-center text-center">
        <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--v2-ink-faint)" }}>
          {tenant.name} · {tenant.product}
        </p>
        <h2 className="v2-display mt-6 text-5xl md:text-6xl">
          Run your first<br />ingestion.
        </h2>
        <p className="v2-body mx-auto mt-6 max-w-md text-[16px]">
          Pull a transaction stream from the Plaid sandbox, watch the pipeline
          qualify a moment, and activate it into Salesforce — end to end.
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
            Connect the live sandbox first
          </button>
        )}
        {(ingestError || connectError) && (
          <p className="mt-4 text-[13px] font-semibold" style={{ color: "var(--v2-amber)" }}>
            {ingestError ?? `${connectError} — fixtures run the same pipeline.`}
          </p>
        )}
        <p className="v2-mono mt-14 text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>
          {live ? "plaid sandbox connected · reads only" : "not connected · fixtures are labeled as fixtures"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 xl:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
      {/* Queue — a ledger of rows, not a wall of cards. */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <p className="v2-display text-[17px]">Queue</p>
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
                  opacity: moment.status === "dismissed" ? 0.45 : 1,
                }}
              >
                {isSelected && (
                  <span className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ backgroundColor: "var(--c-accent)" }} />
                )}
                <div className="flex items-baseline justify-between gap-4">
                  <p className="min-w-0 truncate text-[15px] font-bold" style={{ color: "var(--v2-ink)" }}>
                    {moment.opportunity.type}
                  </p>
                  <span className="console-stat flex-none text-[24px]" style={{ color: isSelected ? "var(--c-accent)" : "var(--v2-ink)" }}>
                    {moment.opportunity.confidence}
                    <span className="text-[13px]" style={{ color: "var(--v2-ink-faint)" }}>%</span>
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-[12px]" style={{ color: "var(--v2-ink-soft)" }}>
                    {scenarioMeta[moment.scenario].label} · {moment.opportunity.reason}
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
      </div>

      {/* Detail — one surface, one hero numeral, one bold action. */}
      {selected && (
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-6 border-b pb-6" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="min-w-0">
              <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
                {scenarioMeta[selected.scenario].label} · {selected.sourceName}
              </p>
              <h2 className="v2-display mt-2 text-[28px] md:text-[34px]">{selected.opportunity.type}</h2>
              <p className="v2-body mt-2 text-[14px]">{selected.opportunity.reason}</p>
            </div>
            <div className="flex-none text-right">
              <p className="console-stat text-[56px]" style={{ color: "var(--c-accent)" }}>
                {selected.opportunity.confidence}
                <span className="text-[24px]" style={{ color: "var(--v2-ink-faint)" }}>%</span>
              </p>
              <p className="v2-mono -mt-1 text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>
                confidence
              </p>
            </div>
          </div>

          <div className="border-b py-6" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="space-y-2.5">
              {selected.opportunity.signals.map((signal) => (
                <div key={signal.type} className="flex items-center gap-4">
                  <span className="w-48 flex-none truncate text-[13px] font-semibold" style={{ color: "var(--v2-ink)" }}>
                    {signal.label}
                  </span>
                  <span className="h-[3px] min-w-0 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--v2-rule)" }}>
                    <span className="block h-full rounded-full" style={{ width: `${Math.round(signal.strength * 100)}%`, backgroundColor: "var(--c-accent)" }} />
                  </span>
                  <span className="v2-mono w-10 flex-none text-right text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
                    {Math.round(signal.strength * 100)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              {selected.opportunity.enriched.slice(0, 6).map((row) => (
                <div key={`${row.raw}-${row.date}`} className="flex items-center gap-3 border-t py-2 first:border-t-0" style={{ borderColor: "var(--v2-rule)" }}>
                  <span className="v2-mono w-24 flex-none truncate text-[9px] uppercase tracking-[0.06em]" style={{ color: "var(--v2-ink-faint)" }}>{row.src}</span>
                  <span className="v2-mono min-w-0 flex-1 truncate text-[11px]" style={{ color: "var(--v2-ink)" }}>{row.raw}</span>
                  <span className="flex-none text-[11px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>{row.tag}</span>
                </div>
              ))}
            </div>
            <p className="v2-mono mt-3 flex items-center gap-2 text-[10px]" style={{ color: selected.policy.allowed ? "var(--v2-verified)" : "var(--v2-amber)" }}>
              {selected.policy.allowed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {selected.policy.reason}
            </p>
          </div>

          {selected.status === "activated" && selected.receipt ? (
            <div className="py-6">
              <p className="flex items-center gap-2 text-[17px] font-bold" style={{ color: "var(--v2-verified)" }}>
                <Check className="h-5 w-5" /> {selected.receipt.subject}
              </p>
              <p className="v2-mono mt-2 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
                {selected.receipt.id} · sandbox org · receipt on the ledger
              </p>
              {selected.receipt.url && (
                <a href={selected.receipt.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: "var(--c-accent)" }}>
                  Open in Salesforce <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          ) : selected.status !== "dismissed" ? (
            <div className="py-6">
              <div className="flex items-center gap-3">
                <img src={salesforceLogo} alt="Salesforce" className="h-7 w-11 flex-none object-contain" />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>{scenarioMeta[selected.scenario].subject}</p>
                  <p className="truncate text-[11px]" style={{ color: "var(--v2-ink-faint)" }}>{selected.opportunity.destination} · {tenant.name}</p>
                </div>
              </div>
              <button
                onClick={() => void activate(selected.id)}
                disabled={!selected.policy.allowed || activating === selected.id || !live}
                className="console-btn mt-5 w-full !py-4 !text-[15px]"
                title={!live ? "Connect the live sandbox to write to Salesforce" : undefined}
              >
                {activating === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Create Salesforce Task
              </button>
              <div className="mt-3 flex items-center justify-between gap-3">
                <button onClick={() => dismiss(selected.id)} className="text-[13px] font-semibold" style={{ color: "var(--v2-ink-faint)" }}>
                  Not relevant
                </button>
                {!live && (
                  <span className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
                    connect the sandbox to enable the live write
                  </span>
                )}
              </div>
              {activateError && <p className="mt-3 text-[13px] font-semibold" style={{ color: "#b3261e" }}>{activateError}</p>}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
