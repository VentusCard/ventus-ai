import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Client } from 'pg';

const region = process.env.AWS_REGION || 'us-east-2';
const environment = process.env.VENTUS_ENVIRONMENT || 'staging';
const secretId = process.env.RDS_SECRET_ID;
const database = process.env.RDS_DATABASE || 'ventus_bofa';
const snsTopicArn = process.env.SNS_TOPIC_ARN;
const lookbackMinutes = Number(process.env.WEBHOOK_FAILURE_LOOKBACK_MINUTES || 5);
const alertLimit = Number(process.env.WEBHOOK_FAILURE_ALERT_LIMIT || 10);

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

async function findFailedDeliveries(db) {
  const result = await db.query(
    `SELECT
       delivery_id,
       webhook_id,
       bank_id,
       event_type,
       status_code,
       error_message,
       attempt_count,
       replay_of_delivery_id,
       last_attempted_at
     FROM webhook_delivery_attempts
     WHERE status = 'failed'
       AND last_attempted_at >= NOW() - ($1::int * INTERVAL '1 minute')
     ORDER BY last_attempted_at DESC
     LIMIT $2`,
    [lookbackMinutes, alertLimit]
  );

  return result.rows;
}

async function publishMetric(failedDeliveryCount) {
  await cloudWatchClient.send(
    new PutMetricDataCommand({
      Namespace: 'Ventus/Pipeline',
      MetricData: [
        {
          MetricName: 'WebhookFailedDeliveries',
          Dimensions: [{ Name: 'Environment', Value: environment }],
          Unit: 'Count',
          Value: failedDeliveryCount,
        },
      ],
    })
  );
}

async function publishAlert(failedDeliveries) {
  if (!snsTopicArn || failedDeliveries.length === 0) return;

  const lines = failedDeliveries.map(
    (delivery) =>
      `- delivery=${delivery.delivery_id} bank=${delivery.bank_id} event=${delivery.event_type} webhook=${delivery.webhook_id} status_code=${delivery.status_code ?? 'none'} attempts=${delivery.attempt_count} replay_of=${delivery.replay_of_delivery_id ?? 'none'} error=${delivery.error_message ?? 'none'}`
  );

  await snsClient.send(
    new PublishCommand({
      TopicArn: snsTopicArn,
      Subject: `[Ventus ${environment}] ${failedDeliveries.length} failed webhook delivery(s)`,
      Message: [
        `Detected ${failedDeliveries.length} failed Ventus webhook delivery attempt(s).`,
        `Lookback minutes: ${lookbackMinutes}`,
        '',
        ...lines,
      ].join('\n'),
    })
  );
}

export async function handler() {
  if (!Number.isFinite(lookbackMinutes) || lookbackMinutes <= 0) {
    throw new Error('WEBHOOK_FAILURE_LOOKBACK_MINUTES must be a positive number');
  }
  if (!Number.isFinite(alertLimit) || alertLimit <= 0) {
    throw new Error('WEBHOOK_FAILURE_ALERT_LIMIT must be a positive number');
  }

  const db = await getDB();
  await db.connect();
  try {
    const failedDeliveries = await findFailedDeliveries(db);
    await publishMetric(failedDeliveries.length);
    await publishAlert(failedDeliveries);

    console.log(
      JSON.stringify({
        environment,
        webhook_failure_lookback_minutes: lookbackMinutes,
        failed_delivery_count: failedDeliveries.length,
      })
    );

    return {
      ok: true,
      failed_delivery_count: failedDeliveries.length,
      failed_deliveries: failedDeliveries,
    };
  } finally {
    await db.end();
  }
}
