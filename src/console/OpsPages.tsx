// Ledger, Outcomes, and Settings — the governance surfaces of the console.
// Durable decisions, responses, and delivery reservations are server-owned.
// This page keeps only a current-session activity trace until the full
// Governance projection is bound to its durable API.

import { useMemo, useState } from "react";
import { Check, Layers, Loader2, Plug, ShieldCheck, Target, X } from "lucide-react";
import { useAuth, useConsole } from "@/console/state";
import { ledgerRollup } from "@/lib/ledger";
import { TENANTS, setTenantOverride, tenantOverride } from "@/lib/tenant";

const KIND_COLOR: Record<string, string> = {
  signal: "#7fa4f2",
  gate: "#c9a24b",
  decision: "#9b8cf0",
  activation: "#34D399",
  outcome: "#34D399",
  counterfactual: "#c9a24b",
};

export function LedgerPage() {
  const { ledger, chainVerified } = useConsole();
  const rollup = useMemo(() => ledgerRollup(ledger), [ledger]);

  if (ledger.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center text-center">
        <Layers className="h-9 w-9" style={{ color: "var(--v2-ink-faint)" }} />
        <h2 className="v2-display mt-5 text-2xl">No records yet.</h2>
        <p className="v2-body mt-3 text-[14px]">
          Every signal, policy check, decision, and activation writes here as it
          happens. Run an ingestion to open the chain.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border sm:grid-cols-4" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-rule)" }}>
        {[
          ["Records", String(rollup.total)],
          ["Decisions", String(rollup.decisions)],
          ["Activations", String(rollup.activations)],
          ["Measuring", String(rollup.measuring)],
        ].map(([label, value]) => (
          <div key={label} className="bg-white px-4 py-4">
            <p className="console-stat text-[40px]" style={{ color: "var(--v2-ink)" }}>{value}</p>
            <p className="v2-mono mt-1 text-[9px] uppercase tracking-[0.12em]" style={{ color: "var(--v2-ink-faint)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="console-cell mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--v2-rule)" }}>
          <span className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
            Activity trace · current session
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: chainVerified ? "var(--v2-verified)" : "#b3261e" }}>
            {chainVerified ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {chainVerified ? "Chain verified" : "Chain broken"}
          </span>
        </div>
        <div>
          {ledger.map((event) => (
            <div key={event.id} className="flex items-center gap-3 border-b px-4 py-2.5 last:border-0" style={{ borderColor: "var(--v2-rule)" }}>
              <span className="v2-mono w-10 flex-none text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                #{String(event.seq).padStart(3, "0")}
              </span>
              <span className="v2-mono w-24 flex-none text-[9px] font-bold uppercase tracking-wider" style={{ color: KIND_COLOR[event.kind] ?? "var(--v2-ink-faint)" }}>
                {event.kind}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold" style={{ color: "var(--v2-ink)" }}>{event.title}</span>
                <span className="block truncate text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>{event.detail}</span>
              </span>
              <span
                className="v2-mono flex-none rounded px-1.5 py-0.5 text-[8px] font-bold uppercase"
                style={{
                  color: event.status === "confirmed" ? "var(--v2-verified)" : event.status === "pending" ? "var(--v2-ink-soft)" : "var(--v2-amber)",
                  backgroundColor: event.status === "confirmed" ? "var(--v2-verified-wash)" : event.status === "pending" ? "#f1f0ec" : "var(--v2-amber-wash)",
                }}
              >
                {event.status}
              </span>
              <span className="v2-mono hidden flex-none text-[10px] sm:block" style={{ color: "var(--v2-rule)" }}>
                {event.hash.slice(0, 6)}
              </span>
            </div>
          ))}
        </div>
        <p className="v2-mono border-t px-4 py-2.5 text-[9px]" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-faint)" }}>
          Local activity view only · durable decision, response, and delivery receipts are retained server-side
        </p>
      </div>
    </div>
  );
}

