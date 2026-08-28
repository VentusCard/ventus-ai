// pilot:e2e — the single artifact that runs the standalone Deposit Primacy journey end to end and
// prints the evidence summary. Source → operating loop → durable ledger → session-
// authorized delivery → outcome → coverage-gated lift.
//
// Runs GREEN today on fixtures. Each live leg activates when its credentials are present:
//   · DATABASE_URL            → lineage persists to the real Postgres ledger (else in-memory)
//   · SF_* + session secret   → delivery is a real, session-authorized Salesforce Task (else fixture)
//   · PLAID_*                 → live Deposit Primacy custom-user pull mapped into the operating loop
//
// This makes "we did three infrastructure steps" into one reproducible evidence readout.
import { createPilotOperatingLoop } from '../shared/pilot/pilot-operating-loop.mjs';
import { buildDeliveryReservation, createConnectorDeliveryRepository } from '../shared/pilot/connector-delivery.mjs';
import { assignExperiment, createMeasurementRepository, validateOutcomeEvent } from '../shared/pilot/experiment-measurement.mjs';
import { compileGrowthPlayContract } from '../shared/pilot/growth-play-contract.mjs';
import { createGrowthPlayRegistry, createInMemoryGrowthPlayRegistry } from '../shared/pilot/growth-play-registry.mjs';
import { createDecisionLedgerRepository, verifyLedgerChain } from '../shared/pilot/decision-ledger.mjs';
import { assertNonBypassRole, createUrlDbFactory, databaseUrl } from '../shared/platform/db-url.mjs';
import { mintSessionDirect } from '../../api/connector-session.ts';
import {
  DEPOSIT_PRIMACY_CUSTOM_USER,
  buildPlaidSourceReceipt,
  mapPlaidToLoopRecords,
  pullPlaidTransactions,
} from '../shared/pilot/plaid-source.mjs';
import { standaloneGrowthPlayDetector } from '../shared/pilot/standalone-growth-play-detectors.mjs';
import { buildDepositRetentionSalesforceBody } from '../shared/pilot/salesforce-activation.mjs';
import { readFileSync } from 'node:fs';

const SALT = 'pilot-e2e-assignment-salt';
const TENANT = 'bank_pilot';
const RUN_ID = process.env.VENTUS_PILOT_RUN_ID || Date.now().toString(36);
const EXPERIMENT_ID = `deposit_pilot_${RUN_ID}`;
const playDrafts = JSON.parse(readFileSync(new URL('../fixtures/evaluation/growth-play-drafts.json', import.meta.url), 'utf8'));
const depositDraft = playDrafts.find((play) => play.growth_play_id === 'deposit-primacy-defense');
const DEPOSIT_PLAY = compileGrowthPlayContract({
  ...depositDraft,
  actions: [{
    action_id: 'banker_retention_review',
    owner_role: 'relationship_banker',
    connector: 'salesforce',
    destination: 'salesforce_fsc_task',
    destination_environment: 'sandbox',
  }],
  measurement: { ...depositDraft.measurement, minimum_per_arm: 1, minimum_coverage: 1 },
});

const hasDB = !!databaseUrl();
const protocolAdminUrl = (process.env.VENTUS_PROTOCOL_ADMIN_DATABASE_URL || '').trim() || null;
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
  return async ({ input, decision }) => {
    const deliveryBody = buildDepositRetentionSalesforceBody({
      input,
      decision,
      contactId: process.env.SF_DEMO_CONTACT_ID,
      accountId: process.env.SF_DEMO_ACCOUNT_ID,
    });
    const req = new Request('http://local/api/salesforce-deliver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${minted.token}` },
      body: JSON.stringify(deliveryBody),
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
      if (record && record.status === 'pending') {
        record.status = result.status;
        record.external_receipt_id = result.externalReceiptId;
        record.external_receipt_url = result.externalReceiptUrl;
        record.error_code = result.errorCode;
        record.completed_at = result.completedAt;
      }
      return { updated: true, record };
    },
  };
}

// The detector works on live Plaid or fixture records and can choose only an action from
// the compiled standalone Consumer Growth Play.
const detector = standaloneGrowthPlayDetector;

function record(id, rail, amount, sys) {
  return { transaction_id: id, rail, amount, source_system: sys, occurred_at: '2026-07-10T00:00:00.000Z', entity: 'tokenized_counterparty', category: 'evaluation_category', merchant_name: 'Tokenized Merchant' };
}

