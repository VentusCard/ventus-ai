import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tenantSql = read('../backend/sql/tenant-isolation.sql');
const measurementSql = read('../backend/sql/experiment-measurement.sql');
const connectedMeasurementSql = read('../backend/sql/connected-expansion-measurement.sql');
const verificationSql = read('../backend/sql/verify-tenant-isolation.sql');
const deliverySql = read('../backend/sql/connector-delivery.sql');
const tenantContextSource = read('../backend/shared/tenant-context.mjs');
const ledgerSource = read('../backend/shared/decision-ledger.mjs');
const measurementSource = read('../backend/shared/experiment-measurement.mjs');
const deliverySource = read('../backend/shared/connector-delivery.mjs');
const runbook = read('../docs/tenant-isolated-persistence-runbook.md');

assert.match(tenantSql, /current_setting\('app\.current_tenant_id', true\)/, 'RLS should read transaction tenant context');
assert.match(
  measurementSql,
  /evidence_class text NOT NULL DEFAULT 'synthetic'[\s\S]*?'sandbox'[\s\S]*?'sanctioned'/,
  'experiment assignments should persist a fail-safe evidence class'
);
assert.equal(
  [...tenantSql.matchAll(/FORCE ROW LEVEL SECURITY/g)].length,
  4,
  'all four evidence tables should force RLS for table owners'
);
for (const table of ['decision_ledger_events', 'experiment_assignments', 'outcome_events', 'connected_exposure_events']) {
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
assert.match(measurementSource, /beginTenantTransaction\(db, assignment\.tenantId\)/, 'assignment writes should set tenant context');
assert.match(measurementSource, /beginTenantTransaction\(db, event\.tenant_id\)/, 'outcome writes should set tenant context');
assert.match(verificationSql, /rolsuper OR rolbypassrls/, 'verification should reject privileged runtime roles');
assert.match(verificationSql, /cross-tenant read was visible/, 'verification should test cross-tenant reads');
assert.match(verificationSql, /cross-tenant write unexpectedly succeeded/, 'verification should test cross-tenant writes');
assert.match(verificationSql, /missing tenant context did not fail closed/, 'verification should test missing context');
assert.match(verificationSql, /cross-tenant delivery receipt was visible/, 'verification should test connector receipt isolation');
assert.match(verificationSql, /cross-tenant connected exposure was visible/, 'verification should test connected-exposure isolation');
assert.match(verificationSql, /ROLLBACK;/, 'verification probes should roll back');
assert.match(deliverySql, /UNIQUE \(tenant_id, idempotency_key\)/, 'delivery reservations should be tenant-idempotent');
assert.match(deliverySql, /terminal connector delivery receipts are immutable/, 'terminal delivery receipts should be immutable');
assert.match(deliverySql, /must transition from pending to a terminal status/, 'pending receipts should allow only one terminal transition');
assert.match(deliverySql, /FORCE ROW LEVEL SECURITY/, 'delivery receipts should force RLS');
assert.match(deliverySql, /WITH CHECK \(tenant_id = ventus_current_tenant_id\(\)\)/, 'delivery receipt writes should be tenant-scoped');
assert.match(deliverySource, /beginTenantTransaction\(db, reservation\.tenantId\)/, 'delivery reservations should set tenant context');
assert.match(deliverySource, /shouldDeliver = false/, 'duplicate reservations should block automatic redelivery');
assert.match(deliverySource, /reconciliationRequired/, 'ambiguous pending reservations should require reconciliation');
assert.match(runbook, /non-production/i, 'runbook should limit the first deployment to non-production');
assert.match(runbook, /NOBYPASSRLS/, 'runbook should require a non-bypass runtime role');

console.log('Persistence readiness ok: transaction tenant context, forced RLS policies, at-most-once delivery receipts, and rollback-only isolation probes');

function read(path) {
  return readFileSync(resolve(path), 'utf8');
}
