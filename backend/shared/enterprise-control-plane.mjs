import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import { beginTenantTransaction, validateTenantId } from './tenant-context.mjs';

const CONNECTORS = new Set(['salesforce-fsc', 'microsoft-outlook', 'slack']);

/**
 * Durable, tenant-scoped control-plane projections. It intentionally stores
 * mappings and contracts, never OAuth/API secrets. Those stay in Secrets Manager.
 */
export function createEnterpriseControlPlane({ getDB, growthPlayRegistry }) {
  assert.equal(typeof getDB, 'function', 'getDB is required');
  assert.ok(growthPlayRegistry && typeof growthPlayRegistry.register === 'function', 'growthPlayRegistry is required');

  return {
    async listGrowthPlays({ tenantId }) {
      return queryTenant(getDB, tenantId, async (db) => {
        const [drafts, protocols] = await Promise.all([
          db.query(
            `SELECT draft_id, version, contract, status, updated_by, updated_at
               FROM growth_play_drafts
              WHERE tenant_id = $1
              ORDER BY updated_at DESC
              LIMIT 50`,
            [tenantId],
          ),
          db.query(
            `SELECT p.decision_protocol_id, p.growth_play_id, p.version, p.business_line,
                    p.contract, p.registered_at,
                    latest.decision AS approval_status, latest.decided_at AS approval_decided_at
               FROM growth_play_protocols p
               LEFT JOIN LATERAL (
                 SELECT decision, decided_at
                   FROM growth_play_protocol_approval_events
                  WHERE tenant_id = p.tenant_id
                    AND decision_protocol_id = p.decision_protocol_id
                  ORDER BY decided_at DESC, approval_event_id DESC
                  LIMIT 1
               ) latest ON true
              WHERE p.tenant_id = $1
              ORDER BY p.registered_at DESC
              LIMIT 50`,
            [tenantId],
          ),
        ]);
        return {
          drafts: drafts.rows.map(projectDraft),
          protocols: protocols.rows.map(projectProtocol),
        };
      });
    },

    async saveDraft({ tenantId, draftId, expectedVersion = 0, contract, actorId }) {
      validateTenantId(tenantId);
      assertIdentifier(draftId, 'draftId');
      assert.ok(Number.isInteger(expectedVersion) && expectedVersion >= 0, 'expectedVersion is invalid');
      assertIdentifier(actorId, 'actorId');
      validateDraftContract(contract);
      return queryTenant(getDB, tenantId, async (db) => {
        const existing = await db.query(
          `SELECT version FROM growth_play_drafts
            WHERE tenant_id = $1 AND draft_id = $2
            FOR UPDATE`,
          [tenantId, draftId],
        );
        const currentVersion = Number(existing.rows[0]?.version || 0);
        assert.equal(currentVersion, expectedVersion, 'Growth Play draft changed; refresh before saving');
        const nextVersion = currentVersion + 1;
        const status = 'draft';
        const result = await db.query(
          `INSERT INTO growth_play_drafts
             (tenant_id, draft_id, version, contract, status, updated_by, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,now())
           ON CONFLICT (tenant_id, draft_id) DO UPDATE
             SET version = EXCLUDED.version, contract = EXCLUDED.contract,
                 status = EXCLUDED.status, updated_by = EXCLUDED.updated_by, updated_at = now()
           RETURNING draft_id, version, contract, status, updated_by, updated_at`,
          [tenantId, draftId, nextVersion, contract, status, actorId],
        );
        return projectDraft(result.rows[0]);
      });
    },

    async registerDraft({ tenantId, draftId, actorId, sessionId, identityProvider, registeredAt }) {
      validateTenantId(tenantId);
      assertIdentifier(draftId, 'draftId');
      const draft = await queryTenant(getDB, tenantId, async (db) => {
        const result = await db.query(
          `SELECT draft_id, version, contract FROM growth_play_drafts
            WHERE tenant_id = $1 AND draft_id = $2`,
          [tenantId, draftId],
        );
        assert.equal(result.rows.length, 1, 'Growth Play draft was not found');
        return result.rows[0];
      });
      const compiled = compileGrowthPlayContract(draft.contract);
      const registration = await growthPlayRegistry.register({
        tenantId,
        contract: compiled,
        registeredBy: actorId,
        registeredBySessionId: sessionId,
        identityProvider,
        registeredAt,
      });
      await queryTenant(getDB, tenantId, (db) => db.query(
        `UPDATE growth_play_drafts
            SET status = 'registered', updated_at = now()
          WHERE tenant_id = $1 AND draft_id = $2`,
        [tenantId, draftId],
      ));
      return { draftId, protocol: projectProtocol({ ...registration.record, approval_status: null }) };
    },

    async listConnections({ tenantId }) {
      return queryTenant(getDB, tenantId, async (db) => {
        const result = await db.query(
          `SELECT DISTINCT ON (mapping_id)
                  mapping_id, connector, version, status, configuration,
                  updated_by, updated_at, last_tested_at, last_test_status
             FROM connector_mapping_versions
            WHERE tenant_id = $1
            ORDER BY mapping_id, version DESC`,
          [tenantId],
        );
        return { mappings: result.rows.map(projectMapping) };
      });
    },

    async saveConnection({ tenantId, mappingId, connector, expectedVersion = 0, status, configuration, actorId }) {
      validateTenantId(tenantId);
      assertIdentifier(mappingId, 'mappingId');
      assert.ok(CONNECTORS.has(connector), 'connector is unsupported');
      assert.ok(Number.isInteger(expectedVersion) && expectedVersion >= 0, 'expectedVersion is invalid');
      assert.equal(status, 'draft', 'new connection versions must start as draft');
      assertIdentifier(actorId, 'actorId');
      validateMappingConfiguration(connector, configuration);
      return queryTenant(getDB, tenantId, async (db) => {
        const latest = await db.query(
          `SELECT version, connector FROM connector_mapping_versions
            WHERE tenant_id = $1 AND mapping_id = $2
            ORDER BY version DESC LIMIT 1 FOR UPDATE`,
          [tenantId, mappingId],
        );
        const currentVersion = Number(latest.rows[0]?.version || 0);
        assert.equal(currentVersion, expectedVersion, 'Connection mapping changed; refresh before saving');
        if (latest.rows[0]) assert.equal(latest.rows[0].connector, connector, 'connector cannot change for an existing mapping');
        const result = await db.query(
          `INSERT INTO connector_mapping_versions
             (tenant_id, mapping_id, connector, version, status, configuration, updated_by, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,now())
           RETURNING mapping_id, connector, version, status, configuration, updated_by, updated_at,
                     last_tested_at, last_test_status`,
          [tenantId, mappingId, connector, currentVersion + 1, status, configuration, actorId],
        );
        return projectMapping(result.rows[0]);
      });
    },

    async activeConnection({ tenantId, connector }) {
      validateTenantId(tenantId);
      assert.ok(CONNECTORS.has(connector), 'connector is unsupported');
      return queryTenant(getDB, tenantId, async (db) => {
        const result = await db.query(
          `SELECT mapping_id, connector, version, status, configuration,
                  updated_by, updated_at, last_tested_at, last_test_status
             FROM connector_mapping_versions
            WHERE tenant_id = $1 AND connector = $2 AND status = 'active'
            ORDER BY updated_at DESC, version DESC`,
          [tenantId, connector],
        );
        return result.rows.map(projectMapping)[0] || null;
      });
    },

    async transitionConnection({ tenantId, mappingId, expectedVersion, targetStatus, actorId, detail }) {
      validateTenantId(tenantId);
      assertIdentifier(mappingId, 'mappingId');
      assert.ok(Number.isInteger(expectedVersion) && expectedVersion > 0, 'expectedVersion is invalid');
      assert.ok(['tested', 'approved', 'active', 'disabled'].includes(targetStatus), 'connection transition is unsupported');
      assertIdentifier(actorId, 'actorId');
      return queryTenant(getDB, tenantId, async (db) => {
        const current = await db.query(
          `SELECT mapping_id, connector, version, status, configuration, updated_by, updated_at, last_tested_at, last_test_status
             FROM connector_mapping_versions
            WHERE tenant_id = $1 AND mapping_id = $2 AND version = $3 FOR UPDATE`,
          [tenantId, mappingId, expectedVersion],
        );
        assert.equal(current.rows.length, 1, 'Connection mapping version was not found');
        const mapping = projectMapping(current.rows[0]);
        assertTransition(mapping.status, targetStatus);
        if (targetStatus === 'tested') {
          validateMappingConfiguration(mapping.connector, mapping.configuration);
          const receipt = await insertConnectionTestReceipt(db, { tenantId, mappingId, version: mapping.version, status: 'passed', detail: detail || 'Configuration validated; credentials remain sealed server-side.', actorId });
          const updated = await db.query(
            `UPDATE connector_mapping_versions SET status = 'tested', last_tested_at = now(), last_test_status = 'passed', updated_by = $4, updated_at = now()
              WHERE tenant_id = $1 AND mapping_id = $2 AND version = $3
              RETURNING mapping_id, connector, version, status, configuration, updated_by, updated_at, last_tested_at, last_test_status`,
            [tenantId, mappingId, mapping.version, actorId],
          );
          return { mapping: projectMapping(updated.rows[0]), receipt };
        }
        const updated = await db.query(
          `UPDATE connector_mapping_versions SET status = $4, updated_by = $5, updated_at = now()
            WHERE tenant_id = $1 AND mapping_id = $2 AND version = $3
            RETURNING mapping_id, connector, version, status, configuration, updated_by, updated_at, last_tested_at, last_test_status`,
          [tenantId, mappingId, mapping.version, targetStatus, actorId],
        );
        return { mapping: projectMapping(updated.rows[0]), receipt: null };
      });
    },

    async recordConnectionTest({ tenantId, mappingId, version, status, detail, actorId }) {
      validateTenantId(tenantId);
      assertIdentifier(mappingId, 'mappingId');
      assert.ok(Number.isInteger(version) && version > 0, 'mapping version is invalid');
      assert.ok(['passed', 'failed'].includes(status), 'test status is invalid');
      assertIdentifier(actorId, 'actorId');
      const safeDetail = typeof detail === 'string' ? detail.replace(/\s+/g, ' ').trim().slice(0, 500) : '';
      return queryTenant(getDB, tenantId, async (db) => {
        const receipt = await insertConnectionTestReceipt(db, { tenantId, mappingId, version, status, detail: safeDetail, actorId });
        await db.query(
          `UPDATE connector_mapping_versions
              SET last_tested_at = now(), last_test_status = $4
            WHERE tenant_id = $1 AND mapping_id = $2 AND version = $3`,
          [tenantId, mappingId, version, status],
        );
        return { ...receipt, status, detail: safeDetail || null };
      });
    },

    async recordFscOutcome({ tenantId, moment, outcome, mapping, actorId }) {
      validateTenantId(tenantId);
      assert.ok(moment?.decisionPackage?.subject?.token, 'Moment Decision Package is required');
      assert.ok(outcome?.decisionRecordId && outcome?.decisionId, 'Salesforce outcome receipt is required');
      return queryTenant(getDB, tenantId, async (db) => {
        const observation = outcome.outcome?.observation ?? null;
        const receiptId = `obs_${createHash('sha256').update(`${tenantId}\u001f${outcome.decisionRecordId}\u001f${outcome.outcome?.status ?? 'awaiting'}`).digest('hex').slice(0, 24)}`;
        const inserted = await db.query(
          `INSERT INTO outcome_observation_receipts
             (tenant_id, observation_id, decision_id, decision_record_id, household_token, mapping_id, mapping_version, status, observation, synced_by, synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
           ON CONFLICT (tenant_id, observation_id) DO UPDATE SET synced_at = now()
           RETURNING observation_id, status, observation, synced_at`,
          [tenantId, receiptId, outcome.decisionId, outcome.decisionRecordId, moment.decisionPackage.subject.token, mapping.mappingId, mapping.version, outcome.outcome?.status ?? 'awaiting_outcome', observation, actorId],
        );
        return { observation: { observationId: inserted.rows[0].observation_id, status: inserted.rows[0].status, observation: inserted.rows[0].observation, syncedAt: inserted.rows[0].synced_at }, eligibleForLift: false };
      });
    },

    async listSkillShadows({ tenantId }) {
      return queryTenant(getDB, tenantId, async (db) => {
        const result = await db.query(
          `SELECT skill_id, version, status, benchmark, updated_by, updated_at
             FROM skill_shadow_registry WHERE tenant_id = $1
             ORDER BY updated_at DESC LIMIT 50`, [tenantId],
        );
        return { skills: result.rows.map((row) => ({ skillId: row.skill_id, version: row.version, status: row.status, benchmark: row.benchmark, updatedBy: row.updated_by, updatedAt: row.updated_at })) };
      });
    },

    async onboardingReadiness({ tenantId }) {
      return queryTenant(getDB, tenantId, async (db) => {
        const [protocols, mappings, membership, observations] = await Promise.all([
          db.query(`SELECT count(*) FILTER (WHERE latest.decision = 'approved')::int AS approved FROM growth_play_protocols p LEFT JOIN LATERAL (SELECT decision FROM growth_play_protocol_approval_events WHERE tenant_id = p.tenant_id AND decision_protocol_id = p.decision_protocol_id ORDER BY decided_at DESC LIMIT 1) latest ON true WHERE p.tenant_id = $1`, [tenantId]),
          db.query(`SELECT connector, bool_or(status = 'active') AS active FROM connector_mapping_versions WHERE tenant_id = $1 GROUP BY connector`, [tenantId]),
          db.query(`SELECT count(*) FILTER (WHERE status = 'active')::int AS active FROM institution_memberships WHERE tenant_id = $1`, [tenantId]),
          db.query(`SELECT count(*)::int AS count FROM outcome_observation_receipts WHERE tenant_id = $1`, [tenantId]),
        ]);
        const activeConnectors = new Set(mappings.rows.filter((row) => row.active).map((row) => row.connector));
        const gates = [
          gate('identity_access', Number(membership.rows[0]?.active || 0) > 0, 'At least one scoped institution member'),
          gate('approved_growth_play', Number(protocols.rows[0]?.approved || 0) > 0, 'An independently approved Growth Play'),
          gate('system_of_record', activeConnectors.has('salesforce-fsc'), 'Active FSC mapping'),
          gate('coworker_route', activeConnectors.has('microsoft-outlook') || activeConnectors.has('slack'), 'Active employee notification route'),
          gate('outcome_return', activeConnectors.has('salesforce-fsc'), 'FSC return mapping is active'),
          gate('measurement_evidence', Number(observations.rows[0]?.count || 0) > 0, 'At least one durable outcome observation'),
        ];
        return { gates, ready: gates.every((item) => item.ready), serverAuthoritative: true };
      });
    },

    async saveSkillShadow({ tenantId, skillId, version, status, benchmark, actorId }) {
      validateTenantId(tenantId);
      assertIdentifier(skillId, 'skillId');
      assert.ok(typeof version === 'string' && version.length > 0 && version.length <= 80, 'skill version is invalid');
      assert.ok(['draft', 'shadow', 'promotion_review', 'promoted', 'paused'].includes(status), 'skill status is invalid');
      assertIdentifier(actorId, 'actorId');
      assertJson(benchmark, 'skill benchmark');
      if (status === 'promoted') assert.equal(benchmark?.approval?.approved, true, 'promoted Skills require an independent approval receipt');
      return queryTenant(getDB, tenantId, async (db) => {
        const result = await db.query(
          `INSERT INTO skill_shadow_registry (tenant_id, skill_id, version, status, benchmark, updated_by, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,now())
           ON CONFLICT (tenant_id, skill_id, version) DO UPDATE
             SET status = EXCLUDED.status, benchmark = EXCLUDED.benchmark, updated_by = EXCLUDED.updated_by, updated_at = now()
           RETURNING skill_id, version, status, benchmark, updated_by, updated_at`,
          [tenantId, skillId, version, status, benchmark, actorId],
        );
        const row = result.rows[0];
        return { skillId: row.skill_id, version: row.version, status: row.status, benchmark: row.benchmark, updatedBy: row.updated_by, updatedAt: row.updated_at };
      });
    },

    async results({ tenantId }) {
      return queryTenant(getDB, tenantId, async (db) => {
        const result = await db.query(
          `SELECT a.experiment_id, a.evidence_class, a.decision_protocol_id,
                  count(*) FILTER (WHERE a.arm = 'treatment')::int AS treatment_assigned,
                  count(*) FILTER (WHERE a.arm = 'holdout')::int AS holdout_assigned,
                  count(o.event_id)::int AS outcomes_observed,
                  max(o.occurred_at) AS last_outcome_at,
                  avg(o.amount) FILTER (WHERE a.arm = 'treatment') AS treatment_mean,
                  avg(o.amount) FILTER (WHERE a.arm = 'holdout') AS holdout_mean
             FROM experiment_assignments a
             LEFT JOIN outcome_events o
               ON o.tenant_id = a.tenant_id
              AND o.experiment_id = a.experiment_id
              AND o.household_token = a.household_token
            WHERE a.tenant_id = $1
            GROUP BY a.experiment_id, a.evidence_class, a.decision_protocol_id
            ORDER BY max(a.assigned_at) DESC
            LIMIT 50`,
          [tenantId],
        );
        const deliveries = await db.query(
          `SELECT status, count(*)::int AS count
             FROM connector_delivery_receipts
            WHERE tenant_id = $1
            GROUP BY status`,
          [tenantId],
        );
        return {
          experiments: result.rows.map((row) => ({
            experimentId: row.experiment_id,
            evidenceClass: row.evidence_class,
            decisionProtocolId: row.decision_protocol_id,
            treatmentAssigned: Number(row.treatment_assigned),
            holdoutAssigned: Number(row.holdout_assigned),
            outcomesObserved: Number(row.outcomes_observed),
            lastOutcomeAt: row.last_outcome_at,
            coverage: Number(row.treatment_assigned) + Number(row.holdout_assigned) ? Number(row.outcomes_observed) / (Number(row.treatment_assigned) + Number(row.holdout_assigned)) : 0,
            sampleReady: Number(row.treatment_assigned) >= 30 && Number(row.holdout_assigned) >= 30,
            intentToTreatLift: row.treatment_mean === null || row.holdout_mean === null ? null : Number(row.treatment_mean) - Number(row.holdout_mean),
            confidence: Number(row.outcomes_observed) >= 60 ? 'reviewable' : 'insufficient_sample',
            claimStatus: Number(row.outcomes_observed) >= 60 ? 'independent_review_required' : 'not_eligible',
          })),
          deliveries: Object.fromEntries(deliveries.rows.map((row) => [row.status, Number(row.count)])),
          serverAuthoritative: true,
        };
      });
    },

    async governance({ tenantId }) {
      return queryTenant(getDB, tenantId, async (db) => {
        const [protocols, events, mappings, observations, skills] = await Promise.all([
          db.query(
            `SELECT p.decision_protocol_id, p.growth_play_id, p.business_line, p.registered_at,
                    latest.decision AS approval_status, latest.decided_at AS approval_decided_at
               FROM growth_play_protocols p
               LEFT JOIN LATERAL (
                 SELECT decision, decided_at FROM growth_play_protocol_approval_events
                  WHERE tenant_id = p.tenant_id AND decision_protocol_id = p.decision_protocol_id
                  ORDER BY decided_at DESC, approval_event_id DESC LIMIT 1
               ) latest ON true
              WHERE p.tenant_id = $1 ORDER BY p.registered_at DESC LIMIT 50`, [tenantId]),
          db.query(
            `SELECT event_type, occurred_at, payload
               FROM decision_ledger_events
              WHERE tenant_id = $1
                AND event_type IN ('decision', 'policy', 'response', 'activation', 'outcome')
              ORDER BY sequence_number DESC LIMIT 50`, [tenantId]),
          db.query(
            `SELECT connector, status, max(updated_at) AS updated_at
               FROM connector_mapping_versions
              WHERE tenant_id = $1
              GROUP BY connector, status`, [tenantId]),
          db.query(`SELECT status, count(*)::int AS count FROM outcome_observation_receipts WHERE tenant_id = $1 GROUP BY status`, [tenantId]),
          db.query(`SELECT skill_id, version, status, updated_at FROM skill_shadow_registry WHERE tenant_id = $1 ORDER BY updated_at DESC LIMIT 20`, [tenantId]),
        ]);
        return {
          protocols: protocols.rows.map(projectProtocol),
          recentEvents: events.rows.map((row) => ({
            type: row.event_type,
            occurredAt: row.occurred_at,
            decisionId: row.payload?.decision_id || null,
          })),
          connections: mappings.rows.map((row) => ({ connector: row.connector, status: row.status, updatedAt: row.updated_at })),
          outcomeReconciliation: Object.fromEntries(observations.rows.map((row) => [row.status, Number(row.count)])),
          skills: skills.rows.map((row) => ({ skillId: row.skill_id, version: row.version, status: row.status, updatedAt: row.updated_at })),
          serverAuthoritative: true,
        };
      });
    },
  };
}

