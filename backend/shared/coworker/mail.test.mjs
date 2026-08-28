import assert from 'node:assert/strict';
import test from 'node:test';
import { isAutomatedMessage, parseInboundEmail } from './mail.mjs';

function msg(headers, { from = 'dana.okoro@ventusai.com', body = 'hello' } = {}) {
  const lines = [`From: ${from}`, 'To: coworker@ventusai.com', 'Subject: hi'];
  for (const [k, v] of Object.entries(headers)) lines.push(`${k}: ${v}`);
  lines.push('', body);
  return parseInboundEmail(lines.join('\n'));
}

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
