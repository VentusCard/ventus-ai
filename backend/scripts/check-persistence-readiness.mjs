import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tenantSql = read('../backend/sql/tenant-isolation.sql');
const verificationSql = read('../backend/sql/verify-tenant-isolation.sql');
const tenantContextSource = read('../backend/shared/tenant-context.mjs');
const ledgerSource = read('../backend/shared/decision-ledger.mjs');
const measurementSource = read('../backend/shared/experiment-measurement.mjs');
const runbook = read('../docs/tenant-isolated-persistence-runbook.md');

assert.match(tenantSql, /current_setting\('app\.current_tenant_id', true\)/, 'RLS should read transaction tenant context');
assert.equal(
  [...tenantSql.matchAll(/FORCE ROW LEVEL SECURITY/g)].length,
  3,
  'all three evidence tables should force RLS for table owners'
);
for (const table of ['decision_ledger_events', 'experiment_assignments', 'outcome_events']) {
  assert.match(
    tenantSql,
    new RegExp(`CREATE POLICY [^;]+ON ${table}[^;]+USING \\(tenant_id = ventus_current_tenant_id\\(\\)\\)[^;]+WITH CHECK \\(tenant_id = ventus_current_tenant_id\\(\\)\\)`),
    `${table} should have tenant-scoped read and write policy expressions`
  );
}
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
assert.match(verificationSql, /ROLLBACK;/, 'verification probes should roll back');
assert.match(runbook, /non-production/i, 'runbook should limit the first deployment to non-production');
assert.match(runbook, /NOBYPASSRLS/, 'runbook should require a non-bypass runtime role');

console.log('Persistence readiness ok: transaction tenant context, forced RLS policies, and rollback-only isolation probes');

function read(path) {
  return readFileSync(resolve(path), 'utf8');
}
