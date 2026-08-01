import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Database,
  Loader2,
  Plug,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useAuth, useConsole } from "@/console/state";
import { connectorApiUrl } from "@/console/api";
import {
  createDecisionPackage,
  respondToDecision,
  type DecisionAction,
} from "@/lib/decisionPackage";

type MappingStatus = {
  key: string;
  label: string;
  object: string;
  field: string;
  required: boolean;
  status: "ready" | "missing";
};

type SchemaDiscovery = {
  system: string;
  tenantId: string;
  instanceDomain: string;
  apiVersion: string;
  mappings: MappingStatus[];
  requiredMappingsReady: boolean;
  capabilities: {
    customerAnchor: boolean;
    employeeTask: boolean;
    referral: boolean;
    financialAccountContext: boolean;
    decisionReceipt: boolean;
    outcomeReturn: boolean;
  };
};

type AccountVerification = {
  account: {
    id: string | null;
    verified: boolean;
    personAccount: boolean;
    hasPersonContact: boolean;
    hasRecordType: boolean;
  };
};

type DeliveryReceipt = {
  id: string;
  object: string;
  url?: string;
  records?: {
    decision?: { id: string; url: string } | null;
    task?: { id: string; url: string } | null;
  };
  warnings?: Array<{ stage: string; message: string }>;
};

const PROOF_ACTION: DecisionAction = {
  id: "review-onboarding-proof",
  title: "Review the customer-linked onboarding proof",
  instructions: "Confirm the Decision Receipt and employee Task are linked to the intended sandbox Account.",
  ownerRole: "Pilot administrator",
  destination: "Salesforce FSC",
};

