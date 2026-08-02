import assert from 'node:assert/strict';
import test from 'node:test';
import { createConsoleApiHandler } from './console-api.mjs';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import { executeHostedDecision } from './hosted-decision-runtime.mjs';

const identity = {
  subject: 'cognito_subject_123',
  tenantHint: 'ventus',
  issuer: 'https://issuer.example.com/pool',
};
const membership = {
  email: 'operator@ventusai.com',
  role: 'institution_admin',
  status: 'active',
  entitlements: ['growth_console', 'wealth_demo'],
  businessLines: ['wealth'],
  queueScopes: ['wealth-advisory'],
};

test('Console API returns the institution-scoped principal', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async (token) => token === 'valid-token' ? identity : null,
    resolveMembership: async () => membership,
  });
  const result = await handler(request());
  const body = JSON.parse(result.body);

  assert.equal(result.statusCode, 200);
  assert.equal(body.tenantId, 'ventus');
  assert.equal(body.role, 'institution_admin');
  assert.deepEqual(body.entitlements, ['growth_console', 'wealth_demo']);
  assert.deepEqual(body.businessLineScopes, ['wealth']);
  assert.deepEqual(body.queueScopes, ['wealth-advisory']);
  assert.equal(body.authProvider, 'cognito');
  assert.equal(result.headers['Cache-Control'], 'no-store');
});

test('Console API fails closed for invalid tokens and inactive memberships', async () => {
  const invalidToken = createConsoleApiHandler({
    verifyIdentity: async () => null,
    resolveMembership: async () => membership,
  });
  assert.equal((await invalidToken(request())).statusCode, 401);

  const inactiveMembership = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => null,
  });
  assert.equal((await inactiveMembership(request())).statusCode, 403);
});

test('Console API reports pending access without granting console operations', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, status: 'pending' }),
    executeDecision: executeHostedDecision,
    appendDecision: async () => { throw new Error('should not write'); },
  });
  const access = JSON.parse((await handler(request())).body);
  assert.equal(access.status, 'pending');
  const decision = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run', body: JSON.stringify(decisionBody()),
  }));
  assert.equal(decision.statusCode, 403);
});

test('Console API rejects unapproved browser origins', async () => {
  process.env.VENTUS_ALLOWED_ORIGINS = 'https://dev.example.com';
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => membership,
  });
  const result = await handler(request('https://unapproved.example.com'));
  assert.equal(result.statusCode, 403);
});

test('Console API persists an entitled hosted decision and returns its receipt', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    executeDecision: executeHostedDecision,
    appendDecision: async ({ decision, requestId }) => ({
      persisted: true,
      inserted: true,
      sequenceNumber: 7,
      eventHash: `${decision.decisionId.slice(4).padEnd(64, '0')}`,
      recordedAt: '2026-07-30T00:00:00.000Z',
      requestId,
    }),
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify(decisionBody()),
  }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 200);
  assert.equal(body.status, 'qualified');
  assert.equal(body.tenantId, 'ventus');
  assert.equal(body.ledgerReceipt.persisted, true);
  assert.equal(body.ledgerReceipt.sequenceNumber, 7);
});

test('Console API fails closed when connected evidence has no independently approved Growth Play', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    executeDecision: executeHostedDecision,
    appendDecision: async () => { throw new Error('should not write'); },
    growthPlayRegistry: {
      async requireLatestApproved() {
        throw new Error('no approved protocol');
      },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify({ ...decisionBody(), source: { mode: 'live', name: 'Plaid sandbox' } }),
  }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 409);
  assert.equal(body.code, 'growth_play_approval_required');
});

test('Console API permits a controlled sandbox run only for an entitled operator', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'bank_operator', entitlements: ['growth_console', 'consumer_demo'], businessLines: ['consumer-banking'], queueScopes: [] }),
    runControlledSandbox: async (input) => ({ status: 'holdout', tenantId: input.tenantId, businessClaimAllowed: false }),
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/controlled-sandbox-run',
    body: JSON.stringify({ scenario: 'deposit-retention' }),
  }));
  assert.equal(result.statusCode, 200);
  assert.equal(JSON.parse(result.body).status, 'holdout');
});

