import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { afterEach } from "node:test";
import {
  authorizeControlPlane,
  issueControlPlaneSession,
  verifyControlPlaneSession,
} from "./_controlPlaneAuth.ts";
import { POST as issueSession } from "./control-plane-session.ts";
import { createGrowthPlayProtocolHandler } from "./growth-play-protocols.ts";
import { createInMemoryGrowthPlayRegistry } from "../backend/shared/pilot/growth-play-registry.mjs";

const SECRET = "control-plane-session-test-secret-32-characters";
const NOW_SECONDS = Math.floor(Date.now() / 1000);
const NOW_ISO = new Date(NOW_SECONDS * 1000).toISOString();
const drafts = JSON.parse(readFileSync(
  new URL("../backend/fixtures/evaluation/growth-play-drafts.json", import.meta.url),
  "utf8",
));
const depositDraft = drafts.find((item: { growth_play_id?: string }) => item.growth_play_id === "deposit-primacy-defense");
const managedVariables = [
  "ENABLE_GROWTH_PLAY_CONTROL_PLANE",
  "VENTUS_CONTROL_PLANE_SESSION_SECRET",
  "VENTUS_CONTROL_PLANE_ISSUER_TOKEN",
  "VENTUS_CONNECTOR_SESSION_SECRET",
  "VERCEL_ENV",
] as const;
const originalEnvironment = Object.fromEntries(managedVariables.map((name) => [name, process.env[name]]));

