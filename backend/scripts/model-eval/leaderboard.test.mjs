import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLeaderboard, renderLeaderboardMarkdown } from './leaderboard.mjs';

const RUNS = [
  {
    run_label: 'openrouter/gpt-4.1-mini',
    provider: 'openrouter',
    model: 'gpt-4.1-mini',
    accuracy: 0.86,
    sample_size: 478,
    latency: { avg_ms: 321, p50_ms: 300, p95_ms: 500, max_ms: 700 },
    cost: { total: 0.133, per_unit: 0.000278 },
  },
  {
    run_label: 'openrouter/qwen3-235b',
    provider: 'openrouter',
    model: 'qwen3-235b',
    accuracy: 0.82,
    sample_size: 478,
    latency: { avg_ms: 671, p50_ms: 650, p95_ms: 900, max_ms: 1200 },
    cost: { total: 0.032, per_unit: 0.000067 },
  },
  {
    run_label: 'gemini/gemini-2.5-flash',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    accuracy: 0.74,
    sample_size: 478,
    latency: { avg_ms: 210, p50_ms: 190, p95_ms: 320, max_ms: 480 },
    cost: { total: 0.04, per_unit: 0.000084 },
  },
  {
    run_label: 'openrouter/tiny-sample',
    provider: 'openrouter',
    model: 'tiny-sample',
    accuracy: 0.99,
    sample_size: 10, // below gate sample size
    latency: { avg_ms: 150, p50_ms: 150, p95_ms: 200, max_ms: 250 },
    cost: { total: 0.001, per_unit: 0.0001 },
  },
];

test('best_accuracy ignores the quality gate (raw winner)', () => {
  const lb = buildLeaderboard('merchant_classification', RUNS);
  assert.equal(lb.winners.best_accuracy, 'openrouter/tiny-sample'); // 0.99, even with tiny sample
});

test('lowest_latency uses p95 by default', () => {
  const lb = buildLeaderboard('merchant_classification', RUNS);
  assert.equal(lb.winners.lowest_latency, 'openrouter/tiny-sample'); // p95 200
});

test('most_cost_effective and recommended respect the quality gate', () => {
  const lb = buildLeaderboard('merchant_classification', RUNS, {
    qualityGate: { min_accuracy: 0.8, min_sample_size: 100 },
  });
  // tiny-sample is cheapest but fails the gate (sample 10); qwen has lowest per_unit among gated.
  assert.equal(lb.winners.most_cost_effective, 'openrouter/qwen3-235b');
  assert.equal(lb.winners.recommended, 'openrouter/qwen3-235b');
  assert.equal(lb.quality_gated_count, 2); // gpt-4.1-mini + qwen
});

test('best_value maximizes accuracy per dollar', () => {
  const lb = buildLeaderboard('merchant_classification', RUNS);
  // qwen: 0.82/0.000067 ≈ 12239 ; gpt: 0.86/0.000278 ≈ 3094 → qwen wins
  assert.equal(lb.winners.best_value, 'openrouter/qwen3-235b');
});

test('ranked is sorted by accuracy desc and flags gate pass', () => {
  const lb = buildLeaderboard('merchant_classification', RUNS);
  assert.equal(lb.ranked[0].run_label, 'openrouter/tiny-sample');
  const gpt = lb.ranked.find((r) => r.model === 'gpt-4.1-mini');
  assert.equal(gpt.passes_gate, true);
  const flash = lb.ranked.find((r) => r.model === 'gemini-2.5-flash');
  assert.equal(flash.passes_gate, false); // 0.74 < 0.8
});

test('markdown renders without throwing and includes the recommendation', () => {
  const lb = buildLeaderboard('merchant_classification', RUNS);
  const md = renderLeaderboardMarkdown(lb);
  assert.match(md, /Recommended: `openrouter\/qwen3-235b`/);
  assert.match(md, /Model Eval — merchant_classification/);
});

test('handles empty run list gracefully', () => {
  const lb = buildLeaderboard('risk_detection', []);
  assert.equal(lb.run_count, 0);
  assert.equal(lb.winners.recommended, null);
});
