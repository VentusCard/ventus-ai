import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Client } from 'pg';
import { emitBatchStuckWebhooks } from './shared/platform/batch-stuck.mjs';
import { createWebhookDispatcher } from './shared/platform/webhooks.mjs';

const fireWebhook = createWebhookDispatcher({ includeUrlInFinalError: false });

const region = process.env.AWS_REGION || 'us-east-2';
const environment = process.env.VENTUS_ENVIRONMENT || 'staging';
const secretId = process.env.RDS_SECRET_ID;
const database = process.env.RDS_DATABASE || 'ventus_bofa';
const snsTopicArn = process.env.SNS_TOPIC_ARN;
const stuckJobSlaMinutes = Number(process.env.STUCK_JOB_SLA_MINUTES || 20);

const secretsClient = new SecretsManagerClient({ region });
const cloudWatchClient = new CloudWatchClient({ region });
const snsClient = new SNSClient({ region });

let cachedSecrets = null;

async function getSecrets() {
  if (cachedSecrets) return cachedSecrets;
  if (!secretId) throw new Error('RDS_SECRET_ID is required');

  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretId })
  );
  cachedSecrets = JSON.parse(response.SecretString);
  return cachedSecrets;
}

async function getDB() {
  const secrets = await getSecrets();
  return new Client({
    host: secrets.host,
    port: secrets.port || 5432,
    database,
    user: secrets.username,
    password: secrets.password,
    ssl: { rejectUnauthorized: false },
  });
}

async function findStuckJobs(db) {
  const result = await db.query(
    `SELECT
       batch_id,
       bank_id,
       customer_id,
       source_file,
       transaction_count,
       status,
       stages_complete,
       error_message,
       ingested_at,
       classified_at,
       pillar_analyzed_at,
       travel_detected_at,
       lifestyle_analyzed_at,
       risk_analyzed_at,
       completed_at,
       ROUND((EXTRACT(EPOCH FROM (NOW() - COALESCE(ingested_at, NOW()))) / 60)::numeric, 2) AS age_minutes,
       CASE
         WHEN classified_at IS NULL THEN 'classified_at'
         WHEN pillar_analyzed_at IS NULL THEN 'pillar_analyzed_at'
         WHEN travel_detected_at IS NULL THEN 'travel_detected_at'
         WHEN lifestyle_analyzed_at IS NULL THEN 'lifestyle_analyzed_at'
         WHEN risk_analyzed_at IS NULL THEN 'risk_analyzed_at'
         WHEN completed_at IS NULL THEN 'completed_at'
         ELSE NULL
       END AS missing_stage
     FROM pipeline_runs
     WHERE status NOT IN ('complete', 'failed')
       AND completed_at IS NULL
       AND ingested_at < NOW() - ($1::int * INTERVAL '1 minute')
     ORDER BY ingested_at ASC
     LIMIT 25`,
    [stuckJobSlaMinutes]
  );

  return result.rows;
}

async function publishMetric(stuckJobCount) {
  await cloudWatchClient.send(
    new PutMetricDataCommand({
      Namespace: 'Ventus/Pipeline',
      MetricData: [
        {
          MetricName: 'StuckPipelineRuns',
          Dimensions: [{ Name: 'Environment', Value: environment }],
          Unit: 'Count',
          Value: stuckJobCount,
        },
      ],
    })
  );
}

async function publishAlert(stuckJobs) {
  if (!snsTopicArn || stuckJobs.length === 0) return;

  const lines = stuckJobs.map(
    (job) =>
      `- batch=${job.batch_id} customer=${job.customer_id} status=${job.status} missing=${job.missing_stage} age=${job.age_minutes}m`
  );

  await snsClient.send(
    new PublishCommand({
      TopicArn: snsTopicArn,
      Subject: `[Ventus ${environment}] ${stuckJobs.length} stuck pipeline run(s)`,
      Message: [
        `Detected ${stuckJobs.length} stuck Ventus pipeline run(s).`,
        `SLA minutes: ${stuckJobSlaMinutes}`,
        '',
        ...lines,
      ].join('\n'),
    })
  );
}

export async function handler() {
  if (!Number.isFinite(stuckJobSlaMinutes) || stuckJobSlaMinutes <= 0) {
    throw new Error('STUCK_JOB_SLA_MINUTES must be a positive number');
  }

  const db = await getDB();
  await db.connect();
  try {
    const stuckJobs = await findStuckJobs(db);
    const batchStuckWebhooksEmitted = await emitBatchStuckWebhooks(
      db,
      stuckJobs,
      fireWebhook,
      stuckJobSlaMinutes
    );
    await publishMetric(stuckJobs.length);
    await publishAlert(stuckJobs);

    console.log(
      JSON.stringify({
        environment,
        stuck_job_sla_minutes: stuckJobSlaMinutes,
        stuck_job_count: stuckJobs.length,
        batch_stuck_webhooks_emitted: batchStuckWebhooksEmitted,
      })
    );

    return {
      ok: true,
      stuck_job_count: stuckJobs.length,
      batch_stuck_webhooks_emitted: batchStuckWebhooksEmitted,
      stuck_jobs: stuckJobs,
    };
  } finally {
    await db.end();
  }
}
