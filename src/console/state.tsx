// Console state: Supabase auth + the operating session (tenant, connector
// session, qualified moments, decision ledger). Everything the console does is
// recorded through the same append-only ledger the demo and pilot use — the
// product is the pipeline, not a new copy of it.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { appendEvents, verifyChain, type LedgerDraft, type LedgerEvent } from "@/lib/ledger";
import {
  applyOpportunityPolicy,
  buildOpportunityFromPlaid,
  PLAID_FIXTURE_PRIMACY,
  PLAID_FIXTURE_ROLLOVER,
  type DetectedOpportunity,
  type OpportunityPolicyDecision,
  type PlaidTransaction,
} from "@/lib/plaid";
import { resolveTenant, type Tenant } from "@/lib/tenant";
import {
  createDecisionPackage,
  respondToDecision,
  type DecisionAction,
  type DecisionPackage,
} from "@/lib/decisionPackage";

// ── Auth ──────────────────────────────────────────────────────────────────

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, session, loading, signOut }),
    [session, loading, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth outside AuthProvider");
  return context;
}

// ── Console operating session ─────────────────────────────────────────────

export type ConnectorSession = {
  token: string;
  sessionId: string;
  expiresAt: number; // unix seconds
  connectors: { plaid: boolean; salesforce: boolean };
};

export type ScenarioId = "deposit-retention" | "wealth-growth";

export type ConsoleMoment = {
  id: string;
  scenario: ScenarioId;
  createdAt: string;
  sourceMode: "live" | "fixture";
  sourceName: string;
  transactions: PlaidTransaction[];
  opportunity: DetectedOpportunity;
  policy: OpportunityPolicyDecision;
  status: "queued" | "activated" | "deferred" | "declined" | "dismissed";
  decisionPackage?: DecisionPackage;
  receipt?: {
    id: string;
    url?: string;
    subject: string;
    object?: string;
    records?: {
      decision?: { id: string; url: string } | null;
      referral?: { id: string; url: string } | null;
      task?: { id: string; url: string } | null;
    };
    warnings?: Array<{ stage: string; message: string }>;
  };
};

const SESSION_KEY = "ventus_console_connector_session";
const MOMENTS_KEY = "ventus_console_moments";
const LEDGER_KEY = "ventus_console_ledger";

function restore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Session storage is a convenience cache; the console works without it.
  }
}

export const SCENARIO_META: Record<ScenarioId, {
  label: string;
  play: string;
  subject: string;
  outcome: string;
  objective: string;
  primaryMetric: string;
  protocolId: string;
  businessLineIndex: number;
  actions: DecisionAction[];
}> = {
  "deposit-retention": {
    label: "Deposit primacy",
    play: "Deposit Primacy Defense",
    subject: "Primary deposit relationship review",
    outcome: "Retain the primary deposit relationship",
    objective: "Protect primary deposit relationships",
    primaryMetric: "deposit_retained",
    protocolId: "deposit-retention-v1",
    businessLineIndex: 0,
    actions: [
      {
        id: "banker-retention-review",
        title: "Open a banker retention review",
        instructions: "Contact the customer before the next payroll cycle to review their everyday-banking setup and an approved retention option.",
        ownerRole: "Relationship banker",
        destination: "Salesforce FSC",
      },
      {
        id: "digital-retention-message",
        title: "Prepare an approved digital message",
        instructions: "Queue an approved, non-product-specific primacy message for the next eligible digital session.",
        ownerRole: "Lifecycle marketing",
        destination: "Journey orchestration",
      },
      {
        id: "specialist-relationship-review",
        title: "Route to a relationship specialist",
        instructions: "Ask a specialist to review the relationship before any customer outreach.",
        ownerRole: "Relationship specialist",
        destination: "Salesforce FSC",
      },
    ],
  },
  "wealth-growth": {
    label: "Wealth readiness",
    play: "Qualified Wealth Growth",
    subject: "Qualified wealth opportunity review",
    outcome: "Convert the qualified moment into an advised relationship",
    objective: "Grow qualified advised relationships",
    primaryMetric: "net_new_assets",
    protocolId: "wealth-growth-v1",
    businessLineIndex: 1,
    actions: [
      {
        id: "advisor-consolidation-review",
        title: "Open an advisor consolidation review",
        instructions: "Assign the best-fit advisor and prepare a consolidation review while the intent is active.",
        ownerRole: "Financial advisor",
        destination: "Salesforce FSC",
      },
      {
        id: "planning-conversation",
        title: "Prepare a planning conversation",
        instructions: "Invite the client to a goals-based planning conversation without presenting a product.",
        ownerRole: "Wealth relationship manager",
        destination: "Salesforce FSC",
      },
      {
        id: "specialist-triage",
        title: "Send for specialist triage",
        instructions: "Route the moment to the wealth specialist desk for suitability and ownership review.",
        ownerRole: "Wealth specialist",
        destination: "Specialist queue",
      },
    ],
  },
};

