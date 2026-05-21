import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(
  readFileSync(resolve(infraRoot, 'security', 'secrets-rotation-kms-baseline.json'), 'utf8')
);

const region = optionValue('--region') || process.env.AWS_REGION || 'us-east-2';
const strict = process.argv.includes('--strict');
const warnings = [];
const failures = [];

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
    const message = error.stderr?.toString().trim() || error.message;
    warnings.push(`${label}: ${message}`);
    return null;
  }
}

const identity = safeAwsJson(['sts', 'get-caller-identity'], 'could not read caller identity');
if (identity) {
  console.log(`AWS caller: ${identity.Arn}`);
}

const summaries = [];
function tagsToMap(tags = []) {
  return new Map(tags.map((tag) => [tag.Key, tag.Value]));
}

for (const profile of baseline.target_secrets) {
  const description = safeAwsJson(
    ['secretsmanager', 'describe-secret', '--secret-id', profile.secret_id],
    `could not describe secret ${profile.name}`
  );
  if (!description) {
    failures.push(`${profile.name}: secret is not readable`);
    continue;
  }

  const rotationEnabled = description.RotationEnabled === true;
  const kmsKeyId = description.KmsKeyId || null;
  const hasCustomerManagedKms = Boolean(kmsKeyId);
  const rotationDays = description.RotationRules?.AutomaticallyAfterDays || null;
  const tags = tagsToMap(description.Tags || []);
  const missingOrMismatchedTags = [];

  if (!rotationEnabled) {
    failures.push(`${profile.name}: rotation is not enabled`);
  } else if (rotationDays && rotationDays > profile.rotation_days) {
    failures.push(
      `${profile.name}: rotation interval is ${rotationDays} days, expected <= ${profile.rotation_days}`
    );
  }

  if (profile.customer_managed_kms_required && !hasCustomerManagedKms) {
    failures.push(`${profile.name}: customer-managed KMS key is not configured`);
  }

  for (const [key, expectedValue] of Object.entries(profile.required_tags || {})) {
    const actualValue = tags.get(key);
    if (actualValue !== expectedValue) {
      missingOrMismatchedTags.push({ key, expectedValue, actualValue: actualValue || null });
      failures.push(`${profile.name}: tag ${key} is ${actualValue || 'missing'}, expected ${expectedValue}`);
    }
  }

  summaries.push({
    name: profile.name,
    secretId: profile.secret_id,
    rotationEnabled,
    rotationDays,
    customerManagedKms: hasCustomerManagedKms,
    kmsKeyId,
    rotationMetadataTagged: missingOrMismatchedTags.length === 0,
    missingOrMismatchedTags,
  });
}

console.log(JSON.stringify({ region, strict, summaries }, null, 2));

if (warnings.length > 0) {
  console.warn(`\nWarnings:\n- ${warnings.join('\n- ')}`);
}

if (failures.length > 0) {
  const message = `\nSecrets rotation/KMS posture gaps:\n- ${failures.join('\n- ')}`;
  if (strict) {
    console.error(message);
    process.exit(1);
  }
  console.warn(message);
}

console.log(
  `Secrets rotation/KMS audit completed for ${summaries.length} secret profile(s) in ${region}`
);
