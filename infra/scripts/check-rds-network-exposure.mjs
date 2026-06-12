import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = resolve(infraRoot, 'security', 'rds-network-exposure-baseline.json');
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));

function assertPortRule(rule, label) {
  assert.equal(rule.protocol, 'tcp', `${label}.protocol should be tcp`);
  assert.equal(rule.from_port, baseline.postgres_port, `${label}.from_port should be Postgres`);
  assert.equal(rule.to_port, baseline.postgres_port, `${label}.to_port should be Postgres`);
}

function assertIpv4Cidr32(cidr, label) {
  assert.match(cidr, /^\d{1,3}(\.\d{1,3}){3}\/32$/, `${label} should be a single-host IPv4 /32`);
  for (const octet of cidr.split('/')[0].split('.')) {
    const value = Number(octet);
    assert.ok(value >= 0 && value <= 255, `${label} has invalid IPv4 octet ${octet}`);
  }
}

assert.equal(
  baseline.database_cluster_identifier,
  'ventus-bofa-cluster',
  'baseline should target the existing Aurora cluster'
);
assert.equal(
  baseline.database_security_group_id,
  'sg-08836ed15d778ecd6',
  'baseline should target the known database security group'
);
assert.equal(baseline.postgres_port, 5432, 'baseline should use Postgres port 5432');

assert.ok(Array.isArray(baseline.blocked_cidrs), 'blocked_cidrs should be an array');
for (const blockedCidr of ['0.0.0.0/0', '::/0']) {
  assert.ok(baseline.blocked_cidrs.includes(blockedCidr), `${blockedCidr} should be blocked`);
}

assert.ok(
  Array.isArray(baseline.required_self_references) &&
    baseline.required_self_references.length >= 1,
  'database SG self-reference should be explicitly required'
);
for (const [index, rule] of baseline.required_self_references.entries()) {
  assertPortRule(rule, `required_self_references[${index}]`);
  assert.equal(
    rule.security_group_id,
    baseline.database_security_group_id,
    `required_self_references[${index}] should reference the database security group`
  );
}

assert.ok(
  Array.isArray(baseline.temporary_public_ingress_exceptions),
  'temporary_public_ingress_exceptions should be an array'
);
assert.equal(
  baseline.temporary_public_ingress_exceptions.length,
  0,
  'temporary_public_ingress_exceptions must be empty — all public /32 rules should have been removed. ' +
  'Run infra/scripts/remediate-rds-public-access.mjs --execute to remove them, then update the baseline.'
);

assert.ok(
  Array.isArray(baseline.known_publicly_accessible_instances),
  'known_publicly_accessible_instances should be an array'
);
for (const [index, instance] of baseline.known_publicly_accessible_instances.entries()) {
  assert.equal(
    instance.publicly_accessible,
    false,
    `known_publicly_accessible_instances[${index}] (${instance.db_instance_identifier}) must be publicly_accessible=false. ` +
    'Run infra/scripts/remediate-rds-public-access.mjs --execute to remediate.'
  );
}

assert.equal(
  baseline.target_posture.publicly_accessible,
  false,
  'target posture should require private-only RDS instances'
);

console.log(
  `RDS network exposure baseline checks passed: 0 public /32 exceptions, all instances private`
);
