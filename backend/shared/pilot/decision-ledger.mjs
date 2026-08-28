import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { beginTenantTransaction, validateTenantId } from '../platform/tenant-context.mjs';

const EVENT_TYPES = new Set([
  'signal', 'enrich', 'score', 'gate', 'decision', 'policy',
  'activation', 'outcome', 'counterfactual', 'skill',
]);
const STATUSES = new Set(['pending', 'confirmed', 'simulated', 'suppressed', 'failed']);
const GENESIS_HASH = '0'.repeat(64);

export function buildLedgerEvent(draft, { sequenceNumber, previousHash = GENESIS_HASH } = {}) {
  validateDraft(draft);
  assert.ok(Number.isInteger(sequenceNumber) && sequenceNumber > 0, 'sequenceNumber must be positive');
  assert.match(previousHash, /^[a-f0-9]{64}$/, 'previousHash must be SHA-256');
  const event = {
    tenantId: draft.tenantId,
    sequenceNumber,
    idempotencyKey: draft.idempotencyKey,
    eventType: draft.eventType,
    householdToken: draft.householdToken ?? null,
    growthPlayId: draft.growthPlayId ?? null,
    modelProvider: draft.modelProvider ?? null,
    modelName: draft.modelName ?? null,
    modelVersion: draft.modelVersion ?? null,
    policyVersion: draft.policyVersion ?? null,
    status: draft.status,
    payload: draft.payload,
    previousHash,
    occurredAt: draft.occurredAt,
  };
  return { ...event, eventHash: sha256(canonicalize(event)) };
}

export function verifyLedgerChain(rows) {
  assert.ok(Array.isArray(rows), 'rows must be an array');
  let previousHash = GENESIS_HASH;
  for (let index = 0; index < rows.length; index += 1) {
    const row = normalizeRow(rows[index]);
    if (row.sequenceNumber !== index + 1 || row.previousHash !== previousHash) return false;
    const expected = buildLedgerEvent(row, { sequenceNumber: row.sequenceNumber, previousHash }).eventHash;
    if (row.eventHash !== expected) return false;
    previousHash = row.eventHash;
  }
  return true;
}

