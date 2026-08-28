import assert from 'node:assert/strict';
import test from 'node:test';
import { createCoworkerStore, createInMemoryBackend, keys } from './store.mjs';
import { createMemory } from './memory.mjs';

test('in-memory backend put/get/query round-trips and sorts by SK', async () => {
  const be = createInMemoryBackend();
  await be.put({ PK: 'THREAD#t1', SK: 'TURN#2', v: 2 });
  await be.put({ PK: 'THREAD#t1', SK: 'TURN#1', v: 1 });
  await be.put({ PK: 'THREAD#t2', SK: 'TURN#1', v: 9 });

  const one = await be.get('THREAD#t1', 'TURN#1');
  assert.equal(one.v, 1);

  const rows = await be.query({ PK: 'THREAD#t1', SKPrefix: 'TURN#' });
  assert.deepEqual(
    rows.map((r) => r.v),
    [1, 2]
  );
});

test('in-memory backend respects TTL on read', async () => {
  const be = createInMemoryBackend();
  const past = Math.floor(Date.now() / 1000) - 10;
  await be.put({ PK: 'ADVISOR#a', SK: 'MEM#household#x', ttl: past, value: 'stale' });
  assert.equal(await be.get('ADVISOR#a', 'MEM#household#x'), null);
});

test('store appendTurn / listTurns preserves chronological order', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await store.appendTurn({ thread_id: 't1', seq: 1, message_id: 'm1', direction: 'inbound', created_at: '2026-01-01T00:00:00.000Z' });
  await store.appendTurn({ thread_id: 't1', seq: 2, message_id: 'm2', direction: 'outbound', created_at: '2026-01-01T00:00:00.000Z' });
  const turns = await store.listTurns('t1');
  assert.equal(turns.length, 2);
  assert.equal(turns[0].direction, 'inbound');
  assert.equal(turns[1].direction, 'outbound');
});

test('store putTask sets GSI attributes for type/status querying', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await store.putTask({ thread_id: 't1', task_id: 'audience_build.1', task_type: 'audience_build', status: 'completed', created_at: '2026-01-01T00:00:00.000Z' });
  const [task] = await store.listTasks('t1');
  assert.equal(task.GSI1PK, 'TASKTYPE#audience_build');
  assert.match(task.GSI1SK, /^STATUS#completed#/);
});

test('memory scopes hydrate and thread scope has no TTL', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const mem = createMemory(store, 'adv_okoro');
  await mem.remember({ scope: 'household', key: 'hh_okafor', value: { last_task: 'prep' } });
  await mem.remember({ scope: 'thread', key: 't1', value: { note: 'greeted' } });

  const ctx = await mem.hydrate();
  assert.equal(ctx.household.hh_okafor.last_task, 'prep');
  assert.equal(ctx.thread.t1.note, 'greeted');

  const rows = await store.listMemory({ advisorId: 'adv_okoro', scope: 'thread' });
  assert.equal(rows[0].ttl, undefined);
});

test('unknown memory scope throws', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const mem = createMemory(store, 'adv_okoro');
  await assert.rejects(() => mem.remember({ scope: 'nope', key: 'x', value: 1 }));
});

test('keys builders are stable', () => {
  assert.deepEqual(keys.thread('t1'), { PK: 'THREAD#t1', SK: 'META' });
  assert.deepEqual(keys.memory('a', 'household', 'x'), { PK: 'ADVISOR#a', SK: 'MEM#household#x' });
});
