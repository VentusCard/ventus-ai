// Task-scoped leaderboard: given the per-model run summaries for a single task,
// pick the winners along the three axes the business cares about — best accuracy,
// lowest latency, most cost-effective — plus a single quality-gated recommendation.
//
// Pure functions only, so this is unit-tested offline. The live runner
// (run-task-eval.mjs) feeds real run summaries into buildLeaderboard().

const DEFAULT_QUALITY_GATE = {
  min_accuracy: 0.8,
  min_sample_size: 100,
};

/**
 * @typedef {object} RunSummary
 * @property {string} run_label
 * @property {string} provider
 * @property {string} model
 * @property {number} accuracy         primary task accuracy (0..1)
 * @property {number} sample_size      number of scored units (txns / customers)
 * @property {object} latency          { avg_ms, p50_ms, p95_ms, max_ms }
 * @property {object} cost             { total, per_unit }  (per_unit may be null)
 */

/**
 * @param {string} taskId
 * @param {RunSummary[]} runs
 * @param {object} [options]
 * @param {object} [options.qualityGate] { min_accuracy, min_sample_size }
 * @param {'p95_ms'|'p50_ms'|'avg_ms'} [options.latencyKey] which latency stat ranks "fastest"
 */
export function buildLeaderboard(taskId, runs, options = {}) {
  const qualityGate = { ...DEFAULT_QUALITY_GATE, ...(options.qualityGate || {}) };
  const latencyKey = options.latencyKey || 'p95_ms';
  const list = Array.isArray(runs) ? runs.map(withDerived) : [];

  const ranked = [...list].sort(
    (a, b) => b.accuracy - a.accuracy || (a.cost_per_unit ?? Infinity) - (b.cost_per_unit ?? Infinity)
  );

  const gated = list.filter(
    (run) => run.accuracy >= qualityGate.min_accuracy && run.sample_size >= qualityGate.min_sample_size
  );

  const winners = {
    best_accuracy: pickMin(list, (run) => -run.accuracy),
    lowest_latency: pickMin(list, (run) => numberOr(run.latency?.[latencyKey], Infinity)),
    most_cost_effective: pickMin(gated, (run) => numberOr(run.cost_per_unit, Infinity)),
    best_value: pickMin(list, (run) => -numberOr(run.value_accuracy_per_dollar, -Infinity)),
    // The single recommendation: cheapest model that clears the quality gate;
    // ties broken by higher accuracy then lower latency.
    recommended: pickMin(gated, (run) => [
      numberOr(run.cost_per_unit, Infinity),
      -run.accuracy,
      numberOr(run.latency?.[latencyKey], Infinity),
    ]),
  };

  return {
    report_type: 'model_eval_task_leaderboard',
    report_version: 1,
    task: taskId,
    generated_at: new Date().toISOString(),
    quality_gate: qualityGate,
    latency_rank_key: latencyKey,
    run_count: list.length,
    quality_gated_count: gated.length,
    winners: Object.fromEntries(
      Object.entries(winners).map(([axis, run]) => [axis, run ? run.run_label : null])
    ),
    ranked: ranked.map((run) => publicView(run, qualityGate)),
  };
}

export function renderLeaderboardMarkdown(leaderboard) {
  const lines = [
    `# Model Eval — ${leaderboard.task}`,
    '',
    `Generated: ${leaderboard.generated_at}`,
    `Quality gate: accuracy ≥ ${pct(leaderboard.quality_gate.min_accuracy)}, sample ≥ ${leaderboard.quality_gate.min_sample_size}`,
    '',
    '## Winners',
    '',
    `- Best accuracy: \`${leaderboard.winners.best_accuracy ?? 'n/a'}\``,
    `- Lowest latency (${leaderboard.latency_rank_key}): \`${leaderboard.winners.lowest_latency ?? 'n/a'}\``,
    `- Most cost-effective (gated): \`${leaderboard.winners.most_cost_effective ?? 'n/a'}\``,
    `- Best value (accuracy/$): \`${leaderboard.winners.best_value ?? 'n/a'}\``,
    `- **Recommended: \`${leaderboard.winners.recommended ?? 'n/a'}\`**`,
    '',
    '## Ranked',
    '',
    '| Rank | Run | Accuracy | Sample | Avg ms | p95 ms | Cost/unit | Acc/$ | Gate |',
    '| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | :--: |',
  ];
  leaderboard.ranked.forEach((run, index) => {
    lines.push(
      `| ${index + 1} | ${run.run_label} | ${pct(run.accuracy)} | ${run.sample_size} | ${ms(run.latency?.avg_ms)} | ${ms(run.latency?.p95_ms)} | ${money(run.cost_per_unit)} | ${num(run.value_accuracy_per_dollar)} | ${run.passes_gate ? '✅' : '—'} |`
    );
  });
  return `${lines.join('\n')}\n`;
}

function withDerived(run) {
  const costPerUnit = run.cost?.per_unit ?? null;
  const accuracy = numberOr(run.accuracy, 0);
  const valueAccPerDollar =
    typeof costPerUnit === 'number' && costPerUnit > 0 ? round(accuracy / costPerUnit) : null;
  return {
    ...run,
    accuracy,
    cost_per_unit: costPerUnit,
    value_accuracy_per_dollar: valueAccPerDollar,
  };
}

function publicView(run, qualityGate) {
  return {
    run_label: run.run_label,
    provider: run.provider,
    model: run.model,
    accuracy: run.accuracy,
    sample_size: run.sample_size,
    latency: run.latency || null,
    cost_per_unit: run.cost_per_unit,
    value_accuracy_per_dollar: run.value_accuracy_per_dollar,
    passes_gate:
      run.accuracy >= qualityGate.min_accuracy && run.sample_size >= qualityGate.min_sample_size,
  };
}

// pickMin supports a scalar score or an array score (lexicographic tie-break).
function pickMin(runs, scoreFn) {
  let best = null;
  let bestScore = null;
  for (const run of runs) {
    const score = scoreFn(run);
    if (best === null || compareScore(score, bestScore) < 0) {
      best = run;
      bestScore = score;
    }
  }
  return best;
}

function compareScore(a, b) {
  const arrA = Array.isArray(a) ? a : [a];
  const arrB = Array.isArray(b) ? b : [b];
  for (let i = 0; i < Math.max(arrA.length, arrB.length); i += 1) {
    const diff = numberOr(arrA[i], 0) - numberOr(arrB[i], 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function numberOr(value, fallback) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function pct(value) {
  return typeof value === 'number' ? `${Math.round(value * 1000) / 10}%` : 'n/a';
}

function ms(value) {
  return typeof value === 'number' ? `${Math.round(value)}ms` : 'n/a';
}

function money(value) {
  if (typeof value !== 'number') return 'n/a';
  return value < 0.01 ? `$${value.toFixed(6)}` : `$${value.toFixed(4)}`;
}

function num(value) {
  return typeof value === 'number' ? String(Math.round(value * 10) / 10) : 'n/a';
}
