import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test, { afterEach } from 'node:test';
import {
  buildSalesforceTaskRecord,
  createDemoConnectorService,
  demoScenarioReady,
  DemoConnectorError,
} from './demo-connectors.mjs';
import { createHandler } from '../../functions/ventus-demo-connectors/index.mjs';

const managedEnvironment = [
  'ENABLE_LIVE_CONNECTORS',
  'VENTUS_ENABLE_DEMO_CONNECTOR_SESSION',
  'VENTUS_ALLOWED_ORIGINS',
];
const originalEnvironment = Object.fromEntries(managedEnvironment.map((name) => [name, process.env[name]]));
const configuredSecrets = {
  sessionSigningSecret: 'demo-session-signing-secret-at-least-32-characters',
  plaidClientId: 'plaid-client',
  plaidSecret: 'plaid-secret',
  salesforceLoginUrl: 'https://example.my.salesforce.com',
  salesforceClientId: 'salesforce-client',
  salesforceClientSecret: 'salesforce-secret',
};

afterEach(() => {
  for (const name of managedEnvironment) {
    const original = originalEnvironment[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

test('demo session is short-lived, scoped, and reports configured connectors', async () => {
  const service = createDemoConnectorService({
    getSecrets: async () => configuredSecrets,
    now: () => Date.UTC(2026, 6, 13),
  });
  const session = await service.issueSession({ tenantId: 'bank_demo' });
  assert.equal(session.connectors.plaid, true);
  assert.equal(session.connectors.salesforce, true);
  assert.equal(session.tenantId, 'bank_demo');
  assert.equal(session.subject, 'demo_operator');
  assert.equal(session.role, 'operator');
  assert.equal(session.expiresAt - Math.floor(Date.UTC(2026, 6, 13) / 1000), 900);
  await assert.rejects(
    service.pullPlaidTransactions({ authorization: 'Bearer invalid', scenario: 'deposit-retention' }),
    (error) => error instanceof DemoConnectorError && error.status === 403,
  );
});

test('demo session rejects expired and future-issued tokens', async () => {
  let currentTime = Date.UTC(2026, 6, 13);
  const service = createDemoConnectorService({
    getSecrets: async () => configuredSecrets,
    now: () => currentTime,
  });
  const session = await service.issueSession();
  currentTime += 16 * 60 * 1000;
  await assert.rejects(
    service.pullPlaidTransactions({ authorization: `Bearer ${session.token}` }),
    (error) => error instanceof DemoConnectorError && error.status === 403,
  );

  const issuedAt = Math.floor(currentTime / 1000) + 120;
  const futureToken = signTestSession({ iat: issuedAt, exp: issuedAt + 900 });
  await assert.rejects(
    service.pullPlaidTransactions({ authorization: `Bearer ${futureToken}` }),
    (error) => error instanceof DemoConnectorError && error.status === 403,
  );
});

test('operator connector sessions cannot inspect institution mappings', async () => {
  const service = createDemoConnectorService({
    getSecrets: async () => configuredSecrets,
    now: () => Date.UTC(2026, 6, 13),
  });
  const session = await service.issueSession({ role: 'operator' });
  await assert.rejects(
    service.discoverSalesforce({ authorization: `Bearer ${session.token}` }),
    (error) => error instanceof DemoConnectorError && error.status === 403,
  );
});

test('Plaid custom-user pull returns a scenario-ready sandbox receipt', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.endsWith('/sandbox/public_token/create')) return json({ public_token: 'public-sandbox' });
    if (url.endsWith('/item/public_token/exchange')) return json({ access_token: 'access-sandbox' });
    if (url.endsWith('/transactions/get')) {
      return json({
        transactions: [
          { name: 'ACME PAYROLL', amount: -4800, personal_finance_category: { primary: 'INCOME' } },
          { name: 'CHIME TRANSFER', amount: 1850, personal_finance_category: { primary: 'TRANSFER_OUT' } },
        ],
      });
    }
    throw new Error(`unexpected URL ${url}`);
  };
  const service = createDemoConnectorService({
    getSecrets: async () => configuredSecrets,
    fetchImpl,
    sleep: async () => {},
    now: () => Date.UTC(2026, 6, 13),
  });
  const session = await service.issueSession();
  const result = await service.pullPlaidTransactions({
    authorization: `Bearer ${session.token}`,
    scenario: 'deposit-retention',
  });
  assert.equal(result.ready, true);
  assert.equal(result.count, 2);
  assert.equal(result.authorization.mode, 'session');
  assert.equal(calls.length, 3);
});

test('Salesforce delivery creates one banker-ready standard Task', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith('/services/oauth2/token')) {
      return json({ access_token: 'salesforce-access', instance_url: 'https://instance.salesforce.com' });
    }
    if (url.endsWith('/services/data/v61.0/sobjects/Task')) return json({ id: '00TdemoTask', success: true });
    throw new Error(`unexpected URL ${url}`);
  };
  const service = createDemoConnectorService({
    getSecrets: async () => configuredSecrets,
    fetchImpl,
    now: () => Date.UTC(2026, 6, 13),
  });
  const session = await service.issueSession();
  const result = await service.createSalesforceTask({
    authorization: `Bearer ${session.token}`,
    body: {
      subject: 'Primary deposit relationship review',
      insight: {
        growthPlay: 'Deposit Primacy Defense',
        whyNow: 'Payroll and spending are moving off-bank.',
        recommendedAction: 'Contact the customer before the next payroll cycle.',
        expectedOutcome: 'Protect the primary deposit relationship',
        confidence: 94,
        destination: 'Banker workbench',
        evidence: [{ label: 'Split payroll detected', confidence: 96 }],
        controls: ['Uniform offer criteria'],
      },
    },
  });
  assert.equal(result.id, '00TdemoTask');
  assert.match(result.url, /00TdemoTask/);
  const task = JSON.parse(requests[1].options.body);
  assert.equal(task.Subject, 'Primary deposit relationship review');
  assert.match(task.Description, /WHY THIS NEEDS ATTENTION/);
  assert.match(task.Description, /RECOMMENDED NEXT STEP/);
  assert.match(task.Description, /POLICY CONTROLS/);
  assert.match(task.Description, /Attached for review/);
});

