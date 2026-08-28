// Read-only coverage analyzer for the Plaid diversity pilot.
//
// It reuses the EXISTING shared normalizer (shared/pipeline/plaid-transactions-sync.mjs)
// and the EXISTING mapping-context shape (account_customer_map / account_home_zip_map)
// so the rail/profile it reports is exactly what production normalization would
// produce -- this analyzer changes nothing about normalization.
//
// Given a pulled sandbox artifact dir, it reports the coverage matrix the pilot
// exists to measure:
//   - Plaid-returned PFC primary x detailed distribution (did our descriptions
//     actually spread across primaries, or did Plaid collapse them?)
//   - intended PFC (our hypothesis) vs Plaid-inferred PFC agreement
//   - Ventus rail x source_profile matrix
//   - payment_channel distribution, pending/reject counts
//
// This is diagnostic only: it writes a JSON+console summary. No golden labels,
// no predictions, no evaluation mutation.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePlaidTransactionsSync } from '../shared/pipeline/plaid-transactions-sync.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const repoRoot = resolve(backendRoot, '..');
const pilotDir = join(backendRoot, 'artifacts', 'plaid-diversity-pilot');
const artifactDir = resolveArtifactDir();
const designKeyPath = resolve(process.env.PLAID_PILOT_DESIGN_KEY_PATH || join(pilotDir, 'pilot-design-key.json'));
const outputPath = resolve(
  process.env.PLAID_PFC_COVERAGE_REPORT_PATH || join(pilotDir, 'pfc-coverage-report.json')
);

const designByDescription = loadDesignKey(designKeyPath);
const runSummary = loadRunSummary(artifactDir);
const rawFiles = readdirSync(artifactDir)
  .filter((name) => name.endsWith('-transactions-sync-raw.json'))
  .sort();
if (rawFiles.length === 0) {
  throw new Error(`no *-transactions-sync-raw.json files in ${artifactDir}`);
}

const rows = [];
for (const fileName of rawFiles) {
  const customerId = fileName.replace(/-transactions-sync-raw\.json$/, '');
  const payload = JSON.parse(readFileSync(join(artifactDir, fileName), 'utf8'));
  const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
  const accountCustomerMap = Object.fromEntries(accounts.map((a) => [a.account_id, customerId]));
  const accountHomeZipMap = Object.fromEntries(accounts.map((a) => [a.account_id, '10003']));
  const accountsById = Object.fromEntries(accounts.map((a) => [a.account_id, a]));

  const result = normalizePlaidTransactionsSync({
    payload,
    mapping_context: { account_customer_map: accountCustomerMap, account_home_zip_map: accountHomeZipMap },
  });

  // Match Plaid-returned txns to our intended PFC by description prefix.
  // Plaid may append/clean the description, so prefix-match our original string.
  const plaidById = new Map();
  for (const list of [payload.added, payload.modified]) {
    for (const t of list || []) plaidById.set(t.transaction_id, t);
  }

  for (const txn of result.transactions) {
    const raw = plaidById.get(txn.transaction_id) || {};
    const pfcPrimary = raw.personal_finance_category?.primary ?? '(none)';
    const pfcDetailed = raw.personal_finance_category?.detailed ?? '(none)';
    const account = accountsById[txn.partner_metadata?.account_id] || {};
    const intended = matchIntended(raw, designByDescription);
    rows.push({
      customer_id: customerId,
      source_file: fileName,
      transaction_id: txn.transaction_id,
      source_transaction_id: txn.partner_metadata?.source_transaction_id ?? txn.transaction_id,
      account_id: txn.partner_metadata?.account_id ?? '(unknown)',
      account_type: account.type ?? '(unknown)',
      account_subtype: account.subtype ?? '(unknown)',
      description: raw.name || raw.original_description || '(none)',
      payment_channel: raw.payment_channel ?? '(none)',
      pending: raw.pending === true,
      intended_pfc_primary: intended ?? '(unmatched)',
      plaid_pfc_primary: pfcPrimary,
      plaid_pfc_detailed: pfcDetailed,
      ventus_rail: txn.rail,
      ventus_source_profile: txn.source_profile,
      ventus_transaction_type: txn.transaction_type,
    });
  }

  for (const rejected of result.rejected_records) {
    rows.push({
      customer_id: customerId,
      source_file: fileName,
      transaction_id: rejected.source_record_id,
      source_transaction_id: rejected.source_record_id,
      account_id: '(rejected)',
      account_type: '(rejected)',
      account_subtype: '(rejected)',
      description: '(rejected)',
      payment_channel: '(rejected)',
      pending: rejected.reason_codes.includes('pending_transaction_excluded'),
      intended_pfc_primary: '(rejected)',
      plaid_pfc_primary: '(rejected)',
      plaid_pfc_detailed: rejected.reason_codes.join('+'),
      ventus_rail: '(rejected)',
      ventus_source_profile: '(rejected)',
      ventus_transaction_type: '(rejected)',
    });
  }
}

