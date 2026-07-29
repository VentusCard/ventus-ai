import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const schema = readJson(resolve(scriptDir, '../fixtures/contracts/connected-exposure-contract.json'));
const events = readJson(resolve(scriptDir, '../fixtures/evaluation/connected-exposure-sample.json'));
const ajv = new Ajv({ allErrors: true, jsonPointers: true });
const validate = ajv.compile(schema);

assert.ok(Array.isArray(events) && events.length > 0, 'connected exposure sample must contain events');
const ids = new Set();
for (const [index, event] of events.entries()) {
  assert.ok(validate(event), `connected exposure ${index} failed schema: ${ajv.errorsText(validate.errors)}`);
  assert.ok(!ids.has(event.event_id), `duplicate exposure event ${event.event_id}`);
  assert.ok(!/(customer_name|email|phone|street_address)/i.test(JSON.stringify(event)), 'direct PII field detected');
  ids.add(event.event_id);
}
assert.deepEqual(new Set(events.map((event) => event.arm)), new Set(['holdout', 'standalone', 'connected']));
console.log(`Connected exposure contract verified: ${events.length} arm receipts, no direct PII fields.`);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
