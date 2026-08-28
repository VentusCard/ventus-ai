import crypto from 'node:crypto';

import { offbankRegex } from './offbank-patterns.mjs';
import {
  createSalesforceFscService,
  SalesforceFscError,
} from './salesforce-fsc.mjs';
import { buildSalesforceTaskRecord } from './salesforce-task-record.mjs';

export { buildSalesforceTaskRecord } from './salesforce-task-record.mjs';

const SESSION_ISSUER = 'ventus-ai';
const SESSION_AUDIENCE = 'ventus-demo-connectors';
const SESSION_SECONDS = 15 * 60;
const PLAID_INSTITUTION_ID = 'ins_109508';
const API_VERSION = 'v61.0';

const DEPOSIT_PRIMACY_CUSTOM_USER = {
  override_accounts: [{
    type: 'depository',
    subtype: 'checking',
    starting_balance: 8400,
    transactions: [
      { date_transacted: '2026-06-01', date_posted: '2026-06-01', amount: -4800, description: 'ACME PAYROLL', currency: 'USD' },
      { date_transacted: '2026-06-15', date_posted: '2026-06-15', amount: -4800, description: 'ACME PAYROLL', currency: 'USD' },
      { date_transacted: '2026-06-18', date_posted: '2026-06-18', amount: 1850, description: 'CHIME TRANSFER', currency: 'USD' },
      { date_transacted: '2026-06-26', date_posted: '2026-06-26', amount: 2100, description: 'CHIME TRANSFER', currency: 'USD' },
      { date_transacted: '2026-06-27', date_posted: '2026-06-27', amount: 146, description: 'WHOLE FOODS', currency: 'USD' },
    ],
  }],
};

const WEALTH_GROWTH_CUSTOM_USER = {
  override_accounts: [{
    type: 'depository',
    subtype: 'checking',
    starting_balance: 12000,
    transactions: [
      { date_transacted: '2026-06-11', date_posted: '2026-06-11', amount: -230000, description: 'FIDELITY 401K ROLLOVER', currency: 'USD' },
      { date_transacted: '2026-06-02', date_posted: '2026-06-02', amount: -5100, description: 'GUSTO PAYROLL', currency: 'USD' },
      { date_transacted: '2026-06-14', date_posted: '2026-06-14', amount: 320, description: 'COSTCO WHOLESALE', currency: 'USD' },
      { date_transacted: '2026-06-20', date_posted: '2026-06-20', amount: 84, description: 'WHOLE FOODS', currency: 'USD' },
    ],
  }],
};

const OFFBANK = offbankRegex();
const PAYROLL = /gusto|adp|paychex|payroll|direct dep|acme payroll/i;
const cleanText = (value, maxLength) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : '';

export class DemoConnectorError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'DemoConnectorError';
    this.status = status;
  }
}

