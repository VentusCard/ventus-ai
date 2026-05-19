import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const SOURCE_SYSTEMS = new Set(['fis', 'fiserv', 'jack_henry']);
export const TERMINAL_JOB_STATUSES = new Set(['complete', 'failed']);
export const JOB_STATUSES = new Set([
  'ingested',
  'classified',
  'pillar_analyzed',
  'travel_detected',
  'lifestyle_analyzed',
  'risk_analyzed',
  'complete',
  'failed',
]);
export const WEBHOOK_EVENTS = new Set([
  'batch_started',
  'batch_complete',
  'life_event_detected',
  'trip_detected',
  'risk_detected',
  'behavioral_signal_detected',
]);
export const RISK_SEVERITIES = new Set(['high', 'medium', 'low']);
export const LIFESTYLE_CATEGORIES = new Set([
  'Sports & Active Living',
  'Health & Wellness',
  'Food & Dining',
  'Travel & Exploration',
  'Home & Living',
  'Style & Beauty',
  'Pets',
  'Entertainment & Culture',
  'Technology & Digital Life',
  'Family & Community',
  'Financial & Aspirational',
  'Miscellaneous & Unclassified',
]);

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isString(value) {
  return typeof value === 'string' && value.length > 0;
}

export function isInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isNumberLike(value) {
  if (isFiniteNumber(value)) return true;
  if (typeof value !== 'string' || value.trim() === '') return false;
  return Number.isFinite(Number(value));
}

export function isDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isIsoOrDateLike(value) {
  return (
    value === null ||
    isDate(value) ||
    (typeof value === 'string' && !Number.isNaN(Date.parse(value)))
  );
}

export function isZip(value) {
  return value === null || (typeof value === 'string' && /^\d{5}(-\d{4})?$/.test(value));
}

export function isMcc(value) {
  return value === null || (typeof value === 'string' && /^\d{4}$/.test(value));
}

export function assertObject(value, label) {
  assert.ok(isObject(value), `${label} should be an object`);
}

export function assertString(value, label) {
  assert.ok(isString(value), `${label} should be a non-empty string`);
}

export function assertArray(value, label) {
  assert.ok(Array.isArray(value), `${label} should be an array`);
}

export function assertNumberLike(value, label) {
  assert.ok(isNumberLike(value), `${label} should be numeric`);
}

export function assertConfidence(value, label) {
  assert.ok(isFiniteNumber(value), `${label} should be a number`);
  assert.ok(value >= 0 && value <= 1, `${label} should be between 0 and 1`);
}

export function validateEnrichTransaction(txn, label = 'transaction') {
  assertObject(txn, label);
  assertString(txn.transaction_id, `${label}.transaction_id`);
  assertString(txn.customer_id, `${label}.customer_id`);
  assertString(txn.merchant_name, `${label}.merchant_name`);
  assert.ok(isFiniteNumber(txn.amount), `${label}.amount should be a finite number`);
  assert.ok(isDate(txn.date), `${label}.date should use YYYY-MM-DD`);
  assert.ok(isMcc(txn.mcc_code ?? null), `${label}.mcc_code should be a four digit MCC`);
  assert.ok(isZip(txn.zip_code ?? null), `${label}.zip_code should be a ZIP code`);
  assert.ok(isZip(txn.home_zip ?? null), `${label}.home_zip should be a ZIP code`);
}

export function validateMockBankFixtures(mockBankRoot) {
  const seenIds = new Set();
  const files = readdirSync(mockBankRoot).filter((name) => name.endsWith('.json')).sort();
  assert.ok(files.length >= 3, 'expected mock-bank fixtures for multiple core processors');

  for (const fileName of files) {
    const fixture = readJson(join(mockBankRoot, fileName));
    assertString(fixture.fixture_version, `${fileName}.fixture_version`);
    assert.ok(SOURCE_SYSTEMS.has(fixture.source_system), `${fileName}.source_system is unsupported`);
    assertString(fixture.description, `${fileName}.description`);
    assertArray(fixture.transactions, `${fileName}.transactions`);
    assert.ok(fixture.transactions.length > 0, `${fileName}.transactions should not be empty`);

    for (const [index, txn] of fixture.transactions.entries()) {
      validateEnrichTransaction(txn, `${fileName}.transactions[${index}]`);
      assert.ok(!seenIds.has(txn.transaction_id), `duplicate transaction_id ${txn.transaction_id}`);
      seenIds.add(txn.transaction_id);
    }
  }

  return { files, transactionCount: seenIds.size };
}

