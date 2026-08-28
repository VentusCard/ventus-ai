import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePlaidTransactionsSync } from '../shared/pipeline/plaid-transactions-sync.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const artifactDir = resolve(
  process.env.PLAID_SANDBOX_ARTIFACT_DIR ||
    join(backendRoot, 'artifacts', 'plaid-sandbox', latestSandboxRunId())
);
const targetCount = Number(process.env.PLAID_GOLDEN_TARGET_COUNT || 50);
const outputDir = resolve(
  process.env.PLAID_GOLDEN_OUTPUT_DIR ||
    join(backendRoot, 'artifacts', 'plaid-golden-candidates', basename(artifactDir))
);

assert.ok(Number.isInteger(targetCount) && targetCount > 0, 'PLAID_GOLDEN_TARGET_COUNT must be positive');

mkdirSync(outputDir, { recursive: true });

const normalized = loadNormalizedTransactions(artifactDir);
const selected = selectDiverseTransactions(normalized, targetCount);
const expectations = selected.map(buildDraftExpectation);
const candidateSet = {
  fixture_version: new Date().toISOString().slice(0, 10),
  source: {
    type: 'plaid_sandbox_artifact',
    artifact_dir: artifactDir,
    candidate_generation: 'heuristic_draft_requires_human_review',
  },
  description:
    'Draft Plaid sandbox enrichment expectations. Labels are heuristic seeds for review and must be frozen by a human before being treated as golden truth.',
  minimum_expected_coverage: {
    plaid: Math.min(targetCount, selected.length),
  },
  expectations,
};

const normalizedPath = join(outputDir, 'normalized-transactions.json');
const expectationsPath = join(outputDir, 'plaid-golden-candidates.json');
const summaryPath = join(outputDir, 'summary.json');

writeFileSync(normalizedPath, `${JSON.stringify({ transactions: normalized }, null, 2)}\n`);
writeFileSync(expectationsPath, `${JSON.stringify(candidateSet, null, 2)}\n`);
writeFileSync(
  summaryPath,
  `${JSON.stringify(
    {
      artifact_dir: artifactDir,
      normalized_transactions: normalized.length,
      selected_expectations: selected.length,
      output_dir: outputDir,
      by_rail: countBy(selected, (txn) => txn.rail),
      by_source_profile: countBy(selected, (txn) => txn.source_profile),
      by_transaction_type: countBy(selected, (txn) => txn.transaction_type),
    },
    null,
    2
  )}\n`
);

console.log(`Plaid golden candidate set generated: ${selected.length}/${normalized.length} transaction(s)`);
console.log(`expectations: ${expectationsPath}`);
console.log(`normalized: ${normalizedPath}`);
console.log(`summary: ${summaryPath}`);

function latestSandboxRunId() {
  const root = join(backendRoot, 'artifacts', 'plaid-sandbox');
  const runs = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.ok(runs.length > 0, 'no Plaid sandbox artifact runs found');
  return runs.at(-1);
}

function loadNormalizedTransactions(dir) {
  const rawFiles = readdirSync(dir)
    .filter((name) => name.endsWith('-transactions-sync-raw.json'))
    .sort();
  assert.ok(rawFiles.length > 0, `no Plaid raw transaction files found in ${dir}`);

  const transactions = [];
  for (const fileName of rawFiles) {
    const customerId = fileName.replace(/-transactions-sync-raw\.json$/, '');
    const payload = readJson(join(dir, fileName));
    const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
    const accountCustomerMap = Object.fromEntries(
      accounts.map((account) => [account.account_id, customerId])
    );
    const accountHomeZipMap = Object.fromEntries(
      accounts.map((account) => [account.account_id, deriveHomeZip(account)])
    );

    const result = normalizePlaidTransactionsSync({
      payload,
      mapping_context: {
        account_customer_map: accountCustomerMap,
        account_home_zip_map: accountHomeZipMap,
      },
    });
    for (const txn of result.transactions) {
      transactions.push({
        ...txn,
        source_artifact_file: fileName,
      });
    }
  }
  return transactions;
}

