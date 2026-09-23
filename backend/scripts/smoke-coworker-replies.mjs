#!/usr/bin/env node
//
// Smoke-test the Coworker reply path against the deployed Lambda.
//
// The digest invites the reader to reply with one of four things. Those four
// paths had no coverage of any kind: the test glob stops at shared/, so the
// handler that receives them was neither unit tested nor exercised before a
// deploy. A one-character shadowing mistake in that handler killed every
// inbound reply for nine days, and nothing noticed, because the failure is
// silent by construction — the sender just never hears back.
//
// This sends four synthetic replies straight at the handler and reports which
// task each was routed to. Run it before any demo.
//
//   node backend/scripts/smoke-coworker-replies.mjs
//   node backend/scripts/smoke-coworker-replies.mjs --from you@example.com
//
// Note it goes through the real handler, so unless the stack is deployed with
// coworkerDryRun=true it really does send four emails to --from.

import { execFile } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

const FUNCTION = process.env.COWORKER_INBOUND_FN || 'ventus-coworker-inbound';
const REGION = process.env.AWS_REGION || 'us-east-1';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const FROM = arg('from', 'zoheb@ventuscard.com');

// The four things the mail tells the reader they can reply with, and the task
// each is expected to route to. Keep this list in step with digestActions: an
// action we advertise and cannot route is worse than one we never offered.
const CASES = [
  { name: 'draft', body: 'Draft the outreach for Castellanos', expect: 'compose_outreach' },
  { name: 'screen', body: 'Screen the book for Travel Cash Rewards Card', expect: 'audience_build' },
  { name: 'prep', body: 'Prep me for a call with Castellanos', expect: 'prep' },
  { name: 'evidence', body: 'What do we know about Castellanos?', expect: 'evidence' },
];

function rawEmail({ name, body }) {
  const stamp = Date.now();
  return [
    `From: Coworker Smoke Test <${FROM}>`,
    'To: Ventus AI Coworker <coworker@demo.ventusai.com>',
    'Subject: Re: Your Daily Digest: 5 households need attention',
    `Message-ID: <smoke-${name}-${stamp}@ventuscard.com>`,
    // A distinct thread per case, so one run cannot be mistaken for a
    // conversation and rate-limited as one.
    `In-Reply-To: <smoke-thread-${name}-${stamp}@ventusai.com>`,
    `Date: ${new Date().toUTCString()}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
    '',
  ].join('\r\n');
}

async function invoke(testCase, dir) {
  const payload = join(dir, `${testCase.name}.json`);
  const out = join(dir, `${testCase.name}.out.json`);
  writeFileSync(payload, JSON.stringify({ raw: rawEmail(testCase) }));
  await run('aws', [
    'lambda', 'invoke',
    '--region', REGION,
    '--function-name', FUNCTION,
    '--cli-binary-format', 'raw-in-base64-out',
    '--payload', `file://${payload}`,
    out,
  ]);
  const { readFileSync } = await import('node:fs');
  return JSON.parse(readFileSync(out, 'utf8'));
}

const dir = mkdtempSync(join(tmpdir(), 'coworker-smoke-'));
let failed = 0;

console.log(`Replying to ${FUNCTION} in ${REGION} as ${FROM}\n`);

for (const testCase of CASES) {
  let line;
  try {
    const res = await invoke(testCase, dir);
    const result = res?.results?.[0];
    const task = result?.task;
    if (res?.errorType) {
      line = `FAIL  ${testCase.name}: handler threw ${res.errorType}: ${res.errorMessage}`;
      failed++;
    } else if (!result?.allowed) {
      line = `FAIL  ${testCase.name}: not allowed (${JSON.stringify(result)})`;
      failed++;
    } else if (task !== testCase.expect) {
      line = `FAIL  ${testCase.name}: routed to ${task}, expected ${testCase.expect}`;
      failed++;
    } else {
      line = `ok    ${testCase.name}: ${task}`;
    }
  } catch (err) {
    line = `FAIL  ${testCase.name}: ${err.message}`;
    failed++;
  }
  console.log(line);
}

console.log(`\n${CASES.length - failed}/${CASES.length} reply paths healthy`);
process.exit(failed ? 1 : 0);