test('Console API limits sandbox evidence bundles to a risk reviewer', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'risk_reviewer',
      entitlements: ['growth_console'],
      businessLines: ['consumer-banking'],
    }),
    exportEvidenceBundle: async ({ tenantId, experimentId }) => ({ tenantId, experimentId, evidenceClass: 'partner_sandbox' }),
  });
  const result = await handler(request('https://dev.example.com', {
    httpMethod: 'GET',
    path: '/staging/v1/console/evidence-bundles/exp_123',
  }));
  assert.equal(result.statusCode, 200);
  assert.equal(JSON.parse(result.body).experimentId, 'exp_123');
});

test('Console API exports a redacted bank-review package only to a risk reviewer', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'risk_reviewer',
      entitlements: ['growth_console'],
      businessLines: ['consumer-banking'],
    }),
    controlPlane: {
      async bankReviewPackage(input) {
        assert.equal(input.tenantId, 'ventus');
        assert.deepEqual(input.businessLineScopes, ['consumer-banking']);
        return { packageVersion: '1.0', evidenceClass: 'partner_sandbox', serverAuthoritative: true };
      },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    httpMethod: 'GET',
    path: '/staging/v1/console/bank-review-package',
  }));
  assert.equal(result.statusCode, 200);
  assert.equal(JSON.parse(result.body).serverAuthoritative, true);
});

test('Console API blocks bank-review package export for non-reviewers', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => membership,
    controlPlane: { async bankReviewPackage() { throw new Error('should not run'); } },
  });
  const result = await handler(request('https://dev.example.com', {
    httpMethod: 'GET',
    path: '/staging/v1/console/bank-review-package',
  }));
  assert.equal(result.statusCode, 403);
});

test('Console API binds connected evidence to the latest approved protocol before execution', async () => {
  const calls = [];
  const contract = approvedDepositContract();
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    executeDecision: executeHostedDecision,
    appendDecision: async ({ decision }) => {
      calls.push(decision);
      return {
        persisted: true,
        inserted: true,
        sequenceNumber: 8,
        eventHash: 'b'.repeat(64),
        recordedAt: decision.generatedAt,
      };
    },
    growthPlayRegistry: {
      async requireLatestApproved(input) {
        assert.equal(input.growthPlayId, 'deposit-primacy-defense');
        assert.equal(input.businessLine, 'consumer-banking');
        return {
          approvalEventId: 'gpa_approved_123',
          decisionProtocolId: contract.decision_protocol_id,
          growthPlayId: contract.growth_play_id,
          businessLine: contract.business_line,
          protocolDigest: contract.protocol_digest,
          contract,
          decidedAt: '2026-07-29T12:00:00.000Z',
          changeRecordId: 'change_approved_123',
        };
      },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify({ ...decisionBody(), source: { mode: 'live', name: 'Plaid sandbox' } }),
  }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 200);
  assert.equal(body.runtime.protocolId, contract.decision_protocol_id);
  assert.equal(body.runtime.protocolApprovalId, 'gpa_approved_123');
  assert.equal(calls[0].runtime.approvedContract.protocol_digest, contract.protocol_digest);
});

test('Console API blocks executive viewers even when scenario entitlements are present', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'executive_viewer',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
    }),
    executeDecision: executeHostedDecision,
    appendDecision: async () => { throw new Error('should not write'); },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify(decisionBody()),
  }));
  assert.equal(result.statusCode, 403);
});

test('Console API blocks operators outside the scenario business line', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['wealth-management'],
    }),
    executeDecision: executeHostedDecision,
    appendDecision: async () => { throw new Error('should not write'); },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify(decisionBody()),
  }));
  assert.equal(result.statusCode, 403);
});

test('Console API blocks a decision outside the operator entitlement', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => membership,
    executeDecision: executeHostedDecision,
    appendDecision: async () => { throw new Error('should not write'); },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/decision-run',
    body: JSON.stringify(decisionBody()),
  }));
  assert.equal(result.statusCode, 403);
});