async function queryTenant(getDB, tenantId, callback) {
  validateTenantId(tenantId);
  const db = await getDB();
  await db.connect();
  try {
    await beginTenantTransaction(db, tenantId);
    const result = await callback(db);
    await db.query('COMMIT');
    return result;
  } catch (error) {
    await db.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await db.end();
  }
}

function validateDraftContract(value) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'Growth Play contract is required');
  // Compile validates the complete contract later. The draft boundary only rejects
  // data that could never be a controlled contract or safe JSON payload.
  assertIdentifier(value.growth_play_id, 'growth_play_id');
  assert.ok(typeof value.version === 'string' && value.version.length <= 40, 'version is invalid');
  assertIdentifier(value.business_line, 'business_line');
  assert.ok(typeof value.objective === 'string' && value.objective.trim().length >= 8 && value.objective.length <= 500, 'objective is invalid');
  assert.ok(value.source && value.eligibility && value.policy && Array.isArray(value.actions) && value.measurement, 'all six Growth Play steps are required');
  assertJson(value, 'Growth Play contract');
}

function validateMappingConfiguration(connector, value) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'mapping configuration is required');
  assertJson(value, 'mapping configuration');
  const serialized = JSON.stringify(value).toLowerCase();
  assert.ok(!/(client[_-]?secret|access[_-]?token|refresh[_-]?token|password|api[_-]?key)/.test(serialized), 'connection mappings must not contain credentials');
  if (connector === 'salesforce-fsc') {
    assert.ok(typeof value.decisionObject === 'string' && value.decisionObject.length <= 120, 'Salesforce decision object is required');
    assert.ok(typeof value.outcomeStatusField === 'string' && value.outcomeStatusField.length <= 120, 'Salesforce outcome status field is required');
  }
  if (connector === 'microsoft-outlook') {
    assert.ok(typeof value.recipient === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.recipient), 'Outlook recipient is required');
  }
  if (connector === 'slack') {
    assertIdentifier(value.channelId, 'Slack channelId');
  }
}

