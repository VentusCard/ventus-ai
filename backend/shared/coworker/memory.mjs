// backend/shared/coworker/memory.mjs
//
// Layered memory for the Coworker, built on the store. Four scopes, each with a
// sensible default decay window (TTL). Decay keeps the agent's context fresh and
// bounds storage: stale advisor/household context expires unless refreshed.
//
//   thread       - facts scoped to one conversation (no decay; lives with thread)
//   household    - what we've learned about a specific household (medium decay)
//   advisor      - an advisor's standing preferences/patterns (long decay)
//   institution  - catalog/campaign context shared across advisors (long decay)
//
// All memory rows are stored under the advisor partition so a single query
// hydrates everything the agent needs for a turn.

export const MEMORY_SCOPES = ['thread', 'household', 'advisor', 'institution'];

export const DEFAULT_DECAY_DAYS = {
  thread: null, // no TTL; tied to the thread lifecycle
  household: 180,
  advisor: 365,
  institution: 365,
};

const SECONDS_PER_DAY = 86400;

function ttlFor(scope, decayDaysOverride) {
  const days = decayDaysOverride ?? DEFAULT_DECAY_DAYS[scope];
  if (!days) return undefined;
  return Math.floor(Date.now() / 1000) + days * SECONDS_PER_DAY;
}

/**
 * Create a memory facade over a coworker store.
 * @param {object} store  createCoworkerStore(...) instance
 * @param {string} advisorId  memory is always partitioned by advisor
 */
export function createMemory(store, advisorId) {
  if (!store) throw new Error('createMemory requires a store');
  if (!advisorId) throw new Error('createMemory requires an advisorId');

  return {
    /**
     * Write a memory fact. `key` should be stable per fact so re-writes update
     * in place (e.g. household id, or "tone", or a product id).
     */
    async remember({ scope, key, value, decayDays }) {
      assertScope(scope);
      return store.putMemory({
        advisorId,
        scope,
        key,
        value,
        ttlEpoch: ttlFor(scope, decayDays),
      });
    },

    /** Read all live (non-decayed) memory for a scope as a key->value map. */
    async recall(scope) {
      assertScope(scope);
      const rows = await store.listMemory({ advisorId, scope });
      const out = {};
      for (const row of rows) out[row.key] = row.value;
      return out;
    },

    /**
     * Hydrate the full memory context for a turn: every scope in one object.
     * (Thread-scoped memory is keyed by threadId when provided.)
     */
    async hydrate() {
      const entries = await Promise.all(
        MEMORY_SCOPES.map(async (scope) => [scope, await this.recall(scope)])
      );
      return Object.fromEntries(entries);
    },
  };
}

function assertScope(scope) {
  if (!MEMORY_SCOPES.includes(scope)) {
    throw new Error(`Unknown memory scope: ${scope}. Expected one of ${MEMORY_SCOPES.join(', ')}`);
  }
}
