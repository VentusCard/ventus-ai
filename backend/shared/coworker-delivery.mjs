import { createHash } from 'node:crypto';
import { buildBriefingDelivery } from './briefing-delivery.mjs';

export class CoworkerDeliveryError extends Error {
  constructor(message, { code = 'coworker_delivery_failed', terminalFailure = false } = {}) {
    super(message);
    this.name = 'CoworkerDeliveryError';
    this.code = code;
    this.terminalFailure = terminalFailure;
  }
}

/** Server-only Outlook and Slack delivery. Routing is stored in the tenant mapping;
 * OAuth and bot credentials are resolved only from Secrets Manager. */
export function createCoworkerDeliveryService({ getSecrets, deliveryRepository, consoleBaseUrl, fetchImpl = fetch }) {
  if (typeof getSecrets !== 'function') throw new Error('getSecrets is required');
  if (!deliveryRepository || typeof deliveryRepository.reserve !== 'function') throw new Error('deliveryRepository is required');

  return {
    async deliver({ tenantId, channel, role, sessionId, title, counts, decisionIds, mapping }) {
      const briefing = buildBriefingDelivery({
        tenantId,
        briefingId: briefingId(tenantId, channel, title, decisionIds),
        role: normalizeRole(role),
        channel,
        requestedBySessionId: sessionId,
        generatedAt: new Date().toISOString(),
        title,
        counts,
        decisionIds,
      });
      const reservation = await deliveryRepository.reserve(briefing);
      if (!reservation.shouldDeliver) return { replayed: true, receipt: receipt(reservation.record) };
      try {
        const secrets = normalizeSecrets(await getSecrets());
        const result = channel === 'outlook'
          ? await deliverOutlook({ secrets, mapping, briefing, consoleBaseUrl, fetchImpl })
          : await deliverSlack({ secrets, mapping, briefing, consoleBaseUrl, fetchImpl });
        const completed = await deliveryRepository.complete({
          tenantId,
          deliveryId: reservation.record.delivery_id,
          status: 'delivered',
          sessionId,
          externalReceiptId: result.externalReceiptId,
          externalReceiptUrl: result.externalReceiptUrl,
          completedAt: new Date().toISOString(),
        });
        return { replayed: false, receipt: receipt(completed.record) };
      } catch (error) {
        if (error instanceof CoworkerDeliveryError && error.terminalFailure) {
          const completed = await deliveryRepository.complete({
            tenantId,
            deliveryId: reservation.record.delivery_id,
            status: 'failed',
            sessionId,
            errorCode: error.code,
            completedAt: new Date().toISOString(),
          });
          return { replayed: false, receipt: receipt(completed.record) };
        }
        throw error;
      }
    },
  };
}

async function deliverOutlook({ secrets, mapping, briefing, consoleBaseUrl, fetchImpl }) {
  if (!secrets.microsoftTenantId || !secrets.microsoftClientId || !secrets.microsoftClientSecret || !secrets.microsoftSenderUserId) {
    throw new CoworkerDeliveryError('Outlook delivery is not configured for this environment.', { code: 'outlook_unconfigured', terminalFailure: true });
  }
  const recipient = cleanEmail(mapping?.configuration?.recipient);
  if (!recipient) throw new CoworkerDeliveryError('Outlook routing is not active for this institution.', { code: 'outlook_mapping_inactive', terminalFailure: true });
  const tokenResponse = await fetchImpl(`https://login.microsoftonline.com/${encodeURIComponent(secrets.microsoftTenantId)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: secrets.microsoftClientId,
      client_secret: secrets.microsoftClientSecret,
      grant_type: 'client_credentials',
      scope: 'https://graph.microsoft.com/.default',
    }).toString(),
  });
  const token = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || typeof token.access_token !== 'string') {
    throw new CoworkerDeliveryError('Outlook authentication failed.', { code: 'outlook_auth_failed', terminalFailure: true });
  }
  const message = briefingMessage(briefing, consoleBaseUrl);
  const response = await fetchImpl(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(secrets.microsoftSenderUserId)}/sendMail`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          subject: briefing.payload.title,
          body: { contentType: 'HTML', content: message },
          toRecipients: [{ emailAddress: { address: recipient } }],
        },
        saveToSentItems: true,
      }),
    },
  );
  if (!response.ok) {
    throw new CoworkerDeliveryError(`Outlook delivery failed (${response.status}).`, { code: 'outlook_delivery_failed' });
  }
  return { externalReceiptId: `outlook_${briefing.idempotencyKey}` };
}

