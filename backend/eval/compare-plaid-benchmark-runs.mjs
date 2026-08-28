import assert from 'node:assert/strict';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const benchmarkRoot = join(backendRoot, 'artifacts', 'plaid-synthetic-benchmark');
const reportsRoot = resolve(process.env.PLAID_BENCHMARK_REPORT_ROOT || join(benchmarkRoot, 'runs'));
const outputPath = resolve(
  process.env.PLAID_BENCHMARK_COMPARISON_PATH || join(reportsRoot, 'model-comparison.json')
);
const markdownPath = resolve(
  process.env.PLAID_BENCHMARK_COMPARISON_MARKDOWN_PATH || join(reportsRoot, 'model-comparison.md')
);
const reportPaths = explicitReportPaths();
const discoveredReportPaths = reportPaths.length > 0 ? reportPaths : discoverReportPaths(reportsRoot);

assert.ok(discoveredReportPaths.length > 0, `no evaluation-report.json files found under ${reportsRoot}`);

const reports = discoveredReportPaths.map((path) => ({ path, report: readJson(path) }));
const comparison = {
  report_type: 'plaid_benchmark_model_comparison',
  report_version: 1,
  generated_at: new Date().toISOString(),
  report_paths: discoveredReportPaths,
  runs: reports
    .map(({ path, report }) => summarizeRun(path, report))
    .sort((left, right) => right.pass_rate - left.pass_rate || left.run_label.localeCompare(right.run_label)),
};
comparison.field_leaderboard = buildFieldLeaderboard(comparison.runs);

mkdirSync(dirname(outputPath), { recursive: true });
writeJson(outputPath, comparison);
writeFileSync(markdownPath, renderMarkdown(comparison));

console.log(`benchmark model comparison: ${outputPath}`);
console.log(`benchmark model comparison markdown: ${markdownPath}`);
for (const run of comparison.runs) {
  console.log(
    `${run.run_label}: pass_rate=${run.pass_rate}, passed=${run.passed_expectations}/${run.total_expectations}, failures=${run.failure_count}`
  );
}

function explicitReportPaths() {
  if (!process.env.PLAID_BENCHMARK_REPORT_PATHS) return [];
  return process.env.PLAID_BENCHMARK_REPORT_PATHS
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => resolve(value));
}

function discoverReportPaths(root) {
  if (!existsSync(root)) return [];
  const found = [];
  walk(root, (path) => {
    if (path.endsWith('/evaluation-report.json')) found.push(path);
  });
  return found.sort();
}

function walk(path, visit) {
  const stat = statSync(path);
  if (stat.isFile()) {
    visit(path);
    return;
  }
  if (!stat.isDirectory()) return;
  for (const entry of readdirSync(path)) {
    walk(join(path, entry), visit);
  }
}

function summarizeRun(path, report) {
  const metadata = report.metadata || {};
  const provider = metadata.provider || 'unknown_provider';
  const model = metadata.model || 'unknown_model';
  const runId = metadata.run_id || dirname(path).split('/').pop();
  const costMetrics = summarizeRawOutput(path, report.summary.checked_predictions);
  return {
    run_label: `${provider}/${model}/${runId}`,
    provider,
    model,
    run_id: runId,
    report_path: path,
    raw_output_path: costMetrics.raw_output_path,
    total_expectations: report.summary.total_expectations,
    checked_predictions: report.summary.checked_predictions,
    passed_expectations: report.summary.passed_expectations,
    failed_expectations: report.summary.failed_expectations,
    pass_rate: report.summary.pass_rate,
    missing_predictions: report.summary.missing_predictions,
    extra_predictions: report.summary.extra_predictions,
    failure_count: report.failures.length,
    cost_metrics: {
      ...costMetrics,
      cost_per_transaction:
        typeof costMetrics.total_cost === 'number' && report.summary.checked_predictions > 0
          ? costMetrics.total_cost / report.summary.checked_predictions
          : null,
      pass_per_dollar:
        typeof costMetrics.total_cost === 'number' && costMetrics.total_cost > 0
          ? report.summary.passed_expectations / costMetrics.total_cost
          : null,
      avg_latency_ms:
        typeof costMetrics.total_latency_ms === 'number' && costMetrics.batch_count > 0
          ? costMetrics.total_latency_ms / costMetrics.batch_count
          : null,
      tokens_per_transaction:
        typeof costMetrics.total_tokens === 'number' && report.summary.checked_predictions > 0
          ? costMetrics.total_tokens / report.summary.checked_predictions
          : null,
    },
    contract_repairs: report.summary.contract_repairs || {
      repaired_predictions: 0,
      repair_count: 0,
      violation_predictions: 0,
      violation_count: 0,
      by_code: {},
    },
    field_pass_rates: Object.fromEntries(
      Object.entries(report.breakdowns.by_field || {}).map(([field, value]) => [field, value.pass_rate])
    ),
    top_failures: report.failures.slice(0, 5).map((failure) => ({
      transaction_id: failure.transaction_id,
      field: failure.field,
      reason_code: failure.reason_code,
      message: failure.message,
    })),
  };
}

