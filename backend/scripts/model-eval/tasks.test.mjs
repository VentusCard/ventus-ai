import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getTask, listTasks, TASKS } from './tasks.mjs';
import { scoreEnrichment } from './scorers.mjs';

test('registry exposes the four routed tasks', () => {
  const tasks = listTasks();
  for (const id of ['merchant_classification', 'risk_detection', 'life_event_detection', 'travel_detection']) {
    assert.ok(tasks.includes(id), `missing task ${id}`);
  }
  assert.throws(() => getTask('nope'), /Unknown task/);
});

// Perfect predictions => micro-F1 == 1 for every detection task.
for (const taskId of ['risk_detection', 'life_event_detection', 'travel_detection']) {
  test(`${taskId}: perfect predictions score 1.0`, () => {
    const task = getTask(taskId);
    const golden = task.loadGolden();
    const perfect = golden.cases.map((c) => ({
      customer_id: c.customer_id,
      [task.collectionKey]: c.expected[task.collectionKey],
    }));
    const result = task.score(golden, perfect);
    assert.equal(result.accuracy, 1);
    assert.equal(result.sample_size, golden.cases.length);
    assert.equal(result.detail.micro.fp, 0);
    assert.equal(result.detail.micro.fn, 0);
  });
}

test('risk_detection: partial predictions reflect precision/recall', () => {
  const task = getTask('risk_detection');
  const golden = task.loadGolden();
  // eval_risk_01 expects [overdraft(high), returned_payment(medium)].
  // Predict only overdraft (miss one -> recall<1) + one spurious fee (fp -> precision<1),
  // and give overdraft the wrong severity.
  const predictions = [
    {
      customer_id: 'eval_risk_01',
      risk_factors: [
        { type: 'overdraft', severity: 'low' },
        { type: 'bogus_fee', severity: 'low' },
      ],
    },
  ];
  const result = task.score(golden, predictions);
  assert.equal(result.detail.micro.tp, 1); // overdraft matched
  assert.equal(result.detail.micro.fp, 1); // bogus_fee
  assert.ok(result.detail.micro.fn >= 1); // returned_payment missed (+ other cases unpredicted)
  assert.equal(result.detail.attr_accuracy, 0); // overdraft severity wrong on the only match
  assert.ok(result.accuracy > 0 && result.accuracy < 1);
});

test('detection buildMessages returns system+user with customer ids and schema', () => {
  const task = getTask('life_event_detection');
  const golden = task.loadGolden();
  const messages = task.buildMessages(golden);
  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, 'system');
  assert.match(messages[0].content, /"life_events"/);
  assert.match(messages[1].content, /eval_life_01/);
});

test('detection mapPredictions accepts {results:[...]} and defaults missing arrays', () => {
  const task = getTask('travel_detection');
  const mapped = task.mapPredictions({
    results: [
      { customer_id: 'a', trips: [{ destination: 'x', month: '2026-06' }] },
      { customer_id: 'b' },
    ],
  });
  assert.deepEqual(mapped, [
    { customer_id: 'a', trips: [{ destination: 'x', month: '2026-06' }] },
    { customer_id: 'b', trips: [] },
  ]);
});

test('scoreEnrichment: filters to predicted ids and scores a matching pair', () => {
  const golden = {
    expectations: [
      makeEnrichExpectation('t1'),
      makeEnrichExpectation('t2'), // no prediction -> should be excluded, not failed
    ],
  };
  const predictions = [
    {
      transaction_id: 't1',
      clean_merchant_name: 'Starbucks',
      lifestyle_category: 'Food & Dining',
      merchant_category: 'Coffee Shops',
      confidence_score: 0.9,
      signals: { travel_candidate: false, risk_candidate: false, life_event_candidate: false },
    },
  ];
  const result = scoreEnrichment(golden, predictions);
  assert.equal(result.sample_size, 1); // only t1 scored
  assert.equal(result.accuracy, 1); // exact match passes all fields
});

function makeEnrichExpectation(transactionId) {
  return {
    transaction_id: transactionId,
    source_system: 'eval',
    rail: 'card',
    source_profile: 'card_food',
    transaction_type: 'debit',
    expected_clean_merchant_name: 'Starbucks',
    accepted_clean_merchant_names: ['Starbucks'],
    expected_lifestyle_category: 'Food & Dining',
    accepted_lifestyle_categories: ['Food & Dining'],
    expected_merchant_category: 'Coffee Shops',
    accepted_merchant_categories: ['Coffee Shops'],
    expected_confidence_min: 0.5,
    expected_signals: { travel_candidate: false, risk_candidate: false, life_event_candidate: false },
  };
}