function input(householdToken, caseId, override = {}) {
  const records = override.records ?? [
    record('tx_payroll', 'ach', -4800, 'deposit_core'),
    record('tx_outflow', 'p2p', 2100, 'payments_core'),
  ];
  const sourceReceipt = override.sourceReceipt ?? {
    receiptId: `receipt_${caseId}`,
    sourceSystem: 'partner_sandbox',
    batchId: 'batch_001',
    schemaVersion: '1.0',
    recordCount: records.length,
    receivedAt: new Date(Date.now() - 10).toISOString(),
    evidenceClass: 'sandbox',
  };
  const sourceAt = Date.parse(sourceReceipt.receivedAt);
  const eligibilityAt = new Date(sourceAt + 1).toISOString();
  const assignedAt = new Date(sourceAt + 2).toISOString();
  const runAt = new Date(sourceAt + 3).toISOString();
  return {
    growthPlay: DEPOSIT_PLAY,
    tenantId: TENANT,
    caseId,
    householdToken,
    objective: DEPOSIT_PLAY.objective,
    runAt,
    activationMode: 'sandbox_assisted',
    destinationEnvironment: 'sandbox',
    sessionId: 'session_pilot_001',
    records,
    sourceReceipt,
    eligibilityReceipt: {
      receiptId: `eligibility_${caseId}`,
      criteriaVersion: DEPOSIT_PLAY.eligibility.criteria_version,
      eligible: true,
      evaluatedAt: eligibilityAt,
      evidenceTransactionIds: records.map((item) => item.transaction_id),
    },
    policyVersion: DEPOSIT_PLAY.policy.version,
    policies: DEPOSIT_PLAY.policy.required_policy_ids.map((policyId) => ({ policy_id: policyId, verdict: 'clear' })),
    experiment: {
      experimentId: EXPERIMENT_ID,
      holdoutPct: DEPOSIT_PLAY.measurement.holdout_pct,
      assignmentSalt: SALT,
      assignedAt,
    },
  };
}

// Pull the treatment household's records from live Plaid when configured. A configured
// live leg fails closed if the approved signal pattern never arrives; silently replacing
// it with fixtures would make a green evidence summary misleading.
async function treatmentSource() {
  if (!plaidConfigured) return { override: {}, mode: 'fixture' };
  const { transactions, mode, ready } = await pullPlaidTransactions({ customUser: DEPOSIT_PRIMACY_CUSTOM_USER });
  if (!transactions.length || !ready) {
    throw new Error(`configured Plaid source did not return the approved payroll + off-bank pattern (mode=${mode}, records=${transactions.length})`);
  }
  const records = mapPlaidToLoopRecords(transactions);
  return { override: { records, sourceReceipt: buildPlaidSourceReceipt(records, mode) }, mode };
}

function tokenForArm(arm) {
  for (let i = 0; i < 5000; i += 1) {
    const householdToken = `tok_household_${String(i).padStart(8, '0')}`;
    if (assignExperiment({ tenantId: TENANT, experimentId: EXPERIMENT_ID, householdToken, holdoutPct: 10, salt: SALT, evidenceClass: 'sandbox', assignedAt: '2026-01-01T00:00:00.000Z' }).arm === arm) return householdToken;
  }
  throw new Error(`no ${arm} token`);
}

function outcomeEvent(result, amount) {
  const occurredAt = new Date(Date.parse(result.assignment.assignedAt) + 30 * 86_400_000).toISOString();
  return {
    contract_version: '1.0', event_id: `event_${result.caseId}`, tenant_id: result.tenantId, household_token: result.householdToken,
    growth_play_id: DEPOSIT_PLAY.growth_play_id, decision_id: result.decisionId, activation_id: result.receipt?.delivery_id ?? null,
    event_type: 'deposit_balance_observed', occurred_at: occurredAt,
    assignment: {
      experiment_id: result.assignment.experimentId,
      arm: result.assignment.arm,
      assigned_at: result.assignment.assignedAt,
      decision_protocol_id: result.decisionProtocolId,
    },
    value: { metric: 'deposit_retained', amount, currency: 'USD' }, source_system: 'deposit_core_sandbox', source_record_id: null, reason_code: null,
  };
}

