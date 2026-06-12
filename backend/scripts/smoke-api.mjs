import assert from 'node:assert/strict';

const baseUrl = process.env.VENTUS_API_BASE_URL || 'https://api.ventusai.com';
const apiKey = process.env.VENTUS_API_KEY;
const customerId = process.env.VENTUS_SMOKE_CUSTOMER_ID || 'cust_013';

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
    ...options.headers,
  };

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { res, body };
}

function assertStatus(result, expected, label) {
  assert.equal(
    result.res.status,
    expected,
    `${label} expected HTTP ${expected}, got ${result.res.status}: ${JSON.stringify(result.body)}`
  );
}

async function main() {
  const health = await request('/health');
  assertStatus(health, 200, 'GET /health');
  assert.equal(health.body.status, 'healthy', 'health status should be healthy');
  console.log('ok GET /health');

  if (!apiKey) {
    console.log('skipping authenticated checks; set VENTUS_API_KEY to enable them');
    return;
  }

  const profile = await request(`/v1/customers/${encodeURIComponent(customerId)}/profile`);
  assertStatus(profile, 200, 'GET customer profile');
  assert.equal(profile.body.customer_id, customerId);
  assert.ok(Array.isArray(profile.body.pillars), 'profile.pillars should be an array');
  console.log('ok GET /v1/customers/:id/profile');

  const transactions = await request(
    `/v1/customers/${encodeURIComponent(customerId)}/transactions?limit=5`
  );
  assertStatus(transactions, 200, 'GET customer transactions');
  assert.equal(transactions.body.customer_id, customerId);
  assert.ok(Array.isArray(transactions.body.transactions), 'transactions should be an array');
  console.log('ok GET /v1/customers/:id/transactions');

  const analytics = await request('/v1/analytics/bank');
  assertStatus(analytics, 200, 'GET bank analytics');
  assert.ok(analytics.body.bank_id, 'analytics.bank_id should be present');
  assert.ok(analytics.body.overview, 'analytics.overview should be present');
  console.log('ok GET /v1/analytics/bank');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

