import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tenantSql = read('../backend/sql/tenant-isolation.sql');
const institutionAccessSql = read('../backend/sql/institution-access.sql');
const measurementSql = read('../backend/sql/experiment-measurement.sql');
const connectedMeasurementSql = read('../backend/sql/connected-expansion-measurement.sql');
const verificationSql = read('../backend/sql/verify-tenant-isolation.sql');
const deliverySql = read('../backend/sql/connector-delivery.sql');
const registrySql = read('../backend/sql/growth-play-registry.sql');
const tenantContextSource = read('../backend/shared/platform/tenant-context.mjs');
const ledgerSource = read('../backend/shared/pilot/decision-ledger.mjs');
const measurementSource = read('../backend/shared/pilot/experiment-measurement.mjs');
const deliverySource = read('../backend/shared/pilot/connector-delivery.mjs');
const registrySource = read('../backend/shared/pilot/growth-play-registry.mjs');
const runbook = read('../docs/runbooks/tenant-isolated-persistence-runbook.md');

assert.match(tenantSql, /current_setting\('app\.current_tenant_id', true\)/, 'RLS should read transaction tenant context');
assert.match(
  measurementSql,
  /evidence_class text NOT NULL DEFAULT 'synthetic'[\s\S]*?'sandbox'[\s\S]*?'sanctioned'/,
  'experiment assignments should persist a fail-safe evidence class'
);
assert.equal(
  [...tenantSql.matchAll(/FORCE ROW LEVEL SECURITY/g)].length,
  6,
  'all six tenant evidence and protocol tables should force RLS for table owners'
);
for (const table of ['decision_ledger_events', 'experiment_assignments', 'outcome_events', 'connected_exposure_events', 'growth_play_protocols', 'growth_play_protocol_approval_events']) {
  assert.match(
    tenantSql,
    new RegExp(`CREATE POLICY [^;]+ON ${table}[^;]+USING \\(tenant_id = ventus_current_tenant_id\\(\\)\\)[^;]+WITH CHECK \\(tenant_id = ventus_current_tenant_id\\(\\)\\)`),
    `${table} should have tenant-scoped read and write policy expressions`
  );
}
assert.match(connectedMeasurementSql, /connected_incrementality/, 'connected experiment design must be persisted');
assert.match(connectedMeasurementSql, /authorization_scope_id text NOT NULL/, 'connected exposures must retain authorization scope');
assert.match(connectedMeasurementSql, /decision_protocol_id text NOT NULL/, 'connected exposures must pin the decision protocol');
assert.match(connectedMeasurementSql, /validate_connected_exposure_assignment/, 'connected exposures must match an active immutable assignment in the database');
assert.match(connectedMeasurementSql, /connected_exposure_events_no_mutation/, 'connected exposure receipts must be immutable');
assert.match(tenantContextSource, /set_config\('app\.current_tenant_id', \$1, true\)/, 'tenant context should be transaction-local');
assert.match(tenantContextSource, /await db\.query\('BEGIN'\)/, 'tenant context should begin a transaction first');
assert.match(ledgerSource, /beginTenantTransaction\(db, draft\.tenantId\)/, 'ledger writes should set tenant context');
assert.match(ledgerSource, /beginTenantTransaction\(db, tenantId\)/, 'ledger exports should set tenant context');
assert.match(ledgerSource, /loadOutcomeContext/, 'outcome ingestion should resolve lineage from the server ledger');
assert.match(ledgerSource, /event_type = 'counterfactual'/, 'outcome lineage should resolve immutable assignment evidence');
assert.match(ledgerSource, /event_type = 'activation'/, 'outcome lineage should resolve activation evidence when present');
assert.match(read('../backend/sql/decision-ledger.sql'), /decision_ledger_assignment_context_idx/, 'assignment context lookup should be indexed');
assert.match(read('../backend/sql/decision-ledger.sql'), /decision_ledger_activation_context_idx/, 'activation context lookup should be indexed');
assert.match(measurementSource, /beginTenantTransaction\(db, assignment\.tenantId\)/, 'assignment writes should set tenant context');
assert.match(measurementSource, /beginTenantTransaction\(db, event\.tenant_id\)/, 'outcome writes should set tenant context');
assert.match(verificationSql, /rolsuper OR rolbypassrls/, 'verification should reject privileged runtime roles');
assert.match(verificationSql, /cross-tenant read was visible/, 'verification should test cross-tenant reads');
assert.match(verificationSql, /cross-tenant write unexpectedly succeeded/, 'verification should test cross-tenant writes');
assert.match(verificationSql, /missing tenant context did not fail closed/, 'verification should test missing context');
assert.match(verificationSql, /cross-tenant delivery receipt was visible/, 'verification should test connector receipt isolation');
assert.match(verificationSql, /cross-tenant connected exposure was visible/, 'verification should test connected-exposure isolation');
assert.match(verificationSql, /runtime role unexpectedly wrote a Growth Play protocol/, 'verification should reject runtime self-approval');
assert.match(verificationSql, /ROLLBACK;/, 'verification probes should roll back');
assert.match(deliverySql, /UNIQUE \(tenant_id, idempotency_key\)/, 'delivery reservations should be tenant-idempotent');
assert.match(deliverySql, /terminal connector delivery receipts are immutable/, 'terminal delivery receipts should be immutable');
assert.match(deliverySql, /must transition from pending to a terminal status/, 'pending receipts should allow only one terminal transition');
assert.match(deliverySql, /FORCE ROW LEVEL SECURITY/, 'delivery receipts should force RLS');
assert.match(deliverySql, /WITH CHECK \(tenant_id = ventus_current_tenant_id\(\)\)/, 'delivery receipt writes should be tenant-scoped');
assert.match(deliverySource, /beginTenantTransaction\(db, reservation\.tenantId\)/, 'delivery reservations should set tenant context');
for (const table of ['institutions', 'institution_identity_providers', 'institution_memberships']) {
  assert.match(
    institutionAccessSql,
    new RegExp(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`),
    `${table} should force row-level security`,
  );
}
assert.match(
  institutionAccessSql,
  /UNIQUE \(tenant_id, identity_provider_key, identity_subject\)/,
  'institution membership should bind one IdP subject once per tenant',
);
assert.match(
  institutionAccessSql,
  /CHECK \(role IN \(/,
  'institution membership roles should use a closed pilot taxonomy',
);
assert.match(deliverySource, /shouldDeliver = false/, 'duplicate reservations should block automatic redelivery');
assert.match(deliverySource, /reconciliationRequired/, 'ambiguous pending reservations should require reconciliation');
assert.match(registrySql, /Growth Play registry records are append-only/, 'protocol and approval records must be immutable');
assert.match(registrySql, /decision IN \('approved', 'revoked'\)/, 'registry must support explicit approval and revocation');
assert.match(registrySql, /registered_by_session_id text NOT NULL/, 'protocol registration must retain the authenticated session');
assert.match(registrySql, /decided_by_session_id text NOT NULL/, 'protocol decisions must retain the authenticated session');
assert.match(registrySql, /identity_provider text NOT NULL/, 'protocol controls must retain identity-provider lineage');
assert.match(registrySource, /beginTenantTransaction\(db, tenantId\)/, 'registry reads and writes should set tenant context');
assert.match(registrySource, /Growth Play protocol is not approved at run time/, 'runtime protocol resolution must fail closed after revocation');
assert.match(registrySource, /registration and approval require different subjects/, 'protocol approval must enforce separation of duties');
assert.match(registrySql, /binary assignment protocol is not approved at assignment time/, 'database must reject assignments under unapproved protocols');
assert.match(registrySql, /binary_assignment_protocol_approval_guard/, 'binary assignment approval guard must be installed');
assert.match(runbook, /non-production/i, 'runbook should limit the first deployment to non-production');
assert.match(runbook, /NOBYPASSRLS/, 'runbook should require a non-bypass runtime role');

console.log('Persistence readiness ok: transaction tenant context, forced RLS, approved Growth Play registry, at-most-once delivery, and rollback-only isolation probes');

function read(path) {
  return readFileSync(resolve(path), 'utf8');
}
