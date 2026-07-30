import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { beginTenantTransaction, validateTenantId } from './tenant-context.mjs';

const MOMENT_LIMIT = 100;
const RESPONSE_STATUSES = new Set(['accepted', 'modified', 'deferred', 'declined']);
const ACTIONS = Object.freeze({
  'deposit-retention': {
    growthPlayId: 'deposit-primacy-defense',
    growthPlay: 'Deposit Primacy Defense',
    businessLine: 'consumer-banking',
    objective: 'Protect primary deposit relationships',
    primaryMetric: 'deposit_retained',
    protocolId: 'deposit-retention-v1',
    actions: [
      action('banker-retention-review', 'Open a banker retention review', 'Contact the customer before the next payroll cycle to review their everyday-banking setup and an approved retention option.', 'Relationship banker', 'Salesforce FSC'),
      action('digital-retention-message', 'Prepare an approved digital message', 'Queue an approved, non-product-specific primacy message for the next eligible digital session.', 'Lifecycle marketing', 'Journey orchestration'),
      action('specialist-relationship-review', 'Route to a relationship specialist', 'Ask a specialist to review the relationship before any customer outreach.', 'Relationship specialist', 'Salesforce FSC'),
    ],
  },
  'wealth-growth': {
    growthPlayId: 'merrill-relationship-growth',
    growthPlay: 'Merrill Relationship Growth',
    businessLine: 'wealth-management',
    objective: 'Grow qualified advised relationships',
    primaryMetric: 'net_new_assets',
    protocolId: 'wealth-growth-v1',
    actions: [
      action('advisor-consolidation-review', 'Open an advisor consolidation review', 'Assign the best-fit advisor and prepare a consolidation review while the intent is active.', 'Financial advisor', 'Salesforce FSC'),
      action('planning-conversation', 'Prepare a planning conversation', 'Invite the client to a goals-based planning conversation without presenting a product.', 'Wealth relationship manager', 'Salesforce FSC'),
      action('specialist-triage', 'Send for specialist triage', 'Route the moment to the wealth specialist desk for suitability and ownership review.', 'Wealth specialist', 'Specialist queue'),
    ],
  },
});

