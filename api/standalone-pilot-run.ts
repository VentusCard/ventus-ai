declare const process: { env: Record<string, string | undefined> };
import { authorizeConnector } from "./_connectorAuth.js";

export const maxDuration = 30;
const ALLOWED_BODY_KEYS = new Set([
  "decisionProtocolId", "businessLine", "caseId", "householdToken", "activationMode",
  "records", "sourceReceipt", "eligibilityReceipt", "policyVersion", "policies",
]);

class PilotRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PilotRequestError";
  }
}

type ProtocolRegistry = {
  requireApproved(input: {
    tenantId: string;
    decisionProtocolId: string;
    businessLine: string;
    at: string;
  }): Promise<{ contract: Record<string, unknown> }>;
};

type OperatingLoop = {
  runHousehold(input: Record<string, unknown>): Promise<Record<string, unknown>>;
};

export function createStandalonePilotHandler({
  protocolRegistry,
  operatingLoop,
  assignmentSalt,
  now = () => new Date().toISOString(),
}: {
  protocolRegistry: ProtocolRegistry;
  operatingLoop: OperatingLoop;
  assignmentSalt: string;
  now?: () => string;
}) {
  if (typeof assignmentSalt !== "string" || assignmentSalt.length < 16) {
    throw new Error("assignmentSalt must be at least 16 characters");
  }
  return async function handle(request: Request): Promise<Response> {
    const scoped = authorizeConnector(request, { scope: "growth_play_run" });
    if (!scoped || scoped.authMode !== "session") return Response.json({ error: "forbidden" }, { status: 403 });

    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch {
      return Response.json({ error: "invalid JSON" }, { status: 400 });
    }
    for (const key of Object.keys(body)) {
      if (!ALLOWED_BODY_KEYS.has(key)) return Response.json({ error: `unknown field ${key}` }, { status: 400 });
    }
    try {
      const businessLine = requiredId(body.businessLine, "businessLine");
      const principal = authorizeConnector(request, { scope: "growth_play_run", destination: businessLine });
      if (!principal || principal.authMode !== "session") return Response.json({ error: "forbidden" }, { status: 403 });
      const decisionProtocolId = requiredId(body.decisionProtocolId, "decisionProtocolId");
      const caseId = requiredId(body.caseId, "caseId");
      const householdToken = typeof body.householdToken === "string" ? body.householdToken : "";
      const activationMode = body.activationMode;
      if (activationMode !== "shadow" && activationMode !== "sandbox_review" && activationMode !== "sandbox_assisted") {
        throw new PilotRequestError("activationMode must be shadow, sandbox_review, or sandbox_assisted");
      }
      const assignedAt = now();
      if (Number.isNaN(Date.parse(assignedAt))) throw new Error("server clock returned an invalid timestamp");
      const runAt = new Date(Date.parse(assignedAt) + 1).toISOString();
      const approved = await protocolRegistry.requireApproved({
        tenantId: principal.tenantId,
        decisionProtocolId,
        businessLine,
        at: assignedAt,
      });
      const growthPlay = approved.contract as Record<string, unknown>;
      const input: Record<string, unknown> = {
        growthPlay,
        tenantId: principal.tenantId,
        caseId,
        householdToken,
        objective: growthPlay.objective,
        runAt,
        activationMode,
        destinationEnvironment: "sandbox",
        sessionId: principal.sessionId,
        records: body.records,
        sourceReceipt: body.sourceReceipt,
        eligibilityReceipt: body.eligibilityReceipt,
        policyVersion: body.policyVersion,
        policies: body.policies,
      };
      if (activationMode === "sandbox_review" || activationMode === "sandbox_assisted") {
        input.experiment = {
          experimentId: `exp_${decisionProtocolId.replace(/^dcp_/, "")}`,
          holdoutPct: (growthPlay.measurement as { holdout_pct?: unknown })?.holdout_pct,
          assignmentSalt,
          assignedAt,
        };
      }
      const result = await operatingLoop.runHousehold(input);
      return Response.json({
        ...result,
        authorization: {
          tenantId: principal.tenantId,
          sessionId: principal.sessionId,
          businessLine,
          mode: principal.authMode,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const code = error && typeof error === "object" && "code" in error ? error.code : null;
      if (error instanceof PilotRequestError || code === "ERR_ASSERTION") {
        return Response.json({ error: message.slice(0, 300) }, { status: 400 });
      }
      return Response.json({ error: "standalone pilot runtime unavailable" }, { status: 503 });
    }
  };
}

export function createPilotWebhookDelivery({
  url,
  bearer,
  fetchImpl = fetch,
}: {
  url: string;
  bearer: string;
  fetchImpl?: typeof fetch;
}) {
  const endpoint = new URL(url);
  if (endpoint.protocol !== "https:") throw new Error("pilot delivery webhook must use HTTPS");
  if (typeof bearer !== "string" || bearer.length < 16) throw new Error("pilot delivery bearer is invalid");
  return async function deliver({ input, decision }: { input: Record<string, unknown>; decision: Record<string, unknown> }) {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: input.tenantId,
        case_id: input.caseId,
        decision_id: decision.decisionId,
        growth_play_id: decision.growthPlayId,
        action_id: decision.actionId,
        owner_role: decision.ownerRole,
        connector: decision.connector,
        destination: decision.destination,
        payload: decision.deliveryPayload,
      }),
    });
    const completedAt = new Date().toISOString();
    if (!response.ok) {
      return { status: "failed", errorCode: `destination_http_${response.status}`, completedAt };
    }
    const receipt = await response.json() as { receipt_id?: unknown; receipt_url?: unknown };
    if (typeof receipt.receipt_id !== "string" || receipt.receipt_id.length < 2) {
      return { status: "failed", errorCode: "destination_receipt_missing", completedAt };
    }
    return {
      status: "delivered",
      externalReceiptId: receipt.receipt_id,
      externalReceiptUrl: typeof receipt.receipt_url === "string" ? receipt.receipt_url : null,
      completedAt,
    };
  };
}

