import assert from 'node:assert/strict';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TERMINAL_JOB_STATUSES,
  readJson,
  validateAnalyticsResponse,
  validateEnrichResponse,
  validateEnrichTransaction,
  validateJobResponse,
  validateLifeEventsResponse,
  validateRiskFactorsResponse,
  validateTransactionsResponse,
  validateTripsResponse,
} from './lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const defaultFixturePath = join(
  backendRoot,
  'fixtures',
  'mock-bank',
  'fis-card-transactions.json'
);

const baseUrl =
  process.env.VENTUS_STAGING_API_BASE_URL ||
  process.env.VENTUS_API_BASE_URL ||
  'https://api.ventusai.com';
const apiKey = process.env.VENTUS_API_KEY;
const enableWrite = process.env.VENTUS_LIVE_QA_ENABLE_WRITE === 'true';
const allowProductionWrite = process.env.VENTUS_LIVE_QA_ALLOW_PRODUCTION === 'true';
const fixturePath = resolve(process.env.VENTUS_LIVE_QA_FIXTURE || defaultFixturePath);
const readCustomerId =
  process.env.VENTUS_LIVE_QA_CUSTOMER_ID ||
  process.env.VENTUS_SMOKE_CUSTOMER_ID;
const pollTimeoutMs = Number(process.env.VENTUS_LIVE_QA_TIMEOUT_MS || 180000);
const pollIntervalMs = Number(process.env.VENTUS_LIVE_QA_POLL_INTERVAL_MS || 5000);

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function isProductionUrl(url) {
  try {
    return new URL(url).hostname === 'api.ventusai.com';
  } catch {
    return false;
  }
}

function assertStatus(result, expected, label) {
  assert.equal(
    result.res.status,
    expected,
    `${label} expected HTTP ${expected}, got ${result.res.status}: ${JSON.stringify(result.body)}`
  );
}

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

function loadFixtureTransactions() {
  const fixture = readJson(fixturePath);
  assert.ok(Array.isArray(fixture.transactions), 'fixture.transactions should be an array');
  assert.ok(fixture.transactions.length > 0, 'fixture.transactions should not be empty');

  const runId = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const transactions = fixture.transactions.map((txn, index) => ({
    ...txn,
    transaction_id: `${txn.transaction_id}_${runId}_${index}`,
    customer_id: `${txn.customer_id}_${runId}`,
  }));

  transactions.forEach((txn, index) =>
    validateEnrichTransaction(txn, `live_fixture.transactions[${index}]`)
  );

  return { fixture, transactions };
}

async function checkHealth() {
  const health = await request('/health');
  assertStatus(health, 200, 'GET /health');
  assert.equal(health.body.status, 'healthy', 'health status should be healthy');
  console.log('ok GET /health');
}

async function checkOptionalReadEndpoint(path, validator, label) {
  const result = await request(path);
  if (result.res.status === 404) {
    console.log(`skip ${label}: no data found for selected QA customer`);
    return null;
  }

  assertStatus(result, 200, label);
  validator(result.body, label);
  console.log(`ok ${label}`);
  return result.body;
}

async function checkAuthenticatedReads(customerId) {
  if (!apiKey) {
    console.log('skipping authenticated checks; set VENTUS_API_KEY to enable them');
    return;
  }

  const analytics = await request('/v1/analytics/bank');
  assertStatus(analytics, 200, 'GET /v1/analytics/bank');
  validateAnalyticsResponse(analytics.body, 'GET /v1/analytics/bank');
  console.log('ok GET /v1/analytics/bank');

  if (!customerId) {
    console.log('skipping customer read checks; set VENTUS_LIVE_QA_CUSTOMER_ID or enable write mode');
    return;
  }

  await checkOptionalReadEndpoint(
    `/v1/customers/${encodeURIComponent(customerId)}/transactions?limit=10`,
    validateTransactionsResponse,
    'GET /v1/customers/:id/transactions'
  );
  await checkOptionalReadEndpoint(
    `/v1/customers/${encodeURIComponent(customerId)}/life-events`,
    validateLifeEventsResponse,
    'GET /v1/customers/:id/life-events'
  );
  await checkOptionalReadEndpoint(
    `/v1/customers/${encodeURIComponent(customerId)}/trips`,
    validateTripsResponse,
    'GET /v1/customers/:id/trips'
  );
  await checkOptionalReadEndpoint(
    `/v1/customers/${encodeURIComponent(customerId)}/risk-factors`,
    validateRiskFactorsResponse,
    'GET /v1/customers/:id/risk-factors'
  );
}

async function submitEnrichJob(transactions) {
  const result = await request('/v1/enrich', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });

  assertStatus(result, 202, 'POST /v1/enrich');
  validateEnrichResponse(result.body, 'POST /v1/enrich');
  assert.equal(result.body.transaction_count, transactions.length, 'enrich transaction_count mismatch');
  console.log(`ok POST /v1/enrich -> ${result.body.batch_id}`);
  return result.body.batch_id;
}

async function pollJob(batchId) {
  const startedAt = Date.now();
  let latestJob = null;

  while (Date.now() - startedAt <= pollTimeoutMs) {
    const result = await request(`/v1/jobs/${encodeURIComponent(batchId)}`);
    assertStatus(result, 200, 'GET /v1/jobs/:id');
    validateJobResponse(result.body, 'GET /v1/jobs/:id');
    latestJob = result.body;

    const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
    console.log(`job ${batchId} status=${latestJob.status} elapsed=${elapsedSeconds}s`);

    if (TERMINAL_JOB_STATUSES.has(latestJob.status)) {
      assert.notEqual(latestJob.status, 'failed', `job ${batchId} failed`);
      return latestJob;
    }

    await sleep(pollIntervalMs);
  }

  throw new Error(
    `Timed out after ${pollTimeoutMs}ms waiting for ${batchId}; latest status was ${latestJob?.status || 'unknown'}`
  );
}

async function main() {
  console.log(`Ventus live QA target: ${baseUrl}`);
  if (enableWrite) {
    assert.ok(apiKey, 'VENTUS_API_KEY is required when VENTUS_LIVE_QA_ENABLE_WRITE=true');
    assert.ok(
      allowProductionWrite || !isProductionUrl(baseUrl),
      'Refusing to submit QA data to api.ventusai.com unless VENTUS_LIVE_QA_ALLOW_PRODUCTION=true'
    );
  }

  await checkHealth();

  if (!enableWrite) {
    await checkAuthenticatedReads(readCustomerId);
    console.log('write checks skipped; set VENTUS_LIVE_QA_ENABLE_WRITE=true to submit a QA enrich job');
    return;
  }

  const { fixture, transactions } = loadFixtureTransactions();
  console.log(
    `loaded ${transactions.length} ${fixture.source_system} fixture transactions from ${fixturePath}`
  );

  const batchId = await submitEnrichJob(transactions);
  await pollJob(batchId);

  const customerId = transactions[0].customer_id;
  await checkAuthenticatedReads(customerId);
  console.log('Live enrichment QA pipeline checks passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
