// Load test + bottleneck finder for POST /v1/enrich.
//
// This is a load tester first: it generates synthetic customers/transactions,
// packs them into batches (<= max batch size, whole customers per batch),
// submits them, optionally polls to completion, and prints submit/throughput
// metrics (latency percentiles, HTTP outcomes, 429s, time-to-complete).
//
// It is ALSO a bottleneck finder. Two capabilities turn raw load numbers into a
// diagnosis of *where* the system bends:
//   1. Per-stage timing — reads the /v1/jobs stage timestamps (ingested_at,
//      classified_at, pillar/travel/lifestyle/risk_analyzed_at, completed_at)
//      and reports how long each pipeline stage took, so the slowest stage is
//      named explicitly instead of inferred from a single end-to-end number.
//   2. Sustained / ramped arrival rate — instead of one burst, it can drive a
//      controlled arrival rate for a duration (optionally stepping through
//      rates), which is how you actually find the throughput at which queues
//      back up and latency degrades.
//
// This deliberately does NOT call Plaid. Load testing should exercise Ventus
// bottlenecks (API + normalize, Aurora connections, Lambda concurrency, SQS
// fan-out, Gemini quota) with deterministic, repeatable data — not a live
// upstream that adds its own rate limits and latency. Use plaid:sandbox:pull for
// integration/accuracy checks instead.
//
// Required:
//   VENTUS_API_KEY                 API key for the target bank. For ingest_format
//                                  'plaid' the key must be configured accordingly.
// Common knobs (all optional):
//   VENTUS_STAGING_API_BASE_URL    target base url (preferred)
//   VENTUS_API_BASE_URL            target base url (fallback). Default staging-style;
//                                  hitting api.ventusai.com requires the prod guard.
//   LOAD_TEST_ALLOW_PRODUCTION     'true' to allow submitting to api.ventusai.com
//   LOAD_TEST_TXNS_PER_CUSTOMER    transactions per customer (default 10)
//   LOAD_TEST_CONCURRENCY          max in-flight enrich requests (default 4)
//   LOAD_TEST_MAX_BATCH            max transactions per request, <=1000 (default 1000)
//   LOAD_TEST_INGEST_FORMAT        'normalized' | 'plaid' (default 'normalized')
//   LOAD_TEST_MODE                 'e2e' (poll to completion) | 'ingest' (submit only)
//                                  (default 'e2e')
//   LOAD_TEST_HOME_ZIP             home/zip used for generated rows (default '10003')
//   LOAD_TEST_POLL_TIMEOUT_MS      per-batch poll timeout (default 600000)
//   LOAD_TEST_POLL_INTERVAL_MS     poll interval (default 5000)
//
// Burst profile (default — one fixed wave of load):
//   LOAD_TEST_CUSTOMERS            total synthetic customers (default 10)
//
// Sustained / ramp profile (set LOAD_TEST_DURATION_S > 0 to enable):
//   LOAD_TEST_DURATION_S           seconds to keep submitting (default 0 = burst)
//   LOAD_TEST_RATE_PER_MIN         target batches submitted per minute (default 60)
//   LOAD_TEST_CUSTOMERS_PER_BATCH  customers in each emitted batch (default 10)
//   LOAD_TEST_RAMP                 comma list of rates/min that split the duration
//                                  into equal phases, e.g. "30,60,120,240"
//
// CloudWatch correlation (opt-in; cross-references the slow stage against infra):
//   LOAD_TEST_CLOUDWATCH           'true' to pull infra metrics for the run window
//   AWS_REGION                     region for the metrics (default 'us-east-2')
//   LOAD_TEST_LAMBDAS              comma list of Lambda FunctionNames to inspect
//                                  (default = the 7 pipeline functions)
//   LOAD_TEST_SQS_QUEUES           comma list of SQS QueueNames (default: none)
//   LOAD_TEST_RDS_CLUSTER          Aurora DBClusterIdentifier (default: none)
//   LOAD_TEST_DB_MAX_CONNECTIONS   connection ceiling for flagging (default: none)
//   Requires @aws-sdk/client-cloudwatch (dynamically imported) and AWS creds.
//   Install once:  npm i --prefix backend @aws-sdk/client-cloudwatch
//
// Teardown (delete this run's synthetic rows from the database):
//   LOAD_TEST_TEARDOWN            'true' to delete the run's rows after it finishes
//   LOAD_TEST_TEARDOWN_RUN_ID     comma list of prior run_ids to delete, then exit
//                                 (cleanup-only mode; does NOT submit any load)
//   DATABASE_URL                  Postgres connection string (or standard PG* env)
//   LOAD_TEST_DB_SSL              'false' to disable TLS (default: on, for RDS)
//   Deletes only rows whose ids start with loadtest_<run_id>_, scoped per run.
//   Requires the `pg` package (dynamically imported).
//   Install once:  npm i --prefix backend pg
//
// Full usage guide: docs/engineering/load-testing.md
//
// Examples:
//   # Burst: one 1000-txn wave
//   VENTUS_API_KEY=... VENTUS_STAGING_API_BASE_URL=https://staging.example \
//     LOAD_TEST_CUSTOMERS=100 LOAD_TEST_CONCURRENCY=5 \
//     npm run --prefix backend load:enrich
//
//   # Self-cleaning run: load, report, then delete the rows it created
//   VENTUS_API_KEY=... VENTUS_STAGING_API_BASE_URL=https://staging.example \
//     DATABASE_URL=postgres://... LOAD_TEST_TEARDOWN=true \
//     LOAD_TEST_CUSTOMERS=50 npm run --prefix backend load:enrich
//
//   # Cleanup-only: delete rows from earlier runs and exit
//   DATABASE_URL=postgres://... LOAD_TEST_TEARDOWN_RUN_ID=20260622211221,20260622212800 \
//     npm run --prefix backend load:enrich
//
//   # Ramp: 5 minutes stepping 30→60→120→240 batches/min, then find the slow stage
//   VENTUS_API_KEY=... VENTUS_STAGING_API_BASE_URL=https://staging.example \
//     LOAD_TEST_DURATION_S=300 LOAD_TEST_RAMP=30,60,120,240 \
//     LOAD_TEST_CUSTOMERS_PER_BATCH=10 LOAD_TEST_CONCURRENCY=20 \
//     npm run --prefix backend load:enrich

