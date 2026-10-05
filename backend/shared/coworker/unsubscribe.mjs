// backend/shared/coworker/unsubscribe.mjs
//
// Opt-out plumbing for Coworker mail. Pure and dependency-free (node:crypto
// only) so the whole opt-out path is offline-testable.
//
// Two decisions worth knowing:
//
//  1. Links are HMAC-signed rather than carrying a bare address. An unsigned
//     ?email= endpoint lets anyone unsubscribe anyone by editing a query
//     string, and the recipient cannot tell the difference between that and a
//     product that silently stopped mailing them.
//
//  2. Suppression carries a scope. An advisor who clicks "unsubscribe" is
//     saying they do not want the daily digest; they are not saying they want
//     to be ignored when they email us. A hard bounce or a spam complaint is
//     different — those mean stop everything. Collapsing the two into one
//     boolean either keeps mailing people who asked us to stop or turns the
//     coworker mute for someone who just wanted less mail.
//
// Tokens do not expire by default. CAN-SPAM requires the opt-out mechanism to
// keep working for at least 30 days after a send, and a dead unsubscribe link
// is worse than no link at all, so callers must opt in to a maxAge.

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Suppression scopes, narrowest first.
 *  - proactive: no digests. Replies to mail they send are still fine.
 *  - all: no mail of any kind. Set by hard bounces and spam complaints.
 */
export const SUPPRESSION_SCOPES = ['proactive', 'all'];

/** Mail kinds a send site can ask about. */
export const MAIL_KINDS = ['proactive', 'reply'];

/**
 * Canonical address form used as the suppression key. Every write and every
 * check has to agree on this, or a suppression silently fails to match and we
 * keep mailing someone who opted out. One definition, imported everywhere.
 */
export function normalizeEmail(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

/**
 * Whether a stored suppression record blocks a given kind of outbound mail.
 * @param {{scope?:string}|null} record
 * @param {'proactive'|'reply'} kind
 */
export function scopeBlocks(record, kind) {
  if (!record) return false;
  if (record.scope === 'all') return true;
  return record.scope === 'proactive' && kind === 'proactive';
}

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

function hmac(payload, secret) {
  return createHmac('sha256', String(secret)).update(payload).digest();
}

/**
 * Sign an opt-out token for one address.
 * @param {{email:string, secret:string, issuedAt?:Date}} opts
 * @returns {string} `<base64url payload>.<base64url signature>`
 */
export function signUnsubscribeToken({ email, secret, issuedAt = new Date() }) {
  const address = normalizeEmail(email);
  if (!address) throw new Error('signUnsubscribeToken requires an email');
  if (!secret) throw new Error('signUnsubscribeToken requires a secret');
  const payload = b64url(JSON.stringify({ e: address, t: issuedAt.getTime() }));
  return `${payload}.${b64url(hmac(payload, secret))}`;
}

/**
 * Verify an opt-out token.
 *
 * The signature is checked before the payload is parsed, so we never run
 * JSON.parse over bytes an attacker controls and we never surface an address
 * from an unauthenticated token.
 *
 * @param {{token:string, secret:string, maxAgeMs?:number, now?:Date}} opts
 *   maxAgeMs 0 (default) means the token never expires.
 * @returns {{valid:boolean, email:string|null, issuedAt:string|null, reason:string|null}}
 */
export function verifyUnsubscribeToken({ token, secret, maxAgeMs = 0, now = new Date() }) {
  if (!secret) throw new Error('verifyUnsubscribeToken requires a secret');

  const raw = String(token ?? '').trim();
  if (!raw) return invalid('missing_token');

  const dot = raw.indexOf('.');
  if (dot <= 0 || dot === raw.length - 1) return invalid('malformed_token');

  const payload = raw.slice(0, dot);
  const provided = Buffer.from(raw.slice(dot + 1), 'base64url');
  const expected = hmac(payload, secret);
  // timingSafeEqual throws on a length mismatch, so screen that first. The
  // length of an HMAC-SHA256 digest is not a secret.
  if (provided.length !== expected.length) return invalid('bad_signature');
  if (!timingSafeEqual(provided, expected)) return invalid('bad_signature');

  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return invalid('malformed_payload');
  }

  const email = normalizeEmail(decoded?.e);
  if (!email) return invalid('malformed_payload');

  const issuedAtMs = Number(decoded?.t);
  const hasIssuedAt = Number.isFinite(issuedAtMs);
  if (maxAgeMs > 0 && hasIssuedAt && now.getTime() - issuedAtMs > maxAgeMs) {
    return invalid('expired');
  }

  return {
    valid: true,
    email,
    issuedAt: hasIssuedAt ? new Date(issuedAtMs).toISOString() : null,
    reason: null,
  };
}

function invalid(reason) {
  return { valid: false, email: null, issuedAt: null, reason };
}

/**
 * Build the one-click opt-out URL for an address.
 * @param {{baseUrl:string, email:string, secret:string, issuedAt?:Date}} opts
 */
export function buildUnsubscribeUrl({ baseUrl, email, secret, issuedAt }) {
  const base = String(baseUrl ?? '').trim();
  if (!base) throw new Error('buildUnsubscribeUrl requires a baseUrl');
  const url = new URL(base);
  url.searchParams.set('token', signUnsubscribeToken({ email, secret, issuedAt }));
  return url.toString();
}

/**
 * RFC 2369 / RFC 8058 opt-out headers.
 *
 * List-Unsubscribe-Post is only emitted alongside an https target, because
 * one-click is defined in terms of a POST to that URL — Gmail and Yahoo issue
 * it with no human involved, which is why the endpoint has to be idempotent.
 *
 * @param {{url?:string, mailto?:string}} opts
 */
export function buildUnsubscribeHeaders({ url, mailto } = {}) {
  const httpsUrl = String(url ?? '').trim();
  const oneClick = /^https:\/\//i.test(httpsUrl);
  const targets = [];
  if (httpsUrl) targets.push(`<${httpsUrl}>`);
  const mail = String(mailto ?? '')
    .trim()
    .replace(/^mailto:/i, '');
  if (mail) targets.push(`<mailto:${mail}>`);
  if (!targets.length) return {};

  return {
    'List-Unsubscribe': targets.join(', '),
    ...(oneClick ? { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } : {}),
  };
}