const report = {
  report_type: 'plaid_pfc_diversity_coverage',
  report_version: 1,
  generated_at: new Date().toISOString(),
  dataset_identity: {
    source: 'Plaid Sandbox /transactions/sync redacted artifact directory',
    artifact_dir: artifactDir,
    run_summary_path: runSummary ? join(artifactDir, 'run-summary.json') : null,
    run_id: runSummary?.run_id ?? null,
    run_generated_at: runSummary?.generated_at ?? null,
    environment: runSummary?.environment ?? 'sandbox',
    institution_id: runSummary?.institution_id ?? null,
    raw_files: rawFiles.length,
    design_key_path: existsSync(designKeyPath) ? designKeyPath : null,
    design_key_count: designByDescription.size,
  },
  summary: {
    total_rows: rows.length,
    normalized_rows: rows.filter((r) => r.ventus_rail !== '(rejected)').length,
    rejected_rows: rows.filter((r) => r.ventus_rail === '(rejected)').length,
    design_matched_rows: rows.filter((r) => r.intended_pfc_primary !== '(unmatched)' && r.intended_pfc_primary !== '(rejected)').length,
    design_unmatched_rows: rows.filter((r) => r.intended_pfc_primary === '(unmatched)').length,
    design_match_rate: rate(
      rows.filter((r) => r.intended_pfc_primary !== '(rejected)' && r.ventus_rail !== '(rejected)').length,
      rows.filter((r) => r.intended_pfc_primary !== '(unmatched)' && r.intended_pfc_primary !== '(rejected)').length
    ),
    distinct_plaid_pfc_primary: distinct(rows, 'plaid_pfc_primary').length,
    distinct_plaid_pfc_detailed: distinct(rows, 'plaid_pfc_detailed').length,
    distinct_ventus_rail: distinct(rows, 'ventus_rail').length,
    distinct_ventus_profile: distinct(rows, 'ventus_source_profile').length,
    pending_excluded: rows.filter((r) => r.pending).length,
    rejected: rows.filter((r) => r.ventus_rail === '(rejected)').length,
    matched_intended_vs_plaid_agreement_rate: agreementRate(rows),
    total_intended_vs_plaid_agreement_rate: totalAgreementRate(rows),
  },
  distributions: {
    by_plaid_pfc_primary: tally(rows, 'plaid_pfc_primary'),
    by_plaid_pfc_detailed: tally(rows, 'plaid_pfc_detailed'),
    by_ventus_rail: tally(rows, 'ventus_rail'),
    by_ventus_source_profile: tally(rows, 'ventus_source_profile'),
    by_payment_channel: tally(rows, 'payment_channel'),
    by_account_type: tally(rows, 'account_type'),
    by_customer_id: tally(rows, 'customer_id'),
  },
  // The key diagnostic: for each intended PFC, what did Plaid actually return?
  intended_to_plaid: crossTab(rows, 'intended_pfc_primary', 'plaid_pfc_primary'),
  // The rail/profile matrix production normalization would feed enrichment.
  rail_profile_matrix: crossTab(rows, 'ventus_rail', 'ventus_source_profile'),
  diagnostics: {
    unmatched_by_plaid_pfc_primary: tally(rows.filter((r) => r.intended_pfc_primary === '(unmatched)'), 'plaid_pfc_primary'),
    warnings: buildWarnings(rows),
    unmatched_samples: rows
      .filter((r) => r.intended_pfc_primary === '(unmatched)')
      .slice(0, 20)
      .map((r) => ({
        customer_id: r.customer_id,
        source_file: r.source_file,
        transaction_id: r.transaction_id,
        account_type: r.account_type,
        account_subtype: r.account_subtype,
        description: r.description,
        plaid_pfc_primary: r.plaid_pfc_primary,
        plaid_pfc_detailed: r.plaid_pfc_detailed,
        ventus_rail: r.ventus_rail,
        ventus_source_profile: r.ventus_source_profile,
      })),
  },
  rows,
};

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`Plaid PFC coverage report: ${outputPath}`);
console.log(`artifact dir: ${artifactDir}`);
console.log('');
console.log('=== Summary ===');
console.log(`  rows: ${report.summary.total_rows}`);
console.log(`  distinct Plaid PFC primary: ${report.summary.distinct_plaid_pfc_primary}`);
console.log(`  distinct Plaid PFC detailed: ${report.summary.distinct_plaid_pfc_detailed}`);
console.log(`  distinct Ventus rail: ${report.summary.distinct_ventus_rail}`);
console.log(`  distinct Ventus profile: ${report.summary.distinct_ventus_profile}`);
console.log(`  pending excluded: ${report.summary.pending_excluded} | rejected: ${report.summary.rejected}`);
console.log(`  design match rate: ${(report.summary.design_match_rate * 100).toFixed(1)}%`);
console.log(
  `  matched intended-vs-Plaid PFC agreement: ${(report.summary.matched_intended_vs_plaid_agreement_rate * 100).toFixed(1)}%`
);
console.log(
  `  total intended-vs-Plaid PFC agreement: ${(report.summary.total_intended_vs_plaid_agreement_rate * 100).toFixed(1)}%`
);
for (const warning of report.diagnostics.warnings) console.log(`  warning: ${warning}`);
console.log('');
console.log('=== Plaid PFC primary distribution ===');
printTally(report.distributions.by_plaid_pfc_primary);
console.log('');
console.log('=== Ventus rail distribution ===');
printTally(report.distributions.by_ventus_rail);
console.log('');
console.log('=== Intended PFC -> Plaid-inferred PFC (disagreement = our hypothesis was wrong, or Plaid collapsed) ===');
for (const [intended, sub] of Object.entries(report.intended_to_plaid)) {
  const parts = Object.entries(sub).map(([k, v]) => `${k}=${v}`).join(', ');
  console.log(`  ${intended}: ${parts}`);
}

