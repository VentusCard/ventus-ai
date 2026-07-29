import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(
  readFileSync(resolve(infraRoot, 'security', 'secrets-rotation-kms-baseline.json'), 'utf8')
);

assert.equal(
  baseline.purpose,
  'Enterprise readiness baseline for Secrets Manager rotation and customer-managed KMS posture.'
);
assert.ok(Array.isArray(baseline.target_secrets), 'target_secrets should be an array');
assert.equal(baseline.target_secrets.length, 2, 'expected DB and model-provider secret profiles');

const profiles = new Map(baseline.target_secrets.map((profile) => [profile.name, profile]));
assert.equal(
  profiles.get('database_credentials')?.rotation_days,
  30,
  'database credentials should target 30-day rotation'
);
assert.equal(
  profiles.get('model_provider_credentials')?.rotation_days,
  90,
  'model-provider credentials should target 90-day rotation'
);

for (const profile of baseline.target_secrets) {
  assert.ok(profile.secret_id, `${profile.name} should include the live secret id`);
  assert.equal(
    profile.customer_managed_kms_required,
    true,
    `${profile.name} should require customer-managed KMS`
  );
  assert.ok(profile.rotation_type, `${profile.name} should define a rotation type`);
  assert.ok(profile.rotation_notes, `${profile.name} should include rotation notes`);
  assert.ok(profile.required_tags, `${profile.name} should define required audit tags`);
  for (const key of ['Application', 'Control', 'Owner', 'RotationTargetDays', 'RotationType', 'KmsAlias']) {
    assert.ok(profile.required_tags[key], `${profile.name} should require ${key} tag`);
  }
}

assert.equal(
  baseline.kms_target?.key_alias_prefix,
  'alias/ventus/',
  'KMS aliases should stay under alias/ventus/'
);
assert.equal(
  baseline.kms_target?.separate_keys_per_secret_class,
  true,
  'DB and model-provider secrets should use separate key classes'
);
for (const operation of ['kms:Decrypt', 'kms:DescribeKey']) {
  assert.ok(
    baseline.kms_target?.required_operations?.includes(operation),
    `KMS target should include ${operation}`
  );
}
assert.ok(
  baseline.kms_target?.notes?.includes('Do not move live secrets'),
  'baseline should warn against unreviewed live KMS migration'
);

console.log(
  `Secrets rotation/KMS readiness baseline checks passed: ${baseline.target_secrets.length} secret profile(s)`
);
