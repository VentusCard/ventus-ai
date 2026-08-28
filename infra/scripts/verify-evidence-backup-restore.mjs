import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA_VERSION = 'ventus_evidence_backup_restore_receipt/v1';
const FORBIDDEN_KEY = /(secret|password|access.?token|refresh.?token|private.?key|raw.?credential)/i;

/**
 * Produce a truthful, non-serving receipt when the protected backup owner has
 * not yet granted the snapshot/restore operation.
 */
export function createBlockedReceipt({
  recordedAt = new Date().toISOString(),
  sourceClusterIdentifier = 'ventus-bofa-cluster',
} = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    receiptId: 'backup_restore_2026_08_01',
    recordedAt,
    environment: 'staging',
    mode: 'isolated_non_serving',
    source: {
      clusterIdentifier: sourceClusterIdentifier,
      snapshotIdentifier: null,
      snapshotTime: null,
      servingEndpointUnchanged: true,
    },
    restore: {
      targetIdentifier: null,
      isolated: true,
      serving: false,
      startedAt: null,
      completedAt: null,
      observedRtoSeconds: null,
      observedRpoSeconds: null,
      cleanupDisposition: 'not_run',
    },
    migrationInventory: [],
    tenantRlsProbe: {
      status: 'not_run',
      crossTenantRows: null,
      nonBypass: null,
    },
    ledger: {
      status: 'not_run',
      verified: null,
      sourceHeadHash: null,
      restoredHeadHash: null,
    },
    status: 'blocked_external_dependency',
    claimBoundary: {
      resilienceClaimAllowed: false,
      reason: 'No snapshot or restore was run; this receipt records an external prerequisite only.',
    },
    dependencies: [{
      code: 'isolated_restore_authority',
      owner: 'infrastructure_owner',
      effect: 'Provide a read-only snapshot identifier and approve a new non-serving verification target before execution.',
    }],
  };
}

export function validateBackupRestoreReceipt(receipt, { requireComplete = false } = {}) {
  assertSafe(receipt);
  assert.equal(receipt.schemaVersion, SCHEMA_VERSION, 'backup/restore receipt schema version is invalid');
  for (const key of [
    'receiptId', 'recordedAt', 'environment', 'mode', 'source', 'restore', 'migrationInventory',
    'tenantRlsProbe', 'ledger', 'status', 'claimBoundary', 'dependencies',
  ]) assert.ok(Object.prototype.hasOwnProperty.call(receipt, key), `${key} is required`);
  assert.equal(receipt.environment, 'staging', 'receipt must describe staging');
  assert.equal(receipt.mode, 'isolated_non_serving', 'restore mode must be isolated_non_serving');
  assert.ok(typeof receipt.source.clusterIdentifier === 'string' && receipt.source.clusterIdentifier.length > 0, 'source cluster is required');
  assert.equal(receipt.source.servingEndpointUnchanged, true, 'source serving endpoint must remain unchanged');
  assert.equal(receipt.restore.isolated, true, 'restore target must be isolated');
  assert.equal(receipt.restore.serving, false, 'restore target must not serve traffic');
  if (receipt.restore.targetIdentifier) assert.notEqual(receipt.restore.targetIdentifier, receipt.source.clusterIdentifier, 'restore target must differ from source');
  assert.ok(['completed', 'blocked_external_dependency'].includes(receipt.status), 'receipt status is invalid');
  assert.equal(receipt.claimBoundary.resilienceClaimAllowed, false, 'backup/restore cannot authorize a resilience claim');
  if (receipt.status === 'blocked_external_dependency') {
    assert.ok(receipt.dependencies.length > 0, 'blocked receipt must name its external dependency');
  }
  if (receipt.status === 'completed') {
    assert.ok(receipt.source.snapshotIdentifier && receipt.source.snapshotTime, 'completed receipt requires a source snapshot');
    assert.ok(receipt.restore.targetIdentifier && receipt.restore.startedAt && receipt.restore.completedAt, 'completed receipt requires restore timing and target');
    assert.ok(Number.isFinite(receipt.restore.observedRtoSeconds) && receipt.restore.observedRtoSeconds >= 0, 'observed RTO is required');
    assert.ok(Number.isFinite(receipt.restore.observedRpoSeconds) && receipt.restore.observedRpoSeconds >= 0, 'observed RPO is required');
    assert.ok(receipt.migrationInventory.length > 0, 'completed receipt requires migration inventory');
    assert.equal(receipt.tenantRlsProbe.status, 'pass', 'tenant/RLS probe must pass');
    assert.equal(receipt.tenantRlsProbe.crossTenantRows, 0, 'cross-tenant rows must be zero');
    assert.equal(receipt.tenantRlsProbe.nonBypass, true, 'restore runtime role must be non-bypass');
    assert.equal(receipt.ledger.status, 'verified', 'restored ledger must verify');
    assert.equal(receipt.ledger.verified, true, 'restored ledger verification is required');
    assert.equal(receipt.ledger.sourceHeadHash, receipt.ledger.restoredHeadHash, 'restored ledger head must match source');
    assert.equal(receipt.dependencies.length, 0, 'completed receipt cannot retain unresolved dependencies');
  }
  if (requireComplete) assert.equal(receipt.status, 'completed', 'backup/restore receipt is not complete');
  return receipt;
}

function assertSafe(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafe(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!FORBIDDEN_KEY.test(key), `secret-bearing field is not permitted: ${path}.${key}`);
    assertSafe(child, `${path}.${key}`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8'));
}

async function main() {
  const args = new Map();
  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (arg === '--plan' || arg === '--require-complete') args.set(arg, true);
    else if (arg.startsWith('--')) args.set(arg, process.argv[++index]);
  }
  const inputPath = args.get('--input');
  const outputPath = args.get('--output');
  const receipt = inputPath
    ? readJson(inputPath)
    : createBlockedReceipt({ recordedAt: '2026-08-01T23:45:00-05:00' });
  validateBackupRestoreReceipt(receipt, { requireComplete: args.get('--require-complete') === true });
  const serialized = `${JSON.stringify(receipt, null, 2)}\n`;
  if (outputPath) writeFileSync(resolve(outputPath), serialized, 'utf8');
  process.stdout.write(serialized);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`backup/restore verification failed: ${error.message}`);
    process.exitCode = 1;
  });
}