export function FscOnboardingPage() {
  const { user, access } = useAuth();
  const {
    tenant,
    connectorSession,
    connecting,
    connectError,
    connect,
  } = useConsole();
  const live = Boolean(
    connectorSession
      && connectorSession.expiresAt * 1000 > Date.now()
      && connectorSession.connectors.salesforce,
  );
  const [schema, setSchema] = useState<SchemaDiscovery | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [account, setAccount] = useState<AccountVerification["account"] | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryReceipt | null>(null);
  const [delivering, setDelivering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completed = useMemo(
    () => [live, Boolean(schema?.requiredMappingsReady), Boolean(account?.verified), Boolean(delivery)].filter(Boolean).length,
    [account?.verified, delivery, live, schema?.requiredMappingsReady],
  );

  if (access?.role !== "institution_admin" && access?.role !== "ventus_platform_admin") {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-md flex-col items-center justify-center text-center">
        <ShieldCheck className="h-9 w-9" style={{ color: "var(--v2-ink-faint)" }} />
        <h2 className="v2-display mt-5 text-2xl">Administrator access required.</h2>
        <p className="v2-body mt-3 text-[13px]">
          Institution mappings and connector proofs are controlled by the bank's onboarding administrator.
        </p>
      </div>
    );
  }

  const discover = async () => {
    setDiscovering(true);
    setError(null);
    setSchema(null);
    setAccount(null);
    setDelivery(null);
    try {
      const data = await onboardingRequest<SchemaDiscovery>(
        connectorSession?.token,
        { action: "discover" },
      );
      setSchema(data);
    } catch (cause) {
      setError(message(cause));
    } finally {
      setDiscovering(false);
    }
  };

  const verifyAccount = async () => {
    setVerifying(true);
    setError(null);
    setAccount(null);
    setDelivery(null);
    try {
      const data = await onboardingRequest<AccountVerification>(
        connectorSession?.token,
        { action: "verify-account", accountId },
      );
      setAccount(data.account);
    } catch (cause) {
      setError(message(cause));
    } finally {
      setVerifying(false);
    }
  };

  const createProof = async () => {
    if (!connectorSession?.token || !account?.verified || !account.id) return;
    setDelivering(true);
    setError(null);
    setDelivery(null);
    try {
      const now = new Date();
      const decisionId = `fsc_onboarding_${now.getTime().toString(36)}`;
      const draft = createDecisionPackage({
        decisionId,
        tenantId: connectorSession.tenantId,
        createdAt: now.toISOString(),
        // The onboarding proof still emits v1.1 for the legacy connector.
        // Its companion v1.2 receipt is canonicalized server-side.
        evidenceClass: "sandbox",
        growthPlay: {
          id: "fsc-onboarding-proof",
          name: "FSC Onboarding Proof",
          businessLine: tenant.defaultBusinessLine,
          objective: "Verify governed customer-linked delivery",
          primaryMetric: "integration_verified",
          protocolId: "fsc-onboarding-proof-v1",
        },
        subject: {
          token: `sf_account_${account.id.slice(-6)}`,
          accountId: account.id,
        },
        moment: {
          type: "connector-onboarding",
          summary: "The institution approved a sandbox proof against one explicit FSC Account anchor.",
          confidence: 100,
          evidence: [
            {
              id: "fsc-schema",
              label: "Required FSC objects and fields were discovered through the scoped connector.",
              confidence: 100,
              source: `${schema?.instanceDomain ?? "Salesforce FSC"} · ${schema?.apiVersion ?? "sandbox"}`,
            },
            {
              id: "fsc-account",
              label: "The supplied Account ID was verified without returning customer profile data.",
              confidence: 100,
              source: "Salesforce Account API",
            },
          ],
        },
        recommendation: {
          selectedAction: PROOF_ACTION,
          alternatives: [],
        },
        governance: {
          policyStatus: "cleared",
          controls: ["Sandbox only", "Explicit account anchor", "Administrator initiated"],
          humanReviewRequired: true,
          assignmentArm: "treatment",
        },
        decisionMethod: {
          active: "deterministic-baseline",
        },
      });
      const decisionPackage = respondToDecision(
        draft,
        "accepted",
        user?.email ?? "pilot-administrator",
        PROOF_ACTION,
        "Administrator approved a customer-linked onboarding proof.",
      );
      const response = await fetch(connectorApiUrl("salesforce-deliver"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${connectorSession.token}`,
        },
        body: JSON.stringify({
          subject: "Ventus onboarding proof · review customer-linked decision",
          source: `fsc-onboarding-${tenant.id}`,
          dueInDays: 2,
          whatId: account.id,
          fsc: {
            clientId: account.id,
            createReferral: false,
          },
          decisionPackage,
          insight: {
            businessLine: tenant.defaultBusinessLine,
            growthPlay: "FSC Onboarding Proof",
            moment: "Customer-linked connector proof",
            whyNow: "The FSC schema and one explicit sandbox Account anchor have been verified.",
            recommendedAction: PROOF_ACTION.instructions,
            expectedOutcome: "Confirm Ventus can place governed work against the correct customer relationship.",
            confidence: 100,
            destination: "Salesforce FSC",
            evidence: decisionPackage.moment.evidence.map((item) => ({
              label: item.label,
              confidence: item.confidence,
            })),
            controls: decisionPackage.governance.controls,
            sourceName: "Ventus FSC onboarding · sandbox",
            decisionRef: decisionPackage.decisionId,
          },
        }),
      });
      const data = await response.json().catch(() => ({})) as DeliveryReceipt & { error?: string };
      if (!response.ok || !data.id) {
        throw new Error(data.error ?? `Salesforce proof failed (${response.status})`);
      }
      setDelivery(data);
    } catch (cause) {
      setError(message(cause));
    } finally {
      setDelivering(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: "var(--v2-rule)" }}>
        <div>
          <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
            Institution setup
          </p>
          <h2 className="v2-display mt-2 text-2xl">Salesforce FSC onboarding</h2>
          <p className="v2-body mt-2 max-w-xl text-[13px]">
            Verify the bank's schema, anchor one sandbox customer, and leave a real governed receipt.
          </p>
        </div>
        <p className="v2-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
          {completed}/4 verified
        </p>
      </div>

      <div className="mt-5 grid gap-px overflow-hidden rounded-md border sm:grid-cols-4" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-rule)" }}>
        {[
          ["Connection", live],
          ["Schema", Boolean(schema?.requiredMappingsReady)],
          ["Customer", Boolean(account?.verified)],
          ["Proof", Boolean(delivery)],
        ].map(([label, done], index) => (
          <div key={String(label)} className="flex items-center gap-3 bg-white px-4 py-3">
            <span
              className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                color: done ? "white" : "var(--v2-ink-faint)",
                backgroundColor: done ? "var(--v2-verified)" : "#efede7",
              }}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className="text-[12px] font-bold" style={{ color: "var(--v2-ink)" }}>{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-800">
          <CircleAlert className="mt-0.5 h-4 w-4 flex-none" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="console-cell p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>1. Connect the sandbox</p>
              <p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
                Server-side OAuth · credentials stay in AWS
              </p>
            </div>
            <span className="console-dot" style={{ backgroundColor: live ? "#34D399" : "#c8c5bc" }} />
          </div>
          {!live && (
            <button onClick={() => void connect()} disabled={connecting} className="console-btn mt-5 w-full justify-center !py-2.5 !text-[12px]">
              {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
              Start scoped session
            </button>
          )}
          {live && (
            <button onClick={() => void discover()} disabled={discovering} className="console-btn mt-5 w-full justify-center !py-2.5 !text-[12px]">
              {discovering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
              {schema ? "Refresh schema" : "Discover FSC schema"}
            </button>
          )}
          {connectError && <p className="mt-3 text-[11px] text-red-700">{connectError}</p>}
          {schema && (
            <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--v2-rule)" }}>
              <p className="text-[12px] font-bold" style={{ color: "var(--v2-ink)" }}>{schema.instanceDomain}</p>
              <p className="v2-mono mt-1 text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--v2-ink-faint)" }}>
                {schema.apiVersion} · metadata only
              </p>
            </div>
          )}
        </section>

        <section className="console-cell overflow-hidden">
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--v2-rule)" }}>
            <p className="text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>2. Confirm the operating contract</p>
            <p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
              Ventus checks only the fields required for customer linkage, action, and outcome return.
            </p>
          </div>
          {schema ? (
            <div>
              {schema.mappings.map((mapping) => (
                <div key={mapping.key} className="grid gap-2 border-b px-5 py-3 last:border-0 sm:grid-cols-[1.1fr_1fr_auto] sm:items-center" style={{ borderColor: "var(--v2-rule)" }}>
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: "var(--v2-ink)" }}>{mapping.label}</p>
                    <p className="v2-mono mt-0.5 text-[8px] uppercase tracking-[0.08em]" style={{ color: "var(--v2-ink-faint)" }}>
                      {mapping.required ? "required" : "optional"}
                    </p>
                  </div>
                  <p className="v2-mono text-[10px]" style={{ color: "var(--v2-ink-soft)" }}>
                    {mapping.object}.{mapping.field}
                  </p>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: mapping.status === "ready" ? "var(--v2-verified)" : "#b3261e" }}>
                    {mapping.status === "ready" ? <Check className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
                    {mapping.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-56 items-center justify-center px-6 text-center">
              <p className="max-w-sm text-[12px] leading-5" style={{ color: "var(--v2-ink-faint)" }}>
                Start a scoped session and discover the FSC schema to populate the contract.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="console-cell p-5">
          <p className="text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>3. Verify one customer anchor</p>
          <p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
            Enter an FSC Account ID. Names and profile fields are not returned.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={accountId}
              onChange={(event) => {
                setAccountId(event.target.value.trim());
                setAccount(null);
                setDelivery(null);
              }}
              disabled={!schema?.requiredMappingsReady}
              placeholder="15- or 18-character Account ID"
              className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2.5 text-[12px] outline-none focus:ring-2"
              style={{ borderColor: "var(--v2-rule)" }}
              aria-label="Salesforce Account ID"
            />
            <button
              onClick={() => void verifyAccount()}
              disabled={!schema?.requiredMappingsReady || verifying || accountId.length < 15}
              className="console-btn !px-4 !py-2 !text-[12px]"
            >
              {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              Verify
            </button>
          </div>
          {account?.verified && (
            <div className="mt-4 flex items-center justify-between rounded-md border px-3 py-3" style={{ borderColor: "var(--v2-rule)" }}>
              <div>
                <p className="text-[12px] font-bold" style={{ color: "var(--v2-ink)" }}>Account anchor verified</p>
                <p className="v2-mono mt-1 text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>
                  ••••{account.id?.slice(-6)} · {account.personAccount ? "person account" : "business/household account"}
                </p>
              </div>
              <Check className="h-4 w-4" style={{ color: "var(--v2-verified)" }} />
            </div>
          )}
        </section>

        <section className="console-cell p-5">
          <p className="text-[14px] font-bold" style={{ color: "var(--v2-ink)" }}>4. Leave a governed proof</p>
          <p className="mt-1 text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
            Creates one Decision Receipt and one Account-linked Task in the sandbox.
          </p>
          {!delivery ? (
            <button
              onClick={() => void createProof()}
              disabled={!account?.verified || delivering}
              className="console-btn mt-4 w-full justify-center !py-2.5 !text-[12px]"
            >
              {delivering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Create sandbox proof
            </button>
          ) : (
            <div className="mt-4 space-y-2">
              {[
                ["Decision Receipt", delivery.records?.decision],
                ["Employee Task", delivery.records?.task],
              ].map(([label, record]) => {
                const text = String(label);
                const typed = record as { id: string; url: string } | null | undefined;
                return (
                  <a
                    key={String(label)}
                    href={typed?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-md border px-3 py-3 transition hover:bg-[#f7f6f2]"
                    style={{ borderColor: "var(--v2-rule)", pointerEvents: typed ? "auto" : "none", opacity: typed ? 1 : 0.55 }}
                  >
                    <span>
                      <span className="block text-[12px] font-bold" style={{ color: "var(--v2-ink)" }}>{text}</span>
                      <span className="v2-mono mt-0.5 block text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>{typed?.id ?? "not created"}</span>
                    </span>
                    {typed && <ArrowUpRight className="h-4 w-4" style={{ color: "var(--v2-ink-faint)" }} />}
                  </a>
                );
              })}
            </div>
          )}
          {delivery?.warnings?.map((warning) => (
            <p key={`${warning.stage}:${warning.message}`} className="mt-2 text-[10px] text-amber-800">
              {warning.stage}: {warning.message}
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}

async function onboardingRequest<T>(
  token: string | undefined,
  body: Record<string, unknown>,
): Promise<T> {
  if (!token) throw new Error("Start a scoped connector session first.");
  const response = await fetch(connectorApiUrl("salesforce-onboarding"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `FSC onboarding failed (${response.status})`);
  return data;
}

function message(cause: unknown): string {
  return cause instanceof Error ? cause.message : "FSC onboarding failed";
}