export function decisionPackageForMoment(moment: ConsoleMoment, tenant: Tenant, actionId?: string): DecisionPackage {
  const meta = SCENARIO_META[moment.scenario];
  const selectedAction = meta.actions.find((action) => action.id === actionId) ?? meta.actions[0];
  const businessLine = tenant.businessLines[meta.businessLineIndex] ?? tenant.defaultBusinessLine;
  return createDecisionPackage({
    decisionId: `dec_${moment.id}`,
    tenantId: tenant.id,
    createdAt: moment.createdAt,
    evidenceClass: moment.sourceMode === "live" ? "sandbox" : "fixture",
    growthPlay: {
      id: moment.scenario,
      name: meta.play,
      businessLine,
      objective: meta.objective,
      primaryMetric: meta.primaryMetric,
      protocolId: meta.protocolId,
    },
    subject: {
      token: `household-${moment.id}`,
    },
    moment: {
      type: moment.opportunity.type,
      summary: moment.opportunity.reason,
      confidence: moment.opportunity.confidence,
      evidence: moment.opportunity.signals.slice(0, 4).map((signal) => ({
        id: signal.type,
        label: signal.label,
        confidence: Math.round(signal.strength * 100),
        source: moment.sourceName,
      })),
    },
    recommendation: {
      selectedAction,
      alternatives: meta.actions.filter((action) => action.id !== selectedAction.id),
    },
    governance: {
      policyStatus: moment.policy.allowed ? "cleared" : "suppressed",
      controls: [moment.policy.reason],
      humanReviewRequired: true,
      assignmentArm: "treatment",
    },
    decisionMethod: {
      active: "deterministic-baseline",
      shadowCandidate: "model-assisted-planner",
    },
  });
}

type ConsoleState = {
  tenant: Tenant;
  connectorSession: ConnectorSession | null;
  connecting: boolean;
  connectError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  moments: ConsoleMoment[];
  ingesting: boolean;
  ingestError: string | null;
  ingest: (scenario: ScenarioId) => Promise<void>;
  activating: string | null;
  activateError: string | null;
  activate: (momentId: string, actionId?: string) => Promise<void>;
  defer: (momentId: string, reason?: string) => void;
  decline: (momentId: string, reason?: string) => void;
  dismiss: (momentId: string) => void;
  ledger: LedgerEvent[];
  chainVerified: boolean;
  scenarioMeta: typeof SCENARIO_META;
};