export function validateEnrichResponse(value, label = 'enrich_response') {
  assertObject(value, label);
  assertString(value.batch_id, `${label}.batch_id`);
  assert.equal(value.status, 'ingested', `${label}.status`);
  assert.ok(isInteger(value.transaction_count), `${label}.transaction_count`);
  assert.ok(isInteger(value.customers), `${label}.customers`);
  assertString(value.message, `${label}.message`);
}

export function validateJobResponse(value, label = 'job_response') {
  assertObject(value, label);
  assertString(value.job_id, `${label}.job_id`);
  assert.ok(JOB_STATUSES.has(value.status), `${label}.status ${value.status} is unsupported`);
  assertString(value.bank_id, `${label}.bank_id`);
  assert.ok(isInteger(value.transaction_count), `${label}.transaction_count`);
  assertString(value.source_file, `${label}.source_file`);
  assertArray(value.customers, `${label}.customers`);

  for (const [index, customer] of value.customers.entries()) {
    const customerLabel = `${label}.customers[${index}]`;
    assertString(customer.customer_id, `${customerLabel}.customer_id`);
    assert.ok(JOB_STATUSES.has(customer.status), `${customerLabel}.status is unsupported`);
    assert.ok(
      customer.error_message === null || typeof customer.error_message === 'string',
      `${customerLabel}.error_message should be null or string`
    );
    assertObject(customer.timestamps, `${customerLabel}.timestamps`);
    for (const key of [
      'ingested_at',
      'classified_at',
      'pillar_analyzed_at',
      'travel_detected_at',
      'lifestyle_analyzed_at',
      'risk_analyzed_at',
      'completed_at',
    ]) {
      assert.ok(isIsoOrDateLike(customer.timestamps[key]), `${customerLabel}.timestamps.${key} should be date-like`);
    }
  }
}

export function validateEnrichedTransaction(txn, label = 'enriched_transaction') {
  assertObject(txn, label);
  assertString(txn.transaction_id, `${label}.transaction_id`);
  assertString(txn.clean_merchant_name, `${label}.clean_merchant_name`);
  assertString(txn.lifestyle_category, `${label}.lifestyle_category`);
  assertString(txn.merchant_category, `${label}.merchant_category`);
  assertNumberLike(txn.amount, `${label}.amount`);
  assert.ok(txn.pre_tax_amount === null || isNumberLike(txn.pre_tax_amount), `${label}.pre_tax_amount`);
  assert.ok(txn.tax_amount === null || isNumberLike(txn.tax_amount), `${label}.tax_amount`);
  assert.ok(txn.tax_rate === null || typeof txn.tax_rate === 'string', `${label}.tax_rate`);
  assert.ok(txn.tax_state === null || typeof txn.tax_state === 'string', `${label}.tax_state`);
  assert.ok(isIsoOrDateLike(txn.transaction_date), `${label}.transaction_date`);
  assertConfidence(txn.confidence_score, `${label}.confidence_score`);
  assert.ok(txn.inferred_purchase === null || typeof txn.inferred_purchase === 'string', `${label}.inferred_purchase`);
  assert.ok(txn.trip_id === null || typeof txn.trip_id === 'string', `${label}.trip_id`);
  assert.ok(isZip(txn.zip_code ?? null), `${label}.zip_code`);
}

