// backend/functions/ventus-coworker-inbound/index.mjs
//
// Inbound Coworker Lambda. Triggered by SES inbound receipt -> SNS. SES writes
// the raw MIME to S3 and publishes a "Received" notification; this handler pulls
// the raw message, runs one agent turn, and sends the reply via SES.
//
// This is a THIN adapter. All reasoning lives in shared/coworker/core.mjs so it
// stays offline-testable; the handler only does AWS I/O (S3 get, SES send) and
// dependency wiring.

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { createModelGateway } from '../../shared/model-gateway.mjs';
import { createSecretsProvider, resolveSecretId } from '../../shared/secrets.mjs';
import { createFixturePortfolioProvider } from '../../shared/coworker/portfolio-provider.mjs';
import { createCoworkerStore, createDynamoBackend } from '../../shared/coworker/store.mjs';
import { runCoworkerTurn } from '../../shared/coworker/core.mjs';

const REGION = process.env.AWS_REGION || 'us-east-2';
const LAMBDA_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-coworker-inbound';

const TABLE_NAME = process.env.COWORKER_TABLE || 'ventus-coworker';
const INBOUND_BUCKET = process.env.COWORKER_INBOUND_BUCKET;
const INBOUND_PREFIX = process.env.COWORKER_INBOUND_PREFIX || 'inbound/';
const FROM_ADDRESS = process.env.COWORKER_FROM || 'coworker@ventusai.com';
// When true, skip the SES send and return the rendered reply instead. Lets us
// smoke-test the full reasoning + persistence path before any SES identity is
// verified. Set COWORKER_DRY_RUN=true on the function to enable.
const DRY_RUN = process.env.COWORKER_DRY_RUN === 'true';
// Demo mode: admit senders who are not on the advisor allowlist and reply to
// them as a synthetic advisor over the full demo book. Lets anyone email the
// coworker and get mock-data replies. Keep OFF in production.
const DEMO_OPEN = process.env.COWORKER_DEMO_OPEN === 'true';

const MODEL_PROVIDER_SECRET_ID = resolveSecretId({ envVar: 'MODEL_PROVIDER_SECRET_ID' });
// Read the secret from this Lambda's own region. The shared provider defaults to
// us-east-2, but the coworker stack runs in us-east-1 (SES receiving region) and
// only grants secret/KMS access to the us-east-1 replica, so pin to REGION.
const getModelSecrets = createSecretsProvider({
  secretId: MODEL_PROVIDER_SECRET_ID,
  region: REGION,
});

const s3 = new S3Client({ region: REGION });
const ses = new SESv2Client({ region: REGION });

const modelGateway = createModelGateway({
  getSecrets: getModelSecrets,
  functionName: LAMBDA_NAME,
});

// Provider is v0 fixtures for now; swap for the live provider without touching
// this handler when the pipeline-backed implementation lands.
const provider = createFixturePortfolioProvider();

let storePromise;
function getStore() {
  if (!storePromise) {
    storePromise = createDynamoBackend({ tableName: TABLE_NAME }).then((backend) =>
      createCoworkerStore(backend)
    );
  }
  return storePromise;
}

export const handler = async (event) => {
  const store = await getStore();
  const records = extractRecords(event);
  const results = [];

  for (const record of records) {
    try {
      const raw = await getRawEmail(record);
      if (!raw) {
        console.warn(`[${LAMBDA_NAME}] No raw email resolvable for record; skipping.`);
        continue;
      }

      const turn = await runCoworkerTurn({
        raw,
        provider,
        gateway: modelGateway,
        store,
        demoOpen: DEMO_OPEN,
      });

      if (!turn.allowed) {
        console.log(`[${LAMBDA_NAME}] Rejected sender ${turn.from} (${turn.reason}); no reply sent.`);
        results.push({ allowed: false, from: turn.from });
        continue;
      }

      if (turn.demo) {
        console.log(`[${LAMBDA_NAME}] Demo sender admitted for thread=${turn.threadId} task=${turn.task.task_type}`);
      }

      if (DRY_RUN) {
        console.log(
          `[${LAMBDA_NAME}] DRY_RUN: skipping SES send for thread=${turn.threadId} advisor=${turn.advisorId} task=${turn.task.task_type} status=${turn.task.status}`
        );
        console.log(`[${LAMBDA_NAME}] DRY_RUN reply subject: ${turn.reply.subject}`);
        console.log(`[${LAMBDA_NAME}] DRY_RUN reply html:\n${turn.reply.html}`);
        results.push({
          allowed: true,
          dryRun: true,
          threadId: turn.threadId,
          task: turn.task.task_type,
          subject: turn.reply.subject,
          html: turn.reply.html,
        });
        continue;
      }

      await sendReply(turn.reply);
      console.log(
        `[${LAMBDA_NAME}] Replied thread=${turn.threadId} advisor=${turn.advisorId} task=${turn.task.task_type} status=${turn.task.status}`
      );
      results.push({ allowed: true, threadId: turn.threadId, task: turn.task.task_type });
    } catch (err) {
      console.error(`[${LAMBDA_NAME}] Turn failed:`, err);
      // Surface to Lambda so SNS retry / DLQ policy applies.
      throw err;
    }
  }

  return { processed: results.length, results };
};

/** SNS-wrapped SES notifications arrive under event.Records[].Sns.Message. */
function extractRecords(event) {
  // Direct invocation for local testing: { raw } or { sesNotification }.
  if (event?.raw || event?.sesNotification) return [event];
  if (!Array.isArray(event?.Records)) return [];
  return event.Records.map((r) => {
    if (r.Sns?.Message) {
      try {
        return { sesNotification: JSON.parse(r.Sns.Message) };
      } catch {
        return { rawText: r.Sns.Message };
      }
    }
    return r;
  });
}

/**
 * Resolve the raw MIME for one record. Preference order:
 *  1. Inline raw (local testing).
 *  2. S3 object referenced by the SES receipt action.
 *  3. S3 object at <prefix><messageId> in the configured inbound bucket.
 *  4. Inline `content` on the SES notification (small-message SNS delivery).
 */
async function getRawEmail(record) {
  if (record.raw) return record.raw;
  if (record.rawText) return record.rawText;

  const notification = record.sesNotification;
  if (!notification) return null;

  const action = notification.receipt?.action;
  if (action?.type === 'S3' && action.bucketName && action.objectKey) {
    return getS3Text(action.bucketName, action.objectKey);
  }

  const messageId = notification.mail?.messageId;
  if (INBOUND_BUCKET && messageId) {
    return getS3Text(INBOUND_BUCKET, `${INBOUND_PREFIX}${messageId}`);
  }

  if (notification.content) {
    return Buffer.from(notification.content, 'base64').toString('utf8');
  }
  return null;
}

async function getS3Text(Bucket, Key) {
  const res = await s3.send(new GetObjectCommand({ Bucket, Key }));
  return res.Body.transformToString('utf8');
}

/** Build a raw MIME message with threading headers and send it via SES. */
async function sendReply(reply) {
  const rawMime = buildRawMime({
    from: FROM_ADDRESS,
    to: reply.to,
    subject: reply.subject,
    headers: reply.headers,
    html: reply.html,
  });
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_ADDRESS,
      Destination: { ToAddresses: [reply.to] },
      Content: { Raw: { Data: Buffer.from(rawMime, 'utf8') } },
    })
  );
}

function buildRawMime({ from, to, subject, headers = {}, html }) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
  ];
  for (const [key, value] of Object.entries(headers)) {
    if (value) lines.push(`${key}: ${value}`);
  }
  return `${lines.join('\r\n')}\r\n\r\n${html}`;
}