const ConsoleContext = createContext<ConsoleState | null>(null);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const tenant = useMemo(() => resolveTenant(user?.email), [user?.email]);

  const [connectorSession, setConnectorSession] = useState<ConnectorSession | null>(() => {
    const stored = restore<ConnectorSession | null>(SESSION_KEY, null);
    return stored && stored.expiresAt * 1000 > Date.now() ? stored : null;
  });
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [moments, setMoments] = useState<ConsoleMoment[]>(() => restore(MOMENTS_KEY, []));
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerEvent[]>(() => restore(LEDGER_KEY, []));

  useEffect(() => persist(MOMENTS_KEY, moments), [moments]);
  useEffect(() => persist(LEDGER_KEY, ledger), [ledger]);
  useEffect(() => {
    if (connectorSession) persist(SESSION_KEY, connectorSession);
    else window.sessionStorage.removeItem(SESSION_KEY);
  }, [connectorSession]);

  const record = useCallback((drafts: LedgerDraft[]) => {
    setLedger((prev) => appendEvents(prev, drafts));
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      const response = await fetch("/api/presenter-session", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as Partial<ConnectorSession> & { error?: string };
      if (!response.ok || !data.token) {
        throw new Error(data.error ?? `session mint failed (${response.status})`);
      }
      setConnectorSession({
        token: data.token,
        sessionId: data.sessionId ?? "session",
        expiresAt: data.expiresAt ?? Math.floor(Date.now() / 1000) + 900,
        connectors: data.connectors ?? { plaid: false, salesforce: false },
      });
    } catch (error) {
      setConnectError(error instanceof Error ? error.message : "Connector session unavailable");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => setConnectorSession(null), []);

  const ingest = useCallback(
    async (scenario: ScenarioId) => {
      setIngesting(true);
      setIngestError(null);
      let transactions: PlaidTransaction[] = [];
      let sourceMode: ConsoleMoment["sourceMode"] = "fixture";
      let sourceName = "Plaid-shaped fixture";

      if (connectorSession?.token && connectorSession.connectors.plaid) {
        try {
          const response = await fetch("/api/plaid-transactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${connectorSession.token}`,
            },
            body: JSON.stringify({ scenario }),
          });
          const data = (await response.json().catch(() => ({}))) as {
            transactions?: PlaidTransaction[];
            error?: string;
          };
          if (response.ok && data.transactions?.length) {
            transactions = data.transactions;
            sourceMode = "live";
            sourceName = "Plaid sandbox · live pull";
          } else if (response.status === 401 || response.status === 403) {
            setConnectorSession(null);
          }
        } catch {
          // fall through to fixtures — the pipeline logic is identical
        }
      }
      if (!transactions.length) {
        transactions = scenario === "deposit-retention" ? PLAID_FIXTURE_PRIMACY : PLAID_FIXTURE_ROLLOVER;
      }

      const opportunity = buildOpportunityFromPlaid(transactions);
      if (!opportunity) {
        setIngestError("No actionable moment detected in this stream.");
        setIngesting(false);
        return;
      }
      const policy = applyOpportunityPolicy(opportunity);
      const id = `mo_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const moment: ConsoleMoment = {
        id,
        scenario,
        createdAt: new Date().toISOString(),
        sourceMode,
        sourceName,
        transactions,
        opportunity,
        policy,
        status: "queued",
      };
      moment.decisionPackage = decisionPackageForMoment(moment, tenant);
      setMoments((prev) => [moment, ...prev]);
      record([
        {
          eventKey: `${id}-signal`,
          kind: "signal",
          title: `${opportunity.type} detected`,
          detail: `${sourceName} · ${transactions.length} records · ${opportunity.confidence}%`,
          ref: id,
          status: sourceMode === "live" ? "confirmed" : "simulated",
        },
        {
          eventKey: `${id}-gate`,
          kind: "gate",
          title: policy.allowed ? "Policy checks cleared" : "Policy suppression applied",
          detail: policy.reason,
          ref: id,
          status: "confirmed",
        },
      ]);
      setIngesting(false);
    },
    [connectorSession, record, tenant],
  );

  const activate = useCallback(
    async (momentId: string, actionId?: string) => {
      const moment = moments.find((item) => item.id === momentId);
      if (!moment || !connectorSession?.token) return;
      const meta = SCENARIO_META[moment.scenario];
      const draftPackage = decisionPackageForMoment(moment, tenant, actionId);
      const selectedAction = draftPackage.recommendation.selectedAction;
      const responseStatus = selectedAction.id === meta.actions[0].id ? "accepted" : "modified";
      const decisionPackage = respondToDecision(
        draftPackage,
        responseStatus,
        user?.email ?? "unknown",
        selectedAction,
      );
      setActivating(momentId);
      setActivateError(null);
      try {
        const response = await fetch("/api/salesforce-deliver", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${connectorSession.token}`,
          },
          body: JSON.stringify({
            subject: meta.subject,
            dueInDays: moment.scenario === "deposit-retention" ? 2 : 3,
            source: `console-${tenant.id}`,
            decisionPackage,
            insight: {
              businessLine: decisionPackage.growthPlay.businessLine,
              growthPlay: meta.play,
              customerRef: `household-${moment.id}`,
              moment: moment.opportunity.type,
              whyNow: moment.opportunity.reason,
              recommendedAction: selectedAction.instructions,
              expectedOutcome: meta.outcome,
              confidence: moment.opportunity.confidence,
              destination: selectedAction.destination,
              evidence: moment.opportunity.signals.slice(0, 4).map((signal) => ({
                label: signal.label,
                confidence: Math.round(signal.strength * 100),
              })),
              controls: [moment.policy.reason],
              sourceName: `${moment.sourceName} · ${moment.transactions.length} tokenized records`,
              decisionRef: `${moment.scenario}:${moment.id}`,
            },
          }),
        });
        const data = (await response.json().catch(() => ({}))) as {
          id?: string;
          url?: string;
          object?: string;
          error?: string;
          activation?: { subject?: string };
          records?: ConsoleMoment["receipt"]["records"];
          warnings?: Array<{ stage: string; message: string }>;
        };
        if (!response.ok || !data.id) {
          if (response.status === 401 || response.status === 403) setConnectorSession(null);
          throw new Error(data.error ?? `Salesforce write failed (${response.status})`);
        }
        setMoments((prev) =>
          prev.map((item) =>
            item.id === momentId
              ? {
                  ...item,
                  status: "activated",
                  decisionPackage: {
                    ...decisionPackage,
                    workflow: {
                      connector: "salesforce-fsc",
                      status: "delivered",
                      records: {
                        ...(data.records?.decision?.id ? { decision: data.records.decision.id } : {}),
                        ...(data.records?.referral?.id ? { referral: data.records.referral.id } : {}),
                        ...(data.records?.task?.id ? { task: data.records.task.id } : {}),
                      },
                    },
                    outcome: {
                      ...decisionPackage.outcome,
                      status: "measuring",
                    },
                  },
                  receipt: {
                    id: data.id!,
                    url: data.url,
                    object: data.object,
                    subject: data.activation?.subject ?? meta.subject,
                    records: data.records,
                    warnings: data.warnings,
                  },
                }
              : item,
          ),
        );
        record([
          {
            eventKey: `${momentId}-decision`,
            kind: "decision",
            title: `${meta.play} ${responseStatus}`,
            detail: `${selectedAction.title} · operator ${user?.email ?? "unknown"}`,
            ref: momentId,
            status: "confirmed",
          },
          {
            eventKey: `${momentId}-activation`,
            kind: "activation",
            title: "Salesforce workflow delivered",
            detail: `${Object.values(data.records ?? {}).filter(Boolean).length || 1} record(s) · sandbox org`,
            ref: data.id,
            status: "confirmed",
          },
          {
            eventKey: `${momentId}-outcome`,
            kind: "outcome",
            title: "Outcome window opened",
            detail: "Measured against reserved holdout when the bank feed posts",
            ref: momentId,
            status: "pending",
          },
        ]);
      } catch (error) {
        setActivateError(error instanceof Error ? error.message : "Activation failed");
      } finally {
        setActivating(null);
      }
    },
    [moments, connectorSession, tenant, user?.email, record],
  );

  const respondWithoutDelivery = useCallback(
    (momentId: string, status: "deferred" | "declined", reason?: string) => {
      setMoments((prev) =>
        prev.map((item) => {
          if (item.id !== momentId) return item;
          const currentPackage = item.decisionPackage ?? decisionPackageForMoment(item, tenant);
          return {
            ...item,
            status,
            decisionPackage: respondToDecision(
              currentPackage,
              status,
              user?.email ?? "unknown",
              currentPackage.recommendation.selectedAction,
              reason,
            ),
          };
        }),
      );
      record([
        {
          eventKey: `${momentId}-${status}`,
          kind: "decision",
          title: `Moment ${status} by operator`,
          detail: `${reason || "No reason supplied"} · feedback returned to play`,
          ref: momentId,
          status: "confirmed",
        },
      ]);
    },
    [record, tenant, user?.email],
  );
  const defer = useCallback((momentId: string, reason?: string) => respondWithoutDelivery(momentId, "deferred", reason), [respondWithoutDelivery]);
  const decline = useCallback((momentId: string, reason?: string) => respondWithoutDelivery(momentId, "declined", reason), [respondWithoutDelivery]);
  const dismiss = useCallback((momentId: string) => decline(momentId, "Not relevant"), [decline]);

  const value = useMemo<ConsoleState>(
    () => ({
      tenant,
      connectorSession,
      connecting,
      connectError,
      connect,
      disconnect,
      moments,
      ingesting,
      ingestError,
      ingest,
      activating,
      activateError,
      activate,
      defer,
      decline,
      dismiss,
      ledger,
      chainVerified: ledger.length > 0 && verifyChain(ledger),
      scenarioMeta: SCENARIO_META,
    }),
    [tenant, connectorSession, connecting, connectError, connect, disconnect, moments, ingesting, ingestError, ingest, activating, activateError, activate, defer, decline, dismiss, ledger],
  );

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

export function useConsole(): ConsoleState {
  const context = useContext(ConsoleContext);
  if (!context) throw new Error("useConsole outside ConsoleProvider");
  return context;
}
