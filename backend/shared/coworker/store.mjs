// backend/shared/coworker/store.mjs
//
// DynamoDB single-table access for the Coworker, plus an in-memory backend so
// the whole agent can be exercised offline with no AWS.
//
// Single-table key design (table "ventus-coworker"):
//   Thread   PK=THREAD#<threadId>   SK=META
//   Turn     PK=THREAD#<threadId>   SK=TURN#<isoTs>#<msgId>
//   Task     PK=THREAD#<threadId>   SK=TASK#<taskId>      (+ GSI1: type/status)
//   Memory   PK=ADVISOR#<advisorId> SK=MEM#<scope>#<key>  (+ ttl epoch seconds)
//   AdvPrefs PK=ADVISOR#<advisorId> SK=PREFS
//   Inst     PK=INST#<instId>       SK=CATALOG
//   Suppress PK=SUPPRESS#<email>    SK=META               (no ttl, on purpose)
//   Context  PK=HH#<householdId>    SK=CTX#LATEST         (current snapshot)
//   CtxVer   PK=HH#<householdId>    SK=CTXV#<isoDate>     (+ ttl, 90d history)
//   Touch    PK=HH#<householdId>    SK=TOUCH#<isoTs>      (+ ttl, contact log)
//   Run      PK=RUN#<kind>          SK=<isoTs>            (+ ttl, job history)
//
// A "backend" is the low-level KV: { put, get, query, del }. The store wraps it
// with domain methods. Swap createInMemoryBackend() for createDynamoBackend() in
// the Lambda; nothing else changes.

import { SUPPRESSION_SCOPES, normalizeEmail, scopeBlocks } from './unsubscribe.mjs';

export const keys = {
  thread: (threadId) => ({ PK: `THREAD#${threadId}`, SK: 'META' }),
  // Turns sort by a monotonic per-thread sequence (zero-padded) so ordering is
  // deterministic even when two turns share a timestamp.
  turn: (threadId, seq) => ({ PK: `THREAD#${threadId}`, SK: `TURN#${String(seq).padStart(6, '0')}` }),
  turnPrefix: (threadId) => ({ PK: `THREAD#${threadId}`, SKPrefix: 'TURN#' }),
  task: (threadId, taskId) => ({ PK: `THREAD#${threadId}`, SK: `TASK#${taskId}` }),
  taskPrefix: (threadId) => ({ PK: `THREAD#${threadId}`, SKPrefix: 'TASK#' }),
  memory: (advisorId, scope, key) => ({ PK: `ADVISOR#${advisorId}`, SK: `MEM#${scope}#${key}` }),
  memoryPrefix: (advisorId, scope) => ({ PK: `ADVISOR#${advisorId}`, SKPrefix: `MEM#${scope}#` }),
  prefs: (advisorId) => ({ PK: `ADVISOR#${advisorId}`, SK: 'PREFS' }),
  rate: (sender) => ({ PK: `RATE#${sender}`, SK: 'WINDOW' }),
  processed: (messageId) => ({ PK: `MSG#${messageId}`, SK: 'PROCESSED' }),
  // Keyed on the address rather than an advisor id: the same store has to hold
  // client addresses once client-facing mail exists, and those have no advisor.
  suppression: (email) => ({ PK: `SUPPRESS#${normalizeEmail(email)}`, SK: 'META' }),
  // Context lives under the household rather than the advisor because books get
  // reassigned and the household's history has to survive that.
  context: (householdId) => ({ PK: `HH#${householdId}`, SK: 'CTX#LATEST' }),
  contextVersion: (householdId, isoDate) => ({ PK: `HH#${householdId}`, SK: `CTXV#${isoDate}` }),
  contextVersionPrefix: (householdId) => ({ PK: `HH#${householdId}`, SKPrefix: 'CTXV#' }),
  touch: (householdId, isoTs) => ({ PK: `HH#${householdId}`, SK: `TOUCH#${isoTs}` }),
  touchPrefix: (householdId) => ({ PK: `HH#${householdId}`, SKPrefix: 'TOUCH#' }),
  run: (kind, isoTs) => ({ PK: `RUN#${kind}`, SK: isoTs }),
  runPrefix: (kind) => ({ PK: `RUN#${kind}` }),
};

