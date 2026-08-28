import assert from 'node:assert/strict';
import test from 'node:test';
import { createBlockedReceipt, validateBackupRestoreReceipt } from './verify-evidence-backup-restore.mjs';

test('backup/restore validator records blocked external authority without claiming resilience', () => {
  const receipt = createBlockedReceipt({ recordedAt: '2026-08-01T23:45:00-05:00' });
  validateBackupRestoreReceipt(receipt);
  assert.equal(receipt.status, 'blocked_external_dependency');
  assert.equal(receipt.restore.isolated, true);
  assert.equal(receipt.restore.serving, false);
  assert.equal(receipt.claimBoundary.resilienceClaimAllowed, false);
  assert.throws(() => validateBackupRestoreReceipt(receipt, { requireComplete: true }), /not complete/);
});

test('backup/restore validator accepts only an isolated, matching, fully verified receipt', () => {
  const receipt = createBlockedReceipt({ recordedAt: '2026-08-01T23:45:00-05:00' });
  Object.assign(receipt.source, {
    snapshotIdentifier: 'snapshot-verification-2026-08-01',
    snapshotTime: '2026-08-01T23:50:00Z',
  });
  Object.assign(receipt.restore, {
    targetIdentifier: 'ventus-evidence-restore-verification-2026-08-01',
    startedAt: '2026-08-01T23:55:00Z',
    completedAt: '2026-08-02T00:01:00Z',
    observedRtoSeconds: 360,
    observedRpoSeconds: 300,
    cleanupDisposition: 'removed_after_verification',
  });
  receipt.migrationInventory = [{ file: 'decision-ledger.sql', sha256: 'a'.repeat(64) }];
  receipt.tenantRlsProbe = { status: 'pass', crossTenantRows: 0, nonBypass: true };
  receipt.ledger = { status: 'verified', verified: true, sourceHeadHash: 'b'.repeat(64), restoredHeadHash: 'b'.repeat(64) };
  receipt.status = 'completed';
  receipt.dependencies = [];
  validateBackupRestoreReceipt(receipt, { requireComplete: true });
  assert.equal(receipt.restore.targetIdentifier, 'ventus-evidence-restore-verification-2026-08-01');
});

test('backup/restore validator rejects serving or source-overwriting targets', () => {
  const serving = createBlockedReceipt();
  serving.restore.serving = true;
  assert.throws(() => validateBackupRestoreReceipt(serving), /must not serve/);

  const sameTarget = createBlockedReceipt();
  sameTarget.restore.targetIdentifier = sameTarget.source.clusterIdentifier;
  assert.throws(() => validateBackupRestoreReceipt(sameTarget), /must differ from source/);
});

test('backup/restore validator rejects secret-bearing fields', () => {
  const receipt = createBlockedReceipt();
  receipt.source.accessToken = 'not allowed';
  assert.throws(() => validateBackupRestoreReceipt(receipt), /secret-bearing field/);
});
