import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyTransactionSummaries,
  summarizeHttpTransaction,
  stripPartnerContext,
} from '../../shared/pipeline/classify-core.mjs';
import {
  toEnrichmentPrediction,
  mapClassificationsToPredictions,
} from './capture/classify-fidelity.mjs';
import { scoreClassificationFidelity } from './scorers.mjs';

// A stub gateway that mimics an OpenAI-compatible tool-calling response. It reads
// the batch back out of the user message and echoes one classification per txn,
// so we can exercise batching + mapping with zero network.
function makeStubGateway({ pillarFor = () => 'Food & Dining' } = {}) {
  const calls = [];
  return {
    calls,
    async chatCompletion({ messages, model, provider }) {
      const userContent = messages[1].content;
      const batch = JSON.parse(userContent.slice(userContent.indexOf('\n') + 1));
      calls.push({ size: batch.length, model, provider });
      const classifications = batch.map((txn) => ({
        transaction_id: txn.transaction_id,
        normalized_merchant: `Clean ${txn.merchant}`,
        pillar: pillarFor(txn),
        subcategory: 'Coffee Shops',
        confidence: 0.9,
      }));
      return {
        response: {
          ok: true,
          status: 200,
          async json() {
            return {
              choices: [
                {
                  message: {
                    tool_calls: [
                      { function: { arguments: JSON.stringify({ classifications }) } },
                    ],
                  },
                },
              ],
            };
          },
        },
        route: { provider: provider || 'gemini', model },
        metadata: { provider: provider || 'gemini', model },
      };
    },
  };
}

test('summarizeHttpTransaction keeps model-relevant fields and lifts plaid_pfc', () => {
  const summary = summarizeHttpTransaction({
    transaction_id: 't1',
    merchant_name: 'STARBUCKS #123',
    amount: 6.5,
    date: '2026-02-02',
    mcc_code: null,
    rail: 'card',
    source_profile: 'card_dining',
    transaction_type: 'debit',
    zip_code: '10003',
    partner_metadata: { personal_finance_category: 'FOOD_AND_DRINK_RESTAURANTS' },
  });
  assert.deepEqual(summary, {
    transaction_id: 't1',
    merchant: 'STARBUCKS #123',
    amount: 6.5,
    date: '2026-02-02',
    rail: 'card',
    source_profile: 'card_dining',
    transaction_type: 'debit',
    plaid_pfc: 'FOOD_AND_DRINK_RESTAURANTS',
    zip: '10003',
  });
  assert.ok(!('mcc_code' in summary), 'null mcc_code should be omitted');
});

test('classifyTransactionSummaries batches by batchSize and flattens results', async () => {
  const gateway = makeStubGateway();
  const summaries = Array.from({ length: 5 }, (_, i) => ({
    transaction_id: `t${i}`,
    merchant: `M${i}`,
  }));
  const classifications = await classifyTransactionSummaries(summaries, {
    modelGateway: gateway,
    model: 'stub-model',
    batchSize: 2,
  });
  assert.equal(classifications.length, 5);
  assert.equal(gateway.calls.length, 3, 'expected 3 batches for 5 items at batchSize 2');
  assert.deepEqual(gateway.calls.map((c) => c.size), [2, 2, 1]);
});

test('classifyTransactionSummaries forwards a provider override', async () => {
  const gateway = makeStubGateway();
  await classifyTransactionSummaries([{ transaction_id: 't0', merchant: 'M' }], {
    modelGateway: gateway,
    model: 'gemini-2.5-flash',
    provider: 'gemini',
  });
  assert.equal(gateway.calls[0].provider, 'gemini');
});

test('toEnrichmentPrediction maps prod fields and strips partner_context', () => {
  const prediction = toEnrichmentPrediction(
    { transaction_id: 't1', merchant_name: 'RAW' },
    {
      transaction_id: 't1',
      normalized_merchant: 'American Express [partner_context: rail=ach]',
      pillar: 'Financial & Aspirational',
      subcategory: 'Loan Payments',
      confidence: 0.9,
    }
  );
  assert.equal(prediction.clean_merchant_name, 'American Express');
  assert.equal(prediction.lifestyle_category, 'Financial & Aspirational');
  assert.equal(prediction.merchant_category, 'Loan Payments');
  assert.equal(prediction.confidence_score, 0.9);
});

