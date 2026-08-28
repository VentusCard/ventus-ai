import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const openApiPath = resolve('../docs/api/openapi-draft.yaml');
const text = readFileSync(openApiPath, 'utf8');

const requiredPatterns = [
  /^openapi:\s*3\.0\.3/m,
  /^  \/health:/m,
  /^  \/v1\/enrich:/m,
  /^  \/v1\/jobs:/m,
  /^  \/v1\/jobs\/\{job_id\}:/m,
  /^  \/v1\/customers\/\{customer_id\}\/transactions:/m,
  /^  \/v1\/webhooks:/m,
  /ApiKeyAuth:/,
  /x-api-key/,
];

for (const pattern of requiredPatterns) {
  assert.match(text, pattern, `OpenAPI draft missing ${pattern}`);
}

console.log('OpenAPI draft contains required backend API sections');

