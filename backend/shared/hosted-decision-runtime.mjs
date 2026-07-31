import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { validateCompiledGrowthPlayContract } from './growth-play-contract.mjs';
import { OFFBANK_ALL } from './offbank-patterns.mjs';

const SCENARIOS = Object.freeze({
  'deposit-retention': {
    entitlement: 'consumer_demo',
    growthPlayId: 'deposit-primacy-defense',
    businessLine: 'consumer-banking',
    displayName: 'Deposit Primacy Defense',
  },
  'wealth-growth': {
    entitlement: 'wealth_demo',
    growthPlayId: 'merrill-relationship-growth',
    businessLine: 'wealth-management',
    displayName: 'Merrill Relationship Growth',
  },
});
const SOURCE_MODES = new Set(['live', 'fixture']);
const RUNTIME_POLICY_VERSION = 'mvp-policy-v1';
const SUPPORTED_POLICY_IDS = new Set(['consent', 'eligibility', 'vulnerability']);
const SUPPORTED_WORKFLOW_CONNECTORS = new Set(['salesforce', 'salesforce-fsc']);

export class DecisionRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DecisionRequestError';
  }
}

export function executeHostedDecision({ tenantId, body, now = new Date(), protocolApproval = null }) {
  const request = parseDecisionRequest(body);
  const scope = decisionScopeForScenario(request.scenario);
  const approved = normalizeProtocolApproval(protocolApproval, scope);
  if (request.source.mode === 'live' && !approved) {
    throw new DecisionRequestError('connected evidence requires an independently approved Growth Play protocol');
  }
  const opportunity = buildOpportunity(request.transactions);
  const policy = applyPolicy(opportunity, request.policyContext);
  const decisionId = stableDecisionId(tenantId, request);
  return {
    schemaVersion: 'ventus.decision-run.v1',
    decisionId,
    tenantId,
    scenario: request.scenario,
    growthPlay: scope.displayName,
    generatedAt: now.toISOString(),
    status: !opportunity ? 'abstained' : policy.allowed ? 'qualified' : 'suppressed',
    source: {
      mode: request.source.mode,
      name: request.source.name,
      evidenceClass: request.source.mode === 'live' ? 'partner_sandbox' : 'fixture',
      recordCount: request.transactions.length,
      transactionRefs: request.transactions.map((transaction) => transaction.transaction_id),
    },
    runtime: {
      engine: 'deterministic-baseline',
      version: 'plaid-rules-v1',
      policyVersion: approved?.contract.policy.version ?? RUNTIME_POLICY_VERSION,
      modelInvocation: null,
      growthPlayId: scope.growthPlayId,
      businessLine: scope.businessLine,
      protocolId: approved?.decisionProtocolId ?? null,
      protocolDigest: approved?.protocolDigest ?? null,
      protocolApprovalId: approved?.approvalEventId ?? null,
      protocolApprovedAt: approved?.decidedAt ?? null,
      approvedContract: approved?.contract ?? null,
      measurementPlan: approved ? {
        outcomeEventTypes: approved.contract.measurement.outcome_event_types,
        outcomeSourceSystems: approved.contract.measurement.outcome_source_systems,
      } : null,
    },
    opportunity,
    policy,
  };
}

export function requiredEntitlementForScenario(scenario) {
  return decisionScopeForScenario(scenario).entitlement;
}

export function decisionScopeForScenario(scenario) {
  const scope = SCENARIOS[scenario];
  if (!scope) throw new DecisionRequestError('valid scenario required');
  return { ...scope };
}

function parseDecisionRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new DecisionRequestError('valid decision request required');
  }
  const scenario = SCENARIOS[body.scenario] ? body.scenario : null;
  if (!scenario) throw new DecisionRequestError('valid scenario required');
  if (!body.source || typeof body.source !== 'object' || Array.isArray(body.source)) {
    throw new DecisionRequestError('valid source required');
  }
  const source = {
    mode: SOURCE_MODES.has(body.source.mode) ? body.source.mode : null,
    name: cleanText(body.source.name, 160),
  };
  if (!source.mode || !source.name) throw new DecisionRequestError('valid source required');
  if (!Array.isArray(body.transactions) || body.transactions.length < 1 || body.transactions.length > 500) {
    throw new DecisionRequestError('1-500 valid Plaid transactions required');
  }
  const transactions = body.transactions.map(parseTransaction);
  if (transactions.some((transaction) => !transaction)) {
    throw new DecisionRequestError('1-500 valid Plaid transactions required');
  }
  return {
    scenario,
    source,
    transactions,
    policyContext: parsePolicyContext(body.policyContext),
  };
}