export function createDemoConnectorService({
  getSecrets,
  fetchImpl = fetch,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  now = () => Date.now(),
  plaidEnvironment = 'sandbox',
} = {}) {
  if (typeof getSecrets !== 'function') throw new Error('getSecrets is required');
  if (plaidEnvironment !== 'sandbox') throw new Error('demo connectors require Plaid sandbox');
  const plaidHost = 'https://sandbox.plaid.com';
  const salesforceFsc = createSalesforceFscService({
    fetchImpl,
    buildTaskRecord: buildSalesforceTaskRecord,
  });

  async function secrets() {
    return normalizeSecrets(await getSecrets());
  }

  async function status() {
    const configured = await secrets();
    return {
      plaid: Boolean(configured.plaidClientId && configured.plaidSecret),
      salesforce: Boolean(
        configured.salesforceLoginUrl
        && configured.salesforceClientId
        && configured.salesforceClientSecret
      ),
    };
  }

  async function issueSession({
    tenantId = 'demo_bank',
    subject = 'demo_operator',
    role = 'operator',
  } = {}) {
    const configured = await secrets();
    validateSigningSecret(configured.sessionSigningSecret);
    const issuedAt = Math.floor(now() / 1000);
    const sessionId = `demo_${crypto.randomUUID().replaceAll('-', '').slice(0, 24)}`;
    const normalizedTenantId = safeOpaqueId(tenantId, 'demo_bank');
    const normalizedSubject = safeOpaqueId(subject, 'demo_operator');
    const normalizedRole = role === 'admin' ? 'admin' : 'operator';
    const token = signSession({
      secret: configured.sessionSigningSecret,
      claims: {
        iss: SESSION_ISSUER,
        aud: SESSION_AUDIENCE,
        sub: normalizedSubject,
        tenant_id: normalizedTenantId,
        role: normalizedRole,
        scopes: [
          'plaid_read',
          'salesforce_write',
          'salesforce_outcome_read',
          ...(normalizedRole === 'admin' ? ['salesforce_schema_read'] : []),
        ],
        destinations: ['plaid', 'salesforce'],
        jti: sessionId,
        iat: issuedAt,
        exp: issuedAt + SESSION_SECONDS,
      },
    });
    return {
      token,
      tokenType: 'connector-session',
      sessionId,
      expiresAt: issuedAt + SESSION_SECONDS,
      connectors: await status(),
      tenantId: normalizedTenantId,
      subject: normalizedSubject,
      role: normalizedRole,
    };
  }

  async function authorize(authorization, { scope, destination }) {
    const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : '';
    if (!token) throw new DemoConnectorError('forbidden', 403);
    const configured = await secrets();
    const principal = verifySession(token, configured.sessionSigningSecret, Math.floor(now() / 1000));
    if (!principal) throw new DemoConnectorError('forbidden', 403);
    if (!principal.scopes.includes(scope) || !principal.destinations.includes(destination)) {
      throw new DemoConnectorError('forbidden', 403);
    }
    return principal;
  }

  async function plaid(path, body) {
    const response = await fetchImpl(`${plaidHost}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new DemoConnectorError(`Plaid ${path} ${response.status}: ${detail.slice(0, 120)}`, 502);
    }
    return response.json();
  }

  async function pullPlaidTransactions({ authorization, scenario = 'deposit-retention' }) {
    const principal = await authorize(authorization, { scope: 'plaid_read', destination: 'plaid' });
    const result = await pullPlaidScenario({ scenario });
    return { ...result, authorization: principalSummary(principal) };
  }

  // This is intentionally not exposed by the connector HTTP surface. It lets
  // another server-side Ventus service obtain the same sandbox evidence without
  // sending transactions, access tokens, or assignment inputs through a browser.
  async function pullPlaidScenario({ scenario = 'deposit-retention', cohortMemberId = null } = {}) {
    const configured = await secrets();
    if (!configured.plaidClientId || !configured.plaidSecret) {
      throw new DemoConnectorError('Plaid sandbox is not configured', 503);
    }
    const selectedScenario = scenario === 'wealth-growth' ? 'wealth-growth' : 'deposit-retention';
    const customUser = selectedScenario === 'wealth-growth'
      ? WEALTH_GROWTH_CUSTOM_USER
      : DEPOSIT_PRIMACY_CUSTOM_USER;
    const cohortUser = cohortMemberId ? sandboxVariant(customUser, cohortMemberId) : customUser;
    const auth = { client_id: configured.plaidClientId, secret: configured.plaidSecret };
    const publicToken = await plaid('/sandbox/public_token/create', {
      ...auth,
      institution_id: PLAID_INSTITUTION_ID,
      initial_products: ['transactions'],
      options: { override_username: 'user_custom', override_password: JSON.stringify(cohortUser) },
    });
    if (!publicToken.public_token) throw new DemoConnectorError('Plaid did not return a public token', 502);
    const exchanged = await plaid('/item/public_token/exchange', {
      ...auth,
      public_token: publicToken.public_token,
    });
    if (!exchanged.access_token) throw new DemoConnectorError('Plaid did not return an access token', 502);

    const endDate = new Date(now()).toISOString().slice(0, 10);
    const startDate = new Date(now() - 365 * 864e5).toISOString().slice(0, 10);
    let best = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const result = await plaid('/transactions/get', {
        ...auth,
        access_token: exchanged.access_token,
        start_date: startDate,
        end_date: endDate,
        options: { count: 100, offset: 0 },
      }).catch(() => ({ transactions: [] }));
      const transactions = Array.isArray(result.transactions) ? result.transactions : [];
      if (transactions.length > best.length || demoScenarioReady(selectedScenario, transactions)) best = transactions;
      if (transactions.length && demoScenarioReady(selectedScenario, transactions)) break;
      await sleep(1500);
    }

    return {
      source: 'plaid',
      env: plaidEnvironment,
      scenario: selectedScenario,
      ready: demoScenarioReady(selectedScenario, best),
      transactions: best,
      count: best.length,
    };
  }

  async function salesforceContext(authorization, scope) {
    const principal = await authorize(authorization, { scope, destination: 'salesforce' });
    const configured = await secrets();
    if (!configured.salesforceLoginUrl || !configured.salesforceClientId || !configured.salesforceClientSecret) {
      throw new DemoConnectorError('Salesforce sandbox is not configured', 503);
    }
    return { principal, configured };
  }

  async function discoverSalesforce({ authorization }) {
    const { principal, configured } = await salesforceContext(
      authorization,
      'salesforce_schema_read',
    );
    try {
      return {
        ...await salesforceFsc.discover({ config: configured }),
        authorization: principalSummary(principal),
      };
    } catch (error) {
      throw translateSalesforceError(error);
    }
  }

  async function verifySalesforceAccount({ authorization, accountId }) {
    const { principal, configured } = await salesforceContext(
      authorization,
      'salesforce_schema_read',
    );
    try {
      return {
        ...await salesforceFsc.verifyAccount({ config: configured, accountId }),
        authorization: principalSummary(principal),
      };
    } catch (error) {
      throw translateSalesforceError(error);
    }
  }

  async function deliverSalesforce({ authorization, body }) {
    const principal = await authorize(authorization, { scope: 'salesforce_write', destination: 'salesforce' });
    const configured = await secrets();
    if (!configured.salesforceLoginUrl || !configured.salesforceClientId || !configured.salesforceClientSecret) {
      throw new DemoConnectorError('Salesforce sandbox is not configured', 503);
    }
    try {
      return {
        ...await salesforceFsc.deliver({
          config: configured,
          body,
          tenantId: principal.tenantId,
          now: new Date(now()),
        }),
        authorization: principalSummary(principal),
      };
    } catch (error) {
      throw translateSalesforceError(error);
    }
  }

  async function readSalesforceOutcome({ authorization, decisionRecordId }) {
    const { principal, configured } = await salesforceContext(
      authorization,
      'salesforce_outcome_read',
    );
    try {
      return {
        ...await salesforceFsc.readOutcome({
          config: configured,
          decisionRecordId,
          tenantId: principal.tenantId,
        }),
        authorization: principalSummary(principal),
      };
    } catch (error) {
      throw translateSalesforceError(error);
    }
  }

  async function createSalesforceTask({ authorization, body }) {
    return deliverSalesforce({
      authorization,
      body: {
        ...body,
        fsc: {
          ...(body?.fsc && typeof body.fsc === 'object' ? body.fsc : {}),
          createReferral: false,
        },
      },
    });
  }

  return {
    status,
    issueSession,
    pullPlaidTransactions,
    pullPlaidScenario,
    discoverSalesforce,
    verifySalesforceAccount,
    deliverSalesforce,
    readSalesforceOutcome,
    createSalesforceTask,
  };
}

function sandboxVariant(template, cohortMemberId) {
  const variant = Number.parseInt(crypto.createHash('sha256').update(cohortMemberId).digest('hex').slice(0, 4), 16) % 4;
  const account = template.override_accounts?.[0];
  if (!account) return template;
  const transactions = account.transactions.map((transaction, index) => ({
    ...transaction,
    // The shape remains approved and scenario-valid while avoiding a single
    // repeated customer record in the controlled sandbox validation cohort.
    amount: index === 0 ? transaction.amount - (variant * 25) : transaction.amount,
  }));
  return {
    override_accounts: [{
      ...account,
      starting_balance: account.starting_balance + (variant * 100),
      transactions,
    }],
  };
}

export function demoScenarioReady(scenario, transactions) {
  if (scenario === 'wealth-growth') {
    return transactions.some((transaction) => (
      /rollover|401k|fidelity|vanguard|schwab/i.test(transaction.name || '')
      || transaction.personal_finance_category?.primary === 'TRANSFER_IN'
    ) && Number(transaction.amount) <= -50000);
  }
  const hasPayroll = transactions.some((transaction) =>
    PAYROLL.test(transaction.name || '') || transaction.personal_finance_category?.primary === 'INCOME');
  const hasOffbank = transactions.some((transaction) =>
    (OFFBANK.test(transaction.name || '') || transaction.personal_finance_category?.primary === 'TRANSFER_OUT')
    && Number(transaction.amount) > 0);
  return hasPayroll && hasOffbank;
}

function normalizeSecrets(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    sessionSigningSecret: cleanText(source.sessionSigningSecret, 512),
    plaidClientId: cleanConfiguredValue(source.plaidClientId),
    plaidSecret: cleanConfiguredValue(source.plaidSecret),
    salesforceLoginUrl: cleanConfiguredValue(source.salesforceLoginUrl).replace(/\/$/, ''),
    salesforceClientId: cleanConfiguredValue(source.salesforceClientId),
    salesforceClientSecret: cleanConfiguredValue(source.salesforceClientSecret),
    salesforceDemoAccountId: cleanConfiguredValue(source.salesforceDemoAccountId),
    salesforceReferralRecordTypeId: cleanConfiguredValue(source.salesforceReferralRecordTypeId),
  };
}

function cleanConfiguredValue(value) {
  const cleaned = cleanText(value, 1024);
  return cleaned.startsWith('CONFIGURE_') ? '' : cleaned;
}

function signSession({ secret, claims }) {
  validateSigningSecret(secret);
  const header = encode({ alg: 'HS256', typ: 'VCS1' });
  const payload = encode(claims);
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${crypto.createHmac('sha256', secret).update(unsigned).digest('base64url')}`;
}

function verifySession(token, secret, currentTime) {
  try {
    validateSigningSecret(secret);
    const [header, payload, signature, extra] = token.split('.');
    if (!header || !payload || !signature || extra) return null;
    const unsigned = `${header}.${payload}`;
    const expected = crypto.createHmac('sha256', secret).update(unsigned).digest('base64url');
    if (!safeEqual(signature, expected)) return null;
    const parsedHeader = decode(header);
    const claims = decode(payload);
    if (parsedHeader.alg !== 'HS256' || parsedHeader.typ !== 'VCS1') return null;
    if (claims.iss !== SESSION_ISSUER || claims.aud !== SESSION_AUDIENCE) return null;
    if (!Array.isArray(claims.scopes) || !Array.isArray(claims.destinations)) return null;
    if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp)) return null;
    if (claims.iat > currentTime + 30 || claims.exp <= claims.iat) return null;
    if (claims.exp <= currentTime || claims.exp - claims.iat > SESSION_SECONDS) return null;
    if (safeOpaqueId(claims.tenant_id, '') !== claims.tenant_id) return null;
    if (safeOpaqueId(claims.jti, '') !== claims.jti) return null;
    return {
      tenantId: claims.tenant_id,
      subject: safeOpaqueId(claims.sub, 'demo_operator'),
      role: claims.role === 'admin' ? 'admin' : 'operator',
      sessionId: claims.jti,
      scopes: claims.scopes,
      destinations: claims.destinations,
    };
  } catch {
    return null;
  }
}

function validateSigningSecret(secret) {
  if (typeof secret !== 'string' || secret.length < 32) {
    throw new DemoConnectorError('connector session is not configured', 503);
  }
}

function principalSummary(principal) {
  return {
    tenantId: principal.tenantId,
    subject: principal.subject,
    role: principal.role,
    sessionId: principal.sessionId,
    mode: 'session',
  };
}

function translateSalesforceError(error) {
  if (error instanceof SalesforceFscError) {
    return new DemoConnectorError(error.message, error.status);
  }
  return error;
}

function safeOpaqueId(value, fallback) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/.test(value)
    ? value
    : fallback;
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
