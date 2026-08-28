import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const openApiPath = resolve('../docs/api/openapi-draft.yaml');
const text = readFileSync(openApiPath, 'utf8');
const lines = text.split('\n');

const successCodes = new Set(['200', '201', '202']);
const missingSchemas = [];
let currentPath = null;
let currentMethod = null;
let currentStatus = null;
let inResponses = false;
let sawSchemaForStatus = false;

function closeStatus() {
  if (currentPath && currentMethod && currentStatus && successCodes.has(currentStatus) && !sawSchemaForStatus) {
    missingSchemas.push(`${currentMethod.toUpperCase()} ${currentPath} ${currentStatus}`);
  }
}

for (const line of lines) {
  const pathMatch = line.match(/^  (\/[^:]+):$/);
  if (pathMatch) {
    closeStatus();
    currentPath = pathMatch[1];
    currentMethod = null;
    currentStatus = null;
    inResponses = false;
    sawSchemaForStatus = false;
    continue;
  }

  const methodMatch = line.match(/^    (get|post|put|patch|delete):$/);
  if (methodMatch) {
    closeStatus();
    currentMethod = methodMatch[1];
    currentStatus = null;
    inResponses = false;
    sawSchemaForStatus = false;
    continue;
  }

  if (currentPath && currentMethod && /^      responses:$/.test(line)) {
    closeStatus();
    inResponses = true;
    currentStatus = null;
    sawSchemaForStatus = false;
    continue;
  }

  const statusMatch = line.match(/^        '(\d{3})':$/);
  if (inResponses && statusMatch) {
    closeStatus();
    currentStatus = statusMatch[1];
    sawSchemaForStatus = false;
    continue;
  }

  if (currentStatus && /^\s+schema:$/.test(line)) {
    sawSchemaForStatus = true;
  }
}
closeStatus();

assert.equal(
  missingSchemas.length,
  0,
  `OpenAPI success response(s) missing JSON schema: ${missingSchemas.join(', ')}`
);

console.log('OpenAPI success responses include JSON schemas');
