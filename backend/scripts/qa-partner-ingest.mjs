import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePartnerIngestFixtures } from './lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const partnerIngestRoot = join(backendRoot, 'fixtures', 'partner-ingest');

const result = validatePartnerIngestFixtures(partnerIngestRoot);

console.log(
  `Partner ingest QA passed: ${result.contractPartnerCount} contract partner(s), ${result.rawFixtureCount} raw fixture(s), ${result.normalizedFixtureCount} normalized fixture(s), ${result.rejectReportCount} reject report(s), ${result.normalizedTransactionCount} normalized transaction(s), ${result.rejectedRecordCount} rejected record(s)`
);