export function OutcomesPage() {
  const { moments } = useConsole();
  const activated = moments.filter((moment) => moment.status === "activated").length;
  const liveSources = moments.filter((moment) => moment.sourceMode === "live").length;
  const decisionReceipts = moments.filter((moment) => moment.receipt?.records?.decision).length;
  const stages = [
    {
      label: "Evidence received",
      detail: liveSources ? `${liveSources} live sandbox moment${liveSources === 1 ? "" : "s"}` : "Awaiting a sanctioned source",
      complete: liveSources > 0,
    },
    {
      label: "Decision recorded",
      detail: activated ? `${activated} governed response${activated === 1 ? "" : "s"}` : "No approved action yet",
      complete: activated > 0,
    },
    {
      label: "Workflow delivered",
      detail: activated ? `${activated} activation receipt${activated === 1 ? "" : "s"}` : "No downstream delivery yet",
      complete: activated > 0,
    },
    {
      label: "Incremental lift",
      detail: "Pending bank outcome feed and holdout coverage",
      complete: false,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="console-cell p-6">
        <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
          Evidence ladder
        </p>
        <h2 className="v2-display mt-2 text-2xl">Value is measured, not inferred.</h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-md border sm:grid-cols-4" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-rule)" }}>
          {stages.map((stage, index) => (
            <div key={stage.label} className="bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="v2-mono text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>0{index + 1}</p>
                <span className="console-dot" style={{ backgroundColor: stage.complete ? "#34D399" : "#c8c5bc" }} />
              </div>
              <p className="mt-3 text-[13px] font-bold" style={{ color: "var(--v2-ink)" }}>{stage.label}</p>
              <p className="mt-1 text-[10px] leading-4" style={{ color: "var(--v2-ink-soft)" }}>{stage.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="console-cell p-6">
          <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
            Current evidence
          </p>
          <p className="console-stat mt-3 text-[56px]" style={{ color: "var(--v2-ink)" }}>{activated}</p>
          <p className="mt-1 text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>
            activation{activated === 1 ? "" : "s"} in the outcome window
          </p>
          <p className="v2-mono mt-4 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
            {decisionReceipts} FSC decision mirror{decisionReceipts === 1 ? "" : "s"} · sandbox evidence
          </p>
        </div>
        <div className="console-cell p-6">
          <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
            Claim status
          </p>
          <p className="mt-4 text-[20px] font-bold" style={{ color: "var(--v2-ink)" }}>Not yet measured</p>
          <p className="mt-2 text-[12px] leading-5" style={{ color: "var(--v2-ink-soft)" }}>
            The institution must return the registered outcome for treatment and
            holdout cohorts before Ventus reports incremental lift.
          </p>
          <p className="v2-mono mt-4 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-amber)" }}>
            business claim blocked until coverage gates pass
          </p>
        </div>
      </div>
    </div>
  );
}

export function PlaysPage() {
  const plays = [
    {
      line: "Consumer banking",
      name: "Deposit Primacy Defense",
      objective: "Protect primary deposit relationships",
      decision: "Payroll anchored + off-bank migration",
      action: "Banker retention review",
      metric: "Deposit retained",
      status: "Active",
    },
    {
      line: "Wealth management",
      name: "Qualified Wealth Growth",
      objective: "Grow qualified advised relationships",
      decision: "Liquidity event + uninvested balance",
      action: "Advisor consolidation review",
      metric: "Net new assets",
      status: "Active",
    },
    {
      line: "Business banking",
      name: "Cash Flow Resilience",
      objective: "Deepen operating relationships",
      decision: "Revenue concentration + liquidity gap",
      action: "Treasury review",
      metric: "Relationship revenue",
      status: "Template",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-end justify-between gap-5 border-b pb-5" style={{ borderColor: "var(--v2-rule)" }}>
        <div>
          <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>Operating portfolio</p>
          <h2 className="v2-display mt-2 text-2xl">Growth Plays</h2>
          <p className="v2-body mt-2 max-w-xl text-[13px]">
            Each play binds a business objective to evidence, an approved action,
            a destination, and one measurable outcome.
          </p>
        </div>
        <Target className="h-6 w-6 flex-none" style={{ color: "var(--c-accent)" }} />
      </div>
      <div className="mt-5 overflow-hidden rounded-md border" style={{ borderColor: "var(--v2-rule)" }}>
        <div className="hidden grid-cols-[1.05fr_1.4fr_1.25fr_0.9fr_0.55fr] gap-4 border-b bg-[#f7f6f2] px-4 py-2 md:grid" style={{ borderColor: "var(--v2-rule)" }}>
          {["Play", "Qualified moment", "Approved action", "Metric", "Status"].map((label) => (
            <p key={label} className="v2-mono text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--v2-ink-faint)" }}>{label}</p>
          ))}
        </div>
        {plays.map((play) => (
          <div key={play.name} className="grid gap-3 border-b bg-white px-4 py-4 last:border-0 md:grid-cols-[1.05fr_1.4fr_1.25fr_0.9fr_0.55fr] md:gap-4" style={{ borderColor: "var(--v2-rule)" }}>
            <div>
              <p className="text-[13px] font-bold" style={{ color: "var(--v2-ink)" }}>{play.name}</p>
              <p className="mt-0.5 text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>{play.line} · {play.objective}</p>
            </div>
            <p className="text-[11px] leading-4" style={{ color: "var(--v2-ink-soft)" }}>{play.decision}</p>
            <p className="text-[11px] leading-4" style={{ color: "var(--v2-ink-soft)" }}>{play.action}</p>
            <p className="text-[11px] font-semibold" style={{ color: "var(--v2-ink)" }}>{play.metric}</p>
            <span className="v2-mono text-[9px] font-bold uppercase" style={{ color: play.status === "Active" ? "var(--v2-verified)" : "var(--v2-ink-faint)" }}>{play.status}</span>
          </div>
        ))}
      </div>
      <p className="v2-mono mt-3 text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>
        One contract · configurable evidence, policy, workflow, and outcome adapters
      </p>
    </div>
  );
}

