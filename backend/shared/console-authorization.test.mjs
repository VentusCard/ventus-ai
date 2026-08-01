import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CANONICAL_CONSOLE_ROLES,
  authorizeOutcomeReconciliation,
  authorizeOutcomeReconciliationService,
} from './console-authorization.mjs';

const membership = (role) => ({
  role,
  status: 'active',
  entitlements: ['growth_console'],
});
test('manual outcome reconciliation is limited to the risk reviewer', () => {
  for (const role of CANONICAL_CONSOLE_ROLES) {
    assert.equal(authorizeOutcomeReconciliation(membership(role)).allowed, role === 'risk_reviewer', role);
  }
});

test('scheduled outcome reconciliation requires the scoped service identity', () => {
  const service = {
    kind: 'service',
    serviceId: 'fsc_outcome_reconciler',
    status: 'active',
    tenantScopes: ['bank_1'],
  };
  assert.equal(authorizeOutcomeReconciliationService(service, 'bank_1').allowed, true);
  assert.equal(authorizeOutcomeReconciliationService(service, 'bank_2').allowed, false);
  assert.equal(authorizeOutcomeReconciliationService({ ...service, serviceId: 'other' }, 'bank_1').allowed, false);
  assert.equal(authorizeOutcomeReconciliationService(membership('risk_reviewer'), 'bank_1').allowed, false);
});