function summarizeRawOutput(reportPath, transactionCount) {
  const rawOutputPath = join(dirname(reportPath), 'raw-output.json');
  const empty = {
    raw_output_path: existsSync(rawOutputPath) ? rawOutputPath : null,
    batch_count: 0,
    total_cost: null,
    total_latency_ms: null,
    prompt_tokens: null,
    completion_tokens: null,
    total_tokens: null,
    cost_per_transaction: null,
    pass_per_dollar: null,
    avg_latency_ms: null,
    tokens_per_transaction: null,
    parse_errors: 0,
  };
  if (!existsSync(rawOutputPath)) return empty;

  const rawOutput = readJson(rawOutputPath);
  const rawResponses = Array.isArray(rawOutput.raw_responses) ? rawOutput.raw_responses : [];
  const totals = {
    ...empty,
    raw_output_path: rawOutputPath,
    batch_count: rawResponses.length,
    total_cost: 0,
    total_latency_ms: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  };

  for (const rawResponse of rawResponses) {
    const latency = rawResponse.route?.duration_ms;
    if (typeof latency === 'number') totals.total_latency_ms += latency;

    const parsed = parseRawModelResponse(rawResponse.raw_text);
    if (!parsed) {
      totals.parse_errors += 1;
      continue;
    }

    const usage = parsed.usage || {};
    const cost = usage.cost ?? usage.cost_details?.upstream_inference_cost;
    if (typeof cost === 'number') totals.total_cost += cost;
    if (typeof usage.prompt_tokens === 'number') totals.prompt_tokens += usage.prompt_tokens;
    if (typeof usage.completion_tokens === 'number') totals.completion_tokens += usage.completion_tokens;
    if (typeof usage.total_tokens === 'number') totals.total_tokens += usage.total_tokens;
  }

  if (totals.total_cost === 0 && rawResponses.length > 0) totals.total_cost = null;
  if (totals.total_latency_ms === 0 && rawResponses.length > 0) totals.total_latency_ms = null;
  if (totals.prompt_tokens === 0 && rawResponses.length > 0) totals.prompt_tokens = null;
  if (totals.completion_tokens === 0 && rawResponses.length > 0) totals.completion_tokens = null;
  if (totals.total_tokens === 0 && rawResponses.length > 0) totals.total_tokens = null;

  if (typeof totals.total_cost === 'number' && transactionCount > 0) {
    totals.cost_per_transaction = totals.total_cost / transactionCount;
  }
  if (typeof totals.total_latency_ms === 'number' && rawResponses.length > 0) {
    totals.avg_latency_ms = totals.total_latency_ms / rawResponses.length;
  }
  if (typeof totals.total_tokens === 'number' && transactionCount > 0) {
    totals.tokens_per_transaction = totals.total_tokens / transactionCount;
  }

  return totals;
}

