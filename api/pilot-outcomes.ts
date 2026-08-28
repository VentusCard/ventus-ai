declare const process: { env: Record<string, string | undefined> };
import { authorizeConnector } from "./_connectorAuth.js";

export const maxDuration = 30;
const RECORD_KEYS = new Set([
  "operation", "decisionProtocolId", "businessLine", "eventId", "householdToken",
  "eventType", "occurredAt", "value", "sourceSystem", "sourceRecordId", "reasonCode",
]);
const MEASURE_KEYS = new Set(["operation", "decisionProtocolId", "businessLine"]);

class OutcomeRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OutcomeRequestError";
  }
}

type Assignment = {
  assignmentId: string;
  tenantId: string;
  experimentId: string;
  householdToken: string;
  arm: string;
  design?: string;
  evidenceClass: string;
  assignedAt: string;
  decisionProtocolId?: string | null;
};

type MeasurementRepository = {
  loadExperiment(input: { tenantId: string; experimentId: string }): Promise<{
    assignments: Assignment[];
    outcomes: Record<string, unknown>[];
  }>;
};

type ProtocolRegistry = {
  requireApproved(input: {
    tenantId: string;
    decisionProtocolId: string;
    businessLine: string;
    at: string;
  }): Promise<{ contract: Record<string, unknown> }>;
};

type LedgerRepository = {
  loadOutcomeContext(input: {
    tenantId: string;
    experimentId: string;
    householdToken: string;
  }): Promise<{
    growthPlayId: string;
    decisionId: string;
    assignmentId: string;
    arm: string;
    decisionProtocolId: string;
    activationId: string | null;
  }>;
};

type OperatingLoop = {
  recordOutcome(event: Record<string, unknown>, contract: Record<string, unknown>): Promise<Record<string, unknown>>;
  measureExperiment(input: {
    tenantId: string;
    experimentId: string;
    growthPlay: Record<string, unknown>;
  }): Promise<Record<string, unknown>>;
};