function loadDesignKey(path) {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    const map = new Map();
    for (const d of data.designs || []) map.set(d.description, d.intended_pfc_primary);
    return map;
  } catch {
    return new Map();
  }
}

function loadRunSummary(path) {
  const summaryPath = join(path, 'run-summary.json');
  try {
    return JSON.parse(readFileSync(summaryPath, 'utf8'));
  } catch {
    return null;
  }
}

// Prefix-match because Plaid may clean/append the description we submitted.
function matchIntended(raw, designByDescription) {
  const candidates = [raw.name, raw.original_description, raw.merchant_name]
    .filter((s) => typeof s === 'string' && s.length > 0)
    .map((s) => s.toUpperCase());
  for (const [desc, pfc] of designByDescription) {
    const u = desc.toUpperCase();
    if (candidates.some((c) => c.includes(u.slice(0, Math.min(14, u.length))))) return pfc;
  }
  return null;
}

function resolveArtifactDir() {
  const explicit = process.env.PLAID_SANDBOX_ARTIFACT_DIR;
  if (explicit) {
    for (const candidate of [resolve(explicit), resolve(repoRoot, explicit), resolve(backendRoot, explicit)]) {
      if (existsSync(candidate)) return candidate;
    }
    return resolve(explicit);
  }

  const latest = latestDirWithRawFiles(join(backendRoot, 'artifacts', 'plaid-sandbox'));
  if (!latest) {
    throw new Error('no Plaid sandbox artifact directory with *-transactions-sync-raw.json files found');
  }
  return latest;
}