export function validateTransactionsResponse(value, label = 'transactions_response') {
  assertObject(value, label);
  assertString(value.customer_id, `${label}.customer_id`);
  assert.ok(isInteger(value.total), `${label}.total`);
  assert.ok(isInteger(value.limit), `${label}.limit`);
  assert.ok(isInteger(value.offset), `${label}.offset`);
  assertArray(value.transactions, `${label}.transactions`);
  assert.ok(value.total >= value.transactions.length, `${label}.total should cover returned rows`);
  value.transactions.forEach((txn, index) =>
    validateEnrichedTransaction(txn, `${label}.transactions[${index}]`)
  );
}

export function validateEvidence(evidence, label = 'evidence') {
  assertObject(evidence, label);
  assertString(evidence.transaction_id, `${label}.transaction_id`);
  assertString(evidence.merchant, `${label}.merchant`);
  assertNumberLike(evidence.amount, `${label}.amount`);
  assert.ok(isIsoOrDateLike(evidence.date), `${label}.date`);
  assert.ok(evidence.relevance === null || typeof evidence.relevance === 'string', `${label}.relevance`);
}

export function validateLifeEventsResponse(value, label = 'life_events_response') {
  assertObject(value, label);
  assertString(value.customer_id, `${label}.customer_id`);
  assertArray(value.life_events, `${label}.life_events`);
  assertArray(value.behavioral_signals, `${label}.behavioral_signals`);

  for (const [index, event] of value.life_events.entries()) {
    const eventLabel = `${label}.life_events[${index}]`;
    assertObject(event, eventLabel);
    assert.ok(event.id !== undefined, `${eventLabel}.id should be present`);
    assertString(event.event_name, `${eventLabel}.event_name`);
    assertString(event.event_type, `${eventLabel}.event_type`);
    assertConfidence(event.confidence, `${eventLabel}.confidence`);
    assertString(event.urgency_timeline, `${eventLabel}.urgency_timeline`);
    assertString(event.status, `${eventLabel}.status`);
    assertArray(event.evidence, `${eventLabel}.evidence`);
    event.evidence.forEach((evidence, evidenceIndex) =>
      validateEvidence(evidence, `${eventLabel}.evidence[${evidenceIndex}]`)
    );
  }

  for (const [index, signal] of value.behavioral_signals.entries()) {
    const signalLabel = `${label}.behavioral_signals[${index}]`;
    assertObject(signal, signalLabel);
    assert.ok(signal.id !== undefined, `${signalLabel}.id should be present`);
    assertString(signal.signal_category, `${signalLabel}.signal_category`);
    assertString(signal.signal_name, `${signalLabel}.signal_name`);
    assertConfidence(signal.confidence, `${signalLabel}.confidence`);
    assertString(signal.status, `${signalLabel}.status`);
    assertArray(signal.evidence, `${signalLabel}.evidence`);
  }
}

export function validateTripsResponse(value, label = 'trips_response') {
  assertObject(value, label);
  assertString(value.customer_id, `${label}.customer_id`);
  assertArray(value.trips, `${label}.trips`);
  for (const [index, trip] of value.trips.entries()) {
    const tripLabel = `${label}.trips[${index}]`;
    assertString(trip.trip_id, `${tripLabel}.trip_id`);
    assertString(trip.destination, `${tripLabel}.destination`);
    assert.ok(isIsoOrDateLike(trip.trip_start), `${tripLabel}.trip_start`);
    assert.ok(isIsoOrDateLike(trip.trip_end), `${tripLabel}.trip_end`);
    assertNumberLike(trip.trip_duration_days, `${tripLabel}.trip_duration_days`);
    assertNumberLike(trip.total_trip_spend, `${tripLabel}.total_trip_spend`);
    assertNumberLike(trip.transaction_count, `${tripLabel}.transaction_count`);
    assert.equal(typeof trip.is_upcoming, 'boolean', `${tripLabel}.is_upcoming`);
  }
}

