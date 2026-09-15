// backend/functions/ventus-coworker-unsubscribe/index.mjs
//
// Public opt-out endpoint for Coworker mail, fronted by a Lambda Function URL
// (auth NONE — the HMAC in the token is the authorization).
//
// GET renders a confirmation page; POST performs the opt-out. That split is not
// ceremony: corporate mail gateways and link scanners (Outlook Safe Links among
// them) issue GET requests against every URL in a message, so a GET that
// unsubscribes would opt people out of mail they never opened. The same POST
// handler serves RFC 8058 one-click, which Gmail and Yahoo send with no human
// in the loop and will retry — hence idempotent, which store.suppress is.
//
// Thin adapter: token verification lives in shared/coworker/unsubscribe.mjs and
// the suppression write in shared/coworker/store.mjs, both offline-testable.

import { createSecretsProvider } from '../../shared/platform/secrets.mjs';
import { createCoworkerStore, createDynamoBackend } from '../../shared/coworker/store.mjs';
import { verifyUnsubscribeToken } from '../../shared/coworker/unsubscribe.mjs';

const REGION = process.env.AWS_REGION || 'us-east-1';
const LAMBDA_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-coworker-unsubscribe';
const TABLE_NAME = process.env.COWORKER_TABLE || 'ventus-coworker';
const SECRET_ID = process.env.COWORKER_UNSUBSCRIBE_SECRET_ID || '';
const SUPPORT_ADDRESS = process.env.COWORKER_SUPPORT_ADDRESS || 'hello@ventusai.com';

const getSecrets = SECRET_ID
  ? createSecretsProvider({ secretId: SECRET_ID, region: REGION })
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

export const handler = async (event) => {
  const method = String(event?.requestContext?.http?.method || 'GET').toUpperCase();

  if (method === 'HEAD' || method === 'OPTIONS') {
    return { statusCode: 204, headers: baseHeaders(), body: '' };
  }
  if (method !== 'GET' && method !== 'POST') {
    return page(405, 'Method not allowed', 'Use the link in the email.');
  }

  if (!getSecrets) {
    console.error(`[${LAMBDA_NAME}] COWORKER_UNSUBSCRIBE_SECRET_ID is not set.`);
    return page(500, 'Something went wrong', `Email ${SUPPORT_ADDRESS} and we will action it by hand.`);
  }

  let signingKey;
  try {
    const secrets = await getSecrets();
    signingKey = secrets?.signing_key || secrets?.key;
  } catch (err) {
    console.error(`[${LAMBDA_NAME}] Failed to read signing secret:`, err);
    return page(500, 'Something went wrong', `Email ${SUPPORT_ADDRESS} and we will action it by hand.`);
  }
  if (!signingKey) {
    console.error(`[${LAMBDA_NAME}] Signing secret has no signing_key field.`);
    return page(500, 'Something went wrong', `Email ${SUPPORT_ADDRESS} and we will action it by hand.`);
  }

  const token = resolveToken(event);
  const verdict = verifyUnsubscribeToken({ token, secret: signingKey });
  if (!verdict.valid) {
    // Never echo an address back from an unverified token, and keep the reason
    // out of the page — it only helps someone probing the signature.
    console.warn(`[${LAMBDA_NAME}] Rejected ${method} token: ${verdict.reason}`);
    return page(
      400,
      'This link is not valid',
      `It may have been altered in transit. Email ${SUPPORT_ADDRESS} and we will stop the mail by hand.`
    );
  }

  if (method === 'GET') {
    return confirmPage(verdict.email, token);
  }

  try {
    const store = await getStore();
    const record = await store.suppress({
      email: verdict.email,
      scope: 'proactive',
      reason: 'recipient_request',
      source: 'unsubscribe_link',
    });
    console.log(
      `[${LAMBDA_NAME}] Suppressed ${verdict.email} scope=${record.scope} (token issued ${verdict.issuedAt}).`
    );
  } catch (err) {
    // Surface a 5xx so a one-click POST is retried rather than silently lost.
    console.error(`[${LAMBDA_NAME}] Failed to suppress ${verdict.email}:`, err);
    return page(500, 'Something went wrong', `Email ${SUPPORT_ADDRESS} and we will action it by hand.`);
  }

  return donePage(verdict.email);
};

/**
 * Token from the query string, falling back to a form-encoded body. One-click
 * providers POST to the URL from the header (token in the query); our own
 * confirmation form posts it in both places.
 */
function resolveToken(event) {
  const fromQuery = new URLSearchParams(event?.rawQueryString || '').get('token');
  if (fromQuery) return fromQuery;

  const raw = event?.body;
  if (!raw) return '';
  const decoded = event.isBase64Encoded ? Buffer.from(raw, 'base64').toString('utf8') : raw;
  try {
    return new URLSearchParams(decoded).get('token') || '';
  } catch {
    return '';
  }
}

function baseHeaders() {
  return {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  };
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(title, bodyHtml) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>${esc(title)}</title></head>
<body style="margin:0;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
<div style="max-width:520px;margin:64px auto;padding:32px;background:#fff;border:1px solid #e5e5e5;border-radius:10px;">
<div style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#1e4fd8;margin:0 0 20px;">VENTUS AI</div>
${bodyHtml}
</div></body></html>`;
}

function page(statusCode, title, message) {
  return {
    statusCode,
    headers: baseHeaders(),
    body: shell(
      title,
      `<h1 style="font-size:20px;margin:0 0 12px;">${esc(title)}</h1>
<p style="font-size:14px;line-height:1.55;color:#444;margin:0;">${esc(message)}</p>`
    ),
  };
}

// No `action` on the form so it posts back to this exact URL, query string and
// all; the hidden field covers gateways that strip the query on submit.
function confirmPage(email, token) {
  return {
    statusCode: 200,
    headers: baseHeaders(),
    body: shell(
      'Stop the daily digest',
      `<h1 style="font-size:20px;margin:0 0 12px;">Stop the daily digest?</h1>
<p style="font-size:14px;line-height:1.55;color:#444;margin:0 0 20px;">We will stop sending the morning digest to <strong>${esc(email)}</strong>. If you email the coworker directly it will still reply.</p>
<form method="post">
<input type="hidden" name="token" value="${esc(token)}" />
<button type="submit" style="appearance:none;border:0;border-radius:8px;background:#1e4fd8;color:#fff;font-size:14px;font-weight:600;padding:12px 20px;cursor:pointer;">Stop the daily digest</button>
</form>`
    ),
  };
}

function donePage(email) {
  return {
    statusCode: 200,
    headers: baseHeaders(),
    body: shell(
      'Digest stopped',
      `<h1 style="font-size:20px;margin:0 0 12px;">Done.</h1>
<p style="font-size:14px;line-height:1.55;color:#444;margin:0 0 12px;">We have stopped the daily digest to <strong>${esc(email)}</strong>. Nothing further is needed.</p>
<p style="font-size:14px;line-height:1.55;color:#444;margin:0;">If you want it back on, email ${esc(SUPPORT_ADDRESS)}.</p>`
    ),
  };
}
