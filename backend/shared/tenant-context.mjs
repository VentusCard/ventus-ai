import assert from 'node:assert/strict';

const TENANT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/;

export async function beginTenantTransaction(db, tenantId) {
  assert.ok(db && typeof db.query === 'function', 'database client is required');
  assert.match(tenantId, TENANT_ID_PATTERN, 'tenantId must be a safe opaque identifier');
  await db.query('BEGIN');
  try {
    await db.query(
      `SELECT set_config('app.current_tenant_id', $1, true) AS tenant_id`,
      [tenantId],
    );
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  }
}

export function validateTenantId(tenantId) {
  assert.match(tenantId, TENANT_ID_PATTERN, 'tenantId must be a safe opaque identifier');
  return tenantId;
}