test('toEnrichmentPrediction applies Lambda fallbacks when unclassified', () => {
  const prediction = toEnrichmentPrediction(
    { transaction_id: 't2', merchant_name: 'MYSTERY LLC' },
    undefined
  );
  assert.equal(prediction.clean_merchant_name, 'MYSTERY LLC');
  assert.equal(prediction.lifestyle_category, 'Miscellaneous & Unclassified');
  assert.equal(prediction.merchant_category, 'General');
  assert.equal(prediction.confidence_score, 0.1);
});

test('stripPartnerContext is a no-op for clean names', () => {
  assert.equal(stripPartnerContext('Starbucks'), 'Starbucks');
});

function goldenFixture() {
  return {
    fixture_version: 'test',
    expectations: [
      {
        transaction_id: 't1',
        source_system: 'plaid_synthetic_benchmark',
        rail: 'card',
        source_profile: 'card_dining',
        transaction_type: 'debit',
        expected_clean_merchant_name: 'Starbucks',
        expected_lifestyle_category: 'Food & Dining',
        expected_merchant_category: 'Coffee Shops',
        expected_confidence_min: 0.8,
        expected_signals: {
          travel_candidate: false,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
      {
        transaction_id: 't2',
        source_system: 'plaid_synthetic_benchmark',
        rail: 'card',
        source_profile: 'card_travel',
        transaction_type: 'debit',
        expected_clean_merchant_name: 'Delta Air Lines',
        expected_lifestyle_category: 'Travel & Exploration',
        expected_merchant_category: 'Flights',
        expected_confidence_min: 0.8,
        // This txn is a travel signal in golden — the classify-only eval must
        // NOT be penalized for missing the signal.
        expected_signals: {
          travel_candidate: true,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
    ],
  };
}

test('scoreClassificationFidelity grades merchant/category/confidence and ignores signals', () => {
  const golden = goldenFixture();
  const predictions = [
    {
      transaction_id: 't1',
      clean_merchant_name: 'Starbucks',
      lifestyle_category: 'Food & Dining',
      merchant_category: 'Coffee Shops',
      confidence_score: 0.9,
    },
    {
      transaction_id: 't2',
      clean_merchant_name: 'Delta Air Lines',
      lifestyle_category: 'Travel & Exploration',
      merchant_category: 'Flights',
      confidence_score: 0.85,
      // no signals emitted — classify Lambda doesn't produce them
    },
  ];
  const scored = scoreClassificationFidelity(golden, predictions);
  assert.equal(scored.sample_size, 2);
  assert.equal(scored.accuracy, 1, 'both rows should pass despite the travel signal being unaddressed');
  assert.equal(scored.detail.signals_scored, false);
  assert.ok(!Object.keys(scored.detail.by_field).some((f) => f.startsWith('signals.')));
});

test('scoreClassificationFidelity fails a wrong pillar', () => {
  const golden = goldenFixture();
  const predictions = [
    {
      transaction_id: 't1',
      clean_merchant_name: 'Starbucks',
      lifestyle_category: 'Home & Living', // wrong
      merchant_category: 'Coffee Shops',
      confidence_score: 0.9,
    },
  ];
  const scored = scoreClassificationFidelity(golden, predictions);
  assert.equal(scored.sample_size, 1);
  assert.equal(scored.accuracy, 0);
});

test('end-to-end: stub gateway -> predictions -> fidelity score', async () => {
  const golden = goldenFixture();
  const transactions = [
    { transaction_id: 't1', merchant_name: 'STARBUCKS #1', amount: 6.5, date: '2026-02-02' },
    { transaction_id: 't2', merchant_name: 'DELTA AIR', amount: 420, date: '2026-02-03' },
  ];
  const gateway = makeStubGateway({
    pillarFor: (txn) => (txn.merchant.includes('DELTA') ? 'Travel & Exploration' : 'Food & Dining'),
  });
  const summaries = transactions.map(summarizeHttpTransaction);
  const classifications = await classifyTransactionSummaries(summaries, {
    modelGateway: gateway,
    model: 'stub',
  });
  const predictions = mapClassificationsToPredictions(transactions, classifications);
  assert.equal(predictions.length, 2);
  // subcategory from stub is Coffee Shops for both; t2 expects Flights -> t2 category fails
  const scored = scoreClassificationFidelity(golden, predictions);
  assert.equal(scored.sample_size, 2);
  assert.ok(scored.accuracy >= 0 && scored.accuracy <= 1);
});