test('Console API gives executives a durable aggregate Today view without customer Moments', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'executive_viewer',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    journey: {
      async listMoments() {
        return [moment('deposit-retention'), moment('wealth-growth')];
      },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    httpMethod: 'GET', path: '/staging/v1/console/today', body: undefined,
  }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 200);
  assert.equal(body.aggregateOnly, true);
  assert.equal(body.counts.total, 1);
  assert.equal(body.moments, undefined);
});

test('Console API records a response through the durable server contract', async () => {
  const calls = [];
  const consumerOperator = {
    ...membership,
    role: 'bank_operator',
    entitlements: ['growth_console', 'consumer_demo'],
    businessLines: ['consumer-banking'],
    queueScopes: [],
  };
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => consumerOperator,
    journey: {
      async loadMoment() { return moment('deposit-retention'); },
      async recordResponse(input) {
        calls.push(input);
        return { receipt: { sequenceNumber: 4 }, moment: moment('deposit-retention') };
      },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/moments/dec_123/responses',
    headers: { authorization: 'Bearer valid-token', origin: 'https://dev.example.com', 'idempotency-key': 'response_123' },
    body: JSON.stringify({
      expectedState: 'queued',
      clientRequestedAt: '2026-07-30T12:00:00.000Z',
      response: { status: 'accepted', actionId: 'banker-retention-review' },
    }),
  }));
  assert.equal(result.statusCode, 201);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].actorId, identity.subject);
  assert.equal(calls[0].idempotencyKey, 'response_123');
  assert.equal(calls[0].response.actionId, 'banker-retention-review');
});

test('Console API rejects a response once a Moment has left the queued state', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    journey: {
      async loadMoment() { return moment('deposit-retention'); },
      async recordResponse() { throw new Error('should not record'); },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/moments/dec_123/responses',
    headers: { authorization: 'Bearer valid-token', origin: 'https://dev.example.com', 'idempotency-key': 'response_456' },
    body: JSON.stringify({
      expectedState: 'approved',
      clientRequestedAt: '2026-07-30T12:00:00.000Z',
      response: { status: 'modified', actionId: 'digital-retention-message' },
    }),
  }));
  assert.equal(result.statusCode, 400);
});

test('Console API does not permit a cross-business delivery reservation', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({
      ...membership,
      role: 'bank_operator',
      entitlements: ['growth_console', 'consumer_demo'],
      businessLines: ['consumer-banking'],
      queueScopes: [],
    }),
    journey: {
      async loadMoment() { return moment('wealth-growth'); },
      async reserveDelivery() { throw new Error('should not reserve'); },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/moments/dec_wealth/deliveries',
    headers: { authorization: 'Bearer valid-token', origin: 'https://dev.example.com', 'idempotency-key': 'delivery_123' },
    body: JSON.stringify({ expectedState: 'approved', clientRequestedAt: '2026-07-30T12:00:00.000Z' }),
  }));
  assert.equal(result.statusCode, 403);
});

test('Console API brokers a first reservation to the server-side delivery executor', async () => {
  const calls = [];
  const approvedMoment = { ...moment('deposit-retention'), status: 'approved', decisionPackage: { response: { status: 'accepted' } } };
  const activatedMoment = { ...approvedMoment, status: 'activated' };
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'bank_operator', entitlements: ['growth_console', 'consumer_demo'], businessLines: ['consumer-banking'], queueScopes: [] }),
    journey: {
      async loadMoment() { return approvedMoment; },
      async reserveDelivery() {
        return {
          receipt: { deliveryId: 'dlv_1234567890abcdef12345678', status: 'pending' },
          moment: approvedMoment,
          reservation: { shouldDeliver: true, reconciliationRequired: false, record: { delivery_id: 'dlv_1234567890abcdef12345678', status: 'pending' } },
        };
      },
    },
    async deliverReserved(input) {
      calls.push(input);
      return { receipt: { deliveryId: 'dlv_1234567890abcdef12345678', status: 'delivered' }, moment: activatedMoment };
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/moments/dec_deposit-retention/deliveries',
    headers: { authorization: 'Bearer valid-token', origin: 'https://dev.example.com', 'idempotency-key': 'delivery_456' },
    body: JSON.stringify({ expectedState: 'approved', clientRequestedAt: '2026-07-30T12:00:00.000Z' }),
  }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 201);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].reservation.record.delivery_id, 'dlv_1234567890abcdef12345678');
  assert.equal(body.moment.status, 'activated');
  assert.equal('reservation' in body, false);
});