function normalizeProtocolApproval(value, scope) {
  if (value === null || value === undefined) return null;
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'protocol approval is invalid');
  const contract = validateCompiledGrowthPlayContract(value.contract);
  assert.equal(value.growthPlayId, scope.growthPlayId, 'approved protocol belongs to another Growth Play');
  assert.equal(value.businessLine, scope.businessLine, 'approved protocol belongs to another business line');
  assert.equal(value.decisionProtocolId, contract.decision_protocol_id, 'approved protocol identity is invalid');
  assert.equal(value.protocolDigest, contract.protocol_digest, 'approved protocol digest is invalid');
  assert.equal(contract.growth_play_id, scope.growthPlayId, 'approved contract belongs to another Growth Play');
  assert.equal(contract.business_line, scope.businessLine, 'approved contract belongs to another business line');
  assert.ok(
    contract.policy.required_policy_ids.every((policyId) => SUPPORTED_POLICY_IDS.has(policyId)),
    'approved policy pack requires controls this runtime does not support',
  );
  assert.ok(
    contract.actions.every((action) => SUPPORTED_WORKFLOW_CONNECTORS.has(action.connector)),
    'approved action catalog requires a workflow connector this runtime does not support',
  );
  assert.ok(typeof value.approvalEventId === 'string' && value.approvalEventId.length > 1, 'protocol approval receipt is invalid');
  assert.ok(typeof value.decidedAt === 'string' && !Number.isNaN(Date.parse(value.decidedAt)), 'protocol approval timestamp is invalid');
  return { ...value, contract };
}

function parseTransaction(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const transactionId = cleanText(value.transaction_id, 128);
  const name = cleanText(value.name, 220);
  const amount = Number.isFinite(value.amount) ? value.amount : null;
  const date = cleanText(value.date, 10);
  if (!transactionId || !name || amount === null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const category = value.personal_finance_category;
  const primary = category && typeof category === 'object'
    ? cleanText(category.primary, 80)
    : '';
  const detailed = category && typeof category === 'object'
    ? cleanText(category.detailed, 160)
    : '';
  return {
    transaction_id: transactionId,
    name,
    merchant_name: cleanText(value.merchant_name, 220) || null,
    amount,
    date,
    payment_channel: ['online', 'in store', 'other'].includes(value.payment_channel)
      ? value.payment_channel
      : undefined,
    personal_finance_category: primary
      ? { primary, detailed: detailed || 'UNCLASSIFIED' }
      : null,
  };
}

function parsePolicyContext(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    ['consent', 'doNotContact', 'financiallyVulnerable', 'employeeRelationship']
      .filter((key) => typeof value[key] === 'boolean')
      .map((key) => [key, value[key]]),
  );
}

function buildOpportunity(transactions) {
  const enriched = transactions.map(enrich);
  const payroll = enriched.filter((transaction) => transaction.signalTag === 'recurring_payroll');
  const offBank = enriched.filter((transaction) => transaction.signalTag === 'off_bank_transfer');
  const liquidity = enriched.filter((transaction) => transaction.signalTag === 'large_inbound');
  const signals = [];
  if (payroll.length) signals.push(signal('payroll', 'Direct-deposit relationship', payroll, Math.min(1, payroll.length / 2)));
  if (offBank.length) {
    const total = offBank.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    signals.push(signal('off_bank_transfer', 'Spend migrating off-bank', offBank, Math.min(1, offBank.length / 3 + total / 20_000)));
  }
  if (liquidity.length) {
    const rollover = liquidity.some((transaction) => includesAny(transaction.merchant, [
      '401', 'ira', 'retirement', 'rollover', 'fidelity', 'vanguard', 'schwab',
    ]));
    signals.push(signal(rollover ? 'rollover' : 'liquidity_event', rollover
      ? 'Retirement rollover landed'
      : 'Liquidity event', liquidity, 0.9));
  }
  signals.sort((left, right) => right.strength - left.strength);
  const types = new Set(signals.map((item) => item.type));
  const confidence = Math.round(Math.min(
    0.97,
    0.7 + signals.reduce((sum, item) => sum + item.strength, 0) / Math.max(1, signals.length * 4),
  ) * 100);
  if (types.has('payroll') && types.has('off_bank_transfer')) {
    return opportunity({
      type: 'Checking primacy at risk',
      reason: 'Direct deposit is anchored here, but spend and balances are migrating to an off-bank account.',
      action: 'Prepare a banker conversation with a retention offer.',
      destination: 'Banker workbench',
      pnlHint: 'deposit',
      confidence,
      signals,
      enriched,
    });
  }
  if (types.has('rollover') || types.has('liquidity_event')) {
    return opportunity({
      type: types.has('rollover') ? 'Retirement rollover — uninvested' : 'Liquidity event — uninvested',
      reason: 'A large inflow landed on-bank and is not yet invested — a warm wealth moment.',
      action: 'Prepare a warm, qualified referral to a wealth advisor.',
      destination: 'Advisor workbench',
      pnlHint: 'nna',
      confidence,
      signals,
      enriched,
    });
  }
  return signals.length ? opportunity({
    type: 'Relationship deepening',
    reason: 'Consistent on-bank activity indicates room to deepen the relationship.',
    action: 'Prepare a relevant next conversation.',
    destination: 'Employee workbench',
    pnlHint: 'deepen',
    confidence,
    signals,
    enriched,
  }) : null;
}

