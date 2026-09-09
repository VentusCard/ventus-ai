import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(infraRoot, '..');
const baselinePath = resolve(infraRoot, 'security', 'secrets-boundary-baseline.json');
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const legacySecretId = baseline.legacy_combined_secret_id;

const allowedLegacyReferences = new Set([
  'backend/shared/platform/secrets.mjs',
  'infra/lib/ventus-existing-infra-stack.ts',
  'infra/security/db-secret-rotation-preflight.json',
  'infra/security/secrets-boundary-baseline.json',
  'infra/security/secrets-rotation-kms-baseline.json',
]);

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'cdk.out'].includes(entry.name)) continue;
      files.push(...walk(fullPath));
    } else if (['.mjs', '.ts', '.json'].includes(extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function relativePath(filePath) {
  return filePath.slice(repoRoot.length + 1);
}

assert.equal(
  baseline.runtime_env.database_secret_id,
  'RDS_SECRET_ID',
  'database secret env var should be RDS_SECRET_ID'
);
assert.equal(
  baseline.runtime_env.model_provider_secret_id,
  'MODEL_PROVIDER_SECRET_ID',
  'model provider secret env var should be MODEL_PROVIDER_SECRET_ID'
);
assert.notEqual(
  baseline.runtime_env.database_secret_id,
  baseline.runtime_env.model_provider_secret_id,
  'database and model-provider credentials must not share the same env var'
);

const targetSecrets = new Map(
  baseline.target_secrets.map((secret) => [secret.name, secret])
);
assert.equal(
  targetSecrets.get('database_credentials')?.rotation_days,
  30,
  'database credentials should rotate every 30 days'
);
assert.equal(
  targetSecrets.get('model_provider_credentials')?.rotation_days,
  90,
  'model provider credentials should rotate every 90 days'
);
assert.ok(
  targetSecrets.get('database_credentials')?.forbidden_keys.includes('GEMINI_API_KEY'),
  'database secret should explicitly forbid model-provider keys'
);
for (const key of ['host', 'port', 'username', 'password']) {
  assert.ok(
    targetSecrets.get('model_provider_credentials')?.forbidden_keys.includes(key),
    `model provider secret should explicitly forbid database key ${key}`
  );
}

const scannedRoots = [
  resolve(repoRoot, 'backend'),
  resolve(repoRoot, 'infra', 'lib'),
  resolve(repoRoot, 'infra', 'security'),
].filter((path) => statSync(path).isDirectory());
for (const filePath of scannedRoots.flatMap(walk)) {
  const rel = relativePath(filePath);
  const source = readFileSync(filePath, 'utf8');
  if (!source.includes(legacySecretId)) continue;
  assert.ok(
    allowedLegacyReferences.has(rel),
    `${rel} must not hard-code the legacy combined secret; use RDS_SECRET_ID or MODEL_PROVIDER_SECRET_ID`
  );
}

const backendFunctionsRoot = resolve(repoRoot, 'backend', 'functions');
for (const functionDir of readdirSync(backendFunctionsRoot)) {
  const indexPath = resolve(backendFunctionsRoot, functionDir, 'index.mjs');
  try {
    const source = readFileSync(indexPath, 'utf8');
    assert.ok(
      !source.includes(legacySecretId),
      `${functionDir} must not reference the legacy combined secret directly`
    );

    if (source.includes('GEMINI_API_KEY')) {
      assert.ok(
        source.includes('MODEL_PROVIDER_SECRET_ID'),
        `${functionDir} reads GEMINI_API_KEY and must resolve MODEL_PROVIDER_SECRET_ID`
      );
      assert.ok(
        source.includes('getModelSecrets'),
        `${functionDir} reads GEMINI_API_KEY and should use a dedicated model secrets provider`
      );
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

console.log(
  `Secrets boundary checks passed: ${baseline.target_secrets.length} separated secret profile(s), legacy direct references blocked`
);
