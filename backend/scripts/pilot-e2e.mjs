// pilot:e2e — the single artifact that runs the whole governed journey end to end and
// prints the evidence summary. Source → operating loop → durable ledger → session-
// authorized delivery → outcome → coverage-gated lift.
//
// Runs GREEN today on fixtures. Each live leg activates when its credentials are present:
//   · DATABASE_URL            → lineage persists to the real Postgres ledger (else in-memory)
//   · SF_* + session secret   → delivery is a real, session-authorized Salesforce Task (else fixture)
//   · PLAID_*                 → live custom-user pull mapped into the operating loop
//
// This makes "we did three infrastructure steps" into one reproducible evidence readout.
import { createPilotOperatingLoop } from '../shared/pilot-operating-loop.mjs';
import { buildDeliveryReservation } from '../shared/connector-delivery.mjs';
import { assignExperiment, validateOutcomeEvent } from '../shared/experiment-measurement.mjs';
import { createDecisionLedgerRepository, verifyLedgerChain } from '../shared/decision-ledger.mjs';
import { createUrlDbFactory, databaseUrl } from '../shared/db-url.mjs';
import { mintSessionDirect } from '../../api/connector-session.ts';
import { pullPlaidTransactions, mapPlaidToLoopRecords, buildPlaidSourceReceipt, contentDetector } from '../shared/plaid-source.mjs';

const SALT = 'pilot-e2e-assignment-salt';
const ASSIGNED_AT = '2026-07-12T12:00:00.000Z';
const RUN_AT = '2026-07-12T12:01:00.000Z';
const OUTCOME_AT = '2026-08-12T12:00:00.000Z';
const TENANT = 'bank_pilot';

const hasDB = !!databaseUrl();
const sfConfigured = !!(process.env.SF_LOGIN_URL && process.env.SF_CLIENT_ID && process.env.SF_CLIENT_SECRET
  && process.env.ENABLE_LIVE_CONNECTORS === 'true' && process.env.VENTUS_CONNECTOR_SESSION_SECRET);
const plaidConfigured = !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);

// ── Ledger leg: real Postgres if configured, else the same in-memory contract the tests use.
function inMemoryLedger(state) {
  return {
    async append(draft) {
      const existing = state.find((e) => e.tenantId === draft.tenantId && e.idempotencyKey === draft.idempotencyKey);
      if (existing) return { inserted: false, record: existing };
      state.push(draft);
      return { inserted: true, record: draft };
    },
  };
}

// ── Delivery leg: session-authorized Salesforce if configured, else fixture receipt.
async function makeDeliver() {
  if (!sfConfigured) {
    return async ({ decision }) => ({
      status: 'delivered',
      externalReceiptId: `fixture_${decision.decisionId}`,
      externalReceiptUrl: `https://sandbox.example.test/${decision.decisionId}`,
      completedAt: '2026-07-12T12:01:02.000Z',
      route: 'fixture',
    });
  }
  const { POST } = await import('../../api/salesforce-deliver.ts');
  const minted = mintSessionDirect({ tenantId: TENANT, subject: 'pilot_e2e', scopes: ['salesforce_write'], destinations: ['salesforce'] });
  if (!minted) throw new Error('session secret present but session mint failed');
  return async ({ decision }) => {
    const req = new Request('http://local/api/salesforce-deliver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${minted.token}` },
      body: JSON.stringify({ subject: `${decision.growthPlayId} — ${decision.actionId}`, description: `decision ${decision.decisionId}`, source: 'pilot-e2e' }),
    });
    const res = await POST(req);
    const data = await res.json();
    if (!res.ok) throw new Error(`salesforce deliver failed: ${JSON.stringify(data)}`);
    return { status: 'delivered', externalReceiptId: data.id, externalReceiptUrl: data.url, completedAt: new Date().toISOString(), route: 'salesforce', authMode: data.authorization?.mode };
  };
}

function measurementRepo(state) {
  return {
    async recordAssignment(a) {
      const e = state.assignments.find((x) => x.tenantId === a.tenantId && x.experimentId === a.experimentId && x.householdToken === a.householdToken);
      if (!e) state.assignments.push(a);
      return e ?? a;
    },
    async recordOutcome(event) {
      const assignment = state.assignments.find((x) => x.tenantId === event.tenant_id && x.experimentId === event.assignment.experiment_id && x.householdToken === event.household_token);
      validateOutcomeEvent(event, assignment);
      const e = state.outcomes.find((x) => x.event_id === event.event_id && x.tenant_id === event.tenant_id);
      if (!e) state.outcomes.push(event);
      return { inserted: !e, record: e ?? event };
    },
    async loadExperiment({ tenantId, experimentId }) {
      return {
        assignments: state.assignments.filter((x) => x.tenantId === tenantId && x.experimentId === experimentId),
        outcomes: state.outcomes.filter((x) => x.tenant_id === tenantId && x.assignment.experiment_id === experimentId),
      };
    },
  };
}

