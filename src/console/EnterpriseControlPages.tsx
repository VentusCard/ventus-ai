import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, CircleAlert, FileText, Loader2, Mail, Plug, RefreshCw, Send, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, useConsole } from "@/console/state";
import {
  consoleConnectionsUrl,
  consoleConnectionTransitionUrl,
  consoleBankReviewPackageUrl,
  consoleEvidenceBundleUrl,
  consoleGovernanceUrl,
  consoleGrowthPlayApprovalUrl,
  consoleGrowthPlayDraftsUrl,
  consoleGrowthPlayRegisterUrl,
  consoleGrowthPlaysUrl,
  consoleOnboardingReadinessUrl,
  consoleResultsUrl,
  consoleSalesforceOutcomeSyncUrl,
  consoleSkillShadowsUrl,
} from "@/console/api";

type Contract = Record<string, unknown>;
type Draft = { draftId: string; version: number; contract: Contract; status: string; updatedAt: string };
type Protocol = { decisionProtocolId: string; growthPlayId: string; businessLine: string; version: string; approvalStatus: string | null; registeredAt: string };
type Mapping = {
  mappingId: string;
  connector: string;
  version: number;
  status: string;
  configuration: Record<string, unknown>;
  lastTestStatus?: string | null;
  lastTestedAt?: string | null;
  lastTestReceipt?: { receiptId: string; status: string; detail?: string | null; testedAt?: string | null } | null;
};
type HoldoutProtection = { status: string; assigned: number; reservationReceipts: number; decisionEvents: number; activationEvents: number; workflowRecords: { status: string; count: number } };
type EvidenceSummary = { evidenceClass: string; claimStatus: string; businessClaimAllowed: boolean; causalClaimAllowed: boolean; complete: boolean; missing: string[]; subjectTokensRedacted: boolean | null; manifestDigest: string | null };

async function serverRequest<T>(token: string | undefined, url: string | null, init?: RequestInit): Promise<T> {
  if (!token || !url) throw new Error("The authenticated Console API is unavailable in this environment.");
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `Request failed (${response.status})`);
  return data;
}

function PageState({ error, loading, empty, onRetry }: { error: string | null; loading: boolean; empty: string; onRetry?: () => void }) {
  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--c-accent)" }} /></div>;
  if (error) return <div className="console-cell mx-auto mt-10 max-w-xl p-5 text-[13px]" style={{ color: "#b3261e" }}><CircleAlert className="mb-3 h-5 w-5" /><p>{error}</p>{onRetry && <button onClick={onRetry} className="console-btn-ghost mt-4 !px-3 !py-2 !text-[11px]">Retry</button>}</div>;
  return <div className="console-cell mx-auto mt-10 max-w-xl p-5 text-[13px]" style={{ color: "var(--v2-ink-soft)" }}>{empty}</div>;
}

