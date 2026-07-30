import assert from 'node:assert/strict';
import test from 'node:test';
import { createConsoleApiHandler } from './console-api.mjs';
import { executeHostedDecision } from './hosted-decision-runtime.mjs';

const identity = {
  subject: 'cognito_subject_123',
  tenantHint: 'ventus',
  issuer: 'https://issuer.example.com/pool',
};
const membership = {
  email: 'operator@ventusai.com',
  role: 'institution_admin',
  status: 'active',
  entitlements: ['growth_console', 'wealth_demo'],
  businessLines: ['wealth'],
  queueScopes: ['wealth-advisory'],
};

test('Console API returns the institution-scoped principal', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async (token) => token === 'valid-token' ? identity : null,
    resolveMembership: async () => membership,
  });
  const result = await handler(request());
  const body = JSON.parse(result.body);

  assert.equal(result.statusCode, 200);
  assert.equal(body.tenantId, 'ventus');
  assert.equal(body.role, 'institution_admin');
  assert.deepEqual(body.entitlements, ['growth_console', 'wealth_demo']);
  assert.deepEqual(body.businessLineScopes, ['wealth']);
  assert.deepEqual(body.queueScopes, ['wealth-advisory']);
  assert.equal(body.authProvider, 'cognito');
  assert.equal(result.headers['Cache-Control'], 'no-store');
});

test('Console API fails closed for invalid tokens and inactive memberships', async () => {
  const invalidToken = createConsoleApiHandler({
    verifyIdentity: async () => null,
    resolveMembership: async () => membership,
  });
  assert.equal((await invalidToken(request())).statusCode, 401);

  const inactiveMembership = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => null,
  });
  assert.equal((await inactiveMembership(request())).statusCode, 403);
});

test('Console API reports pending access without granting console operations', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, status: 'pending' }),
    executeDecision: executeHostedDecision,
    appendDecision: async () => { throw new Error('should not write'); },
  });
  const access = JSON.parse((await handler(request())).body);
  assert.equal(access.status, 'pending');
  const decision = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run', body: JSON.stringify(decisionBody()),
  }));
  assert.equal(decision.statusCode, 403);
});

test('Console API rejects unapproved browser origins', async () => {
  process.env.VENTUS_ALLOWED_ORIGINS = 'https://dev.example.com';
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => membership,
  });
  const result = await handler(request('https://unapproved.example.com'));
  assert.equal(result.statusCode, 403);
});

test('Console API persists an entitled hosted decision and returns its receipt', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    executeDecision: executeHostedDecision,
    appendDecision: async ({ decision, requestId }) => ({
      persisted: true,
      inserted: true,
      sequenceNumber: 7,
      eventHash: `${decision.decisionId.slice(4).padEnd(64, '0')}`,
      recordedAt: '2026-07-30T00:00:00.000Z',
      requestId,
    }),
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify(decisionBody()),
  }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 200);
  assert.equal(body.status, 'qualified');
  assert.equal(body.tenantId, 'ventus');
  assert.equal(body.ledgerReceipt.persisted, true);
  assert.equal(body.ledgerReceipt.sequenceNumber, 7);
});

test('Console API blocks executive viewers even when scenario entitlements are present', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'executive_viewer',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
    }),
    executeDecision: executeHostedDecision,
    appendDecision: async () => { throw new Error('should not write'); },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify(decisionBody()),
  }));
  assert.equal(result.statusCode, 403);
});

test('Console API blocks operators outside the scenario business line', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['wealth-management'],
    }),
    executeDecision: executeHostedDecision,
    appendDecision: async () => { throw new Error('should not write'); },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify(decisionBody()),
  }));
  assert.equal(result.statusCode, 403);
});

test('Console API blocks a decision outside the operator entitlement', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => membership,
    executeDecision: executeHostedDecision,
    appendDecision: async () => { throw new Error('should not write'); },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify(decisionBody()),
  }));
  assert.equal(result.statusCode, 403);
});

