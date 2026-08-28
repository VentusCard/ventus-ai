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
//
// A "backend" is the low-level KV: { put, get, query, del }. The store wraps it
// with domain methods. Swap createInMemoryBackend() for createDynamoBackend() in
// the Lambda; nothing else changes.

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
