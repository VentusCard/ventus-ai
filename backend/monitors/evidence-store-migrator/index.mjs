import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { createDecisionLedgerRepository, verifyLedgerChain } from './shared/pilot/decision-ledger.mjs';
import {
  assignConnectedExpansionExperiment,
  createMeasurementRepository,
} from './shared/pilot/experiment-measurement.mjs';
import { createGrowthPlayRegistry } from './shared/pilot/growth-play-registry.mjs';
import { compileGrowthPlayContract } from './shared/pilot/growth-play-contract.mjs';
import {
  APPLY_EVIDENCE_SCHEMA_CONFIRMATION,
  EVIDENCE_STORE_MIGRATIONS,
  PROVISION_CONSOLE_ACCESS_CONFIRMATION,
  checkedPgIdentifier,
  quotePgIdentifier,
  quotePgLiteral,
  validateAccessProvisioning,
} from './migration-safety.mjs';

const APPLY_CONFIRMATION = APPLY_EVIDENCE_SCHEMA_CONFIRMATION;
const PROVISION_ACCESS_CONFIRMATION = PROVISION_CONSOLE_ACCESS_CONFIRMATION;
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
    options: `-c search_path=${schema},public`,
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
           CREATE ROLE ${roleName}
             LOGIN PASSWORD ${quotePgLiteral(runtimeCredentials.password)}
             NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
         END IF;
       END
       $role$`,
    );
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
      `GRANT SELECT ON
         ${schemaName}.growth_play_protocols,
         ${schemaName}.growth_play_protocol_approval_events,
         ${schemaName}.institutions,
         ${schemaName}.institution_identity_providers,
         ${schemaName}.institution_memberships
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