function parseRawModelResponse(rawText) {
  if (typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function buildFieldLeaderboard(runs) {
  const fields = [...new Set(runs.flatMap((run) => Object.keys(run.field_pass_rates)))].sort();
  return Object.fromEntries(
    fields.map((field) => [
      field,
      runs
        .map((run) => ({
          run_label: run.run_label,
          pass_rate: run.field_pass_rates[field] ?? null,
        }))
        .sort((left, right) => (right.pass_rate ?? -1) - (left.pass_rate ?? -1)),
    ])
  );
}

function renderMarkdown(comparison) {
  const lines = [
    '# Plaid Benchmark Model Comparison',
    '',
    `Generated: ${comparison.generated_at}`,
    '',
    '| Rank | Run | Pass rate | Passed | Contract repair | Cost | Cost / txn | Avg latency | Pass / $ |',
    '| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  comparison.runs.forEach((run, index) => {
    lines.push(
      `| ${index + 1} | ${run.run_label} | ${formatPercent(run.pass_rate)} | ${run.passed_expectations}/${run.total_expectations} | ${formatRepairCount(run.contract_repairs)} | ${formatCurrency(run.cost_metrics.total_cost)} | ${formatCurrency(run.cost_metrics.cost_per_transaction)} | ${formatMs(run.cost_metrics.avg_latency_ms)} | ${formatNumber(run.cost_metrics.pass_per_dollar)} |`
    );
  });

  const qualityGatedRuns = comparison.runs
    .filter((run) => run.checked_predictions >= 100)
    .filter((run) => run.pass_rate >= 0.6)
    .filter((run) => typeof run.cost_metrics.cost_per_transaction === 'number')
    .sort((left, right) => {
      if (right.pass_rate !== left.pass_rate) return right.pass_rate - left.pass_rate;
      return left.cost_metrics.cost_per_transaction - right.cost_metrics.cost_per_transaction;
    });
  if (qualityGatedRuns.length > 0) {
    lines.push('', '## Quality-Gated Shortlist', '');
    lines.push('| Rank | Run | Pass rate | Contract repair | Cost / txn | Avg latency | Pass / $ | Sample |');
    lines.push('| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |');
    qualityGatedRuns.forEach((run, index) => {
      lines.push(
        `| ${index + 1} | ${run.run_label} | ${formatPercent(run.pass_rate)} | ${formatRepairCount(run.contract_repairs)} | ${formatCurrency(run.cost_metrics.cost_per_transaction)} | ${formatMs(run.cost_metrics.avg_latency_ms)} | ${formatNumber(run.cost_metrics.pass_per_dollar)} | ${run.checked_predictions} |`
      );
    });
  }

  const valueRuns = comparison.runs
    .filter((run) => typeof run.cost_metrics.pass_per_dollar === 'number')
    .sort((left, right) => right.cost_metrics.pass_per_dollar - left.cost_metrics.pass_per_dollar);
  if (valueRuns.length > 0) {
    lines.push('', '## Cost-Adjusted Value', '');
    lines.push('| Rank | Run | Pass / $ | Pass rate | Cost / txn | Avg latency | Sample |');
    lines.push('| ---: | --- | ---: | ---: | ---: | ---: | ---: |');
    valueRuns.forEach((run, index) => {
      lines.push(
        `| ${index + 1} | ${run.run_label} | ${formatNumber(run.cost_metrics.pass_per_dollar)} | ${formatPercent(run.pass_rate)} | ${formatCurrency(run.cost_metrics.cost_per_transaction)} | ${formatMs(run.cost_metrics.avg_latency_ms)} | ${run.checked_predictions} |`
      );
    });
  }

  lines.push('', '## Field Pass Rates', '');
  const fields = [...new Set(comparison.runs.flatMap((run) => Object.keys(run.field_pass_rates)))].sort();
  lines.push(`| Run | ${fields.join(' | ')} |`);
  lines.push(`| --- | ${fields.map(() => '---:').join(' | ')} |`);
  for (const run of comparison.runs) {
    lines.push(
      `| ${run.run_label} | ${fields.map((field) => formatPercent(run.field_pass_rates[field])).join(' | ')} |`
    );
  }

  lines.push('', '## Top Failures', '');
  for (const run of comparison.runs) {
    lines.push(`### ${run.run_label}`, '');
    if (run.top_failures.length === 0) {
      lines.push('- None', '');
      continue;
    }
    for (const failure of run.top_failures) {
      lines.push(`- ${failure.transaction_id} ${failure.field}: ${failure.message}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function formatPercent(value) {
  if (typeof value !== 'number') return 'n/a';
  return `${Math.round(value * 1000) / 10}%`;
}

function formatCurrency(value) {
  if (typeof value !== 'number') return 'n/a';
  if (value < 0.01) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(4)}`;
}

function formatMs(value) {
  if (typeof value !== 'number') return 'n/a';
  return `${Math.round(value)}ms`;
}

function formatNumber(value) {
  if (typeof value !== 'number') return 'n/a';
  return String(Math.round(value * 10) / 10);
}

function formatRepairCount(value) {
  if (!value || typeof value.repaired_predictions !== 'number') return 'n/a';
  if (value.repaired_predictions === 0 && value.violation_predictions === 0) return '0';
  return `${value.repaired_predictions} repaired / ${value.violation_predictions} violations`;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
