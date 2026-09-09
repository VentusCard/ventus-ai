import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateGoldenPredictionResults } from './qa-validators.mjs';
import { normalizeBenchmarkPredictionContract } from '../../eval/lib/model-output-contract.mjs';

test('model-output evaluator accepts configured category aliases', () => {
  const expectations = {
    expectations: [
      {
        transaction_id: 'pbm_0001',
        source_system: 'plaid_synthetic_benchmark',
        rail: 'card',
        source_profile: 'card_food',
        transaction_type: 'debit',
        expected_clean_merchant_name: 'Starbucks',
        expected_lifestyle_category: 'Food & Dining',
        accepted_lifestyle_categories: ['Miscellaneous & Unclassified'],
        expected_merchant_category: 'Coffee Shops',
        accepted_merchant_categories: ['Coffee Shop'],
        expected_confidence_min: 0.8,
        expected_signals: {
          travel_candidate: false,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
    ],
  };
  const predictions = {
    predictions: [
      {
        transaction_id: 'pbm_0001',
        clean_merchant_name: 'starbucks',
        lifestyle_category: 'Miscellaneous & Unclassified',
        merchant_category: 'Coffee Shop',
        confidence_score: 0.9,
        signals: {
          travel_candidate: false,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
    ],
  };

  const report = evaluateGoldenPredictionResults(expectations, predictions);

  assert.equal(report.summary.passed_expectations, 1);
  assert.equal(report.summary.pass_rate, 1);
  assert.equal(report.failures.length, 0);
});

test('model-output evaluator accepts conservative global equivalence groups', () => {
  const expectations = {
    expectations: [
      {
        transaction_id: 'pbm_0023',
        source_system: 'plaid_synthetic_benchmark',
        rail: 'p2p',
        source_profile: 'p2p_transfer',
        transaction_type: 'debit',
        expected_clean_merchant_name: 'Zelle Payment',
        expected_lifestyle_category: 'Financial & Aspirational',
        expected_merchant_category: 'Transfers',
        expected_confidence_min: 0.8,
        expected_signals: {
          travel_candidate: false,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
      {
        transaction_id: 'pbm_0033',
        source_system: 'plaid_synthetic_benchmark',
        rail: 'card',
        source_profile: 'card_subscription',
        transaction_type: 'debit',
        expected_clean_merchant_name: 'Apple',
        expected_lifestyle_category: 'Entertainment & Culture',
        expected_merchant_category: 'Software & Apps',
        expected_confidence_min: 0.8,
        expected_signals: {
          travel_candidate: false,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
    ],
  };
  const predictions = {
    predictions: [
      {
        transaction_id: 'pbm_0023',
        clean_merchant_name: 'Zelle',
        lifestyle_category: 'Financial & Aspirational',
        merchant_category: 'Cash & Money Transfer',
        confidence_score: 0.9,
        signals: {
          travel_candidate: false,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
      {
        transaction_id: 'pbm_0033',
        clean_merchant_name: 'Apple',
        lifestyle_category: 'Entertainment & Culture',
        merchant_category: 'Streaming Subscriptions',
        confidence_score: 0.9,
        signals: {
          travel_candidate: false,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
    ],
  };

  const report = evaluateGoldenPredictionResults(expectations, predictions);

  assert.equal(report.summary.passed_expectations, 2);
  assert.equal(report.failures.length, 0);
});

test('model-output evaluator does not over-accept review-needed government labels', () => {
  const expectations = {
    expectations: [
      {
        transaction_id: 'pbm_0021',
        source_system: 'plaid_synthetic_benchmark',
        rail: 'ach',
        source_profile: 'ach_payroll',
        transaction_type: 'credit',
        expected_clean_merchant_name: 'IRS Tax Refund',
        expected_lifestyle_category: 'Financial & Aspirational',
        expected_merchant_category: 'Government Benefits',
        expected_confidence_min: 0.8,
        expected_signals: {
          travel_candidate: false,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
    ],
  };
  const predictions = {
    predictions: [
      {
        transaction_id: 'pbm_0021',
        clean_merchant_name: 'IRS Tax Refund',
        lifestyle_category: 'Financial & Aspirational',
        merchant_category: 'Government & Taxes',
        confidence_score: 0.9,
        signals: {
          travel_candidate: false,
          risk_candidate: false,
          life_event_candidate: false,
        },
      },
    ],
  };

  const report = evaluateGoldenPredictionResults(expectations, predictions);

  assert.equal(report.summary.passed_expectations, 0);
  assert.equal(report.failures[0].field, 'merchant_category');
});

test('model-output contract repair records negative confidence sign repairs', () => {
  const contract = normalizeBenchmarkPredictionContract(
    {
      confidence_score: -0.95,
      lifestyle_category: 'Financial & Aspirational',
      merchant_category: 'Government Benefits',
    },
    {
      allowedLifestyleCategories: ['Financial & Aspirational'],
      allowedMerchantCategories: ['Government Benefits'],
    }
  );

  assert.equal(contract.confidence_score, 0.95);
  assert.equal(contract.raw_confidence_score, -0.95);
  assert.equal(contract.contract_repair.repaired, true);
  assert.equal(contract.contract_repair.repairs[0].code, 'negative_confidence_sign_repaired');
  assert.deepEqual(contract.contract_repair.violations, []);
});

test('model-output contract repair records taxonomy violations without guessing categories', () => {
  const contract = normalizeBenchmarkPredictionContract(
    {
      confidence_score: 95,
      lifestyle_category: 'Retail',
      merchant_category: 'General Merchandise',
    },
    {
      allowedLifestyleCategories: ['Miscellaneous & Unclassified'],
      allowedMerchantCategories: ['General Merchandise'],
    }
  );

  assert.equal(contract.confidence_score, 0.95);
  assert.equal(contract.contract_repair.repaired, true);
  assert.equal(contract.contract_repair.repairs[0].code, 'percentage_confidence_repaired');
  assert.equal(contract.contract_repair.violations[0].field, 'lifestyle_category');
  assert.equal(contract.contract_repair.violations[0].raw_value, 'Retail');
});
