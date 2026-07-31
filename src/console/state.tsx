// Console state: provider-neutral employee auth + the operating session (tenant, connector
// session, qualified moments, decision ledger). The browser ledger is a session
// integrity trace; durable pilot evidence remains a server-side responsibility.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  currentAuthSession,
  signOutConsole,
  subscribeToAuth,
  type ConsoleAuthSession,
  type ConsoleAuthUser,
} from "@/console/authClient";
import {
  connectorApiUrl,
  consoleAccessUrl,
  consoleDecisionRunUrl,
  consoleMomentDeliveryUrl,
  consoleMomentResponseUrl,
  consoleMomentsUrl,
  consoleSalesforceOutcomeSyncUrl,
} from "@/console/api";
import { appendEvents, verifyChain, type LedgerDraft, type LedgerEvent } from "@/lib/ledger";
import {
  PLAID_FIXTURE_PRIMACY,
  PLAID_FIXTURE_ROLLOVER,
  type DetectedOpportunity,
  type OpportunityPolicyDecision,
  type PlaidTransaction,
} from "@/lib/plaid";
import type { DecisionRunResult } from "@/lib/decision-contract";
import type {
  GovernedPilotResult,
  GovernedRuntimeEnvelope,
} from "@/lib/governed-runtime";
import {
  clearTenantOverride,
  resolveTenant,
  resolveTenantFromEmail,
  TENANTS,
  type Tenant,
} from "@/lib/tenant";
import {
  applyOutcomeObservation,
  createDecisionPackage,
  type DecisionAction,
  type DecisionOutcomeObservation,
  type DecisionPackage,
} from "@/lib/decisionPackage";

// ── Auth ──────────────────────────────────────────────────────────────────

type AuthState = {
  user: ConsoleAuthUser | null;
  session: ConsoleAuthSession | null;
  loading: boolean;
  access: ConsoleAccessProfile | null;
  accessLoading: boolean;
  accessError: string | null;
  refreshAccess: () => Promise<void>;
  signOut: () => Promise<void>;
};

export type ConsoleEntitlement =
  | "consumer_demo"
  | "wealth_demo"
  | "growth_console"
  | "live_connectors";