export function createPilotOutcomeHandler({
  protocolRegistry,
  measurementRepository,
  ledgerRepository,
  operatingLoop,
}: {
  protocolRegistry: ProtocolRegistry;
  measurementRepository: MeasurementRepository;
  ledgerRepository: LedgerRepository;
  operatingLoop: OperatingLoop;
}) {
  return async function handle(request: Request): Promise<Response> {
    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch {
      return Response.json({ error: "invalid JSON" }, { status: 400 });
    }
    try {
      if (body.operation !== "record" && body.operation !== "measure") {
        throw new OutcomeRequestError("operation must be record or measure");
      }
      assertExactKeys(body, body.operation === "record" ? RECORD_KEYS : MEASURE_KEYS);
      const businessLine = requiredId(body.businessLine, "businessLine");
      const scope = body.operation === "record" ? "growth_play_outcome_write" : "growth_play_measure_read";
      const principal = authorizeConnector(request, { scope, destination: businessLine });
      if (!principal || principal.authMode !== "session") return Response.json({ error: "forbidden" }, { status: 403 });
      const decisionProtocolId = requiredId(body.decisionProtocolId, "decisionProtocolId");
      const experimentId = `exp_${decisionProtocolId.replace(/^dcp_/, "")}`;
      const loaded = await measurementRepository.loadExperiment({ tenantId: principal.tenantId, experimentId });
      if (!loaded.assignments.length) throw new OutcomeRequestError("experiment has no persisted assignments");
      for (const assignment of loaded.assignments) {
        if (assignment.design && assignment.design !== "binary") throw new OutcomeRequestError("standalone outcome endpoint accepts only binary assignments");
        if (assignment.decisionProtocolId !== decisionProtocolId) throw new OutcomeRequestError("assignment decision protocol does not match the requested protocol");
      }

      if (body.operation === "measure") {
        const approvedAtAssignment = await protocolRegistry.requireApproved({
          tenantId: principal.tenantId,
          decisionProtocolId,
          businessLine,
          at: earliestAssignment(loaded.assignments).assignedAt,
        });
        const measurement = await operatingLoop.measureExperiment({
          tenantId: principal.tenantId,
          experimentId,
          growthPlay: approvedAtAssignment.contract,
        });
        return Response.json({
          ...measurement,
          authorization: { tenantId: principal.tenantId, sessionId: principal.sessionId, businessLine, mode: principal.authMode },
        });
      }

      const householdToken = typeof body.householdToken === "string" ? body.householdToken : "";
      const assignment = loaded.assignments.find((item) => item.householdToken === householdToken);
      if (!assignment) throw new OutcomeRequestError("outcome household has no persisted assignment");
      const approvedAtAssignment = await protocolRegistry.requireApproved({
        tenantId: principal.tenantId,
        decisionProtocolId,
        businessLine,
        at: assignment.assignedAt,
      });
      const context = await ledgerRepository.loadOutcomeContext({
        tenantId: principal.tenantId,
        experimentId,
        householdToken,
      });
      assertContextMatches(context, assignment, approvedAtAssignment.contract, decisionProtocolId);
      const event = {
        contract_version: "1.0",
        event_id: requiredId(body.eventId, "eventId"),
        tenant_id: principal.tenantId,
        household_token: householdToken,
        growth_play_id: context.growthPlayId,
        decision_id: context.decisionId,
        activation_id: context.activationId,
        event_type: requiredId(body.eventType, "eventType"),
        occurred_at: requiredDate(body.occurredAt, "occurredAt"),
        assignment: {
          experiment_id: assignment.experimentId,
          arm: assignment.arm,
          assigned_at: assignment.assignedAt,
          decision_protocol_id: decisionProtocolId,
        },
        value: validatedValue(body.value),
        source_system: requiredId(body.sourceSystem, "sourceSystem"),
        source_record_id: nullableId(body.sourceRecordId, "sourceRecordId"),
        reason_code: nullableId(body.reasonCode, "reasonCode"),
      };
      const recorded = await operatingLoop.recordOutcome(event, approvedAtAssignment.contract);
      return Response.json({
        inserted: recorded.inserted,
        eventId: event.event_id,
        tenantId: principal.tenantId,
        householdToken,
        growthPlayId: context.growthPlayId,
        decisionId: context.decisionId,
        activationId: context.activationId,
        experimentId,
        arm: assignment.arm,
        evidenceClass: recorded.evidenceClass,
        businessClaimAllowed: false,
        causalClaimAllowed: false,
        authorization: { tenantId: principal.tenantId, sessionId: principal.sessionId, businessLine, mode: principal.authMode },
      }, { status: recorded.inserted ? 201 : 200 });
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : null;
      if (error instanceof OutcomeRequestError || code === "ERR_ASSERTION") {
        const message = error instanceof Error ? error.message : String(error);
        return Response.json({ error: message.slice(0, 300) }, { status: 400 });
      }
      return Response.json({ error: "pilot outcome service unavailable" }, { status: 503 });
    }
  };
}

function assertContextMatches(
  context: Awaited<ReturnType<LedgerRepository["loadOutcomeContext"]>>,
  assignment: Assignment,
  contract: Record<string, unknown>,
  decisionProtocolId: string,
): void {
  if (context.assignmentId !== assignment.assignmentId) throw new OutcomeRequestError("ledger assignment ID does not match measurement assignment");
  if (context.arm !== assignment.arm) throw new OutcomeRequestError("ledger arm does not match measurement assignment");
  if (context.decisionProtocolId !== decisionProtocolId) throw new OutcomeRequestError("ledger decision protocol does not match measurement assignment");
  if (context.growthPlayId !== contract.growth_play_id) throw new OutcomeRequestError("ledger Growth Play does not match approved protocol");
}