const baseUrl =
  process.env.VENTUS_STAGING_API_BASE_URL ||
  process.env.VENTUS_API_BASE_URL ||
  'https://api.ventusai.com';
const apiKey = process.env.VENTUS_API_KEY;

const allowProduction = process.env.LOAD_TEST_ALLOW_PRODUCTION === 'true';
const customers = positiveInt(process.env.LOAD_TEST_CUSTOMERS, 10);
const txnsPerCustomer = positiveInt(process.env.LOAD_TEST_TXNS_PER_CUSTOMER, 10);
const concurrency = positiveInt(process.env.LOAD_TEST_CONCURRENCY, 4);
const maxBatch = Math.min(positiveInt(process.env.LOAD_TEST_MAX_BATCH, 1000), 1000);
const ingestFormat = (process.env.LOAD_TEST_INGEST_FORMAT || 'normalized').toLowerCase();
const mode = (process.env.LOAD_TEST_MODE || 'e2e').toLowerCase();
const homeZip = process.env.LOAD_TEST_HOME_ZIP || '10003';
const pollTimeoutMs = positiveInt(process.env.LOAD_TEST_POLL_TIMEOUT_MS, 600000);
const pollIntervalMs = positiveInt(process.env.LOAD_TEST_POLL_INTERVAL_MS, 5000);

// Sustained / ramp profile (0 duration = classic burst).
const durationS = nonNegativeInt(process.env.LOAD_TEST_DURATION_S, 0);
const ratePerMin = positiveInt(process.env.LOAD_TEST_RATE_PER_MIN, 60);
const customersPerBatch = positiveInt(process.env.LOAD_TEST_CUSTOMERS_PER_BATCH, 10);
const rampRates = parseRamp(process.env.LOAD_TEST_RAMP);
const isArrivalProfile = durationS > 0;

// CloudWatch correlation (opt-in).
const cloudWatchEnabled = process.env.LOAD_TEST_CLOUDWATCH === 'true';
const awsRegion = process.env.AWS_REGION || 'us-east-2';
const DEFAULT_PIPELINE_LAMBDAS = [
  'ventus-api',
  'ventus-ingest-transactions',
  'ventus-classify-transactions',
  'ventus-analyze-pillar-transactions',
  'ventus-travel-detection',
  'ventus-analyze-lifestyle-signals',
  'ventus-risk-detection',
];
const cwLambdas = parseCsv(process.env.LOAD_TEST_LAMBDAS) ?? DEFAULT_PIPELINE_LAMBDAS;
const cwQueues = parseCsv(process.env.LOAD_TEST_SQS_QUEUES) ?? [];
const cwRdsCluster = process.env.LOAD_TEST_RDS_CLUSTER || null;
const cwDbMaxConnections = positiveInt(process.env.LOAD_TEST_DB_MAX_CONNECTIONS, 0);

// Teardown (DB cleanup by run_id; opt-in, requires `pg` + DATABASE_URL/PG* env).
const teardownAfter = process.env.LOAD_TEST_TEARDOWN === 'true';
const teardownOnlyRunIds = parseCsv(process.env.LOAD_TEST_TEARDOWN_RUN_ID) ?? [];
const dbUseSsl = process.env.LOAD_TEST_DB_SSL !== 'false';

// Tables the pipeline writes, ordered children → parents so deletes respect any
// FKs. Every synthetic row's customer_id/transaction_id starts with the run's
// `loadtest_<run_id>_` prefix, so a single LIKE pattern scopes the cleanup to one
// run. merchant_cache is intentionally excluded: it is keyed by real merchant
// names (Starbucks, Amazon, …) and shared globally, so it is not run-specific.
const TEARDOWN_STEPS = [
  {
    table: 'life_event_evidence',
    sql: `DELETE FROM life_event_evidence WHERE life_event_id IN
            (SELECT id FROM customer_life_events WHERE customer_id LIKE $1 ESCAPE '\\')`,
  },
  { table: 'customer_life_events', sql: `DELETE FROM customer_life_events WHERE customer_id LIKE $1 ESCAPE '\\'` },
  { table: 'customer_pillar_profiles', sql: `DELETE FROM customer_pillar_profiles WHERE customer_id LIKE $1 ESCAPE '\\'` },
  { table: 'customer_trips', sql: `DELETE FROM customer_trips WHERE customer_id LIKE $1 ESCAPE '\\'` },
  { table: 'customer_risk_factors', sql: `DELETE FROM customer_risk_factors WHERE customer_id LIKE $1 ESCAPE '\\'` },
  { table: 'transactions_enriched', sql: `DELETE FROM transactions_enriched WHERE customer_id LIKE $1 ESCAPE '\\'` },
  { table: 'transactions_raw', sql: `DELETE FROM transactions_raw WHERE customer_id LIKE $1 ESCAPE '\\'` },
  { table: 'pipeline_runs', sql: `DELETE FROM pipeline_runs WHERE customer_id LIKE $1 ESCAPE '\\'` },
];

