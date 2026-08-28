// backend/functions/ventus-coworker-digest/index.mjs
//
// Scheduled Coworker digest. Triggered by EventBridge. For each advisor, scan
// their book for the best modeled opportunity per household and send a proactive
// digest email (a fresh thread). Advisors can reply and the inbound Lambda picks
// the conversation back up.
//
// Thin adapter: opportunity logic lives in shared/coworker/tasks.mjs; rendering
// in shared/coworker/render.mjs.

import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { createFixturePortfolioProvider } from '../../shared/coworker/portfolio-provider.mjs';
import { createCoworkerStore, createDynamoBackend } from '../../shared/coworker/store.mjs';
import { buildAdvisorDigest } from '../../shared/coworker/tasks.mjs';
import { renderDigestTable, renderShell } from '../../shared/coworker/render.mjs';
import { buildThreadingHeaders } from '../../shared/coworker/mail.mjs';

const REGION = process.env.AWS_REGION || 'us-east-2';
const LAMBDA_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-coworker-digest';

const TABLE_NAME = process.env.COWORKER_TABLE || 'ventus-coworker';
const FROM_ADDRESS = process.env.COWORKER_FROM || 'coworker@ventusai.com';
const CONFIG_SET = process.env.COWORKER_CONFIG_SET || undefined;
const MAX_ITEMS = Number(process.env.COWORKER_DIGEST_MAX_ITEMS || 5);

const ses = new SESv2Client({ region: REGION });
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

export const handler = async () => {
  const store = await getStore();
  const institution = provider.getInstitution();
  const domain = institution?.domain || 'ventusai.com';
  const nowIso = new Date().toISOString();

  const sent = [];
  for (const advisor of provider.getAdvisors()) {
    const digest = buildAdvisorDigest({ provider, advisorId: advisor.id, maxItems: MAX_ITEMS });
    if (!digest.items.length) {
      console.log(`[${LAMBDA_NAME}] No opportunities for ${advisor.id}; skipping.`);
      continue;
    }

    const threadId = `digest_${advisor.id}_${nowIso.slice(0, 10)}`;
    const headers = buildThreadingHeaders({ threadId, turn: 1, domain });
    const subject = `Your book: ${digest.items.length} opportunities this cycle`;
    const html = renderShell({
      greeting: `Hi ${firstName(advisor.name)},`,
      paragraphs: [
        `I scanned your book against the product catalog and surfaced the top ${digest.items.length} opportunities, one per household, ranked by modeled annual benefit.`,
      ],
      sections: [{ heading: 'Opportunities', html: renderDigestTable(digest.items) }],
      forwardMove: 'Reply "build audience for <product>" and I\'ll assemble the full outreach list.',
    });

    try {
      await sendEmail({ to: advisor.email, subject, headers, html });
    } catch (err) {
      console.error(`[${LAMBDA_NAME}] Failed to send digest to ${advisor.email}:`, err);
      continue;
    }

    await persistDigest({ store, advisor, threadId, headers, subject, digest, nowIso });
    console.log(`[${LAMBDA_NAME}] Sent digest to ${advisor.email} (${digest.items.length} items).`);
    sent.push({ advisorId: advisor.id, items: digest.items.length });
  }

  return { sent: sent.length, advisors: sent };
};

async function persistDigest({ store, advisor, threadId, headers, subject, digest, nowIso }) {
  await store.upsertThread({
    thread_id: threadId,
    advisor_id: advisor.id,
    subject,
    last_task_type: 'digest',
    updated_at: nowIso,
    kind: 'digest',
  });
  await store.appendTurn({
    thread_id: threadId,
    seq: 1,
    message_id: stripAngle(headers['Message-ID']),
    direction: 'outbound',
    advisor_id: advisor.id,
    to: advisor.email,
    subject,
    summary: `digest: ${digest.items.length} opportunities`,
    created_at: nowIso,
  });
  await store.putTask({
    thread_id: threadId,
    task_id: 'digest.1',
    task_type: 'digest',
    status: 'completed',
    advisor_id: advisor.id,
    result: digest,
    created_at: nowIso,
  });
}

async function sendEmail({ to, subject, headers, html }) {
  const rawMime = buildRawMime({ from: FROM_ADDRESS, to, subject, headers, html });
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_ADDRESS,
      Destination: { ToAddresses: [to] },
      Content: { Raw: { Data: Buffer.from(rawMime, 'utf8') } },
      ...(CONFIG_SET ? { ConfigurationSetName: CONFIG_SET } : {}),
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

function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'there';
}

function stripAngle(id) {
  return String(id || '').replace(/^<|>$/g, '');
}
