declare const process: { env: Record<string, string | undefined> };
import { authorizeConnector } from "./_connectorAuth.js";
import { configuredRuntime } from "./standalone-pilot-run.js";

export const maxDuration = 30;

const ALLOWED_BODY_KEYS = new Set(["decisionId", "businessLine", "decision"]);

class PilotActivationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PilotActivationError";
  }
}

type OperatingLoop = {
  activatePreparedDecision(input: Record<string, unknown>): Promise<Record<string, unknown>>;
};

export function createStandalonePilotActivationHandler({
  operatingLoop,
  now = () => new Date().toISOString(),
}: {
  operatingLoop: OperatingLoop;
  now?: () => string;
}) {
  return async function handle(request: Request): Promise<Response> {
    const scoped = authorizeConnector(request, { scope: "growth_play_activate" });
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
      const principal = authorizeConnector(request, {
        scope: "growth_play_activate",
        destination: businessLine,
      });
      if (!principal || principal.authMode !== "session") return Response.json({ error: "forbidden" }, { status: 403 });
      const decisionId = requiredId(body.decisionId, "decisionId");
      if (!body.decision || typeof body.decision !== "object" || Array.isArray(body.decision)) {
        throw new PilotActivationError("decision is required");
      }
      const activatedAt = now();
      if (Number.isNaN(Date.parse(activatedAt))) throw new Error("server clock returned an invalid timestamp");
      const result = await operatingLoop.activatePreparedDecision({
        tenantId: principal.tenantId,
        decisionId,
        sessionId: principal.sessionId,
        activatedAt,
        decision: body.decision,
      });
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
      if (error instanceof PilotActivationError || code === "ERR_ASSERTION") {
        return Response.json({ error: message.slice(0, 300) }, { status: 400 });
      }
      return Response.json({ error: "standalone pilot activation unavailable" }, { status: 503 });
    }
  };
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
  if (!runtime.deliveryConfigured) {
    return Response.json({ error: "standalone pilot delivery is not configured" }, { status: 503 });
  }
  return createStandalonePilotActivationHandler(runtime)(request);
}

function requiredId(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{1,255}$/.test(value)) {
    throw new PilotActivationError(`${label} is invalid`);
  }
  return value;
}
