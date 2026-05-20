import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(
  readFileSync(resolve(infraRoot, 'security', 'secrets-boundary-baseline.json'), 'utf8')
);

const region = optionValue('--region') || process.env.AWS_REGION || 'us-east-2';
const strict = process.argv.includes('--strict');
const legacySecretId = baseline.legacy_combined_secret_id;
const databaseEnvVar = baseline.runtime_env.database_secret_id;
const modelProviderEnvVar = baseline.runtime_env.model_provider_secret_id;

const databaseFunctions = [
  'ventus-api',
  'ventus-ingest-transactions',
  'ventus-classify-transactions',
  'ventus-analyze-pillar-transactions',
  'ventus-analyze-lifestyle-signals',
  'ventus-risk-detection',
  'ventus-travel-detection',
];
const modelFunctions = [
  'ventus-classify-transactions',
  'ventus-analyze-pillar-transactions',
  'ventus-analyze-lifestyle-signals',
  'ventus-risk-detection',
  'ventus-travel-detection',
];

const failures = [];
const warnings = [];
const observedSecretIds = new Set();

function optionValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function awsJson(args) {
  const output = execFileSync(
    process.env.AWS_CLI || 'aws',
    ['--region', region, ...args, '--output', 'json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
  return JSON.parse(output);
}

function safeAwsJson(args, label) {
  try {
    return awsJson(args);
  } catch (error) {
    warnings.push(`${label}: ${error.stderr?.toString().trim() || error.message}`);
    return null;
  }
}

function envValue(config, name) {
  return config.Environment?.Variables?.[name];
}

function describeSecret(secretId) {
  const description = safeAwsJson(
    ['secretsmanager', 'describe-secret', '--secret-id', secretId],
    `could not describe secret ${secretId}`
  );
  if (!description) return;

  if (!description.RotationEnabled) {
    warnings.push(`secret ${secretId} does not report RotationEnabled=true`);
  }
  if (!description.KmsKeyId) {
    warnings.push(`secret ${secretId} does not report a customer-managed KMS key`);
  }
}

function inspectSecretContents(secretId, profile) {
  const value = safeAwsJson(
    ['secretsmanager', 'get-secret-value', '--secret-id', secretId],
    `could not inspect secret contents for ${secretId}`
  );
  if (!value?.SecretString) return;

  let parsed;
  try {
    parsed = JSON.parse(value.SecretString);
  } catch {
    failures.push(`secret ${profile.name} does not contain a JSON SecretString`);
    return;
  }

  for (const key of profile.allowed_keys || []) {
    if (!Object.prototype.hasOwnProperty.call(parsed, key)) {
      failures.push(`secret ${profile.name} is missing expected key ${key}`);
    }
  }

  for (const key of profile.forbidden_keys || []) {
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      failures.push(`secret ${profile.name} still contains forbidden key ${key}`);
    }
  }
}

const identity = safeAwsJson(['sts', 'get-caller-identity'], 'could not read caller identity');
if (identity) {
  console.log(`AWS caller: ${identity.Arn}`);
}

const functionSummaries = [];
for (const functionName of databaseFunctions) {
  const config = safeAwsJson(
    ['lambda', 'get-function-configuration', '--function-name', functionName],
    `could not inspect Lambda ${functionName}`
  );
  if (!config) {
    failures.push(`${functionName}: Lambda configuration is not readable`);
    continue;
  }

  const databaseSecretId = envValue(config, databaseEnvVar);
  const modelProviderSecretId = envValue(config, modelProviderEnvVar);
  const requiresModelSecret = modelFunctions.includes(functionName);

  if (!databaseSecretId) {
    failures.push(`${functionName}: missing ${databaseEnvVar}`);
  } else {
    observedSecretIds.add(databaseSecretId);
  }

  if (requiresModelSecret && !modelProviderSecretId) {
    failures.push(`${functionName}: missing ${modelProviderEnvVar}`);
  }
  if (modelProviderSecretId) {
    observedSecretIds.add(modelProviderSecretId);
  }
  if (requiresModelSecret && databaseSecretId && modelProviderSecretId) {
    if (databaseSecretId === modelProviderSecretId) {
      failures.push(
        `${functionName}: ${databaseEnvVar} and ${modelProviderEnvVar} still point to the same secret`
      );
    }
    if (modelProviderSecretId === legacySecretId) {
      failures.push(`${functionName}: ${modelProviderEnvVar} still points to the legacy DB secret`);
    }
  }

  functionSummaries.push({
    functionName,
    hasDatabaseSecretId: Boolean(databaseSecretId),
    hasModelProviderSecretId: Boolean(modelProviderSecretId),
    databaseUsesLegacyId: databaseSecretId === legacySecretId,
    modelProviderUsesLegacyId: modelProviderSecretId === legacySecretId,
    role: config.Role,
  });
}

for (const secretId of observedSecretIds) {
  describeSecret(secretId);
}

const targetSecretProfiles = new Map(
  baseline.target_secrets.map((profile) => [profile.env_var, profile])
);
const databaseProfile = targetSecretProfiles.get(databaseEnvVar);
const modelProviderProfile = targetSecretProfiles.get(modelProviderEnvVar);
if (databaseProfile && baseline.live_status?.database_secret_id) {
  inspectSecretContents(baseline.live_status.database_secret_id, databaseProfile);
}
if (modelProviderProfile && baseline.live_status?.model_provider_secret_id) {
  inspectSecretContents(baseline.live_status.model_provider_secret_id, modelProviderProfile);
}

console.log(JSON.stringify({ region, strict, functionSummaries }, null, 2));

if (warnings.length > 0) {
  console.warn(`\nWarnings:\n- ${warnings.join('\n- ')}`);
}

if (failures.length > 0 || (strict && warnings.length > 0)) {
  console.error(`\nSecrets cutover audit failed:\n- ${failures.join('\n- ')}`);
  if (strict && warnings.length > 0) {
    console.error(`\nStrict-mode warnings:\n- ${warnings.join('\n- ')}`);
  }
  process.exit(1);
}

console.log(
  `Secrets cutover audit passed for ${functionSummaries.length} Lambda function(s) in ${region}`
);