test('AWS handler is default-off, origin-bound, and routes without an API key', async () => {
  const fakeService = {
    issueSession: async () => ({ token: 'scoped-token', expiresAt: 1, connectors: { plaid: true, salesforce: true } }),
    pullPlaidTransactions: async () => ({ source: 'plaid', transactions: [] }),
    createSalesforceTask: async () => ({ id: '00Tdemo' }),
    discoverSalesforce: async () => ({ system: 'Salesforce FSC' }),
    verifySalesforceAccount: async () => ({ account: { verified: true } }),
    deliverSalesforce: async () => ({ id: 'a01decision' }),
    readSalesforceOutcome: async () => ({ outcome: { status: 'measuring' } }),
  };
  const handler = createHandler({ connectorService: fakeService });
  const event = requestEvent('/v1/demo/session');
  assert.equal((await handler(event)).statusCode, 404);

  process.env.ENABLE_LIVE_CONNECTORS = 'true';
  process.env.VENTUS_ENABLE_DEMO_CONNECTOR_SESSION = 'true';
  process.env.VENTUS_ALLOWED_ORIGINS = 'https://demo.ventusai.com';
  assert.equal((await handler(requestEvent('/v1/demo/session', 'https://other.example'))).statusCode, 403);
  const response = await handler(requestEvent('/v1/demo/session', 'https://demo.ventusai.com'));
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Access-Control-Allow-Origin'], 'https://demo.ventusai.com');
  assert.equal(JSON.parse(response.body).token, 'scoped-token');

  assert.equal(
    (await handler(requestEvent(
      '/v1/demo/salesforce-onboarding',
      'https://demo.ventusai.com',
      { action: 'discover' },
    ))).statusCode,
    200,
  );
  assert.equal(
    (await handler(requestEvent(
      '/v1/demo/salesforce-deliver',
      'https://demo.ventusai.com',
      { subject: 'Review moment' },
    ))).statusCode,
    200,
  );
  assert.equal(
    (await handler(requestEvent(
      '/v1/demo/salesforce-outcomes',
      'https://demo.ventusai.com',
      { decisionRecordId: 'a01000000000001' },
    ))).statusCode,
    200,
  );
});

test('scenario readiness requires the complete signal pattern', () => {
  assert.equal(demoScenarioReady('deposit-retention', [{ name: 'ACME PAYROLL', amount: -1000 }]), false);
  assert.equal(demoScenarioReady('deposit-retention', [
    { name: 'ACME PAYROLL', amount: -1000 },
    { name: 'CHIME TRANSFER', amount: 400 },
  ]), true);
  assert.equal(demoScenarioReady('wealth-growth', [{ name: 'FIDELITY 401K ROLLOVER', amount: -230000 }]), true);
});

test('Salesforce record builder never requires custom org fields', () => {
  const { task } = buildSalesforceTaskRecord({ subject: 'Review opportunity', insight: {} }, new Date('2026-07-13T00:00:00Z'));
  assert.deepEqual(Object.keys(task).sort(), ['ActivityDate', 'Description', 'Priority', 'Status', 'Subject']);
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requestEvent(path, origin = 'https://demo.ventusai.com', body = {}) {
  return {
    httpMethod: 'POST',
    path,
    headers: { Origin: origin },
    body: JSON.stringify(body),
    requestContext: {
      requestId: 'request-demo',
      authorizer: { claims: { sub: 'cognito-sub-001', tenant_id: 'demo_bank' } },
    },
  };
}

function signTestSession(overrides) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'VCS1' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: 'ventus-ai',
    aud: 'ventus-demo-connectors',
    sub: 'demo_operator',
    tenant_id: 'demo_bank',
    scopes: ['plaid_read', 'salesforce_write'],
    destinations: ['plaid', 'salesforce'],
    jti: 'demo_future_session',
    ...overrides,
  })).toString('base64url');
  const unsigned = `${header}.${payload}`;
  const signature = crypto
    .createHmac('sha256', configuredSecrets.sessionSigningSecret)
    .update(unsigned)
    .digest('base64url');
  return `${unsigned}.${signature}`;
}