const SUPPORTED_FORMATS = new Set(['normalized', 'plaid']);
const SUPPORTED_MODES = new Set(['e2e', 'ingest']);
const TERMINAL_CUSTOMER_STATUSES = new Set(['complete', 'failed']);
const SUCCESS_BATCH_STATUSES = new Set(['complete', 'batch_complete']);
const FAILED_BATCH_STATUSES = new Set(['failed', 'batch_failed']);
const PARTIAL_BATCH_STATUSES = new Set(['partial', 'batch_partial']);

// Ordered pipeline stage transitions, derived from the per-customer timestamps
// returned by GET /v1/jobs. The four enrichment stages run in parallel after
// classify, so each is measured from classified_at.
const STAGE_TRANSITIONS = [
  { label: 'ingest→classify', from: 'ingested_at', to: 'classified_at' },
  { label: 'classify→pillar', from: 'classified_at', to: 'pillar_analyzed_at' },
  { label: 'classify→travel', from: 'classified_at', to: 'travel_detected_at' },
  { label: 'classify→lifestyle', from: 'classified_at', to: 'lifestyle_analyzed_at' },
  { label: 'classify→risk', from: 'classified_at', to: 'risk_analyzed_at' },
  { label: 'ingest→complete (total)', from: 'ingested_at', to: 'completed_at' },
];