export function ResultsPage() {
  const { access, session } = useAuth();
  const { moments } = useConsole();
  const [data, setData] = useState<{ experiments: Array<{ experimentId: string; evidenceClass: string; treatmentAssigned: number; holdoutAssigned: number; outcomesObserved: number; lastOutcomeAt: string | null; coverage: number; sampleReady: boolean; intentToTreatLift: number | null; confidence: string; claimStatus: string }>; deliveries: Record<string, number>; outcomeObservations: number; observationReconciliation: Record<string, { count: number; lastSyncedAt: string | null }> } | null>(null);
  const [holdoutProtection, setHoldoutProtection] = useState<Record<string, HoldoutProtection>>({});
  const [evidenceSummary, setEvidenceSummary] = useState<Record<string, EvidenceSummary>>({});
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [fscRecordUrl, setFscRecordUrl] = useState<string | null>(null);
  const load = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const results = await serverRequest<{ experiments: Array<{ experimentId: string; evidenceClass: string; treatmentAssigned: number; holdoutAssigned: number; outcomesObserved: number; lastOutcomeAt: string | null; coverage: number; sampleReady: boolean; intentToTreatLift: number | null; confidence: string; claimStatus: string }>; deliveries: Record<string, number>; outcomeObservations: number; observationReconciliation: Record<string, { count: number; lastSyncedAt: string | null }> }>(session?.access_token, consoleResultsUrl());
      setData(results);
      if (access?.role === "risk_reviewer") {
        const entries = await Promise.all(results.experiments.map(async (experiment) => {
          const fallbackProtection: HoldoutProtection = {
            status: "unavailable",
            assigned: experiment.holdoutAssigned,
            reservationReceipts: 0,
            decisionEvents: 0,
            activationEvents: 0,
            workflowRecords: { status: "not_checked", count: 0 },
          };
          try {
            const bundle = await serverRequest<{
              evidenceClass?: string;
              holdoutProtection?: HoldoutProtection;
              claimEligibility?: { claimStatus?: string; businessClaimAllowed?: boolean; causalClaimAllowed?: boolean };
              manifest?: { completeness?: { complete?: boolean; missing?: string[] }; manifestDigest?: string | null };
              permissionIsolationEvidence?: { subjectTokensRedacted?: boolean };
            }>(session?.access_token, consoleEvidenceBundleUrl(experiment.experimentId));
            return [experiment.experimentId, {
              protection: bundle.holdoutProtection ?? fallbackProtection,
              summary: {
                evidenceClass: bundle.evidenceClass ?? experiment.evidenceClass,
                claimStatus: bundle.claimEligibility?.claimStatus ?? experiment.claimStatus,
                businessClaimAllowed: bundle.claimEligibility?.businessClaimAllowed ?? false,
                causalClaimAllowed: bundle.claimEligibility?.causalClaimAllowed ?? false,
                complete: bundle.manifest?.completeness?.complete ?? false,
                missing: bundle.manifest?.completeness?.missing ?? [],
                subjectTokensRedacted: bundle.permissionIsolationEvidence?.subjectTokensRedacted ?? null,
                manifestDigest: bundle.manifest?.manifestDigest ?? null,
              },
            }] as const;
          } catch {
            return [experiment.experimentId, {
              protection: fallbackProtection,
              summary: {
                evidenceClass: experiment.evidenceClass,
                claimStatus: experiment.claimStatus,
                businessClaimAllowed: false,
                causalClaimAllowed: false,
                complete: false,
                missing: ["evidence_bundle"],
                subjectTokensRedacted: null,
                manifestDigest: null,
              },
            }] as const;
          }
        }));
        setHoldoutProtection(Object.fromEntries(entries.map(([experimentId, value]) => [experimentId, value.protection])));
        setEvidenceSummary(Object.fromEntries(entries.map(([experimentId, value]) => [experimentId, value.summary])));
      } else {
        setHoldoutProtection({});
        setEvidenceSummary({});
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Results are unavailable");
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => { void load(); }, [access?.role, session?.access_token]);
  if (!data) return <PageState loading={!error} error={error} empty="No server-side outcome evidence is available yet." onRetry={() => void load()} />;
  const total = Object.values(data.deliveries).reduce((sum, value) => sum + value, 0);
  const canSyncFscOutcome = access?.role === "risk_reviewer";
  const syncable = canSyncFscOutcome ? moments.filter((moment) => moment.receipt?.records?.decision) : [];
  const syncSalesforceOutcome = async (decisionId: string) => {
    try {
      setSyncing(decisionId);
      const result = await serverRequest<{ outcome: { recordUrl?: string | null; outcome?: { status?: string } }; recorded?: { observation?: { observationId?: string }; measurement?: { status?: string; eventId?: string; reason?: string } } }>(session?.access_token, consoleSalesforceOutcomeSyncUrl(), { method: "POST", body: JSON.stringify({ decisionId }) });
      setFscRecordUrl(result.outcome.recordUrl ?? null);
      const measurement = result.recorded?.measurement;
      setError(measurement?.status === "recorded" ? `Salesforce outcome recorded under the approved measurement contract ${measurement.eventId ?? "event"}. Evaluation remains gated by sample and holdout coverage.` : `Salesforce outcome ${result.outcome.outcome?.status ?? "awaiting outcome"} recorded as ${result.recorded?.observation?.observationId ?? "a durable observation"}. ${measurement?.reason ? measurement.reason.replaceAll("_", " ") : "Lift remains gated by the experiment design."}`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Salesforce outcome sync failed");
    } finally {
      setSyncing(null);
    }
  };
  const exportEvidence = async (experimentId: string) => {
    try {
      setExporting(experimentId);
      const bundle = await serverRequest<Record<string, unknown>>(session?.access_token, consoleEvidenceBundleUrl(experimentId));
      const file = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${experimentId}-evidence-bundle.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Evidence bundle export failed");
    } finally {
      setExporting(null);
    }
  };
  const canExportEvidence = access?.role === "risk_reviewer";
  const evidenceReviews = Object.values(evidenceSummary);
  const reviewClaims = evidenceReviews.length === 0 ? "Awaiting bundle" : evidenceReviews.every((item) => item.businessClaimAllowed && item.causalClaimAllowed) ? "Claims eligible" : "Descriptive only";
  const reviewEvidence = evidenceReviews.length === 0 ? "Awaiting bundle" : [...new Set(evidenceReviews.map((item) => item.evidenceClass))].map((item) => item.replaceAll("_", " ")).join(" · ");
  const reviewControls = Object.values(holdoutProtection).length > 0 && Object.values(holdoutProtection).every((item) => item.status === "verified") ? "Holdout protected" : "Review required";
  const reviewRedaction = evidenceReviews.length > 0 && evidenceReviews.every((item) => item.subjectTokensRedacted === true) ? "Redaction verified" : "Review required";
  const reviewCompleteness = evidenceReviews.length === 0 ? "Awaiting bundle" : evidenceReviews.every((item) => item.complete) ? "Complete" : `${new Set(evidenceReviews.flatMap((item) => item.missing)).size} gates open`;
  const openReviewGates = [...new Set(evidenceReviews.flatMap((item) => item.missing))];
  return <div className="mx-auto max-w-5xl">
    <header className="flex items-end justify-between gap-5 border-b pb-5" style={{ borderColor: "var(--v2-rule)" }}><div><p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>Reviewer workspace</p><h2 className="v2-display mt-2 text-2xl">Results</h2><p className="v2-body mt-2 text-[13px]">Verify the evidence trail before a bank claim is made.</p></div><button onClick={() => void load()} disabled={refreshing} aria-busy={refreshing} className="console-btn-ghost flex items-center gap-1.5 !px-3 !py-2 !text-[11px]">{refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}{refreshing ? "Refreshing" : "Refresh"}</button></header>
    <div className="mt-5 grid gap-px overflow-hidden rounded-md border md:grid-cols-3" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-rule)" }}>{[["Experiments", data.experiments.length], ["Outcome observations", data.outcomeObservations], ["Workflow receipts", total]].map(([label, value]) => <div key={String(label)} className="bg-white p-5"><p className="console-stat text-[40px]">{value}</p><p className="v2-mono mt-1 text-[9px] uppercase tracking-[.12em]" style={{ color: "var(--v2-ink-faint)" }}>{label}</p></div>)}</div>
    {canExportEvidence && <section className="console-cell mt-5 overflow-hidden"><div className="flex flex-wrap items-start justify-between gap-4 border-b p-4" style={{ borderColor: "var(--v2-rule)" }}><div><p className="v2-mono text-[9px] font-bold uppercase tracking-[.12em]" style={{ color: "var(--v2-ink-faint)" }}>Reviewer posture</p><p className="mt-2 text-[12px] font-semibold">{reviewClaims === "Descriptive only" ? "Mechanism reviewable; performance claims remain gated." : reviewClaims}</p></div><Link to="/app/governance" className="console-btn-ghost flex items-center gap-1 !px-3 !py-2 !text-[11px]">Open Governance <ChevronRight className="h-3.5 w-3.5" /></Link></div><div className="grid gap-px bg-[var(--v2-rule)] sm:grid-cols-2 lg:grid-cols-4">{[["Evidence", reviewEvidence], ["Controls", reviewControls], ["Privacy", reviewRedaction], ["Completeness", reviewCompleteness]].map(([label, value]) => <div key={label} className="bg-white px-4 py-3"><p className="v2-mono text-[8px] uppercase tracking-[.1em]" style={{ color: "var(--v2-ink-faint)" }}>{label}</p><p className="mt-1 text-[11px] font-semibold capitalize">{value}</p></div>)}</div>{openReviewGates.length > 0 && <p className="border-t px-4 py-3 text-[10px]" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-soft)" }}>Open gates: {openReviewGates.map((gate) => gate.replaceAll("_", " ")).join(" · ")}</p>}</section>}
    <div className="console-cell mt-5 overflow-hidden">
      <div className="hidden grid-cols-[1.25fr_.65fr_.65fr_.65fr_.9fr] gap-3 border-b bg-[#f7f6f2] px-4 py-2 md:grid" style={{ borderColor: "var(--v2-rule)" }}>{["Experiment", "Treatment", "Holdout", "Coverage", "Evaluation"].map((item) => <p key={item} className="v2-mono text-[8px] font-bold uppercase tracking-[.12em]" style={{ color: "var(--v2-ink-faint)" }}>{item}</p>)}</div>{data.experiments.length ? data.experiments.map((item) => {
      const protection = holdoutProtection[item.experimentId];
      return <div key={item.experimentId} className="border-b px-4 py-3 last:border-0" style={{ borderColor: "var(--v2-rule)" }}>
        <div className="hidden grid-cols-[1.25fr_.65fr_.65fr_.65fr_.9fr] gap-3 md:grid"><div><p className="text-[12px] font-bold">{item.experimentId}</p><p className="text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>{item.evidenceClass} · {item.claimStatus.replaceAll("_", " ")}</p>{canExportEvidence && <button onClick={() => void exportEvidence(item.experimentId)} disabled={exporting === item.experimentId} className="mt-2 flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--c-accent)" }}>{exporting === item.experimentId ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />} Export evidence</button>}</div><p className="text-[12px]">{item.treatmentAssigned}</p><p className="text-[12px]">{item.holdoutAssigned}</p><p className="text-[12px]">{Math.round(item.coverage * 100)}%</p><div><p className="text-[11px] font-semibold">{item.sampleReady ? item.confidence.replaceAll("_", " ") : "sample building"}</p><p className="text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>{item.intentToTreatLift === null ? "ITT not ready" : `ITT ${item.intentToTreatLift.toFixed(2)}`}</p></div></div>
        <div className="grid gap-3 md:hidden"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[12px] font-bold">{item.experimentId}</p><p className="text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>{item.evidenceClass} · {item.claimStatus.replaceAll("_", " ")}</p></div><span className="v2-mono shrink-0 text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>{Math.round(item.coverage * 100)}% covered</span></div><div className="grid grid-cols-2 gap-2"><div className="border p-2" style={{ borderColor: "var(--v2-rule)" }}><p className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Treatment</p><p className="mt-1 text-[13px] font-semibold">{item.treatmentAssigned}</p></div><div className="border p-2" style={{ borderColor: "var(--v2-rule)" }}><p className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Holdout</p><p className="mt-1 text-[13px] font-semibold">{item.holdoutAssigned}</p></div></div><div className="flex flex-wrap items-center justify-between gap-2 text-[10px]"><span className="font-semibold">{item.sampleReady ? item.confidence.replaceAll("_", " ") : "Sample building"}</span><span style={{ color: "var(--v2-ink-faint)" }}>{item.intentToTreatLift === null ? "ITT not ready" : `ITT ${item.intentToTreatLift.toFixed(2)}`}</span></div>{canExportEvidence && <button onClick={() => void exportEvidence(item.experimentId)} disabled={exporting === item.experimentId} className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--c-accent)" }}>{exporting === item.experimentId ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />} Export evidence</button>}</div>
        {protection && <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-[10px]" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-soft)" }}><span className="font-semibold" style={{ color: protection.status === "verified" ? "var(--v2-verified)" : "#b3261e" }}>{protection.status === "verified" ? "Holdout protected" : protection.status === "unavailable" ? "Holdout receipt unavailable" : "Holdout review required"}</span><span>{protection.assigned} reserved</span><span>{protection.decisionEvents} Moments</span><span>{protection.activationEvents} activations</span><span>{protection.workflowRecords.count} workflow records</span></div>}
      </div>;
    }) : <p className="p-5 text-[13px]" style={{ color: "var(--v2-ink-soft)" }}>Assignments will appear once a registered Growth Play begins a controlled run.</p>}</div>
    {syncable.length > 0 && <section className="console-cell mt-5 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[12px] font-bold">FSC outcome return</p><p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>Update the bank-owned outcome on the linked FSC Decision Receipt, then reconcile the returned observation here.</p></div>{syncable.slice(0, 1).map((moment) => { const linkedRecord = moment.receipt?.records?.decision; const recordUrl = fscRecordUrl ?? linkedRecord?.url; return <div key={moment.decisionId} className="flex flex-wrap items-center gap-2">{recordUrl && <a href={recordUrl} target="_blank" rel="noreferrer" className="console-btn-ghost !px-3 !py-2 !text-[11px]">Open FSC decision</a>}<button onClick={() => void syncSalesforceOutcome(moment.decisionId)} disabled={syncing === moment.decisionId} className="console-btn-ghost !px-3 !py-2 !text-[11px]">{syncing === moment.decisionId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Reconcile outcome</button></div>; })}</div></section>}
    {error && <p className="mt-3 text-[11px]" style={{ color: error.startsWith("Salesforce outcome") ? "var(--v2-ink-soft)" : "#b3261e" }}>{error}</p>}
  </div>;
}

