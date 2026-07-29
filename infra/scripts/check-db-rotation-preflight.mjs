import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(
  readFileSync(resolve(infraRoot, 'security', 'db-secret-rotation-preflight.json'), 'utf8')
);

assert.equal(
  baseline.purpose,
  'Enterprise readiness preflight for enabling Secrets Manager rotation on the Ventus Aurora database credential secret.'
);
assert.equal(baseline.aws_region, 'us-east-2', 'DB rotation target region should be us-east-2');

assert.equal(
  baseline.database?.cluster_identifier,
  'ventus-bofa-cluster',
  'baseline should name the live Aurora cluster'
);
assert.equal(
  baseline.database?.database_name,
  'ventus_bofa',
  'baseline should name the live application database'
);
assert.equal(
  baseline.database?.engine,
  'aurora-postgresql',
  'baseline should document the live Aurora engine'
);
assert.ok(baseline.database?.secret_id, 'baseline should include the live DB secret id');
assert.equal(baseline.database?.rotation_days, 30, 'DB credentials should target 30-day rotation');

for (const key of ['engine', 'host', 'username', 'password', 'dbname', 'port']) {
  assert.ok(
    baseline.database?.required_secret_keys?.includes(key),
    `DB rotation preflight should require secret key ${key}`
  );
}

assert.equal(
  baseline.rotation_lambda?.expected_template,
  'SecretsManagerRDSPostgreSQLRotationSingleUser',
  'baseline should use the AWS PostgreSQL single-user rotation template'
);
assert.equal(
  baseline.rotation_lambda?.serverless_application_region,
  'us-east-1',
  'AWS rotation SAR app should be checked in us-east-1'
);
assert.ok(
  baseline.rotation_lambda?.serverless_application_arn?.includes('SecretsManagerRDSPostgreSQLRotationSingleUser'),
  'baseline should include the PostgreSQL rotation SAR app ARN'
);

for (const subnetId of ['subnet-057aa09eef4545099', 'subnet-00958cfa806e7e363']) {
  assert.ok(
    baseline.rotation_lambda?.required_subnet_ids?.includes(subnetId),
    `rotation Lambda should use backend subnet ${subnetId}`
  );
}
assert.ok(
  baseline.rotation_lambda?.required_security_group_ids?.includes('sg-08836ed15d778ecd6'),
  'rotation Lambda should use the DB/backend security group path'
);

assert.ok(
  baseline.pre_enable_gates?.some((gate) => gate.includes('without adding public ingress')),
  'pre-enable gates should prohibit public ingress changes'
);
assert.ok(
  baseline.rollback_checks?.some((check) => check.includes('Authenticated enrichment smoke')),
  'rollback checks should include authenticated enrichment smoke'
);

console.log('DB secret rotation preflight baseline checks passed');