test('Console API gives executives a durable aggregate Today view without customer Moments', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'executive_viewer',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    journey: {
      async listMoments() {
        return [moment('deposit-retention'), moment('wealth-growth')];
      },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    httpMethod: 'GET', path: '/staging/v1/console/today', body: undefined,
  }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 200);
  assert.equal(body.aggregateOnly, true);
  assert.equal(body.counts.total, 1);
  assert.equal(body.moments, undefined);
});

test('Console API records a response through the durable server contract', async () => {
  const calls = [];
  const consumerOperator = {
    ...membership,
    role: 'bank_operator',
    entitlements: ['growth_console', 'consumer_demo'],
    businessLines: ['consumer-banking'],
    queueScopes: [],
  };
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => consumerOperator,
    journey: {
      async loadMoment() { return moment('deposit-retention'); },
      async recordResponse(input) {
        calls.push(input);
        return { receipt: { sequenceNumber: 4 }, moment: moment('deposit-retention') };
      },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/moments/dec_123/responses',
    headers: { authorization: 'Bearer valid-token', origin: 'https://dev.example.com', 'idempotency-key': 'response_123' },
    body: JSON.stringify({
      expectedState: 'queued',
      clientRequestedAt: '2026-07-30T12:00:00.000Z',
      response: { status: 'accepted', actionId: 'banker-retention-review' },
    }),
  }));
  assert.equal(result.statusCode, 201);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].actorId, identity.subject);
  assert.equal(calls[0].idempotencyKey, 'response_123');
  assert.equal(calls[0].response.actionId, 'banker-retention-review');
});

test('Console API rejects a response once a Moment has left the queued state', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    journey: {
      async loadMoment() { return moment('deposit-retention'); },
      async recordResponse() { throw new Error('should not record'); },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/moments/dec_123/responses',
    headers: { authorization: 'Bearer valid-token', origin: 'https://dev.example.com', 'idempotency-key': 'response_456' },
    body: JSON.stringify({
      expectedState: 'approved',
      clientRequestedAt: '2026-07-30T12:00:00.000Z',
      response: { status: 'modified', actionId: 'digital-retention-message' },
    }),
  }));
  assert.equal(result.statusCode, 400);
});

test('Console API does not permit a cross-business delivery reservation', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    journey: {
      async loadMoment() { return moment('wealth-growth'); },
      async reserveDelivery() { throw new Error('should not reserve'); },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/moments/dec_wealth/deliveries',
    headers: { authorization: 'Bearer valid-token', origin: 'https://dev.example.com', 'idempotency-key': 'delivery_123' },
    body: JSON.stringify({ expectedState: 'approved', clientRequestedAt: '2026-07-30T12:00:00.000Z' }),
  }));
  assert.equal(result.statusCode, 403);
});

function request(origin = 'https://dev.example.com', overrides = {}) {
  process.env.VENTUS_ALLOWED_ORIGINS = 'https://dev.example.com';
  return {
    httpMethod: 'POST',
    headers: {
      authorization: 'Bearer valid-token',
      origin,
    },
    requestContext: { requestId: 'test-request' },
    ...overrides,
  };
}

function decisionBody() {
  return {
    scenario: 'deposit-retention',
    source: { mode: 'fixture', name: 'Plaid-shaped fixture' },
    transactions: [
      {
        transaction_id: 'tx_payroll',
        name: 'PAYROLL',
        merchant_name: 'ADP',
        amount: -4200,
        date: '2026-07-01',
        personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
      },
      {
        transaction_id: 'tx_transfer',
        name: 'CHIME TRANSFER',
        merchant_name: 'Chime',
        amount: 1800,
        date: '2026-07-03',
        personal_finance_category: { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_ACCOUNT_TRANSFER' },
      },
    ],
  };
}

function moment(scenario) {
  return {
    id: `mom_${scenario}`,
    decisionId: `dec_${scenario}`,
    scenario,
    status: 'queued',
    createdAt: '2026-07-30T00:00:00.000Z',
    decisionPackage: { response: { status: 'pending' } },
  };
}
