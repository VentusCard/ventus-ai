// Console state: Supabase auth + the operating session (tenant, connector
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
import {
  clearTenantOverride,
  resolveTenant,
  resolveTenantFromEmail,
  type Tenant,
} from "@/lib/tenant";

// ── Auth ──────────────────────────────────────────────────────────────────

type AuthState = {
  user: User | null;
  session: Session | null;
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
  role: "operator" | "admin";
  status: "active" | "pending";
  entitlements: ConsoleEntitlement[];
  authProvider: string;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<ConsoleAccessProfile | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

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
      const response = await fetch("/api/console-access", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await response.json().catch(() => ({}))) as ConsoleAccessProfile & { error?: string };
      if (!response.ok || !data.userId) {
        throw new Error(data.error ?? `access lookup failed (${response.status})`);
      }
      setAccess(data);
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
    await supabase.auth.signOut();
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
  role: "operator" | "admin";
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
  status: "queued" | "activated" | "dismissed";
  receipt?: { id: string; url?: string; subject: string };
};

const STORAGE_PREFIX = "ventus_console_";

function scopedKey(name: string, tenantId: string, userId: string): string {
  return `${STORAGE_PREFIX}${name}:${tenantId}:${userId}`;
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

const SCENARIO_META: Record<ScenarioId, { label: string; play: string; subject: string; outcome: string; action: string }> = {
  "deposit-retention": {
    label: "Deposit primacy",
    play: "Deposit Primacy Defense",
    subject: "Primary deposit relationship review",
    outcome: "Retain the primary deposit relationship",
    action: "Contact the customer before the next payroll cycle to review their everyday-banking setup and an approved retention option.",
  },
  "wealth-growth": {
    label: "Wealth readiness",
    play: "Qualified Wealth Growth",
    subject: "Qualified wealth opportunity review",
    outcome: "Convert the qualified moment into an advised relationship",
    action: "Assign the best-fit advisor and prepare a consolidation review while the intent is active.",
  },
};

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
  activate: (momentId: string) => Promise<void>;
  dismiss: (momentId: string) => void;
  ledger: LedgerEvent[];
  chainVerified: boolean;
  scenarioMeta: typeof SCENARIO_META;
};

const ConsoleContext = createContext<ConsoleState | null>(null);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const tenant = useMemo(() => resolveTenant(user?.email), [user?.email]);
  const authTenant = useMemo(() => resolveTenantFromEmail(user?.email), [user?.email]);
  const userId = user?.id ?? "anonymous";
  const sessionKey = scopedKey("connector_session", authTenant.id, userId);
  const momentsKey = scopedKey("moments", authTenant.id, userId);
  const ledgerKey = scopedKey("ledger", authTenant.id, userId);

  const [connectorSession, setConnectorSession] = useState<ConnectorSession | null>(() => {
    const stored = restore<ConnectorSession | null>(sessionKey, null);
    return stored
      && stored.expiresAt * 1000 > Date.now()
      && stored.tenantId === authTenant.id
      && stored.subject === userId
      ? stored
      : null;
  });
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [moments, setMoments] = useState<ConsoleMoment[]>(() => restore(momentsKey, []));
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerEvent[]>(() => restore(ledgerKey, []));

  useEffect(() => persist(momentsKey, moments), [moments, momentsKey]);
  useEffect(() => persist(ledgerKey, ledger), [ledger, ledgerKey]);
  useEffect(() => {
    if (connectorSession) persist(sessionKey, connectorSession);
    else window.sessionStorage.removeItem(sessionKey);
  }, [connectorSession, sessionKey]);

  const record = useCallback((drafts: LedgerDraft[]) => {
    setLedger((prev) => appendEvents(prev, drafts));
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      if (!session?.access_token) throw new Error("Sign in again to start a connector session.");
      const response = await fetch("/api/presenter-session", {
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
        role: data.role === "admin" ? "admin" : "operator",
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
    [connectorSession, record],
  );

  const activate = useCallback(
    async (momentId: string) => {
      const moment = moments.find((item) => item.id === momentId);
      if (!moment || !connectorSession?.token) return;
      const meta = SCENARIO_META[moment.scenario];
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
            source: `console-${authTenant.id}`,
            insight: {
              businessLine: authTenant.businessLines[moment.scenario === "deposit-retention" ? 0 : 1] ?? authTenant.defaultBusinessLine,
              growthPlay: meta.play,
              customerRef: `household-${moment.id}`,
              moment: moment.opportunity.type,
              whyNow: moment.opportunity.reason,
              recommendedAction: meta.action,
              expectedOutcome: meta.outcome,
              confidence: moment.opportunity.confidence,
              destination: moment.opportunity.destination,
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
          error?: string;
          activation?: { subject?: string };
        };
        if (!response.ok || !data.id) {
          if (response.status === 401 || response.status === 403) setConnectorSession(null);
          throw new Error(data.error ?? `Salesforce write failed (${response.status})`);
        }
        setMoments((prev) =>
          prev.map((item) =>
            item.id === momentId
              ? { ...item, status: "activated", receipt: { id: data.id!, url: data.url, subject: data.activation?.subject ?? meta.subject } }
              : item,
          ),
        );
        record([
          {
            eventKey: `${momentId}-decision`,
            kind: "decision",
            title: `${meta.play} accepted`,
            detail: `Operator ${user?.email ?? "unknown"}`,
            ref: momentId,
            status: "confirmed",
          },
          {
            eventKey: `${momentId}-activation`,
            kind: "activation",
            title: "Salesforce Task created",
            detail: `${data.id} · sandbox org`,
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
    [moments, connectorSession, authTenant, user?.email, record],
  );

  const dismiss = useCallback(
    (momentId: string) => {
      setMoments((prev) => prev.map((item) => (item.id === momentId ? { ...item, status: "dismissed" } : item)));
      record([
        {
          eventKey: `${momentId}-dismiss`,
          kind: "decision",
          title: "Moment dismissed by operator",
          detail: `Operator ${user?.email ?? "unknown"} · feedback returned to play`,
          ref: momentId,
          status: "confirmed",
        },
      ]);
    },
    [record, user?.email],
  );

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
      dismiss,
      ledger,
      chainVerified: ledger.length > 0 && verifyChain(ledger),
      scenarioMeta: SCENARIO_META,
    }),
    [tenant, connectorSession, connecting, connectError, connect, disconnect, moments, ingesting, ingestError, ingest, activating, activateError, activate, dismiss, ledger],
  );

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

export function useConsole(): ConsoleState {
  const context = useContext(ConsoleContext);
  if (!context) throw new Error("useConsole outside ConsoleProvider");
  return context;
}
