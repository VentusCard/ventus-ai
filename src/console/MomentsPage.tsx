// The Moments workbench — the product's working surface. Left: the queue of
// qualified moments. Right: the selected moment's evidence, policy gate, and
// the one action that matters: create the task in the bank's own system of
// record. Live Plaid sandbox when connected; identical pipeline on fixtures.

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Landmark,
  Loader2,
  Plug,
  Radar,
  ShieldCheck,
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
      className="v2-mono rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em]"
      style={{
        color: live ? "var(--v2-verified)" : "var(--v2-amber)",
        backgroundColor: live ? "var(--v2-verified-wash)" : "var(--v2-amber-wash)",
      }}
    >
      {live ? "Live sandbox" : "Fixture"}
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
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
        <Radar className="h-9 w-9" style={{ color: "var(--v2-ink-faint)" }} />
        <h2 className="v2-display mt-5 text-3xl">Run your first ingestion.</h2>
        <p className="v2-body mt-3 max-w-md text-[15px]">
          Pull a transaction stream from the Plaid sandbox, watch the pipeline
          qualify a moment, and activate it into Salesforce — end to end.
        </p>
        {!live && (
          <button onClick={() => void connect()} disabled={connecting} className="console-btn-ghost mt-8">
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />} Connect live sandbox
          </button>
        )}
        {connectError && <p className="mt-2 text-[12px] font-semibold" style={{ color: "var(--v2-amber)" }}>{connectError} — fixtures will be used.</p>}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {SCENARIOS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => void ingest(id)} disabled={ingesting} className="console-btn">
              {ingesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />} Ingest {label}
            </button>
          ))}
        </div>
        {ingestError && <p className="mt-3 text-[12px] font-semibold" style={{ color: "#b3261e" }}>{ingestError}</p>}
        <p className="v2-mono mt-10 text-[9px] uppercase tracking-[0.12em]" style={{ color: "var(--v2-ink-faint)" }}>
          {live ? "Plaid sandbox connected · reads only" : "Not connected · Plaid-shaped fixtures run the same pipeline"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
      {/* Queue */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>
            Qualified moments · {moments.length}
          </p>
          <div className="flex items-center gap-2">
            {!live && (
              <button onClick={() => void connect()} disabled={connecting} className="console-btn-ghost !px-3 !py-1.5 !text-[11px]">
                {connecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plug className="h-3 w-3" />} Connect
              </button>
            )}
            {SCENARIOS.map(({ id, label }) => (
              <button key={id} onClick={() => void ingest(id)} disabled={ingesting} className="console-btn !px-3 !py-1.5 !text-[11px]">
                {ingesting ? <Loader2 className="h-3 w-3 animate-spin" /> : "+"} {label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        {(ingestError || connectError) && (
          <p className="mt-2 text-[11px] font-semibold" style={{ color: "var(--v2-amber)" }}>{ingestError ?? connectError}</p>
        )}
        <div className="mt-3 space-y-2">
          {moments.map((moment) => {
            const isSelected = selected?.id === moment.id;
            return (
              <button
                key={moment.id}
                onClick={() => setSelectedId(moment.id)}
                className="console-cell w-full p-4 text-left transition-shadow"
                style={{
                  borderColor: isSelected ? "var(--c-accent)" : "var(--v2-rule)",
                  boxShadow: isSelected ? "0 0 0 1px var(--c-accent)" : "none",
                  opacity: moment.status === "dismissed" ? 0.55 : 1,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
                    {scenarioMeta[moment.scenario].label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <SourceChip moment={moment} />
                    {moment.status === "activated" && (
                      <span className="v2-mono rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ color: "var(--v2-verified)", backgroundColor: "var(--v2-verified-wash)" }}>
                        Activated
                      </span>
                    )}
                    {moment.status === "dismissed" && (
                      <span className="v2-mono rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ color: "var(--v2-ink-faint)", backgroundColor: "#f1f0ec" }}>
                        Dismissed
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>
                    {moment.opportunity.type}
                  </p>
                  <span className="console-stat flex-none text-[18px]" style={{ color: "var(--c-accent)" }}>
                    {moment.opportunity.confidence}%
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
                  {moment.opportunity.reason}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      {selected && (
        <div className="console-cell min-w-0 self-start">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3.5" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="flex items-center gap-2.5">
              <span className="console-stat text-[22px]" style={{ color: "var(--c-accent)" }}>
                {selected.opportunity.confidence}%
              </span>
              <p className="text-[15px] font-bold" style={{ color: "var(--v2-ink)" }}>{selected.opportunity.type}</p>
            </div>
            <SourceChip moment={selected} />
          </div>

          <div className="space-y-5 p-5">
            <div>
              <p className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>
                Why now
              </p>
              <p className="mt-1.5 text-[13px] font-medium leading-5" style={{ color: "var(--v2-ink)" }}>
                {selected.opportunity.reason}
              </p>
            </div>

            <div>
              <p className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>
                Signals · {selected.opportunity.signals.length}
              </p>
              <div className="mt-2 space-y-1.5">
                {selected.opportunity.signals.map((signal) => (
                  <div key={signal.type} className="flex items-center gap-3">
                    <span className="w-40 flex-none truncate text-[11px] font-semibold" style={{ color: "var(--v2-ink)" }}>
                      {signal.label}
                    </span>
                    <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--v2-rule)" }}>
                      <span className="block h-full rounded-full" style={{ width: `${Math.round(signal.strength * 100)}%`, backgroundColor: "var(--c-accent)" }} />
                    </span>
                    <span className="v2-mono w-9 flex-none text-right text-[10px]" style={{ color: "var(--v2-ink-soft)" }}>
                      {Math.round(signal.strength * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>
                Evidence · {selected.transactions.length} records
              </p>
              <div className="mt-2 max-h-40 overflow-y-auto rounded border" style={{ borderColor: "var(--v2-rule)" }}>
                {selected.opportunity.enriched.slice(0, 8).map((row) => (
                  <div key={`${row.raw}-${row.date}`} className="flex items-center gap-2 border-b px-2.5 py-1.5 last:border-0" style={{ borderColor: "var(--v2-rule)" }}>
                    <span className="v2-mono w-20 flex-none truncate text-[9px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>{row.src}</span>
                    <span className="v2-mono min-w-0 flex-1 truncate text-[10px]" style={{ color: "var(--v2-ink)" }}>{row.raw}</span>
                    <span className="flex-none text-[10px] font-semibold" style={{ color: "var(--c-accent)" }}>{row.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-md border px-3 py-2.5" style={{ borderColor: selected.policy.allowed ? "#bbe3cd" : "#f0d9a8", backgroundColor: selected.policy.allowed ? "var(--v2-verified-wash)" : "var(--v2-amber-wash)" }}>
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" style={{ color: selected.policy.allowed ? "var(--v2-verified)" : "var(--v2-amber)" }} />
              <p className="text-[12px] font-semibold" style={{ color: selected.policy.allowed ? "var(--v2-verified)" : "var(--v2-amber)" }}>
                {selected.policy.reason}
              </p>
            </div>

            {selected.status === "activated" && selected.receipt ? (
              <div className="rounded-md border px-4 py-3.5" style={{ borderColor: "#bbe3cd", backgroundColor: "var(--v2-verified-wash)" }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--v2-verified)" }}>
                    <Check className="h-4 w-4" /> {selected.receipt.subject}
                  </p>
                  <span className="v2-mono text-[10px]" style={{ color: "var(--v2-verified)" }}>{selected.receipt.id}</span>
                </div>
                {selected.receipt.url && (
                  <a href={selected.receipt.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--v2-verified)" }}>
                    Open in Salesforce <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ) : selected.status !== "dismissed" ? (
              <div className="border-t pt-4" style={{ borderColor: "var(--v2-rule)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <img src={salesforceLogo} alt="Salesforce" className="h-6 w-9 flex-none object-contain" />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold" style={{ color: "var(--v2-ink)" }}>{scenarioMeta[selected.scenario].subject}</p>
                      <p className="truncate text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>{selected.opportunity.destination} · {tenant.name}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-none" style={{ color: "var(--v2-ink-faint)" }} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => void activate(selected.id)}
                    disabled={!selected.policy.allowed || activating === selected.id || !live}
                    className="console-btn"
                    title={!live ? "Connect the live sandbox to write to Salesforce" : undefined}
                  >
                    {activating === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Create Salesforce Task
                  </button>
                  <button onClick={() => dismiss(selected.id)} className="console-btn-ghost">
                    <X className="h-4 w-4" /> Not relevant
                  </button>
                </div>
                {!live && (
                  <p className="v2-mono mt-2 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
                    connect the sandbox session to enable the live write
                  </p>
                )}
                {activateError && <p className="mt-2 text-[12px] font-semibold" style={{ color: "#b3261e" }}>{activateError}</p>}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
