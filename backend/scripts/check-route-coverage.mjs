import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');
const apiSourcePath = resolve(repoRoot, 'backend/functions/ventus-api/index.mjs');
const openApiPath = resolve(repoRoot, 'docs/openapi-draft.yaml');

const apiSource = readFileSync(apiSourcePath, 'utf8');
const openApi = readFileSync(openApiPath, 'utf8');

function normalizeExpressPath(path) {
  return path
    .replace('/v1/customers/:id/', '/v1/customers/{customer_id}/')
    .replace('/v1/jobs/:id', '/v1/jobs/{job_id}')
    .replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

const routeRegex = /app\.(get|post|put|patch|delete)\('([^']+)'/g;
const sourceRoutes = [];

for (const match of apiSource.matchAll(routeRegex)) {
  sourceRoutes.push({
    method: match[1].toUpperCase(),
    path: normalizeExpressPath(match[2]),
  });
}

const documentedPaths = new Set(
  openApi
    .split('\n')
    .filter((line) => /^  \/[^:]+:/.test(line))
    .map((line) => line.trim().replace(/:$/, ''))
);

const missing = sourceRoutes.filter((route) => !documentedPaths.has(route.path));

assert.equal(
  missing.length,
  0,
  `OpenAPI draft is missing route(s): ${missing
    .map((route) => `${route.method} ${route.path}`)
    .join(', ')}`
);

console.log(`OpenAPI route coverage ok: ${sourceRoutes.length} source routes documented`);