export function createDecisionLedgerRepository({ getDB }) {
  assert.equal(typeof getDB, 'function', 'getDB is required');
  return {
    async append(draft) {
      validateDraft(draft);
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, draft.tenantId);
        await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [draft.tenantId]);
        const duplicate = await db.query(
          `SELECT * FROM decision_ledger_events
           WHERE tenant_id = $1 AND idempotency_key = $2`,
          [draft.tenantId, draft.idempotencyKey],
        );
        if (duplicate.rows[0]) {
          const existing = normalizeRow(duplicate.rows[0]);
          const expected = buildLedgerEvent(draft, {
            sequenceNumber: existing.sequenceNumber,
            previousHash: existing.previousHash,
          });
          assert.equal(
            existing.eventHash,
            expected.eventHash,
            'ledger idempotency key reused for different event content',
          );
          await db.query('COMMIT');
          return { inserted: false, record: duplicate.rows[0] };
        }

        const latest = await db.query(
          `SELECT sequence_number, event_hash FROM decision_ledger_events
           WHERE tenant_id = $1 ORDER BY sequence_number DESC LIMIT 1`,
          [draft.tenantId],
        );
        const sequenceNumber = latest.rows[0] ? Number(latest.rows[0].sequence_number) + 1 : 1;
        const previousHash = latest.rows[0]?.event_hash ?? GENESIS_HASH;
        const event = buildLedgerEvent(draft, { sequenceNumber, previousHash });
        const inserted = await db.query(
          `INSERT INTO decision_ledger_events
             (tenant_id, sequence_number, idempotency_key, event_type, household_token,
              growth_play_id, model_provider, model_name, model_version, policy_version,
              status, payload, previous_hash, event_hash, occurred_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
           RETURNING *`,
          [event.tenantId, event.sequenceNumber, event.idempotencyKey, event.eventType,
            event.householdToken, event.growthPlayId, event.modelProvider, event.modelName,
            event.modelVersion, event.policyVersion, event.status, event.payload,
            event.previousHash, event.eventHash, event.occurredAt],
        );
        await db.query('COMMIT');
        return { inserted: true, record: inserted.rows[0] };
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },

    async exportTenant(tenantId) {
      validateTenantId(tenantId);
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, tenantId);
        const result = await db.query(
          `SELECT * FROM decision_ledger_events
           WHERE tenant_id = $1 ORDER BY sequence_number ASC`,
          [tenantId],
        );
        await db.query('COMMIT');
        return { tenantId, verified: verifyLedgerChain(result.rows), events: result.rows };
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },

    async loadOutcomeContext({ tenantId, experimentId, householdToken }) {
      validateTenantId(tenantId);
      assertIdentifier(experimentId, 'experimentId');
      assert.match(householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'householdToken must be opaque');
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, tenantId);
        const assignmentResult = await db.query(
          `SELECT growth_play_id, payload FROM decision_ledger_events
            WHERE tenant_id = $1
              AND household_token = $2
              AND event_type = 'counterfactual'
              AND payload->>'experiment_id' = $3
            ORDER BY sequence_number DESC LIMIT 1`,
          [tenantId, householdToken, experimentId],
        );
        assert.equal(assignmentResult.rows.length, 1, 'outcome has no assignment context in the decision ledger');
        const assignment = assignmentResult.rows[0];
        for (const field of ['decision_id', 'assignment_id', 'arm', 'decision_protocol_id']) {
          assertIdentifier(assignment.payload?.[field], `assignment context.${field}`);
        }
        const activationResult = await db.query(
          `SELECT payload FROM decision_ledger_events
            WHERE tenant_id = $1
              AND household_token = $2
              AND event_type = 'activation'
              AND payload->>'decision_id' = $3
            ORDER BY sequence_number DESC LIMIT 1`,
          [tenantId, householdToken, assignment.payload.decision_id],
        );
        const activation = activationResult.rows[0]?.payload ?? null;
        if (activation) assertIdentifier(activation.activation_id, 'activation context.activation_id');
        await db.query('COMMIT');
        return {
          growthPlayId: assignment.growth_play_id,
          decisionId: assignment.payload.decision_id,
          assignmentId: assignment.payload.assignment_id,
          arm: assignment.payload.arm,
          decisionProtocolId: assignment.payload.decision_protocol_id,
          activationId: activation?.activation_id ?? null,
          deliveryStatus: activation?.delivery_status ?? null,
        };
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },

    async loadPreparedDecision({ tenantId, decisionId }) {
      validateTenantId(tenantId);
      assertIdentifier(decisionId, 'decisionId');
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, tenantId);
        const result = await db.query(
          `SELECT * FROM decision_ledger_events
           WHERE tenant_id = $1
             AND event_type = 'decision'
             AND payload->>'decision_id' = $2
           ORDER BY sequence_number DESC LIMIT 1`,
          [tenantId, decisionId],
        );
        assert.equal(result.rows.length, 1, 'prepared decision was not found');
        await db.query('COMMIT');
        return normalizeRow(result.rows[0]);
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },
  };
}