const nowEpoch = () => Math.floor(Date.now() / 1000);

/**
 * In-memory backend. TTL is respected on read (expired items are treated as
 * absent), mirroring DynamoDB TTL semantics closely enough for tests.
 */
export function createInMemoryBackend() {
  const map = new Map();
  const k = (pk, sk) => `${pk}\u0000${sk}`;
  const live = (item) => !item.ttl || item.ttl > nowEpoch();
  return {
    async put(item) {
      if (!item.PK || !item.SK) throw new Error('put requires PK and SK');
      map.set(k(item.PK, item.SK), { ...item });
      return item;
    },
    async get(pk, sk) {
      const item = map.get(k(pk, sk));
      return item && live(item) ? { ...item } : null;
    },
    async query({ PK, SKPrefix }) {
      const out = [];
      for (const item of map.values()) {
        if (item.PK !== PK) continue;
        if (SKPrefix && !item.SK.startsWith(SKPrefix)) continue;
        if (!live(item)) continue;
        out.push({ ...item });
      }
      return out.sort((a, b) => (a.SK < b.SK ? -1 : a.SK > b.SK ? 1 : 0));
    },
    async del(pk, sk) {
      map.delete(k(pk, sk));
    },
    _dump: () => [...map.values()],
  };
}

/**
 * DynamoDB backend. Lazily imports the AWS SDK so this module stays loadable
 * offline (tests never call this). Pass a DynamoDBDocumentClient or let it
 * construct one from a base DynamoDBClient.
 */
export async function createDynamoBackend({ tableName, documentClient }) {
  if (!tableName) throw new Error('createDynamoBackend requires tableName');
  const lib = await import('@aws-sdk/lib-dynamodb');
  let doc = documentClient;
  if (!doc) {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    doc = lib.DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }
  const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = lib;
  return {
    async put(item) {
      await doc.send(new PutCommand({ TableName: tableName, Item: item }));
      return item;
    },
    async get(pk, sk) {
      const res = await doc.send(new GetCommand({ TableName: tableName, Key: { PK: pk, SK: sk } }));
      return res.Item ?? null;
    },
    async query({ PK, SKPrefix }) {
      const res = await doc.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: SKPrefix
            ? 'PK = :pk AND begins_with(SK, :sk)'
            : 'PK = :pk',
          ExpressionAttributeValues: SKPrefix ? { ':pk': PK, ':sk': SKPrefix } : { ':pk': PK },
        })
      );
      return res.Items ?? [];
    },
    async del(pk, sk) {
      await doc.send(new DeleteCommand({ TableName: tableName, Key: { PK: pk, SK: sk } }));
    },
  };
}

/**
 * Domain store built on top of a backend. This is what the core/tasks use.
 */