export type ConsoleAccessProfile = {
  userId: string;
  email: string;
  tenantId: string;
  organizationId: string;
  role:
    | "ventus_platform_admin"
    | "institution_admin"
    | "growth_play_owner"
    | "bank_operator"
    | "risk_reviewer"
    | "executive_viewer";
  status: "active" | "pending" | "suspended";
  businessLineScopes: string[];
  queueScopes: string[];
  entitlements: ConsoleEntitlement[];
  authProvider: string;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ConsoleAuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<ConsoleAccessProfile | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    currentAuthSession()
      .then((nextSession) => {
        if (!active) return;
        setAccess(null);
        setAccessError(null);
        setAccessLoading(Boolean(nextSession?.access_token));
        setSession(nextSession);
      })
      .catch(() => {
        if (!active) return;
        setAccess(null);
        setAccessError(null);
        setAccessLoading(false);
        setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
    });
    const unsubscribe = subscribeToAuth((nextSession) => {
      setAccess(null);
      setAccessError(null);
      setAccessLoading(Boolean(nextSession?.access_token));
      setSession(nextSession);
      setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const refreshAccess = useCallback(async () => {
    if (!session?.access_token) {
      setAccess(null);
      setAccessLoading(false);
      setAccessError(null);
      return;
    }
    setAccessLoading(true);
    setAccessError(null);
    try {
      const response = await fetch(consoleAccessUrl(), {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await response.json().catch(() => ({}))) as ConsoleAccessProfile & { error?: string };
      if (!response.ok || !data.userId) {
        throw new Error(data.error ?? `access lookup failed (${response.status})`);
      }
      setAccess({
        ...data,
        businessLineScopes: data.businessLineScopes ?? [],
        queueScopes: data.queueScopes ?? [],
      });
    } catch (error) {
      setAccess(null);
      setAccessError(error instanceof Error ? error.message : "Access lookup unavailable");
    } finally {
      setAccessLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void refreshAccess();
  }, [refreshAccess]);

  const signOut = useCallback(async () => {
    clearConsoleStorage();
    clearTenantOverride();
    setAccess(null);
    await signOutConsole();
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      access,
      accessLoading,
      accessError,
      refreshAccess,
      signOut,
    }),
    [session, loading, access, accessLoading, accessError, refreshAccess, signOut],
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
  tenantId: string;
  subject: string;
  role: ConsoleAccessProfile["role"] | "demo";
};

export type ScenarioId = "deposit-retention" | "wealth-growth";

export type ConsoleMoment = {
  id: string;
  decisionId: string;
  scenario: ScenarioId;
  createdAt: string;
  sourceMode: "live" | "fixture";
  sourceName: string;
  transactions: PlaidTransaction[];
  opportunity: DetectedOpportunity;
  policy: OpportunityPolicyDecision;
  runtime: DecisionRunResult["runtime"];
  ledgerReceipt?: DecisionRunResult["ledgerReceipt"];
  governedReview?: GovernedPilotResult;
  status: "queued" | "approved" | "delivery_reserved" | "delivery_failed" | "activated" | "deferred" | "declined" | "dismissed";
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

type SalesforceOutcomeReturn = {
  response?: {
    status: DecisionPackage["response"]["status"];
    actorToken: string | null;
    recordedAt: string | null;
  };
  outcome: {
    status: DecisionPackage["outcome"]["status"];
    observation: {
      eventType?: string;
      occurredAt?: string | null;
      sourceSystem?: string;
      sourceRecordId?: string;
      reasonCode?: string | null;
      metric?: string | null;
      amount?: number | null;
      currency?: "USD";
    } | null;
  };
  recorded?: {
    observation?: { observationId?: string };
    measurement?: { status?: string; eventId?: string; reason?: string };
  };
  error?: string;
};

type DurableMomentMutation = {
  moment: Omit<ConsoleMoment, "transactions">;
  receipt?: { deliveryId?: string; status?: string };
  error?: string;
};

const STORAGE_PREFIX = "ventus_console_";

function fscObservationToDecisionObservation(
  observation: SalesforceOutcomeReturn["outcome"]["observation"],
  fallbackSourceRecordId: string,
): DecisionOutcomeObservation | undefined {
  if (!observation?.eventType || !observation.occurredAt) return undefined;
  const amount = observation.amount;
  return {
    eventId: `fsc_${fallbackSourceRecordId}_${observation.eventType}_${observation.occurredAt}`,
    eventType: observation.eventType,
    occurredAt: observation.occurredAt,
    sourceSystem: observation.sourceSystem || "salesforce-fsc",
    sourceRecordId: observation.sourceRecordId || fallbackSourceRecordId,
    ...(observation.reasonCode ? { reasonCode: observation.reasonCode } : {}),
    ...(typeof amount === "number" && Number.isFinite(amount) && observation.metric
      ? { value: { metric: observation.metric, amount, currency: "USD" as const } }
      : {}),
  };
}

function clearConsoleStorage(): void {
  if (typeof window === "undefined") return;
  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith(STORAGE_PREFIX) || key?.startsWith("ventus_demo_")) {
      window.sessionStorage.removeItem(key);
    }
  }
}

function mutationKey(prefix: string): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "")
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
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
    decisionId: moment.decisionId,
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
      token: `tok_${moment.id.replace(/[^A-Za-z0-9_-]/g, "_")}`,
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
  retryDelivery: (momentId: string) => Promise<void>;
  syncingOutcome: string | null;
  outcomeSyncMessage: string | null;
  syncOutcome: (momentId: string) => Promise<void>;
  defer: (momentId: string, reason?: string) => Promise<void>;
  decline: (momentId: string, reason?: string) => Promise<void>;
  dismiss: (momentId: string) => Promise<void>;
  ledger: LedgerEvent[];
  chainVerified: boolean;
  scenarioMeta: typeof SCENARIO_META;
};

const ConsoleContext = createContext<ConsoleState | null>(null);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const { user, session, access } = useAuth();
  const authTenant = useMemo(() => TENANTS[access?.tenantId ?? ""] ?? resolveTenantFromEmail(user?.email), [access?.tenantId, user?.email]);
  const tenant = useMemo(() => resolveTenant(authTenant.id === "ventus" ? user?.email : undefined), [authTenant.id, user?.email]);
  const userId = user?.id ?? "anonymous";

  const [connectorSession, setConnectorSession] = useState<ConnectorSession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [moments, setMoments] = useState<ConsoleMoment[]>([]);
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [syncingOutcome, setSyncingOutcome] = useState<string | null>(null);
  const [outcomeSyncMessage, setOutcomeSyncMessage] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerEvent[]>([]);

  useEffect(() => {
    if (!session?.access_token) {
      setMoments([]);
      return;
    }
    const url = consoleMomentsUrl();
    if (!url) return;
    let active = true;
    fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({})) as { moments?: ConsoleMoment[] };
        if (!response.ok) throw new Error("moment projection unavailable");
        if (active) setMoments(data.moments ?? []);
      })
      .catch(() => {
        // A local preview can still exercise the controlled fixture demo. Durable
        // product state is never recovered from browser storage.
        if (active) setMoments([]);
      });
    return () => { active = false; };
  }, [authTenant.id, session?.access_token]);

  const record = useCallback((drafts: LedgerDraft[]) => {
    setLedger((prev) => appendEvents(prev, drafts));
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      if (!session?.access_token) throw new Error("Sign in again to start a connector session.");
      const response = await fetch(connectorApiUrl("session"), {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await response.json().catch(() => ({}))) as Partial<ConnectorSession> & { error?: string };
      if (!response.ok || !data.token) {
        throw new Error(data.error ?? `session mint failed (${response.status})`);
      }
      if (data.tenantId !== authTenant.id || data.subject !== userId) {
        throw new Error("Connector session identity did not match this workspace.");
      }
      setConnectorSession({
        token: data.token,
        sessionId: data.sessionId ?? "session",
        expiresAt: data.expiresAt ?? Math.floor(Date.now() / 1000) + 900,
        connectors: data.connectors ?? { plaid: false, salesforce: false },
        tenantId: data.tenantId,
        subject: data.subject,
        role: data.role ?? "bank_operator",
      });
    } catch (error) {
      setConnectError(error instanceof Error ? error.message : "Connector session unavailable");
    } finally {
      setConnecting(false);
    }
  }, [authTenant.id, session?.access_token, userId]);

  const disconnect = useCallback(() => setConnectorSession(null), []);

  const ingest = useCallback(
    async (scenario: ScenarioId) => {
      setIngesting(true);
      setIngestError(null);
      let transactions: PlaidTransaction[] = [];
      let sourceMode: ConsoleMoment["sourceMode"] = "fixture";
      let sourceName = "Plaid-shaped fixture";
      let decision: DecisionRunResult | null = null;
      let governedReview: GovernedPilotResult | undefined;

      if (connectorSession?.token && connectorSession.connectors.plaid) {
        try {
          const response = await fetch(connectorApiUrl("plaid-transactions"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${connectorSession.token}`,
            },
            body: JSON.stringify({ scenario }),
          });
          const data = (await response.json().catch(() => ({}))) as {
            transactions?: PlaidTransaction[];
            decision?: DecisionRunResult | null;
            governedRuntime?: GovernedRuntimeEnvelope;
            error?: string;
          };
          if (response.ok && data.transactions?.length) {
            transactions = data.transactions;
            sourceMode = "live";
            sourceName = "Plaid sandbox · live pull";
            decision = data.decision ?? null;
            if (data.governedRuntime?.state === "unavailable") {
              setIngestError(data.governedRuntime.error);
              setIngesting(false);
              return;
            }
            if (data.governedRuntime?.state === "holdout") {
              record([{
                eventKey: `${data.governedRuntime.result.decisionId}-holdout`,
                kind: "counterfactual",
                title: "Household reserved for holdout",
                detail: "Assignment occurred before decisioning; no employee action was surfaced.",
                ref: data.governedRuntime.result.householdToken,
                status: "confirmed",
              }]);
              setIngestError("This household is in the pilot holdout, so no employee action was created.");
              setIngesting(false);
              return;
            }
            if (data.governedRuntime?.state === "suppressed") {
              record([{
                eventKey: `${data.governedRuntime.result.decisionId}-suppressed`,
                kind: "gate",
                title: "Governed decision suppressed",
                detail: data.governedRuntime.result.decision?.abstainReason ?? "The approved policy blocked activation.",
                ref: data.governedRuntime.result.householdToken,
                status: "confirmed",
              }]);
              setIngestError("The governed runtime suppressed this action under the approved policy.");
              setIngesting(false);
              return;
            }
            if (data.governedRuntime?.state === "prepared") {
              governedReview = data.governedRuntime.result;
            }
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

      if (!decision) {
        try {
          if (!session?.access_token) throw new Error("Sign in again to run the decision.");
          const response = await fetch(consoleDecisionRunUrl(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              scenario,
              transactions,
              source: { mode: sourceMode, name: sourceName },
            }),
          });
          const data = (await response.json().catch(() => ({}))) as DecisionRunResult & {
            moment?: Omit<ConsoleMoment, "transactions">;
            error?: string;
          };
          if (!response.ok || !data.decisionId) {
            throw new Error(data.error ?? `decision run failed (${response.status})`);
          }
          decision = data;
        } catch (error) {
          setIngestError(error instanceof Error ? error.message : "Decision runtime unavailable");
          setIngesting(false);
          return;
        }
      }
      if (decision.tenantId !== authTenant.id) {
        setIngestError("Decision runtime identity did not match this workspace.");
        setIngesting(false);
        return;
      }

      sourceMode = decision.source.mode;
      sourceName = decision.source.name;
      const opportunity = decision.opportunity;
      if (!opportunity) {
        setIngestError("No actionable moment detected in this stream.");
        setIngesting(false);
        return;
      }
      const policy = decision.policy;
      const id = `mo_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const moment: ConsoleMoment = {
        id,
        decisionId: governedReview?.decisionId ?? decision.decisionId,
        scenario,
        createdAt: new Date().toISOString(),
        sourceMode,
        sourceName,
        transactions,
        opportunity,
        policy,
        runtime: decision.runtime,
        ledgerReceipt: decision.ledgerReceipt,
        governedReview,
        status: "queued",
      };
      moment.decisionPackage = decisionPackageForMoment(moment, authTenant);
      const durableMoment = (decision as DecisionRunResult & { moment?: Omit<ConsoleMoment, "transactions"> }).moment;
      if (durableMoment) {
        setMoments((prev) => [
          { ...durableMoment, transactions: [] },
          ...prev.filter((item) => item.decisionId !== durableMoment.decisionId),
        ]);
      } else {
        // Local fixture fallback is in-memory only. It is not restored after a refresh.
        setMoments((prev) => [moment, ...prev]);
      }
      record([
        {
          eventKey: `${id}-signal`,
          kind: "signal",
          title: `${opportunity.type} detected`,
          detail: `${sourceName} · ${transactions.length} records · ${opportunity.confidence}% · ${governedReview ? "durable review prepared" : decision.runtime.version}`,
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
    [authTenant, connectorSession, record, session?.access_token],
  );

  const activate = useCallback(
    async (momentId: string, actionId?: string) => {
      const moment = moments.find((item) => item.id === momentId);
      if (!moment) return;
      if (!session?.access_token) {
        setActivateError("Sign in again to respond to this Moment.");
        return;
      }
      const meta = SCENARIO_META[moment.scenario];
      setActivating(momentId);
      setActivateError(null);
      try {
        let current = moment;
        if (current.status === "queued") {
          const responseUrl = consoleMomentResponseUrl(current.decisionId);
          if (!responseUrl) throw new Error("The durable Console API is not configured for this environment.");
          const selectedAction = current.decisionPackage?.recommendation.selectedAction
            ?? decisionPackageForMoment(current, authTenant, actionId).recommendation.selectedAction;
          const requestedAction = actionId ?? selectedAction.id;
          const responseStatus = requestedAction === meta.actions[0].id ? "accepted" : "modified";
          const response = await fetch(responseUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
              "Idempotency-Key": mutationKey("response"),
            },
            body: JSON.stringify({
              expectedState: "queued",
              clientRequestedAt: new Date().toISOString(),
              response: { status: responseStatus, actionId: requestedAction },
            }),
          });
          const data = (await response.json().catch(() => ({}))) as DurableMomentMutation;
          if (!response.ok || !data.moment) throw new Error(data.error ?? `Response could not be recorded (${response.status})`);
          current = { ...data.moment, transactions: [] };
          setMoments((prev) => prev.map((item) => item.id === momentId ? current : item));
        }
        const deliveryUrl = consoleMomentDeliveryUrl(current.decisionId);
        if (!deliveryUrl) throw new Error("The durable Console API is not configured for this environment.");
        const expectedState = current.status === "delivery_failed" ? "delivery_failed" : "approved";
        const delivery = await fetch(deliveryUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            "Idempotency-Key": mutationKey(expectedState === "delivery_failed" ? "delivery-retry" : "delivery"),
          },
          body: JSON.stringify({ expectedState, clientRequestedAt: new Date().toISOString() }),
        });
        const data = (await delivery.json().catch(() => ({}))) as DurableMomentMutation;
        if (!delivery.ok || !data.moment) throw new Error(data.error ?? `Delivery could not be reserved (${delivery.status})`);
        const nextMoment = { ...data.moment, transactions: [] };
        setMoments((prev) => prev.map((item) => item.id === momentId ? nextMoment : item));
        record([
          {
            eventKey: `${momentId}-response`,
            kind: "decision",
            title: `${meta.play} response recorded`,
            detail: "Server-authoritative response receipt created",
            ref: current.decisionId,
            status: "confirmed",
          },
          {
            eventKey: `${momentId}-reservation`,
            kind: "activation",
            title: data.moment.status === "activated" ? "Workflow delivered" : data.moment.status === "delivery_failed" ? "Workflow delivery needs configuration" : "Workflow delivery reserved",
            detail: data.moment.status === "activated" ? "Server-authoritative connector receipt recorded" : data.moment.status === "delivery_failed" ? "The connector did not run; review the server-side connection setup" : "Idempotent connector reservation awaits reconciliation",
            ref: data.receipt?.deliveryId,
            status: data.moment.status === "activated" ? "confirmed" : data.moment.status === "delivery_failed" ? "failed" : "pending",
          },
        ]);
      } catch (error) {
        setActivateError(error instanceof Error ? error.message : "Activation failed");
      } finally {
        setActivating(null);
      }
    },
    [moments, session?.access_token, authTenant, record],
  );

  const retryDelivery = useCallback(
    async (momentId: string) => {
      const moment = moments.find((item) => item.id === momentId);
      if (!moment || moment.status !== "delivery_failed") return;
      await activate(momentId);
    },
    [activate, moments],
  );

  const respondWithoutDelivery = useCallback(
    async (momentId: string, status: "deferred" | "declined", reason?: string) => {
      const moment = moments.find((item) => item.id === momentId);
      const responseUrl = moment ? consoleMomentResponseUrl(moment.decisionId) : null;
      if (!moment || !responseUrl || !session?.access_token) {
        setActivateError("Sign in again to record this response.");
        return;
      }
      try {
        const response = await fetch(responseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            "Idempotency-Key": mutationKey(status),
          },
          body: JSON.stringify({
            expectedState: "queued",
            clientRequestedAt: new Date().toISOString(),
            response: { status, reason },
          }),
        });
        const data = (await response.json().catch(() => ({}))) as DurableMomentMutation;
        if (!response.ok || !data.moment) throw new Error(data.error ?? `Response could not be recorded (${response.status})`);
        const nextMoment = { ...data.moment, transactions: [] };
        setMoments((prev) => prev.map((item) => item.id === momentId ? nextMoment : item));
        record([{ eventKey: `${momentId}-${status}`, kind: "decision", title: `Moment ${status}`, detail: "Server-authoritative response receipt created", ref: moment.decisionId, status: "confirmed" }]);
      } catch (error) {
        setActivateError(error instanceof Error ? error.message : "Response could not be recorded");
      }
    },
    [moments, record, session?.access_token],
  );

  const syncOutcome = useCallback(
    async (momentId: string) => {
      const moment = moments.find((item) => item.id === momentId);
      const outcomeSyncUrl = consoleSalesforceOutcomeSyncUrl();
      if (!moment) return;
      if (!session?.access_token || !outcomeSyncUrl) {
        setOutcomeSyncMessage("Sign in again to reconcile this FSC receipt.");
        return;
      }
      setSyncingOutcome(momentId);
      setOutcomeSyncMessage(null);
      try {
        const response = await fetch(outcomeSyncUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ decisionId: moment.decisionId }),
        });
        const data = await response.json().catch(() => ({})) as SalesforceOutcomeReturn;
        if (!response.ok || !data.outcome) throw new Error(data.error ?? `Salesforce outcome sync failed (${response.status})`);

        const currentPackage = moment.decisionPackage ?? decisionPackageForMoment(moment, authTenant);
        const observation = fscObservationToDecisionObservation(
          data.outcome.observation,
          moment.receipt?.records?.decision?.id ?? moment.decisionId,
        );
        const nextPackage = applyOutcomeObservation(currentPackage, {
          response: data.response?.status === "pending" || !data.response
            ? undefined
            : {
                status: data.response.status,
                actor: data.response.actorToken ?? currentPackage.response.actor,
                recordedAt: data.response.recordedAt ?? currentPackage.response.recordedAt,
              },
          status: data.outcome.status,
          observation,
        });
        setMoments((prev) => prev.map((item) => (
          item.id === momentId ? { ...item, decisionPackage: nextPackage } : item
        )));

        if (!observation) {
          setOutcomeSyncMessage("FSC receipt reconciled and recorded. No measured outcome has been posted yet.");
          return;
        }
        record([
          {
            eventKey: `${momentId}-outcome-${data.recorded?.observation?.observationId ?? observation.eventId}`,
            kind: "outcome",
            title: observation.eventType.split("_").join(" "),
            detail: "Observed in Salesforce FSC and recorded in the durable evidence ledger",
            ref: momentId,
            value: observation.value?.amount,
            status: "confirmed",
          },
        ]);
        const measurement = data.recorded?.measurement;
        setOutcomeSyncMessage(
          measurement?.status === "recorded"
            ? `FSC outcome recorded as measurement ${measurement.eventId ?? "event"}.`
            : `FSC outcome recorded. ${measurement?.reason ? measurement.reason.replaceAll("_", " ") : "Lift remains gated by the experiment design."}`,
        );
      } catch (error) {
        setOutcomeSyncMessage(
          error instanceof Error ? error.message : "Salesforce outcome sync failed",
        );
      } finally {
        setSyncingOutcome(null);
      }
    },
    [authTenant, moments, record, session?.access_token],
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
      retryDelivery,
      syncingOutcome,
      outcomeSyncMessage,
      syncOutcome,
      defer,
      decline,
      dismiss,
      ledger,
      chainVerified: ledger.length > 0 && verifyChain(ledger),
      scenarioMeta: SCENARIO_META,
    }),
    [tenant, connectorSession, connecting, connectError, connect, disconnect, moments, ingesting, ingestError, ingest, activating, activateError, activate, retryDelivery, syncingOutcome, outcomeSyncMessage, syncOutcome, defer, decline, dismiss, ledger],
  );

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

export function useConsole(): ConsoleState {
  const context = useContext(ConsoleContext);
  if (!context) throw new Error("useConsole outside ConsoleProvider");
  return context;
}
