import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stackPath = resolve(infraRoot, 'lib', 'ventus-existing-infra-stack.ts');
const stackSource = readFileSync(stackPath, 'utf8');

const requiredLambdaFunctions = [
  'ventus-api',
  'ventus-ingest-transactions',
  'ventus-classify-transactions',
  'ventus-analyze-pillar-transactions',
  'ventus-analyze-lifestyle-signals',
  'ventus-risk-detection',
  'ventus-travel-detection',
];
const requiredDatabaseMetrics = [
  'CPUUtilization',
  'DatabaseConnections',
  'FreeLocalStorage',
  'AuroraReplicaLagMaximum',
  'VolumeBytesUsed',
];

assert.match(
  stackSource,
  /logs\.RetentionDays\.SIX_MONTHS/,
  'backend log retention should be explicitly set to six months'
);
assert.match(
  stackSource,
  /new logs\.LogRetention/,
  'backend log retention should be codified with LogRetention resources'
);
assert.match(
  stackSource,
  /logGroupName:\s*`\/aws\/lambda\/\$\{functionName\}`/,
  'backend Lambda log retention should cover the shared lambdaFunctions inventory'
);
assert.match(
  stackSource,
  /logGroupName:\s*'\/aws\/lambda\/ventus-stuck-job-monitor'/,
  'stuck-job monitor should have explicit CloudWatch Logs retention'
);
assert.match(
  stackSource,
  /logGroupName:\s*'\/aws\/lambda\/ventus-webhook-delivery-monitor'/,
  'webhook delivery monitor should have explicit CloudWatch Logs retention'
);
assert.match(
  stackSource,
  /removalPolicy:\s*cdk\.RemovalPolicy\.RETAIN/,
  'log retention resources should retain log groups on stack deletion'
);

for (const functionName of requiredLambdaFunctions) {
  assert.ok(
    stackSource.includes(`'${functionName}'`),
    `${functionName} should be present in the backend lambdaFunctions inventory`
  );
}

assert.match(
  stackSource,
  /DBClusterIdentifier:\s*resources\.databaseClusterIdentifier/,
  'RDS alarms should target the configured Aurora cluster identifier'
);
for (const metricName of requiredDatabaseMetrics) {
  assert.ok(
    stackSource.includes(`metricName: '${metricName}'`),
    `Aurora readiness metric ${metricName} should be alarmed`
  );
}

assert.match(
  stackSource,
  /new apigateway\.CfnUsagePlan/,
  'API Gateway pilot usage plan should be codified'
);
assert.match(
  stackSource,
  /usagePlanName:\s*'ventus-api-pilot-readiness-plan'/,
  'API Gateway pilot usage plan should have a stable name'
);
assert.match(
  stackSource,
  /apiId:\s*resources\.apiGatewayRestApiId/,
  'API Gateway pilot usage plan should attach to the configured API'
);
assert.match(
  stackSource,
  /stage:\s*resources\.apiGatewayStage/,
  'API Gateway pilot usage plan should attach to the configured stage'
);
assert.match(
  stackSource,
  /rateLimit:\s*25/,
  'API Gateway pilot usage plan should include a steady-state rate limit'
);
assert.match(
  stackSource,
  /burstLimit:\s*50/,
  'API Gateway pilot usage plan should include a burst limit'
);
assert.match(
  stackSource,
  /functionName:\s*'ventus-webhook-delivery-monitor'/,
  'webhook delivery monitor Lambda should be codified'
);
assert.match(
  stackSource,
  /ruleName:\s*'ventus-webhook-delivery-monitor-every-5-minutes'/,
  'webhook delivery monitor schedule should be codified'
);
assert.match(
  stackSource,
  /metricName:\s*'WebhookFailedDeliveries'/,
  'webhook failed deliveries metric should be alarmed'
);

console.log(
  `Observability readiness checks passed: ${requiredLambdaFunctions.length + 2} Lambda log groups, ${requiredDatabaseMetrics.length} Aurora metrics, API usage plan, webhook delivery monitor`
);
