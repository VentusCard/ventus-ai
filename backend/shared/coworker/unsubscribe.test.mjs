import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  buildUnsubscribeHeaders,
  buildUnsubscribeUrl,
  normalizeEmail,
  scopeBlocks,
  signUnsubscribeToken,
  verifyUnsubscribeToken,
} from './unsubscribe.mjs';

const SECRET = 'test-signing-key-not-a-real-one';

test('normalizeEmail trims and lowercases so a write and a check always agree', () => {
  assert.equal(normalizeEmail('  Zoheb@VentusAI.com '), 'zoheb@ventusai.com');
  assert.equal(normalizeEmail(null), '');
  assert.equal(normalizeEmail(undefined), '');
});

test('token round-trips and returns the normalized address', () => {
  const token = signUnsubscribeToken({ email: 'Dana.Okoro@VentusAI.com', secret: SECRET });
  const verdict = verifyUnsubscribeToken({ token, secret: SECRET });
  assert.equal(verdict.valid, true);
  assert.equal(verdict.email, 'dana.okoro@ventusai.com');
  assert.equal(verdict.reason, null);
});

test('a token signed for one address cannot be edited into another', () => {
  // The whole point of signing: swapping the payload for a different address
  // has to fail rather than unsubscribe someone else.
  const token = signUnsubscribeToken({ email: 'a@ventusai.com', secret: SECRET });
  const forgedPayload = Buffer.from(JSON.stringify({ e: 'b@ventusai.com', t: Date.now() })).toString(
    'base64url'
  );
  const tampered = `${forgedPayload}.${token.split('.')[1]}`;

  const verdict = verifyUnsubscribeToken({ token: tampered, secret: SECRET });
  assert.equal(verdict.valid, false);
  assert.equal(verdict.reason, 'bad_signature');
  assert.equal(verdict.email, null, 'must not surface an address from an unverified token');
});

test('a tampered signature is rejected', () => {
  const token = signUnsubscribeToken({ email: 'a@ventusai.com', secret: SECRET });
  const [payload, sig] = token.split('.');
  const flipped = `${sig.slice(0, -2)}${sig.slice(-2) === 'AA' ? 'BB' : 'AA'}`;
  const verdict = verifyUnsubscribeToken({ token: `${payload}.${flipped}`, secret: SECRET });
  assert.equal(verdict.valid, false);
  assert.equal(verdict.reason, 'bad_signature');
});

test('a token signed with a different key is rejected', () => {
  const token = signUnsubscribeToken({ email: 'a@ventusai.com', secret: 'other-key' });
  const verdict = verifyUnsubscribeToken({ token, secret: SECRET });
  assert.equal(verdict.valid, false);
  assert.equal(verdict.reason, 'bad_signature');
});

test('missing and malformed tokens are rejected without throwing', () => {
  for (const [token, reason] of [
    ['', 'missing_token'],
    [null, 'missing_token'],
    ['nodot', 'malformed_token'],
    ['.sig', 'malformed_token'],
    ['payload.', 'malformed_token'],
  ]) {
    const verdict = verifyUnsubscribeToken({ token, secret: SECRET });
    assert.equal(verdict.valid, false, `expected ${JSON.stringify(token)} to be invalid`);
    assert.equal(verdict.reason, reason);
  }
});

test('a correctly signed token whose payload is not JSON is rejected', () => {
  // Signature valid, payload garbage: proves the signature check runs first and
  // the JSON parse is guarded rather than throwing a 500 at a recipient.
  const payload = Buffer.from('not-json').toString('base64url');
  const sig = createHmac('sha256', SECRET).update(payload).digest().toString('base64url');
  const verdict = verifyUnsubscribeToken({ token: `${payload}.${sig}`, secret: SECRET });
  assert.equal(verdict.valid, false);
  assert.equal(verdict.reason, 'malformed_payload');
});