export function buildDecisionOutcomeGraph({ decisionEvents, outcomeEvents, minimumOutcomes = 30 }) {
  assert.ok(Array.isArray(decisionEvents), 'decisionEvents must be an array');
  assert.ok(Array.isArray(outcomeEvents), 'outcomeEvents must be an array');
  assert.ok(Number.isInteger(minimumOutcomes) && minimumOutcomes > 0, 'minimumOutcomes must be positive');

  const latestOutcomeByDecision = new Map();
  for (const outcome of outcomeEvents) {
    if (!outcome?.decision_id || !outcome.value || !Number.isFinite(outcome.value.amount)) continue;
    const previous = latestOutcomeByDecision.get(outcome.decision_id);
    if (!previous || Date.parse(outcome.occurred_at) > Date.parse(previous.occurred_at)) {
      latestOutcomeByDecision.set(outcome.decision_id, outcome);
    }
  }

  const groups = new Map();
  for (const raw of decisionEvents) {
    const event = normalizeRow(raw);
    if (event.eventType !== 'decision' || event.status !== 'confirmed') continue;
    const payload = event.payload;
    for (const field of ['decision_id', 'cohort', 'action', 'channel']) {
      assertIdentifier(payload?.[field], `decision payload.${field}`);
    }
    const key = [event.growthPlayId ?? 'unassigned', payload.cohort, payload.action, payload.channel].join('\u001f');
    const group = groups.get(key) ?? {
      growthPlayId: event.growthPlayId ?? 'unassigned',
      cohort: payload.cohort,
      action: payload.action,
      channel: payload.channel,
      decisions: 0,
      outcomesObserved: 0,
      positiveOutcomes: 0,
      totalValue: 0,
      signalCounts: new Map(),
    };
    group.decisions += 1;
    for (const signal of payload.signal_types ?? []) {
      if (typeof signal === 'string' && signal) group.signalCounts.set(signal, (group.signalCounts.get(signal) ?? 0) + 1);
    }
    const outcome = latestOutcomeByDecision.get(payload.decision_id);
    if (outcome) {
      group.outcomesObserved += 1;
      group.totalValue += outcome.value.amount;
      if (outcome.value.amount > 0) group.positiveOutcomes += 1;
    }
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => ({
      growthPlayId: group.growthPlayId,
      cohort: group.cohort,
      action: group.action,
      channel: group.channel,
      decisions: group.decisions,
      outcomesObserved: group.outcomesObserved,
      outcomeCoverage: ratio(group.outcomesObserved, group.decisions),
      positiveOutcomeRate: group.outcomesObserved >= minimumOutcomes ? ratio(group.positiveOutcomes, group.outcomesObserved) : null,
      meanObservedValue: group.outcomesObserved >= minimumOutcomes ? round(group.totalValue / group.outcomesObserved) : null,
      evidenceStatus: group.outcomesObserved >= minimumOutcomes ? 'descriptive_ready' : 'insufficient_outcomes',
      topSignals: [...group.signalCounts.entries()]
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .slice(0, 5)
        .map(([signal, count]) => ({ signal, count })),
      causalClaimAllowed: false,
    }))
    .sort((left, right) => right.outcomesObserved - left.outcomesObserved || left.cohort.localeCompare(right.cohort));
}

function validateDraft(draft) {
  assert.ok(draft && typeof draft === 'object' && !Array.isArray(draft), 'ledger draft must be an object');
  assertIdentifier(draft.tenantId, 'tenantId');
  assertIdentifier(draft.idempotencyKey, 'idempotencyKey');
  assert.ok(EVENT_TYPES.has(draft.eventType), 'eventType is unsupported');
  assert.ok(STATUSES.has(draft.status), 'status is unsupported');
  assert.ok(draft.payload && typeof draft.payload === 'object' && !Array.isArray(draft.payload), 'payload must be an object');
  assertIsoDate(draft.occurredAt, 'occurredAt');
  if (draft.householdToken !== undefined && draft.householdToken !== null) {
    assert.match(draft.householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'householdToken must be opaque');
  }
  if (draft.growthPlayId !== undefined && draft.growthPlayId !== null) assertIdentifier(draft.growthPlayId, 'growthPlayId');
}

function normalizeRow(row) {
  return {
    tenantId: row.tenantId ?? row.tenant_id,
    sequenceNumber: Number(row.sequenceNumber ?? row.sequence_number),
    idempotencyKey: row.idempotencyKey ?? row.idempotency_key,
    eventType: row.eventType ?? row.event_type,
    householdToken: row.householdToken ?? row.household_token ?? null,
    growthPlayId: row.growthPlayId ?? row.growth_play_id ?? null,
    modelProvider: row.modelProvider ?? row.model_provider ?? null,
    modelName: row.modelName ?? row.model_name ?? null,
    modelVersion: row.modelVersion ?? row.model_version ?? null,
    policyVersion: row.policyVersion ?? row.policy_version ?? null,
    status: row.status,
    payload: row.payload,
    previousHash: row.previousHash ?? row.previous_hash,
    eventHash: row.eventHash ?? row.event_hash,
    occurredAt: new Date(row.occurredAt ?? row.occurred_at).toISOString(),
  };
}

function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && value.length >= 2 && value.length <= 256, `${label} is invalid`);
}

function assertIsoDate(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be ISO date-time`);
}

function ratio(numerator, denominator) {
  return denominator === 0 ? null : round(numerator / denominator);
}

function round(value) {
  return Number(value.toFixed(4));
}

export { GENESIS_HASH };