function assertJson(value, label) {
  const serialized = JSON.stringify(value);
  assert.ok(serialized && serialized.length <= 24_000, `${label} is too large`);
}

function projectDraft(row) {
  return {
    draftId: row.draft_id,
    version: Number(row.version),
    contract: row.contract,
    status: row.status,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
  };
}

function projectProtocol(row) {
  return {
    decisionProtocolId: row.decision_protocol_id ?? row.decisionProtocolId,
    growthPlayId: row.growth_play_id ?? row.growthPlayId,
    version: row.version,
    businessLine: row.business_line ?? row.businessLine,
    contract: row.contract,
    registeredAt: row.registered_at ?? row.registeredAt,
    approvalStatus: row.approval_status ?? null,
    approvalDecidedAt: row.approval_decided_at ?? null,
  };
}

function projectMapping(row) {
  return {
    mappingId: row.mapping_id,
    connector: row.connector,
    version: Number(row.version),
    status: row.status,
    configuration: row.configuration,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
    lastTestedAt: row.last_tested_at,
    lastTestStatus: row.last_test_status,
  };
}

function gate(id, ready, requirement) {
  return { id, ready: Boolean(ready), requirement };
}

function receiptId(tenantId, mappingId, version, status, detail) {
  return `ctr_${createHash('sha256').update(`${tenantId}\u001f${mappingId}\u001f${version}\u001f${status}\u001f${detail}`).digest('hex').slice(0, 24)}`;
}

function assertTransition(current, target) {
  const allowed = {
    draft: new Set(['tested']),
    tested: new Set(['approved', 'disabled']),
    approved: new Set(['active', 'disabled']),
    active: new Set(['disabled']),
    disabled: new Set(),
  };
  assert.ok(allowed[current]?.has(target), `Connection cannot move from ${current} to ${target}`);
}

async function insertConnectionTestReceipt(db, { tenantId, mappingId, version, status, detail, actorId }) {
  const id = receiptId(tenantId, mappingId, version, status, detail || '');
  const result = await db.query(
    `INSERT INTO connector_mapping_test_receipts
       (tenant_id, receipt_id, mapping_id, mapping_version, status, detail, tested_by, tested_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,now())
     ON CONFLICT (tenant_id, receipt_id) DO UPDATE SET tested_at = now()
     RETURNING receipt_id, status, detail, tested_at`,
    [tenantId, id, mappingId, version, status, detail || null, actorId],
  );
  return { receiptId: result.rows[0].receipt_id, status: result.rows[0].status, detail: result.rows[0].detail, testedAt: result.rows[0].tested_at };
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{1,127}$/.test(value), `${label} is invalid`);
}
