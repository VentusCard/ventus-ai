import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBlindReviewPacket } from '../shared/pilot/intervention-review.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const manifestPath = process.env.VENTUS_INTERVENTION_BENCHMARK_PATH
  ? resolve(process.env.VENTUS_INTERVENTION_BENCHMARK_PATH)
  : join(backendRoot, 'fixtures', 'evaluation', 'intervention-planning-benchmark.json');
const outputDir = process.env.VENTUS_INTERVENTION_REVIEW_DIR
  ? resolve(process.env.VENTUS_INTERVENTION_REVIEW_DIR)
  : join(backendRoot, 'artifacts', 'intervention-review');
const slots = Number(process.env.VENTUS_INTERVENTION_REVIEWERS ?? 2);
assert.ok(Number.isInteger(slots) && slots >= 2 && slots <= 10, 'VENTUS_INTERVENTION_REVIEWERS must be an integer from 2 to 10');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
mkdirSync(outputDir, { recursive: true });
const overwrite = process.env.VENTUS_INTERVENTION_REVIEW_OVERWRITE === '1';
const paths = [];
for (let index = 1; index <= slots; index += 1) {
  const packet = buildBlindReviewPacket(manifest, `reviewer-${index}`);
  const path = join(outputDir, `${manifest.benchmark_id}-reviewer-${index}.json`);
  writeFileSync(path, `${JSON.stringify(packet, null, 2)}\n`, { flag: overwrite ? 'w' : 'wx' });
  paths.push(path);
}

console.log(`Prepared ${paths.length} blinded intervention-review packets:`);
for (const path of paths) console.log(` · ${path}`);
console.log('Candidate predictions and authored expectations are intentionally absent.');