export function validateRiskFactorsResponse(value, label = 'risk_factors_response') {
  assertObject(value, label);
  assertString(value.customer_id, `${label}.customer_id`);
  assertArray(value.risk_factors, `${label}.risk_factors`);
  assertObject(value.summary, `${label}.summary`);

  const severityCounts = { high: 0, medium: 0, low: 0 };
  for (const [index, risk] of value.risk_factors.entries()) {
    const riskLabel = `${label}.risk_factors[${index}]`;
    assert.ok(risk.id !== undefined, `${riskLabel}.id should be present`);
    assertString(risk.transaction_id, `${riskLabel}.transaction_id`);
    assertString(risk.category_group, `${riskLabel}.category_group`);
    assertString(risk.category_label, `${riskLabel}.category_label`);
    assert.ok(RISK_SEVERITIES.has(risk.severity), `${riskLabel}.severity is unsupported`);
    severityCounts[risk.severity] += 1;
    assertString(risk.merchant, `${riskLabel}.merchant`);
    assertNumberLike(risk.amount, `${riskLabel}.amount`);
    assert.ok(isIsoOrDateLike(risk.transaction_date), `${riskLabel}.transaction_date`);
    assertString(risk.reason, `${riskLabel}.reason`);
    assert.ok(isIsoOrDateLike(risk.detected_at), `${riskLabel}.detected_at`);
  }

  assert.equal(value.summary.total, value.risk_factors.length, `${label}.summary.total`);
  assert.equal(value.summary.high, severityCounts.high, `${label}.summary.high`);
  assert.equal(value.summary.medium, severityCounts.medium, `${label}.summary.medium`);
  assert.equal(value.summary.low, severityCounts.low, `${label}.summary.low`);
}

export function validateAnalyticsResponse(value, label = 'analytics_response') {
  assertObject(value, label);
  assertString(value.bank_id, `${label}.bank_id`);
  assert.ok(isIsoOrDateLike(value.generated_at), `${label}.generated_at`);
  assertObject(value.overview, `${label}.overview`);
  for (const key of [
    'total_customers',
    'total_transactions',
    'total_spend',
    'avg_transaction',
    'avg_confidence',
  ]) {
    assert.ok(isFiniteNumber(value.overview[key]), `${label}.overview.${key}`);
  }
  for (const key of [
    'pillar_distribution',
    'life_event_summary',
    'behavioral_signal_summary',
    'risk_summary',
    'top_merchants',
    'segments',
  ]) {
    assertArray(value[key], `${label}.${key}`);
  }
}

export function validateWebhookRegistrationResponse(value, label = 'webhook_registration_response') {
  assertObject(value, label);
  assertString(value.webhook_id, `${label}.webhook_id`);
  assertString(value.bank_id, `${label}.bank_id`);
  assertString(value.url, `${label}.url`);
  assertArray(value.events, `${label}.events`);
  value.events.forEach((event) =>
    assert.ok(WEBHOOK_EVENTS.has(event), `${label}.events contains unsupported ${event}`)
  );
  assert.equal(typeof value.is_active, 'boolean', `${label}.is_active`);
  assert.ok(isIsoOrDateLike(value.created_at), `${label}.created_at`);
  assertString(value.message, `${label}.message`);
}

export function validateContractExamples(examples) {
  validateEnrichResponse(examples.enrich_response);
  validateJobResponse(examples.job_response);
  validateTransactionsResponse(examples.transactions_response);
  validateLifeEventsResponse(examples.life_events_response);
  validateTripsResponse(examples.trips_response);
  validateRiskFactorsResponse(examples.risk_factors_response);
  validateAnalyticsResponse(examples.analytics_response);
  validateWebhookRegistrationResponse(examples.webhook_registration_response);
}