async function main() {
  const ledgerState = [];
  const state = { assignments: [], outcomes: [], receipts: [] };
  const getDB = hasDB ? createUrlDbFactory() : null;
  if (getDB) await assertNonBypassRole(getDB);
  const ledgerRepository = getDB ? createDecisionLedgerRepository({ getDB }) : inMemoryLedger(ledgerState);
  const measurementRepository = getDB ? createMeasurementRepository({ getDB }) : measurementRepo(state);
  const deliveryRepository = getDB ? createConnectorDeliveryRepository({ getDB }) : deliveryRepo(state);
  const protocolRegistry = getDB ? createGrowthPlayRegistry({ getDB }) : createInMemoryGrowthPlayRegistry();
  const protocolAdminRegistry = getDB && protocolAdminUrl
    ? createGrowthPlayRegistry({ getDB: createUrlDbFactory({ connectionString: protocolAdminUrl }) })
    : protocolRegistry;
  const approvedAt = new Date(Date.now() - 60_000).toISOString();
  if (!getDB || protocolAdminUrl) {
    await protocolAdminRegistry.register({
      tenantId: TENANT,
      contract: DEPOSIT_PLAY,
      registeredBy: 'pilot_e2e_configurator',
      registeredBySessionId: `pilot_config_session_${RUN_ID}`,
      identityProvider: 'pilot_nonprod_control',
      registeredAt: new Date(Date.now() - 120_000).toISOString(),
    });
    await protocolAdminRegistry.recordApproval({
      tenantId: TENANT,
      decisionProtocolId: DEPOSIT_PLAY.decision_protocol_id,
      businessLine: DEPOSIT_PLAY.business_line,
      decision: 'approved',
      decidedBy: 'consumer_banking_pilot_owner',
      decidedBySessionId: `pilot_approval_session_${RUN_ID}`,
      identityProvider: 'pilot_nonprod_control',
      decidedAt: approvedAt,
      changeRecordId: `pilot_change_${RUN_ID}`,
      reason: 'Approved for this reproducible sandbox-assisted pilot run.',
    });
  } else {
    try {
      await protocolRegistry.requireApproved({
        tenantId: TENANT,
        decisionProtocolId: DEPOSIT_PLAY.decision_protocol_id,
        businessLine: DEPOSIT_PLAY.business_line,
        at: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error(
        `Durable pilot requires a pre-approved ${DEPOSIT_PLAY.decision_protocol_id} protocol, `
        + `or VENTUS_PROTOCOL_ADMIN_DATABASE_URL for controlled non-production setup: ${error.message}`,
      );
    }
  }
  const loop = createPilotOperatingLoop({
    detector,
    protocolRegistry,
    ledgerRepository,
    measurementRepository,
    deliveryRepository,
    deliver: await makeDeliver(),
  });

  const src = await treatmentSource();
  const treatmentInput = input(tokenForArm('treatment'), `deposit_treatment_${RUN_ID}`, src.override);
  const treatment = await loop.runHousehold(treatmentInput);
  if (treatment.decision?.abstain || treatment.activation !== 'delivered' || !treatment.receipt?.external_receipt_id) {
    const rows = treatmentInput.records
      .map((record) => `${record.rail}:${record.amount}:${record.merchant_name}`)
      .join(', ');
    throw new Error(
      `treatment did not complete the approved activation: reason=${treatment.decision?.abstainReason ?? 'none'}; `
      + `activation=${treatment.activation}; source=${rows}`,
    );
  }
  await loop.runHousehold(treatmentInput); // idempotency replay
  const holdoutInput = input(tokenForArm('holdout'), `deposit_holdout_${RUN_ID}`);
  const holdout = await loop.runHousehold(holdoutInput);

  await loop.recordOutcome(outcomeEvent(treatment, 200), treatmentInput.growthPlay);
  await loop.recordOutcome(outcomeEvent(holdout, 100), holdoutInput.growthPlay);
  const measurement = await loop.measureExperiment({ tenantId: TENANT, experimentId: EXPERIMENT_ID, growthPlay: DEPOSIT_PLAY });

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
  console.log(`config          source=${sourceMode}  ledger=${hasDB ? 'postgres' : 'memory'}  registry=${hasDB ? 'postgres' : 'memory'}  delivery=${sfConfigured ? 'salesforce-session' : 'fixture'}`);
  console.log(`protocol        ${DEPOSIT_PLAY.decision_protocol_id} · approval=${!getDB || protocolAdminUrl ? `pilot_change_${RUN_ID}` : 'pre-registered'}`);
  console.log(`source receipt  ${treatment.evidenceClass} evidence · ${treatmentInput.sourceReceipt.sourceSystem} · ${treatmentInput.records.length} records`);
  if (src.override.records) console.log(`  plaid         live pull → ${treatmentInput.records.length} tokenized records → decision cites ${treatment.decision.evidence.map((e) => e.transaction_id).join(', ')}`);
  console.log(`ledger          ${ledgerLine}`);
  console.log(`assignment      treatment arm=${treatment.assignment.arm} · holdout arm=${holdout.assignment.arm} (assigned before detector; holdout bypassed it)`);
  console.log(`delivery        route=${treatment.receipt ? 'reserved+delivered' : 'n/a'} · activation=${treatment.activation}`);
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
  assert.equal(treatment.decision.abstain, false);
  assert.equal(treatment.activation, 'delivered');
  assert.ok(treatment.receipt.external_receipt_id);
  assert.equal(holdout.assignment.arm, 'holdout');
  assert.equal(holdout.activation, 'holdout');
  assert.equal(holdout.decision, null);
  assert.equal(measurement.status, 'measured');
  assert.equal(measurement.absoluteLift, 100);
  assert.equal(measurement.businessClaimAllowed, false);
  if (hasDB) { const ex = await ledgerRepository.exportTenant(TENANT); assert.equal(ex.verified, true, 'persisted chain must verify'); assert.ok(verifyLedgerChain(ex.events)); }
  console.log('✓ guardrails: protocol registered + approved, holdout bypassed decisioning, lift measured, no business claim, chain intact.\n');
}

main().catch((e) => { console.error('pilot:e2e failed:', e.message); process.exit(1); });