function earliestAssignment(assignments: Assignment[]): Assignment {
  return [...assignments].sort((left, right) => left.assignedAt.localeCompare(right.assignedAt))[0];
}

function assertExactKeys(body: Record<string, unknown>, allowed: Set<string>): void {
  for (const key of Object.keys(body)) if (!allowed.has(key)) throw new OutcomeRequestError(`unknown field ${key}`);
}

function requiredId(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{1,255}$/.test(value)) {
    throw new OutcomeRequestError(`${label} is invalid`);
  }
  return value;
}

function nullableId(value: unknown, label: string): string | null {
  if (value === null || value === undefined) return null;
  return requiredId(value, label);
}

function requiredDate(value: unknown, label: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) throw new OutcomeRequestError(`${label} must be ISO date-time`);
  return new Date(value).toISOString();
}

function validatedValue(value: unknown): { metric: string; amount: number; currency: "USD" } | null {
  if (value === null || value === undefined) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new OutcomeRequestError("value must be an object or null");
  const record = value as Record<string, unknown>;
  const allowed = new Set(["metric", "amount", "currency"]);
  for (const key of Object.keys(record)) if (!allowed.has(key)) throw new OutcomeRequestError(`value contains unknown field ${key}`);
  if (typeof record.metric !== "string" || typeof record.amount !== "number" || !Number.isFinite(record.amount) || record.currency !== "USD") {
    throw new OutcomeRequestError("value requires metric, finite amount, and USD currency");
  }
  return { metric: record.metric, amount: record.amount, currency: "USD" };
}

let runtimeRoleVerification: Promise<unknown> | null = null;

async function configuredOutcomeService() {
  const connectionString = (process.env.VENTUS_DATABASE_URL || process.env.DATABASE_URL || "").trim();
  if (!connectionString) return null;
  const [dbModule, ledgerModule, measurementModule, registryModule, loopModule, detectorModule] = await Promise.all([
    import("../backend/shared/platform/db-url.mjs"),
    import("../backend/shared/pilot/decision-ledger.mjs"),
    import("../backend/shared/pilot/experiment-measurement.mjs"),
    import("../backend/shared/pilot/growth-play-registry.mjs"),
    import("../backend/shared/pilot/pilot-operating-loop.mjs"),
    import("../backend/shared/pilot/standalone-growth-play-detectors.mjs"),
  ]);
  const getDB = dbModule.createUrlDbFactory({ connectionString });
  runtimeRoleVerification ??= dbModule.assertNonBypassRole(getDB);
  await runtimeRoleVerification;
  const protocolRegistry = registryModule.createGrowthPlayRegistry({ getDB });
  const measurementRepository = measurementModule.createMeasurementRepository({ getDB });
  const ledgerRepository = ledgerModule.createDecisionLedgerRepository({ getDB });
  const unavailableDelivery = {
    async reserve() { throw new Error("outcome service cannot deliver"); },
    async complete() { throw new Error("outcome service cannot deliver"); },
  };
  const operatingLoop = loopModule.createPilotOperatingLoop({
    detector: detectorModule.standaloneGrowthPlayDetector,
    protocolRegistry,
    ledgerRepository,
    measurementRepository,
    deliveryRepository: unavailableDelivery,
    async deliver() { throw new Error("outcome service cannot deliver"); },
  });
  return { protocolRegistry, measurementRepository, ledgerRepository, operatingLoop };
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.ENABLE_STANDALONE_PILOT_RUNTIME !== "true") {
    return Response.json({ error: "standalone pilot runtime disabled" }, { status: 404 });
  }
  try {
    const service = await configuredOutcomeService();
    if (!service) return Response.json({ error: "pilot outcome persistence is not configured" }, { status: 503 });
    return createPilotOutcomeHandler(service)(request);
  } catch {
    return Response.json({ error: "pilot outcome service unavailable" }, { status: 503 });
  }
}