test('Console API permits one delivery retry only after a terminal configuration failure', async () => {
  const calls = [];
  const failedMoment = { ...moment('deposit-retention'), status: 'delivery_failed', decisionPackage: { response: { status: 'accepted' } } };
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'bank_operator', entitlements: ['growth_console', 'consumer_demo'], businessLines: ['consumer-banking'], queueScopes: [] }),
    journey: {
      async loadMoment() { return failedMoment; },
      async reserveDelivery(input) {
        calls.push(input);
        return { receipt: { deliveryId: 'dlv_1234567890abcdef12345678', status: 'pending' }, moment: failedMoment, reservation: { shouldDeliver: false, reconciliationRequired: false, record: { delivery_id: 'dlv_1234567890abcdef12345678', status: 'pending' } } };
      },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/moments/dec_deposit-retention/deliveries',
    headers: { authorization: 'Bearer valid-token', origin: 'https://dev.example.com', 'idempotency-key': 'delivery_retry_456' },
    body: JSON.stringify({ expectedState: 'delivery_failed', clientRequestedAt: '2026-07-30T12:00:00.000Z' }),
  }));
  assert.equal(result.statusCode, 201);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].expectedState, 'delivery_failed');
});

test('Console API exposes results and governed projections only through server adapters', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'executive_viewer', entitlements: ['growth_console'], businessLines: ['wealth-management'] }),
    controlPlane: {
      async results({ tenantId }) { return { tenantId, experiments: [], deliveries: { delivered: 1 }, serverAuthoritative: true }; },
      async governance() { throw new Error('executives cannot read governance'); },
    },
  });
  const result = await handler(request('https://dev.example.com', { httpMethod: 'GET', path: '/staging/v1/console/results', body: undefined }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 200);
  assert.equal(body.serverAuthoritative, true);
  assert.equal(body.deliveries.delivered, 1);
  const governance = await handler(request('https://dev.example.com', { httpMethod: 'GET', path: '/staging/v1/console/governance', body: undefined }));
  assert.equal(governance.statusCode, 403);
});

test('Console API gives institution administrators health-only Results and Governance projections', async () => {
  const calls = [];
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'institution_admin', entitlements: ['growth_console'], businessLines: ['consumer-banking'] }),
    controlPlane: {
      async results(input) { calls.push({ type: 'results', input }); return { experiments: [], deliveries: { delivered: 2 }, outcomeObservations: 1 }; },
      async governance(input) { calls.push({ type: 'governance', input }); return { protocols: [], recentEvents: [], connections: [{ connector: 'salesforce-fsc', status: 'active' }] }; },
    },
  });
  assert.equal((await handler(request('https://dev.example.com', { httpMethod: 'GET', path: '/staging/v1/console/results', body: undefined }))).statusCode, 200);
  assert.equal((await handler(request('https://dev.example.com', { httpMethod: 'GET', path: '/staging/v1/console/governance', body: undefined }))).statusCode, 200);
  assert.deepEqual(calls.map(({ type, input }) => [type, input.projection, input.actorId]), [
    ['results', 'system_health', identity.subject],
    ['governance', 'connector_health', undefined],
  ]);
});

