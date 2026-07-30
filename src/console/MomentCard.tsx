import type { ReactNode } from "react";
import { ArrowUpRight, Check, ChevronDown, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import type { ConsoleMoment } from "@/console/state";
import type { DecisionAction, DecisionPackage } from "@/lib/decisionPackage";

export type MomentCardVariant = "full" | "compact" | "notification";

type MomentCardProps = {
  moment: ConsoleMoment;
  decision: DecisionPackage;
  action: DecisionAction;
  variant?: MomentCardVariant;
  onSyncOutcome?: () => void;
  syncingOutcome?: boolean;
  outcomeSyncMessage?: string | null;
  children?: ReactNode;
};

function confidenceBand(confidence: number): "low" | "medium" | "high" {
  if (confidence >= 80) return "high";
  if (confidence >= 60) return "medium";
  return "low";
}

export function MomentCard({ moment, decision, action, variant = "full", onSyncOutcome, syncingOutcome, outcomeSyncMessage, children }: MomentCardProps) {
  const band = confidenceBand(decision.moment.confidence);
  const delivered = moment.status === "activated" && moment.receipt;
  const reserved = moment.status === "delivery_reserved" && moment.receipt;
  const deliveryFailed = moment.status === "delivery_failed" && moment.receipt;

  if (variant !== "full") {
    return (
      <div className="rounded-md border bg-white p-3" style={{ borderColor: "var(--v2-rule)" }}>
        <p className="text-[13px] font-bold" style={{ color: "var(--v2-ink)" }}>{decision.moment.type}</p>
        <p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>{decision.moment.summary}</p>
        <p className="v2-mono mt-2 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>{action.title} · {band} confidence</p>
      </div>
    );
  }

  return (
    <article className="console-cell overflow-hidden" aria-label={`Moment: ${decision.moment.type}`}>
      <div className="flex items-start justify-between gap-6 border-b p-5" style={{ borderColor: "var(--v2-rule)" }}>
        <div className="min-w-0">
          <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
            {decision.growthPlay.name} · {decision.growthPlay.businessLine}
          </p>
          <h2 className="v2-display mt-2 text-[28px] md:text-[34px]">{decision.moment.type}</h2>
          <p className="v2-body mt-2 max-w-2xl text-[14px]">{decision.moment.summary}</p>
          <p className="v2-mono mt-3 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
            {decision.evidenceClass} evidence · decision {decision.decisionId}
          </p>
        </div>
        <div className="flex-none text-right">
          <p className="console-stat text-[46px]" style={{ color: "var(--c-accent)" }}>{decision.moment.confidence}<span className="text-[18px]" style={{ color: "var(--v2-ink-faint)" }}>%</span></p>
          <p className="v2-mono -mt-1 text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>{band} confidence</p>
        </div>
      </div>

      <div className="grid gap-6 border-b p-5 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]" style={{ borderColor: "var(--v2-rule)" }}>
        <div>
          <p className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>Bounded evidence</p>
          <div className="mt-3 space-y-3">
            {decision.moment.evidence.slice(0, 3).map((item) => <div key={item.id} className="flex items-center justify-between gap-3"><p className="text-[13px] font-semibold" style={{ color: "var(--v2-ink)" }}>{item.label}</p><span className="v2-mono text-[10px]" style={{ color: "var(--v2-ink-soft)" }}>{item.confidence}%</span></div>)}
          </div>
        </div>
        <div className="border-t pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0" style={{ borderColor: "var(--v2-rule)" }}>
          <div className="flex items-center justify-between gap-3"><p className="v2-mono text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>Recommended action</p><span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: decision.governance.policyStatus === "cleared" ? "var(--v2-verified)" : "var(--v2-amber)" }}><ShieldCheck className="h-3 w-3" />{decision.governance.policyStatus}</span></div>
          <p className="mt-3 text-[17px] font-bold" style={{ color: "var(--v2-ink)" }}>{action.title}</p>
          <p className="mt-1.5 text-[13px] leading-5" style={{ color: "var(--v2-ink-soft)" }}>{action.instructions}</p>
          <p className="v2-mono mt-3 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>{action.ownerRole} · {action.destination}</p>
        </div>
      </div>

      <details className="group border-b px-5 py-3" style={{ borderColor: "var(--v2-rule)" }}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>Decision details and receipts <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
        <div className="mt-4 grid gap-3 text-[11px] leading-5" style={{ color: "var(--v2-ink-soft)" }}>
          <p><strong style={{ color: "var(--v2-ink)" }}>Policy:</strong> {decision.governance.controls.join(" · ")}</p>
          <p><strong style={{ color: "var(--v2-ink)" }}>Method:</strong> {decision.decisionMethod.active}</p>
          <p><strong style={{ color: "var(--v2-ink)" }}>Outcome:</strong> {decision.outcome.metric.split("_").join(" ")} · {decision.outcome.status}</p>
          <p className="v2-mono text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>No raw transactions or unrestricted customer profile data are included in this decision package.</p>
        </div>
      </details>

      {delivered ? (
        <div className="p-5">
          <p className="flex items-center gap-2 text-[16px] font-bold" style={{ color: "var(--v2-verified)" }}><Check className="h-5 w-5" />Delivered to the employee workflow</p>
          <p className="mt-1 text-[12px]" style={{ color: "var(--v2-ink-soft)" }}>Decision, response, delivery, and outcome receipts remain linked by {decision.decisionId}.</p>
          <div className="mt-4 grid gap-px overflow-hidden rounded-md border sm:grid-cols-3" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-rule)" }}>
            {[["Decision receipt", moment.receipt?.records?.decision], ["Qualified referral", moment.receipt?.records?.referral], ["Employee task", moment.receipt?.records?.task]].map(([label, record]) => <div key={label} className="bg-white p-3"><p className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>{label}</p>{record && typeof record === "object" && "url" in record ? <a href={record.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: "var(--c-accent)" }}>Open record <ArrowUpRight className="h-3.5 w-3.5" /></a> : <p className="mt-2 text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>Receipt pending reconciliation</p>}</div>)}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--v2-rule)" }}>
            <p className="text-[12px]" style={{ color: "var(--v2-ink-soft)" }}>{decision.outcome.observation ? "Outcome observation received; measurement gates remain authoritative." : "Waiting for the registered outcome receipt."}</p>
            {onSyncOutcome ? <button onClick={onSyncOutcome} disabled={syncingOutcome || !moment.receipt?.records?.decision} className="inline-flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--c-accent)" }} title={!moment.receipt?.records?.decision ? "A Decision Receipt is required" : undefined}>{syncingOutcome ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Check Salesforce</button> : null}
          </div>
          {outcomeSyncMessage ? <p className="mt-2 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>{outcomeSyncMessage}</p> : null}
        </div>
      ) : reserved ? (
        <div className="flex items-center gap-2 p-5 text-[12px]" style={{ color: "var(--v2-ink-soft)" }}>
          <Clock3 className="h-4 w-4" />
          Delivery is reserved with an idempotent receipt. The approved connector service will reconcile the destination result.
        </div>
      ) : deliveryFailed ? (
        <div className="p-5 text-[12px]" style={{ color: "var(--v2-ink-soft)" }}>
          <p className="font-bold" style={{ color: "var(--v2-ink)" }}>Delivery needs connection setup</p>
          <p className="mt-1">The approved action was preserved, but no employee workflow record was created. An institution administrator can complete the server-side connector setup before the action is retried.</p>
        </div>
      ) : children ? <div className="p-5">{children}</div> : <div className="flex items-center gap-2 p-5 text-[12px]" style={{ color: "var(--v2-ink-soft)" }}><Clock3 className="h-4 w-4" />Awaiting the authorized employee response.</div>}
    </article>
  );
}
