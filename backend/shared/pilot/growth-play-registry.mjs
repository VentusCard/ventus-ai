import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateCompiledGrowthPlayContract } from './growth-play-contract.mjs';
import { beginTenantTransaction, validateTenantId } from '../platform/tenant-context.mjs';

const DECISIONS = new Set(['approved', 'revoked']);

export function buildProtocolRegistration({
  tenantId,
  contract,
  registeredBy,
  registeredBySessionId,
  identityProvider,
  registeredAt,
}) {
  validateTenantId(tenantId);
  const compiled = validateCompiledGrowthPlayContract(contract);
  assertIdentifier(registeredBy, 'registeredBy');
  assertIdentifier(registeredBySessionId, 'registeredBySessionId');
  assertIdentifier(identityProvider, 'identityProvider');
  assertIsoDate(registeredAt, 'registeredAt');
  return {
    tenantId,
    decisionProtocolId: compiled.decision_protocol_id,
    growthPlayId: compiled.growth_play_id,
    version: compiled.version,
    businessLine: compiled.business_line,
    protocolDigest: compiled.protocol_digest,
    contract: compiled,
    registeredBy,
    registeredBySessionId,
    identityProvider,
    registeredAt,
  };
}

export function buildProtocolApproval({
  tenantId,
  decisionProtocolId,
  businessLine,
  decision,
  decidedBy,
  decidedBySessionId,
  identityProvider,
  decidedAt,
  changeRecordId,
  reason,
}) {
  validateTenantId(tenantId);
  assertIdentifier(decisionProtocolId, 'decisionProtocolId');
  assertIdentifier(businessLine, 'businessLine');
  assert.ok(DECISIONS.has(decision), 'approval decision must be approved or revoked');
  assertIdentifier(decidedBy, 'decidedBy');
  assertIdentifier(decidedBySessionId, 'decidedBySessionId');
  assertIdentifier(identityProvider, 'identityProvider');
  assertIsoDate(decidedAt, 'decidedAt');
  assertIdentifier(changeRecordId, 'changeRecordId');
  assertText(reason, 'reason', 8, 1000);
  const approvalEventId = `gpa_${sha256([
    tenantId,
    decisionProtocolId,
    businessLine,
    decision,
    decidedBy,
    decidedBySessionId,
    identityProvider,
    decidedAt,
    changeRecordId,
    reason.trim(),
  ].join('\u001f')).slice(0, 24)}`;
  return {
    approvalEventId,
    tenantId,
    decisionProtocolId,
    businessLine,
    decision,
    decidedBy,
    decidedBySessionId,
    identityProvider,
    decidedAt,
    changeRecordId,
    reason: reason.trim(),
  };
}

