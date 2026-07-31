import assert from 'node:assert/strict';
import test from 'node:test';
import { createControlledSandboxRunner } from './controlled-sandbox-run.mjs';

const approval = {
  decisionProtocolId: 'dcp_sandbox_001',
  growthPlayId: 'deposit-primacy-defense',
  businessLine: 'consumer-banking',
  protocolDigest: 'a'.repeat(64),
  decidedAt: '2026-07-31T12:00:00.000Z',
  contract: {
    policy: { version: 'policy_sandbox_001' },
    measurement: { holdout_pct: 20 },
  },
};

test('controlled sandbox cohort assigns both arms before evaluating one treatment path', async () => {
  const assignments = [];
  const events = [];
  const decisions = [];
  const runner = createControlledSandboxRunner({
    assignmentSalt: 'sandbox-assignment-salt-must-be-long-enough',
    growthPlayRegistry: { async requireLatestApproved() { return approval; } },
    measurementRepository: { async recordAssignment(assignment) { assignments.push(assignment); } },
    ledgerRepository: { async append(event) { events.push(event); return { inserted: true, record: {} }; } },
    async pullPlaidScenario({ cohortMemberId }) {
      assert.match(cohortMemberId, /^sbx_[a-f0-9]{20}$/);
      return {
        ready: true,
        count: 2,
        transactions: [
          { name: 'ACME PAYROLL', amount: -4200 },
          { name: 'CHIME TRANSFER', amount: 1200 },
        ],
      };
    },
    executeDecision(input) {
      decisions.push(input);
      return { status: 'qualified', decisionId: 'dec_sandbox_001', opportunity: { confidence: 91 } };
    },
    async appendDecision({ decision, requestId }) {
      return { decision, requestId, persisted: true, inserted: true, sequenceNumber: 7, eventHash: 'b'.repeat(64) };
    },
  });

  const result = await runner({
    tenantId: 'ventus',
    scenario: 'deposit-retention',
    requestId: 'request_sandbox_001',
    runAt: new Date('2026-07-31T13:00:00.000Z'),
  });

  assert.equal(assignments.length, 2);
  assert.deepEqual(assignments.map((assignment) => assignment.arm).sort(), ['holdout', 'treatment']);
  assert.equal(events.length, 4);
  assert.equal(events.filter((event) => event.eventType === 'signal').length, 2);
  assert.equal(decisions.length, 1);
  assert.equal(result.cohort.treatmentAssigned, 1);
  assert.equal(result.cohort.holdoutAssigned, 1);
  assert.equal(result.cohort.analysisEligible, false);
  assert.equal(result.cohort.participants.find((participant) => participant.arm === 'holdout')?.status, 'withheld');
  assert.equal(result.businessClaimAllowed, false);
  assert.equal(result.causalClaimAllowed, false);
  assert.deepEqual(result.sourceReceipt.safeActivity.sort(), ['external movement', 'income pattern']);
  assert.equal('householdToken' in result.assignment, false);
});
