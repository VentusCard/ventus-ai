import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const slasPath = join(backendRoot, 'config', 'pipeline-slas.json');
const stuckJobsSqlPath = join(backendRoot, 'sql', 'stuck-pipeline-runs.sql');
const operatingLoopPath = join(backendRoot, 'shared', 'pilot-operating-loop.mjs');

const REQUIRED_STAGES = [
  'ingested',
  'classified',
  'pillar_analyzed',
  'travel_detected',
  'lifestyle_analyzed',
  'risk_analyzed',
  'complete',
];
const REQUIRED_ALARMS = [
  'lambda_errors_5m',
  'api_5xx_5m',
  'api_latency_p95_ms',
  'queue_oldest_message_seconds',
  'dlq_visible_messages',
  'webhook_failures_5m',
  'stuck_jobs',
];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assertPositiveNumber(value, label) {
  assert.equal(typeof value, 'number', `${label} should be a number`);
  assert.ok(Number.isFinite(value) && value > 0, `${label} should be positive`);
}

function validateSlas(config) {
  assert.equal(typeof config.version, 'string', 'version should be present');
  assert.ok(Array.isArray(config.terminal_statuses), 'terminal_statuses should be an array');
  assert.deepEqual(
    [...config.terminal_statuses].sort(),
    ['complete', 'failed'],
    'terminal_statuses should be complete and failed'
  );
  assertPositiveNumber(config.stuck_job_sla_minutes, 'stuck_job_sla_minutes');

  assert.ok(Array.isArray(config.stages), 'stages should be an array');
  const stageNames = config.stages.map((stage) => stage.name);
  assert.deepEqual(stageNames, REQUIRED_STAGES, 'pipeline stage order drifted');

  const timestampFields = new Set();
  for (const stage of config.stages) {
    assert.equal(typeof stage.timestamp_field, 'string', `${stage.name}.timestamp_field`);
    assert.ok(!timestampFields.has(stage.timestamp_field), `${stage.timestamp_field} is duplicated`);
    timestampFields.add(stage.timestamp_field);
    assert.ok(
      stage.expected_after === null || timestampFields.has(stage.expected_after),
      `${stage.name}.expected_after should reference an earlier timestamp`
    );
    assertPositiveNumber(stage.warn_after_minutes, `${stage.name}.warn_after_minutes`);
    assertPositiveNumber(stage.page_after_minutes, `${stage.name}.page_after_minutes`);
    assert.ok(
      stage.page_after_minutes >= stage.warn_after_minutes,
      `${stage.name}.page_after_minutes should be >= warn_after_minutes`
    );
  }

  assert.ok(config.alarms && typeof config.alarms === 'object', 'alarms should be an object');
  for (const alarmName of REQUIRED_ALARMS) {
    const alarm = config.alarms[alarmName];
    assert.ok(alarm, `${alarmName} alarm config is required`);
    assertPositiveNumber(alarm.threshold, `${alarmName}.threshold`);
    assertPositiveNumber(alarm.evaluation_periods, `${alarmName}.evaluation_periods`);
  }
}

function validateStuckJobsSql(sql, config) {
  assert.match(sql, /FROM\s+pipeline_runs/i, 'stuck jobs SQL should query pipeline_runs');
  assert.match(sql, /status\s+NOT\s+IN\s+\('complete',\s*'failed'\)/i, 'stuck jobs SQL should ignore terminal statuses');
  assert.match(sql, /completed_at\s+IS\s+NULL/i, 'stuck jobs SQL should require completed_at IS NULL');
  assert.match(sql, /ingested_at\s+<\s+NOW\(\)\s+-/i, 'stuck jobs SQL should compare ingested_at to current time');
  assert.match(sql, /:stuck_job_sla_minutes/i, 'stuck jobs SQL should use the SLA placeholder');

  const hasAllStageFields = config.stages
    .map((stage) => stage.timestamp_field)
    .every((field) => sql.includes(field));
  assert.ok(hasAllStageFields, 'stuck jobs SQL should include all configured timestamp fields');
}

function validateOperatingLoop(source) {
  assert.match(source, /assignExperiment/, 'operating loop should assign treatment or holdout before activation');
  assert.match(source, /ledgerRepository\.append/, 'operating loop should persist decision lineage');
  assert.match(source, /deliveryRepository\.reserve/, 'operating loop should reserve connector delivery before side effects');
  assert.match(source, /measurementRepository\.recordOutcome/, 'operating loop should ingest measured outcomes');
  assert.match(source, /summarizeIncrementalLift/, 'operating loop should close the measurement loop');
  assert.match(source, /synthetic evidence cannot activate a connector/, 'synthetic evidence should be activation-blocked');
  assert.match(source, /businessClaimAllowed:\s*false/, 'operating loop should not promote technical evidence into business claims');
}

const config = readJson(slasPath);
validateSlas(config);
validateStuckJobsSql(readFileSync(stuckJobsSqlPath, 'utf8'), config);
validateOperatingLoop(readFileSync(operatingLoopPath, 'utf8'));

console.log(`Pipeline readiness checks passed: ${config.stages.length} stages, ${Object.keys(config.alarms).length} alarms, governed pilot operating loop`);
