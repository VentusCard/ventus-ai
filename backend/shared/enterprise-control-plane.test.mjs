import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFscMeasurementEvent } from './enterprise-control-plane.mjs';

test('FSC measurement promotion produces an immutable event tied to the existing assignment', () => {
  const event = buildFscMeasurementEvent({
    tenantId: 'pilot_bank',
    moment: { decisionPackage: { subject: { token: 'tok_abcdefgh' }, growthPlay: { id: 'deposit-primacy-defense' } } },
    outcome: { decisionId: 'dec_123', decisionRecordId: 'a09123456789012AAA' },
    observationReceipt: { observationId: 'obs_123', observation: { eventType: 'deposit_retained', sourceRecordId: 'core_123' } },
    assignment: { experiment_id: 'exp_123', arm: 'treatment', assigned_at: '2026-07-30T00:00:00.000Z', decision_protocol_id: 'deposit-retention-v1' },
    metric: 'deposit_retained', amount: 1, occurredAt: '2026-07-31T00:00:00.000Z',
  });

  assert.equal(event.contract_version, '1.0');
  assert.equal(event.assignment.experiment_id, 'exp_123');
  assert.equal(event.value.metric, 'deposit_retained');
  assert.match(event.event_id, /^evt_[a-f0-9]{24}$/);
});
