/**
 * Remediate RDS public access for ventus-bofa-cluster.
 *
 * What this does:
 *   1. Revokes the two known public /32 ingress rules from sg-08836ed15d778ecd6.
 *   2. Modifies ventus-bofa-cluster-instance-1 to publicly_accessible=false
 *      (triggers an instance reboot — brief downtime, ~30s–2min).
 *
 * Usage:
 *   node ./scripts/remediate-rds-public-access.mjs           # dry run (safe)
 *   node ./scripts/remediate-rds-public-access.mjs --execute  # apply changes
 *
 * Prerequisites:
 *   - AWS CLI configured with credentials that have ec2:RevokeSecurityGroupIngress
 *     and rds:ModifyDBInstance on the target resources.
 *   - Confirm with the team that 207.181.211.74/32 and 155.33.132.60/32 are no
 *     longer needed before running with --execute. These may be developer IPs
 *     used for direct DB access.
 */

import { execFileSync } from 'node:child_process';

const DRY_RUN = !process.argv.includes('--execute');
const REGION = process.env.AWS_REGION || 'us-east-2';

const SECURITY_GROUP_ID = 'sg-08836ed15d778ecd6';
const DB_INSTANCE_ID = 'ventus-bofa-cluster-instance-1';
const POSTGRES_PORT = 5432;

const PUBLIC_INGRESS_RULES = [
  { cidr: '207.181.211.74/32', label: 'public /32 rule A' },
  { cidr: '155.33.132.60/32', label: 'public /32 rule B' },
];

function aws(args) {
  return execFileSync(
    process.env.AWS_CLI || 'aws',
    ['--region', REGION, ...args, '--output', 'json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
}

function safeAws(args, label) {
  try {
    return JSON.parse(aws(args));
  } catch (e) {
    console.warn(`  [warn] could not run ${label}: ${e.message.split('\n')[0]}`);
    return null;
  }
}

// ─── PREFLIGHT ────────────────────────────────────────────────────────────────
console.log('=== RDS Public Access Remediation ===');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : '*** EXECUTE — changes will be applied ***'}`);
console.log(`Region: ${REGION}`);
console.log('');

// Check current security group ingress rules.
console.log(`Checking security group ${SECURITY_GROUP_ID}...`);
const sgResult = safeAws(
  ['ec2', 'describe-security-groups', '--group-ids', SECURITY_GROUP_ID],
  'describe-security-groups'
);

const currentRules = sgResult?.SecurityGroups?.[0]?.IpPermissions ?? [];
const rulesToRevoke = [];

for (const { cidr, label } of PUBLIC_INGRESS_RULES) {
  const match = currentRules.find(
    (r) =>
      r.FromPort === POSTGRES_PORT &&
      r.ToPort === POSTGRES_PORT &&
      r.IpProtocol === 'tcp' &&
      r.IpRanges?.some((range) => range.CidrIp === cidr)
  );
  if (match) {
    console.log(`  [found] ${label}: ${cidr}:${POSTGRES_PORT} — will revoke`);
    rulesToRevoke.push({ cidr, label });
  } else {
    console.log(`  [ok]    ${label}: ${cidr}:${POSTGRES_PORT} — not present, nothing to do`);
  }
}

// Check current publicly_accessible flag.
console.log(`\nChecking RDS instance ${DB_INSTANCE_ID}...`);
const instanceResult = safeAws(
  ['rds', 'describe-db-instances', '--db-instance-identifier', DB_INSTANCE_ID],
  'describe-db-instances'
);

const instance = instanceResult?.DBInstances?.[0];
const isPublic = instance?.PubliclyAccessible;
const instanceStatus = instance?.DBInstanceStatus ?? 'unknown';

if (isPublic === undefined) {
  console.log(`  [warn] could not determine publicly_accessible — instance may not be readable`);
} else if (isPublic) {
  console.log(`  [found] publicly_accessible=true (status: ${instanceStatus}) — will modify to false`);
  console.log(`  [warn]  *** This triggers an instance reboot (~30s–2min downtime) ***`);
} else {
  console.log(`  [ok]    publicly_accessible=false — no change needed`);
}

// ─── PLAN SUMMARY ─────────────────────────────────────────────────────────────
console.log('\n--- Plan ---');
if (rulesToRevoke.length === 0 && !isPublic) {
  console.log('Nothing to do. RDS public access is already remediated.');
  process.exit(0);
}
for (const { cidr, label } of rulesToRevoke) {
  console.log(`  revoke sg ingress: ${SECURITY_GROUP_ID} ← ${cidr}:${POSTGRES_PORT} (${label})`);
}
if (isPublic) {
  console.log(`  modify rds instance: ${DB_INSTANCE_ID} publicly_accessible → false (REBOOT)`);
}

if (DRY_RUN) {
  console.log('\nDry run complete. Re-run with --execute to apply.');
  process.exit(0);
}

// ─── EXECUTE ──────────────────────────────────────────────────────────────────
console.log('\n--- Executing ---');

for (const { cidr, label } of rulesToRevoke) {
  console.log(`Revoking ${label} (${cidr})...`);
  try {
    aws([
      'ec2', 'revoke-security-group-ingress',
      '--group-id', SECURITY_GROUP_ID,
      '--protocol', 'tcp',
      '--port', String(POSTGRES_PORT),
      '--cidr', cidr,
    ]);
    console.log(`  [done] revoked ${cidr}`);
  } catch (e) {
    console.error(`  [error] failed to revoke ${cidr}: ${e.message.split('\n')[0]}`);
    process.exit(1);
  }
}

if (isPublic) {
  console.log(`Modifying ${DB_INSTANCE_ID} to publicly_accessible=false (apply-immediately)...`);
  try {
    aws([
      'rds', 'modify-db-instance',
      '--db-instance-identifier', DB_INSTANCE_ID,
      '--no-publicly-accessible',
      '--apply-immediately',
    ]);
    console.log(`  [done] modification submitted — instance will reboot shortly`);
    console.log(`  [info] poll with: aws rds describe-db-instances --db-instance-identifier ${DB_INSTANCE_ID} --query 'DBInstances[0].{Status:DBInstanceStatus,Public:PubliclyAccessible}'`);
  } catch (e) {
    console.error(`  [error] failed to modify instance: ${e.message.split('\n')[0]}`);
    process.exit(1);
  }
}

console.log('\nRemediation complete. Run audit:rds-network to verify live state.');
