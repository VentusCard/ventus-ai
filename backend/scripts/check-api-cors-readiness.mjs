import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiSourcePath = resolve(backendRoot, 'functions', 'ventus-api', 'index.mjs');
const apiSource = readFileSync(apiSourcePath, 'utf8');

assert.match(
  apiSource,
  /VENTUS_ALLOWED_ORIGINS/,
  'ventus-api CORS should be controlled by VENTUS_ALLOWED_ORIGINS'
);
assert.match(
  apiSource,
  /DEFAULT_ALLOWED_ORIGINS/,
  'ventus-api should define a production-safe default origin list'
);
assert.match(
  apiSource,
  /resolveCorsOrigin/,
  'ventus-api should resolve request origins against the allowlist'
);
assert.match(
  apiSource,
  /res\.setHeader\('Vary', 'Origin'\)/,
  'ventus-api CORS responses should include Vary: Origin'
);
assert.doesNotMatch(
  apiSource,
  /Access-Control-Allow-Origin',\s*'\*'/,
  'ventus-api should not hard-code Access-Control-Allow-Origin: *'
);
assert.match(
  apiSource,
  /https:\/\/\*\.lovable\.app/,
  'ventus-api should preserve prototype compatibility for Lovable app previews until deprecated'
);
assert.match(
  apiSource,
  /https:\/\/\*\.amplifyapp\.com/,
  'ventus-api should preserve staging/prototype compatibility for Amplify previews'
);

console.log('API CORS readiness checks passed');