export function validateGoldenEnrichmentExpectations(expectations, mockBankRoot) {
  assertObject(expectations, 'golden expectations');
  assertString(expectations.fixture_version, 'golden expectations.fixture_version');
  assertObject(expectations.minimum_expected_coverage, 'golden expectations.minimum_expected_coverage');
  assertArray(expectations.expectations, 'golden expectations.expectations');

  const fixtureById = new Map();
  const sourceCounts = new Map();
  const files = readdirSync(mockBankRoot).filter((name) => name.endsWith('.json')).sort();
  for (const fileName of files) {
    const fixture = readJson(join(mockBankRoot, fileName));
    for (const txn of fixture.transactions) {
      fixtureById.set(txn.transaction_id, {
        ...txn,
        source_system: fixture.source_system,
      });
    }
  }

  const seen = new Set();
  for (const [index, expectation] of expectations.expectations.entries()) {
    const label = `golden expectations.expectations[${index}]`;
    assertObject(expectation, label);
    assertString(expectation.transaction_id, `${label}.transaction_id`);
    assert.ok(!seen.has(expectation.transaction_id), `${label}.transaction_id is duplicated`);
    seen.add(expectation.transaction_id);

    const fixtureTxn = fixtureById.get(expectation.transaction_id);
    assert.ok(fixtureTxn, `${label}.transaction_id does not exist in mock-bank fixtures`);
    assert.equal(expectation.source_system, fixtureTxn.source_system, `${label}.source_system`);
    sourceCounts.set(expectation.source_system, (sourceCounts.get(expectation.source_system) || 0) + 1);

    assertString(expectation.expected_clean_merchant_name, `${label}.expected_clean_merchant_name`);
    assert.ok(
      LIFESTYLE_CATEGORIES.has(expectation.expected_lifestyle_category),
      `${label}.expected_lifestyle_category is unsupported`
    );
    assertString(expectation.expected_merchant_category, `${label}.expected_merchant_category`);
    assertConfidenceFloor(expectation.expected_confidence_min, `${label}.expected_confidence_min`);
    assertObject(expectation.expected_signals, `${label}.expected_signals`);
    for (const signal of ['travel_candidate', 'risk_candidate', 'life_event_candidate']) {
      assert.equal(typeof expectation.expected_signals[signal], 'boolean', `${label}.expected_signals.${signal}`);
    }
  }

  for (const [sourceSystem, minimum] of Object.entries(expectations.minimum_expected_coverage)) {
    assert.ok(
      (sourceCounts.get(sourceSystem) || 0) >= minimum,
      `expected at least ${minimum} golden expectations for ${sourceSystem}`
    );
  }

  return {
    expectationCount: expectations.expectations.length,
    sourceSystems: [...sourceCounts.keys()].sort(),
  };
}

export function validateGoldenPredictionResults(expectations, predictions) {
  const predictionRows = Array.isArray(predictions) ? predictions : predictions.predictions;
  assertArray(predictionRows, 'golden predictions');
  const predictionsById = new Map(predictionRows.map((prediction) => [prediction.transaction_id, prediction]));
  const failures = [];

  for (const expectation of expectations.expectations) {
    const prediction = predictionsById.get(expectation.transaction_id);
    if (!prediction) {
      failures.push(`${expectation.transaction_id}: missing prediction`);
      continue;
    }

    compareStringPrediction(failures, expectation, prediction, 'clean_merchant_name', 'expected_clean_merchant_name');
    compareStringPrediction(failures, expectation, prediction, 'lifestyle_category', 'expected_lifestyle_category');
    compareStringPrediction(failures, expectation, prediction, 'merchant_category', 'expected_merchant_category');

    const confidence = Number(prediction.confidence_score);
    if (!Number.isFinite(confidence) || confidence < expectation.expected_confidence_min) {
      failures.push(
        `${expectation.transaction_id}: confidence_score ${prediction.confidence_score} below ${expectation.expected_confidence_min}`
      );
    }
  }

  return {
    checked: expectations.expectations.length,
    failures,
  };
}

function assertConfidenceFloor(value, label) {
  assert.ok(isFiniteNumber(value), `${label} should be a number`);
  assert.ok(value >= 0.4 && value <= 0.9, `${label} should be between 0.4 and 0.9`);
}

function compareStringPrediction(failures, expectation, prediction, predictionKey, expectationKey) {
  const actual = String(prediction[predictionKey] || '').toLowerCase();
  const expected = String(expectation[expectationKey] || '').toLowerCase();
  if (actual !== expected) {
    failures.push(
      `${expectation.transaction_id}: ${predictionKey} expected "${expectation[expectationKey]}", got "${prediction[predictionKey]}"`
    );
  }
}
