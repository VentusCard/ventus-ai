import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import { beginTenantTransaction, validateTenantId } from './tenant-context.mjs';

const CONNECTORS = new Set(['salesforce-fsc', 'microsoft-outlook', 'slack']);
const MEASUREMENT_METRICS = new Set(['deposit_balance', 'deposit_retained', 'net_new_assets', 'estimated_revenue']);

/**
 * Durable, tenant-scoped control-plane projections. It intentionally stores
 * mappings and contracts, never OAuth/API secrets. Those stay in Secrets Manager.
 */
export function createEnterpriseControlPlane({ getDB, growthPlayRegistry, ledgerRepository = null, connectionTester = null }) {
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
            ORDER BY updated_at DESC, version DESC
            LIMIT 1`,
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
        if (targetStatus === 'active') {
          // A connector has one effective routing configuration at a time. A
          // rotated mapping must never leave an older active route behind.
          await db.query(
            `UPDATE connector_mapping_versions
                SET status = 'disabled', updated_by = $3, updated_at = now()
              WHERE tenant_id = $1
                AND connector = $2
                AND status = 'active'
                AND NOT (mapping_id = $4 AND version = $5)`,
            [tenantId, mapping.connector, actorId, mapping.mappingId, mapping.version],
          );
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

    async testConnection({ tenantId, mappingId, expectedVersion, actorId }) {
      validateTenantId(tenantId);
      assertIdentifier(mappingId, 'mappingId');
      assert.ok(Number.isInteger(expectedVersion) && expectedVersion > 0, 'expectedVersion is invalid');
      assertIdentifier(actorId, 'actorId');
      const mapping = await queryTenant(getDB, tenantId, async (db) => {
        const result = await db.query(
          `SELECT mapping_id, connector, version, status, configuration, updated_by, updated_at, last_tested_at, last_test_status
             FROM connector_mapping_versions
            WHERE tenant_id = $1 AND mapping_id = $2 AND version = $3`,
          [tenantId, mappingId, expectedVersion],
        );
        assert.equal(result.rows.length, 1, 'Connection mapping version was not found');
        const current = projectMapping(result.rows[0]);
        assert.equal(current.status, 'draft', 'Only draft mappings can be tested');
        validateMappingConfiguration(current.connector, current.configuration);
        return current;
      });
      try {
        const check = connectionTester
          ? await connectionTester({ tenantId, mapping })
          : { detail: 'Configuration validated; no live connector tester is deployed for this environment.' };
        const detail = safeConnectionDetail(check?.detail || 'Authenticated connector check succeeded.');
        return this.transitionConnection({ tenantId, mappingId, expectedVersion, targetStatus: 'tested', actorId, detail });
      } catch (error) {
        const detail = safeConnectionDetail(error?.message || 'Connector check failed.');
        const receipt = await this.recordConnectionTest({ tenantId, mappingId, version: expectedVersion, status: 'failed', detail, actorId });
        return { mapping, receipt, failed: true };
      }
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
      const recorded = await queryTenant(getDB, tenantId, async (db) => {
        const observation = outcome.outcome?.observation ?? null;
        const receiptId = fscObservationReceiptId({ tenantId, decisionRecordId: outcome.decisionRecordId, outcome });
        const inserted = await db.query(
          `INSERT INTO outcome_observation_receipts
             (tenant_id, observation_id, decision_id, decision_record_id, household_token, mapping_id, mapping_version, status, observation, synced_by, synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
           ON CONFLICT (tenant_id, observation_id) DO UPDATE SET synced_at = now()
           RETURNING observation_id, status, observation, synced_at`,
          [tenantId, receiptId, outcome.decisionId, outcome.decisionRecordId, moment.decisionPackage.subject.token, mapping.mappingId, mapping.version, outcome.outcome?.status ?? 'awaiting_outcome', observation, actorId],
        );
        const observationReceipt = {
          observationId: inserted.rows[0].observation_id,
          status: inserted.rows[0].status,
          observation: inserted.rows[0].observation,
          syncedAt: inserted.rows[0].synced_at,
        };
        const measurement = await promoteFscObservation(db, {
          tenantId,
          moment,
          outcome,
          observationReceipt,
        });
        return { observation: observationReceipt, measurement, eligibleForLift: measurement.status === 'recorded' };
      });
      if (!ledgerRepository || typeof ledgerRepository.append !== 'function') return recorded;
      const event = await ledgerRepository.append({
        tenantId,
        idempotencyKey: `fsc-observation:${recorded.observation.observationId}`,
        eventType: 'outcome',
        householdToken: moment.decisionPackage.subject.token,
        growthPlayId: moment.decisionPackage.growthPlay.id,
        policyVersion: moment.decisionPackageV12?.governance?.policyVersion ?? moment.decisionPackage.growthPlay.protocolId,
        status: 'confirmed',
        occurredAt: new Date(recorded.observation.syncedAt).toISOString(),
        payload: {
          decision_id: outcome.decisionId,
          decision_record_id: outcome.decisionRecordId,
          observation_id: recorded.observation.observationId,
          observation_only: true,
          source_system: 'salesforce-fsc',
          package_digest: moment.decisionPackageV12?.packageDigest ?? null,
        },
      });
      const ledgerReceipt = { sequenceNumber: Number(event.record.sequence_number ?? event.record.sequenceNumber), eventHash: event.record.event_hash ?? event.record.eventHash };
      let measurementLedgerReceipt = null;
      if (recorded.measurement.status === 'recorded') {
        const measurementEvent = await ledgerRepository.append({
          tenantId,
          idempotencyKey: `fsc-measurement:${recorded.measurement.eventId}`,
          eventType: 'outcome',
          householdToken: moment.decisionPackage.subject.token,
          growthPlayId: moment.decisionPackage.growthPlay.id,
          policyVersion: moment.decisionPackageV12?.governance?.policyVersion ?? moment.decisionPackage.growthPlay.protocolId,
          status: recorded.measurement.evidenceClass === 'sanctioned' ? 'confirmed' : 'simulated',
          occurredAt: recorded.measurement.occurredAt,
          payload: {
            event_id: recorded.measurement.eventId,
            decision_id: outcome.decisionId,
            experiment_id: recorded.measurement.experimentId,
            arm: recorded.measurement.arm,
            metric: recorded.measurement.metric,
            evidence_class: recorded.measurement.evidenceClass,
            source_system: 'salesforce-fsc',
            observation_id: recorded.observation.observationId,
            decision_protocol_id: moment.decisionPackage.growthPlay.protocolId,
          },
        });
        measurementLedgerReceipt = {
          sequenceNumber: Number(measurementEvent.record.sequence_number ?? measurementEvent.record.sequenceNumber),
          eventHash: measurementEvent.record.event_hash ?? measurementEvent.record.eventHash,
        };
      }
      return { ...recorded, ledgerReceipt, measurementLedgerReceipt };
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
        const [protocols, mappings, membership, measurements] = await Promise.all([
          db.query(`SELECT count(*) FILTER (WHERE latest.decision = 'approved')::int AS approved FROM growth_play_protocols p LEFT JOIN LATERAL (SELECT decision FROM growth_play_protocol_approval_events WHERE tenant_id = p.tenant_id AND decision_protocol_id = p.decision_protocol_id ORDER BY decided_at DESC LIMIT 1) latest ON true WHERE p.tenant_id = $1`, [tenantId]),
          db.query(`SELECT connector, bool_or(status = 'active') AS active FROM connector_mapping_versions WHERE tenant_id = $1 GROUP BY connector`, [tenantId]),
          db.query(`SELECT count(*) FILTER (WHERE status = 'active')::int AS active FROM institution_memberships WHERE tenant_id = $1`, [tenantId]),
          db.query(`SELECT count(*)::int AS count FROM outcome_events WHERE tenant_id = $1`, [tenantId]),
        ]);
        const activeConnectors = new Set(mappings.rows.filter((row) => row.active).map((row) => row.connector));
        const gates = [
          gate('identity_access', Number(membership.rows[0]?.active || 0) > 0, 'At least one scoped institution member'),
          gate('approved_growth_play', Number(protocols.rows[0]?.approved || 0) > 0, 'An independently approved Growth Play'),
          gate('system_of_record', activeConnectors.has('salesforce-fsc'), 'Active FSC mapping'),
          gate('coworker_route', activeConnectors.has('microsoft-outlook') || activeConnectors.has('slack'), 'Active employee notification route'),
          gate('outcome_return', activeConnectors.has('salesforce-fsc'), 'FSC return mapping is active'),
          gate('measurement_evidence', Number(measurements.rows[0]?.count || 0) > 0, 'At least one reconciled measurement event'),
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
          `WITH ranked_outcomes AS (
             SELECT o.*,
                    row_number() OVER (
                      PARTITION BY o.tenant_id, o.experiment_id, o.household_token, o.metric
                      ORDER BY COALESCE((o.payload->'provenance'->>'observed_at')::timestamptz, o.occurred_at) DESC,
                               COALESCE((o.payload->'provenance'->>'correction_sequence')::int, 0) DESC,
                               o.occurred_at DESC, o.event_id DESC
                    ) AS outcome_rank
               FROM outcome_events o
              WHERE o.tenant_id = $1
           )
           SELECT a.experiment_id, a.evidence_class, a.decision_protocol_id,
                  COALESCE((p.contract->'measurement'->>'minimum_per_arm')::int, 30) AS minimum_per_arm,
                  COALESCE((p.contract->'measurement'->>'minimum_coverage')::numeric, 0.9) AS minimum_coverage,
                  count(*) FILTER (WHERE a.arm = 'treatment')::int AS treatment_assigned,
                  count(*) FILTER (WHERE a.arm = 'holdout')::int AS holdout_assigned,
                  count(ro.event_id) FILTER (
                    WHERE a.arm = 'treatment'
                      AND ro.outcome_rank = 1
                      AND ro.metric = p.contract->'measurement'->>'metric'
                  )::int AS treatment_outcomes_observed,
                  count(ro.event_id) FILTER (
                    WHERE a.arm = 'holdout'
                      AND ro.outcome_rank = 1
                      AND ro.metric = p.contract->'measurement'->>'metric'
                  )::int AS holdout_outcomes_observed,
                  max(ro.occurred_at) FILTER (
                    WHERE ro.outcome_rank = 1
                      AND ro.metric = p.contract->'measurement'->>'metric'
                  ) AS last_outcome_at,
                  avg(ro.amount) FILTER (
                    WHERE a.arm = 'treatment'
                      AND ro.outcome_rank = 1
                      AND ro.metric = p.contract->'measurement'->>'metric'
                  ) AS treatment_mean,
                  avg(ro.amount) FILTER (
                    WHERE a.arm = 'holdout'
                      AND ro.outcome_rank = 1
                      AND ro.metric = p.contract->'measurement'->>'metric'
                  ) AS holdout_mean
             FROM experiment_assignments a
             LEFT JOIN growth_play_protocols p
               ON p.tenant_id = a.tenant_id
              AND p.decision_protocol_id = a.decision_protocol_id
             LEFT JOIN ranked_outcomes ro
               ON ro.tenant_id = a.tenant_id
              AND ro.experiment_id = a.experiment_id
              AND ro.household_token = a.household_token
            WHERE a.tenant_id = $1
            GROUP BY a.experiment_id, a.evidence_class, a.decision_protocol_id, p.contract
            ORDER BY max(a.assigned_at) DESC
            LIMIT 50`,
          [tenantId],
        );
        const [deliveries, observations] = await Promise.all([
          db.query(
            `SELECT status, count(*)::int AS count
               FROM connector_delivery_receipts
              WHERE tenant_id = $1
              GROUP BY status`,
            [tenantId],
          ),
          db.query(
            `SELECT status, count(*)::int AS count, max(synced_at) AS last_synced_at
               FROM outcome_observation_receipts
              WHERE tenant_id = $1
              GROUP BY status`,
            [tenantId],
          ),
        ]);
        return {
          experiments: result.rows.map((row) => {
            const readiness = projectMeasurementReadiness(row);
            return {
            ...readiness,
            experimentId: row.experiment_id,
            evidenceClass: row.evidence_class,
            decisionProtocolId: row.decision_protocol_id,
            treatmentAssigned: Number(row.treatment_assigned),
            holdoutAssigned: Number(row.holdout_assigned),
            outcomesObserved: Number(row.treatment_outcomes_observed) + Number(row.holdout_outcomes_observed),
            lastOutcomeAt: row.last_outcome_at,
            treatmentOutcomesObserved: Number(row.treatment_outcomes_observed),
            holdoutOutcomesObserved: Number(row.holdout_outcomes_observed),
            intentToTreatLift: readiness.ready && row.treatment_mean !== null && row.holdout_mean !== null
              ? Number(row.treatment_mean) - Number(row.holdout_mean) : null,
            };
          }),
          deliveries: Object.fromEntries(deliveries.rows.map((row) => [row.status, Number(row.count)])),
          outcomeObservations: observations.rows.reduce((sum, row) => sum + Number(row.count), 0),
          observationReconciliation: Object.fromEntries(observations.rows.map((row) => [row.status, {
            count: Number(row.count), lastSyncedAt: row.last_synced_at,
          }])),
          serverAuthoritative: true,
        };
      });
    },

    async governance({ tenantId }) {
      return queryTenant(getDB, tenantId, async (db) => {
        const [protocols, events, mappings, observations, skills, deliveries] = await Promise.all([
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
          db.query(
            `SELECT status, count(*)::int AS count, max(completed_at) AS last_completed_at
               FROM connector_delivery_receipts
              WHERE tenant_id = $1
              GROUP BY status`,
            [tenantId],
          ),
        ]);
        return {
          protocols: protocols.rows.map(projectProtocol),
          recentEvents: events.rows.map((row) => ({
            type: row.event_type,
            occurredAt: row.occurred_at,
            decisionId: row.payload?.decision_id || null,
            policyVersion: row.payload?.runtime?.policyVersion ?? row.payload?.policy?.version ?? null,
            modelVersion: row.payload?.decision_package_v12?.decisionMethod?.runtimeVersion ?? null,
            skillVersion: Array.isArray(row.payload?.decision_package_v12?.decisionMethod?.skillVersions)
              ? row.payload.decision_package_v12.decisionMethod.skillVersions.join(', ')
              : null,
          })),
          connections: mappings.rows.map((row) => ({ connector: row.connector, status: row.status, updatedAt: row.updated_at })),
          outcomeReconciliation: Object.fromEntries(observations.rows.map((row) => [row.status, Number(row.count)])),
          deliveryReconciliation: Object.fromEntries(deliveries.rows.map((row) => [row.status, {
            count: Number(row.count), lastCompletedAt: row.last_completed_at,
          }])),
          exceptions: deliveries.rows
            .filter((row) => row.status !== 'delivered')
            .map((row) => ({ type: `delivery_${row.status}`, count: Number(row.count), lastOccurredAt: row.last_completed_at })),
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
    for (const field of [
      'decisionObject', 'decisionReferenceField', 'decisionPackageField', 'humanResponseField',
      'outcomeStatusField', 'outcomeEventTypeField', 'outcomeMetricField', 'outcomeAmountField',
      'outcomeOccurredAtField', 'outcomeSourceRecordIdField', 'outcomeReasonCodeField',
    ]) {
      if (value[field] === undefined) continue;
      assert.ok(typeof value[field] === 'string' && /^[A-Za-z][A-Za-z0-9_]{0,119}$/.test(value[field]), `Salesforce ${field} is invalid`);
    }
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

function safeConnectionDetail(value) {
  return String(value)
    .replace(/(client[_-]?secret|access[_-]?token|refresh[_-]?token|password|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

async function promoteFscObservation(db, { tenantId, moment, outcome, observationReceipt }) {
  const observation = outcome?.outcome?.observation;
  if (outcome?.outcome?.status !== 'measured' || !observation) {
    return { status: 'observation_only', reason: 'awaiting_measured_outcome' };
  }
  const metric = cleanMeasurementMetric(observation.metric);
  const expectedMetric = cleanMeasurementMetric(moment?.decisionPackage?.outcome?.metric);
  const amount = Number(observation.amount);
  const occurredAt = typeof observation.occurredAt === 'string' && !Number.isNaN(Date.parse(observation.occurredAt))
    ? new Date(observation.occurredAt).toISOString()
    : null;
  if (!metric || !expectedMetric || metric !== expectedMetric || !Number.isFinite(amount) || !occurredAt) {
    return { status: 'observation_only', reason: 'outcome_does_not_match_registered_measurement' };
  }
  const assignmentResult = await db.query(
    `SELECT experiment_id, household_token, assignment_id, arm, assigned_at, evidence_class, decision_protocol_id
       FROM experiment_assignments
      WHERE tenant_id = $1
        AND household_token = $2
        AND decision_protocol_id = $3
        AND assigned_at <= $4
      ORDER BY assigned_at DESC
      LIMIT 1`,
    [tenantId, moment.decisionPackage.subject.token, moment.decisionPackage.growthPlay.protocolId, occurredAt],
  );
  const assignment = assignmentResult.rows[0];
  if (!assignment) return { status: 'observation_only', reason: 'no_preexisting_assignment' };
  const assignmentContext = await db.query(
    `SELECT 1
       FROM decision_ledger_events
      WHERE tenant_id = $1
        AND household_token = $2
        AND event_type = 'counterfactual'
        AND payload->>'experiment_id' = $3
        AND payload->>'decision_id' = $4
        AND payload->>'assignment_id' = $5
        AND payload->>'arm' = $6
        AND payload->>'decision_protocol_id' = $7
      LIMIT 1`,
    [tenantId, assignment.household_token, assignment.experiment_id, outcome.decisionId, assignment.assignment_id, assignment.arm, assignment.decision_protocol_id],
  );
  if (!assignmentContext.rows[0]) return { status: 'observation_only', reason: 'assignment_lineage_not_verified' };
  const windowDays = Number(moment.decisionPackage?.outcome?.windowDays);
  const deadline = Date.parse(assignment.assigned_at) + windowDays * 24 * 60 * 60 * 1000;
  if (!Number.isFinite(windowDays) || windowDays < 1 || Date.parse(occurredAt) > deadline) {
    return { status: 'observation_only', reason: 'outcome_outside_registered_window' };
  }
  const event = buildFscMeasurementEvent({ tenantId, moment, outcome, observationReceipt, assignment, metric, amount, occurredAt });
  await db.query(
    `INSERT INTO outcome_events
       (tenant_id, event_id, experiment_id, household_token, growth_play_id, decision_id,
        activation_id, event_type, occurred_at, arm, assigned_at, metric, amount, currency,
        source_system, source_record_id, reason_code, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     ON CONFLICT (tenant_id, event_id) DO NOTHING`,
    [event.tenant_id, event.event_id, event.assignment.experiment_id, event.household_token,
      event.growth_play_id, event.decision_id, event.activation_id, event.event_type,
      event.occurred_at, event.assignment.arm, event.assignment.assigned_at,
      event.value.metric, event.value.amount, event.value.currency, event.source_system,
      event.source_record_id, event.reason_code, event],
  );
  return {
    status: 'recorded', eventId: event.event_id, experimentId: event.assignment.experiment_id,
    arm: event.assignment.arm, metric: event.value.metric, occurredAt: event.occurred_at,
    evidenceClass: assignment.evidence_class,
  };
}

export function buildFscMeasurementEvent({ tenantId, moment, outcome, observationReceipt, assignment, metric, amount, occurredAt }) {
  const observedAt = typeof observationReceipt.syncedAt === 'string' && !Number.isNaN(Date.parse(observationReceipt.syncedAt))
    ? new Date(observationReceipt.syncedAt).toISOString()
    : occurredAt;
  const eventId = `evt_${createHash('sha256').update(`${tenantId}\u001f${observationReceipt.observationId}\u001f${assignment.experiment_id}`).digest('hex').slice(0, 24)}`;
  return {
    contract_version: '1.0',
    event_id: eventId,
    tenant_id: tenantId,
    household_token: moment.decisionPackage.subject.token,
    growth_play_id: moment.decisionPackage.growthPlay.id,
    decision_id: outcome.decisionId,
    activation_id: null,
    event_type: String(observationReceipt.observation?.eventType || 'fsc_measured_outcome').slice(0, 128),
    occurred_at: occurredAt,
    assignment: {
      experiment_id: assignment.experiment_id,
      arm: assignment.arm,
      assigned_at: new Date(assignment.assigned_at).toISOString(),
      decision_protocol_id: assignment.decision_protocol_id,
    },
    value: { metric, amount, currency: 'USD' },
    source_system: 'salesforce-fsc',
    source_record_id: String(observationReceipt.observation?.sourceRecordId || outcome.decisionRecordId).slice(0, 128),
    reason_code: typeof observationReceipt.observation?.reasonCode === 'string' ? observationReceipt.observation.reasonCode.slice(0, 128) : null,
    provenance: {
      source_version: 'salesforce-fsc-v1',
      observed_at: observedAt,
      correction_sequence: 0,
    },
  };
}

function cleanMeasurementMetric(value) {
  return typeof value === 'string' && MEASUREMENT_METRICS.has(value) ? value : null;
}

export function fscObservationReceiptId({ tenantId, decisionRecordId, outcome }) {
  const observation = outcome?.outcome?.observation ?? null;
  const fingerprint = JSON.stringify({
    status: outcome?.outcome?.status ?? 'awaiting_outcome',
    observation: observation && {
      eventType: observation.eventType ?? null,
      occurredAt: observation.occurredAt ?? null,
      sourceRecordId: observation.sourceRecordId ?? null,
      reasonCode: observation.reasonCode ?? null,
      metric: observation.metric ?? null,
      amount: Number.isFinite(observation.amount) ? observation.amount : null,
      currency: observation.currency ?? null,
    },
  });
  return `obs_${createHash('sha256').update(`${tenantId}\u001f${decisionRecordId}\u001f${fingerprint}`).digest('hex').slice(0, 24)}`;
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

export function projectMeasurementReadiness(row) {
  const treatmentAssigned = Number(row.treatment_assigned || 0);
  const holdoutAssigned = Number(row.holdout_assigned || 0);
  const treatmentObserved = Number(row.treatment_outcomes_observed || 0);
  const holdoutObserved = Number(row.holdout_outcomes_observed || 0);
  const minimumPerArm = Number(row.minimum_per_arm || 30);
  const minimumCoverage = Number(row.minimum_coverage || 0.9);
  const treatmentCoverage = treatmentAssigned > 0 ? treatmentObserved / treatmentAssigned : 0;
  const holdoutCoverage = holdoutAssigned > 0 ? holdoutObserved / holdoutAssigned : 0;
  const coverage = Math.min(treatmentCoverage, holdoutCoverage);
  const sampleReady = treatmentObserved >= minimumPerArm && holdoutObserved >= minimumPerArm;
  const coverageReady = treatmentCoverage >= minimumCoverage && holdoutCoverage >= minimumCoverage;
  const ready = sampleReady && coverageReady;
  return {
    coverage,
    treatmentCoverage,
    holdoutCoverage,
    minimumPerArm,
    minimumCoverage,
    sampleReady,
    coverageReady,
    ready,
    evaluationStatus: ready ? 'measured' : !sampleReady ? 'insufficient_sample' : 'incomplete_outcome_coverage',
    confidence: ready ? 'reviewable' : !sampleReady ? 'insufficient_sample' : 'coverage_incomplete',
    claimStatus: ready ? 'independent_review_required' : 'not_eligible',
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
