// backend/functions/ventus-coworker-ses-events/index.mjs
//
// Consumes the SES configuration-set event stream (bounces, complaints,
// rejects, delivery delays) off SNS and turns the permanent ones into
// suppressions.
//
// Why this exists: the stack already routed these events to a topic that
// emails an operator. An alert is not a control — it tells a human that a spam
// complaint happened and then sends the next digest to the same address
// tomorrow. AWS expects a mechanical process once an account leaves the SES
// sandbox, and a complaint rate walking toward 0.5% is an account-level
// sending suspension rather than a Coworker bug.
//
// Thin adapter: the suppress-or-not policy lives in shared/coworker/ses-events.mjs.

import { createCoworkerStore, createDynamoBackend } from '../../shared/coworker/store.mjs';
import { planSuppressions } from '../../shared/coworker/ses-events.mjs';

const LAMBDA_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-coworker-ses-events';
const TABLE_NAME = process.env.COWORKER_TABLE || 'ventus-coworker';

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
  let suppressed = 0;
  let ignored = 0;

  for (const notification of extractNotifications(event)) {
    for (const action of planSuppressions(notification)) {
      if (!action.suppress) {
        console.log(
          `[${LAMBDA_NAME}] ${action.kind} for ${action.email || 'unknown recipient'}: no suppression (${action.reason}).`
        );
        ignored += 1;
        continue;
      }
      // Let a failure throw so SNS retries and then dead-letters. Swallowing it
      // would drop the one event that must not be dropped.
      await store.suppress({
        email: action.email,
        scope: 'all',
        reason: action.reason,
        source: 'ses_event',
      });
      console.log(`[${LAMBDA_NAME}] Suppressed ${action.email} scope=all (${action.reason}).`);
      suppressed += 1;
    }
  }

  return { suppressed, ignored };
};

/** SNS-wrapped SES notifications arrive under event.Records[].Sns.Message. */
function extractNotifications(event) {
  if (event?.eventType || event?.notificationType) return [event];
  if (!Array.isArray(event?.Records)) return [];
  const out = [];
  for (const record of event.Records) {
    const raw = record?.Sns?.Message;
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw));
    } catch {
      console.warn(`[${LAMBDA_NAME}] Skipping SNS message that is not JSON.`);
    }
  }
  return out;
}