function enrich(transaction) {
  const merchant = transaction.merchant_name || transaction.name;
  const primary = transaction.personal_finance_category?.primary || '';
  const detailed = transaction.personal_finance_category?.detailed || 'UNCLASSIFIED';
  const inflow = transaction.amount < 0;
  let tag = 'other';
  let label = detailed.replaceAll('_', ' ').toLowerCase();
  let confidence = transaction.merchant_name ? 0.92 : 0.8;
  if (primary === 'INCOME' && inflow) tag = 'recurring_payroll';
  if (primary === 'TRANSFER_OUT' && includesAny(merchant, OFFBANK_ALL)) tag = 'off_bank_transfer';
  if (primary === 'TRANSFER_IN' && Math.abs(transaction.amount) > 50_000) tag = 'large_inbound';
  if (tag === 'recurring_payroll') label = 'Recurring payroll';
  if (tag === 'off_bank_transfer') label = 'Transfer to off-bank account';
  if (tag === 'large_inbound') label = 'Large inbound — liquidity event';
  const pillar = primary === 'INCOME'
    ? 'Income'
    : primary === 'TRANSFER_OUT'
      ? 'Wealth'
      : primary === 'TRANSFER_IN'
        ? 'Cash'
        : 'Review';
  return {
    transactionId: transaction.transaction_id,
    raw: `${transaction.name.toUpperCase().slice(0, 32)} ${transaction.amount < 0 ? '+' : '-'}$${Math.abs(transaction.amount)}`,
    merchant,
    category: `${primary || 'UNCLASSIFIED'} · ${detailed.replaceAll('_', ' ').toLowerCase()}`,
    pillar,
    tag: label,
    conf: confidence,
    src: primary === 'INCOME'
      ? 'Payroll / ACH'
      : primary.startsWith('TRANSFER')
        ? 'Payments rail'
        : 'Deposit core',
    amount: transaction.amount,
    inflow,
    date: transaction.date,
    signalTag: tag,
  };
}

function signal(type, label, evidence, strength) {
  return { type, label, strength, evidence };
}

function opportunity(value) {
  return value;
}

function applyPolicy(opportunityValue, context) {
  if (!opportunityValue) return { allowed: false, reason: 'No actionable opportunity' };
  if (context.doNotContact) return { allowed: false, reason: 'Do-not-contact suppression' };
  if (context.consent === false) return { allowed: false, reason: 'Required outreach consent is absent' };
  if (context.financiallyVulnerable) return { allowed: false, reason: 'Financial-vulnerability review required' };
  if (context.employeeRelationship) return { allowed: false, reason: 'Employee relationship requires specialist review' };
  return { allowed: true, reason: 'MVP policy checks cleared' };
}

function stableDecisionId(tenantId, request) {
  const input = JSON.stringify({
    tenantId,
    scenario: request.scenario,
    transactions: request.transactions.map((transaction) => ({
      id: transaction.transaction_id,
      name: transaction.name,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.personal_finance_category,
    })),
    policyContext: request.policyContext,
  });
  return `dec_${createHash('sha256').update(input).digest('hex').slice(0, 24)}`;
}

function includesAny(value, candidates) {
  const normalized = String(value || '').toLowerCase();
  return candidates.some((candidate) => normalized.includes(String(candidate).toLowerCase()));
}

function cleanText(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : '';
}