function selectDiverseTransactions(transactions, count) {
  const byProfile = new Map();
  for (const txn of transactions) {
    const bucket = byProfile.get(txn.source_profile) ?? [];
    bucket.push(txn);
    byProfile.set(txn.source_profile, bucket);
  }

  const selected = [];
  const seen = new Set();
  const buckets = [...byProfile.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, txns]) => txns.sort(compareTransactions));

  while (selected.length < count && buckets.some((bucket) => bucket.length > 0)) {
    for (const bucket of buckets) {
      if (selected.length >= count) break;
      const txn = bucket.shift();
      if (!txn || seen.has(txn.transaction_id)) continue;
      selected.push(txn);
      seen.add(txn.transaction_id);
    }
  }
  return selected.sort(compareTransactions);
}

function buildDraftExpectation(txn) {
  const label = classifyDraftLabel(txn);
  return {
    transaction_id: txn.transaction_id,
    source_system: 'plaid',
    rail: txn.rail,
    source_profile: txn.source_profile,
    transaction_type: txn.transaction_type,
    expected_clean_merchant_name: txn.merchant_name,
    expected_lifestyle_category: label.lifestyleCategory,
    expected_merchant_category: label.merchantCategory,
    expected_confidence_min: 0.7,
    expected_signals: label.signals,
    label_status: 'draft_heuristic_requires_human_review',
    label_rationale: label.rationale,
    source_artifact_file: txn.source_artifact_file,
  };
}

function classifyDraftLabel(txn) {
  const profile = txn.source_profile;
  const merchant = txn.merchant_name;
  const defaultSignals = {
    travel_candidate: false,
    risk_candidate: false,
    life_event_candidate: false,
  };

  if (profile.includes('income')) {
    return {
      lifestyleCategory: 'Financial & Aspirational',
      merchantCategory: 'Income & Payroll',
      signals: { ...defaultSignals, life_event_candidate: true },
      rationale: 'Income-like Plaid profile; review whether this should create an income/life-event signal.',
    };
  }
  if (profile.includes('loan')) {
    return {
      lifestyleCategory: 'Financial & Aspirational',
      merchantCategory: 'Loan Payments',
      signals: defaultSignals,
      rationale: 'Loan-payment Plaid profile.',
    };
  }
  if (profile.includes('transfer')) {
    return {
      lifestyleCategory: 'Financial & Aspirational',
      merchantCategory: 'Transfers',
      signals: defaultSignals,
      rationale: 'Transfer-like Plaid profile.',
    };
  }
  if (profile.includes('government')) {
    return {
      lifestyleCategory: 'Family & Community',
      merchantCategory: 'Government Services',
      signals: defaultSignals,
      rationale: 'Government/non-profit Plaid profile.',
    };
  }
  if (profile.includes('services')) {
    return {
      lifestyleCategory: classifyServiceLifestyle(merchant),
      merchantCategory: 'Business & Professional Services',
      signals: defaultSignals,
      rationale: 'General-services Plaid profile; merchant-specific review recommended.',
    };
  }
  if (profile.includes('transport') || profile.includes('travel')) {
    return {
      lifestyleCategory: 'Travel & Exploration',
      merchantCategory: 'Transportation & Travel',
      signals: { ...defaultSignals, travel_candidate: true },
      rationale: 'Transport/travel-like Plaid profile.',
    };
  }

  return {
    lifestyleCategory: 'Miscellaneous & Unclassified',
    merchantCategory: profile.replace(/_/g, ' '),
    signals: defaultSignals,
    rationale: 'Fallback draft label; human review required before freezing.',
  };
}

function classifyServiceLifestyle(merchant) {
  if (/amazon web services|twilio|typeform|hubspot|linkedin|calendly|intuit/i.test(merchant)) {
    return 'Technology & Digital Life';
  }
  if (/american air/i.test(merchant)) {
    return 'Travel & Exploration';
  }
  if (/health/i.test(merchant)) {
    return 'Health & Wellness';
  }
  return 'Miscellaneous & Unclassified';
}

function deriveHomeZip(account) {
  void account;
  return '10003';
}

function compareTransactions(left, right) {
  return `${left.source_profile}:${left.customer_id}:${left.date}:${left.transaction_id}`.localeCompare(
    `${right.source_profile}:${right.customer_id}:${right.date}:${right.transaction_id}`
  );
}

function countBy(values, keyFn) {
  return Object.fromEntries(
    [...values.reduce((counts, value) => {
      const key = keyFn(value);
      counts.set(key, (counts.get(key) || 0) + 1);
      return counts;
    }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right))
  );
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
