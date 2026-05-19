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
  /removalPolicy:\s*cdk\.RemovalPolicy\.RETAIN/,
  'log retention resources should retain log groups on stack deletion'
);

for (const functionName of requiredLambdaFunctions) {
  assert.ok(
    stackSource.includes(`'${functionName}'`),
    `${functionName} should be present in the backend lambdaFunctions inventory`
  );
}

console.log(
  `Observability readiness checks passed: ${requiredLambdaFunctions.length + 1} Lambda log groups`
);
