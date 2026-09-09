import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateEnrichTransaction } from '../scripts/lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const expectationsPath = resolve(
  process.env.PLAID_GOLDEN_EXPECTATIONS_PATH ||
    join(
      backendRoot,
      'artifacts',
      'plaid-golden-candidates',
      latestCandidateRunId(),
      'plaid-golden-candidates.json'
    )
);
const normalizedPath = resolve(
  process.env.PLAID_GOLDEN_NORMALIZED_PATH ||
    join(dirname(expectationsPath), 'normalized-transactions.json')
);
const outputPath = resolve(
  process.env.PLAID_GOLDEN_ENRICH_FIXTURE_PATH ||
    join(dirname(expectationsPath), 'plaid-golden-enrich-fixture.json')
);

const expectations = readJson(expectationsPath);
const normalized = readJson(normalizedPath);
const expectedIds = new Set(expectations.expectations.map((expectation) => expectation.transaction_id));
const transactions = normalized.transactions.filter((transaction) => expectedIds.has(transaction.transaction_id));

assert.equal(
  transactions.length,
  expectedIds.size,
  `expected ${expectedIds.size} transactions, found ${transactions.length} in normalized source`
);

const fixture = {
  fixture_type: 'plaid_golden_enrich_input',
  source_system: 'plaid',
  generated_at: new Date().toISOString(),
  expectations_path: expectationsPath,
  normalized_path: normalizedPath,
  transaction_count: transactions.length,
  transactions: transactions.map(({ source_artifact_file, ...transaction }) => transaction),
};
fixture.transactions.forEach((transaction, index) =>
  validateEnrichTransaction(transaction, `plaid_golden_enrich_fixture.transactions[${index}]`)
);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(fixture, null, 2)}\n`);

console.log(`Plaid golden enrich fixture written: ${outputPath}`);
console.log(`transactions: ${transactions.length}`);

function latestCandidateRunId() {
  const root = join(backendRoot, 'artifacts', 'plaid-golden-candidates');
  const runs = readDirNames(root).sort();
  assert.ok(runs.length > 0, 'no Plaid golden candidate artifact runs found');
  return runs.at(-1);
}

function readDirNames(path) {
  try {
    return readdirSync(path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
