// Live persistence verification — proves the durable ledger end to end against a real
// Postgres: append a small governed journey through the SAME repository the app uses,
// read it back inside tenant context, and verify the hash chain from the database rows.
//
//   DATABASE_URL=postgres://runtime_role:pw@host:5432/db npm run db:verify
//
// Connect as the RUNTIME role here (NOSUPERUSER NOBYPASSRLS) — this is the role the app
// uses, and the script asserts it cannot bypass RLS before writing anything. Unset
// DATABASE_URL prints the setup path and exits 0 (honest no-op, like the connector tests).
import assert from 'node:assert/strict';
import { createDecisionLedgerRepository } from '../shared/pilot/decision-ledger.mjs';
import { createUrlDbFactory, databaseUrl, assertNonBypassRole } from '../shared/platform/db-url.mjs';

const TENANT = `evalt_${Date.now().toString(36)}`;
const PLAY = 'deposit-primacy-defense';
const HH = `tok_${'primacy'.padEnd(8, '0')}_${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

// A minimal but real lineage: signal → decision → activation → outcome.
function journey() {
  const base = { tenantId: TENANT, growthPlayId: PLAY, householdToken: HH, status: 'confirmed' };
  return [
    { ...base, idempotencyKey: `${TENANT}:signal:1`, eventType: 'signal', occurredAt: now(),
      payload: { signal_types: ['payroll', 'off_bank_transfer'], rails: 3 } },
    { ...base, idempotencyKey: `${TENANT}:decision:1`, eventType: 'decision', occurredAt: now(),
      payload: { decision_id: 'dec_1', cohort: 'primacy_risk', action: 'banker_conversation', channel: 'workbench', signal_types: ['payroll', 'off_bank_transfer'] } },
    { ...base, idempotencyKey: `${TENANT}:activation:1`, eventType: 'activation', occurredAt: now(),
      payload: { decision_id: 'dec_1', destination: 'salesforce', receipt: 'sbx-0001' } },
    { ...base, idempotencyKey: `${TENANT}:outcome:1`, eventType: 'outcome', status: 'pending', occurredAt: now(),
      payload: { decision_id: 'dec_1', measurement_window_days: 90 } },
  ];
}

async function main() {
  if (!databaseUrl()) {
    console.log('DATABASE_URL is unset — skipping live persistence verification.');
    console.log('Apply migrations first (npm run db:migrate as owner), then:');
    console.log('  DATABASE_URL=postgres://runtime_role:pw@host:5432/db npm run db:verify');
    process.exit(0);
  }

  const getDB = createUrlDbFactory();

  // Fail-safe: the whole tenant-isolation design collapses if this role can bypass RLS.
  const role = await assertNonBypassRole(getDB);
  console.log(`runtime role "${role.role}" verified NOSUPERUSER NOBYPASSRLS ✓`);

  const repo = createDecisionLedgerRepository({ getDB });
  const drafts = journey();

  // Append the journey; idempotency: appending twice must not double-write.
  let inserted = 0;
  for (const draft of drafts) {
    const r = await repo.append(draft);
    if (r.inserted) inserted += 1;
  }
  const replay = await repo.append(drafts[0]);
  assert.equal(replay.inserted, false, 'idempotency key replay must not insert again');

  // Read back inside tenant context and verify the chain from the persisted rows.
  const exported = await repo.exportTenant(TENANT);
  assert.equal(exported.verified, true, 'persisted hash chain must verify');
  assert.equal(exported.events.length, inserted, 'exported count matches inserted');
  const kinds = exported.events.map((e) => e.event_type);
  assert.deepEqual(kinds, ['signal', 'decision', 'activation', 'outcome'], 'lineage persisted in order');

  console.log('Durable ledger verified LIVE against Postgres:');
  console.log(` · tenant:   ${TENANT} (isolated)`);
  console.log(` · events:   ${exported.events.length} appended, chain verified from DB rows`);
  console.log(` · idempotency: replay of signal:1 did not double-write`);
  console.log(` · head hash: ${exported.events.at(-1).event_hash.slice(0, 16)}…`);
}

main().catch((error) => {
  console.error('live persistence verification failed:', error.message);
  process.exit(1);
});
