import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readJson,
  validateContractExamples,
  validateMockBankFixtures,
  validatePartnerIngestFixtures,
} from './lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const mockBankRoot = join(backendRoot, 'fixtures', 'mock-bank');
const partnerIngestRoot = join(backendRoot, 'fixtures', 'partner-ingest');
const contractExamplesPath = join(
  backendRoot,
  'fixtures',
  'contracts',
  'api-response-examples.json'
);

const fixtureResult = validateMockBankFixtures(mockBankRoot);
console.log(
  `ok mock-bank fixtures: ${fixtureResult.files.length} source files, ${fixtureResult.transactionCount} transactions`
);

const partnerIngestResult = validatePartnerIngestFixtures(partnerIngestRoot);
console.log(
  `ok partner ingest fixtures: ${partnerIngestResult.rawFixtureCount} raw fixture(s), ${partnerIngestResult.normalizedFixtureCount} normalized fixture(s), ${partnerIngestResult.normalizedTransactionCount} normalized transactions`
);

validateContractExamples(readJson(contractExamplesPath));
console.log('ok API response contract examples');
console.log('Backend enrichment QA contract checks passed');
