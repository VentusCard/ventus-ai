import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOLDEN_EXPECTATION_EQUIVALENCE_GROUPS } from '../scripts/lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const benchmarkRoot = join(backendRoot, 'artifacts', 'plaid-synthetic-benchmark');
const runsRoot = resolve(process.env.PLAID_BENCHMARK_RUNS_ROOT || join(benchmarkRoot, 'runs'));
const outputPath = resolve(
  process.env.PLAID_BENCHMARK_FAILURE_AUDIT_PATH ||
    join(runsRoot, 'failure-audit.json')
);
const markdownPath = resolve(
  process.env.PLAID_BENCHMARK_FAILURE_AUDIT_MD_PATH ||
    join(runsRoot, 'failure-audit.md')
);

const reportPaths = readdirSync(runsRoot)
  .map((name) => join(runsRoot, name, 'evaluation-report.json'))
  .filter((path) => existsSync(path))
  .sort();

const pairCounts = new Map();
const fieldCounts = new Map();
const runSummaries = [];

for (const reportPath of reportPaths) {
  const report = readJson(reportPath);
  const runLabel = report.metadata?.run_id || report.metadata?.model || reportPath;
  runSummaries.push({
    run_label: runLabel,
    report_path: reportPath,
    pass_rate: report.summary?.pass_rate ?? null,
    passed_expectations: report.summary?.passed_expectations ?? null,
    total_expectations: report.summary?.total_expectations ?? null,
    failure_count: report.failures?.length ?? 0,
  });

  for (const failure of report.failures || []) {
    increment(fieldCounts, failure.field);
    if (failure.reason_code !== 'field_mismatch') continue;

    const expectedValues = String(failure.expected ?? '')
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean);
    const key = JSON.stringify({
      field: failure.field,
      expected: expectedValues.join(' | '),
      actual: String(failure.actual ?? ''),
    });
    const row = pairCounts.get(key) || {
      field: failure.field,
      expected: expectedValues,
      actual: failure.actual,
      count: 0,
      runs: new Set(),
      examples: [],
      audit_disposition: classifyFieldMismatch(failure.field, expectedValues, failure.actual),
    };
    row.count += 1;
    row.runs.add(runLabel);
    if (row.examples.length < 5) {
      row.examples.push({
        run_label: runLabel,
        transaction_id: failure.transaction_id,
        message: failure.message,
      });
    }
    pairCounts.set(key, row);
  }
}

const field_failure_counts = [...fieldCounts.entries()]
  .map(([field, count]) => ({ field, count }))
  .sort((left, right) => right.count - left.count || left.field.localeCompare(right.field));
const field_mismatch_pairs = [...pairCounts.values()]
  .map((row) => ({
    ...row,
    runs: [...row.runs].sort(),
  }))
  .sort((left, right) => right.count - left.count || left.field.localeCompare(right.field));

const audit = {
  report_type: 'plaid_benchmark_failure_audit',
  report_version: 1,
  generated_at: new Date().toISOString(),
  source_runs_root: runsRoot,
  run_count: runSummaries.length,
  run_summaries: runSummaries,
  field_failure_counts,
  field_mismatch_pairs,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeJson(outputPath, audit);
writeFileSync(markdownPath, renderMarkdown(audit));

console.log(`failure audit: ${outputPath}`);
console.log(`failure audit markdown: ${markdownPath}`);
for (const row of field_mismatch_pairs.slice(0, 10)) {
  console.log(`${row.count}x ${row.field}: ${row.expected.join(' | ')} -> ${row.actual} [${row.audit_disposition}]`);
}

function classifyFieldMismatch(field, expectedValues, actual) {
  if (isEquivalentByPolicy(field, expectedValues, actual)) return 'covered_by_v2_equivalence';
  if (field === 'lifestyle_category') return 'review_lifestyle_boundary';
  if (field === 'merchant_category') return 'review_taxonomy_boundary';
  if (field === 'clean_merchant_name') return 'review_clean_merchant_alias';
  return 'review_required';
}

function isEquivalentByPolicy(field, expectedValues, actual) {
  const groups = GOLDEN_EXPECTATION_EQUIVALENCE_GROUPS[field] || [];
  const actualNormalized = normalizeComparableString(actual);
  const expectedNormalized = new Set(expectedValues.map(normalizeComparableString));
  return groups.some((group) => {
    const normalizedGroup = group.map(normalizeComparableString);
    return normalizedGroup.includes(actualNormalized) && normalizedGroup.some((value) => expectedNormalized.has(value));
  });
}

function renderMarkdown(audit) {
  const lines = [
    '# Plaid Benchmark Failure Audit',
    '',
    `Generated: ${audit.generated_at}`,
    '',
    '## Field Failure Counts',
    '',
    '| Field | Failures |',
    '| --- | ---: |',
  ];

  for (const row of audit.field_failure_counts) {
    lines.push(`| ${row.field} | ${row.count} |`);
  }

  lines.push('', '## Top Field Mismatch Pairs', '');
  lines.push('| Count | Field | Expected | Actual | Disposition | Example |');
  lines.push('| ---: | --- | --- | --- | --- | --- |');
  for (const row of audit.field_mismatch_pairs.slice(0, 50)) {
    const example = row.examples[0]
      ? `${row.examples[0].run_label} / ${row.examples[0].transaction_id}`
      : '';
    lines.push(
      `| ${row.count} | ${escapeMarkdownTableCell(row.field)} | ${escapeMarkdownTableCell(row.expected.join(' | '))} | ${escapeMarkdownTableCell(row.actual)} | ${escapeMarkdownTableCell(row.audit_disposition)} | ${escapeMarkdownTableCell(example)} |`
    );
  }

  return `${lines.join('\n')}\n`;
}

function escapeMarkdownTableCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function normalizeComparableString(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
