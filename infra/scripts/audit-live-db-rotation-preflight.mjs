import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(
  readFileSync(resolve(infraRoot, 'security', 'db-secret-rotation-preflight.json'), 'utf8')
);

const region = optionValue('--region') || process.env.AWS_REGION || baseline.aws_region || 'us-east-2';
const strict = process.argv.includes('--strict');
const warnings = [];
const failures = [];

function optionValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function awsJson(args, commandRegion = region) {
  const output = execFileSync(
    process.env.AWS_CLI || 'aws',
    ['--region', commandRegion, ...args, '--output', 'json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
  return JSON.parse(output);
}

function safeAwsJson(args, label, commandRegion = region) {
  try {
    return awsJson(args, commandRegion);
  } catch (error) {
    const message = error.stderr?.toString().trim() || error.message;
    warnings.push(`${label}: ${message}`);
    return null;
  }
}

function parseSecretString(secretValue) {
  if (!secretValue?.SecretString) {
    failures.push('database_credentials: secret value did not include SecretString');
    return null;
  }
  try {
    return JSON.parse(secretValue.SecretString);
  } catch {
    failures.push('database_credentials: SecretString is not valid JSON');
    return null;
  }
}

function summarizeRotationFunctions(functions = []) {
  const expectedPrefix = baseline.rotation_lambda.expected_name_prefix;
  return functions
    .filter((fn) => fn.FunctionName?.includes('rotation') || fn.FunctionName?.startsWith(expectedPrefix))
    .map((fn) => ({
      functionName: fn.FunctionName,
      runtime: fn.Runtime,
      vpcId: fn.VpcConfig?.VpcId || null,
      subnetIds: fn.VpcConfig?.SubnetIds || [],
      securityGroupIds: fn.VpcConfig?.SecurityGroupIds || [],
    }));
}

const identity = safeAwsJson(['sts', 'get-caller-identity'], 'could not read caller identity');
if (identity) {
  console.log(`AWS caller: ${identity.Arn}`);
}

const cluster = safeAwsJson(
  ['rds', 'describe-db-clusters', '--db-cluster-identifier', baseline.database.cluster_identifier],
  `could not describe cluster ${baseline.database.cluster_identifier}`
);
const clusterSummary = cluster?.DBClusters?.[0]
  ? {
      clusterIdentifier: cluster.DBClusters[0].DBClusterIdentifier,
      engine: cluster.DBClusters[0].Engine,
      engineVersion: cluster.DBClusters[0].EngineVersion,
      databaseName: cluster.DBClusters[0].DatabaseName || null,
      storageEncrypted: cluster.DBClusters[0].StorageEncrypted === true,
      deletionProtection: cluster.DBClusters[0].DeletionProtection === true,
      vpcSecurityGroupIds: (cluster.DBClusters[0].VpcSecurityGroups || []).map((group) => group.VpcSecurityGroupId),
    }
  : null;

if (!clusterSummary) {
  failures.push(`${baseline.database.cluster_identifier}: cluster is not readable`);
} else {
  if (clusterSummary.engine !== baseline.database.engine) {
    failures.push(
      `${baseline.database.cluster_identifier}: engine is ${clusterSummary.engine}, expected ${baseline.database.engine}`
    );
  }
  if (clusterSummary.databaseName !== baseline.database.database_name) {
    failures.push(
      `${baseline.database.cluster_identifier}: database name is ${clusterSummary.databaseName || 'missing'}, expected ${baseline.database.database_name}`
    );
  }
  for (const sgId of baseline.rotation_lambda.required_security_group_ids) {
    if (!clusterSummary.vpcSecurityGroupIds.includes(sgId)) {
      failures.push(`${baseline.database.cluster_identifier}: missing expected security group ${sgId}`);
    }
  }
}

const secretDescription = safeAwsJson(
  ['secretsmanager', 'describe-secret', '--secret-id', baseline.database.secret_id],
  'could not describe DB credential secret'
);
const secretValue = safeAwsJson(
  ['secretsmanager', 'get-secret-value', '--secret-id', baseline.database.secret_id],
  'could not read DB credential secret for shape validation'
);
const secretJson = parseSecretString(secretValue);

const secretShape = secretJson
  ? {
      keys: Object.keys(secretJson).sort(),
      engine: secretJson.engine || null,
      hasHost: Boolean(secretJson.host),
      hasUsername: Boolean(secretJson.username),
      hasPassword: Boolean(secretJson.password),
      dbname: secretJson.dbname || null,
      port: secretJson.port || null,
    }
  : null;

if (secretDescription) {
  if (secretDescription.RotationEnabled === true) {
    const days = secretDescription.RotationRules?.AutomaticallyAfterDays || null;
    if (days && days > baseline.database.rotation_days) {
      failures.push(`database_credentials: rotation interval is ${days} days, expected <= ${baseline.database.rotation_days}`);
    }
  } else {
    warnings.push('database_credentials: Secrets Manager rotation is not enabled yet');
  }
}

if (secretShape) {
  for (const key of baseline.database.required_secret_keys) {
    if (!Object.hasOwn(secretJson, key)) {
      failures.push(`database_credentials: secret JSON is missing required key ${key}`);
    }
  }
  if (!baseline.database.acceptable_secret_engines.includes(secretShape.engine)) {
    failures.push(
      `database_credentials: secret engine is ${secretShape.engine || 'missing'}, expected one of ${baseline.database.acceptable_secret_engines.join(', ')}`
    );
  }
  if (secretShape.dbname !== baseline.database.database_name) {
    failures.push(
      `database_credentials: secret dbname is ${secretShape.dbname || 'missing'}, expected ${baseline.database.database_name}`
    );
  }
}

const lambdas = safeAwsJson(['lambda', 'list-functions'], 'could not list Lambda functions');
const rotationFunctions = summarizeRotationFunctions(lambdas?.Functions || []);
const expectedRotationFunction = rotationFunctions.find((fn) =>
  fn.functionName?.startsWith(baseline.rotation_lambda.expected_name_prefix)
);
if (!expectedRotationFunction) {
  failures.push(
    `rotation_lambda: no function found with expected prefix ${baseline.rotation_lambda.expected_name_prefix}`
  );
}
for (const fn of rotationFunctions) {
  for (const subnetId of baseline.rotation_lambda.required_subnet_ids) {
    if (!fn.subnetIds.includes(subnetId)) {
      failures.push(`${fn.functionName}: rotation Lambda is missing expected subnet ${subnetId}`);
    }
  }
  for (const sgId of baseline.rotation_lambda.required_security_group_ids) {
    if (!fn.securityGroupIds.includes(sgId)) {
      failures.push(`${fn.functionName}: rotation Lambda is missing expected security group ${sgId}`);
    }
  }
}

const sarApp = safeAwsJson(
  ['serverlessrepo', 'get-application', '--application-id', baseline.rotation_lambda.serverless_application_arn],
  `could not verify SAR app ${baseline.rotation_lambda.expected_template}`,
  baseline.rotation_lambda.serverless_application_region
);
if (!sarApp) {
  failures.push(`rotation_lambda: SAR app ${baseline.rotation_lambda.expected_template} is not readable`);
}

const summary = {
  region,
  strict,
  database: clusterSummary,
  secret: secretDescription
    ? {
        name: secretDescription.Name,
        rotationEnabled: secretDescription.RotationEnabled === true,
        rotationDays: secretDescription.RotationRules?.AutomaticallyAfterDays || null,
        kmsKeyId: secretDescription.KmsKeyId || null,
      }
    : null,
  secretShape,
  rotationFunctions,
  serverlessApplication: sarApp
    ? {
        name: sarApp.Name,
        arn: sarApp.ApplicationId,
        region: baseline.rotation_lambda.serverless_application_region,
      }
    : null,
};

console.log(JSON.stringify(summary, null, 2));

if (warnings.length > 0) {
  console.warn(`\nWarnings:\n- ${warnings.join('\n- ')}`);
}

if (failures.length > 0) {
  const message = `\nDB rotation preflight failures:\n- ${failures.join('\n- ')}`;
  if (strict) {
    console.error(message);
    process.exit(1);
  }
  console.warn(message);
}

console.log('DB rotation preflight audit completed without printing secret values');
