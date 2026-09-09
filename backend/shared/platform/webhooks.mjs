import crypto from 'crypto';

const DEFAULT_MAX_RETRIES = 3;
const ERROR_MESSAGE_LIMIT = 500;

/**
 * Webhook envelope: { event, bank_id, timestamp, delivery_id, data }.
 *
 * Entity events (schema_version 1) — thin ID arrays; load detail via API:
 *   life_event_detected:     life_event_ids[]
 *   behavioral_signal_detected: behavioral_signal_ids[]
 *   risk_detected:           risk_factor_ids[] (high severity, new this run)
 *   trip_detected:           trip_ids[] (new/updated this run)
 *
 * Batch events (schema_version 1):
 *   batch_started | batch_complete | batch_partial | batch_failed | batch_stuck
 */
export function buildWebhookBody({ eventType, bankId, deliveryId, payload }) {
  return JSON.stringify({
    event: eventType,
    bank_id: bankId,
    timestamp: new Date().toISOString(),
    delivery_id: deliveryId,
    data: payload,
  });
}

function truncateErrorMessage(value) {
  if (!value) return null;
  return String(value).slice(0, ERROR_MESSAGE_LIMIT);
}

export async function recordWebhookDelivery({
  db,
  deliveryId,
  webhookId,
  bankId,
  eventType,
  targetUrl,
  payloadBody,
  attemptCount,
  status,
  statusCode = null,
  errorMessage = null,
  replayOfDeliveryId = null,
}) {
  try {
    await db.query(
      `INSERT INTO webhook_delivery_attempts
        (delivery_id, webhook_id, bank_id, event_type, target_url, payload_sha256,
         payload_json, replay_of_delivery_id, attempt_count, status, status_code,
         error_message, last_attempted_at, delivered_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, NOW(),
         CASE WHEN $10 = 'delivered' THEN NOW() ELSE NULL END)
       ON CONFLICT (delivery_id) DO UPDATE
       SET attempt_count = EXCLUDED.attempt_count,
           status = EXCLUDED.status,
           status_code = EXCLUDED.status_code,
           error_message = EXCLUDED.error_message,
           last_attempted_at = EXCLUDED.last_attempted_at,
           delivered_at = EXCLUDED.delivered_at`,
      [
        deliveryId,
        webhookId,
        bankId,
        eventType,
        targetUrl,
        crypto.createHash('sha256').update(payloadBody).digest('hex'),
        payloadBody,
        replayOfDeliveryId,
        attemptCount,
        status,
        statusCode,
        truncateErrorMessage(errorMessage),
      ]
    );
  } catch (err) {
    console.warn('[WEBHOOK] Failed to record delivery attempt:', err.message);
  }
}

export function createWebhookDispatcher({
  maxRetries = DEFAULT_MAX_RETRIES,
  includeUrlInFinalError = true,
} = {}) {
  return async function fireWebhook(db, bankId, eventType, payload) {
    let registrations;
    try {
      const result = await db.query(
        `SELECT webhook_id, url, secret FROM webhook_registrations
         WHERE bank_id = $1 AND is_active = true AND $2 = ANY(events)`,
        [bankId, eventType]
      );
      registrations = result.rows;
    } catch (err) {
      console.warn(`[WEBHOOK] Failed to fetch registrations:`, err.message);
      return;
    }

    if (registrations.length === 0) {
      console.log(`[WEBHOOK] No registrations for ${bankId}:${eventType}`);
      return;
    }

    for (const webhook of registrations) {
      const deliveryId = crypto.randomUUID();
      const body = buildWebhookBody({ eventType, bankId, deliveryId, payload });
      const signature = webhook.secret
        ? crypto.createHmac('sha256', webhook.secret).update(body).digest('hex')
        : null;
      let finalStatusCode = null;
      let finalErrorMessage = null;
      let delivered = false;
      let attempts = 0;

      for (let i = 0; i < maxRetries; i++) {
        attempts = i + 1;
        try {
          const res = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-ventus-event': eventType,
              'x-ventus-delivery-id': deliveryId,
              ...(signature && { 'x-ventus-signature': signature }),
            },
            body,
          });
          finalStatusCode = res.status;
          if (res.ok) {
            console.log(`[WEBHOOK] ✓ Delivered ${eventType} to ${webhook.url}`);
            delivered = true;
            break;
          }
          throw new Error(`HTTP ${res.status}`);
        } catch (err) {
          finalErrorMessage = err.message;
          if (i === maxRetries - 1) {
            const message = includeUrlInFinalError
              ? `[WEBHOOK] Failed after ${maxRetries} attempts to ${webhook.url}:`
              : `[WEBHOOK] Failed after ${maxRetries} attempts:`;
            console.error(message, err.message);
          } else {
            await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
          }
        }
      }

      await recordWebhookDelivery({
        db,
        deliveryId,
        webhookId: webhook.webhook_id,
        bankId,
        eventType,
        targetUrl: webhook.url,
        payloadBody: body,
        attemptCount: attempts,
        status: delivered ? 'delivered' : 'failed',
        statusCode: finalStatusCode,
        errorMessage: delivered ? null : finalErrorMessage,
      });
    }
  };
}
