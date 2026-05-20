import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(
  readFileSync(resolve(infraRoot, 'security', 'tracing-readiness-baseline.json'), 'utf8')
);

const region = optionValue('--region') || process.env.AWS_REGION || baseline.region;
const strict = process.argv.includes('--strict');
const failures = [];
const warnings = [];

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

const identity = safeAwsJson(['sts', 'get-caller-identity'], 'could not read caller identity');
if (identity) {
  console.log(`AWS caller: ${identity.Arn}`);
}

const stage = safeAwsJson(
  [
    'apigateway',
    'get-stage',
    '--rest-api-id',
    baseline.api_gateway.rest_api_id,
    '--stage-name',
    baseline.api_gateway.stage,
  ],
  `could not inspect API Gateway stage ${baseline.api_gateway.stage}`
);

const apiGatewaySummary = stage
  ? {
      stageName: stage.stageName,
      tracingEnabled: Boolean(stage.tracingEnabled),
      hasAccessLogSettings: Boolean(stage.accessLogSettings),
      methodSettingsCount: Object.keys(stage.methodSettings || {}).length,
    }
  : null;

if (!stage) {
  failures.push('API Gateway stage is not readable');
} else {
  if (!stage.tracingEnabled) {
    failures.push(
      `API Gateway stage ${baseline.api_gateway.stage} tracingEnabled is false`
    );
  }
  if (!stage.accessLogSettings) {
    failures.push(
      `API Gateway stage ${baseline.api_gateway.stage} accessLogSettings are missing`
    );
  }
}

const lambdaSummaries = [];
for (const functionName of baseline.lambda_functions) {
  const config = safeAwsJson(
    ['lambda', 'get-function-configuration', '--function-name', functionName],
    `could not inspect Lambda ${functionName}`
  );
  if (!config) {
    failures.push(`${functionName}: Lambda configuration is not readable`);
    continue;
  }

  const tracingMode = config.TracingConfig?.Mode || 'PassThrough';
  if (tracingMode !== baseline.target_lambda_tracing_mode) {
    failures.push(
      `${functionName}: tracing mode is ${tracingMode}, expected ${baseline.target_lambda_tracing_mode}`
    );
  }
  lambdaSummaries.push({
    functionName,
    tracingMode,
  });
}

console.log(
  JSON.stringify(
    {
      region,
      strict,
      apiGateway: apiGatewaySummary,
      lambdas: lambdaSummaries,
    },
    null,
    2
  )
);

if (warnings.length > 0) {
  console.warn(`\nWarnings:\n- ${warnings.join('\n- ')}`);
}

if (failures.length > 0 || (strict && warnings.length > 0)) {
  console.error(`\nTracing readiness audit failed:\n- ${failures.join('\n- ')}`);
  if (strict && warnings.length > 0) {
    console.error(`\nStrict-mode warnings:\n- ${warnings.join('\n- ')}`);
  }
  process.exit(1);
}

console.log(
  `Tracing readiness audit passed for API stage ${baseline.api_gateway.stage} and ${lambdaSummaries.length} Lambda function(s)`
);