export function GovernancePage() {
  const { access, session } = useAuth();
  const canInspectSkills = ["growth_play_owner", "risk_reviewer", "ventus_platform_admin"].includes(access?.role ?? "");
  const [data, setData] = useState<{ protocols: Protocol[]; recentEvents: Array<{ type: string; occurredAt: string; decisionId: string | null }>; connections: Array<{ connector: string; status: string }> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const load = async () => {
    try {
      setError(null);
      setData(await serverRequest(session?.access_token, consoleGovernanceUrl()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Governance is unavailable");
    }
  };
  useEffect(() => { void load(); }, [session?.access_token]);
  const exportReviewPackage = async () => {
    try {
      setExporting(true);
      const reviewPackage = await serverRequest<Record<string, unknown>>(session?.access_token, consoleBankReviewPackageUrl());
      const file = new Blob([JSON.stringify(reviewPackage, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "ventus-bank-review-package.json";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bank-review package export failed");
    } finally {
      setExporting(false);
    }
  };
  if (!data) return <PageState loading={!error} error={error} empty="No governed records are available yet." onRetry={() => void load()} />;
  return <div className="mx-auto max-w-5xl"><header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5" style={{ borderColor: "var(--v2-rule)" }}><div><p className="v2-mono text-[10px] font-semibold uppercase tracking-[.16em]" style={{ color: "var(--v2-ink-faint)" }}>Authoritative record</p><h2 className="v2-display mt-2 text-2xl">Governance</h2><p className="v2-body mt-2 text-[13px]">The approved protocol, connector configuration, and event record behind each decision.</p></div>{access?.role === "risk_reviewer" && <button onClick={() => void exportReviewPackage()} disabled={exporting} className="console-btn-ghost !px-3 !py-2 !text-[11px]">{exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} Export bank-review package</button>}</header><div className="mt-5 grid gap-5 md:grid-cols-[1.25fr_.75fr]"><section className="console-cell overflow-hidden"><p className="v2-mono border-b px-4 py-3 text-[9px] uppercase tracking-[.12em]" style={{ color: "var(--v2-ink-faint)", borderColor: "var(--v2-rule)" }}>Protocols</p>{data.protocols.length ? data.protocols.map((protocol) => <div key={protocol.decisionProtocolId} className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-0" style={{ borderColor: "var(--v2-rule)" }}><div className="min-w-0"><p className="truncate text-[12px] font-bold">{protocol.growthPlayId}</p><p className="text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>{protocol.businessLine} · {protocol.decisionProtocolId.slice(0, 16)}</p></div><span className="v2-mono text-[9px] uppercase" style={{ color: protocol.approvalStatus === "approved" ? "var(--v2-verified)" : "var(--v2-amber)" }}>{protocol.approvalStatus ?? "review"}</span></div>) : <p className="p-4 text-[13px]" style={{ color: "var(--v2-ink-soft)" }}>No registered protocols.</p>}</section><aside className="console-cell p-4"><p className="v2-mono text-[9px] uppercase tracking-[.12em]" style={{ color: "var(--v2-ink-faint)" }}>Recent record</p><div className="mt-3 space-y-3">{data.recentEvents.slice(0, 6).map((event, index) => <div key={`${event.occurredAt}-${index}`} className="flex gap-2"><span className="console-dot mt-1.5" style={{ backgroundColor: "var(--c-accent)" }} /><div><p className="text-[11px] font-semibold capitalize">{event.type}</p><p className="v2-mono text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>{event.decisionId ?? "control record"}</p></div></div>)}</div></aside></div>{canInspectSkills && <SkillShadowPanel accessToken={session?.access_token} canManage={access?.role === "growth_play_owner"} />}</div>;
}

function SkillShadowPanel({ accessToken, canManage }: { accessToken: string | undefined; canManage: boolean }) {
  const [skills, setSkills] = useState<Array<{ skillId: string; version: string; status: string }>>([]);
  const [skillId, setSkillId] = useState("enrichment-routing");
  const [version, setVersion] = useState("0.1.0");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const load = async (announce = false) => {
    try {
      setLoading(true);
      setLoadFailed(false);
      if (announce) setMessage(null);
      const result = await serverRequest<{ skills: Array<{ skillId: string; version: string; status: string }> }>(accessToken, consoleSkillShadowsUrl());
      setSkills(result.skills);
      if (announce) {
        setMessage(result.skills.length ? `Registry refreshed - ${result.skills.length} candidate${result.skills.length === 1 ? "" : "s"} found.` : "Registry refreshed - no shadow candidates registered.");
      } else {
        setMessage(null);
      }
    } catch (cause) {
      setLoadFailed(true);
      setMessage(cause instanceof Error ? cause.message : "Skill registry is unavailable");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, [accessToken]);
  const save = async () => {
    try {
      setBusy(true);
      setMessage(null);
      await serverRequest(accessToken, consoleSkillShadowsUrl(), { method: "POST", body: JSON.stringify({ skillId, version, benchmark: { evaluation: "pending", benchmarkFrozen: false } }) });
      setMessage("Draft registered. Its server-derived status changes only through governed transitions and approvals.");
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not register shadow candidate");
    } finally {
      setBusy(false);
    }
  };
  return <section className="console-cell mt-5 p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[12px] font-bold">Skill shadow registry</p><p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>Candidates observe governed inputs without changing live decisions.</p></div><div className="flex flex-wrap items-end gap-2">{canManage && <><label className="text-[10px] font-semibold">Skill<input value={skillId} onChange={(event) => setSkillId(event.target.value)} className="mt-1 w-36 border bg-white px-2 py-1.5 text-[11px]" style={{ borderColor: "var(--v2-rule)" }} /></label><label className="text-[10px] font-semibold">Version<input value={version} onChange={(event) => setVersion(event.target.value)} className="mt-1 w-20 border bg-white px-2 py-1.5 text-[11px]" style={{ borderColor: "var(--v2-rule)" }} /></label><button disabled={busy} onClick={() => void save()} className="console-btn-ghost !px-3 !py-2 !text-[11px]">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Register draft</button></>}<button disabled={loading || busy} aria-busy={loading} onClick={() => void load(true)} className="console-btn-ghost !px-3 !py-2 !text-[11px]">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} {loading ? "Refreshing..." : loadFailed ? "Retry" : "Refresh"}</button></div></div><div className="mt-4 grid gap-2 md:grid-cols-3">{loading ? <p className="text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>Loading shadow candidates...</p> : skills.length ? skills.map((skill) => <div key={`${skill.skillId}-${skill.version}`} className="border px-3 py-2" style={{ borderColor: "var(--v2-rule)" }}><p className="text-[11px] font-semibold">{skill.skillId}</p><p className="v2-mono mt-1 text-[9px] uppercase" style={{ color: skill.status === "promoted" ? "var(--v2-verified)" : "var(--v2-ink-faint)" }}>{skill.version} · {skill.status}</p></div>) : <p className="text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>No shadow candidates registered.</p>}</div>{message && <p className="mt-3 text-[11px]" style={{ color: loadFailed || message.includes("Could not") || message.includes("unavailable") ? "#b3261e" : "var(--v2-verified)" }} role="status">{message}</p>}</section>;
}

const defaultContract = (): Contract => ({
  contract_version: "1.0", growth_play_id: "deposit-primacy-defense", version: "1.0.0", business_line: "consumer-banking", objective: "Retain primary deposit relationships before recurring income moves elsewhere.",
  source: { receipt_source_systems: ["partner_sandbox", "plaid_custom_user"], schema_versions: ["1.0", "plaid-transactions-1"], record_sources: [{ source_system: "deposit_core", allowed_rails: ["ach", "card", "p2p", "wire"] }] },
  eligibility: { criteria_version: "deposit-primacy-eligibility-v1" },
  policy: { version: "mvp-policy-v1", required_policy_ids: ["consent", "eligibility", "vulnerability"] },
  actions: [{ action_id: "banker_retention_review", owner_role: "relationship_banker", connector: "salesforce-fsc", destination: "fsc_task", destination_environment: "sandbox" }],
  measurement: { metric: "deposit_retained", outcome_event_types: ["deposit_balance_observed"], outcome_source_systems: ["deposit_core_sandbox"], outcome_window_days: 31, holdout_pct: 10, minimum_per_arm: 30, minimum_coverage: 0.9 },
});

export function GrowthPlaysPage() {
  const { access, session } = useAuth();
  const [data, setData] = useState<{ drafts: Draft[]; protocols: Protocol[] } | null>(null);
  const [draft, setDraft] = useState<Contract>(defaultContract());
  const [saved, setSaved] = useState<Draft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canWrite = access?.role === "growth_play_owner";
  const canApprove = access?.role === "risk_reviewer";
  const load = async () => { const result = await serverRequest<{ drafts: Draft[]; protocols: Protocol[] }>(session?.access_token, consoleGrowthPlaysUrl()); setData(result); if (!saved && result.drafts[0]) { setSaved(result.drafts[0]); setDraft(result.drafts[0].contract); } };
  useEffect(() => { void load().catch((cause) => setMessage(cause instanceof Error ? cause.message : "Growth Plays are unavailable")); }, [session?.access_token]);
  const setField = (field: "growth_play_id" | "business_line" | "objective", value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const source = draft.source as { receipt_source_systems: string[]; schema_versions: string[]; record_sources: Array<{ source_system: string; allowed_rails: string[] }> };
  const eligibility = draft.eligibility as { criteria_version: string };
  const policy = draft.policy as { version: string; required_policy_ids: string[] };
  const action = (draft.actions as Array<{ action_id: string; owner_role: string; connector: string; destination: string; destination_environment: string }>)[0];
  const measurement = draft.measurement as { metric: string; outcome_event_types: string[]; outcome_source_systems: string[]; outcome_window_days: number; holdout_pct: number; minimum_per_arm: number; minimum_coverage: number };
  const splitList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
  const updateSource = (patch: Partial<typeof source>) => setDraft((current) => ({ ...current, source: { ...(current.source as typeof source), ...patch } }));
  const updatePolicy = (patch: Partial<typeof policy>) => setDraft((current) => ({ ...current, policy: { ...(current.policy as typeof policy), ...patch } }));
  const updateAction = (patch: Partial<typeof action>) => setDraft((current) => ({ ...current, actions: [{ ...(current.actions as typeof draft.actions)[0] as typeof action, ...patch }] }));
  const updateMeasurement = (patch: Partial<typeof measurement>) => setDraft((current) => ({ ...current, measurement: { ...(current.measurement as typeof measurement), ...patch } }));
  const save = async () => { try { setBusy(true); setMessage(null); const draftId = saved?.draftId ?? `gp_${String(draft.growth_play_id).replace(/[^A-Za-z0-9_-]/g, "_")}`; const result = await serverRequest<{ draft: Draft }>(session?.access_token, consoleGrowthPlayDraftsUrl(), { method: "POST", body: JSON.stringify({ draftId, expectedVersion: saved?.version ?? 0, contract: draft }) }); setSaved(result.draft); setMessage("Draft saved. Register it when the operating definition is ready for review."); await load(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not save draft"); } finally { setBusy(false); } };
  const register = async () => { if (!saved) return; try { setBusy(true); const result = await serverRequest<{ protocol: Protocol }>(session?.access_token, consoleGrowthPlayRegisterUrl(), { method: "POST", body: JSON.stringify({ draftId: saved.draftId }) }); setMessage(`Registered ${result.protocol.decisionProtocolId}. A separate reviewer must approve it.`); await load(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not register Growth Play"); } finally { setBusy(false); } };
  const approve = async (protocol: Protocol) => { try { setBusy(true); await serverRequest(session?.access_token, consoleGrowthPlayApprovalUrl(protocol.decisionProtocolId), { method: "POST", body: JSON.stringify({ businessLine: protocol.businessLine, decision: "approved", changeRecordId: `change_${Date.now().toString(36)}`, reason: "Approved for non-production controlled evaluation." }) }); setMessage("Protocol approved for controlled evaluation."); await load(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not approve protocol"); } finally { setBusy(false); } };
  const steps = [["Outcome", "objective"], ["Moment", "source"], ["Action", "actions"], ["Controls", "policy"], ["Proof", "measurement"], ["Review", "registered"]];
  const inputClass = "growth-play-field mt-1 w-full border bg-white px-3 py-2 text-[13px]";
  const cardClass = "growth-play-section border p-4";
  const cardStyle = { borderColor: "#cbd5e1" };
  return <div className="growth-play-studio mx-auto max-w-5xl"><header className="flex items-end justify-between gap-5 border-b pb-5" style={{ borderColor: "#cbd5e1" }}><div><p className="v2-mono text-[10px] font-semibold uppercase tracking-[.16em]" style={{ color: "var(--c-accent)" }}>Decision design</p><h2 className="v2-display mt-2 text-2xl">Growth Plays</h2><p className="v2-body mt-2 max-w-2xl text-[13px]">One business outcome, expressed as a governed, measurable operating contract.</p></div><SlidersHorizontal className="h-5 w-5" style={{ color: "var(--c-accent)" }} /></header><div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><section className="console-cell p-5"><div className="growth-play-steps grid gap-2 sm:grid-cols-3">{steps.map(([label], index) => <div key={label} className="growth-play-step border-l pl-2" data-complete={index < 5} style={{ borderColor: index < 5 ? "var(--c-accent)" : "#cbd5e1" }}><p className="v2-mono text-[8px] uppercase tracking-[.12em]" style={{ color: "#475569" }}>0{index + 1}</p><p className="text-[11px] font-bold">{label}</p></div>)}</div><div className="mt-6 grid gap-3"><section className={cardClass} style={cardStyle}><p className="text-[12px] font-bold">01 · Outcome</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[11px] font-semibold">Growth Play ID<input value={String(draft.growth_play_id ?? "")} disabled={!canWrite} onChange={(event) => setField("growth_play_id", event.target.value)} className={inputClass} style={cardStyle} /></label><label className="text-[11px] font-semibold">Business line<input value={String(draft.business_line ?? "")} disabled={!canWrite} onChange={(event) => setField("business_line", event.target.value)} className={inputClass} style={cardStyle} /></label></div><label className="mt-3 block text-[11px] font-semibold">Primary outcome<textarea value={String(draft.objective ?? "")} disabled={!canWrite} onChange={(event) => setField("objective", event.target.value)} rows={2} className={`${inputClass} resize-none`} style={cardStyle} /></label></section><section className={cardClass} style={cardStyle}><p className="text-[12px] font-bold">02 · Moment</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[11px] font-semibold">Signal source<input value={source.record_sources[0]?.source_system ?? ""} disabled={!canWrite} onChange={(event) => updateSource({ record_sources: [{ ...source.record_sources[0], source_system: event.target.value }] })} className={inputClass} style={cardStyle} /></label><label className="text-[11px] font-semibold">Allowed rails<input value={(source.record_sources[0]?.allowed_rails ?? []).join(", ")} disabled={!canWrite} onChange={(event) => updateSource({ record_sources: [{ ...source.record_sources[0], allowed_rails: splitList(event.target.value) }] })} className={inputClass} style={cardStyle} /></label></div><label className="mt-3 block text-[11px] font-semibold">Eligibility rule<input value={eligibility.criteria_version} disabled={!canWrite} onChange={(event) => setDraft((current) => ({ ...current, eligibility: { ...(current.eligibility as typeof eligibility), criteria_version: event.target.value } }))} className={inputClass} style={cardStyle} /></label></section><section className={cardClass} style={cardStyle}><p className="text-[12px] font-bold">03 · Action</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Action ID<input value={action.action_id} disabled={!canWrite} onChange={(event) => updateAction({ action_id: event.target.value })} className={inputClass} style={cardStyle} /></label><label className="text-[11px] font-semibold">Owner role<input value={action.owner_role} disabled={!canWrite} onChange={(event) => updateAction({ owner_role: event.target.value })} className={inputClass} style={cardStyle} /></label><label className="text-[11px] font-semibold">System<select value={action.connector} disabled={!canWrite} onChange={(event) => { const connector = event.target.value; updateAction({ connector, destination: connector === "salesforce-fsc" ? "fsc_task" : connector === "microsoft-outlook" ? "outlook_briefing" : "slack_message" }); }} className={inputClass} style={cardStyle}><option value="salesforce-fsc">Salesforce FSC</option><option value="microsoft-outlook">Outlook</option><option value="slack">Slack</option></select></label></div></section><section className={cardClass} style={cardStyle}><p className="text-[12px] font-bold">04 · Controls</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[11px] font-semibold">Policy pack<input value={policy.version} disabled={!canWrite} onChange={(event) => updatePolicy({ version: event.target.value })} className={inputClass} style={cardStyle} /></label><label className="text-[11px] font-semibold">Required controls<input value={policy.required_policy_ids.join(", ")} disabled={!canWrite} onChange={(event) => updatePolicy({ required_policy_ids: splitList(event.target.value) })} className={inputClass} style={cardStyle} /></label></div></section><section className={cardClass} style={cardStyle}><p className="text-[12px] font-bold">05 · Proof</p><div className="mt-3 grid gap-3 sm:grid-cols-4"><label className="text-[11px] font-semibold">Metric<select value={measurement.metric} disabled={!canWrite} onChange={(event) => updateMeasurement({ metric: event.target.value })} className={inputClass} style={cardStyle}>{["deposit_balance", "deposit_retained", "net_new_assets", "estimated_revenue"].map((metric) => <option key={metric} value={metric}>{metric.replaceAll("_", " ")}</option>)}</select></label><label className="text-[11px] font-semibold">Window (days)<input type="number" value={measurement.outcome_window_days} disabled={!canWrite} onChange={(event) => updateMeasurement({ outcome_window_days: Number(event.target.value) })} className={inputClass} style={cardStyle} /></label><label className="text-[11px] font-semibold">Holdout %<input type="number" value={measurement.holdout_pct} disabled={!canWrite} onChange={(event) => updateMeasurement({ holdout_pct: Number(event.target.value) })} className={inputClass} style={cardStyle} /></label><label className="text-[11px] font-semibold">Per arm<input type="number" value={measurement.minimum_per_arm} disabled={!canWrite} onChange={(event) => updateMeasurement({ minimum_per_arm: Number(event.target.value) })} className={inputClass} style={cardStyle} /></label></div></section></div>{canWrite && <div className="mt-5 flex flex-wrap gap-2"><button disabled={busy} onClick={() => void save()} className="console-btn !px-4 !py-2 !text-[12px]">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save draft</button><button disabled={busy || !saved} onClick={() => void register()} className="console-btn-ghost !px-4 !py-2 !text-[12px]">Register for review <ChevronRight className="h-3.5 w-3.5" /></button></div>}{message && <p className="mt-4 text-[11px]" style={{ color: message.includes("Could not") || message.includes("unavailable") ? "#b3261e" : "var(--v2-verified)" }}>{message}</p>}</section><aside className="growth-play-queue console-cell overflow-hidden"><p className="v2-mono border-b px-4 py-3 text-[9px] uppercase tracking-[.12em]" style={{ color: "#334155", borderColor: "#cbd5e1" }}>Review queue</p>{data?.protocols.length ? data.protocols.map((protocol) => <div key={protocol.decisionProtocolId} className="border-b px-4 py-3 last:border-0" style={{ borderColor: "#cbd5e1" }}><p className="text-[12px] font-bold">{protocol.growthPlayId}</p><p className="mt-1 text-[10px]" style={{ color: "#475569" }}>{protocol.approvalStatus ?? "Waiting for independent review"}</p>{canApprove && !protocol.approvalStatus && <button disabled={busy} onClick={() => void approve(protocol)} className="mt-2 flex items-center gap-1 text-[10px] font-bold" style={{ color: "var(--c-accent)" }}><Check className="h-3 w-3" /> Approve pilot protocol</button>}</div>) : <p className="p-4 text-[12px]" style={{ color: "#475569" }}>Register a saved definition to create the review record.</p>}</aside></div></div>;
}

export function ConnectionsPage() {
  const { session } = useAuth();
  const [data, setData] = useState<{ mappings: Mapping[] } | null>(null);
  const [readiness, setReadiness] = useState<{ ready: boolean; gates: Array<{ id: string; ready: boolean; requirement: string }> } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const load = async () => {
    const [connections, onboarding] = await Promise.all([
      serverRequest<{ mappings: Mapping[] }>(session?.access_token, consoleConnectionsUrl()),
      serverRequest<{ ready: boolean; gates: Array<{ id: string; ready: boolean; requirement: string }> }>(session?.access_token, consoleOnboardingReadinessUrl()),
    ]);
    setData(connections);
    setReadiness(onboarding);
  };
  useEffect(() => { void load().catch((cause) => setMessage(cause instanceof Error ? cause.message : "Connections are unavailable")); }, [session?.access_token]);
  const definitions = [{ connector: "salesforce-fsc", name: "Salesforce FSC", configuration: { authorityType: "workflow_observation", decisionObject: "Ventus_Decision__c", decisionReferenceField: "Decision_Reference__c", decisionPackageField: "Decision_Package__c", humanResponseField: "Human_Response__c", outcomeStatusField: "Outcome_Status__c", outcomeEventTypeField: "Outcome_Event_Type__c", outcomeMetricField: "Outcome_Metric__c", outcomeAmountField: "Outcome_Amount__c", outcomeOccurredAtField: "Outcome_Occurred_At__c", outcomeSourceRecordIdField: "Outcome_Source_Record_Id__c", outcomeReasonCodeField: "Outcome_Reason_Code__c" } }, { connector: "microsoft-outlook", name: "Outlook", configuration: { recipient: "growth-operations@example.invalid" } }, { connector: "slack", name: "Slack", configuration: { channelId: "C_CONFIGURE" } }];
  const createDraft = async (definition: typeof definitions[number]) => { try { setBusy(definition.connector); const existing = data?.mappings.find((item) => item.connector === definition.connector); await serverRequest(session?.access_token, consoleConnectionsUrl(), { method: "POST", body: JSON.stringify({ mappingId: existing?.mappingId ?? `map_${definition.connector.replace(/[^A-Za-z0-9]/g, "_")}`, connector: definition.connector, expectedVersion: existing?.version ?? 0, status: "draft", configuration: existing?.configuration ?? definition.configuration }) }); setMessage(`${definition.name} mapping saved as draft. Credentials remain server-side.`); await load(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not save mapping"); } finally { setBusy(null); } };
  const transition = async (mapping: Mapping, action: 'test' | 'approve' | 'activate' | 'revoke') => { try { setBusy(mapping.connector); const result = await serverRequest<{ receipt?: { receiptId?: string; detail?: string }; failed?: boolean }>(session?.access_token, consoleConnectionTransitionUrl(mapping.mappingId, action), { method: "POST", body: JSON.stringify({ expectedVersion: mapping.version }) }); setMessage(action === "test" ? (result.failed ? `Connection check failed${result.receipt?.detail ? ` · ${result.receipt.detail}` : ""}.` : `Authenticated connection check passed${result.receipt?.receiptId ? ` · receipt ${result.receipt.receiptId}` : ""}.`) : `${mapping.connector} is now ${action === "revoke" ? "revoked" : action + "d"}.`); await load(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not update mapping"); } finally { setBusy(null); } };
  const nextAction = (mapping: Mapping | undefined) => !mapping ? "Create draft" : mapping.status === "draft" ? "Test" : mapping.status === "tested" ? "Approve" : mapping.status === "approved" ? "Activate" : "Create draft";
  return <div className="mx-auto max-w-5xl"><header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5" style={{ borderColor: "var(--v2-rule)" }}><div><p className="v2-mono text-[10px] font-semibold uppercase tracking-[.16em]" style={{ color: "var(--v2-ink-faint)" }}>Institution configuration</p><h2 className="v2-display mt-2 text-2xl">Connections</h2><p className="v2-body mt-2 text-[13px]">Map where evidence returns and where employees receive work. Each mapping moves through test, approval, activation, and rotation.</p></div><Link to="/app/onboarding" className="console-btn-ghost !px-3 !py-2 !text-[11px]">Run FSC onboarding proof</Link></header>{readiness && <section className="console-cell mt-5 p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-[12px] font-bold">Institution readiness</p><p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>A controlled rollout starts only when every gate below is evidenced.</p></div><span className="v2-mono text-[9px] uppercase tracking-[.1em]" style={{ color: readiness.ready ? "var(--v2-verified)" : "var(--v2-amber)" }}>{readiness.ready ? "ready" : "in setup"}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{readiness.gates.map((gate) => <div key={gate.id} className="flex items-center gap-2 border px-3 py-2" style={{ borderColor: "var(--v2-rule)" }}><span className="console-dot" style={{ backgroundColor: gate.ready ? "var(--v2-verified)" : "var(--v2-amber)" }} /><p className="text-[10px]">{gate.requirement}</p></div>)}</div></section>}<div className="mt-5 grid gap-4 md:grid-cols-3">{definitions.map((definition) => { const mapping = data?.mappings.find((item) => item.connector === definition.connector); const action = nextAction(mapping); return <section key={definition.connector} className="console-cell flex min-h-52 flex-col p-5"><Plug className="h-4 w-4" style={{ color: "var(--c-accent)" }} /><h3 className="mt-4 text-[15px] font-bold">{definition.name}</h3><p className="mt-2 text-[11px] leading-4" style={{ color: "var(--v2-ink-soft)" }}>{definition.connector === "salesforce-fsc" ? "Decision receipt and outcome-return mapping." : definition.connector === "microsoft-outlook" ? "Executive and operator briefings." : "Team routing and follow-through."}</p><div className="mt-auto pt-4"><p className="v2-mono text-[9px] uppercase tracking-[.1em]" style={{ color: mapping?.status === "active" ? "var(--v2-verified)" : "var(--v2-ink-faint)" }}>{mapping?.status ?? "not mapped"}{mapping?.lastTestStatus ? ` · ${mapping.lastTestStatus}` : ""}</p>{mapping?.lastTestReceipt && <p className="mt-2 text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>Verified receipt {mapping.lastTestReceipt.receiptId}{mapping.lastTestReceipt.testedAt ? ` · ${new Date(mapping.lastTestReceipt.testedAt).toLocaleDateString()}` : ""}</p>}{!mapping || mapping.status === "disabled" ? <button disabled={busy === definition.connector} onClick={() => void createDraft(definition)} className="mt-3 console-btn-ghost !px-3 !py-2 !text-[11px]">{busy === definition.connector ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}{action}</button> : mapping.status === "active" ? <div className="mt-3 flex flex-wrap gap-2"><button disabled={busy === definition.connector} onClick={() => void createDraft(definition)} className="console-btn-ghost !px-3 !py-2 !text-[11px]">Rotate</button><button disabled={busy === definition.connector} onClick={() => void transition(mapping, "revoke")} className="console-btn-ghost !px-3 !py-2 !text-[11px]">Revoke</button></div> : <div className="mt-3 flex gap-2"><button disabled={busy === definition.connector} onClick={() => void transition(mapping, mapping.status === "draft" ? "test" : mapping.status === "tested" ? "approve" : "activate")} className="console-btn-ghost !px-3 !py-2 !text-[11px]">{busy === definition.connector ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}{action}</button></div>}</div></section>; })}</div>{message && <p className="mt-4 text-[12px]" style={{ color: message.includes("Could not") || message.includes("unavailable") ? "#b3261e" : "var(--v2-ink-soft)" }}>{message}</p>}</div>;
}
