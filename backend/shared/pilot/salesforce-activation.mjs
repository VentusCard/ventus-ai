import { offbankRegex } from '../platform/offbank-patterns.mjs';

const OFFBANK = offbankRegex();

const titleCase = (value) => String(value || '')
  .replaceAll('_', ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase());

const currency = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(amount);

export function buildDepositRetentionSalesforceBody({ input, decision, contactId, accountId }) {
  const offbank = input.records.filter((record) => record.amount > 0 && (
    record.rail === 'p2p'
    || record.category === 'TRANSFER_OUT'
    || OFFBANK.test(record.merchant_name || '')
  ));
  const payroll = input.records.filter((record) => record.amount < 0 && (
    record.rail === 'ach'
    || record.category === 'INCOME'
    || /payroll|direct dep/i.test(record.merchant_name || '')
  ));
  const offbankTotal = offbank.reduce((sum, record) => sum + record.amount, 0);
  const movement = offbank.length
    ? `${currency(offbankTotal)} moved off-bank across ${offbank.length} recent transfer${offbank.length === 1 ? '' : 's'}`
    : 'recent off-bank movement is accelerating';
  const payrollContext = payroll.length
    ? `${payroll.length} payroll deposit${payroll.length === 1 ? ' remains' : 's remain'} active`
    : 'payroll remains active';
  const whyNow = `${payrollContext}, while ${movement}. The combined pattern indicates the customer may be shifting the primary banking relationship elsewhere.`;
  const recommendedAction = 'Review the relationship before the next payroll cycle. Confirm the customer\'s primary-bank intent and, when appropriate, discuss direct-deposit consolidation and balance alerts.';
  const expectedOutcome = 'Retain the primary deposit relationship, measured against the pilot holdout.';
  const confidence = Math.round(decision.confidence * 100);
  const controls = input.policies
    .filter((policy) => policy.verdict === 'clear')
    .map((policy) => titleCase(policy.policy_id));
  const primaryAction = input.growthPlay.actions?.[0] ?? {};
  const evidence = decision.evidence.map((item) => ({
    id: item.transaction_id || item.evidence_id || item.summary,
    label: item.summary,
    confidence,
    source: input.sourceReceipt.sourceSystem,
  }));

  return {
    subject: 'Primary deposit relationship at risk',
    priority: 'High',
    dueInDays: 2,
    source: 'pilot-e2e',
    whoId: contactId,
    whatId: accountId,
    decisionPackage: {
      schemaVersion: '1.0',
      decisionId: decision.decisionId,
      tenantId: input.tenantId,
      createdAt: input.runAt,
      evidenceClass: input.sourceReceipt.evidenceClass || 'sandbox',
      growthPlay: {
        id: input.growthPlay.growth_play_id || 'deposit-primacy-defense',
        name: 'Deposit Primacy Defense',
        businessLine: input.growthPlay.business_line || 'consumer-banking',
        objective: input.growthPlay.objective || input.objective,
        primaryMetric: input.growthPlay.measurement?.metric || 'deposit_retained',
        protocolId: input.growthPlay.decision_protocol_id || input.growthPlay.version,
      },
      subject: {
        token: input.householdToken,
        ...(accountId ? { accountId } : {}),
      },
      moment: {
        type: 'deposit-primacy-risk',
        summary: whyNow,
        confidence,
        evidence,
      },
      recommendation: {
        selectedAction: {
          id: primaryAction.action_id || 'banker_retention_review',
          title: 'Open a banker retention review',
          instructions: recommendedAction,
          ownerRole: primaryAction.owner_role || 'relationship_banker',
          destination: primaryAction.destination || 'salesforce_fsc_task',
        },
        alternatives: [],
      },
      governance: {
        policyStatus: 'cleared',
        controls,
        humanReviewRequired: true,
        assignmentArm: 'treatment',
      },
      decisionMethod: {
        active: 'deterministic-baseline',
      },
      response: {
        status: 'accepted',
        actor: 'pilot_e2e_operator',
        recordedAt: input.runAt,
      },
      workflow: {
        connector: 'salesforce-fsc',
        status: 'ready',
      },
      outcome: {
        metric: input.growthPlay.measurement?.metric || 'deposit_retained',
        windowDays: input.growthPlay.measurement?.outcome_window_days || 31,
        status: 'measuring',
      },
    },
    insight: {
      businessLine: 'Consumer Banking',
      growthPlay: `Deposit Primacy Defense v${input.growthPlay.version}`,
      customerRef: `Tokenized household ${input.householdToken}`,
      moment: 'Primary deposit relationship at risk',
      whyNow,
      recommendedAction,
      expectedOutcome,
      confidence,
      destination: 'Salesforce FSC · Relationship banker review queue',
      evidence: evidence.map((item) => ({ label: item.label })),
      controls,
      sourceName: `${input.sourceReceipt.sourceSystem} · ${input.sourceReceipt.recordCount} tokenized records`,
      decisionRef: decision.decisionId,
    },
    fsc: {
      clientId: accountId,
    },
  };
}