async function provisionConsoleAccess(adminCredentials, input) {
  const access = validateAccessProvisioning(input);
  const membershipId = `mem_${createHash('sha256')
    .update(`${access.tenantId}:${access.email}`)
    .digest('hex')
    .slice(0, 24)}`;
  const db = clientFor(adminCredentials);
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query("SELECT set_config('app.current_tenant_id', $1, true)", [access.tenantId]);
    await db.query(
      `INSERT INTO institutions (tenant_id, display_name, status)
       VALUES ($1, $2, 'pilot')
       ON CONFLICT (tenant_id) DO NOTHING`,
      [access.tenantId, access.displayName],
    );
    const provider = await db.query(
      `SELECT issuer
         FROM institution_identity_providers
        WHERE tenant_id = $1 AND provider_key = 'cognito'`,
      [access.tenantId],
    );
    if (provider.rows[0]?.issuer && provider.rows[0].issuer !== access.issuer) {
      throw new Error('tenant Cognito issuer does not match the approved issuer');
    }
    await db.query(
      `INSERT INTO institution_identity_providers
         (tenant_id, provider_key, provider_type, issuer, status)
       VALUES ($1, 'cognito', 'cognito', $2, 'testing')
       ON CONFLICT (tenant_id, provider_key) DO UPDATE
         SET status = 'testing', updated_at = now()`,
      [access.tenantId, access.issuer],
    );
    await db.query(
      `INSERT INTO institution_memberships
         (membership_id, tenant_id, identity_provider_key, identity_subject, email,
          role, status, business_lines, entitlements)
       VALUES ($1, $2, 'cognito', $3, $4, $5, 'active', $6, $7)
       ON CONFLICT (tenant_id, email) DO UPDATE
         SET identity_subject = EXCLUDED.identity_subject,
             role = EXCLUDED.role,
             status = 'active',
             business_lines = EXCLUDED.business_lines,
             entitlements = EXCLUDED.entitlements,
             updated_at = now()`,
      [
        membershipId,
        access.tenantId,
        access.identitySubject,
        access.email,
        access.role,
        access.businessLines,
        access.entitlements,
      ],
    );
    await db.query('COMMIT');
    return {
      tenantId: access.tenantId,
      membershipId,
      email: access.email,
      role: access.role,
      businessLines: access.businessLines,
      entitlements: access.entitlements,
    };
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
  const protocolRegistry = createGrowthPlayRegistry({ getDB });
  const protocolAdminRegistry = createGrowthPlayRegistry({ getDB: async () => clientFor(adminCredentials) });
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
  const protocol = compileGrowthPlayContract({
    contract_version: '1.0',
    growth_play_id: 'runtime-deposit-verification',
    version: '1.0.0',
    business_line: 'consumer-banking',
    objective: 'Verify approved standalone deposit operating protocol',
    source: {
      receipt_source_systems: ['runtime_probe'],
      schema_versions: ['1.0'],
      record_sources: [{ source_system: 'runtime_probe', allowed_rails: ['ach'] }],
    },
    eligibility: { criteria_version: 'runtime-eligibility-v1' },
    policy: { version: 'runtime-policy-v1', required_policy_ids: ['consent'] },
    actions: [{
      action_id: 'runtime_review', owner_role: 'runtime_owner', connector: 'bank_workbench',
      destination: 'runtime_workbench', destination_environment: 'sandbox',
    }],
    measurement: {
      metric: 'deposit_retained', outcome_event_types: ['deposit_balance_observed'],
      outcome_source_systems: ['runtime_probe'], outcome_window_days: 30,
      holdout_pct: 10, minimum_per_arm: 1, minimum_coverage: 1,
    },
  });
  const registeredAt = new Date(Date.now() - 60_000).toISOString();
  const approvedAt = new Date(Date.now() - 30_000).toISOString();
  await protocolAdminRegistry.register({
    tenantId, contract: protocol, registeredBy: 'runtime_verifier',
    registeredBySessionId: 'migration_verify_config_session', identityProvider: 'migration_control',
    registeredAt,
  });
  await protocolAdminRegistry.recordApproval({
    tenantId,
    decisionProtocolId: protocol.decision_protocol_id,
    businessLine: protocol.business_line,
    decision: 'approved',
    decidedBy: 'runtime_business_owner',
    decidedBySessionId: 'migration_verify_approval_session',
    identityProvider: 'migration_control',
    decidedAt: approvedAt,
    changeRecordId: 'runtime_change_record',
    reason: 'Approved for non-production runtime verification.',
  });
  const membershipId = `mem_${Date.now().toString(36)}`;
  const identitySubject = `sub_${Date.now().toString(36)}`;
  const identityAdmin = clientFor(adminCredentials);
  await identityAdmin.connect();
  try {
    await identityAdmin.query('BEGIN');
    await identityAdmin.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
    await identityAdmin.query(
      `INSERT INTO institutions (tenant_id, display_name, status)
       VALUES ($1, $2, 'pilot')
       ON CONFLICT (tenant_id) DO NOTHING`,
      [tenantId, 'AWS runtime verification institution'],
    );
    await identityAdmin.query(
      `INSERT INTO institution_identity_providers
         (tenant_id, provider_key, provider_type, issuer, status)
       VALUES ($1, 'cognito', 'cognito', $2, 'testing')
       ON CONFLICT (tenant_id, provider_key) DO NOTHING`,
      [tenantId, `https://cognito-idp.${region}.amazonaws.com/runtime-verification`],
    );
    await identityAdmin.query(
      `INSERT INTO institution_memberships
         (membership_id, tenant_id, identity_provider_key, identity_subject, email,
          role, status, business_lines, entitlements)
       VALUES ($1, $2, 'cognito', $3, $4, 'bank_operator', 'active', $5, $6)`,
      [
        membershipId,
        tenantId,
        identitySubject,
        `${identitySubject}@example.invalid`,
        ['consumer-banking'],
        ['consumer_demo', 'growth_console'],
      ],
    );
    await identityAdmin.query('COMMIT');
  } catch (error) {
    await identityAdmin.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await identityAdmin.end();
  }
  const protocolApproval = await protocolRegistry.requireApproved({
    tenantId,
    decisionProtocolId: protocol.decision_protocol_id,
    businessLine: protocol.business_line,
    at: new Date().toISOString(),
  });
  let runtimeProtocolWriteDenied = false;
  try {
    const protocolDraft = structuredClone(protocol);
    delete protocolDraft.decision_protocol_id;
    delete protocolDraft.protocol_digest;
    const unauthorizedProtocol = compileGrowthPlayContract({
      ...protocolDraft,
      version: '1.0.1',
      objective: 'Runtime must not authorize a changed operating protocol',
    });
    await protocolRegistry.register({
      tenantId,
      contract: unauthorizedProtocol,
      registeredBy: 'activation_runtime',
      registeredBySessionId: 'activation_runtime_session',
      identityProvider: 'runtime_forbidden',
      registeredAt: new Date().toISOString(),
    });
  } catch (error) {
    runtimeProtocolWriteDenied = /permission denied|row-level security/i.test(error.message);
    if (!runtimeProtocolWriteDenied) throw error;
  }
  const membershipDb = await getDB();
  await membershipDb.connect();
  let ownVisibleMemberships;
  let runtimeMembershipWriteDenied = false;
  try {
    await membershipDb.query('BEGIN');
    await membershipDb.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
    const membershipResult = await membershipDb.query(
      `SELECT count(*)::int AS visible
         FROM institution_memberships
        WHERE identity_provider_key = 'cognito' AND identity_subject = $1`,
      [identitySubject],
    );
    ownVisibleMemberships = Number(membershipResult.rows[0]?.visible ?? -1);
    try {
      await membershipDb.query(
        `INSERT INTO institution_memberships
           (membership_id, tenant_id, identity_provider_key, identity_subject, email,
            role, status)
         VALUES ($1, $2, 'cognito', $3, $4, 'bank_operator', 'active')`,
        [
          `${membershipId}_forbidden`,
          tenantId,
          `${identitySubject}_forbidden`,
          `${identitySubject}_forbidden@example.invalid`,
        ],
      );
    } catch (error) {
      runtimeMembershipWriteDenied = /permission denied|row-level security/i.test(error.message);
    }
    await membershipDb.query('ROLLBACK');
  } catch (error) {
    await membershipDb.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await membershipDb.end();
  }
  if (!runtimeMembershipWriteDenied) {
    throw new Error('evidence runtime role can provision institution memberships');
  }
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
  let crossTenantVisibleProtocols;
  let crossTenantVisibleMemberships;
  try {
    await crossTenantDb.query('BEGIN');
    await crossTenantDb.query("SELECT set_config('app.current_tenant_id', $1, true)", [otherTenantId]);
    const ledgerResult = await crossTenantDb.query('SELECT count(*)::int AS visible FROM decision_ledger_events');
    const exposureResult = await crossTenantDb.query('SELECT count(*)::int AS visible FROM connected_exposure_events');
    const protocolResult = await crossTenantDb.query('SELECT count(*)::int AS visible FROM growth_play_protocols');
    const membershipResult = await crossTenantDb.query('SELECT count(*)::int AS visible FROM institution_memberships');
    crossTenantVisibleEvents = Number(ledgerResult.rows[0]?.visible ?? -1);
    crossTenantVisibleExposures = Number(exposureResult.rows[0]?.visible ?? -1);
    crossTenantVisibleProtocols = Number(protocolResult.rows[0]?.visible ?? -1);
    crossTenantVisibleMemberships = Number(membershipResult.rows[0]?.visible ?? -1);
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
    || crossTenantVisibleProtocols !== 0
    || crossTenantVisibleMemberships !== 0
    || ownVisibleMemberships !== 1
    || protocolApproval.decisionProtocolId !== protocol.decision_protocol_id
    || !runtimeProtocolWriteDenied
    || !runtimeMembershipWriteDenied
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
    growthPlayRegistry: {
      decisionProtocolId: protocolApproval.decisionProtocolId,
      approvalEventId: protocolApproval.approvalEventId,
      crossTenantVisibleProtocols,
      runtimeProtocolWriteDenied,
    },
    institutionAccess: {
      ownVisibleMemberships,
      crossTenantVisibleMemberships,
      runtimeMembershipWriteDenied,
    },
    headHashPrefix: own.events.at(-1).event_hash.slice(0, 16),
  };
}

export async function handler(event = {}) {
  const adminCredentials = await getSecret(adminSecretId);
  const status = await schemaStatus(adminCredentials);
  if (event.mode === 'provision-console-access') {
    if (!status.exists) throw new Error('evidence schema must exist before provisioning access');
    if (event.confirm !== PROVISION_ACCESS_CONFIRMATION) {
      throw new Error(`provision-console-access requires confirm=${PROVISION_ACCESS_CONFIRMATION}`);
    }
    const provisioned = await provisionConsoleAccess(adminCredentials, event.access);
    return {
      ok: true,
      mode: 'provision-console-access',
      mutationPerformed: true,
      provisioned,
    };
  }
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
