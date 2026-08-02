import { useEffect, useMemo, useState } from "react";
import { Check, Landmark, Loader2, Plug, Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { MomentCard } from "@/console/MomentCard";
import { decisionPackageForMoment, useConsole } from "@/console/state";
import { useAuth } from "@/console/state";

export default function MomentsPage() {
  const [searchParams] = useSearchParams();
  const { access } = useAuth();
  const {
    tenant,
    connectorSession,
    connecting,
    connectError,
    connect,
    ingesting,
    ingestError,
    ingest,
    moments,
    activating,
    activateError,
    activate,
    retryDelivery,
    defer,
    decline,
    scenarioMeta,
    syncingOutcome,
    outcomeSyncMessage,
    syncOutcome,
  } = useConsole();
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("moment"));
  const [selectedActionId, setSelectedActionId] = useState("");
  const [mode, setMode] = useState<"none" | "modify" | "defer" | "decline">("none");
  const [reason, setReason] = useState("");
  const visibleMoments = moments.filter((moment) => moment.scenario === "deposit-retention");
  const selected = useMemo(() => visibleMoments.find((moment) => moment.id === selectedId) ?? visibleMoments[0], [selectedId, visibleMoments]);
  const decision = useMemo(
    () => selected ? selected.decisionPackage ?? decisionPackageForMoment(selected, tenant) : null,
    [selected, tenant],
  );
  const actions = selected ? scenarioMeta[selected.scenario].actions : [];
  const action = actions.find((candidate) => candidate.id === selectedActionId) ?? actions[0];
  const canRespond = access?.role === "bank_operator";
  const canStartSandbox = access?.role === "bank_operator";
  const livePlaidReady = Boolean(connectorSession?.connectors.plaid);
  const hasActionableMoment = visibleMoments.some((moment) => ["queued", "approved", "delivery_failed"].includes(moment.status));
  const loadMoment = () => {
    if (livePlaidReady) {
      void ingest("deposit-retention");
      return;
    }
    void connect();
  };
  const sandboxButtonLabel = connecting
    ? "Connecting"
    : ingesting
      ? "Loading moment"
      : livePlaidReady
        ? "Load next sandbox moment"
        : "Start sandbox session";

  useEffect(() => {
    if (!selected || !decision) return;
    setSelectedActionId(decision.recommendation.selectedAction.id);
    setMode("none");
    setReason("");
  }, [decision, selected]);

  if (!visibleMoments.length) {
    if (!canStartSandbox) {
      return (
        <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center text-center">
          <Landmark className="h-9 w-9" style={{ color: "var(--v2-ink-faint)" }} />
          <h2 className="v2-display mt-5 text-2xl">No moments assigned.</h2>
          <p className="v2-body mt-3 text-[13px]">
            This role can review governed evidence without starting customer-level sandbox work.
          </p>
        </div>
      );
    }

    return (
      <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center text-center">
        <Landmark className="h-9 w-9" style={{ color: "var(--v2-ink-faint)" }} />
        <h2 className="v2-display mt-5 text-2xl">No Consumer Deposit Primacy moments.</h2>
        <p className="v2-body mt-3 text-[13px]">
          Start a scoped sandbox session to pull the approved Plaid sample and create one governed review.
        </p>
        <button onClick={loadMoment} disabled={connecting || ingesting} className="console-btn mt-6 !px-4 !py-2.5 !text-[12px]">
          {connecting || ingesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
          {sandboxButtonLabel}
        </button>
        {livePlaidReady ? (
          <p className="v2-mono mt-3 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-verified)" }}>
            Plaid sandbox connected · read only
          </p>
        ) : (
          <p className="v2-mono mt-3 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
            Credentials stay server-side · session is tenant and operator scoped
          </p>
        )}
        {connectError || ingestError ? (
          <p className="mt-3 text-[12px] font-semibold" style={{ color: "#b3261e" }}>
            {connectError ?? ingestError}
          </p>
        ) : null}
      </div>
    );
  }

  const confirm = () => {
    if (!selected) return;
    if (mode === "defer") defer(selected.id, reason || "Review later");
    if (mode === "decline") decline(selected.id, reason || "Not relevant");
    setMode("none");
    setReason("");
  };

  return <div className="mx-auto grid max-w-6xl gap-8 xl:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
    <section aria-label="Qualified Consumer Deposit Primacy moments"><div className="flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--v2-rule)" }}><div><p className="v2-display text-[17px]">Assigned moments</p><p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>Consumer Banking · governed queue</p></div>{canStartSandbox && !hasActionableMoment ? <button onClick={loadMoment} disabled={connecting || ingesting} className="console-btn !px-3 !py-2 !text-[10px]"><Plug className="h-3.5 w-3.5" />{sandboxButtonLabel}</button> : null}</div><div className="border-t" style={{ borderColor: "var(--v2-rule)" }}>{visibleMoments.map((moment) => <button key={moment.id} onClick={() => setSelectedId(moment.id)} className="relative block w-full border-b py-4 pl-4 pr-2 text-left" style={{ borderColor: "var(--v2-rule)", backgroundColor: selected?.id === moment.id ? "var(--c-accent-wash)" : "transparent" }}><div className="flex items-baseline justify-between gap-3"><p className="truncate text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>{moment.opportunity.type}</p><span className="console-stat text-[22px]" style={{ color: "var(--c-accent)" }}>{moment.opportunity.confidence}%</span></div><p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>{moment.status === "queued" ? "Needs review" : moment.status} · {moment.sourceMode === "fixture" ? "fixture" : "partner sandbox"}</p></button>)}</div></section>
    {selected && decision && action ? <MomentCard moment={selected} decision={decision} action={action} onSyncOutcome={access?.role === "risk_reviewer" ? () => void syncOutcome(selected.id) : undefined} syncingOutcome={syncingOutcome === selected.id} outcomeSyncMessage={outcomeSyncMessage} onRetryDelivery={canRespond && selected.status === "delivery_failed" ? () => void retryDelivery(selected.id) : undefined} retrying={activating === selected.id}>{canRespond && ["queued", "approved"].includes(selected.status) ? <div>
      {selected.status === "queued" && mode === "modify" ? <div className="mb-4 space-y-2">{actions.map((candidate) => <label key={candidate.id} className="flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5" style={{ borderColor: selectedActionId === candidate.id ? "var(--c-accent)" : "var(--v2-rule)" }}><input type="radio" checked={selectedActionId === candidate.id} onChange={() => setSelectedActionId(candidate.id)} /><span><span className="block text-[12px] font-bold">{candidate.title}</span><span className="block text-[10px]" style={{ color: "var(--v2-ink-soft)" }}>{candidate.ownerRole} · {candidate.destination}</span></span></label>)}</div> : null}
      {(mode === "defer" || mode === "decline") ? <div className="mb-4"><label className="v2-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "var(--v2-ink-faint)" }}>{mode === "defer" ? "Deferral reason" : "Decline reason"}</label><div className="mt-2 flex gap-2"><input value={reason} onChange={(event) => setReason(event.target.value)} className="console-field !py-2.5 !text-[13px]" placeholder="Optional note" /><button onClick={confirm} className="console-btn !px-4 !py-2.5"><Check className="h-4 w-4" /></button></div></div> : null}
      <button onClick={() => void activate(selected.id, selectedActionId)} disabled={!selected.policy.allowed || activating === selected.id} className="console-btn w-full !py-4 !text-[15px]"><Send className="h-4 w-4" />{selected.status === "approved" ? "Deliver approved action" : selectedActionId === actions[0]?.id ? "Accept and deliver" : "Deliver approved alternative"}</button>
      {selected.status === "queued" ? <div className="mt-3 flex gap-4"><button onClick={() => setMode(mode === "modify" ? "none" : "modify")} className="text-[12px] font-semibold" style={{ color: "var(--c-accent)" }}>Choose alternative</button><button onClick={() => setMode("defer")} className="text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>Defer</button><button onClick={() => setMode("decline")} className="text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>Decline</button></div> : null}
      {activateError ? <p className="mt-3 text-[12px] font-semibold" style={{ color: "#b3261e" }}>{activateError}</p> : null}
    </div> : <p className="text-[12px]" style={{ color: "var(--v2-ink-soft)" }}>This role may review the bounded decision package but cannot respond to the customer action.</p>}</MomentCard> : null}
  </div>;
}