export function SettingsPage() {
  const { tenant, connectorSession, connecting, connect, disconnect } = useConsole();
  const { user } = useAuth();
  const [override, setOverride] = useState<string | null>(tenantOverride());
  const live = connectorSession && connectorSession.expiresAt * 1000 > Date.now();
  const canPreviewTenants = user?.email?.toLowerCase().endsWith("@ventusai.com") ?? false;

  const applyOverride = (id: string | null) => {
    setTenantOverride(id);
    setOverride(id);
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="console-cell p-6">
        <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
          Connectors
        </p>
        <div className="mt-4 space-y-3">
          {[
            {
              name: "Plaid",
              detail: "Transaction ingestion · sandbox · read-only",
              ok: Boolean(live && connectorSession?.connectors.plaid),
              note: live ? (connectorSession?.connectors.plaid ? "Connected" : "Server credentials missing") : "Session not started",
            },
            {
              name: "Salesforce",
              detail: "Task activation · sandbox org · write via receipt",
              ok: Boolean(live && connectorSession?.connectors.salesforce),
              note: live ? (connectorSession?.connectors.salesforce ? "Connected" : "Server credentials missing") : "Session not started",
            },
          ].map((connector) => (
            <div key={connector.name} className="flex items-center justify-between gap-3 rounded-md border px-4 py-3.5" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="min-w-0">
                <p className="text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>{connector.name}</p>
                <p className="text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>{connector.detail}</p>
              </div>
              <span className="flex flex-none items-center gap-2">
                <span className="console-dot" style={{ backgroundColor: connector.ok ? "#34D399" : "#c8c5bc" }} />
                <span className="v2-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: connector.ok ? "var(--v2-verified)" : "var(--v2-ink-faint)" }}>
                  {connector.note}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          {live ? (
            <button onClick={disconnect} className="console-btn-ghost !px-4 !py-2 !text-[12px]">
              End session
            </button>
          ) : (
            <button onClick={() => void connect()} disabled={connecting} className="console-btn !px-4 !py-2 !text-[12px]">
              {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />} Start sandbox session
            </button>
          )}
          {live && (
            <span className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
              expires {new Date(connectorSession!.expiresAt * 1000).toLocaleTimeString()}
            </span>
          )}
        </div>
        <p className="v2-mono mt-4 text-[9px] leading-4" style={{ color: "var(--v2-ink-faint)" }}>
          Credentials never enter the browser. Sessions are short-lived, scoped to
          plaid_read + salesforce_write, and bound to the verified operator and tenant.
        </p>
      </div>

      <div className="console-cell p-6">
        <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
          Workspace
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>{tenant.name}</p>
            <p className="text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
              Resolved from {override ? "a walkthrough override" : `your email domain (${user?.email?.split("@")[1] ?? "—"})`}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5" style={{ borderColor: "var(--v2-rule)" }}>
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: tenant.accent }} />
            <span className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-soft)" }}>white-label ready</span>
          </span>
        </div>
        {canPreviewTenants && (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {Object.values(TENANTS).map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => applyOverride(candidate.id === tenant.id && override ? null : candidate.id)}
                  className="console-btn-ghost !px-3 !py-1.5 !text-[11px]"
                  style={candidate.id === tenant.id ? { borderColor: tenant.accent, color: tenant.accent } : undefined}
                >
                  Preview {candidate.shortName} brand
                </button>
              ))}
              {override && (
                <button onClick={() => applyOverride(null)} className="v2-mono text-[10px] underline" style={{ color: "var(--v2-ink-faint)" }}>
                  clear preview
                </button>
              )}
            </div>
            <p className="v2-mono mt-3 text-[9px] leading-4" style={{ color: "var(--v2-ink-faint)" }}>
              Brand preview changes presentation only. Connector access remains bound to the signed-in tenant.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
