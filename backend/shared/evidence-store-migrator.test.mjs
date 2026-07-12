import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPLY_EVIDENCE_SCHEMA_CONFIRMATION,
  EVIDENCE_STORE_MIGRATIONS,
  checkedPgIdentifier,
  quotePgIdentifier,
  quotePgLiteral,
} from '../monitors/evidence-store-migrator/migration-safety.mjs';

test('evidence-store migrator validates identifiers and quotes password literals', () => {
  assert.equal(checkedPgIdentifier('ventus_evidence', 'schema'), 'ventus_evidence');
  assert.throws(() => checkedPgIdentifier('public; DROP SCHEMA public', 'schema'));
  assert.equal(quotePgIdentifier('ventus_runtime'), '"ventus_runtime"');
  assert.equal(quotePgLiteral("a'b"), "'a''b'");
  assert.equal(APPLY_EVIDENCE_SCHEMA_CONFIRMATION, 'APPLY_VENTUS_EVIDENCE_SCHEMA');
  assert.deepEqual(EVIDENCE_STORE_MIGRATIONS, [
    'decision-ledger.sql',
    'experiment-measurement.sql',
    'tenant-isolation.sql',
    'connector-delivery.sql',
  ]);
});
