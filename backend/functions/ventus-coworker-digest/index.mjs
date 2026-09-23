// backend/functions/ventus-coworker-digest/index.mjs
//
// Scheduled Coworker digest, triggered daily by EventBridge. For each advisor,
// screen their book for the best opportunity per household and send a proactive
// digest email on a fresh thread. Advisors can reply and the inbound Lambda
// picks the conversation back up.
//
// Daily rather than weekly on purpose: the digest carries an outreach window,
// and a window that shifts by a week between sends is not a window. Daily also
// means a habit, and an advisor who opens it every morning is the whole point.
// The row-quality rules in buildAdvisorDigest are what make a daily send
// tolerable, since they let it say nothing on a day with nothing to say.
//
// Thin adapter: opportunity logic lives in shared/coworker/tasks.mjs; rendering
// in shared/coworker/render.mjs.

import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { createSecretsProvider } from '../../shared/platform/secrets.mjs';
import { createFixturePortfolioProvider } from '../../shared/coworker/portfolio-provider.mjs';
import { createCoworkerStore, createDynamoBackend } from '../../shared/coworker/store.mjs';
import { buildAdvisorDigest, digestSubject } from '../../shared/coworker/tasks.mjs';
import { renderDigestTable, renderShell } from '../../shared/coworker/render.mjs';
import {
  buildThreadingHeaders,
  canReceiveProactiveMail,
  friendlyFrom,
} from '../../shared/coworker/mail.mjs';
import {
  buildUnsubscribeHeaders,
  buildUnsubscribeUrl,
} from '../../shared/coworker/unsubscribe.mjs';
import { pluralize, verbFor } from '../../shared/coworker/labels.mjs';

const REGION = process.env.AWS_REGION || 'us-east-2';
const LAMBDA_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-coworker-digest';

const TABLE_NAME = process.env.COWORKER_TABLE || 'ventus-coworker';
const FROM_ADDRESS = friendlyFrom(
  process.env.COWORKER_FROM || 'coworker@ventusai.com',
  process.env.COWORKER_FROM_NAME || 'Ventus AI Coworker'
);
const CONFIG_SET = process.env.COWORKER_CONFIG_SET || undefined;
const MAX_ITEMS = Number(process.env.COWORKER_DIGEST_MAX_ITEMS || 5);

// How often the same household, and the same pitch to it, may reappear.
//
// Tunable from the environment because the right values depend on the size of
// the book, and getting them wrong is visible within a day. A book of 12 with
// five rows a day exhausts itself in three mornings and then goes quiet, which
// is arithmetically correct and still the wrong demo; a real book of a few
// hundred never runs into the cap at all. Defaults live in timing.mjs.
const CADENCE = {
  ...(process.env.COWORKER_MIN_DAYS_BETWEEN_TOUCHES
    ? { minDaysBetween: Number(process.env.COWORKER_MIN_DAYS_BETWEEN_TOUCHES) }
    : {}),
  ...(process.env.COWORKER_MIN_DAYS_BETWEEN_SAME_PRODUCT
    ? { minDaysBetweenSameProduct: Number(process.env.COWORKER_MIN_DAYS_BETWEEN_SAME_PRODUCT) }
    : {}),
};

// Opt-out wiring. The digest is mail we originate, so it does not go out
// without a working unsubscribe path — see resolveUnsubscribeConfig.
const UNSUBSCRIBE_URL = process.env.COWORKER_UNSUBSCRIBE_URL || '';
const UNSUBSCRIBE_SECRET_ID = process.env.COWORKER_UNSUBSCRIBE_SECRET_ID || '';

const ses = new SESv2Client({ region: REGION });
const provider = createFixturePortfolioProvider();

const getUnsubscribeSecrets = UNSUBSCRIBE_SECRET_ID
  ? createSecretsProvider({ secretId: UNSUBSCRIBE_SECRET_ID, region: REGION })
  : null;

let storePromise;
function getStore() {
  if (!storePromise) {
    storePromise = createDynamoBackend({ tableName: TABLE_NAME }).then((backend) =>
      createCoworkerStore(backend)
    );
  }
  return storePromise;
}

/**
 * Resolve the opt-out base URL and signing key, or null if either is missing.
 *
 * Fail closed on purpose. Degrading to "send it anyway, just without the
 * unsubscribe link" is exactly the state this function exists to prevent, and
 * it fails silently — nobody notices a missing footer link, whereas a digest
 * that stops arriving gets reported within a day.
 */
async function resolveUnsubscribeConfig() {
  if (!UNSUBSCRIBE_URL || !getUnsubscribeSecrets) return null;
  const secrets = await getUnsubscribeSecrets();
  const signingKey = secrets?.signing_key || secrets?.key;
  if (!signingKey) return null;
  return { baseUrl: UNSUBSCRIBE_URL, signingKey };
}

