import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { createDecisionLedgerRepository, verifyLedgerChain } from './shared/decision-ledger.mjs';
import {
  assignConnectedExpansionExperiment,
  createMeasurementRepository,
} from './shared/experiment-measurement.mjs';
import {
  APPLY_EVIDENCE_SCHEMA_CONFIRMATION,
  EVIDENCE_STORE_MIGRATIONS,
  checkedPgIdentifier,
  quotePgIdentifier,
  quotePgLiteral,
} from './migration-safety.mjs';

const APPLY_CONFIRMATION = APPLY_EVIDENCE_SCHEMA_CONFIRMATION;
const MIGRATIONS = EVIDENCE_STORE_MIGRATIONS;
const here = dirname(fileURLToPath(import.meta.url));
const region = process.env.AWS_REGION || 'us-east-2';
const adminSecretId = process.env.RDS_SECRET_ID;
const runtimeSecretId = process.env.EVIDENCE_RUNTIME_SECRET_ID;
const database = process.env.RDS_DATABASE || 'ventus_bofa';
const schema = checkedPgIdentifier(process.env.EVIDENCE_SCHEMA || 'ventus_evidence', 'EVIDENCE_SCHEMA');
const secrets = new SecretsManagerClient({ region });

async function getSecret(secretId) {
  if (!secretId) throw new Error('RDS_SECRET_ID and EVIDENCE_RUNTIME_SECRET_ID are required');
  const response = await secrets.send(new GetSecretValueCommand({ SecretId: secretId }));
  if (!response.SecretString) throw new Error(`secret ${secretId} has no SecretString`);
  return JSON.parse(response.SecretString);
}

function clientFor(credentials, username = credentials.username, password = credentials.password) {
  return new Client({
    host: credentials.host,
    port: credentials.port || 5432,
    database,
    user: username,
    password,
    ssl: { rejectUnauthorized: false },
    application_name: 'ventus-evidence-store-migrator',
  });
}