export function createConsoleJourneyRepository({ getDB, ledgerRepository, deliveryRepository }) {
  assert.equal(typeof getDB, 'function', 'getDB is required');
  assert.equal(typeof ledgerRepository?.append, 'function', 'ledgerRepository.append is required');
  assert.equal(typeof deliveryRepository?.reserve, 'function', 'deliveryRepository.reserve is required');
  assert.equal(typeof deliveryRepository?.complete, 'function', 'deliveryRepository.complete is required');

  return {
    async recordDecision({ decision, requestId }) {
      const packageProjection = buildDecisionPackage(decision);
      const result = await ledgerRepository.append({
        tenantId: decision.tenantId,
        idempotencyKey: `console:${decision.decisionId}`,
        eventType: 'decision',
        householdToken: packageProjection.subject.token,
        growthPlayId: packageProjection.growthPlay.id,
        modelProvider: null,
        modelName: null,
        modelVersion: null,
        policyVersion: decision.runtime.policyVersion,
        status: decision.source.mode === 'fixture'
          ? 'simulated'
          : decision.status === 'qualified' ? 'confirmed' : 'suppressed',
        occurredAt: decision.generatedAt,
        payload: {
          schema_version: decision.schemaVersion,
          decision_id: decision.decisionId,
          request_id: requestId,
          scenario: decision.scenario,
          decision_status: decision.status,
          source: decision.source,
          opportunity: decision.opportunity,
          policy: decision.policy,
          runtime: decision.runtime,
          decision_package: packageProjection,
        },
      });
      return {
        persisted: true,
        inserted: result.inserted,
        sequenceNumber: Number(result.record.sequence_number ?? result.record.sequenceNumber),
        eventHash: result.record.event_hash ?? result.record.eventHash,
        recordedAt: new Date(result.record.recorded_at ?? result.record.occurred_at ?? result.record.occurredAt).toISOString(),
        moment: projectMoment([result.record]),
      };
    },

    async listMoments({ tenantId, limit = MOMENT_LIMIT }) {
      validateTenantId(tenantId);
      const rows = await queryEvents(getDB, tenantId, null, limit);
      return projectMoments(rows);
    },

    async loadMoment({ tenantId, decisionId }) {
      validateTenantId(tenantId);
      assertId(decisionId, 'decisionId');
      const rows = await queryEvents(getDB, tenantId, decisionId, MOMENT_LIMIT);
      const moment = projectMoment(rows);
      assert.ok(moment, 'moment was not found');
      return moment;
    },

    async recordResponse({ tenantId, decisionId, actorId, sessionId, idempotencyKey, expectedState, response, requestedAt }) {
      validateTenantId(tenantId);
      assertId(decisionId, 'decisionId');
      assertId(actorId, 'actorId');
      assertId(sessionId, 'sessionId');
      assertId(idempotencyKey, 'idempotencyKey');
      assertIso(requestedAt, 'requestedAt');
      assert.equal(expectedState, 'queued', 'responses can only be recorded from the queued state');
      validateResponse(response);
      const currentMoment = await this.loadMoment({ tenantId, decisionId });
      const result = await ledgerRepository.append({
        tenantId,
        idempotencyKey,
        eventType: 'response',
        householdToken: currentMoment.decisionPackage.subject.token,
        growthPlayId: currentMoment.decisionPackage.growthPlay.id,
        policyVersion: currentMoment.decisionPackage.growthPlay.protocolId,
        status: 'confirmed',
        occurredAt: requestedAt,
        payload: {
          decision_id: decisionId,
          actor_id: actorId,
          session_id: sessionId,
          expected_state: expectedState,
          response,
        },
      }, {
        beforeInsert: async (db) => {
          const moment = projectMoment(await queryEventsWithClient(db, tenantId, decisionId));
          assert.ok(moment, 'moment was not found');
          assert.equal(moment.status, expectedState, 'moment state changed; refresh before responding');
          assert.equal(moment.decisionPackage.governance.policyStatus, 'cleared', 'policy does not allow a response');
          assertAllowedResponse(moment.decisionPackage, response);
        },
      });
      return {
        receipt: ledgerReceipt(result.record),
        moment: await this.loadMoment({ tenantId, decisionId }),
      };
    },

    async reserveDelivery({ tenantId, decisionId, sessionId, idempotencyKey, expectedState, requestedAt }) {
      validateTenantId(tenantId);
      assertId(decisionId, 'decisionId');
      assertId(sessionId, 'sessionId');
      assertId(idempotencyKey, 'idempotencyKey');
      assertIso(requestedAt, 'requestedAt');
      assert.ok(['approved', 'delivery_failed'].includes(expectedState), 'deliveries can only be reserved from the approved or terminally failed state');
      const moment = await this.loadMoment({ tenantId, decisionId });
      assert.equal(moment.status, expectedState, 'moment state changed; refresh before delivery');
      const response = moment.decisionPackage.response;
      assert.ok(['accepted', 'modified'].includes(response.status), 'an accepted or modified response is required');
      const selectedAction = moment.decisionPackage.recommendation.selectedAction;
      // The browser key deduplicates its request; the delivery key is derived
      // server-side so retries or double-clicks cannot create a second action.
      // A terminal configuration failure is safe to retry once with the same
      // approved package. Pending writes remain reconciliation-only.
      const deliveryIdempotencyKey = expectedState === 'delivery_failed'
        ? `delivery-retry:${decisionId}:${selectedAction.id}`
        : `delivery:${decisionId}:${selectedAction.id}`;
      const reservation = await deliveryRepository.reserve({
        tenantId,
        idempotencyKey: deliveryIdempotencyKey,
        connector: connectorForAction(selectedAction),
        destination: destinationForAction(selectedAction),
        decisionId,
        actionId: selectedAction.id,
        sessionId,
        payload: {
          schema_version: moment.decisionPackage.schemaVersion,
          decision_id: decisionId,
          request_idempotency_key: idempotencyKey,
          decision_package: moment.decisionPackage,
        },
        requestedAt,
      });
      await ledgerRepository.append({
        tenantId,
        idempotencyKey: `ledger:${deliveryIdempotencyKey}`,
        eventType: 'activation',
        householdToken: moment.decisionPackage.subject.token,
        growthPlayId: moment.decisionPackage.growthPlay.id,
        policyVersion: moment.decisionPackage.growthPlay.protocolId,
        status: reservation.record.status === 'failed' ? 'failed' : reservation.record.status === 'delivered' ? 'confirmed' : 'pending',
        occurredAt: requestedAt,
        payload: {
          decision_id: decisionId,
          stage: expectedState === 'delivery_failed' ? 'delivery_retry_reserved' : 'delivery_reserved',
          delivery_id: reservation.record.delivery_id,
          connector: reservation.record.connector,
          destination: reservation.record.destination,
          action_id: reservation.record.action_id,
          delivery_status: reservation.record.status,
          external_receipt_id: reservation.record.external_receipt_id ?? null,
          external_receipt_url: reservation.record.external_receipt_url ?? null,
        },
      });
      return {
        receipt: {
          deliveryId: reservation.record.delivery_id,
          status: reservation.record.status,
          replayed: reservation.replayed,
          externalReceiptId: reservation.record.external_receipt_id ?? null,
          externalReceiptUrl: reservation.record.external_receipt_url ?? null,
        },
        moment: await this.loadMoment({ tenantId, decisionId }),
        // This private field is only used by the in-process API broker. It is
        // removed before an HTTP response is generated.
        reservation: {
          shouldDeliver: reservation.shouldDeliver,
          reconciliationRequired: reservation.reconciliationRequired,
          record: reservation.record,
        },
      };
    },

    async completeDelivery({
      tenantId,
      decisionId,
      sessionId,
      deliveryId,
      status,
      externalReceiptId,
      externalReceiptUrl,
      errorCode,
      records,
      warnings,
      completedAt,
    }) {
      validateTenantId(tenantId);
      assertId(decisionId, 'decisionId');
      assertId(sessionId, 'sessionId');
      assert.ok(/^dlv_[a-f0-9]{24}$/.test(deliveryId), 'deliveryId is invalid');
      assert.ok(['delivered', 'failed'].includes(status), 'delivery status is invalid');
      assertIso(completedAt, 'completedAt');
      const moment = await this.loadMoment({ tenantId, decisionId });
      const completion = await deliveryRepository.complete({
        tenantId,
        deliveryId,
        status,
        sessionId,
        externalReceiptId: status === 'delivered' ? externalReceiptId : undefined,
        externalReceiptUrl: status === 'delivered' ? externalReceiptUrl : undefined,
        errorCode: status === 'failed' ? errorCode : undefined,
        completedAt,
      });
      const record = completion.record;
      assert.equal(record.decision_id, decisionId, 'delivery receipt belongs to another decision');
      const terminalStatus = record.status;
      const terminalAt = new Date(record.completed_at ?? completedAt).toISOString();
      await ledgerRepository.append({
        tenantId,
        idempotencyKey: `ledger:delivery-completion:${deliveryId}`,
        eventType: 'activation',
        householdToken: moment.decisionPackage.subject.token,
        growthPlayId: moment.decisionPackage.growthPlay.id,
        policyVersion: moment.decisionPackage.growthPlay.protocolId,
        status: terminalStatus === 'delivered' ? 'confirmed' : 'failed',
        occurredAt: terminalAt,
        payload: {
          decision_id: decisionId,
          stage: terminalStatus === 'delivered' ? 'delivery_completed' : 'delivery_failed',
          delivery_id: deliveryId,
          connector: record.connector,
          destination: record.destination,
          action_id: record.action_id,
          delivery_status: terminalStatus,
          external_receipt_id: record.external_receipt_id ?? null,
          external_receipt_url: record.external_receipt_url ?? null,
          external_records: terminalStatus === 'delivered' ? normalizeExternalRecords(records) : undefined,
          external_warnings: terminalStatus === 'delivered' ? normalizeWarnings(warnings) : undefined,
          error_code: terminalStatus === 'failed' ? record.error_code ?? errorCode : undefined,
        },
      });
      return {
        receipt: receiptProjection(record, { records, warnings }),
        moment: await this.loadMoment({ tenantId, decisionId }),
      };
    },
  };
}

