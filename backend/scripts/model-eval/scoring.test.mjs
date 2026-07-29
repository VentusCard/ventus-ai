import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  confidenceCalibration,
  exactMatchAccuracy,
  latencyStats,
  percentile,
  setMetrics,
} from './scoring.mjs';

test('setMetrics computes precision/recall/f1 with key matching', () => {
  const expected = [{ type: 'moving' }, { type: 'new_child' }, { type: 'job_change' }];
  const predicted = [{ type: 'moving' }, { type: 'new_child' }, { type: 'vacation' }];
  const m = setMetrics(expected, predicted, { keyFn: (i) => i.type });
  assert.equal(m.tp, 2);
  assert.equal(m.fp, 1); // vacation
  assert.equal(m.fn, 1); // job_change
  assert.equal(m.precision, round(2 / 3));
  assert.equal(m.recall, round(2 / 3));
  assert.equal(m.f1, round(2 / 3));
});

test('setMetrics grades a secondary attribute on matched pairs', () => {
  const expected = [
    { type: 'overdraft', severity: 'high' },
    { type: 'fee', severity: 'low' },
  ];
  const predicted = [
    { type: 'overdraft', severity: 'high' }, // attr correct
    { type: 'fee', severity: 'high' }, // matched but wrong severity
  ];
  const m = setMetrics(expected, predicted, {
    keyFn: (i) => i.type,
    attrFn: (i) => i.severity,
  });
  assert.equal(m.matched, 2);
  assert.equal(m.attr_correct, 1);
  assert.equal(m.attr_accuracy, 0.5);
});

test('setMetrics handles empty predictions (all false negatives)', () => {
  const m = setMetrics([{ type: 'a' }, { type: 'b' }], [], { keyFn: (i) => i.type });
  assert.equal(m.tp, 0);
  assert.equal(m.fn, 2);
  assert.equal(m.precision, 0);
  assert.equal(m.recall, 0);
  assert.equal(m.f1, 0);
});

test('setMetrics is case/whitespace insensitive on keys', () => {
  const m = setMetrics([{ t: 'Moving' }], [{ t: ' moving ' }], { keyFn: (i) => i.t });
  assert.equal(m.tp, 1);
  assert.equal(m.fp, 0);
});

test('exactMatchAccuracy counts normalized equal pairs', () => {
  const r = exactMatchAccuracy([
    { expected: 'Pets', actual: 'pets' },
    { expected: 'Travel', actual: 'Home' },
  ]);
  assert.equal(r.correct, 1);
  assert.equal(r.total, 2);
  assert.equal(r.accuracy, 0.5);
});

test('confidenceCalibration computes brier + mae', () => {
  const r = confidenceCalibration([
    { confidence: 0.9, correct: true }, // (0.9-1)^2 = 0.01
    { confidence: 0.8, correct: false }, // (0.8-0)^2 = 0.64
  ]);
  assert.equal(r.count, 2);
  assert.equal(r.brier, round((0.01 + 0.64) / 2));
  assert.equal(r.mae, round((0.1 + 0.8) / 2));
});

test('confidenceCalibration returns nulls when no numeric confidences', () => {
  const r = confidenceCalibration([{ correct: true }]);
  assert.equal(r.brier, null);
  assert.equal(r.count, 0);
});

test('percentile + latencyStats', () => {
  assert.equal(percentile([10, 20, 30, 40], 50), 20);
  assert.equal(percentile([10, 20, 30, 40], 95), 40);
  const stats = latencyStats([100, 200, 300]);
  assert.equal(stats.count, 3);
  assert.equal(stats.avg_ms, 200);
  assert.equal(stats.max_ms, 300);
});

function round(value, decimals = 4) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