test('Console API prevents institution and platform administrators from authoring or approving Growth Plays', async () => {
  const calls = [];
  for (const role of ['institution_admin', 'ventus_platform_admin']) {
    const handler = createConsoleApiHandler({
      verifyIdentity: async () => identity,
      resolveMembership: async () => ({ ...membership, role, entitlements: ['growth_console'], businessLines: ['consumer-banking'] }),
      controlPlane: { async saveDraft(input) { calls.push(input); return input; } },
      growthPlayRegistry: { async recordApproval(input) { calls.push(input); return { record: input }; } },
    });
    const draft = await handler(request('https://dev.example.com', {
      path: '/staging/v1/console/growth-plays/drafts', body: JSON.stringify({ draftId: 'gp_123', expectedVersion: 0, contract: {} }),
    }));
    const approval = await handler(request('https://dev.example.com', {
      path: '/staging/v1/console/growth-plays/protocols/dcp_123/approvals',
      body: JSON.stringify({ businessLine: 'consumer-banking', decision: 'approved', changeRecordId: 'change_123', reason: 'Not authorized.' }),
    }));
    assert.equal(draft.statusCode, 403);
    assert.equal(approval.statusCode, 403);
  }
  assert.equal(calls.length, 0);
});

test('Console API uses server-derived Skill transitions with immutable approval receipts', async () => {
  const calls = [];
  const ownerHandler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'growth_play_owner', entitlements: ['growth_console'], businessLines: ['consumer-banking'] }),
    controlPlane: {
      async createSkillDraft(input) { calls.push({ type: 'draft', input }); return { skill: { status: 'draft' }, receipt: { transitionId: 'str_1' } }; },
      async transitionSkill(input) { calls.push({ type: 'transition', input }); return { skill: { status: 'shadow' }, receipt: { transitionId: 'str_2' } }; },
    },
  });
  const draft = await ownerHandler(request('https://dev.example.com', {
    path: '/staging/v1/console/skills/shadows',
    body: JSON.stringify({ skillId: 'enrichment-routing', version: '0.1.0', benchmark: { evaluation: 'pending' } }),
  }));
  const transition = await ownerHandler(request('https://dev.example.com', {
    path: '/staging/v1/console/skills/shadows/enrichment-routing/0.1.0/transitions',
    body: JSON.stringify({ expectedRevision: 1, action: 'submit_shadow', reason: 'Ready for shadow evaluation.' }),
  }));
  const rejectedMutableStatus = await ownerHandler(request('https://dev.example.com', {
    path: '/staging/v1/console/skills/shadows',
    body: JSON.stringify({ skillId: 'other-skill', version: '0.1.0', status: 'promoted', benchmark: {} }),
  }));
  assert.equal(draft.statusCode, 201);
  assert.equal(transition.statusCode, 201);
  assert.equal(rejectedMutableStatus.statusCode, 400);
  assert.equal(calls[0].input.status, undefined);
  assert.equal(calls[1].input.action, 'submit_shadow');

  const riskHandler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'risk_reviewer', entitlements: ['growth_console'], businessLines: ['consumer-banking'] }),
    controlPlane: { async recordSkillApproval(input) { calls.push({ type: 'approval', input }); return { approval: { approvalId: 'sar_1' }, skill: { status: 'shadow' } }; } },
  });
  const approval = await riskHandler(request('https://dev.example.com', {
    path: '/staging/v1/console/skills/shadows/enrichment-routing/0.1.0/approvals',
    body: JSON.stringify({ expectedRevision: 2, phase: 'shadow_scope', approvalType: 'risk_review', decision: 'approved', reason: 'Scope is acceptable.' }),
  }));
  assert.equal(approval.statusCode, 201);
  assert.equal(calls[2].input.actorId, identity.subject);
});

test('Console API requires independent risk review for Growth Play approval', async () => {
  const calls = [];
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'risk_reviewer', entitlements: ['growth_console'], businessLines: ['wealth-management'] }),
    growthPlayRegistry: {
      async recordApproval(input) { calls.push(input); return { record: { approval_event_id: 'gpa_123' } }; },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/growth-plays/protocols/dcp_123/approvals',
    body: JSON.stringify({ businessLine: 'wealth-management', decision: 'approved', changeRecordId: 'change_123', reason: 'Approved for controlled pilot evaluation.' }),
  }));
  assert.equal(result.statusCode, 201);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].decidedBy, identity.subject);
});

