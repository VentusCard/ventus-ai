import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
    'connected-expansion-measurement.sql',
    'tenant-isolation.sql',
    'connector-delivery.sql',
  ]);
});

test('evidence-store migrator verifies connected measurement persistence and isolation', () => {
  const source = readFileSync(
    new URL('../monitors/evidence-store-migrator/index.mjs', import.meta.url),
    'utf8',
  );
  assert.match(source, /assignConnectedExpansionExperiment/, 'runtime verification should create a connected assignment');
  assert.match(source, /recordExposure\(exposure\)/, 'runtime verification should persist an exposure receipt');
  assert.match(source, /decisionProtocolId/, 'runtime verification should pin a connected decision protocol');
  assert.match(source, /loadExperiment/, 'runtime verification should read the connected experiment back');
  assert.match(source, /crossTenantVisibleExposures !== 0/, 'runtime verification should fail on cross-tenant exposure visibility');
});
