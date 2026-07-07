import assert from 'node:assert/strict';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeCleanMerchantName } from './lib/merchant-normalization.mjs';
import { normalizeBenchmarkPredictionContract } from './lib/model-output-contract.mjs';

const LIFESTYLE_TAXONOMY = [
  'Entertainment & Culture',
  'Family & Community',
  'Financial & Aspirational',
  'Food & Dining',
  'Health & Wellness',
  'Home & Living',
  'Miscellaneous & Unclassified',
  'Pets',
  'Sports & Active Living',
  'Style & Beauty',
  'Technology & Digital Life',
  'Travel & Exploration',
];
const MERCHANT_CATEGORY_TAXONOMY = [
  'Ambiguous Merchant',
  'Bank Fees',
  'Business Software & Services',
  'Cash & Money Transfer',
  'Charitable Donations',
  'Coffee Shops',
  'Credit Card Payments',
  'Discount Retail',
  'Electronics',
  'Entertainment',
  'Family & Education',
  'Fast Casual Restaurant',
  'Flights',
  'Food Delivery',
  'Gas Stations',
  'General Merchandise',
  'Government & Taxes',
  'Government Benefits',
  'Grocery',
  'Home Improvement',
  'Hotels & Lodging',
  'Income',
  'Insurance & Premiums',
  'Large Transfers',
  'Legal Services',
  'Loan Payments',
  'Medical & Healthcare',
  'Moving',
  'Parking',
  'Personal Care & Lifestyle',
  'Pet Supplies & Veterinary',
  'Rent',
  'Retail',
  'Rideshare',
  'Services',
  'Shipping',
  'Software & Apps',
  'Streaming Subscriptions',
  'Temporary Hold',
  'Transfers',
  'Utilities',
];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const benchmarkRoot = join(backendRoot, 'artifacts', 'plaid-synthetic-benchmark');
const fixturePath = resolve(
  process.env.PLAID_SYNTHETIC_ENRICH_FIXTURE_PATH ||
    join(benchmarkRoot, 'plaid-synthetic-benchmark-enrich-fixture.json')
);
const runDir = resolveRequiredPath(process.env.OPENROUTER_BENCHMARK_RUN_DIR, 'OPENROUTER_BENCHMARK_RUN_DIR is required');
const rawOutputPath = resolve(process.env.OPENROUTER_BENCHMARK_RAW_OUTPUT_PATH || join(runDir, 'raw-output.json'));
const outputPath = resolve(process.env.OPENROUTER_BENCHMARK_PREDICTIONS_PATH || join(runDir, 'predictions.json'));

const fixture = readJson(fixturePath);
const rawOutput = readJson(rawOutputPath);
assert.ok(Array.isArray(fixture.transactions), 'fixture.transactions must be an array');
assert.ok(Array.isArray(rawOutput.raw_responses), 'raw output must contain raw_responses[]');

const transactionsById = new Map(fixture.transactions.map((transaction) => [transaction.transaction_id, transaction]));
const predictions = [];

for (const response of rawOutput.raw_responses) {
  if (!response.ok) continue;
  const parsed = parseModelResponse(response.raw_text);
  const rows = Array.isArray(parsed) ? parsed : parsed.predictions;
  assert.ok(Array.isArray(rows), 'model response must contain predictions[]');
  for (const row of rows) {
    const transaction = transactionsById.get(row.transaction_id);
    const contract = normalizeBenchmarkPredictionContract(row, {
      allowedLifestyleCategories: LIFESTYLE_TAXONOMY,
      allowedMerchantCategories: MERCHANT_CATEGORY_TAXONOMY,
    });
    predictions.push({
      transaction_id: row.transaction_id,
      clean_merchant_name: normalizeCleanMerchantName({
        predictedName: row.clean_merchant_name,
        rawMerchantName: transaction?.merchant_name,
      }),
      raw_clean_merchant_name: row.clean_merchant_name,
      lifestyle_category: row.lifestyle_category,
      merchant_category: row.merchant_category,
      confidence_score: contract.confidence_score,
      raw_confidence_score: contract.raw_confidence_score,
      signals: {
        travel_candidate: Boolean(row.signals?.travel_candidate),
        risk_candidate: Boolean(row.signals?.risk_candidate),
        life_event_candidate: Boolean(row.signals?.life_event_candidate),
      },
      taxonomy_gap_candidate: Boolean(row.taxonomy_gap_candidate),
      suggested_category: typeof row.suggested_category === 'string' ? row.suggested_category : null,
      rationale: typeof row.rationale === 'string' ? row.rationale : null,
      model_provider: rawOutput.provider,
      model_name: rawOutput.model,
      model_route: 'benchmark_enrichment',
      latency_ms: response.route?.duration_ms ?? null,
      estimated_cost: null,
      contract_repair: contract.contract_repair,
    });
  }
}

writeJson(outputPath, {
  predictions,
  metadata: {
    provider: rawOutput.provider,
    model: rawOutput.model,
    run_id: rawOutput.run_id,
    model_route: 'benchmark_enrichment',
    fixture_path: rawOutput.fixture_path,
    transaction_count: predictions.length,
    rebuilt_from_raw_output: rawOutputPath,
  },
});

console.log(`rebuilt predictions: ${outputPath}`);
console.log(`prediction_count: ${predictions.length}`);

function parseModelResponse(text) {
  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string') return data;
  const clean = content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  return JSON.parse(clean);
}

function resolveRequiredPath(value, message) {
  assert.ok(value, message);
  return resolve(value);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