function latestDirWithRawFiles(root) {
  try {
    const runs = readdirSync(root, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => join(root, e.name))
      .filter((path) => hasRawTransactions(path))
      .sort();
    return runs.at(-1);
  } catch {
    return null;
  }
}
function hasRawTransactions(path) {
  try {
    return readdirSync(path).some((name) => name.endsWith('-transactions-sync-raw.json'));
  } catch {
    return false;
  }
}

function distinct(rows, key) {
  return [...new Set(rows.map((r) => r[key]))].filter((x) => x !== '(rejected)');
}
function tally(rows, key) {
  const m = new Map();
  for (const r of rows) m.set(r[key], (m.get(r[key]) || 0) + 1);
  return Object.fromEntries([...m.entries()].sort((a, b) => b[1] - a[1]));
}
function crossTab(rows, rowKey, colKey) {
  const out = {};
  for (const r of rows) {
    const rk = r[rowKey];
    const ck = r[colKey];
    out[rk] = out[rk] || {};
    out[rk][ck] = (out[rk][ck] || 0) + 1;
  }
  return out;
}
function agreementRate(rows) {
  const matchable = rows.filter((r) => r.intended_pfc_primary !== '(unmatched)' && r.plaid_pfc_primary !== '(rejected)');
  if (matchable.length === 0) return 0;
  const agree = matchable.filter((r) => normalizePfc(r.intended_pfc_primary) === normalizePfc(r.plaid_pfc_primary));
  return agree.length / matchable.length;
}
function totalAgreementRate(rows) {
  const normalized = rows.filter((r) => r.ventus_rail !== '(rejected)' && r.intended_pfc_primary !== '(rejected)');
  if (normalized.length === 0) return 0;
  const agree = normalized.filter((r) => normalizePfc(r.intended_pfc_primary) === normalizePfc(r.plaid_pfc_primary));
  return agree.length / normalized.length;
}
function rate(denominator, numerator) {
  return denominator === 0 ? 0 : numerator / denominator;
}
function normalizePfc(p) {
  // TRANSFER_IN/TRANSFER_OUT both map to Ventus 'transfer'; treat as same family.
  if (p === 'TRANSFER_IN' || p === 'TRANSFER_OUT') return 'TRANSFER';
  return p;
}
function buildWarnings(rows) {
  const warnings = [];
  const normalized = rows.filter((r) => r.ventus_rail !== '(rejected)');
  const unmatched = normalized.filter((r) => r.intended_pfc_primary === '(unmatched)');
  if (normalized.length > 0 && unmatched.length / normalized.length > 0.25) {
    warnings.push(
      `${unmatched.length}/${normalized.length} normalized rows are unmatched to the design key; do not treat matched agreement as overall Plaid agreement.`
    );
  }
  if (distinct(rows, 'plaid_pfc_primary').length < 8) {
    warnings.push('Plaid PFC primary coverage is narrow; run a broader diversity manifest before using this as a model benchmark.');
  }
  if (distinct(rows, 'ventus_rail').length < 3) {
    warnings.push('Ventus rail coverage is narrow; current report does not exercise enough multi-rail behavior.');
  }
  return warnings;
}
function printTally(obj) {
  const total = Object.values(obj).reduce((a, b) => a + b, 0);
  for (const [k, v] of Object.entries(obj)) {
    const pct = ((v / total) * 100).toFixed(0);
    console.log(`  ${String(k).padEnd(46)} ${String(v).padStart(4)}  (${pct}%)`);
  }
}
