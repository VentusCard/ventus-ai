import { useState } from "react";
import { ArrowRight, Check, Clock3, Inbox, Landmark, Loader2, Send, ShieldCheck, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, useConsole, type ConsoleMoment } from "@/console/state";
import { consoleCoworkerDeliveryUrl } from "@/console/api";

function statusLabel(status: ConsoleMoment["status"]): string {
  if (status === "queued") return "Needs review";
  if (status === "activated") return "Delivered";
  if (status === "deferred") return "Deferred";
  return "Declined";
}

export default function BriefingsPage() {
  const { access, session } = useAuth();
  const { tenant, moments, scenarioMeta } = useConsole();
  const role = access?.role ?? "bank_operator";
  const availableScenarios = [...new Set(moments.map((moment) => moment.scenario))];
  const [selectedScenario, setSelectedScenario] = useState<ConsoleMoment["scenario"]>("deposit-retention");
  const activeScenario = availableScenarios.includes(selectedScenario)
    ? selectedScenario
    : availableScenarios[0] ?? "deposit-retention";
  const scopedMoments = moments.filter((moment) => moment.scenario === activeScenario);
  const queue = [...scopedMoments]
    .sort((left, right) => {
      if (left.status === "queued" && right.status !== "queued") return -1;
      if (right.status === "queued" && left.status !== "queued") return 1;
      return right.opportunity.confidence - left.opportunity.confidence;
    })
    .slice(0, 5);
  const queued = queue.filter((moment) => moment.status === "queued").length;
  const delivered = scopedMoments.filter((moment) => moment.status === "activated").length;
  const observed = scopedMoments.filter((moment) => moment.decisionPackage?.outcome.observation).length;
  const activeMeta = scenarioMeta[activeScenario];
  const isOperator = role === "bank_operator";
  const isOwner = role === "growth_play_owner";
  const isRisk = role === "risk_reviewer" || role === "ventus_platform_admin";
  const isAdmin = role === "institution_admin";
  const [deliveryState, setDeliveryState] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const title = isOperator
    ? `${queued} qualified moment${queued === 1 ? "" : "s"} need attention`
    : isOwner
      ? `${activeMeta.play} is operating`
      : isRisk
        ? "Control exceptions need review"
        : isAdmin
          ? "Connection health needs attention"
          : `${activeMeta.label} portfolio status`;
  const description = isOperator
    ? `Your assigned ${activeMeta.label} queue. Open a moment to make one bounded decision.`
    : isOwner
      ? "Monitor exception volume, employee capacity, and outcome coverage without opening customer-level records."
      : isRisk
        ? "Review protocol, policy, and delivery exceptions from the authoritative governance record."
        : isAdmin
          ? "Review connector health and mapping work. Customer moments remain outside this role by default."
          : `View aggregate reach, outcome coverage, and the current claim status for ${activeMeta.play}.`;
  const canBrief = isOwner || isAdmin || role === "ventus_platform_admin";
  const sendBriefing = async (channel: "outlook" | "slack") => {
    const url = consoleCoworkerDeliveryUrl();
    if (!url || !session?.access_token) {
      setDeliveryError("The authenticated Console API is unavailable in this environment.");
      return;
    }
    setDeliveryState(channel);
    setDeliveryError(null);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          scenario: activeScenario,
          title: `${tenant.shortName} growth briefing`,
          counts: { needsReview: queued, routed: delivered, outcomesObserved: observed },
          decisionIds: scopedMoments.map((moment) => moment.decisionId).slice(0, 10),
        }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string; receipt?: { status?: string } };
      if (!response.ok) throw new Error(body.error ?? `Delivery failed (${response.status})`);
      setDeliveryState(`${channel} ${body.receipt?.status === "delivered" ? "sent" : "recorded"}`);
    } catch (cause) {
      setDeliveryError(cause instanceof Error ? cause.message : "Briefing delivery failed");
      setDeliveryState(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b pb-5" style={{ borderColor: "var(--v2-rule)" }}>
        <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
          {`Today · ${tenant.shortName} · ${activeMeta.play}`}
        </p>
        <h2 className="v2-display mt-2 text-3xl">{title}</h2>
        <p className="v2-body mt-2 max-w-2xl text-[13px]">{description}</p>
        {availableScenarios.length > 1 && <div className="mt-4 flex flex-wrap gap-2">{availableScenarios.map((scenario) => <button key={scenario} onClick={() => setSelectedScenario(scenario)} className="console-btn-ghost !px-3 !py-2 !text-[10px]" aria-pressed={activeScenario === scenario}>{scenarioMeta[scenario].label}</button>)}</div>}
        {canBrief && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(["outlook", "slack"] as const).map((channel) => (
              <button key={channel} onClick={() => void sendBriefing(channel)} disabled={deliveryState === channel} className="console-btn-ghost !px-3 !py-2 !text-[11px]">
                {deliveryState === channel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send {channel === "outlook" ? "Outlook" : "Slack"} briefing
              </button>
            ))}
            {deliveryState && deliveryState !== "outlook" && deliveryState !== "slack" && <span className="text-[11px]" style={{ color: "var(--v2-verified)" }}>{deliveryState}</span>}
            {deliveryError && <span className="text-[11px]" style={{ color: "#b3261e" }}>{deliveryError}</span>}
          </div>
        )}
      </div>

      {isOperator ? (
        queue.length === 0 ? (
          <div className="console-cell mt-5 flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
            <Inbox className="h-9 w-9" style={{ color: "var(--v2-ink-faint)" }} />
            <h3 className="v2-display mt-5 text-2xl">No assigned moments.</h3>
            <p className="v2-body mt-2 max-w-sm text-[13px]">New qualified moments appear here after the governed runtime creates them.</p>
          </div>
        ) : (
          <div className="console-cell mt-5 overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--v2-rule)" }}>
              <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>Priority queue</p>
              <span className="v2-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>up to five items</span>
            </div>
            {queue.map((moment) => {
              const meta = scenarioMeta[moment.scenario];
              const deliveredMoment = moment.status === "activated";
              return (
                <div key={moment.id} className="grid gap-3 border-b px-4 py-4 last:border-0 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto_auto]" style={{ borderColor: "var(--v2-rule)" }}>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-md" style={{ color: "var(--c-accent)", backgroundColor: "var(--c-accent-wash)" }}><Landmark className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>{moment.opportunity.type}</p>
                      <p className="mt-0.5 truncate text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>{meta.actions[0]?.title} · {moment.opportunity.confidence}% confidence</p>
                    </div>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>{moment.sourceMode === "fixture" ? "Fixture interaction proof" : "Partner sandbox"}</p>
                  <span className="flex items-center justify-end gap-1.5 text-[10px] font-bold" style={{ color: deliveredMoment ? "var(--v2-verified)" : "var(--v2-ink-soft)" }}>{deliveredMoment ? <Check className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{statusLabel(moment.status)}</span>
                  <Link to={`/app/moments?moment=${encodeURIComponent(moment.id)}&source=today`} className="inline-flex items-center justify-end gap-1 text-[11px] font-bold" style={{ color: "var(--c-accent)" }}>Review <ArrowRight className="h-3.5 w-3.5" /></Link>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="mt-5 grid gap-px overflow-hidden rounded-lg border md:grid-cols-3" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-rule)" }}>
          {[
            ["Awaiting response", queued, isRisk ? ShieldCheck : Target],
            ["Delivered", delivered, Check],
            ["Outcome coverage", `${observed}/${scopedMoments.length}`, Clock3],
          ].map(([label, value, Icon]) => {
            const MetricIcon = Icon as typeof Check;
            return <div key={label as string} className="bg-white p-5"><MetricIcon className="h-4 w-4" style={{ color: "var(--c-accent)" }} /><p className="console-stat mt-4 text-[38px]" style={{ color: "var(--v2-ink)" }}>{value as string | number}</p><p className="v2-mono mt-1 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>{label as string}</p></div>;
          })}
        </div>
      )}
    </div>
  );
}
