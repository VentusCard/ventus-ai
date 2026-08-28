import assert from 'node:assert/strict';
import test from 'node:test';
import { createFixturePortfolioProvider } from './portfolio-provider.mjs';
import { createCoworkerStore, createInMemoryBackend } from './store.mjs';
import { runCoworkerTurn } from './core.mjs';

const provider = createFixturePortfolioProvider();
const clock = () => new Date('2026-02-01T12:00:00.000Z');

function intentGateway(intent) {
  return {
    async chatCompletion() {
      return {
        response: {
          ok: true,
          async json() {
            return {
              choices: [
                { message: { tool_calls: [{ function: { arguments: JSON.stringify(intent) } }] } },
              ],
            };
          },
        },
      };
    },
  };
}

function rawEmail({ from, subject, body, messageId = '<m1@mail>' }) {
  return [
    `From: ${from}`,
    `To: coworker@ventusai.com`,
    `Subject: ${subject}`,
    `Message-ID: ${messageId}`,
    '',
    body,
  ].join('\n');
}

test('unknown sender is rejected before any work', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({ from: 'stranger@example.com', subject: 'hi', body: 'hello' }),
    provider,
    gateway: intentGateway({ task_type: 'audience_build', product_id: 'travel-card', confidence: 0.9 }),
    store,
    clock,
  });
  assert.equal(res.allowed, false);
  assert.equal(res.reason, 'sender_not_on_allowlist');
  assert.equal(res.reply, null);
  assert.equal((await store.listTurns('anything')).length, 0);
});

test('audience_build turn replies with the ranked table and persists turns + task', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'Dana Okoro <dana.okoro@ventusai.com>',
      subject: 'Who should I pitch the travel card to?',
      body: 'Build me an audience for the travel card.',
    }),
    provider,
    gateway: intentGateway({ task_type: 'audience_build', product_id: 'travel-card', confidence: 0.92 }),
    store,
    clock,
  });

  assert.equal(res.allowed, true);
  assert.equal(res.advisorId, 'adv_okoro');
  assert.equal(res.task.task_type, 'audience_build');
  assert.match(res.reply.subject, /^Re: /);
  assert.match(res.reply.html, /Okafor Household/);
  assert.match(res.reply.html, /third-party modeled/);
  assert.match(res.reply.html, /Next:/);
  assert.ok(res.reply.headers['Message-ID']);

  const turns = await store.listTurns(res.threadId);
  assert.equal(turns.length, 2);
  assert.deepEqual(
    turns.map((t) => t.direction),
    ['inbound', 'outbound']
  );
  const tasks = await store.listTasks(res.threadId);
  assert.equal(tasks[0].task_type, 'audience_build');
  assert.equal(tasks[0].status, 'completed');
});

test('audience_build without a product asks for clarification', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'audience',
      body: 'build me an audience',
    }),
    provider,
    gateway: intentGateway({ task_type: 'audience_build', product_id: null, confidence: 0.6 }),
    store,
    clock,
  });
  assert.equal(res.task.status, 'needs_input');
  assert.match(res.reply.html, /which product/i);
});

test('evidence turn returns modeled signals for a household', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const res = await runCoworkerTurn({
    raw: rawEmail({
      from: 'dana.okoro@ventusai.com',
      subject: 'what do we know',
      body: 'what do we know about the Bianchi household',
    }),
    provider,
    gateway: intentGateway({ task_type: 'evidence', household_id: 'hh_bianchi', confidence: 0.8 }),
    store,
    clock,
  });
  assert.equal(res.task.task_type, 'evidence');
  assert.match(res.reply.html, /Bianchi Household/);
  assert.match(res.reply.html, /third-party modeled|Signals \(modeled\)/);
});
