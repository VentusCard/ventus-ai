import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createModelGateway, loadModelRoutingConfig } from '../shared/platform/model-gateway.mjs';
import { normalizeCleanMerchantName } from './lib/merchant-normalization.mjs';
import { normalizeBenchmarkPredictionContract } from './lib/model-output-contract.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const benchmarkRoot = join(backendRoot, 'artifacts', 'plaid-synthetic-benchmark');
const fixturePath = resolve(
  process.env.PLAID_SYNTHETIC_ENRICH_FIXTURE_PATH ||
    join(benchmarkRoot, 'plaid-synthetic-benchmark-enrich-fixture.json')
);
const provider = process.env.OPENROUTER_BENCHMARK_PROVIDER || 'openrouter';
const model = process.env.OPENROUTER_BENCHMARK_MODEL || 'z-ai/glm-5.2';
const limit = Number(process.env.OPENROUTER_BENCHMARK_LIMIT || 25);
const batchSize = Number(process.env.OPENROUTER_BENCHMARK_BATCH_SIZE || 10);
const runId = process.env.OPENROUTER_BENCHMARK_RUN_ID || `${provider}-${slugify(model)}-${limit}`;
const runDir = join(benchmarkRoot, 'runs', runId);
const outputPath = resolve(
  process.env.OPENROUTER_BENCHMARK_PREDICTIONS_PATH || join(runDir, 'predictions.json')
);
const rawOutputPath = resolve(
  process.env.OPENROUTER_BENCHMARK_RAW_OUTPUT_PATH || join(runDir, 'raw-output.json')
);
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
const SYSTEM_PROMPT = `You enrich banking transactions for Ventus AI.

Return strict JSON only:
{
  "predictions": [
    {
      "transaction_id": "string",
      "clean_merchant_name": "string",
      "lifestyle_category": "one exact value from the allowed lifestyle taxonomy",
      "merchant_category": "one exact value from the allowed merchant taxonomy",
      "confidence_score": 0.0,
      "signals": {
        "travel_candidate": false,
        "risk_candidate": false,
        "life_event_candidate": false
      },
      "taxonomy_gap_candidate": false,
      "suggested_category": null,
      "rationale": "short reason"
    }
  ]
}

Allowed lifestyle taxonomy:
${LIFESTYLE_TAXONOMY.map((value) => `- ${value}`).join('\n')}

Allowed merchant taxonomy:
${MERCHANT_CATEGORY_TAXONOMY.map((value) => `- ${value}`).join('\n')}

Rules:
- Include one prediction for every input transaction_id.
- Do not invent IDs.
- Use clean merchant names without payment processor noise or reference IDs.
- lifestyle_category must be exactly one value from the allowed lifestyle taxonomy. Do not invent variants.
- merchant_category must be exactly one value from the allowed merchant taxonomy. Do not invent variants.
- If none of the merchant categories fit well, choose the closest allowed category, set taxonomy_gap_candidate=true, and put the proposed new label in suggested_category.
- confidence_score must be a number from 0 to 1.
- travel_candidate should only be true for likely trip/travel behavior.
- risk_candidate should only be true for risk or fee/fraud-like behavior.
- life_event_candidate should only be true for major life event evidence such as moving, home purchase, new child, medical change, or income/employment change.

Lifestyle tie-breakers:
- P2P transfers default to Financial & Aspirational unless the descriptor has a clear consumer purpose such as dinner, lunch, ride, trip, rent, childcare, or medical.
- Cash App or Venmo descriptors with explicit meal language can be Food & Dining for lifestyle, but merchant_category should remain Transfers.
- Gas stations, parking, and rideshare are not automatically Travel & Exploration. Routine local commuting should usually be Home & Living because Ventus' current production taxonomy treats local commuting as a home/life operating expense. Use Travel & Exploration only when the surrounding evidence implies a trip, lodging, flight, or travel cluster.
- Apple.com digital billing and Steam can be Entertainment & Culture or Technology & Digital Life depending on whether the evidence points to media/gaming or software/app utility.
- Apple Store and consumer electronics can be Technology & Digital Life even when the raw PFC is general merchandise.
- QuickBooks, payroll software, and business SaaS should usually be Technology & Digital Life; use Financial & Aspirational only when the financial/admin signal is stronger than the software signal.
- Childcare, education, baby retail, donations, and community/family-oriented services should be Family & Community.
- Gyms, fitness studios, athletic apparel, sporting goods, and outdoor recreation are Sports & Active Living, not Health & Wellness. Reserve Health & Wellness for medical, pharmacy, therapy, and spa.
- Clothing, shoes, accessories, jewelry, hair/nail salons, and beauty products are Style & Beauty, not Miscellaneous & Unclassified or Health & Wellness.
- Pet food, veterinary care, pet supplies, grooming, and pet services are Pets.
- Miscellaneous & Unclassified is the fallback for broad retail or unclear consumer intent, not a preferred category when a stronger lifestyle signal exists.`;