export function buildDecisionPackage(decision) {
  const catalog = scenarioCatalog(decision.scenario);
  const opportunity = decision.opportunity;
  assert.ok(opportunity, 'only actionable decisions can create a Moment');
  return {
    schemaVersion: '1.1',
    decisionId: decision.decisionId,
    tenantId: decision.tenantId,
    createdAt: decision.generatedAt,
    evidenceClass: decision.source.mode === 'live' ? 'sandbox' : 'fixture',
    growthPlay: {
      id: catalog.growthPlayId,
      name: catalog.growthPlay,
      businessLine: catalog.businessLine,
      objective: catalog.objective,
      primaryMetric: catalog.primaryMetric,
      protocolId: catalog.protocolId,
    },
    subject: { token: subjectToken(decision.tenantId, decision.decisionId) },
    moment: {
      type: opportunity.type,
      summary: opportunity.reason,
      confidence: opportunity.confidence,
      evidence: opportunity.signals.slice(0, 4).map((signal) => ({
        id: signal.type,
        label: signal.label,
        confidence: Math.round(signal.strength * 100),
        source: decision.source.name,
      })),
    },
    recommendation: {
      selectedAction: catalog.actions[0],
      alternatives: catalog.actions.slice(1),
    },
    governance: {
      policyStatus: decision.policy.allowed ? 'cleared' : 'suppressed',
      controls: [decision.policy.reason],
      humanReviewRequired: true,
      assignmentArm: 'treatment',
    },
    decisionMethod: {
      active: 'deterministic-baseline',
      shadowCandidate: 'model-assisted-planner',
    },
    response: { status: 'pending' },
    workflow: { connector: 'salesforce-fsc', status: 'ready' },
    outcome: { metric: catalog.primaryMetric, windowDays: 30, status: 'not-opened' },
  };
}

