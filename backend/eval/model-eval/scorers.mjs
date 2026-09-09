// Task scorers for the multi-task model evaluation framework.
//
// Every scorer returns the same shape so the runner and leaderboard can treat
// tasks uniformly:
//   { accuracy: number(0..1), sample_size: number, detail: object }
//
// - Classification tasks (enrichment) reuse the production golden evaluator.
// - Detection tasks (life events / risk / trips) use set precision/recall/F1
//   via makeDetectionScorer, with micro-F1 as the headline accuracy.

import { evaluateGoldenPredictionResults } from '../../scripts/lib/qa-validators.mjs';
import { setMetrics } from './scoring.mjs';

/**
 * Build a per-customer set-detection scorer.
 *
 * Golden shape:  { cases: [{ customer_id, expected: { [collectionKey]: [items] } }] }
 * Prediction shape: [{ customer_id, [collectionKey]: [items] }]
 *
 * @param {object} options
 * @param {string} options.collectionKey  e.g. 'risk_factors' | 'life_events' | 'trips'
 * @param {(item:object)=>string} options.keyFn   identity of an item (e.g. type)
 * @param {(item:object)=>string} [options.attrFn] secondary attribute graded on matches
 */
export function makeDetectionScorer({ collectionKey, keyFn, attrFn = null }) {
  if (!collectionKey) throw new Error('makeDetectionScorer requires collectionKey');
  return function score(golden, predictions) {
    const cases = Array.isArray(golden?.cases) ? golden.cases : [];
    const predByCustomer = new Map(
      (Array.isArray(predictions) ? predictions : []).map((p) => [p.customer_id, p])
    );

    let tp = 0;
    let fp = 0;
    let fn = 0;
    let matched = 0;
    let attrCorrect = 0;
    const perCase = [];

    for (const testCase of cases) {
      const expectedItems = testCase.expected?.[collectionKey] ?? [];
      const prediction = predByCustomer.get(testCase.customer_id);
      const predictedItems = prediction?.[collectionKey] ?? [];
      const m = setMetrics(expectedItems, predictedItems, { keyFn, attrFn });
      tp += m.tp;
      fp += m.fp;
      fn += m.fn;
      matched += m.matched;
      attrCorrect += m.attr_correct;
      perCase.push({ customer_id: testCase.customer_id, ...m });
    }

    const precision = ratio(tp, tp + fp);
    const recall = ratio(tp, tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    const macroF1 = perCase.length > 0 ? mean(perCase.map((c) => c.f1)) : 0;

    return {
      accuracy: round(f1),
      sample_size: cases.length,
      detail: {
        micro: {
          tp,
          fp,
          fn,
          precision: round(precision),
          recall: round(recall),
          f1: round(f1),
        },
        macro_f1: round(macroF1),
        attr_accuracy: attrFn && matched > 0 ? round(attrCorrect / matched) : null,
        per_case: perCase,
      },
    };
  };
}

/**
 * Enrichment (merchant_classification) scorer: delegates to the production
 * golden evaluator, filtering expectations down to the predicted transaction ids
 * so unscored rows are not counted as failures.
 */
export function scoreEnrichment(golden, predictions, metadata = {}) {
  const predictionRows = Array.isArray(predictions) ? predictions : predictions?.predictions ?? [];
  const predictedIds = new Set(predictionRows.map((row) => row.transaction_id));
  const subset = {
    ...golden,
    expectations: (golden.expectations || []).filter((e) => predictedIds.has(e.transaction_id)),
  };
  const report = evaluateGoldenPredictionResults(subset, predictionRows, metadata);
  return {
    accuracy: report.summary.pass_rate,
    sample_size: report.summary.checked_predictions,
    detail: {
      report_summary: report.summary,
      by_field: report.breakdowns?.by_field ?? null,
    },
  };
}

/**
 * Classify-only fidelity scorer.
 *
 * The production classify Lambda emits merchant name, lifestyle pillar,
 * subcategory, and confidence — it does NOT emit the travel/risk/life-event
 * signals that live in the golden expectations (those are produced by downstream
 * detection Lambdas). To grade classification fairly we score the four fields the
 * Lambda owns and treat signals as out of scope.
 *
 * Signals are neutralized by copying each expectation's expected_signals into the
 * matching prediction, so the row-level pass_rate reflects only
 * merchant/category/confidence. The signal field breakdown is stripped from the
 * returned detail so it is not mistaken for a graded metric.
 */
export function scoreClassificationFidelity(golden, predictions, metadata = {}) {
  const rows = Array.isArray(predictions) ? predictions : predictions?.predictions ?? [];
  const predictedIds = new Set(rows.map((row) => row.transaction_id));
  const expectations = (golden.expectations || []).filter((e) => predictedIds.has(e.transaction_id));
  const signalsById = new Map(expectations.map((e) => [e.transaction_id, e.expected_signals]));

  const neutralized = rows.map((row) => ({
    ...row,
    signals:
      signalsById.get(row.transaction_id) || {
        travel_candidate: false,
        risk_candidate: false,
        life_event_candidate: false,
      },
  }));

  const subset = { ...golden, expectations };
  const report = evaluateGoldenPredictionResults(subset, neutralized, metadata);
  const byField = report.breakdowns?.by_field ?? {};
  const nonSignalFields = Object.fromEntries(
    Object.entries(byField).filter(([field]) => !field.startsWith('signals.'))
  );

  return {
    accuracy: report.summary.pass_rate,
    sample_size: report.summary.checked_predictions,
    detail: {
      report_summary: {
        total_expectations: report.summary.total_expectations,
        checked_predictions: report.summary.checked_predictions,
        passed_expectations: report.summary.passed_expectations,
        failed_expectations: report.summary.failed_expectations,
        missing_predictions: report.summary.missing_predictions,
        pass_rate: report.summary.pass_rate,
      },
      by_field: nonSignalFields,
      signals_scored: false,
      scored_fields: ['clean_merchant_name', 'lifestyle_category', 'merchant_category', 'confidence_score'],
    },
  };
}

function ratio(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : 0;
}

function mean(values) {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

function round(value, decimals = 4) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
