declare const process: { env: Record<string, string | undefined> };
import {
  authorizeControlPlane,
  controlPlaneDisabledResponse,
  controlPlaneEnabled,
  controlPrincipalAllowed,
  type ControlPlanePrincipal,
} from "./_controlPlaneAuth.js";
import { compileGrowthPlayContract } from "../backend/shared/pilot/growth-play-contract.mjs";
import { createGrowthPlayRegistry } from "../backend/shared/pilot/growth-play-registry.mjs";

export const maxDuration = 15;
type Registry = ReturnType<typeof createGrowthPlayRegistry>;

export function createGrowthPlayProtocolHandler({
  registry,
  now = () => new Date().toISOString(),
}: {
  registry: Registry;
  now?: () => string;
}) {
  return async function handle(request: Request): Promise<Response> {
    if (!controlPlaneEnabled()) return controlPlaneDisabledResponse();
    const principal = authorizeControlPlane(request);
    if (!principal) return Response.json({ error: "forbidden" }, { status: 403 });

    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch {
      return Response.json({ error: "invalid JSON" }, { status: 400 });
    }
    try {
      if (body.operation === "register") return await registerProtocol(registry, principal, body, now());
      if (body.operation === "approve" || body.operation === "revoke") {
        return await decideProtocol(registry, principal, body, now());
      }
      return Response.json({ error: "operation must be register, approve, or revoke" }, { status: 400 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const forbidden = /requires role|business-line entitlement|different subjects/.test(message);
      return Response.json({ error: message.slice(0, 300) }, { status: forbidden ? 403 : 400 });
    }
  };
}

async function registerProtocol(
  registry: Registry,
  principal: ControlPlanePrincipal,
  body: Record<string, unknown>,
  occurredAt: string,
): Promise<Response> {
  const contract = compileGrowthPlayContract(body.draft);
  requireEntitlement(principal, "protocol_configurator", contract.business_line);
  const result = await registry.register({
    tenantId: principal.tenantId,
    contract,
    registeredBy: principal.subject,
    registeredBySessionId: principal.sessionId,
    identityProvider: principal.identityProvider,
    registeredAt: occurredAt,
  });
  const record = result.record as Record<string, unknown>;
  return Response.json({
    operation: "register",
    inserted: result.inserted,
    tenantId: principal.tenantId,
    growthPlayId: contract.growth_play_id,
    businessLine: contract.business_line,
    decisionProtocolId: contract.decision_protocol_id,
    protocolDigest: contract.protocol_digest,
    registeredBy: record.registered_by ?? record.registeredBy,
    registeredBySessionId: record.registered_by_session_id ?? record.registeredBySessionId,
    identityProvider: record.identity_provider ?? record.identityProvider,
    registeredAt: record.registered_at ?? record.registeredAt,
  }, { status: result.inserted ? 201 : 200 });
}

async function decideProtocol(
  registry: Registry,
  principal: ControlPlanePrincipal,
  body: Record<string, unknown>,
  occurredAt: string,
): Promise<Response> {
  const decisionProtocolId = requiredId(body.decisionProtocolId, "decisionProtocolId");
  const businessLine = requiredId(body.businessLine, "businessLine");
  const changeRecordId = requiredId(body.changeRecordId, "changeRecordId");
  const reason = typeof body.reason === "string" ? body.reason : "";
  requireEntitlement(principal, "business_line_owner", businessLine);
  const decision = body.operation === "approve" ? "approved" : "revoked";
  const result = await registry.recordApproval({
    tenantId: principal.tenantId,
    decisionProtocolId,
    businessLine,
    decision,
    decidedBy: principal.subject,
    decidedBySessionId: principal.sessionId,
    identityProvider: principal.identityProvider,
    decidedAt: occurredAt,
    changeRecordId,
    reason,
  });
  const record = result.record as Record<string, unknown>;
  return Response.json({
    operation: body.operation,
    inserted: result.inserted,
    tenantId: principal.tenantId,
    businessLine,
    decisionProtocolId,
    approvalEventId: record.approval_event_id ?? record.approvalEventId,
    decidedBy: principal.subject,
    decidedAt: occurredAt,
    changeRecordId,
  }, { status: result.inserted ? 201 : 200 });
}

function requireEntitlement(principal: ControlPlanePrincipal, role: string, businessLine: string): void {
  if (!controlPrincipalAllowed(principal, { role })) throw new Error(`operation requires role ${role}`);
  if (!controlPrincipalAllowed(principal, { businessLine })) throw new Error(`operation requires business-line entitlement ${businessLine}`);
}

function requiredId(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{1,255}$/.test(value)) {
    throw new Error(`${label} is invalid`);
  }
  return value;
}

async function configuredRegistry(): Promise<Registry | null> {
  const connectionString = process.env.VENTUS_PROTOCOL_ADMIN_DATABASE_URL?.trim();
  if (!connectionString) return null;
  const { createUrlDbFactory } = await import("../backend/shared/platform/db-url.mjs");
  return createGrowthPlayRegistry({ getDB: createUrlDbFactory({ connectionString }) });
}

export async function POST(request: Request): Promise<Response> {
  if (!controlPlaneEnabled()) return controlPlaneDisabledResponse();
  const registry = await configuredRegistry();
  if (!registry) return Response.json({ error: "Growth Play protocol store is not configured" }, { status: 503 });
  return createGrowthPlayProtocolHandler({ registry })(request);
}