export function projectMoments(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const decisionId = payload(row).decision_id;
    if (!decisionId) continue;
    const events = grouped.get(decisionId) ?? [];
    events.push(row);
    grouped.set(decisionId, events);
  }
  return [...grouped.values()]
    .map(projectMoment)
    .filter(Boolean)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

export function projectMoment(rows) {
  const ordered = [...rows].sort((left, right) => Number(left.sequence_number ?? left.sequenceNumber) - Number(right.sequence_number ?? right.sequenceNumber));
  const decisionRow = ordered.find((row) => eventType(row) === 'decision' && payload(row).decision_package);
  if (!decisionRow) return null;
  const decisionPayload = payload(decisionRow);
  const responseRow = [...ordered].reverse().find((row) => eventType(row) === 'response');
  const activationRow = [...ordered].reverse().find((row) => eventType(row) === 'activation');
  const packageProjection = structuredClone(decisionPayload.decision_package);
  if (responseRow) {
    const responsePayload = payload(responseRow).response;
    packageProjection.response = {
      ...responsePayload,
      actor: payload(responseRow).actor_id,
      recordedAt: occurredAt(responseRow),
    };
    if (responsePayload?.actionId) {
      const allActions = [packageProjection.recommendation.selectedAction, ...packageProjection.recommendation.alternatives];
      const selectedAction = allActions.find((item) => item.id === responsePayload.actionId);
      if (selectedAction) {
        packageProjection.recommendation.selectedAction = selectedAction;
        packageProjection.recommendation.alternatives = allActions.filter((item) => item.id !== selectedAction.id);
      }
    }
  }
  const activation = activationRow ? payload(activationRow) : null;
  if (activation?.delivery_id) {
    packageProjection.workflow = {
      ...packageProjection.workflow,
      status: activation.delivery_status === 'delivered' ? 'delivered' : activation.delivery_status === 'failed' ? 'failed' : 'reserved',
      records: { delivery: activation.delivery_id },
    };
    if (activation.delivery_status === 'delivered') packageProjection.outcome.status = 'measuring';
  }
  return {
    id: `mom_${decisionPayload.decision_id}`,
    decisionId: decisionPayload.decision_id,
    scenario: decisionPayload.scenario,
    createdAt: occurredAt(decisionRow),
    sourceMode: decisionPayload.source?.mode,
    sourceName: decisionPayload.source?.name,
    opportunity: decisionPayload.opportunity,
    policy: decisionPayload.policy,
    runtime: decisionPayload.runtime,
    status: momentStatus(packageProjection, activation),
    decisionPackage: packageProjection,
    receipt: activation?.delivery_id ? {
      id: activation.delivery_id,
      url: activation.external_receipt_url ?? undefined,
      object: 'Connector delivery receipt',
      subject: packageProjection.growthPlay.name,
      records: normalizeExternalRecords(activation.external_records),
      warnings: normalizeWarnings(activation.external_warnings),
    } : undefined,
  };
}

function momentStatus(packageProjection, activation) {
  if (activation?.delivery_status === 'delivered') return 'activated';
  if (activation?.delivery_status === 'failed') return 'delivery_failed';
  if (activation?.delivery_id) return 'delivery_reserved';
  if (packageProjection.response.status === 'deferred') return 'deferred';
  if (packageProjection.response.status === 'declined') return 'declined';
  if (['accepted', 'modified'].includes(packageProjection.response.status)) return 'approved';
  return 'queued';
}

async function queryEvents(getDB, tenantId, decisionId, limit) {
  const db = await getDB();
  await db.connect();
  try {
    await beginTenantTransaction(db, tenantId);
    const rows = await queryEventsWithClient(db, tenantId, decisionId, limit);
    await db.query('COMMIT');
    return rows;
  } catch (error) {
    await db.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await db.end();
  }
}

