import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import {
  buildProtocolApproval,
  createInMemoryGrowthPlayRegistry,
} from './growth-play-registry.mjs';

const drafts = JSON.parse(readFileSync(new URL('../../fixtures/evaluation/growth-play-drafts.json', import.meta.url), 'utf8'));
const deposit = compileGrowthPlayContract(drafts[0]);
const merrill = compileGrowthPlayContract(drafts[1]);
const REGISTERED_AT = '2026-07-12T10:00:00.000Z';
const APPROVED_AT = '2026-07-12T11:00:00.000Z';
const RUN_AT = '2026-07-12T12:00:00.000Z';

test('tenant and business-line approval resolves only the exact compiled protocol', async () => {
  const registry = createInMemoryGrowthPlayRegistry();
  await registerAndApprove(registry, 'bank_1', deposit);
  const receipt = await registry.requireApproved({
    tenantId: 'bank_1',
    decisionProtocolId: deposit.decision_protocol_id,
    businessLine: 'consumer-banking',
    at: RUN_AT,
  });
  assert.equal(receipt.decisionProtocolId, deposit.decision_protocol_id);
  assert.equal(receipt.growthPlayId, 'deposit-primacy-defense');
  assert.equal(receipt.changeRecordId, 'change_deposit_001');

  await assert.rejects(() => registry.requireApproved({
    tenantId: 'bank_2',
    decisionProtocolId: deposit.decision_protocol_id,
    businessLine: 'consumer-banking',
    at: RUN_AT,
  }), /not registered and approved/);
  await assert.rejects(() => registry.requireApproved({
    tenantId: 'bank_1',
    decisionProtocolId: deposit.decision_protocol_id,
    businessLine: 'wealth-management',
    at: RUN_AT,
  }), /not registered and approved/);
});

test('revocation fails closed from its effective timestamp without rewriting history', async () => {
  const registry = createInMemoryGrowthPlayRegistry();
  await registerAndApprove(registry, 'bank_1', merrill);
  await registry.recordApproval({
    tenantId: 'bank_1',
    decisionProtocolId: merrill.decision_protocol_id,
    businessLine: merrill.business_line,
    decision: 'revoked',
    decidedBy: 'policy_owner_1',
    decidedBySessionId: 'session_policy_owner_1',
    identityProvider: 'bank_sso',
    decidedAt: '2026-07-13T00:00:00.000Z',
    changeRecordId: 'change_merrill_revoke_001',
    reason: 'Policy owner suspended activation pending review.',
  });
  const historical = await registry.requireApproved({
    tenantId: 'bank_1',
    decisionProtocolId: merrill.decision_protocol_id,
    businessLine: 'wealth-management',
    at: RUN_AT,
  });
  assert.equal(historical.changeRecordId, 'change_merrill_001');
  await assert.rejects(() => registry.requireApproved({
    tenantId: 'bank_1',
    decisionProtocolId: merrill.decision_protocol_id,
    businessLine: 'wealth-management',
    at: '2026-07-13T00:00:01.000Z',
  }), /not approved at run time/);
});

test('approval IDs are deterministic and approvals cannot predate registration', async () => {
  const input = {
    tenantId: 'bank_1',
    decisionProtocolId: deposit.decision_protocol_id,
    businessLine: deposit.business_line,
    decision: 'approved',
    decidedBy: 'consumer_owner_1',
    decidedBySessionId: 'session_consumer_owner_1',
    identityProvider: 'bank_sso',
    decidedAt: APPROVED_AT,
    changeRecordId: 'change_deposit_001',
    reason: 'Approved for the sandbox-assisted pilot.',
  };
  assert.equal(buildProtocolApproval(input).approvalEventId, buildProtocolApproval(input).approvalEventId);
  const registry = createInMemoryGrowthPlayRegistry();
  await registry.register({
    tenantId: 'bank_1', contract: deposit, registeredBy: 'ops_1',
    registeredBySessionId: 'session_ops_1', identityProvider: 'bank_sso', registeredAt: REGISTERED_AT,
  });
  await assert.rejects(() => registry.recordApproval({
    ...input,
    decidedAt: '2026-07-12T09:59:59.000Z',
  }), /cannot predate/);
});

async function registerAndApprove(registry, tenantId, contract) {
  await registry.register({
    tenantId,
    contract,
    registeredBy: 'pilot_ops_1',
    registeredBySessionId: 'session_pilot_ops_1',
    identityProvider: 'bank_sso',
    registeredAt: REGISTERED_AT,
  });
  await registry.recordApproval({
    tenantId,
    decisionProtocolId: contract.decision_protocol_id,
    businessLine: contract.business_line,
    decision: 'approved',
    decidedBy: `${contract.business_line}_owner`,
    decidedBySessionId: `session_${contract.business_line}_owner`,
    identityProvider: 'bank_sso',
    decidedAt: APPROVED_AT,
    changeRecordId: `change_${contract.growth_play_id.startsWith('deposit') ? 'deposit' : 'merrill'}_001`,
    reason: 'Approved for the sandbox-assisted pilot.',
  });
}