export function createGrowthPlayRegistry({ getDB }) {
  assert.equal(typeof getDB, 'function', 'getDB is required');
  return {
    async register(input) {
      const registration = buildProtocolRegistration(input);
      return inTenantTransaction(getDB, registration.tenantId, async (db) => {
        const inserted = await db.query(
          `INSERT INTO growth_play_protocols
             (tenant_id, decision_protocol_id, growth_play_id, version, business_line,
              protocol_digest, contract, registered_by, registered_by_session_id,
              identity_provider, registered_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (tenant_id, decision_protocol_id) DO NOTHING
           RETURNING *`,
          [registration.tenantId, registration.decisionProtocolId, registration.growthPlayId,
            registration.version, registration.businessLine, registration.protocolDigest,
            registration.contract, registration.registeredBy, registration.registeredBySessionId,
            registration.identityProvider, registration.registeredAt],
        );
        const record = inserted.rows[0] ?? (await db.query(
          `SELECT * FROM growth_play_protocols
            WHERE tenant_id = $1 AND decision_protocol_id = $2`,
          [registration.tenantId, registration.decisionProtocolId],
        )).rows[0];
        assert.ok(record, 'registered Growth Play protocol could not be read back');
        assert.equal(record.protocol_digest, registration.protocolDigest, 'protocol ID collision or changed contract');
        assert.deepEqual(record.contract, registration.contract, 'registered protocol contract differs');
        return { inserted: Boolean(inserted.rows[0]), record };
      });
    },

    async recordApproval(input) {
      const approval = buildProtocolApproval(input);
      return inTenantTransaction(getDB, approval.tenantId, async (db) => {
        const protocol = await db.query(
          `SELECT registered_at, registered_by, business_line FROM growth_play_protocols
            WHERE tenant_id = $1 AND decision_protocol_id = $2 AND business_line = $3`,
          [approval.tenantId, approval.decisionProtocolId, approval.businessLine],
        );
        assert.equal(protocol.rows.length, 1, 'approval references an unregistered Growth Play protocol for this business line');
        assert.ok(
          Date.parse(protocol.rows[0].registered_at) <= Date.parse(approval.decidedAt),
          'approval cannot predate protocol registration',
        );
        if (approval.decision === 'approved') {
          assert.notEqual(protocol.rows[0].registered_by, approval.decidedBy, 'protocol registration and approval require different subjects');
        }
        const inserted = await db.query(
          `INSERT INTO growth_play_protocol_approval_events
             (tenant_id, approval_event_id, decision_protocol_id, decision, decided_by,
              decided_by_session_id, identity_provider, decided_at, change_record_id, reason)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT (tenant_id, approval_event_id) DO NOTHING
           RETURNING *`,
          [approval.tenantId, approval.approvalEventId, approval.decisionProtocolId,
            approval.decision, approval.decidedBy, approval.decidedBySessionId,
            approval.identityProvider, approval.decidedAt, approval.changeRecordId,
            approval.reason],
        );
        const record = inserted.rows[0] ?? (await db.query(
          `SELECT * FROM growth_play_protocol_approval_events
            WHERE tenant_id = $1 AND approval_event_id = $2`,
          [approval.tenantId, approval.approvalEventId],
        )).rows[0];
        assert.ok(record, 'Growth Play approval event could not be read back');
        assert.equal(record.decision_protocol_id, approval.decisionProtocolId, 'approval replay protocol differs');
        assert.equal(record.decision, approval.decision, 'approval replay decision differs');
        return { inserted: Boolean(inserted.rows[0]), record };
      });
    },

    async requireApproved({ tenantId, decisionProtocolId, businessLine, at }) {
      validateTenantId(tenantId);
      assertIdentifier(decisionProtocolId, 'decisionProtocolId');
      assertIdentifier(businessLine, 'businessLine');
      assertIsoDate(at, 'at');
      return inTenantTransaction(getDB, tenantId, async (db) => {
        const result = await db.query(
          `SELECT p.decision_protocol_id, p.growth_play_id, p.business_line,
                  p.protocol_digest, p.contract, a.approval_event_id, a.decision,
                  a.decided_by, a.decided_by_session_id, a.identity_provider,
                  a.decided_at, a.change_record_id
             FROM growth_play_protocols p
             JOIN LATERAL (
               SELECT * FROM growth_play_protocol_approval_events
                WHERE tenant_id = p.tenant_id
                  AND decision_protocol_id = p.decision_protocol_id
                  AND decided_at <= $4
                ORDER BY decided_at DESC, approval_event_id DESC
                LIMIT 1
             ) a ON true
            WHERE p.tenant_id = $1
              AND p.decision_protocol_id = $2
              AND p.business_line = $3`,
          [tenantId, decisionProtocolId, businessLine, at],
        );
        assert.equal(result.rows.length, 1, 'Growth Play protocol is not registered and approved for this tenant and business line');
        const record = result.rows[0];
        assert.equal(record.decision, 'approved', 'Growth Play protocol is not approved at run time');
        const compiled = validateCompiledGrowthPlayContract(record.contract);
        assert.equal(compiled.decision_protocol_id, decisionProtocolId, 'stored Growth Play protocol ID is invalid');
        assert.equal(compiled.protocol_digest, record.protocol_digest, 'stored Growth Play protocol digest is invalid');
        return approvalReceipt(record);
      });
    },
  };
}

