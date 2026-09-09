import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TERMINAL_JOB_STATUSES,
  validateEnrichResponse,
  validateJobResponse,
} from '../scripts/lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const baseUrl =
  process.env.VENTUS_STAGING_API_BASE_URL ||
  process.env.VENTUS_API_BASE_URL ||
  'https://api.ventusai.com';
const apiKey = process.env.VENTUS_API_KEY;
const allowProductionWrite = process.env.VENTUS_LIVE_QA_ALLOW_PRODUCTION === 'true';
const fixturePath = resolve(
  process.env.PLAID_GOLDEN_ENRICH_FIXTURE_PATH ||
    join(
      backendRoot,
      'artifacts',
      'plaid-golden-candidates',
      latestCandidateRunId(),
      'plaid-golden-enrich-fixture.json'
    )
);
const outputPath = resolve(
  process.env.PLAID_ENRICHMENT_PREDICTIONS_PATH ||
    join(dirname(fixturePath), 'enrichment-predictions.json')
);
const rawOutputPath = resolve(
  process.env.PLAID_ENRICHMENT_RAW_OUTPUT_PATH ||
    join(dirname(fixturePath), 'enrichment-api-output.json')
);
const pollTimeoutMs = Number(process.env.VENTUS_LIVE_QA_TIMEOUT_MS || 240000);
const pollIntervalMs = Number(process.env.VENTUS_LIVE_QA_POLL_INTERVAL_MS || 5000);

assert.ok(apiKey, 'VENTUS_API_KEY is required to submit Plaid golden enrichment fixture');
assert.ok(
  allowProductionWrite || !isProductionUrl(baseUrl),
  'Refusing to submit Plaid golden QA data to api.ventusai.com unless VENTUS_LIVE_QA_ALLOW_PRODUCTION=true'
);

const fixture = readJson(fixturePath);
assert.ok(Array.isArray(fixture.transactions), 'fixture.transactions must be an array');
assert.ok(fixture.transactions.length > 0, 'fixture.transactions must not be empty');

console.log(`Ventus enrichment capture target: ${baseUrl}`);
console.log(`fixture: ${fixturePath}`);
console.log(`transactions: ${fixture.transactions.length}`);

const batchId = await submitEnrichJob(fixture.transactions);
const job = await pollJob(batchId);
const customers = [...new Set(fixture.transactions.map((transaction) => transaction.customer_id))].sort();
const apiOutput = {
  base_url: baseUrl,
  batch_id: batchId,
  job,
  customers: {},
};

const predictions = [];
for (const customerId of customers) {
  const [transactions, lifeEvents, trips, riskFactors] = await Promise.all([
    fetchJson(`/v1/customers/${encodeURIComponent(customerId)}/transactions?limit=500`),
    fetchOptionalJson(`/v1/customers/${encodeURIComponent(customerId)}/life-events`),
    fetchOptionalJson(`/v1/customers/${encodeURIComponent(customerId)}/trips`),
    fetchOptionalJson(`/v1/customers/${encodeURIComponent(customerId)}/risk-factors`),
  ]);
  apiOutput.customers[customerId] = { transactions, lifeEvents, trips, riskFactors };
  predictions.push(...buildPredictions(transactions, lifeEvents, riskFactors));
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify({ predictions }, null, 2)}\n`);
writeFileSync(rawOutputPath, `${JSON.stringify(apiOutput, null, 2)}\n`);

console.log(`predictions: ${outputPath}`);
console.log(`raw output: ${rawOutputPath}`);
console.log(`prediction_count: ${predictions.length}`);

async function submitEnrichJob(transactions) {
  const result = await request('/v1/enrich', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });
  assert.equal(
    result.res.status,
    202,
    `POST /v1/enrich expected HTTP 202, got ${result.res.status}: ${JSON.stringify(result.body)}`
  );
  validateEnrichResponse(result.body, 'POST /v1/enrich');
  assert.equal(result.body.transaction_count, transactions.length, 'enrich transaction_count mismatch');
  console.log(`submitted batch: ${result.body.batch_id}`);
  return result.body.batch_id;
}

async function pollJob(batchId) {
  const startedAt = Date.now();
  let latestJob = null;
  while (Date.now() - startedAt <= pollTimeoutMs) {
    const result = await request(`/v1/jobs/${encodeURIComponent(batchId)}`);
    assert.equal(
      result.res.status,
      200,
      `GET /v1/jobs/:id expected HTTP 200, got ${result.res.status}: ${JSON.stringify(result.body)}`
    );
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

function buildPredictions(transactionsResponse, lifeEventsResponse, riskFactorsResponse) {
  const lifeEventIds = new Set();
  for (const event of lifeEventsResponse?.life_events || []) {
    for (const evidence of event.evidence || []) {
      if (evidence.transaction_id) lifeEventIds.add(evidence.transaction_id);
    }
  }
  const riskIds = new Set(
    (riskFactorsResponse?.risk_factors || [])
      .map((risk) => risk.transaction_id)
      .filter(Boolean)
  );

  return (transactionsResponse?.transactions || []).map((transaction) => ({
    transaction_id: transaction.transaction_id,
    clean_merchant_name: transaction.clean_merchant_name,
    lifestyle_category: transaction.lifestyle_category,
    merchant_category: transaction.merchant_category,
    confidence_score: Number(transaction.confidence_score),
    signals: {
      travel_candidate: Boolean(transaction.trip_id),
      risk_candidate: riskIds.has(transaction.transaction_id),
      life_event_candidate: lifeEventIds.has(transaction.transaction_id),
    },
  }));
}

async function fetchJson(path) {
  const result = await request(path);
  assert.equal(
    result.res.status,
    200,
    `${path} expected HTTP 200, got ${result.res.status}: ${JSON.stringify(result.body)}`
  );
  return result.body;
}

async function fetchOptionalJson(path) {
  const result = await request(path);
  if (result.res.status === 404) return null;
  assert.equal(
    result.res.status,
    200,
    `${path} expected HTTP 200 or 404, got ${result.res.status}: ${JSON.stringify(result.body)}`
  );
  return result.body;
}

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    'x-api-key': apiKey,
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

function latestCandidateRunId() {
  const root = join(backendRoot, 'artifacts', 'plaid-golden-candidates');
  const runs = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.ok(runs.length > 0, 'no Plaid golden candidate artifact runs found');
  return runs.at(-1);
}

function isProductionUrl(url) {
  try {
    return new URL(url).hostname === 'api.ventusai.com';
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