test('Console API only delivers Coworker briefings through an active server-side mapping', async () => {
  const calls = [];
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'growth_play_owner', entitlements: ['growth_console', 'wealth_demo'], businessLines: ['wealth-management'] }),
    controlPlane: {
      async activeConnection() { return { mappingId: 'map_outlook', connector: 'microsoft-outlook', status: 'active', configuration: { recipient: 'ops@example.com' } }; },
    },
    async deliverCoworkerBriefing(input) { calls.push(input); return { receipt: { status: 'delivered' } }; },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/briefings/deliveries',
    body: JSON.stringify({ channel: 'outlook', scenario: 'wealth-growth', title: 'Growth review', counts: { needsReview: 1, routed: 1, outcomesObserved: 0 }, decisionIds: ['dec_123'] }),
  }));
  assert.equal(result.statusCode, 201);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].mapping.mappingId, 'map_outlook');
  assert.equal(calls[0].businessLine, 'wealth-management');
});

test('Console API advances a connector only through a server-side lifecycle transition', async () => {
  const calls = [];
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => ({ ...membership, role: 'institution_admin', entitlements: ['growth_console'], businessLines: ['consumer-banking'] }),
    controlPlane: {
      async testConnection(input) { calls.push({ ...input, targetStatus: 'tested' }); return { mapping: { mappingId: input.mappingId, status: 'tested' }, receipt: { receiptId: 'ctr_123' } }; },
      async transitionConnection(input) { calls.push(input); return { mapping: { mappingId: input.mappingId, status: 'tested' }, receipt: { receiptId: 'ctr_123' } }; },
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/connections/map_salesforce/test',
    body: JSON.stringify({ expectedVersion: 1 }),
  }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 201);
  assert.equal(calls[0].targetStatus, 'tested');
  assert.equal(body.receipt.receiptId, 'ctr_123');
});

test('Console API lets a risk reviewer resolve FSC outcomes from the server-linked Decision Receipt', async () => {
  const calls = [];
  const consumerReviewer = {
    ...membership,
    role: 'risk_reviewer',
    entitlements: ['growth_console', 'consumer_demo'],
    businessLines: ['consumer-banking'],
    queueScopes: [],
  };
  const linkedMoment = {
    ...moment('deposit-retention'),
    receipt: { records: { decision: { id: 'a08_server_linked_only' } } },
  };
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => consumerReviewer,
    journey: { async loadMoment() { return linkedMoment; } },
    controlPlane: {
      async activeConnection() { return { mappingId: 'map_fsc', version: 2, connector: 'salesforce-fsc', configuration: { decisionObject: 'Bank_Decision__c' } }; },
      async recordFscOutcome() { return { observation: { observationId: 'obs_123' }, eligibleForLift: false }; },
    },
    async readSalesforceOutcome(input) {
      calls.push(input);
      return { observed: true, outcome: { status: 'contacted' } };
    },
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/outcomes/salesforce-sync',
    body: JSON.stringify({ decisionId: 'dec_deposit-retention', salesforceRecordId: 'browser_controlled_value' }),
  }));
  const body = JSON.parse(result.body);
  assert.equal(result.statusCode, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].decisionRecordId, 'a08_server_linked_only');
  assert.equal(calls[0].mapping.mappingId, 'map_fsc');
  assert.equal(calls[0].mapping.configuration.decisionObject, 'Bank_Decision__c');
  assert.equal(body.mapping.mappingId, 'map_fsc');
  assert.equal(body.recorded.observation.observationId, 'obs_123');
});

test('Console API blocks manual FSC reconciliation for every non-reviewer role', async () => {
  for (const role of ['ventus_platform_admin', 'institution_admin', 'growth_play_owner', 'bank_operator', 'executive_viewer']) {
    const handler = createConsoleApiHandler({
      verifyIdentity: async () => identity,
      resolveMembership: async () => ({ ...membership, role, entitlements: ['growth_console', 'consumer_demo'], businessLines: ['consumer-banking'] }),
      journey: { async loadMoment() { throw new Error('should not load'); } },
      controlPlane: {},
      readSalesforceOutcome: async () => { throw new Error('should not read'); },
    });
    const result = await handler(request('https://dev.example.com', {
      path: '/staging/v1/console/outcomes/salesforce-sync',
      body: JSON.stringify({ decisionId: 'dec_123' }),
    }));
    assert.equal(result.statusCode, 403, role);
  }
});

