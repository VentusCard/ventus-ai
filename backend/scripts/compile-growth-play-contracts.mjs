import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileGrowthPlayContract } from '../shared/pilot/growth-play-contract.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const inputPath = resolve(
  process.env.VENTUS_GROWTH_PLAY_DRAFTS
    || `${scriptDir}/../fixtures/evaluation/growth-play-drafts.json`,
);
const drafts = JSON.parse(readFileSync(inputPath, 'utf8'));
assert.ok(Array.isArray(drafts) && drafts.length > 0, 'growth play draft file must contain a non-empty array');

const contracts = drafts.map(compileGrowthPlayContract);
assert.equal(new Set(contracts.map((contract) => contract.growth_play_id)).size, contracts.length, 'growth_play_id values must be unique');
assert.equal(new Set(contracts.map((contract) => contract.decision_protocol_id)).size, contracts.length, 'decision protocol ids must be unique');

if (process.env.VENTUS_GROWTH_PLAY_OUTPUT) {
  const outputPath = resolve(process.env.VENTUS_GROWTH_PLAY_OUTPUT);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(contracts, null, 2)}\n`);
  console.log(`Wrote ${contracts.length} compiled Growth Play contract(s) to ${outputPath}`);
}

for (const contract of contracts) {
  console.log(`${contract.growth_play_id}@${contract.version}: ${contract.decision_protocol_id} · ${contract.measurement.metric}`);
}
console.log('Growth Play contracts verified: sources, policies, actions, destinations, and measurement are protocol-bound.');