test('tokens do not expire by default, and do expire when a maxAge is set', () => {
  const issuedAt = new Date('2026-01-01T00:00:00.000Z');
  const token = signUnsubscribeToken({ email: 'a@ventusai.com', secret: SECRET, issuedAt });
  const muchLater = new Date('2027-06-01T00:00:00.000Z');

  // CAN-SPAM expects the opt-out to keep working for at least 30 days after a
  // send, and a dead unsubscribe link is worse than no link at all.
  assert.equal(
    verifyUnsubscribeToken({ token, secret: SECRET, now: muchLater }).valid,
    true,
    'default must not expire'
  );

  const expired = verifyUnsubscribeToken({
    token,
    secret: SECRET,
    now: muchLater,
    maxAgeMs: 86_400_000,
  });
  assert.equal(expired.valid, false);
  assert.equal(expired.reason, 'expired');
});

test('buildUnsubscribeUrl preserves the base path and adds a verifiable token', () => {
  const url = buildUnsubscribeUrl({
    baseUrl: 'https://abc123.lambda-url.us-east-1.on.aws/',
    email: 'dana@ventusai.com',
    secret: SECRET,
  });
  const parsed = new URL(url);
  assert.equal(parsed.origin, 'https://abc123.lambda-url.us-east-1.on.aws');
  assert.equal(parsed.pathname, '/');

  const verdict = verifyUnsubscribeToken({
    token: parsed.searchParams.get('token'),
    secret: SECRET,
  });
  assert.equal(verdict.valid, true);
  assert.equal(verdict.email, 'dana@ventusai.com');
});

test('one-click headers are emitted only alongside an https target', () => {
  const https = buildUnsubscribeHeaders({ url: 'https://example.com/u?token=x' });
  assert.equal(https['List-Unsubscribe'], '<https://example.com/u?token=x>');
  assert.equal(https['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');

  // RFC 8058 one-click is defined as a POST to an https URI. Claiming it over
  // plain http invites a provider to POST somewhere unencrypted.
  const insecure = buildUnsubscribeHeaders({ url: 'http://example.com/u' });
  assert.equal(insecure['List-Unsubscribe'], '<http://example.com/u>');
  assert.equal(insecure['List-Unsubscribe-Post'], undefined);

  const mailOnly = buildUnsubscribeHeaders({ mailto: 'mailto:unsub@ventusai.com' });
  assert.equal(mailOnly['List-Unsubscribe'], '<mailto:unsub@ventusai.com>');
  assert.equal(mailOnly['List-Unsubscribe-Post'], undefined);

  const both = buildUnsubscribeHeaders({
    url: 'https://example.com/u',
    mailto: 'unsub@ventusai.com',
  });
  assert.equal(both['List-Unsubscribe'], '<https://example.com/u>, <mailto:unsub@ventusai.com>');

  assert.deepEqual(buildUnsubscribeHeaders(), {});
  assert.deepEqual(buildUnsubscribeHeaders({}), {});
});

test('scopeBlocks distinguishes "stop the digest" from "stop everything"', () => {
  assert.equal(scopeBlocks(null, 'proactive'), false);
  assert.equal(scopeBlocks(null, 'reply'), false);

  // An advisor who unsubscribed from the digest still gets replies to mail they
  // send. Treating that as silence makes the coworker look broken to them.
  assert.equal(scopeBlocks({ scope: 'proactive' }, 'proactive'), true);
  assert.equal(scopeBlocks({ scope: 'proactive' }, 'reply'), false);

  assert.equal(scopeBlocks({ scope: 'all' }, 'proactive'), true);
  assert.equal(scopeBlocks({ scope: 'all' }, 'reply'), true);
});

test('signing requires an email and a secret', () => {
  assert.throws(() => signUnsubscribeToken({ email: '', secret: SECRET }), /requires an email/);
  assert.throws(() => signUnsubscribeToken({ email: 'a@b.com', secret: '' }), /requires a secret/);
  assert.throws(() => verifyUnsubscribeToken({ token: 'x.y', secret: '' }), /requires a secret/);
});
