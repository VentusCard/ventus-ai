import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildThreadingHeaders,
  canReceiveProactiveMail,
  checkAllowlist,
  friendlyFrom,
  isAutomatedMessage,
  newMessageId,
  parseInboundEmail,
  resolveThreadId,
} from './mail.mjs';
import { createFixturePortfolioProvider } from './portfolio-provider.mjs';

function msg(headers, { from = 'dana.okoro@ventusai.com', body = 'hello' } = {}) {
  const lines = [`From: ${from}`, 'To: coworker@ventusai.com', 'Subject: hi'];
  for (const [k, v] of Object.entries(headers)) lines.push(`${k}: ${v}`);
  lines.push('', body);
  return parseInboundEmail(lines.join('\n'));
}

test('two sends of the same digest are two messages, not one', () => {
  // Same advisor, same day, same turn: the thread id is deliberately stable,
  // so if the Message-ID were a pure function of it, a second send on a demo
  // morning would carry an id the client has already filed and disappear into
  // the first conversation.
  const args = { threadId: 'digest_adv_zoheb_2026-09-25', turn: 1, domain: 'demo.ventusai.com' };
  const first = buildThreadingHeaders(args)['Message-ID'];
  const second = buildThreadingHeaders(args)['Message-ID'];
  assert.notEqual(first, second);
});

test('a reply still chains back to its thread despite the unique id', () => {
  const threadId = 'digest_adv_zoheb_2026-09-25';
  const messageId = newMessageId(threadId, 1, 'demo.ventusai.com');
  // Through the parser rather than hand-built: resolveThreadId is only ever
  // handed headers that parseInboundEmail has already unwrapped, and a test
  // that passes the angle brackets straight through is testing a shape that
  // never occurs.
  const reply = msg({ 'In-Reply-To': messageId, References: messageId });
  assert.equal(resolveThreadId(reply), threadId);
});

test('a normal human message is not automated', () => {
  assert.equal(isAutomatedMessage(msg({})).automated, false);
});

test('Auto-Submitted marks automated unless it is "no"', () => {
  assert.equal(isAutomatedMessage(msg({ 'Auto-Submitted': 'auto-replied' })).automated, true);
  assert.equal(isAutomatedMessage(msg({ 'Auto-Submitted': 'no' })).automated, false);
});

test('bulk / list precedence is automated', () => {
  assert.equal(isAutomatedMessage(msg({ Precedence: 'bulk' })).automated, true);
  assert.equal(isAutomatedMessage(msg({ Precedence: 'list' })).automated, true);
});

test('mailing-list headers are automated', () => {
  assert.equal(isAutomatedMessage(msg({ 'List-Id': '<news.example.com>' })).automated, true);
  assert.equal(isAutomatedMessage(msg({ 'List-Unsubscribe': '<mailto:x>' })).automated, true);
});

test('microsoft auto-response suppression is automated', () => {
  assert.equal(isAutomatedMessage(msg({ 'X-Auto-Response-Suppress': 'All' })).automated, true);
});

test('null return-path (bounce) is automated', () => {
  assert.equal(isAutomatedMessage(msg({ 'Return-Path': '<>' })).automated, true);
});

test('no-reply / mailer-daemon senders are automated', () => {
  assert.equal(isAutomatedMessage(msg({}, { from: 'no-reply@marketing.com' })).automated, true);
  assert.equal(isAutomatedMessage(msg({}, { from: 'noreply@marketing.com' })).automated, true);
  assert.equal(isAutomatedMessage(msg({}, { from: 'MAILER-DAEMON@mx.example.com' })).automated, true);
  assert.equal(isAutomatedMessage(msg({}, { from: 'postmaster@example.com' })).automated, true);
});

test('reason is populated for logging', () => {
  assert.match(isAutomatedMessage(msg({ Precedence: 'bulk' })).reason, /precedence/);
});

// --- proactive mail gate -----------------------------------------------------

test('a persona with no mailbox behind the address is never mailed proactively', () => {
  assert.equal(canReceiveProactiveMail({ email: 'a@b.com', mailbox: 'fictional' }), false);
  assert.equal(canReceiveProactiveMail({ email: 'a@b.com' }), true);
  assert.equal(canReceiveProactiveMail({}), false);
  assert.equal(canReceiveProactiveMail(null), false);
});

test('a persona stays on the allowlist even though we do not mail them', () => {
  // The two gates are independent on purpose. Replying to a message someone
  // actually sent is always fine; the mailbox flag only governs mail we
  // originate. Conflating them would break inbound demo replies.
  const provider = createFixturePortfolioProvider();
  const advisors = provider.getAdvisors();
  const persona = advisors.find((a) => a.mailbox === 'fictional');
  assert.ok(persona, 'the demo book should contain at least one persona advisor');

  const { allowed, advisor } = checkAllowlist(persona.email, advisors);
  assert.equal(allowed, true);
  assert.equal(advisor.id, persona.id);
  assert.equal(canReceiveProactiveMail(persona), false);
});

test('the demo book mails only addresses with a mailbox behind them', () => {
  // These two addresses hard-bounced on 2026-08-31 and sit on the SES
  // account suppression list. On a daily digest that is a standing charge
  // against sending reputation, so the fixture must keep them flagged.
  const provider = createFixturePortfolioProvider();
  const mailed = provider.getAdvisors().filter(canReceiveProactiveMail).map((a) => a.email);
  assert.ok(!mailed.includes('dana.okoro@ventusai.com'));
  assert.ok(!mailed.includes('marcus.reyes@ventusai.com'));
  assert.ok(mailed.length >= 1, 'someone real has to receive the digest');
});

// --- sender display name -----------------------------------------------------

test('friendlyFrom attaches a display name without double-wrapping', () => {
  assert.equal(
    friendlyFrom('coworker@ventusai.com', 'Ventus AI Coworker'),
    '"Ventus AI Coworker" <coworker@ventusai.com>'
  );
  // A configured COWORKER_FROM may already carry a display name; wrapping it
  // again would produce a From header no client can parse.
  assert.equal(friendlyFrom('"X" <a@b.com>', 'Ventus AI Coworker'), '"X" <a@b.com>');
  assert.equal(friendlyFrom('a@b.com', ''), 'a@b.com');
  assert.equal(friendlyFrom('', 'Ventus AI Coworker'), '');
  assert.equal(friendlyFrom('a@b.com', 'Ventus "AI" Coworker'), '"Ventus \\"AI\\" Coworker" <a@b.com>');
});
