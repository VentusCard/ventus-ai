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
  assert.deepEqual(keys.rate('a@b.com'), { PK: 'RATE#a@b.com', SK: 'WINDOW' });
});

test('checkAndBumpRate counts within a window and blocks over the limit', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  // Base on the real clock: the in-memory backend enforces TTL against wall time,
  // so the persisted window record must carry a future ttl to stay readable.
  const t0 = new Date();
  const opts = { sender: 'flood@x.com', windowMs: 3600_000, limit: 2 };

  const a = await store.checkAndBumpRate({ ...opts, now: t0 });
  const b = await store.checkAndBumpRate({ ...opts, now: new Date(t0.getTime() + 1000) });
  const c = await store.checkAndBumpRate({ ...opts, now: new Date(t0.getTime() + 2000) });
  assert.deepEqual([a.allowed, b.allowed, c.allowed], [true, true, false]);
  assert.equal(c.count, 3);
});

test('checkAndBumpRate resets after the window elapses', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const t0 = new Date();
  const opts = { sender: 'flood@x.com', windowMs: 1000, limit: 1 };

  const a = await store.checkAndBumpRate({ ...opts, now: t0 });
  const blocked = await store.checkAndBumpRate({ ...opts, now: new Date(t0.getTime() + 500) });
  const afterWindow = await store.checkAndBumpRate({ ...opts, now: new Date(t0.getTime() + 2000) });
  assert.equal(a.allowed, true);
  assert.equal(blocked.allowed, false);
  assert.equal(afterWindow.allowed, true);
  assert.equal(afterWindow.count, 1);
});

test('checkAndBumpRate isolates senders', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const now = new Date();
  const one = await store.checkAndBumpRate({ sender: 'a@x.com', now, limit: 1 });
  const two = await store.checkAndBumpRate({ sender: 'b@x.com', now, limit: 1 });
  assert.equal(one.allowed, true);
  assert.equal(two.allowed, true);
});

test('suppress records an opt-out that matches regardless of address casing', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await store.suppress({ email: '  Dana.Okoro@VentusAI.com ', reason: 'recipient_request' });

  const record = await store.getSuppression('dana.okoro@ventusai.com');
  assert.equal(record.email, 'dana.okoro@ventusai.com');
  assert.equal(record.scope, 'proactive');
  assert.equal(record.entity, 'suppression');
  assert.deepEqual(keys.suppression('DANA.OKORO@ventusai.com'), {
    PK: 'SUPPRESS#dana.okoro@ventusai.com',
    SK: 'META',
  });
});

test('suppress carries no ttl, because an expiring opt-out resumes mailing on its own', async () => {
  const backend = createInMemoryBackend();
  const store = createCoworkerStore(backend);
  await store.suppress({ email: 'a@bank.com' });
  const [record] = backend._dump().filter((r) => r.entity === 'suppression');
  assert.equal(record.ttl, undefined);
});

test('suppress is idempotent and widens scope but never narrows it', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const first = await store.suppress({
    email: 'a@bank.com',
    scope: 'proactive',
    source: 'unsubscribe_link',
    now: new Date('2026-01-01T00:00:00.000Z'),
  });
  const widened = await store.suppress({
    email: 'a@bank.com',
    scope: 'all',
    reason: 'complaint:abuse',
    source: 'ses_event',
    now: new Date('2026-01-02T00:00:00.000Z'),
  });
  // Gmail replays one-click POSTs. A replay after a spam complaint must not
  // narrow the suppression back to "digest only".
  const replayed = await store.suppress({
    email: 'a@bank.com',
    scope: 'proactive',
    source: 'unsubscribe_link',
    now: new Date('2026-01-03T00:00:00.000Z'),
  });

  assert.equal(first.scope, 'proactive');
  assert.equal(widened.scope, 'all');
  assert.equal(replayed.scope, 'all');
  assert.equal(replayed.first_suppressed_at, '2026-01-01T00:00:00.000Z');
  assert.equal(replayed.updated_at, '2026-01-03T00:00:00.000Z');
  assert.equal(replayed.events.length, 3, 'every event is kept for the audit trail');
});

test('isSuppressed gates proactive mail and replies separately', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await store.suppress({ email: 'digest-off@bank.com', scope: 'proactive' });
  await store.suppress({ email: 'complained@bank.com', scope: 'all' });

  assert.equal((await store.isSuppressed('digest-off@bank.com')).suppressed, true);
  assert.equal(
    (await store.isSuppressed('digest-off@bank.com', { kind: 'reply' })).suppressed,
    false,
    'they asked for no digest, not to be ignored when they email us'
  );
  assert.equal((await store.isSuppressed('complained@bank.com', { kind: 'reply' })).suppressed, true);
  assert.equal((await store.isSuppressed('never-heard-of@bank.com')).suppressed, false);
  assert.equal((await store.isSuppressed('')).suppressed, false);
});

test('unsuppress clears an opt-out and reports whether there was one', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await store.suppress({ email: 'a@bank.com' });
  assert.equal(await store.unsuppress('a@bank.com'), true);
  assert.equal(await store.getSuppression('a@bank.com'), null);
  assert.equal(await store.unsuppress('a@bank.com'), false);
  assert.equal(await store.unsuppress(''), false);
});

test('suppress rejects a missing address or an unknown scope', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await assert.rejects(() => store.suppress({ email: '' }), /requires an email/);
  await assert.rejects(
    () => store.suppress({ email: 'a@bank.com', scope: 'sometimes' }),
    /unknown scope/
  );
});

