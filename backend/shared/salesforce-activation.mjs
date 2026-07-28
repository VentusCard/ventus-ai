import { offbankRegex } from './offbank-patterns.mjs';

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

  return {
    subject: 'Primary deposit relationship at risk',
    priority: 'High',
    dueInDays: 2,
    source: 'pilot-e2e',
    whoId: contactId,
    whatId: accountId,
    insight: {
      businessLine: 'Consumer Banking',
      growthPlay: `Deposit Primacy Defense v${input.growthPlay.version}`,
      customerRef: `Tokenized household ${input.householdToken}`,
      moment: 'Primary deposit relationship at risk',
      whyNow: `${payrollContext}, while ${movement}. The combined pattern indicates the customer may be shifting the primary banking relationship elsewhere.`,
      recommendedAction: 'Review the relationship before the next payroll cycle. Confirm the customer\'s primary-bank intent and, when appropriate, discuss direct-deposit consolidation and balance alerts.',
      expectedOutcome: 'Retain the primary deposit relationship, measured against the pilot holdout.',
      confidence: Math.round(decision.confidence * 100),
      destination: 'Salesforce FSC · Relationship banker review queue',
      evidence: decision.evidence.map((item) => ({
        label: item.summary,
      })),
      controls: input.policies
        .filter((policy) => policy.verdict === 'clear')
        .map((policy) => titleCase(policy.policy_id)),
      sourceName: `${input.sourceReceipt.sourceSystem} · ${input.sourceReceipt.recordCount} tokenized records`,
      decisionRef: decision.decisionId,
    },
    fsc: {
      clientId: accountId,
    },
  };
}