const MERCHANTS = [
  { name: 'Starbucks', primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_COFFEE', channel: 'in store', mcc: '5814' },
  { name: 'Whole Foods Market', primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES', channel: 'in store', mcc: '5411' },
  { name: 'Amazon', primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES', channel: 'online', mcc: '5942' },
  { name: 'Netflix', primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_TV_AND_MOVIES', channel: 'online', mcc: '4899' },
  { name: 'Delta Air Lines', primary: 'TRAVEL', detailed: 'TRAVEL_FLIGHTS', channel: 'online', mcc: '4511' },
  { name: 'Shell', primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_GAS', channel: 'in store', mcc: '5541' },
  { name: 'Home Depot', primary: 'HOME_IMPROVEMENT', detailed: 'HOME_IMPROVEMENT_HARDWARE', channel: 'in store', mcc: '5200' },
  { name: 'CVS Pharmacy', primary: 'MEDICAL', detailed: 'MEDICAL_PHARMACIES_AND_SUPPLEMENTS', channel: 'in store', mcc: '5912' },
  { name: 'Uber', primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES', channel: 'online', mcc: '4121' },
  { name: 'Chipotle', primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_FAST_FOOD', channel: 'in store', mcc: '5814' },
];

function positiveInt(value, fallback) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function nonNegativeInt(value, fallback) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

// Parse "30,60,120" into [30, 60, 120]; empty/invalid → null (single-rate run).
function parseRamp(value) {
  if (!value) return null;
  const rates = value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  return rates.length > 0 ? rates : null;
}

// Parse a comma list of strings; empty/unset → null.
function parseCsv(value) {
  if (!value) return null;
  const parts = value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : null;
}

function isProductionUrl(url) {
  try {
    return new URL(url).hostname === 'api.ventusai.com';
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return 0;
  const idx = Math.min(sortedValues.length - 1, Math.ceil((p / 100) * sortedValues.length) - 1);
  return sortedValues[Math.max(0, idx)];
}

function summarize(label, values) {
  if (values.length === 0) return `${label}: n=0`;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((s, v) => s + v, 0);
  return [
    `${label}:`,
    `n=${sorted.length}`,
    `min=${Math.round(sorted[0])}ms`,
    `p50=${Math.round(percentile(sorted, 50))}ms`,
    `p95=${Math.round(percentile(sorted, 95))}ms`,
    `max=${Math.round(sorted[sorted.length - 1])}ms`,
    `avg=${Math.round(sum / sorted.length)}ms`,
  ].join(' ');
}

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
    ...options.headers,
  };
  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const text = await res.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { status: res.status, body };
}

// ── Synthetic data generation ────────────────────────────────────────────────
function dateNDaysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

// Build one synthetic customer (with txns) using a globally unique sequence
// number `seq`, so customers stay unique across burst batches and the open-loop
// arrival stream alike. `seq` also seeds the deterministic merchant/amount mix.
function makeCustomer(runId, seq) {
  const customerId = `loadtest_${runId}_cust_${String(seq).padStart(7, '0')}`;
  const accountId = `loadtest_${runId}_acct_${String(seq).padStart(7, '0')}`;
  const txns = [];
  for (let t = 0; t < txnsPerCustomer; t += 1) {
    const merchant = MERCHANTS[(seq + t) % MERCHANTS.length];
    const amount = Math.round((5 + ((seq * 7 + t * 13) % 400) + 0.99) * 100) / 100;
    txns.push({
      transaction_id: `loadtest_${runId}_txn_${seq}_${t + 1}`,
      customer_id: customerId,
      account_id: accountId,
      merchant,
      amount,
      date: dateNDaysAgo((t % 28) + 1),
    });
  }
  return { customerId, accountId, txns };
}

// Burst profile: the full fixed customer list, packed into batches up front.
function generateCustomers(runId) {
  const result = [];
  for (let c = 1; c <= customers; c += 1) {
    result.push(makeCustomer(runId, c));
  }
  return result;
}

// Pack whole customers into batches not exceeding maxBatch transactions.
function packBatches(customerList) {
  const batches = [];
  let current = [];
  let currentCount = 0;
  for (const customer of customerList) {
    const size = customer.txns.length;
    if (size > maxBatch) {
      throw new Error(
        `txns_per_customer (${size}) exceeds max batch size (${maxBatch}); lower LOAD_TEST_TXNS_PER_CUSTOMER or raise LOAD_TEST_MAX_BATCH`
      );
    }
    if (currentCount + size > maxBatch && current.length > 0) {
      batches.push(current);
      current = [];
      currentCount = 0;
    }
    current.push(customer);
    currentCount += size;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

function toNormalizedBody(batchCustomers) {
  const transactions = [];
  for (const customer of batchCustomers) {
    for (const txn of customer.txns) {
      transactions.push({
        transaction_id: txn.transaction_id,
        customer_id: txn.customer_id,
        merchant_name: txn.merchant.name,
        amount: txn.amount,
        date: txn.date,
        mcc_code: txn.merchant.mcc,
        zip_code: homeZip,
        home_zip: homeZip,
      });
    }
  }
  return { body: { transactions }, txnCount: transactions.length };
}

function toPlaidBody(batchCustomers) {
  const accounts = [];
  const added = [];
  const accountCustomerMap = {};
  const accountHomeZipMap = {};
  for (const customer of batchCustomers) {
    accounts.push({
      account_id: customer.accountId,
      name: 'Load Test Checking',
      type: 'depository',
      subtype: 'checking',
    });
    accountCustomerMap[customer.accountId] = customer.customerId;
    accountHomeZipMap[customer.accountId] = homeZip;
    for (const txn of customer.txns) {
      added.push({
        transaction_id: txn.transaction_id,
        account_id: customer.accountId,
        amount: txn.amount,
        date: txn.date,
        name: txn.merchant.name,
        merchant_name: txn.merchant.name,
        iso_currency_code: 'USD',
        pending: false,
        payment_channel: txn.merchant.channel,
        personal_finance_category: {
          primary: txn.merchant.primary,
          detailed: txn.merchant.detailed,
        },
        location: { postal_code: homeZip },
      });
    }
  }
  const body = {
    mapping_context: {
      account_customer_map: accountCustomerMap,
      account_home_zip_map: accountHomeZipMap,
    },
    payload: {
      accounts,
      added,
      modified: [],
      removed: [],
      next_cursor: `loadtest_cursor_${Date.now()}`,
      has_more: false,
    },
  };
  return { body, txnCount: added.length };
}

function buildBatchBody(batchCustomers) {
  return ingestFormat === 'plaid' ? toPlaidBody(batchCustomers) : toNormalizedBody(batchCustomers);
}

// ── Submit + poll ────────────────────────────────────────────────────────────
async function submitBatch(batchCustomers, index) {
  const { body, txnCount } = buildBatchBody(batchCustomers);
  const startedAt = Date.now();
  let result;
  try {
    result = await request('/v1/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      index,
      ok: false,
      status: 0,
      latencyMs: Date.now() - startedAt,
      txnCount,
      error: err.message,
      batchId: null,
    };
  }
  const latencyMs = Date.now() - startedAt;
  const ok = result.status === 202;
  const batchId = ok ? result.body?.batch_id ?? null : null;
  if (!ok) {
    console.warn(
      `[submit ${index}] HTTP ${result.status} (${latencyMs}ms): ${JSON.stringify(result.body)}`
    );
  } else {
    console.log(
      `[submit ${index}] 202 ${batchId} txns=${txnCount} customers=${batchCustomers.length} (${latencyMs}ms)`
    );
  }
  return {
    index,
    ok,
    status: result.status,
    latencyMs,
    txnCount,
    batchId,
    accepted: ok ? result.body?.transaction_count ?? null : null,
  };
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const current = cursor;
      cursor += 1;
      results[current] = await worker(items[current], current);
    }
  });
  await Promise.all(runners);
  return results;
}

function batchTerminalOutcome(job) {
  const status = job?.status;
  if (SUCCESS_BATCH_STATUSES.has(status)) return 'success';
  if (FAILED_BATCH_STATUSES.has(status)) return 'failed';
  if (PARTIAL_BATCH_STATUSES.has(status)) return 'partial';
  const custs = Array.isArray(job?.customers) ? job.customers : [];
  if (custs.length > 0 && custs.every((c) => TERMINAL_CUSTOMER_STATUSES.has(c.status))) {
    const anyFailed = custs.some((c) => c.status === 'failed');
    const allFailed = custs.every((c) => c.status === 'failed');
    if (allFailed) return 'failed';
    return anyFailed ? 'partial' : 'success';
  }
  return null;
}

async function pollBatch(batchId) {
  const startedAt = Date.now();
  let lastStatus = 'unknown';
  let lastJob = null;
  while (Date.now() - startedAt <= pollTimeoutMs) {
    const result = await request(`/v1/jobs/${encodeURIComponent(batchId)}`);
    if (result.status === 200) {
      lastStatus = result.body?.status ?? lastStatus;
      lastJob = result.body;
      const outcome = batchTerminalOutcome(result.body);
      if (outcome) {
        return { batchId, outcome, status: lastStatus, durationMs: Date.now() - startedAt, job: lastJob };
      }
    } else {
      lastStatus = `http_${result.status}`;
    }
    await sleep(pollIntervalMs);
  }
  return { batchId, outcome: 'timeout', status: lastStatus, durationMs: Date.now() - startedAt, job: lastJob };
}

// ── Per-stage timing (bottleneck finder) ──────────────────────────────────────
// Walk every customer in every polled job, diff the stage timestamps, and bucket
// the durations per transition so we can report which stage is slowest.
function collectStageTimings(jobs) {
  const buckets = new Map(STAGE_TRANSITIONS.map((s) => [s.label, []]));
  let customersSeen = 0;
  for (const job of jobs) {
    const custs = Array.isArray(job?.customers) ? job.customers : [];
    for (const cust of custs) {
      customersSeen += 1;
      for (const stage of STAGE_TRANSITIONS) {
        const from = Date.parse(cust?.[stage.from]);
        const to = Date.parse(cust?.[stage.to]);
        if (Number.isFinite(from) && Number.isFinite(to) && to >= from) {
          buckets.get(stage.label).push(to - from);
        }
      }
    }
  }
  return { buckets, customersSeen };
}

function reportStageTimings(jobs) {
  const { buckets, customersSeen } = collectStageTimings(jobs);
  console.log('\n' + '═'.repeat(70));
  console.log('PER-STAGE TIMING (bottleneck finder)');
  console.log('═'.repeat(70));
  if (customersSeen === 0) {
    console.log('no per-customer timestamps available on /v1/jobs — cannot localize bottleneck.');
    return;
  }
  console.log(`customers analyzed   : ${customersSeen}\n`);

  let slowest = null;
  for (const stage of STAGE_TRANSITIONS) {
    const values = buckets.get(stage.label);
    console.log(summarize(`  ${stage.label.padEnd(24)}`, values));
    // Rank only the per-stage segments (exclude the total) by p95.
    if (values.length > 0 && stage.to !== 'completed_at') {
      const p95 = percentile([...values].sort((a, b) => a - b), 95);
      if (!slowest || p95 > slowest.p95) slowest = { label: stage.label, p95 };
    }
  }
  if (slowest) {
    console.log(`\n>> Slowest stage (p95): ${slowest.label} @ ${Math.round(slowest.p95)}ms`);
    console.log('   This is where to add capacity (Lambda concurrency / model quota / DB pool).');
  }
}

// ── CloudWatch correlation (opt-in) ───────────────────────────────────────────
function aggregate(values, mode) {
  if (!values || values.length === 0) return null;
  if (mode === 'sum') return values.reduce((a, b) => a + b, 0);
  if (mode === 'max') return Math.max(...values);
  if (mode === 'avg') return values.reduce((a, b) => a + b, 0) / values.length;
  return null;
}

function fmtMetric(value, unit) {
  if (value === null || value === undefined) return 'n/a';
  const rounded = Math.round(value * 100) / 100;
  return unit ? `${rounded}${unit}` : `${rounded}`;
}

// Build the list of {id, spec} metric queries for the configured resources.
function buildCloudWatchSpecs() {
  const specs = [];
  let i = 0;
  const add = (spec) => {
    specs.push({ id: `q${i}`, ...spec });
    i += 1;
  };

  for (const fn of cwLambdas) {
    const dims = [{ Name: 'FunctionName', Value: fn }];
    add({ group: `lambda ${fn}`, label: 'throttles', ns: 'AWS/Lambda', metric: 'Throttles', stat: 'Sum', agg: 'sum', unit: '', flag: (v) => (v > 0 ? 'THROTTLED — raise concurrency' : null), dims });
    add({ group: `lambda ${fn}`, label: 'errors', ns: 'AWS/Lambda', metric: 'Errors', stat: 'Sum', agg: 'sum', unit: '', flag: (v) => (v > 0 ? 'ERRORS' : null), dims });
    add({ group: `lambda ${fn}`, label: 'max concurrency', ns: 'AWS/Lambda', metric: 'ConcurrentExecutions', stat: 'Maximum', agg: 'max', unit: '', dims });
    add({ group: `lambda ${fn}`, label: 'duration max', ns: 'AWS/Lambda', metric: 'Duration', stat: 'Maximum', agg: 'max', unit: 'ms', dims });
  }

  for (const q of cwQueues) {
    const dims = [{ Name: 'QueueName', Value: q }];
    add({ group: `sqs ${q}`, label: 'depth max', ns: 'AWS/SQS', metric: 'ApproximateNumberOfMessagesVisible', stat: 'Maximum', agg: 'max', unit: '', dims });
    add({ group: `sqs ${q}`, label: 'oldest age max', ns: 'AWS/SQS', metric: 'ApproximateAgeOfOldestMessage', stat: 'Maximum', agg: 'max', unit: 's', flag: (v) => (v > 30 ? 'BACKLOG — consumers behind producers' : null), dims });
    add({ group: `sqs ${q}`, label: 'sent', ns: 'AWS/SQS', metric: 'NumberOfMessagesSent', stat: 'Sum', agg: 'sum', unit: '', dims });
  }

  if (cwRdsCluster) {
    const dims = [{ Name: 'DBClusterIdentifier', Value: cwRdsCluster }];
    add({ group: `rds ${cwRdsCluster}`, label: 'connections max', ns: 'AWS/RDS', metric: 'DatabaseConnections', stat: 'Maximum', agg: 'max', unit: '', flag: (v) => (cwDbMaxConnections > 0 && v >= 0.8 * cwDbMaxConnections ? `NEAR LIMIT (${cwDbMaxConnections})` : null), dims });
    add({ group: `rds ${cwRdsCluster}`, label: 'cpu max', ns: 'AWS/RDS', metric: 'CPUUtilization', stat: 'Maximum', agg: 'max', unit: '%', flag: (v) => (v > 80 ? 'HIGH CPU' : null), dims });
    add({ group: `rds ${cwRdsCluster}`, label: 'acu max', ns: 'AWS/RDS', metric: 'ACUUtilization', stat: 'Maximum', agg: 'max', unit: '%', flag: (v) => (v > 80 ? 'HIGH ACU — scaling ceiling' : null), dims });
  }

  return specs;
}

async function reportCloudWatch({ startMs, endMs }) {
  if (!cloudWatchEnabled) return;

  console.log('\n' + '═'.repeat(70));
  console.log('CLOUDWATCH CORRELATION');
  console.log('═'.repeat(70));

  let sdk;
  try {
    sdk = await import('@aws-sdk/client-cloudwatch');
  } catch {
    console.log('@aws-sdk/client-cloudwatch is not installed — skipping correlation.');
    console.log('  install once:  npm i --prefix backend @aws-sdk/client-cloudwatch');
    return;
  }
  const { CloudWatchClient, GetMetricDataCommand } = sdk;

  const specs = buildCloudWatchSpecs();
  if (specs.length === 0) {
    console.log('no resources configured (LOAD_TEST_LAMBDAS / LOAD_TEST_SQS_QUEUES / LOAD_TEST_RDS_CLUSTER).');
    return;
  }

  const client = new CloudWatchClient({ region: awsRegion });
  // Pad the window: CloudWatch buckets to >=60s periods and metrics can lag.
  const start = new Date(startMs - 60_000);
  const end = new Date(endMs + 120_000);
  const period = 60;
  const queries = specs.map((s) => ({
    Id: s.id,
    MetricStat: {
      Metric: { Namespace: s.ns, MetricName: s.metric, Dimensions: s.dims },
      Period: period,
      Stat: s.stat,
    },
    ReturnData: true,
  }));

  const valuesById = new Map();
  try {
    let nextToken;
    do {
      const resp = await client.send(
        new GetMetricDataCommand({
          MetricDataQueries: queries,
          StartTime: start,
          EndTime: end,
          ScanBy: 'TimestampAscending',
          NextToken: nextToken,
        })
      );
      for (const r of resp.MetricDataResults ?? []) {
        const acc = valuesById.get(r.Id) ?? [];
        acc.push(...(r.Values ?? []));
        valuesById.set(r.Id, acc);
      }
      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err) {
    console.log(`failed to read CloudWatch (${err.name || 'error'}): ${err.message}`);
    console.log('  check AWS creds/region and cloudwatch:GetMetricData permission.');
    return;
  }

  console.log(`region ${awsRegion}  window ${start.toISOString()} → ${end.toISOString()}`);
  console.log('(metrics can lag 1–3 min; re-run correlation later if a row reads n/a)\n');

  const flags = [];
  let currentGroup = null;
  for (const s of specs) {
    if (s.group !== currentGroup) {
      currentGroup = s.group;
      console.log(`  ${currentGroup}`);
    }
    const value = aggregate(valuesById.get(s.id), s.agg);
    const flag = value !== null && s.flag ? s.flag(value) : null;
    console.log(`    ${s.label.padEnd(18)} ${fmtMetric(value, s.unit).padStart(12)}${flag ? `   ⚠ ${flag}` : ''}`);
    if (flag) flags.push(`${s.group} ${s.label}: ${flag}`);
  }

  console.log('');
  if (flags.length === 0) {
    console.log('>> No infra-level red flags in this window (no throttles/backlog/limits hit).');
  } else {
    console.log('>> Infra bottleneck signals:');
    for (const f of flags) console.log(`   - ${f}`);
  }
}

// ── Sustained / ramp arrival driver ──────────────────────────────────────────
// Open-loop pacer with concurrency backpressure: emit one fresh batch every
// (60000 / rate) ms for the configured duration, stepping through ramp phases.
// Never exceeds `concurrency` in-flight requests (waits for a slot), so the load
// is paced by target rate until the system saturates, then by capacity — which
// is exactly the regime where bottlenecks surface.
async function runArrivalLoad(runId) {
  const phases = rampRates ?? [ratePerMin];
  const phaseDurationMs = (durationS * 1000) / phases.length;
  const submissions = [];
  const inFlight = new Set();
  let seq = 0;
  let batchIndex = 0;

  const runStart = Date.now();
  for (let p = 0; p < phases.length; p += 1) {
    const rate = phases[p];
    const intervalMs = 60000 / rate;
    const phaseEnd = runStart + phaseDurationMs * (p + 1);
    console.log(
      `[phase ${p + 1}/${phases.length}] rate=${rate}/min interval=${intervalMs.toFixed(0)}ms ` +
        `ends@+${Math.round((phaseEnd - runStart) / 1000)}s`
    );
    while (Date.now() < phaseEnd) {
      const tickStart = Date.now();
      while (inFlight.size >= concurrency) {
        await Promise.race(inFlight);
      }
      const batchCustomers = [];
      for (let i = 0; i < customersPerBatch; i += 1) {
        seq += 1;
        batchCustomers.push(makeCustomer(runId, seq));
      }
      const idx = batchIndex;
      batchIndex += 1;
      const promise = submitBatch(batchCustomers, idx).then((res) => {
        submissions.push(res);
        inFlight.delete(promise);
        return res;
      });
      inFlight.add(promise);

      const wait = intervalMs - (Date.now() - tickStart);
      if (wait > 0) await sleep(wait);
    }
  }
  await Promise.all(inFlight);
  return submissions;
}

// ── Teardown (DB cleanup) ─────────────────────────────────────────────────────
// Escape LIKE wildcards in the fixed prefix, then append '%'. run_id is digits,
// but we escape defensively so the prefix is matched literally (ESCAPE '\').
function teardownPattern(runId) {
  const escaped = `loadtest_${runId}_`.replace(/([\\%_])/g, '\\$1');
  return `${escaped}%`;
}

async function loadPg() {
  try {
    const mod = await import('pg');
    const Client = mod.Client ?? mod.default?.Client;
    if (!Client) throw new Error('pg.Client not found');
    return Client;
  } catch {
    return null;
  }
}

async function runTeardown(runIds) {
  console.log('\n' + '═'.repeat(70));
  console.log('TEARDOWN (deleting synthetic rows by run_id)');
  console.log('═'.repeat(70));

  const Client = await loadPg();
  if (!Client) {
    console.log('the `pg` package is not installed — skipping teardown.');
    console.log('  install once:  npm i --prefix backend pg');
    process.exitCode = 1;
    return;
  }
  if (!process.env.DATABASE_URL && !process.env.PGHOST) {
    console.log('set DATABASE_URL (or standard PG* env vars) to enable teardown — skipping.');
    process.exitCode = 1;
    return;
  }

  const config = process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {};
  if (dbUseSsl) config.ssl = { rejectUnauthorized: false };

  const client = new Client(config);
  try {
    await client.connect();
  } catch (err) {
    console.log(`failed to connect to the database: ${err.message}`);
    console.log('  check DATABASE_URL / PG* env and network/VPC access to the cluster.');
    process.exitCode = 1;
    return;
  }

  try {
    for (const runId of runIds) {
      const pattern = teardownPattern(runId);
      console.log(`\nrun_id ${runId}  (pattern ${pattern})`);
      await client.query('BEGIN');
      let total = 0;
      for (const step of TEARDOWN_STEPS) {
        const res = await client.query(step.sql, [pattern]);
        const n = res.rowCount ?? 0;
        total += n;
        if (n > 0) console.log(`    ${step.table.padEnd(26)} ${n}`);
      }
      await client.query('COMMIT');
      console.log(`    total rows deleted: ${total}`);
    }
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore rollback failure */
    }
    console.log(`teardown failed (rolled back): ${err.message}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

async function maybeTeardown(runId) {
  if (teardownAfter) await runTeardown([runId]);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Cleanup-only mode: delete prior runs' rows and exit without submitting load.
  if (teardownOnlyRunIds.length > 0) {
    console.log(`teardown-only: cleaning ${teardownOnlyRunIds.length} run_id(s)`);
    await runTeardown(teardownOnlyRunIds);
    return;
  }

  if (!apiKey) {
    throw new Error('VENTUS_API_KEY is required');
  }
  if (!SUPPORTED_FORMATS.has(ingestFormat)) {
    throw new Error(`LOAD_TEST_INGEST_FORMAT must be one of ${[...SUPPORTED_FORMATS].join(', ')}`);
  }
  if (!SUPPORTED_MODES.has(mode)) {
    throw new Error(`LOAD_TEST_MODE must be one of ${[...SUPPORTED_MODES].join(', ')}`);
  }
  if (isProductionUrl(baseUrl) && !allowProduction) {
    throw new Error(
      `Refusing to load test against api.ventusai.com. Set LOAD_TEST_ALLOW_PRODUCTION=true to override (this will consume Gemini quota and write real data).`
    );
  }

  if (isArrivalProfile && customersPerBatch * txnsPerCustomer > maxBatch) {
    throw new Error(
      `customers_per_batch (${customersPerBatch}) * txns_per_customer (${txnsPerCustomer}) ` +
        `exceeds max batch size (${maxBatch}); lower LOAD_TEST_CUSTOMERS_PER_BATCH`
    );
  }

  const runId = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const profile = isArrivalProfile ? (rampRates ? 'ramp' : 'sustained') : 'burst';

  console.log('─'.repeat(70));
  console.log('Ventus enrich load test + bottleneck finder');
  console.log(`  target          : ${baseUrl}`);
  console.log(`  ingest_format   : ${ingestFormat}`);
  console.log(`  mode            : ${mode}`);
  console.log(`  profile         : ${profile}`);
  console.log(`  txns/customer   : ${txnsPerCustomer}`);
  console.log(`  max batch       : ${maxBatch}`);
  console.log(`  concurrency     : ${concurrency}`);
  if (isArrivalProfile) {
    console.log(`  duration        : ${durationS}s`);
    console.log(`  rate(s)/min     : ${rampRates ? rampRates.join(' → ') : ratePerMin}`);
    console.log(`  customers/batch : ${customersPerBatch}`);
  } else {
    console.log(`  customers       : ${customers}`);
    console.log(`  total txns      : ${customers * txnsPerCustomer}`);
  }
  if (cloudWatchEnabled) {
    const rds = cwRdsCluster ? `, rds=${cwRdsCluster}` : '';
    console.log(`  cloudwatch      : on (${awsRegion}; ${cwLambdas.length} lambdas, ${cwQueues.length} queues${rds})`);
  }
  if (teardownAfter) {
    console.log(`  teardown        : on (deletes this run's rows after completion)`);
  }
  console.log(`  run_id          : ${runId}`);
  console.log('─'.repeat(70));

  let submissions;
  const submitStart = Date.now();
  if (isArrivalProfile) {
    console.log(`driving arrival load for ${durationS}s...\n`);
    submissions = await runArrivalLoad(runId);
  } else {
    const batches = packBatches(generateCustomers(runId));
    console.log(`packed ${customers * txnsPerCustomer} txns into ${batches.length} batch(es)\n`);
    submissions = await runWithConcurrency(batches, concurrency, submitBatch);
  }
  const submitWallMs = Date.now() - submitStart;

  const successful = submissions.filter((s) => s.ok);
  const failedSubmits = submissions.filter((s) => !s.ok);
  const rateLimited = submissions.filter((s) => s.status === 429);
  const acceptedTxns = successful.reduce((sum, s) => sum + (s.accepted ?? s.txnCount), 0);
  const attemptedTxns = submissions.reduce((sum, s) => sum + (s.txnCount ?? 0), 0);

  console.log('\n' + '═'.repeat(70));
  console.log('SUBMIT RESULTS');
  console.log('═'.repeat(70));
  console.log(`batches submitted    : ${submissions.length}`);
  console.log(`accepted (202)       : ${successful.length}`);
  console.log(`failed               : ${failedSubmits.length}`);
  console.log(`rate limited (429)   : ${rateLimited.length}`);
  console.log(`accepted txns        : ${acceptedTxns}/${attemptedTxns}`);
  console.log(`submit wall time     : ${submitWallMs}ms`);
  console.log(`submit throughput    : ${(acceptedTxns / (submitWallMs / 1000)).toFixed(1)} txns/s`);
  console.log(summarize('submit latency', submissions.map((s) => s.latencyMs)));

  if (failedSubmits.length > 0) {
    const byStatus = {};
    for (const s of failedSubmits) byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    console.log(`failed by status     : ${JSON.stringify(byStatus)}`);
  }

  if (mode === 'ingest') {
    console.log('\nmode=ingest: skipping pipeline completion polling.');
    await reportCloudWatch({ startMs: submitStart, endMs: Date.now() });
    await maybeTeardown(runId);
    finishWithExit(failedSubmits.length, 0);
    return;
  }

  const batchIds = successful.map((s) => s.batchId).filter(Boolean);
  if (batchIds.length === 0) {
    console.log('\nno accepted batches to poll.');
    await reportCloudWatch({ startMs: submitStart, endMs: Date.now() });
    await maybeTeardown(runId);
    finishWithExit(failedSubmits.length, 0);
    return;
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`POLLING ${batchIds.length} BATCH(ES) TO COMPLETION`);
  console.log('═'.repeat(70));

  const pollStart = Date.now();
  const pollResults = await runWithConcurrency(batchIds, concurrency, (id) => pollBatch(id));
  const pollWallMs = Date.now() - pollStart;

  const succeeded = pollResults.filter((r) => r.outcome === 'success');
  const partial = pollResults.filter((r) => r.outcome === 'partial');
  const failed = pollResults.filter((r) => r.outcome === 'failed');
  const timedOut = pollResults.filter((r) => r.outcome === 'timeout');

  console.log('\n' + '═'.repeat(70));
  console.log('PIPELINE RESULTS');
  console.log('═'.repeat(70));
  console.log(`succeeded            : ${succeeded.length}`);
  console.log(`partial              : ${partial.length}`);
  console.log(`failed               : ${failed.length}`);
  console.log(`timed out            : ${timedOut.length}`);
  console.log(`poll wall time       : ${pollWallMs}ms`);
  console.log(summarize('time to terminal', pollResults.map((r) => r.durationMs)));

  for (const r of [...failed, ...timedOut]) {
    console.log(`  ${r.outcome.toUpperCase()} ${r.batchId} last_status=${r.status} after=${r.durationMs}ms`);
  }

  reportStageTimings(pollResults.map((r) => r.job).filter(Boolean));

  await reportCloudWatch({ startMs: submitStart, endMs: Date.now() });

  await maybeTeardown(runId);

  finishWithExit(failedSubmits.length, failed.length + timedOut.length);
}

function finishWithExit(submitFailures, pipelineFailures) {
  console.log('\n' + '─'.repeat(70));
  if (submitFailures === 0 && pipelineFailures === 0) {
    console.log('LOAD TEST PASSED — no submit or pipeline failures');
  } else {
    console.log(
      `LOAD TEST COMPLETED WITH ISSUES — submit_failures=${submitFailures} pipeline_failures=${pipelineFailures}`
    );
    process.exitCode = 1;
  }
  console.log('─'.repeat(70));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
