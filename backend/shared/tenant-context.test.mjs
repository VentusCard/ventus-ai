import assert from 'node:assert/strict';
import test from 'node:test';
import { beginTenantTransaction, validateTenantId } from './tenant-context.mjs';

test('tenant context is transaction-local and set before repository work', async () => {
  const calls = [];
  const db = { async query(sql, params = []) { calls.push({ sql, params }); return { rows: [] }; } };
  await beginTenantTransaction(db, 'bank_1');
  assert.equal(calls[0].sql, 'BEGIN');
  assert.match(calls[1].sql, /set_config\('app\.current_tenant_id', \$1, true\)/);
  assert.deepEqual(calls[1].params, ['bank_1']);
});

test('tenant context rejects unsafe identifiers and rolls back failed setup', async () => {
  assert.throws(() => validateTenantId('bank 1'), /safe opaque identifier/);
  const calls = [];
  const db = {
    async query(sql) {
      calls.push(sql);
      if (sql.includes('set_config')) throw new Error('context unavailable');
      return { rows: [] };
    },
  };
  await assert.rejects(() => beginTenantTransaction(db, 'bank_1'), /context unavailable/);
  assert.deepEqual(calls, [
    'BEGIN',
    `SELECT set_config('app.current_tenant_id', $1, true) AS tenant_id`,
    'ROLLBACK',
  ]);
});
