// Generic, task-agnostic scoring primitives for the multi-task model evaluation
// framework. These are pure functions so they can be unit-tested offline without
// any model calls. Task-specific scorers (see tasks.mjs) compose these into a
// single accuracy number plus a detail object.

/**
 * Set-based detection metrics (precision / recall / F1).
 *
 * Compares an expected set of items against a predicted set, matching items by a
 * string key. Optionally measures secondary-attribute correctness among the
 * matched pairs (e.g. did a detected risk factor also get the right severity?).
 *
 * @param {Array<object>} expected
 * @param {Array<object>} predicted
 * @param {object} options
 * @param {(item: object) => string} options.keyFn   item identity (e.g. event type)
 * @param {(item: object) => string} [options.attrFn] secondary attribute to grade on matched pairs
 * @returns {{tp:number, fp:number, fn:number, precision:number, recall:number, f1:number,
 *            matched:number, attr_correct:number, attr_accuracy:(number|null)}}
 */
export function setMetrics(expected, predicted, { keyFn, attrFn = null } = {}) {
  if (typeof keyFn !== 'function') throw new Error('setMetrics requires options.keyFn');
  const expectedList = toArray(expected);
  const predictedList = toArray(predicted);

  const expectedByKey = new Map();
  for (const item of expectedList) {
    const key = normalizeKey(keyFn(item));
    if (!expectedByKey.has(key)) expectedByKey.set(key, []);
    expectedByKey.get(key).push(item);
  }

  const remaining = new Map([...expectedByKey.entries()].map(([key, items]) => [key, [...items]]));
  let tp = 0;
  let fp = 0;
  let attrCorrect = 0;
  let matched = 0;

  for (const predictedItem of predictedList) {
    const key = normalizeKey(keyFn(predictedItem));
    const bucket = remaining.get(key);
    if (bucket && bucket.length > 0) {
      const expectedItem = bucket.shift();
      tp += 1;
      matched += 1;
      if (attrFn) {
        if (normalizeKey(attrFn(predictedItem)) === normalizeKey(attrFn(expectedItem))) {
          attrCorrect += 1;
        }
      }
    } else {
      fp += 1;
    }
  }

  const fn = [...remaining.values()].reduce((sum, bucket) => sum + bucket.length, 0);
  const precision = safeRatio(tp, tp + fp);
  const recall = safeRatio(tp, tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return {
    tp,
    fp,
    fn,
    precision: round(precision),
    recall: round(recall),
    f1: round(f1),
    matched,
    attr_correct: attrCorrect,
    attr_accuracy: attrFn && matched > 0 ? round(attrCorrect / matched) : null,
  };
}

/**
 * Exact-match accuracy over a list of field comparisons.
 * @param {Array<{expected:any, actual:any}>} pairs
 * @returns {{correct:number, total:number, accuracy:number}}
 */
export function exactMatchAccuracy(pairs) {
  const list = toArray(pairs);
  let correct = 0;
  for (const { expected, actual } of list) {
    if (normalizeKey(expected) === normalizeKey(actual)) correct += 1;
  }
  return { correct, total: list.length, accuracy: safeRatio(correct, list.length) };
}

/**
 * Confidence calibration via the Brier score and mean absolute error.
 * Lower is better; a well-calibrated model assigns high confidence to correct
 * predictions and low confidence to incorrect ones.
 * @param {Array<{confidence:number, correct:boolean}>} pairs
 * @returns {{brier:(number|null), mae:(number|null), count:number}}
 */
export function confidenceCalibration(pairs) {
  const list = toArray(pairs).filter((p) => typeof p.confidence === 'number');
  if (list.length === 0) return { brier: null, mae: null, count: 0 };
  let brierSum = 0;
  let maeSum = 0;
  for (const { confidence, correct } of list) {
    const target = correct ? 1 : 0;
    const c = clamp01(confidence);
    brierSum += (c - target) ** 2;
    maeSum += Math.abs(c - target);
  }
  return {
    brier: round(brierSum / list.length),
    mae: round(maeSum / list.length),
    count: list.length,
  };
}

/** Percentile (0-100) of a numeric array using nearest-rank. */
export function percentile(values, p) {
  const nums = toArray(values).filter((v) => typeof v === 'number').sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const rank = Math.ceil((clamp01(p / 100) * nums.length));
  const index = Math.min(Math.max(rank - 1, 0), nums.length - 1);
  return nums[index];
}

/** Summary stats (avg / p50 / p95 / max) for a list of latencies in ms. */
export function latencyStats(values) {
  const nums = toArray(values).filter((v) => typeof v === 'number');
  if (nums.length === 0) {
    return { count: 0, avg_ms: null, p50_ms: null, p95_ms: null, max_ms: null };
  }
  const total = nums.reduce((sum, v) => sum + v, 0);
  return {
    count: nums.length,
    avg_ms: round(total / nums.length, 1),
    p50_ms: percentile(nums, 50),
    p95_ms: percentile(nums, 95),
    max_ms: Math.max(...nums),
  };
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase();
}

function safeRatio(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : 0;
}

function clamp01(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

function round(value, decimals = 4) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