/**
 * @param {object} [event]
 * @param {string|string[]} [event.only] Advisor id or email to mail, instead of
 *   the whole roster. Manual invocation only — the schedule passes no event, so
 *   a scheduled run is unaffected and cannot accidentally narrow itself.
 *
 *   Exists because verifying a change to the digest otherwise means mailing
 *   every colleague on the roster to look at one message.
 */
export const handler = async (event = {}) => {
  const only = [event?.only].flat().filter(Boolean).map((s) => String(s).toLowerCase());
  const targeted = (advisor) =>
    !only.length ||
    only.includes(advisor.id.toLowerCase()) ||
    only.includes((advisor.email || '').toLowerCase());

  const unsubscribe = await resolveUnsubscribeConfig();
  if (!unsubscribe) {
    console.error(
      `[${LAMBDA_NAME}] COWORKER_UNSUBSCRIBE_URL / COWORKER_UNSUBSCRIBE_SECRET_ID are not both resolvable; refusing to send proactive mail without a working opt-out.`
    );
    return { sent: 0, advisors: [], skipped: 'unsubscribe_not_configured' };
  }

  const store = await getStore();
  const institution = provider.getInstitution();
  const domain = institution?.domain || 'ventusai.com';
  const nowIso = new Date().toISOString();

  const sent = [];
  for (const advisor of provider.getAdvisors()) {
    if (!canReceiveProactiveMail(advisor)) {
      console.log(`[${LAMBDA_NAME}] ${advisor.id} has no real mailbox; not mailing.`);
      continue;
    }

    if (!targeted(advisor)) {
      console.log(`[${LAMBDA_NAME}] ${advisor.id} not in the requested target set; not mailing.`);
      continue;
    }

    const { suppressed, record } = await store.isSuppressed(advisor.email, { kind: 'proactive' });
    if (suppressed) {
      console.log(
        `[${LAMBDA_NAME}] ${advisor.email} is suppressed (scope=${record?.scope} reason=${record?.reason}); not mailing.`
      );
      continue;
    }

    // Context and contact history are read per advisor rather than once up
    // front: a book is tens of households, and loading only what this advisor
    // needs keeps a failure for one advisor from touching the others.
    const householdIds = advisor.household_ids || [];
    const [context, touches] = await Promise.all([
      store.getContexts(householdIds),
      store.getTouchSummaries(householdIds, { advisorId: advisor.id }),
    ]);

    const digest = buildAdvisorDigest({
      provider,
      advisorId: advisor.id,
      maxItems: MAX_ITEMS,
      context,
      touches,
      now: new Date(),
      cadence: CADENCE,
    });

    if (digest.context_coverage.covered < digest.context_coverage.of) {
      // Not fatal. Uncovered households fall back to undated timing, which is
      // the pre-context behavior, so the digest is still correct — just less
      // sharply ordered. Worth a line because a coverage gap that persists
      // means the refresh job is not keeping up.
      console.warn(
        `[${LAMBDA_NAME}] ${advisor.id} has context for ${digest.context_coverage.covered}/${digest.context_coverage.of} households.`
      );
    }

    if (!digest.items.length) {
      console.log(
        `[${LAMBDA_NAME}] No opportunities for ${advisor.id}; skipping. ` +
          `(${digest.held.length} held for cadence, ${digest.dropped.expired} expired)`
      );
      continue;
    }

    const threadId = `digest_${advisor.id}_${nowIso.slice(0, 10)}`;
    const unsubscribeUrl = buildUnsubscribeUrl({
      baseUrl: unsubscribe.baseUrl,
      email: advisor.email,
      secret: unsubscribe.signingKey,
    });
    const headers = {
      ...buildThreadingHeaders({ threadId, turn: 1, domain }),
      ...buildUnsubscribeHeaders({ url: unsubscribeUrl }),
    };
    const subject = digestSubject(digest);
    const html = renderShell({
      greeting: `Hi ${firstName(advisor.name)},`,
      paragraphs: [
        `I went through all ${pluralize(digest.considered, 'household')} in your book against the product catalog this morning. ${pluralize(digest.items.length, 'household')} ${verbFor(digest.items.length)} worth your time today, one row each, strongest first.`,
      ],
      sections: [{ heading: 'Today', html: renderDigestTable(digest.items) }],
      forwardMove: 'Reply with a product name and I will screen the whole book against it.',
      unsubscribeUrl,
    });

    try {
      await sendEmail({ to: advisor.email, subject, headers, html });
    } catch (err) {
      console.error(`[${LAMBDA_NAME}] Failed to send digest to ${advisor.email}:`, err);
      continue;
    }

    await persistDigest({ store, advisor, threadId, headers, subject, digest, nowIso });

    // Contact log written only after the send succeeded. Recording a touch for
    // mail that never left would start the cadence clock on a household the
    // advisor never saw, muting it for a week on the strength of a failure.
    for (const item of digest.items) {
      await store.recordTouch({
        householdId: item.household_id,
        advisorId: advisor.id,
        productId: item.product.id,
        channel: 'digest',
        threadId,
      });
    }

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