// --- customer context ---------------------------------------------------------

test('a context write lands as both the latest and a dated version', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const snapshot = {
    household_id: 'hh_a',
    advisor_id: 'adv_a',
    refreshed_at: '2026-03-04T11:00:00.000Z',
    signals: [{ key: 'life_event:new_child', first_seen_at: '2026-02-01T11:00:00.000Z' }],
  };
  await store.putContext(snapshot);

  const latest = await store.getContext('hh_a');
  assert.equal(latest.household_id, 'hh_a');
  assert.equal(latest.entity, 'context');

  // The dated copy is what makes a claimed signal age auditable later.
  const versions = await store.listContextVersions('hh_a');
  assert.equal(versions.length, 1);
  assert.equal(versions[0].SK, 'CTXV#2026-03-04');
  assert.ok(versions[0].ttl > Math.floor(Date.now() / 1000));
});

test('two refreshes on the same day overwrite rather than accumulate', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const base = { household_id: 'hh_a', signals: [] };
  await store.putContext({ ...base, refreshed_at: '2026-03-04T11:00:00.000Z', refresh_count: 1 });
  await store.putContext({ ...base, refreshed_at: '2026-03-04T15:00:00.000Z', refresh_count: 2 });

  const versions = await store.listContextVersions('hh_a');
  assert.equal(versions.length, 1, 'a retry must not create a second history entry for the day');
  assert.equal((await store.getContext('hh_a')).refresh_count, 2);
});

test('getContexts skips households that have never been refreshed', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await store.putContext({ household_id: 'hh_a', refreshed_at: '2026-03-04T11:00:00.000Z', signals: [] });
  const map = await store.getContexts(['hh_a', 'hh_missing']);
  assert.equal(map.size, 1);
  assert.equal(map.has('hh_missing'), false);
});

test('putContext refuses a snapshot with no household', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await assert.rejects(() => store.putContext({ signals: [] }), /household_id/);
});

// --- contact log ---------------------------------------------------------------

test('the touch summary reports the latest contact overall and per product', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await store.recordTouch({
    householdId: 'hh_a',
    advisorId: 'adv_a',
    productId: 'travel-card',
    now: new Date('2026-03-01T12:00:00.000Z'),
  });
  await store.recordTouch({
    householdId: 'hh_a',
    advisorId: 'adv_a',
    productId: 'high-yield-savings',
    now: new Date('2026-03-05T12:00:00.000Z'),
  });
  await store.recordTouch({
    householdId: 'hh_a',
    advisorId: 'adv_a',
    productId: 'travel-card',
    now: new Date('2026-03-09T12:00:00.000Z'),
  });

  const summary = await store.getTouchSummary('hh_a');
  assert.equal(summary.lastTouchAt, '2026-03-09T12:00:00.000Z');
  assert.equal(summary.byProduct.get('travel-card'), '2026-03-09T12:00:00.000Z', 'latest, not first');
  assert.equal(summary.byProduct.get('high-yield-savings'), '2026-03-05T12:00:00.000Z');
});

test('a household never contacted has an empty summary rather than an error', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const summary = await store.getTouchSummary('hh_nobody');
  assert.equal(summary.lastTouchAt, null);
  assert.equal(summary.byProduct.size, 0);
});

test('touches expire so the table does not keep contact history forever', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  const record = await store.recordTouch({ householdId: 'hh_a', advisorId: 'adv_a' });
  assert.ok(record.ttl > Math.floor(Date.now() / 1000) + 300 * 86400);
});

test('recordTouch requires a household', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await assert.rejects(() => store.recordTouch({ advisorId: 'adv_a' }), /householdId/);
});

// --- job runs ------------------------------------------------------------------

test('runs come back newest first so the last outcome is the first row', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  await store.putRun({ kind: 'context-refresh', status: 'ok', now: new Date('2026-03-01T11:00:00.000Z') });
  await store.putRun({ kind: 'context-refresh', status: 'partial', now: new Date('2026-03-02T11:00:00.000Z') });

  const runs = await store.listRuns('context-refresh');
  assert.equal(runs.length, 2);
  assert.equal(runs[0].status, 'partial');
  assert.equal(runs[0].at, '2026-03-02T11:00:00.000Z');
});

test('run history is capped on read', async () => {
  const store = createCoworkerStore(createInMemoryBackend());
  for (let i = 1; i <= 5; i += 1) {
    await store.putRun({
      kind: 'context-refresh',
      status: 'ok',
      now: new Date(`2026-03-0${i}T11:00:00.000Z`),
    });
  }
  assert.equal((await store.listRuns('context-refresh', { limit: 2 })).length, 2);
});

test('store methods survive being destructured off the store', async () => {
  // Callers routinely pull methods off the object; one that depended on its
  // receiver would break silently at the call site rather than here.
  const store = createCoworkerStore(createInMemoryBackend());
  const { putContext, getContexts, getTouchSummaries, recordTouch } = store;
  await putContext({ household_id: 'hh_a', refreshed_at: '2026-03-04T11:00:00.000Z', signals: [] });
  await recordTouch({ householdId: 'hh_a', advisorId: 'adv_a', productId: 'travel-card' });
  assert.equal((await getContexts(['hh_a'])).size, 1);
  assert.equal((await getTouchSummaries(['hh_a'])).get('hh_a').byProduct.size, 1);
});