async function schemaStatus(adminCredentials) {
  const db = clientFor(adminCredentials);
  await db.connect();
  try {
    const result = await db.query(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = $1
        ORDER BY table_name`,
      [schema],
    );
    return {
      schema,
      exists: result.rows.length > 0,
      tables: result.rows.map((row) => row.table_name),
    };
  } finally {
    await db.end();
  }
}

async function applyMigrations(adminCredentials, runtimeCredentials) {
  const runtimeUsername = checkedPgIdentifier(runtimeCredentials.username, 'runtime secret username');
  const schemaName = quotePgIdentifier(schema);
  const roleName = quotePgIdentifier(runtimeUsername);
  const db = clientFor(adminCredentials);
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    await db.query(`SET LOCAL search_path TO ${schemaName}, public`);
    await db.query(
      `DO $role$
       BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${quotePgLiteral(runtimeUsername)}) THEN
           CREATE ROLE ${roleName} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
         END IF;
       END
       $role$`,
    );
    await db.query(
      `ALTER ROLE ${roleName} NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS`,
    );
    await db.query(`ALTER ROLE ${roleName} PASSWORD ${quotePgLiteral(runtimeCredentials.password)}`);
    await db.query(`ALTER ROLE ${roleName} SET search_path TO ${schemaName}, public`);
    await db.query(`GRANT CONNECT ON DATABASE ${quotePgIdentifier(database)} TO ${roleName}`);

    for (const file of MIGRATIONS) {
      const sql = await readFile(resolve(here, 'sql', file), 'utf8');
      await db.query(sql);
    }

    await db.query(`GRANT USAGE ON SCHEMA ${schemaName} TO ${roleName}`);
    await db.query(
      `GRANT SELECT, INSERT ON
         ${schemaName}.decision_ledger_events,
         ${schemaName}.experiment_assignments,
         ${schemaName}.outcome_events,
         ${schemaName}.connected_exposure_events
       TO ${roleName}`,
    );
    await db.query(
      `GRANT SELECT, INSERT, UPDATE ON ${schemaName}.connector_delivery_receipts TO ${roleName}`,
    );
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await db.end();
  }
}

async function verifyRuntime(adminCredentials, runtimeCredentials) {
  const runtimeUsername = checkedPgIdentifier(runtimeCredentials.username, 'runtime secret username');
  const getDB = async () => clientFor(adminCredentials, runtimeUsername, runtimeCredentials.password);
  const roleDb = await getDB();
  await roleDb.connect();
  try {
    const role = await roleDb.query(
      'SELECT current_user, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user',
    );
    if (!role.rows[0] || role.rows[0].rolsuper || role.rows[0].rolbypassrls) {
      throw new Error('evidence runtime role can bypass row-level security');
    }
  } finally {
    await roleDb.end();
  }

  const repo = createDecisionLedgerRepository({ getDB });
  const measurementRepo = createMeasurementRepository({ getDB });
  const tenantId = `aws_verify_${Date.now().toString(36)}`;
  const otherTenantId = `${tenantId}_other`;
  const householdToken = `tok_runtime_${Date.now().toString(36).padEnd(8, '0')}`;
  const base = {
    tenantId,
    householdToken,
    growthPlayId: 'liquidity-to-wealth',
    status: 'confirmed',
    occurredAt: new Date().toISOString(),
  };
  const drafts = [
    { ...base, eventType: 'signal', idempotencyKey: `${tenantId}:signal`, payload: { evidence_class: 'sandbox' } },
    { ...base, eventType: 'decision', idempotencyKey: `${tenantId}:decision`, payload: { action: 'warm_wealth_referral' } },
    { ...base, eventType: 'activation', idempotencyKey: `${tenantId}:activation`, payload: { destination: 'sandbox_workflow' } },
    { ...base, eventType: 'outcome', idempotencyKey: `${tenantId}:outcome`, payload: { metric: 'net_new_assets', state: 'pending' } },
  ];
  for (const draft of drafts) await repo.append(draft);
  const replay = await repo.append(drafts[0]);
  const own = await repo.exportTenant(tenantId);

  const assignedAt = new Date().toISOString();
  const assignment = assignConnectedExpansionExperiment({
    tenantId,
    experimentId: 'runtime_connected_expansion',
    householdToken,
    holdoutPct: 20,
    standalonePct: 40,
    connectedPct: 40,
    salt: `runtime-verification-${tenantId}`,
    decisionProtocolId: 'runtime_connected_protocol_v1',
    evidenceClass: 'sandbox',
    assignedAt,
    authorization: {
      scopeId: 'runtime_verification_scope',
      approvedAt: new Date(Date.parse(assignedAt) - 60_000).toISOString(),
      expiresAt: new Date(Date.parse(assignedAt) + 86_400_000).toISOString(),
      businessLines: ['consumer_banking', 'wealth_management'],
      signalClasses: ['deposit_behavior', 'wealth_transfer'],
    },
  });
  await measurementRepo.recordAssignment(assignment);
  await measurementRepo.recordAssignment(assignment);
  const exposure = {
    contract_version: '1.0',
    event_id: `exp_${assignment.assignmentId.slice(4)}`,
    tenant_id: tenantId,
    experiment_id: assignment.experimentId,
    household_token: assignment.householdToken,
    arm: assignment.arm,
    decision_evaluated: assignment.arm !== 'holdout',
    action_delivered: false,
    connected_data_used: assignment.arm === 'connected',
    authorization_scope_id: assignment.authorizationScopeId,
    decision_protocol_id: assignment.decisionProtocolId,
    occurred_at: new Date(Date.parse(assignedAt) + 1_000).toISOString(),
  };
  const exposureWrite = await measurementRepo.recordExposure(exposure);
  const exposureReplay = await measurementRepo.recordExposure(exposure);
  const experiment = await measurementRepo.loadExperiment({
    tenantId,
    experimentId: assignment.experimentId,
  });

  const crossTenantDb = await getDB();
  await crossTenantDb.connect();
  let crossTenantVisibleEvents;
  let crossTenantVisibleExposures;
  try {
    await crossTenantDb.query('BEGIN');
    await crossTenantDb.query("SELECT set_config('app.current_tenant_id', $1, true)", [otherTenantId]);
    const ledgerResult = await crossTenantDb.query('SELECT count(*)::int AS visible FROM decision_ledger_events');
    const exposureResult = await crossTenantDb.query('SELECT count(*)::int AS visible FROM connected_exposure_events');
    crossTenantVisibleEvents = Number(ledgerResult.rows[0]?.visible ?? -1);
    crossTenantVisibleExposures = Number(exposureResult.rows[0]?.visible ?? -1);
    await crossTenantDb.query('ROLLBACK');
  } catch (error) {
    await crossTenantDb.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await crossTenantDb.end();
  }
  if (
    replay.inserted
    || !own.verified
    || own.events.length !== drafts.length
    || !exposureWrite.inserted
    || exposureReplay.inserted
    || experiment.assignments.length !== 1
    || experiment.exposures.length !== 1
    || crossTenantVisibleEvents !== 0
    || crossTenantVisibleExposures !== 0
  ) {
    throw new Error('runtime ledger, connected-measurement, idempotency, or tenant-isolation verification failed');
  }
  return {
    runtimeRole: runtimeUsername,
    runtimeRoleNonBypass: true,
    eventCount: own.events.length,
    hashChainVerified: verifyLedgerChain(own.events),
    crossTenantVisibleEvents,
    connectedExperiment: {
      design: assignment.design,
      arm: assignment.arm,
      assignmentCount: experiment.assignments.length,
      exposureCount: experiment.exposures.length,
      exposureReplayInserted: exposureReplay.inserted,
      authorizationScopeId: assignment.authorizationScopeId,
      crossTenantVisibleExposures,
    },
    headHashPrefix: own.events.at(-1).event_hash.slice(0, 16),
  };
}

export async function handler(event = {}) {
  const adminCredentials = await getSecret(adminSecretId);
  const status = await schemaStatus(adminCredentials);
  if (event.mode !== 'migrate-and-verify') {
    return { ok: true, mode: 'status', ...status, mutationPerformed: false };
  }
  if (event.confirm !== APPLY_CONFIRMATION) {
    throw new Error(`migrate-and-verify requires confirm=${APPLY_CONFIRMATION}`);
  }
  const runtimeCredentials = await getSecret(runtimeSecretId);
  await applyMigrations(adminCredentials, runtimeCredentials);
  const verification = await verifyRuntime(adminCredentials, runtimeCredentials);
  return {
    ok: true,
    mode: 'migrate-and-verify',
    schema,
    migrations: MIGRATIONS,
    mutationPerformed: true,
    verification,
  };
}
