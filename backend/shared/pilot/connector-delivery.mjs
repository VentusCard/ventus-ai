import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { beginTenantTransaction, validateTenantId } from '../platform/tenant-context.mjs';

const CONNECTORS = new Set(['salesforce', 'bank_workbench', 'campaign_platform', 'digital_channel']);
const TERMINAL_STATUSES = new Set(['delivered', 'failed']);

export function buildDeliveryReservation(request) {
  validateDeliveryRequest(request);
  const hashPayload = {
    tenantId: request.tenantId,
    connector: request.connector,
    destination: request.destination,
    decisionId: request.decisionId,
    actionId: request.actionId,
    payload: request.payload,
  };
  const requestHash = sha256(canonicalize(hashPayload));
  const deliveryId = `dlv_${sha256(`${request.tenantId}\u001f${request.idempotencyKey}`).slice(0, 24)}`;
  return {
    ...request,
    deliveryId,
    requestHash,
  };
}

export function createConnectorDeliveryRepository({ getDB }) {
  assert.equal(typeof getDB, 'function', 'getDB is required');
  return {
    async reserve(request) {
      const reservation = buildDeliveryReservation(request);
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, reservation.tenantId);
        const inserted = await db.query(
          `INSERT INTO connector_delivery_receipts
             (tenant_id, delivery_id, idempotency_key, connector, destination, decision_id,
              action_id, requested_by_session_id, request_hash, status, payload, requested_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10,$11)
           ON CONFLICT (tenant_id, idempotency_key) DO NOTHING
           RETURNING *`,
          [reservation.tenantId, reservation.deliveryId, reservation.idempotencyKey,
            reservation.connector, reservation.destination, reservation.decisionId,
            reservation.actionId, reservation.sessionId, reservation.requestHash,
            reservation.payload, reservation.requestedAt],
        );
        let record = inserted.rows[0];
        let shouldDeliver = Boolean(record);
        if (!record) {
          const existing = await db.query(
            `SELECT * FROM connector_delivery_receipts
             WHERE tenant_id = $1 AND idempotency_key = $2
             FOR UPDATE`,
            [reservation.tenantId, reservation.idempotencyKey],
          );
          assert.equal(existing.rows.length, 1, 'delivery reservation conflict could not be read back');
          record = existing.rows[0];
          assert.equal(record.request_hash, reservation.requestHash, 'idempotency key reused for a different delivery request');
          shouldDeliver = false;
        }
        await db.query('COMMIT');
        return {
          inserted: Boolean(inserted.rows[0]),
          shouldDeliver,
          replayed: !inserted.rows[0],
          reconciliationRequired: !inserted.rows[0] && record.status === 'pending',
          record,
        };
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },

    async complete(result) {
      validateDeliveryResult(result);
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, result.tenantId);
        const updated = await db.query(
          `UPDATE connector_delivery_receipts
           SET status = $3, completed_by_session_id = $4, external_receipt_id = $5,
               external_receipt_url = $6, error_code = $7, completed_at = $8
           WHERE tenant_id = $1 AND delivery_id = $2 AND status = 'pending'
           RETURNING *`,
          [result.tenantId, result.deliveryId, result.status, result.sessionId,
            result.externalReceiptId ?? null, result.externalReceiptUrl ?? null,
            result.errorCode ?? null, result.completedAt],
        );
        let record = updated.rows[0];
        if (!record) {
          const existing = await db.query(
            `SELECT * FROM connector_delivery_receipts
             WHERE tenant_id = $1 AND delivery_id = $2`,
            [result.tenantId, result.deliveryId],
          );
          assert.equal(existing.rows.length, 1, 'delivery reservation does not exist');
          record = existing.rows[0];
          assert.equal(record.status, result.status, 'delivery receipt is already terminal with a different status');
          assert.equal(record.external_receipt_id ?? null, result.externalReceiptId ?? null, 'terminal receipt id differs');
          assert.equal(record.error_code ?? null, result.errorCode ?? null, 'terminal error code differs');
        }
        await db.query('COMMIT');
        return { updated: Boolean(updated.rows[0]), record };
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },
  };
}

function validateDeliveryRequest(request) {
  assert.ok(request && typeof request === 'object' && !Array.isArray(request), 'delivery request must be an object');
  validateTenantId(request.tenantId);
  assertIdentifier(request.idempotencyKey, 'idempotencyKey');
  assert.ok(CONNECTORS.has(request.connector), 'connector is unsupported');
  assertIdentifier(request.destination, 'destination');
  assertIdentifier(request.decisionId, 'decisionId');
  assertIdentifier(request.actionId, 'actionId');
  assertIdentifier(request.sessionId, 'sessionId');
  assertIsoDate(request.requestedAt, 'requestedAt');
  assert.ok(request.payload && typeof request.payload === 'object' && !Array.isArray(request.payload), 'payload must be an object');
}

function validateDeliveryResult(result) {
  assert.ok(result && typeof result === 'object' && !Array.isArray(result), 'delivery result must be an object');
  validateTenantId(result.tenantId);
  assert.match(result.deliveryId, /^dlv_[a-f0-9]{24}$/, 'deliveryId is invalid');
  assert.ok(TERMINAL_STATUSES.has(result.status), 'delivery status must be terminal');
  assertIdentifier(result.sessionId, 'sessionId');
  assertIsoDate(result.completedAt, 'completedAt');
  if (result.status === 'delivered') {
    assertIdentifier(result.externalReceiptId, 'externalReceiptId');
    assert.equal(result.errorCode ?? null, null, 'delivered result cannot include errorCode');
  } else {
    assertIdentifier(result.errorCode, 'errorCode');
    assert.equal(result.externalReceiptId ?? null, null, 'failed result cannot include externalReceiptId');
  }
  if (result.externalReceiptUrl !== undefined && result.externalReceiptUrl !== null) {
    const url = new URL(result.externalReceiptUrl);
    assert.equal(url.protocol, 'https:', 'externalReceiptUrl must use HTTPS');
  }
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && value.length >= 2 && value.length <= 256, `${label} is invalid`);
}

function assertIsoDate(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be ISO date-time`);
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