async function queryEventsWithClient(db, tenantId, decisionId, limit = MOMENT_LIMIT) {
  const parameters = decisionId ? [tenantId, decisionId] : [tenantId, Math.min(Math.max(Number(limit) || MOMENT_LIMIT, 1), MOMENT_LIMIT)];
  const result = await db.query(
    decisionId
      ? `SELECT * FROM decision_ledger_events
          WHERE tenant_id = $1 AND payload->>'decision_id' = $2
          ORDER BY sequence_number ASC`
      : `SELECT * FROM decision_ledger_events
          WHERE tenant_id = $1
            AND event_type IN ('decision', 'response', 'activation')
          ORDER BY sequence_number DESC
          LIMIT $2`,
    parameters,
  );
  return result.rows;
}

function validateResponse(response) {
  assert.ok(response && typeof response === 'object' && !Array.isArray(response), 'response is required');
  assert.ok(RESPONSE_STATUSES.has(response.status), 'response status is invalid');
  if (response.actionId !== undefined) assertId(response.actionId, 'response.actionId');
  if (response.reason !== undefined) assert.ok(typeof response.reason === 'string' && response.reason.length <= 500, 'response.reason is invalid');
}

function assertAllowedResponse(packageProjection, response) {
  if (['accepted', 'modified'].includes(response.status)) {
    assertId(response.actionId, 'response.actionId');
    const actionIds = [packageProjection.recommendation.selectedAction, ...packageProjection.recommendation.alternatives].map((item) => item.id);
    assert.ok(actionIds.includes(response.actionId), 'response action is not in the approved catalog');
  }
}

function scenarioCatalog(scenario) {
  const catalog = ACTIONS[scenario];
  assert.ok(catalog, 'scenario is invalid');
  return catalog;
}

function connectorForAction(actionValue) {
  return actionValue.destination === 'Salesforce FSC' ? 'salesforce' : 'campaign_platform';
}

function destinationForAction(actionValue) {
  return actionValue.destination === 'Salesforce FSC' ? 'salesforce-fsc' : 'journey-orchestration';
}

function subjectToken(tenantId, decisionId) {
  return `tok_${createHash('sha256').update(`${tenantId}\u001f${decisionId}`).digest('hex').slice(0, 24)}`;
}

function ledgerReceipt(record) {
  return {
    sequenceNumber: Number(record.sequence_number ?? record.sequenceNumber),
    eventHash: record.event_hash ?? record.eventHash,
    recordedAt: occurredAt(record),
  };
}

function receiptProjection(record, { records, warnings } = {}) {
  return {
    deliveryId: record.delivery_id,
    status: record.status,
    externalReceiptId: record.external_receipt_id ?? null,
    externalReceiptUrl: record.external_receipt_url ?? null,
    records: normalizeExternalRecords(records),
    warnings: normalizeWarnings(warnings),
  };
}

function normalizeExternalRecords(value) {
  const source = value && typeof value === 'object' ? value : {};
  const record = (item) => {
    if (!item || typeof item !== 'object') return null;
    const id = typeof item.id === 'string' ? item.id.slice(0, 256) : '';
    const url = typeof item.url === 'string' && /^https:\/\//.test(item.url) ? item.url.slice(0, 2048) : '';
    return id && url ? { id, url } : null;
  };
  return {
    decision: record(source.decision),
    referral: record(source.referral),
    task: record(source.task),
  };
}

function normalizeWarnings(value) {
  return Array.isArray(value)
    ? value.slice(0, 4).map((item) => ({
      stage: typeof item?.stage === 'string' ? item.stage.slice(0, 80) : '',
      message: typeof item?.message === 'string' ? item.message.slice(0, 220) : '',
    })).filter((item) => item.stage || item.message)
    : [];
}

function action(id, title, instructions, ownerRole, destination) {
  return { id, title, instructions, ownerRole, destination };
}

function payload(row) {
  return row.payload && typeof row.payload === 'object' ? row.payload : {};
}

function eventType(row) {
  return row.event_type ?? row.eventType;
}

function occurredAt(row) {
  return new Date(row.recorded_at ?? row.recordedAt ?? row.occurred_at ?? row.occurredAt).toISOString();
}

function assertId(value, label) {
  assert.ok(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{1,255}$/.test(value), `${label} is invalid`);
}

function assertIso(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be ISO date-time`);
}