export function createCoworkerStore(backend) {
  if (!backend) throw new Error('createCoworkerStore requires a backend');

  // Free functions rather than `this` calls between methods. Callers routinely
  // destructure the store, and a method that depends on its receiver breaks the
  // moment somebody writes `const { getContexts } = store`.
  async function readContext(householdId) {
    if (!householdId) return null;
    const { PK, SK } = keys.context(householdId);
    return backend.get(PK, SK);
  }

  async function readTouches(householdId) {
    const rows = await backend.query(keys.touchPrefix(householdId));
    // SK is TOUCH#<iso>, so lexical sort is chronological; reverse for newest first.
    return rows.reverse();
  }

  // Scoped to one advisor when an id is given, and this matters more than it
  // looks. The digest does not contact anybody; it recommends a household to a
  // colleague. So the cadence question is "have we already put these people in
  // front of this advisor recently", not "has anyone heard from us".
  //
  // Unscoped, one advisor's mail mutes the household for every other advisor.
  // In production that is close to invisible, because a household sits in one
  // advisor's book. In the demo all four mailable advisors share the same 28
  // households, so a single morning's run marked 20 of them contacted and the
  // digest went silent within two days.
  //
  // Rows with no advisor_id are ignored by a scoped read. Only the digest
  // writes touches today and it always attributes them, and an unattributed
  // contact is not evidence that this advisor was told anything.
  async function readTouchSummary(householdId, { advisorId = null } = {}) {
    const all = await readTouches(householdId);
    const rows = advisorId ? all.filter((row) => row.advisor_id === advisorId) : all;
    const byProduct = new Map();
    for (const row of rows) {
      if (!row.product_id) continue;
      // Rows arrive newest first, so the first sighting of a product is its latest.
      if (!byProduct.has(row.product_id)) byProduct.set(row.product_id, row.at);
    }
    return { lastTouchAt: rows[0]?.at || null, byProduct };
  }

  return {
    backend,

    async upsertThread(thread) {
      const { PK, SK } = keys.thread(thread.thread_id);
      return backend.put({ PK, SK, entity: 'thread', ...thread });
    },
    async getThread(threadId) {
      return backend.get(...Object.values(keys.thread(threadId)));
    },

    async appendTurn(turn) {
      const isoTs = turn.created_at || new Date().toISOString();
      if (turn.seq == null) throw new Error('appendTurn requires a monotonic seq');
      const { PK, SK } = keys.turn(turn.thread_id, turn.seq);
      return backend.put({ PK, SK, entity: 'turn', created_at: isoTs, ...turn });
    },
    async listTurns(threadId) {
      return backend.query(keys.turnPrefix(threadId));
    },

    async putTask(task) {
      const { PK, SK } = keys.task(task.thread_id, task.task_id);
      return backend.put({
        PK,
        SK,
        entity: 'task',
        GSI1PK: `TASKTYPE#${task.task_type}`,
        GSI1SK: `STATUS#${task.status}#${task.created_at || new Date().toISOString()}`,
        ...task,
      });
    },
    async listTasks(threadId) {
      return backend.query(keys.taskPrefix(threadId));
    },

    /**
     * Fixed-window rate limiter keyed by sender address. Counts inbound messages
     * per sender within a rolling window and reports whether this one is allowed.
     * The window record carries a DynamoDB ttl so it self-cleans.
     *
     * Note: get-then-put is not atomic, so a simultaneous burst can slightly
     * undercount. That is acceptable for an abuse guard on an open demo inbox —
     * it never over-blocks a legitimate sender.
     *
     * @returns {Promise<{allowed:boolean,count:number,limit:number,resetAt:string}>}
     */
    async checkAndBumpRate({ sender, now = new Date(), windowMs = 3600_000, limit = 12 }) {
      const key = keys.rate(String(sender || '').toLowerCase());
      const nowMs = now.getTime();
      const existing = await backend.get(key.PK, key.SK);

      let windowStartMs = nowMs;
      let count = 0;
      if (existing && Number.isFinite(existing.window_start_ms) && nowMs - existing.window_start_ms < windowMs) {
        windowStartMs = existing.window_start_ms;
        count = existing.count || 0;
      }
      count += 1;

      const resetMs = windowStartMs + windowMs;
      await backend.put({
        PK: key.PK,
        SK: key.SK,
        entity: 'rate',
        window_start_ms: windowStartMs,
        count,
        updated_at: new Date(nowMs).toISOString(),
        // TTL a little past the window so DynamoDB reaps stale counters.
        ttl: Math.floor(resetMs / 1000) + 60,
      });

      return {
        allowed: count <= limit,
        count,
        limit,
        resetAt: new Date(resetMs).toISOString(),
      };
    },

    /**
     * Claim an inbound message id for processing, exactly once.
     *
     * SES and Lambda both guarantee at-least-once delivery, so the same email
     * can arrive twice. Without a claim the advisor gets two replies to one
     * message, which reads as a malfunctioning teammate. Returns firstTime
     * false on a redelivery so the caller can drop it silently.
     *
     * @returns {Promise<{firstTime:boolean, claimedAt:string}>}
     */
    async claimMessage({ messageId, now = new Date(), ttlDays = 7 }) {
      const id = String(messageId || '').trim();
      if (!id) return { firstTime: true, claimedAt: now.toISOString() };
      const key = keys.processed(id);
      const existing = await backend.get(key.PK, key.SK);
      if (existing) {
        return { firstTime: false, claimedAt: existing.claimed_at };
      }
      const claimedAt = now.toISOString();
      await backend.put({
        PK: key.PK,
        SK: key.SK,
        entity: 'processed_message',
        message_id: id,
        claimed_at: claimedAt,
        // Expiry is wall-clock, not the injected clock. The clock is there to
        // make rendered timestamps deterministic in tests; deriving retention
        // from it would make a claim written under a backdated clock expire the
        // instant it was created.
        ttl: Math.floor(Date.now() / 1000) + ttlDays * 86400,
      });
      return { firstTime: true, claimedAt };
    },

    /**
     * Record an opt-out. Idempotent, and scope only ever widens: a spam
     * complaint after an unsubscribe must not be narrowed back down by a
     * replayed one-click POST, and Gmail will replay it.
     *
     * Deliberately no ttl. An opt-out that expires is an opt-out that starts
     * mailing someone again on its own.
     *
     * @param {{email:string, scope?:'proactive'|'all', reason?:string, source?:string, now?:Date}} opts
     */
    async suppress({ email, scope = 'proactive', reason = null, source = null, now = new Date() }) {
      const address = normalizeEmail(email);
      if (!address) throw new Error('suppress requires an email');
      if (!SUPPRESSION_SCOPES.includes(scope)) {
        throw new Error(`suppress got unknown scope "${scope}"`);
      }

      const { PK, SK } = keys.suppression(address);
      const existing = await backend.get(PK, SK);
      const widest =
        existing && SUPPRESSION_SCOPES.indexOf(existing.scope) > SUPPRESSION_SCOPES.indexOf(scope)
          ? existing.scope
          : scope;
      const nowIso = now.toISOString();

      const record = {
        PK,
        SK,
        entity: 'suppression',
        email: address,
        scope: widest,
        reason,
        source,
        first_suppressed_at: existing?.first_suppressed_at || nowIso,
        updated_at: nowIso,
        // Kept for the audit trail: "we stopped mailing them, here is every
        // event that said so" is the question an advisor complaint raises.
        events: [...(existing?.events || []), { at: nowIso, scope, reason, source }].slice(-20),
      };
      await backend.put(record);
      return record;
    },

    async getSuppression(email) {
      const address = normalizeEmail(email);
      if (!address) return null;
      const { PK, SK } = keys.suppression(address);
      return backend.get(PK, SK);
    },

    /**
     * Gate for a send site. `kind` is what we are about to send, not what the
     * recipient asked to stop: a 'proactive' digest is blocked by any opt-out,
     * a 'reply' only by a bounce or complaint.
     *
     * @returns {Promise<{suppressed:boolean, record:object|null}>}
     */
    async isSuppressed(email, { kind = 'proactive' } = {}) {
      const address = normalizeEmail(email);
      if (!address) return { suppressed: false, record: null };
      const { PK, SK } = keys.suppression(address);
      const record = (await backend.get(PK, SK)) || null;
      return { suppressed: scopeBlocks(record, kind), record };
    },

    /** Clear an opt-out. Operator action only; never called by a send path. */
    async unsuppress(email) {
      const address = normalizeEmail(email);
      if (!address) return false;
      const { PK, SK } = keys.suppression(address);
      const existing = await backend.get(PK, SK);
      if (!existing) return false;
      await backend.del(PK, SK);
      return true;
    },

    // -----------------------------------------------------------------------
    // Customer context
    // -----------------------------------------------------------------------

    /**
     * Write today's snapshot for a household.
     *
     * Two records per refresh: CTX#LATEST, which every reader hits, and a dated
     * CTXV# copy. The dated copies are what make a signal's age auditable — when
     * an advisor asks why we said a signal was 40 days old, the answer has to be
     * a record rather than a recomputation. They carry a TTL because the value
     * of that answer does not outlast a quarter.
     *
     * @param {object} snapshot  output of buildHouseholdContext()
     * @param {object} [opts]
     * @param {number} [opts.historyDays=90]
     */
    async putContext(snapshot, { historyDays = 90 } = {}) {
      if (!snapshot?.household_id) throw new Error('putContext requires household_id');
      const refreshedAt = snapshot.refreshed_at || new Date().toISOString();
      const latest = keys.context(snapshot.household_id);
      const record = { ...latest, entity: 'context', ...snapshot, refreshed_at: refreshedAt };
      await backend.put(record);

      const dated = keys.contextVersion(snapshot.household_id, refreshedAt.slice(0, 10));
      await backend.put({
        ...dated,
        entity: 'context_version',
        ...snapshot,
        refreshed_at: refreshedAt,
        ttl: Math.floor(Date.now() / 1000) + historyDays * 86400,
      });

      return record;
    },

    getContext: readContext,

    /**
     * Snapshots for many households in one call.
     *
     * A per-household get in a loop, not a batch: the digest reads one advisor's
     * book, which is tens of households, and the clarity is worth more than the
     * round trips at that size. Revisit if a book ever reaches the thousands.
     *
     * @returns {Promise<Map<string, object>>}
     */
    async getContexts(householdIds = []) {
      const out = new Map();
      for (const id of householdIds) {
        const snapshot = await readContext(id);
        if (snapshot) out.set(id, snapshot);
      }
      return out;
    },

    async listContextVersions(householdId) {
      return backend.query(keys.contextVersionPrefix(householdId));
    },

    // -----------------------------------------------------------------------
    // Contact log
    // -----------------------------------------------------------------------

    /**
     * Record that a household was put in front of an advisor.
     *
     * Written at send time, not at build time. A row that was composed but
     * never mailed (send failed, advisor suppressed) must not start a cadence
     * clock, or a delivery failure would silently mute the household for a week.
     *
     * TTL is 400 days: longer than any cadence rule needs, short enough that the
     * table does not accumulate contact history forever.
     */
    async recordTouch({ householdId, advisorId, productId = null, channel = 'digest', threadId = null, now = new Date() }) {
      if (!householdId) throw new Error('recordTouch requires householdId');
      const at = now.toISOString();
      const { PK, SK } = keys.touch(householdId, at);
      const record = {
        PK,
        SK,
        entity: 'touch',
        household_id: householdId,
        advisor_id: advisorId || null,
        product_id: productId,
        channel,
        thread_id: threadId,
        at,
        ttl: Math.floor(Date.now() / 1000) + 400 * 86400,
      };
      await backend.put(record);
      return record;
    },

    listTouches: readTouches,

    /**
     * The cadence inputs for one household: when it was last surfaced at all,
     * and when it was last surfaced for each product.
     *
     * Pass an advisorId to ask the question the digest actually cares about —
     * what this advisor has already been shown. Omit it for the household's
     * whole contact history across everyone.
     *
     * @param {string} householdId
     * @param {{advisorId?: string|null}} [opts]
     * @returns {Promise<{lastTouchAt:string|null, byProduct:Map<string,string>}>}
     */
    getTouchSummary: readTouchSummary,

    async getTouchSummaries(householdIds = [], { advisorId = null } = {}) {
      const out = new Map();
      for (const id of householdIds) out.set(id, await readTouchSummary(id, { advisorId }));
      return out;
    },

    // -----------------------------------------------------------------------
    // Job runs
    // -----------------------------------------------------------------------

    /**
     * Record the outcome of a scheduled job.
     *
     * The failure this exists for is the silent one: a refresh that stops
     * running looks exactly like a refresh that found nothing to change, and
     * both produce a quiet morning. A run record makes the difference visible.
     */
    async putRun({ kind, status, summary = {}, error = null, now = new Date(), retentionDays = 90 }) {
      if (!kind) throw new Error('putRun requires a kind');
      const at = now.toISOString();
      const { PK, SK } = keys.run(kind, at);
      const record = {
        PK,
        SK,
        entity: 'run',
        kind,
        status,
        summary,
        error,
        at,
        ttl: Math.floor(Date.now() / 1000) + retentionDays * 86400,
      };
      await backend.put(record);
      return record;
    },

    async listRuns(kind, { limit = 30 } = {}) {
      const rows = await backend.query(keys.runPrefix(kind));
      return rows.reverse().slice(0, limit);
    },

    async putMemory({ advisorId, scope, key, value, ttlEpoch }) {
      const { PK, SK } = keys.memory(advisorId, scope, key);
      return backend.put({
        PK,
        SK,
        entity: 'memory',
        scope,
        key,
        value,
        updated_at: new Date().toISOString(),
        ...(ttlEpoch ? { ttl: ttlEpoch } : {}),
      });
    },
    async listMemory({ advisorId, scope }) {
      return backend.query(keys.memoryPrefix(advisorId, scope));
    },
  };
}