afterEach(() => {
  for (const name of managedVariables) {
    const original = originalEnvironment[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

test("control-plane sessions are tenant, role, business-line, identity, and lifetime bound", () => {
  const token = controlToken({
    subject: "consumer_owner_1",
    roles: ["business_line_owner"],
    businessLines: ["consumer-banking"],
    sessionId: "control_session_001",
  });
  const principal = verifyControlPlaneSession(token, SECRET, NOW_SECONDS + 1);
  assert.equal(principal?.tenantId, "bank_1");
  assert.equal(principal?.subject, "consumer_owner_1");
  assert.equal(principal?.identityProvider, "bank_sso");
  assert.equal(authorizeWith(token, { role: "business_line_owner", businessLine: "consumer-banking" })?.sessionId, "control_session_001");
  assert.equal(authorizeWith(token, { role: "protocol_configurator" }), null);
  assert.equal(authorizeWith(token, { businessLine: "wealth-management" }), null);
  assert.equal(verifyControlPlaneSession(token, SECRET, NOW_SECONDS + 301), null);
});

test("connector sessions cannot authorize the control plane and there is no legacy or local fallback", () => {
  process.env.VENTUS_CONTROL_PLANE_SESSION_SECRET = SECRET;
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = "connector-session-test-secret-32-characters";
  const connectorShaped = "eyJhbGciOiJIUzI1NiIsInR5cCI6IlZDUzEifQ.e30.invalid";
  assert.equal(authorizeControlPlane(bearerRequest(connectorShaped)), null);
  assert.equal(authorizeControlPlane(new Request("http://local", { headers: { "x-ventus-client": "web-app" } })), null);
});

test("identity-bound configurator and business owner can register then approve a Consumer protocol", async () => {
  enableControlPlane();
  const registry = createInMemoryGrowthPlayRegistry();
  const handle = createGrowthPlayProtocolHandler({ registry, now: () => NOW_ISO });
  const configurator = controlToken({
    subject: "consumer_configurator_1",
    roles: ["protocol_configurator"],
    businessLines: ["consumer-banking"],
    sessionId: "control_config_001",
  });
  const owner = controlToken({
    subject: "consumer_owner_1",
    roles: ["business_line_owner"],
    businessLines: ["consumer-banking"],
    sessionId: "control_approve_001",
  });

  const registration = await handle(jsonRequest(configurator, { operation: "register", draft: depositDraft }));
  assert.equal(registration.status, 201);
  const registered = await registration.json() as { decisionProtocolId: string };
  const approval = await handle(jsonRequest(owner, {
    operation: "approve",
    decisionProtocolId: registered.decisionProtocolId,
    businessLine: "consumer-banking",
    changeRecordId: "pilot_change_001",
    reason: "Consumer Banking owner approved this protocol for sandbox-assisted evaluation.",
  }));
  assert.equal(approval.status, 201);
  const receipt = await registry.requireApproved({
    tenantId: "bank_1",
    decisionProtocolId: registered.decisionProtocolId,
    businessLine: "consumer-banking",
    at: new Date((NOW_SECONDS + 60) * 1000).toISOString(),
  });
  assert.equal(receipt.decidedBy, "consumer_owner_1");
  assert.equal(receipt.decidedBySessionId, "control_approve_001");
  assert.equal(receipt.identityProvider, "bank_sso");
});

test("wrong business line, wrong role, and self-approval all fail closed", async () => {
  enableControlPlane();
  const registry = createInMemoryGrowthPlayRegistry();
  const handle = createGrowthPlayProtocolHandler({ registry, now: () => NOW_ISO });
  const dualRole = controlToken({
    subject: "dual_role_user",
    roles: ["protocol_configurator", "business_line_owner"],
    businessLines: ["consumer-banking"],
    sessionId: "control_dual_001",
  });
  const wealthOwner = controlToken({
    subject: "wealth_owner_1",
    roles: ["business_line_owner"],
    businessLines: ["wealth-management"],
    sessionId: "control_wealth_001",
  });
  const registration = await handle(jsonRequest(dualRole, { operation: "register", draft: depositDraft }));
  const registered = await registration.json() as { decisionProtocolId: string };
  const decision = {
    operation: "approve",
    decisionProtocolId: registered.decisionProtocolId,
    businessLine: "consumer-banking",
    changeRecordId: "pilot_change_002",
    reason: "Approval attempt used to verify separation of duties.",
  };
  assert.equal((await handle(jsonRequest(wealthOwner, decision))).status, 403);
  const selfApproval = await handle(jsonRequest(dualRole, decision));
  assert.equal(selfApproval.status, 403);
  assert.match((await selfApproval.json() as { error: string }).error, /different subjects/);
});

test("static non-production issuer is disabled in production", async () => {
  enableControlPlane();
  process.env.VENTUS_CONTROL_PLANE_ISSUER_TOKEN = "issuer-secret";
  process.env.VERCEL_ENV = "production";
  const response = await issueSession(new Request("http://local/api/control-plane-session", {
    method: "POST",
    headers: { Authorization: "Bearer issuer-secret", "Content-Type": "application/json" },
    body: JSON.stringify({
      tenantId: "bank_1", subject: "owner_1", roles: ["business_line_owner"],
      businessLines: ["consumer-banking"], identityProvider: "bank_sso",
    }),
  }));
  assert.equal(response.status, 403);
});

function controlToken({ subject, roles, businessLines, sessionId }: {
  subject: string;
  roles: string[];
  businessLines: string[];
  sessionId: string;
}): string {
  return issueControlPlaneSession({
    secret: SECRET,
    tenantId: "bank_1",
    subject,
    roles,
    businessLines,
    sessionId,
    identityProvider: "bank_sso",
    authenticatedAt: NOW_SECONDS - 60,
    now: NOW_SECONDS,
    ttlSeconds: 300,
  });
}

function authorizeWith(token: string, requirements: { role?: string; businessLine?: string }) {
  process.env.VENTUS_CONTROL_PLANE_SESSION_SECRET = SECRET;
  return authorizeControlPlane(bearerRequest(token), requirements);
}

function enableControlPlane(): void {
  process.env.ENABLE_GROWTH_PLAY_CONTROL_PLANE = "true";
  process.env.VENTUS_CONTROL_PLANE_SESSION_SECRET = SECRET;
}

function bearerRequest(token: string): Request {
  return new Request("http://local/api/growth-play-protocols", { headers: { Authorization: `Bearer ${token}` } });
}

function jsonRequest(token: string, body: Record<string, unknown>): Request {
  return new Request("http://local/api/growth-play-protocols", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