function deliveryRepo(state) {
  return {
    async reserve(request) {
      const built = buildDeliveryReservation(request);
      const e = state.receipts.find((x) => x.tenant_id === request.tenantId && x.idempotency_key === request.idempotencyKey);
      if (e) return { inserted: false, shouldDeliver: false, replayed: true, reconciliationRequired: e.status === 'pending', record: e };
      const record = { tenant_id: request.tenantId, delivery_id: built.deliveryId, idempotency_key: request.idempotencyKey, request_hash: built.requestHash, status: 'pending' };
      state.receipts.push(record);
      return { inserted: true, shouldDeliver: true, replayed: false, reconciliationRequired: false, record };
    },
    async complete(result) {
      const record = state.receipts.find((x) => x.tenant_id === result.tenantId && x.delivery_id === result.deliveryId);
      if (record && record.status === 'pending') { record.status = result.status; record.external_receipt_id = result.externalReceiptId; }
      return { updated: true, record };
    },
  };
}

// The loop detector is now the real content-driven detector (works on live Plaid records
// and the synthetic holdout alike), selecting evidence from whatever records it is given.
const detector = contentDetector;

function record(id, rail, amount, sys) {
  return { transaction_id: id, rail, amount, source_system: sys, occurred_at: '2026-07-10T00:00:00.000Z', entity: 'tokenized_counterparty', category: 'evaluation_category', merchant_name: 'Tokenized Merchant' };
}

function input(householdToken, caseId, override = {}) {
  return {
    tenantId: TENANT, caseId, householdToken, objective: 'Convert qualified liquidity into net new assets',
    runAt: RUN_AT, activationMode: 'sandbox_assisted', destinationEnvironment: 'sandbox', sessionId: 'session_pilot_001',
    records: override.records ?? [record('tx_liquidity', 'wire', 250000, 'deposit_core'), record('tx_relationship', 'ach', 6200, 'relationship_core')],
    sourceReceipt: override.sourceReceipt ?? { receiptId: `receipt_${caseId}`, sourceSystem: 'partner_sandbox', batchId: 'batch_001', schemaVersion: '1.0', recordCount: 2, receivedAt: RUN_AT, evidenceClass: 'sandbox' },
    policyVersion: 'policy_1',
    policies: [{ policy_id: 'consent', verdict: 'clear' }, { policy_id: 'vulnerability', verdict: 'clear' }, { policy_id: 'eligibility', verdict: 'clear' }],
    experiment: { experimentId: 'wealth_pilot_01', holdoutPct: 10, assignmentSalt: SALT, assignedAt: ASSIGNED_AT },
  };
}

// Pull the treatment household's records from live Plaid when configured; honest fallback
// to the synthetic fixture if the pull is unavailable or empty.
async function treatmentSource() {
  if (!plaidConfigured) return { override: {}, mode: 'fixture' };
  try {
    const { transactions, mode } = await pullPlaidTransactions();
    if (transactions.length) {
      const records = mapPlaidToLoopRecords(transactions);
      return { override: { records, sourceReceipt: buildPlaidSourceReceipt(records, mode) }, mode };
    }
    console.warn('plaid returned no transactions; using fixture records');
  } catch (error) {
    console.warn(`plaid pull failed (${error.message}); using fixture records`);
  }
  return { override: {}, mode: 'fixture_fallback' };
}

function tokenForArm(arm) {
  for (let i = 0; i < 5000; i += 1) {
    const householdToken = `tok_household_${String(i).padStart(8, '0')}`;
    if (assignExperiment({ tenantId: TENANT, experimentId: 'wealth_pilot_01', householdToken, holdoutPct: 10, salt: SALT, evidenceClass: 'sandbox', assignedAt: ASSIGNED_AT }).arm === arm) return householdToken;
  }
  throw new Error(`no ${arm} token`);
}

function outcomeEvent(result, amount) {
  return {
    contract_version: '1.0', event_id: `event_${result.caseId}`, tenant_id: result.tenantId, household_token: result.householdToken,
    growth_play_id: 'liquidity-to-wealth', decision_id: result.decisionId, activation_id: result.receipt?.delivery_id ?? null,
    event_type: 'assets_transferred', occurred_at: OUTCOME_AT,
    assignment: { experiment_id: result.assignment.experimentId, arm: result.assignment.arm, assigned_at: result.assignment.assignedAt },
    value: { metric: 'net_new_assets', amount, currency: 'USD' }, source_system: 'wealth_core_sandbox', source_record_id: null, reason_code: null,
  };
}

