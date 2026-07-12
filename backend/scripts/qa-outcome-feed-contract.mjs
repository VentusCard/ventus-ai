import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(resolve(scriptDir, "../fixtures/contracts/outcome-feed-contract.json"), "utf8"));
const events = JSON.parse(readFileSync(resolve(scriptDir, "../fixtures/evaluation/outcome-feed-sample.json"), "utf8"));
const ajv = new Ajv({ allErrors: true, jsonPointers: true });
const validate = ajv.compile(schema);

assert.ok(Array.isArray(events) && events.length > 0, "outcome sample must contain events");
const ids = new Set();
for (const [index, event] of events.entries()) {
  assert.ok(validate(event), `outcome event ${index} failed schema: ${ajv.errorsText(validate.errors)}`);
  assert.ok(!ids.has(event.event_id), `duplicate event_id ${event.event_id}`);
  assert.ok(!/(name|email|phone|address)/i.test(JSON.stringify(event)), "direct PII field detected");
  assert.ok(
    Date.parse(event.assignment.assigned_at) <= Date.parse(event.occurred_at),
    `assignment must predate outcome for ${event.event_id}`,
  );
  ids.add(event.event_id);
}

console.log(`Outcome feed contract verified: ${events.length} events, pre-assigned experiment arms, no direct PII fields.`);