test('Console API accepts the IAM-scoped service reconciliation route without a user token', async () => {
  const calls = [];
  const linkedMoment = {
    ...moment('deposit-retention'),
    receipt: { records: { decision: { id: 'a08_server_linked_only' } } },
  };
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => { throw new Error('user identity should not run'); },
    resolveMembership: async () => { throw new Error('membership should not run'); },
    resolveServiceIdentity: async () => ({ kind: 'service', serviceId: 'fsc_outcome_reconciler', status: 'active', tenantScopes: ['ventus'] }),
    journey: { async loadMoment() { return linkedMoment; } },
    controlPlane: {
      async activeConnection() { return { mappingId: 'map_fsc', version: 2, connector: 'salesforce-fsc', configuration: {} }; },
      async recordFscOutcome(input) { calls.push(input); return { observation: { observationId: 'obs_service' } }; },
    },
    readSalesforceOutcome: async () => ({ outcome: { status: 'completed' } }),
  });
  const result = await handler(request('https://dev.example.com', {
    path: '/staging/v1/console/internal/outcomes/salesforce-sync',
    headers: { origin: 'https://dev.example.com' },
    body: JSON.stringify({ tenantId: 'ventus', decisionId: 'dec_123' }),
  }));
  assert.equal(result.statusCode, 200);
  assert.equal(calls[0].actorId, 'service:fsc_outcome_reconciler');
});

function request(origin = 'https://dev.example.com', overrides = {}) {
  process.env.VENTUS_ALLOWED_ORIGINS = 'https://dev.example.com';
  return {
    httpMethod: 'POST',
    headers: {
      authorization: 'Bearer valid-token',
      origin,
    },
    requestContext: { requestId: 'test-request' },
    ...overrides,
  };
}

function decisionBody() {
  return {
    scenario: 'deposit-retention',
    source: { mode: 'fixture', name: 'Plaid-shaped fixture' },
    transactions: [
      {
        transaction_id: 'tx_payroll',
        name: 'PAYROLL',
        merchant_name: 'ADP',
        amount: -4200,
        date: '2026-07-01',
        personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
      },
      {
        transaction_id: 'tx_transfer',
        name: 'CHIME TRANSFER',
        merchant_name: 'Chime',
        amount: 1800,
        date: '2026-07-03',
        personal_finance_category: { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_ACCOUNT_TRANSFER' },
      },
    ],
  };
}

function approvedDepositContract() {
  return compileGrowthPlayContract({
    contract_version: '1.0',
    growth_play_id: 'deposit-primacy-defense',
    version: '1.0.0',
    business_line: 'consumer-banking',
    objective: 'Retain primary deposit relationships through governed banker review',
    source: {
      receipt_source_systems: ['plaid_custom_user'],
      schema_versions: ['plaid-transactions-1'],
      record_sources: [{ source_system: 'deposit_core', allowed_rails: ['ach', 'card', 'p2p', 'wire'] }],
    },
    eligibility: { criteria_version: 'deposit-primacy-eligibility-v1' },
    policy: { version: 'mvp-policy-v1', required_policy_ids: ['consent', 'eligibility', 'vulnerability'] },
    actions: [{
      action_id: 'banker_retention_review',
      owner_role: 'relationship_banker',
      connector: 'salesforce-fsc',
      destination: 'fsc_task',
      destination_environment: 'sandbox',
    }],
    measurement: {
      metric: 'deposit_retained',
      outcome_event_types: ['deposit_balance_observed'],
      outcome_source_systems: ['deposit_core_sandbox'],
      outcome_window_days: 31,
      holdout_pct: 10,
      minimum_per_arm: 30,
      minimum_coverage: 0.9,
    },
  });
}

function moment(scenario) {
  return {
    id: `mom_${scenario}`,
    decisionId: `dec_${scenario}`,
    scenario,
    status: 'queued',
    createdAt: '2026-07-30T00:00:00.000Z',
    decisionPackage: { response: { status: 'pending' } },
  };
}