let runtimeRoleVerification: Promise<unknown> | null = null;

export async function configuredRuntime() {
  const connectionString = (process.env.VENTUS_DATABASE_URL || process.env.DATABASE_URL || "").trim();
  const assignmentSalt = process.env.VENTUS_EXPERIMENT_ASSIGNMENT_SALT?.trim();
  const deliveryUrl = process.env.VENTUS_PILOT_DELIVERY_WEBHOOK_URL?.trim();
  const deliveryBearer = process.env.VENTUS_PILOT_DELIVERY_BEARER?.trim();
  if (!connectionString || !assignmentSalt) return null;

  const [dbModule, ledgerModule, measurementModule, deliveryModule, registryModule, loopModule, detectorModule] = await Promise.all([
    import("../backend/shared/platform/db-url.mjs"),
    import("../backend/shared/pilot/decision-ledger.mjs"),
    import("../backend/shared/pilot/experiment-measurement.mjs"),
    import("../backend/shared/pilot/connector-delivery.mjs"),
    import("../backend/shared/pilot/growth-play-registry.mjs"),
    import("../backend/shared/pilot/pilot-operating-loop.mjs"),
    import("../backend/shared/pilot/standalone-growth-play-detectors.mjs"),
  ]);
  const getDB = dbModule.createUrlDbFactory({ connectionString });
  runtimeRoleVerification ??= dbModule.assertNonBypassRole(getDB);
  await runtimeRoleVerification;
  const protocolRegistry = registryModule.createGrowthPlayRegistry({ getDB });
  const deliver = deliveryUrl && deliveryBearer
    ? createPilotWebhookDelivery({ url: deliveryUrl, bearer: deliveryBearer })
    : async () => { throw new Error("sandbox-assisted delivery is not configured"); };
  const operatingLoop = loopModule.createPilotOperatingLoop({
    detector: detectorModule.standaloneGrowthPlayDetector,
    protocolRegistry,
    ledgerRepository: ledgerModule.createDecisionLedgerRepository({ getDB }),
    measurementRepository: measurementModule.createMeasurementRepository({ getDB }),
    deliveryRepository: deliveryModule.createConnectorDeliveryRepository({ getDB }),
    deliver,
  });
  return { protocolRegistry, operatingLoop, assignmentSalt, deliveryConfigured: Boolean(deliveryUrl && deliveryBearer) };
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.ENABLE_STANDALONE_PILOT_RUNTIME !== "true") {
    return Response.json({ error: "standalone pilot runtime disabled" }, { status: 404 });
  }
  let runtime;
  try {
    runtime = await configuredRuntime();
  } catch {
    return Response.json({ error: "standalone pilot runtime unavailable" }, { status: 503 });
  }
  if (!runtime) return Response.json({ error: "standalone pilot runtime persistence is not configured" }, { status: 503 });
  const cloned = request.clone();
  let activationMode: unknown;
  try {
    activationMode = (await cloned.json() as { activationMode?: unknown }).activationMode;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (activationMode === "sandbox_assisted" && !runtime.deliveryConfigured) {
    return Response.json({ error: "sandbox-assisted delivery is not configured" }, { status: 503 });
  }
  return createStandalonePilotHandler(runtime)(request);
}

function requiredId(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{1,255}$/.test(value)) {
    throw new PilotRequestError(`${label} is invalid`);
  }
  return value;
}