assert.ok(Number.isInteger(limit) && limit > 0, 'OPENROUTER_BENCHMARK_LIMIT must be positive');
assert.ok(Number.isInteger(batchSize) && batchSize > 0, 'OPENROUTER_BENCHMARK_BATCH_SIZE must be positive');

const fixture = readJson(fixturePath);
assert.ok(Array.isArray(fixture.transactions), 'fixture.transactions must be an array');

const transactions = fixture.transactions.slice(0, Math.min(limit, fixture.transactions.length));
const transactionsById = new Map(transactions.map((transaction) => [transaction.transaction_id, transaction]));
const routingConfig = loadModelRoutingConfig();
const gateway = createModelGateway({
  routingConfig,
  getSecrets: async () => ({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  }),
});

console.log(`OpenRouter benchmark capture: model=${model}, transactions=${transactions.length}`);

const predictions = [];
const rawResponses = [];
for (let index = 0; index < transactions.length; index += batchSize) {
  const batch = transactions.slice(index, index + batchSize);
  const batchNumber = Math.floor(index / batchSize) + 1;
  const startedAt = Date.now();
  const { response, metadata } = await gateway.chatCompletion({
    task: 'benchmark_enrichment',
    provider,
    model,
    label: `OPENROUTER_BENCHMARK_${batchNumber}`,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Return predictions for these transactions only:\n${JSON.stringify(
          batch.map(toModelInput),
          null,
          2
        )}`,
      },
    ],
    response_format: { type: 'json_object' },
  });
  const latencyMs = Date.now() - startedAt;
  const text = await response.text();
  rawResponses.push({
    batch_number: batchNumber,
    status: response.status,
    ok: response.ok,
    route: metadata,
    raw_text: text,
  });

  if (!response.ok) {
    throw new Error(`OpenRouter benchmark batch ${batchNumber} failed ${response.status}: ${text.slice(0, 500)}`);
  }

  const parsed = parseModelResponse(text);
  const batchPredictions = normalizePredictions(parsed, {
    provider,
    model,
    modelRoute: 'benchmark_enrichment',
    latencyMs,
    transactionsById,
  });
  predictions.push(...batchPredictions);
  console.log(`batch ${batchNumber}: ${batchPredictions.length}/${batch.length} predictions`);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeJson(outputPath, {
  predictions,
  metadata: {
    provider,
    model,
    run_id: runId,
    model_route: 'benchmark_enrichment',
    fixture_path: fixturePath,
    transaction_count: transactions.length,
    limit,
    batch_size: batchSize,
  },
});
writeJson(rawOutputPath, {
  provider,
  model,
  run_id: runId,
  fixture_path: fixturePath,
  raw_responses: rawResponses,
});

console.log(`predictions: ${outputPath}`);
console.log(`raw output: ${rawOutputPath}`);
console.log(`prediction_count: ${predictions.length}`);

function toModelInput(transaction) {
  return {
    transaction_id: transaction.transaction_id,
    merchant_name: transaction.merchant_name,
    amount: transaction.amount,
    date: transaction.date,
    rail: transaction.rail,
    source_profile: transaction.source_profile,
    transaction_type: transaction.transaction_type,
    partner_metadata: {
      payment_channel: transaction.partner_metadata?.payment_channel,
      personal_finance_category: transaction.partner_metadata?.personal_finance_category,
      counterparty_type: transaction.partner_metadata?.counterparty_type,
    },
  };
}

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

function normalizePredictions(parsed, { provider, model, modelRoute, latencyMs, transactionsById }) {
  const rows = Array.isArray(parsed) ? parsed : parsed.predictions;
  assert.ok(Array.isArray(rows), 'model response must contain predictions[]');
  return rows.map((row) => {
    const transaction = transactionsById.get(row.transaction_id);
    const normalizedCleanMerchantName = normalizeCleanMerchantName({
      predictedName: row.clean_merchant_name,
      rawMerchantName: transaction?.merchant_name,
    });
    const contract = normalizeBenchmarkPredictionContract(row, {
      allowedLifestyleCategories: LIFESTYLE_TAXONOMY,
      allowedMerchantCategories: MERCHANT_CATEGORY_TAXONOMY,
    });

    return {
      transaction_id: row.transaction_id,
      clean_merchant_name: normalizedCleanMerchantName,
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
      model_provider: provider,
      model_name: model,
      model_route: modelRoute,
      latency_ms: latencyMs,
      estimated_cost: null,
      contract_repair: contract.contract_repair,
    };
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
