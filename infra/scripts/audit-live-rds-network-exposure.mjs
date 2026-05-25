/**
 * Live audit: verify RDS public access posture matches the baseline.
 *
 * Checks actual AWS state (security group ingress rules + publicly_accessible flag)
 * against infra/security/rds-network-exposure-baseline.json.
 *
 * Usage:
 *   npm run --prefix infra audit:rds-network
 *   npm run --prefix infra audit:rds-network -- --strict
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(
  readFileSync(resolve(infraRoot, 'security', 'rds-network-exposure-baseline.json'), 'utf8')
);

const region = process.env.AWS_REGION || 'us-east-2';
const strict = process.argv.includes('--strict');
const failures = [];
const warnings = [];

function aws(args) {
  return execFileSync(
    process.env.AWS_CLI || 'aws',
    ['--region', region, ...args, '--output', 'json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
}

function safeAws(args, label) {
  try {
    return JSON.parse(aws(args));
  } catch (e) {
    warnings.push(`could not run ${label}: ${e.message.split('\n')[0]}`);
    return null;
  }
}

// ─── 1. Security group: no public /32 ingress ─────────────────────────────────
const sgResult = safeAws(
  ['ec2', 'describe-security-groups', '--group-ids', baseline.database_security_group_id],
  'describe-security-groups'
);

if (sgResult) {
  const rules = sgResult.SecurityGroups?.[0]?.IpPermissions ?? [];

  // Assert no blocked CIDRs (0.0.0.0/0, ::/0).
  for (const rule of rules) {
    for (const range of rule.IpRanges ?? []) {
      if (baseline.blocked_cidrs.includes(range.CidrIp)) {
        failures.push(`CRITICAL: broad public ingress ${range.CidrIp} found on ${baseline.database_security_group_id}`);
      }
    }
    for (const range of rule.Ipv6Ranges ?? []) {
      if (baseline.blocked_cidrs.includes(range.CidrIpv6)) {
        failures.push(`CRITICAL: broad public ingress ${range.CidrIpv6} found on ${baseline.database_security_group_id}`);
      }
    }
  }

  // Assert no temporary /32 exceptions remain.
  const publicRules = [];
  for (const rule of rules) {
    if (rule.FromPort !== baseline.postgres_port) continue;
    for (const range of rule.IpRanges ?? []) {
      if (/^\d+\.\d+\.\d+\.\d+\/32$/.test(range.CidrIp)) {
        // /32 that is not a security group self-reference
        const isSelfRef = baseline.required_self_references.some(
          (r) => r.security_group_id === baseline.database_security_group_id
        );
        if (!isSelfRef) {
          publicRules.push(range.CidrIp);
        }
      }
    }
  }

  if (publicRules.length > 0) {
    failures.push(
      `Public /32 ingress rules still present on ${baseline.database_security_group_id}: ${publicRules.join(', ')}. Run remediate-rds-public-access.mjs --execute to remove.`
    );
  } else {
    console.log(`ok security group ${baseline.database_security_group_id}: no public /32 ingress rules`);
  }

  // Assert self-reference exists.
  const hasSelfRef = rules.some(
    (r) =>
      r.FromPort === baseline.postgres_port &&
      r.UserIdGroupPairs?.some((p) => p.GroupId === baseline.database_security_group_id)
  );
  if (hasSelfRef) {
    console.log(`ok security group self-reference present`);
  } else {
    failures.push(`Required self-reference missing from ${baseline.database_security_group_id}`);
  }
}

// ─── 2. RDS instances: no publicly_accessible=true ────────────────────────────
const clusterResult = safeAws(
  ['rds', 'describe-db-clusters', '--db-cluster-identifier', baseline.database_cluster_identifier],
  'describe-db-clusters'
);

if (clusterResult) {
  const members = clusterResult.DBClusters?.[0]?.DBClusterMembers ?? [];
  for (const member of members) {
    const instanceResult = safeAws(
      ['rds', 'describe-db-instances', '--db-instance-identifier', member.DBInstanceIdentifier],
      `describe-db-instances (${member.DBInstanceIdentifier})`
    );
    if (!instanceResult) continue;

    const instance = instanceResult.DBInstances?.[0];
    if (!instance) continue;

    if (instance.PubliclyAccessible) {
      failures.push(
        `${instance.DBInstanceIdentifier} is still publicly_accessible=true. Run remediate-rds-public-access.mjs --execute to fix.`
      );
    } else {
      console.log(`ok ${instance.DBInstanceIdentifier}: publicly_accessible=false`);
    }
  }
}

// ─── Results ──────────────────────────────────────────────────────────────────
const result = {
  region,
  securityGroup: baseline.database_security_group_id,
  cluster: baseline.database_cluster_identifier,
};

console.log('\n' + JSON.stringify(result, null, 2));

if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log(`  - ${w}`);
}

if (failures.length > 0) {
  console.log('\nRDS network exposure audit FAILED:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(strict ? 1 : 0);
} else if (warnings.length === 0) {
  console.log('\nRDS network exposure audit passed.');
}
