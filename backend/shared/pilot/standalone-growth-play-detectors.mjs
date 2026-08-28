import assert from 'node:assert/strict';
import { depositPrimacyDetector } from './plaid-source.mjs';

export function standaloneGrowthPlayDetector(input) {
  if (input.growthPlay.growth_play_id === 'deposit-primacy-defense') {
    return depositPrimacyDetector(input);
  }
  if (input.growthPlay.growth_play_id === 'merrill-relationship-growth') {
    return merrillRelationshipDetector(input);
  }
  throw new assert.AssertionError({ message: `no promoted standalone detector for ${input.growthPlay.growth_play_id}` });
}

export function merrillRelationshipDetector({ records, policies, growthPlay, householdToken }) {
  const blocked = policies.some((policy) => policy.verdict === 'block');
  const transfer = records.find((record) => record.source_system === 'merrill_transfer_workflow'
    && record.rail === 'acats' && Math.abs(record.amount) >= 100_000);
  const relationship = records.find((record) => record.source_system === 'merrill_books'
    && record.rail === 'account');
  const engagement = records.find((record) => record.source_system === 'merrill_digital'
    && record.rail === 'digital' && record.amount > 0);
  const evidenceRecords = [transfer, relationship, engagement].filter(Boolean);
  if (evidenceRecords.length < 3) {
    const fallback = evidenceRecords[0] ?? records[0];
    return {
      growthPlayId: growthPlay.growth_play_id,
      abstain: true,
      abstainReason: 'No corroborated transfer, self-directed relationship, and planning-engagement pattern.',
      confidence: 0.5,
      evidence: [{
        transaction_id: fallback.transaction_id,
        signal_type: 'insufficient_relationship_growth_evidence',
        summary: 'Available evidence does not satisfy the approved Merrill trigger.',
      }],
      actionId: null,
      ownerRole: null,
      connector: null,
      destination: null,
      cohort: null,
      deliveryPayload: null,
    };
  }
  const action = growthPlay.actions[0];
  return {
    growthPlayId: growthPlay.growth_play_id,
    abstain: blocked,
    abstainReason: blocked ? 'Required policy blocks activation.' : null,
    confidence: 0.89,
    evidence: [
      { transaction_id: transfer.transaction_id, signal_type: 'asset_transfer_intent', summary: 'Qualified outside-asset transfer is in progress.' },
      { transaction_id: relationship.transaction_id, signal_type: 'self_directed_relationship', summary: 'Self-directed relationship has no assigned advisor.' },
      { transaction_id: engagement.transaction_id, signal_type: 'planning_engagement', summary: 'Recent planning engagement indicates active advice demand.' },
    ],
    actionId: blocked ? null : action.action_id,
    ownerRole: blocked ? null : action.owner_role,
    connector: blocked ? null : action.connector,
    destination: blocked ? null : action.destination,
    cohort: blocked ? null : 'qualified_self_directed_no_advisor',
    deliveryPayload: blocked ? null : { household_token: householdToken, action: action.action_id },
  };
}