export function createInMemoryGrowthPlayRegistry() {
  const protocols = new Map();
  const approvals = [];
  return {
    async register(input) {
      const registration = buildProtocolRegistration(input);
      const key = protocolKey(registration.tenantId, registration.decisionProtocolId);
      const existing = protocols.get(key);
      if (existing) {
        assert.equal(existing.protocolDigest, registration.protocolDigest, 'protocol ID collision or changed contract');
        return { inserted: false, record: existing };
      }
      protocols.set(key, registration);
      return { inserted: true, record: registration };
    },
    async recordApproval(input) {
      const approval = buildProtocolApproval(input);
      const protocol = protocols.get(protocolKey(approval.tenantId, approval.decisionProtocolId));
      assert.ok(protocol, 'approval references an unregistered Growth Play protocol');
      assert.equal(protocol.businessLine, approval.businessLine, 'approval references a protocol owned by another business line');
      assert.ok(Date.parse(protocol.registeredAt) <= Date.parse(approval.decidedAt), 'approval cannot predate protocol registration');
      if (approval.decision === 'approved') {
        assert.notEqual(protocol.registeredBy, approval.decidedBy, 'protocol registration and approval require different subjects');
      }
      const existing = approvals.find((item) => item.tenantId === approval.tenantId && item.approvalEventId === approval.approvalEventId);
      if (!existing) approvals.push(approval);
      return { inserted: !existing, record: existing ?? approval };
    },
    async requireApproved({ tenantId, decisionProtocolId, businessLine, at }) {
      validateTenantId(tenantId);
      assertIdentifier(decisionProtocolId, 'decisionProtocolId');
      assertIdentifier(businessLine, 'businessLine');
      assertIsoDate(at, 'at');
      const protocol = protocols.get(protocolKey(tenantId, decisionProtocolId));
      assert.ok(protocol && protocol.businessLine === businessLine, 'Growth Play protocol is not registered and approved for this tenant and business line');
      const latest = approvals
        .filter((item) => item.tenantId === tenantId
          && item.decisionProtocolId === decisionProtocolId
          && Date.parse(item.decidedAt) <= Date.parse(at))
        .sort((left, right) => right.decidedAt.localeCompare(left.decidedAt)
          || right.approvalEventId.localeCompare(left.approvalEventId))[0];
      assert.ok(latest, 'Growth Play protocol is not registered and approved for this tenant and business line');
      assert.equal(latest.decision, 'approved', 'Growth Play protocol is not approved at run time');
      validateCompiledGrowthPlayContract(protocol.contract);
      return {
        approvalEventId: latest.approvalEventId,
        decisionProtocolId,
        growthPlayId: protocol.growthPlayId,
        businessLine: protocol.businessLine,
        protocolDigest: protocol.protocolDigest,
        contract: protocol.contract,
        decidedBy: latest.decidedBy,
        decidedBySessionId: latest.decidedBySessionId,
        identityProvider: latest.identityProvider,
        decidedAt: latest.decidedAt,
        changeRecordId: latest.changeRecordId,
      };
    },
  };
}

function approvalReceipt(record) {
  return {
    approvalEventId: record.approval_event_id,
    decisionProtocolId: record.decision_protocol_id,
    growthPlayId: record.growth_play_id,
    businessLine: record.business_line,
    protocolDigest: record.protocol_digest,
    contract: validateCompiledGrowthPlayContract(record.contract),
    decidedBy: record.decided_by,
    decidedBySessionId: record.decided_by_session_id,
    identityProvider: record.identity_provider,
    decidedAt: toISOString(record.decided_at),
    changeRecordId: record.change_record_id,
  };
}

async function inTenantTransaction(getDB, tenantId, operation) {
  const db = await getDB();
  await db.connect();
  try {
    await beginTenantTransaction(db, tenantId);
    const result = await operation(db);
    await db.query('COMMIT');
    return result;
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await db.end();
  }
}

function protocolKey(tenantId, decisionProtocolId) {
  return `${tenantId}\u001f${decisionProtocolId}`;
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:@-]{1,255}$/.test(value), `${label} is invalid`);
}

function assertText(value, label, minimum, maximum) {
  assert.ok(typeof value === 'string' && value.trim().length >= minimum && value.trim().length <= maximum, `${label} is invalid`);
}

function assertIsoDate(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be ISO date-time`);
}

function toISOString(value) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