async function deliverSlack({ secrets, mapping, briefing, consoleBaseUrl, fetchImpl }) {
  if (!secrets.slackBotToken) {
    throw new CoworkerDeliveryError('Slack delivery is not configured for this environment.', { code: 'slack_unconfigured', terminalFailure: true });
  }
  const channelId = cleanIdentifier(mapping?.configuration?.channelId);
  if (!channelId) throw new CoworkerDeliveryError('Slack routing is not active for this institution.', { code: 'slack_mapping_inactive', terminalFailure: true });
  const response = await fetchImpl('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secrets.slackBotToken}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ channel: channelId, text: `${briefing.payload.title}\n${consoleLink(briefing.payload.console_path, consoleBaseUrl)}` }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.ok !== true || typeof body.ts !== 'string') {
    throw new CoworkerDeliveryError('Slack delivery failed.', { code: 'slack_delivery_failed' });
  }
  return {
    externalReceiptId: `slack_${cleanIdentifier(body.channel) || channelId}_${body.ts.replace(/[^0-9.]/g, '')}`.slice(0, 250),
  };
}

function normalizeSecrets(value) {
  const source = value && typeof value === 'object' ? value : {};
  const clean = (item) => typeof item === 'string' && !item.startsWith('CONFIGURE_') ? item.trim() : '';
  return {
    microsoftTenantId: clean(source.microsoftTenantId),
    microsoftClientId: clean(source.microsoftClientId),
    microsoftClientSecret: clean(source.microsoftClientSecret),
    microsoftSenderUserId: clean(source.microsoftSenderUserId),
    slackBotToken: clean(source.slackBotToken),
  };
}

function normalizeRole(role) {
  if (role === 'executive_viewer') return 'executive';
  if (role === 'growth_play_owner' || role === 'bank_operator') return 'consumer_growth';
  return 'wealth_growth';
}

function briefingId(tenantId, channel, title, decisionIds) {
  return `briefing_${createHash('sha256').update(`${tenantId}\u001f${channel}\u001f${title}\u001f${decisionIds.join(',')}`).digest('hex').slice(0, 24)}`;
}

function briefingMessage(briefing, consoleBaseUrl) {
  const counts = briefing.payload.counts;
  return [
    `<p><strong>${escapeHtml(briefing.payload.title)}</strong></p>`,
    `<p>${counts.needs_review} need review · ${counts.routed} routed · ${counts.outcomes_observed} outcomes observed</p>`,
    `<p><a href="${escapeHtml(consoleLink(briefing.payload.console_path, consoleBaseUrl))}">Open Growth Console</a></p>`,
  ].join('');
}

function consoleLink(path, consoleBaseUrl) {
  if (typeof consoleBaseUrl !== 'string' || !/^https:\/\//.test(consoleBaseUrl)) return path;
  return new URL(path, consoleBaseUrl).toString();
}

function receipt(record) {
  return {
    deliveryId: record.delivery_id,
    status: record.status,
    externalReceiptId: record.external_receipt_id ?? null,
    externalReceiptUrl: record.external_receipt_url ?? null,
  };
}

function cleanEmail(value) {
  return typeof value === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? value : '';
}

function cleanIdentifier(value) {
  return typeof value === 'string' && /^[A-Za-z0-9._:-]{2,180}$/.test(value) ? value : '';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
