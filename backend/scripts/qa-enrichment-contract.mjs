import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readJson,
  validateContractExamples,
  validateMockBankFixtures,
} from './lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const mockBankRoot = join(backendRoot, 'fixtures', 'mock-bank');
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

validateContractExamples(readJson(contractExamplesPath));
console.log('ok API response contract examples');
console.log('Backend enrichment QA contract checks passed');