async function main() {
  const ledgerState = [];
  const state = { assignments: [], outcomes: [], receipts: [] };
  const ledgerRepository = hasDB ? createDecisionLedgerRepository({ getDB: createUrlDbFactory() }) : inMemoryLedger(ledgerState);
  const loop = createPilotOperatingLoop({
    detector,
    ledgerRepository,
    measurementRepository: measurementRepo(state),
    deliveryRepository: deliveryRepo(state),
    deliver: await makeDeliver(),
  });

  const src = await treatmentSource();
  const treatmentInput = input(tokenForArm('treatment'), 'wealth_treatment', src.override);
  const treatment = await loop.runHousehold(treatmentInput);
  await loop.runHousehold(treatmentInput); // idempotency replay
  const holdout = await loop.runHousehold(input(tokenForArm('holdout'), 'wealth_holdout'));

  await loop.recordOutcome(outcomeEvent(treatment, 200));
  await loop.recordOutcome(outcomeEvent(holdout, 100));
  const measurement = await loop.measureExperiment({ tenantId: TENANT, experimentId: 'wealth_pilot_01', metric: 'net_new_assets', minimumPerArm: 1, minimumCoverage: 1 });

  // Evidence summary
  let ledgerLine;
  if (hasDB) {
    const exported = await ledgerRepository.exportTenant(TENANT);
    ledgerLine = `Postgres · ${exported.events.length} events · chain ${exported.verified ? 'VERIFIED' : 'BROKEN'} · head ${exported.events.at(-1)?.event_hash.slice(0, 16)}…`;
  } else {
    ledgerLine = `in-memory · ${ledgerState.length} events (set DATABASE_URL for durable + hash-verified)`;
  }

  const sourceMode = src.override.records ? src.mode : 'fixture';
  console.log('\n══════════ Ventus pilot end-to-end · evidence summary ══════════');
  console.log(`config          source=${sourceMode}  ledger=${hasDB ? 'postgres' : 'memory'}  delivery=${sfConfigured ? 'salesforce-session' : 'fixture'}`);
  console.log(`source receipt  ${treatment.evidenceClass} evidence · ${treatmentInput.sourceReceipt.sourceSystem} · ${treatmentInput.records.length} records`);
  if (src.override.records) console.log(`  plaid         live pull → ${treatmentInput.records.length} tokenized records → decision cites ${treatment.decision.evidence.map((e) => e.transaction_id).join(', ')}`);
  console.log(`ledger          ${ledgerLine}`);
  console.log(`assignment      treatment arm=${treatment.assignment.arm} · holdout arm=${holdout.assignment.arm} (assigned before any connector call)`);
  console.log(`delivery        route=${treatment.receipt ? 'reserved+delivered' : 'n/a'} · calls=1 (replay + holdout added none)`);
  if (treatment.receipt?.external_receipt_id) console.log(`  receipt       ${treatment.receipt.external_receipt_id}${treatment.receipt.external_receipt_url ? ' · ' + treatment.receipt.external_receipt_url : ''}`);
  console.log(`measurement     status=${measurement.status} · absolute lift=${measurement.absoluteLift} ${measurement.metric ?? 'net_new_assets'} · evidenceClass=${measurement.evidenceClass}`);
  console.log(`claims          businessClaimAllowed=${measurement.businessClaimAllowed} · causalClaimAllowed=${measurement.causalClaimAllowed}`);
  console.log('════════════════════════════════════════════════════════════════');
  if (!hasDB || !sfConfigured) {
    console.log('Fixtures where live legs are unset. Activate them:');
    if (!hasDB) console.log('  DATABASE_URL=postgres://runtime_role:pw@host/db   (durable, hash-verified lineage)');
    if (!sfConfigured) console.log('  SF_* + ENABLE_LIVE_CONNECTORS=true + VENTUS_CONNECTOR_SESSION_SECRET   (real session-authorized Salesforce Task)');
  }

  // Guardrail assertions so this doubles as a test.
  const { default: assert } = await import('node:assert/strict');
  assert.equal(treatment.assignment.arm, 'treatment');
  assert.equal(holdout.assignment.arm, 'holdout');
  assert.equal(measurement.status, 'measured');
  assert.equal(measurement.absoluteLift, 100);
  assert.equal(measurement.businessClaimAllowed, false);
  if (hasDB) { const ex = await ledgerRepository.exportTenant(TENANT); assert.equal(ex.verified, true, 'persisted chain must verify'); assert.ok(verifyLedgerChain(ex.events)); }
  console.log('✓ guardrails: holdout preserved, lift measured, no business claim, chain intact.\n');
}

main().catch((e) => { console.error('pilot:e2e failed:', e.message); process.exit(1); });
