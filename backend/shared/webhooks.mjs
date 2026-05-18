import crypto from 'crypto';

const DEFAULT_MAX_RETRIES = 3;

export function createWebhookDispatcher({
  maxRetries = DEFAULT_MAX_RETRIES,
  includeUrlInFinalError = true,
} = {}) {
  return async function fireWebhook(db, bankId, eventType, payload) {
    let registrations;
    try {
      const result = await db.query(
        `SELECT url, secret FROM webhook_registrations
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

    const body = JSON.stringify({
      event: eventType,
      bank_id: bankId,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    for (const webhook of registrations) {
      const signature = webhook.secret
        ? crypto.createHmac('sha256', webhook.secret).update(body).digest('hex')
        : null;

      for (let i = 0; i < maxRetries; i++) {
        try {
          const res = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(signature && { 'x-ventus-signature': signature }),
            },
            body,
          });
          if (res.ok) {
            console.log(`[WEBHOOK] ✓ Delivered ${eventType} to ${webhook.url}`);
            break;
          }
          throw new Error(`HTTP ${res.status}`);
        } catch (err) {
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
    }
  };
}
