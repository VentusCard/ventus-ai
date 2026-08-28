// Real ingestion path — Plaid transactions in, enriched signals out.
//
// The demo's households used to be hand-authored. This module takes actual Plaid
// transaction records (real schema, sandbox or production) and does real work on them:
// normalize → classify to Ventus pillars → detect the financial-state signals a Growth
// Play triggers on → assemble an opportunity. Nothing here is decorative; every field is
// derived from the input. Pure and dependency-free so it runs in the browser, the API,
// and the test harness identically.

import { OFFBANK_ALL } from "../../backend/shared/platform/offbank-patterns.mjs";

// ── Real Plaid transaction schema (the subset the pipeline uses) ──
// Mirrors https://plaid.com/docs/api/products/transactions/#transactionsget
export type PlaidPFC = { primary: string; detailed: string };
export type PlaidTransaction = {
  transaction_id: string;
  account_id?: string;
  name: string;
  merchant_name?: string | null;
  amount: number; // Plaid: positive = money out of the account, negative = money in
  iso_currency_code?: string | null;
  date: string;
  payment_channel?: "online" | "in store" | "other";
  personal_finance_category?: PlaidPFC | null;
  counterparties?: { name: string; type?: string }[];
};

// The internal enriched shape the pipeline scores on (RawTxn-compatible).
export type EnrichedTxn = {
  raw: string;
  merchant: string;
  category: string;
  pillar: string;
  tag: string;
  conf: number;
  src: string; // data rail of origin
  amount: number;
  inflow: boolean;
  date: string;
};

// ── Plaid personal_finance_category.primary → Ventus pillar ──
const PILLAR_BY_PFC: Record<string, string> = {
  INCOME: "Income",
  TRANSFER_IN: "Cash",
  TRANSFER_OUT: "Wealth",
  LOAN_PAYMENTS: "Cash",
  BANK_FEES: "Cash",
  RENT_AND_UTILITIES: "Family & Community",
  FOOD_AND_DRINK: "Family & Community",
  GENERAL_MERCHANDISE: "Family & Community",
  TRAVEL: "Travel & Exploration",
  GENERAL_SERVICES: "Family & Community",
};

// The data rail a transaction arrives on — the cross-rail read is the point.
function railFor(t: PlaidTransaction): string {
  const pfc = t.personal_finance_category?.primary ?? "";
  if (pfc === "INCOME") return "Payroll / ACH";
  if (pfc.startsWith("TRANSFER")) return "Payments rail";
  if (pfc === "LOAN_PAYMENTS") return "Lending";
  if (t.payment_channel === "online" || t.payment_channel === "in store") return "Card rail";
  return "Deposit core";
}

// Known off-bank destinations — a transfer to one of these is a primacy-risk signal.
const OFF_BANK = OFFBANK_ALL;

const has = (hay: string | undefined | null, needles: string[]) =>
  !!hay && needles.some((n) => hay.toLowerCase().includes(n));

// Classify one Plaid transaction into an enriched, tagged signal. Confidence reflects how
// cleanly Plaid resolved it (a named merchant + a detailed category = high confidence).
export function normalizePlaidTxn(t: PlaidTransaction): EnrichedTxn {
  const merchant = t.merchant_name || t.counterparties?.[0]?.name || t.name;
  const pfc = t.personal_finance_category;
  const pillar = PILLAR_BY_PFC[pfc?.primary ?? ""] ?? "Review";
  const inflow = t.amount < 0; // Plaid sign convention
  const detailed = pfc?.detailed?.replace(/_/g, " ").toLowerCase() ?? "unclassified";

  let tag = detailed;
  let conf = 0.6;
  if (pfc?.detailed) conf += 0.2;
  if (t.merchant_name) conf += 0.12;

  if (pfc?.primary === "INCOME" && inflow) {
    tag = "Recurring payroll";
    conf = Math.max(conf, 0.94);
  } else if (pfc?.primary === "TRANSFER_OUT" && has(merchant, OFF_BANK)) {
    tag = "Transfer to off-bank account";
    conf = Math.max(conf, 0.9);
  } else if (pfc?.primary === "TRANSFER_IN" && Math.abs(t.amount) > 50_000) {
    tag = "Large inbound — liquidity event";
    conf = Math.max(conf, 0.92);
  }

  return {
    raw: `${t.name.toUpperCase().slice(0, 32)}${t.amount ? ` ${t.amount < 0 ? "+" : "-"}$${Math.abs(t.amount).toLocaleString()}` : ""}`,
    merchant,
    category: `${pfc?.primary ?? "UNCLASSIFIED"} · ${detailed}`,
    pillar,
    tag,
    conf: Math.min(0.98, conf),
    src: railFor(t),
    amount: t.amount,
    inflow,
    date: t.date,
  };
}

// ── Signal detection: real rules over the enriched transaction stream ──
export type SignalType = "payroll" | "off_bank_transfer" | "balance_drawdown" | "liquidity_event" | "rollover" | "lending_intent";

export type DetectedSignal = {
  type: SignalType;
  label: string;
  strength: number; // 0-1
  evidence: EnrichedTxn[];
};

const monthsSpanned = (txns: EnrichedTxn[]) => {
  const months = new Set(txns.map((t) => t.date.slice(0, 7)));
  return months.size;
};

// Detect financial-state changes from the enriched stream. Each rule is deliberate and
// inspectable — this is the "produce a result from raw data" step, done for real.
export function detectSignals(txns: EnrichedTxn[]): DetectedSignal[] {
  const signals: DetectedSignal[] = [];

  const payroll = txns.filter((t) => t.tag === "Recurring payroll");
  if (payroll.length >= 1) {
    signals.push({ type: "payroll", label: "Direct-deposit relationship", strength: Math.min(1, payroll.length / 2), evidence: payroll });
  }

  const offBank = txns.filter((t) => t.tag === "Transfer to off-bank account");
  if (offBank.length >= 1) {
    const total = offBank.reduce((s, t) => s + Math.abs(t.amount), 0);
    signals.push({ type: "off_bank_transfer", label: "Spend migrating off-bank", strength: Math.min(1, offBank.length / 3 + total / 20_000), evidence: offBank });
  }

  // Balance drawdown: net outflow across the window while payroll is present.
  const net = txns.reduce((s, t) => s + t.amount, 0); // positive = net out
  if (net > 2_000 && payroll.length > 0 && monthsSpanned(txns) >= 2) {
    signals.push({ type: "balance_drawdown", label: "Balances drawing down", strength: Math.min(1, net / 20_000), evidence: txns.filter((t) => t.amount > 0).slice(0, 3) });
  }

  const liquidity = txns.filter((t) => t.tag === "Large inbound — liquidity event");
  if (liquidity.length >= 1) {
    const isRollover = liquidity.some((t) => has(t.merchant, ["401", "ira", "retirement", "rollover", "fidelity", "vanguard", "schwab"]));
    signals.push({
      type: isRollover ? "rollover" : "liquidity_event",
      label: isRollover ? "Retirement rollover landed" : "Liquidity event",
      strength: 0.9,
      evidence: liquidity,
    });
  }

  const lending = txns.filter((t) => t.src === "Lending" || has(t.merchant, ["mortgage", "zillow", "redfin", "rocket"]));
  if (lending.length >= 1) {
    signals.push({ type: "lending_intent", label: "Home / lending intent", strength: Math.min(1, lending.length / 2), evidence: lending });
  }

  return signals.sort((a, b) => b.strength - a.strength);
}

// ── Assemble an opportunity from the detected signals ──
export type DetectedOpportunity = {
  type: string;
  reason: string;
  action: string;
  destination: string;
  pnlHint: "deposit" | "nna" | "lending" | "deepen";
  confidence: number;
  signals: DetectedSignal[];
  enriched: EnrichedTxn[];
};

export type OpportunityPolicyContext = {
  consent?: boolean;
  doNotContact?: boolean;
  financiallyVulnerable?: boolean;
  employeeRelationship?: boolean;
};

export type OpportunityPolicyDecision = {
  allowed: boolean;
  reason: string;
};

// A separate policy decision keeps signal detection distinct from permission to act.
// These are conservative MVP defaults; a pilot replaces them with the bank's approved
// policy pack and records the version used for every decision.
export function applyOpportunityPolicy(
  opportunity: DetectedOpportunity | null,
  context: OpportunityPolicyContext = {},
): OpportunityPolicyDecision {
  if (!opportunity) return { allowed: false, reason: "No actionable opportunity" };
  if (context.doNotContact) return { allowed: false, reason: "Do-not-contact suppression" };
  if (context.consent === false) return { allowed: false, reason: "Required outreach consent is absent" };
  if (context.financiallyVulnerable) return { allowed: false, reason: "Financial-vulnerability review required" };
  if (context.employeeRelationship) return { allowed: false, reason: "Employee relationship requires specialist review" };
  return { allowed: true, reason: "MVP policy checks cleared" };
}

// The decision rule: which signals, combined, constitute an actionable moment. This is the
// same logic whether the transactions came from Plaid live or a fixture.
export function buildOpportunityFromPlaid(transactions: PlaidTransaction[]): DetectedOpportunity | null {
  if (!transactions.length) return null;
  const enriched = transactions.map(normalizePlaidTxn);
  const signals = detectSignals(enriched);
  if (!signals.length) return null;

  const types = new Set(signals.map((s) => s.type));
  const confidence = Math.round(Math.min(0.97, 0.7 + signals.reduce((s, x) => s + x.strength, 0) / (signals.length * 4)) * 100);

  // Primacy at risk: payroll present + money leaving off-bank (+ drawdown corroborates).
  if (types.has("off_bank_transfer") && types.has("payroll")) {
    return {
      type: "Checking primacy at risk",
      reason: "Direct deposit is anchored here, but spend and balances are migrating to an off-bank account.",
      action: "Prepare a banker conversation with a retention offer.",
      destination: "Banker workbench",
      pnlHint: "deposit",
      confidence,
      signals,
      enriched,
    };
  }

  // Wealth-ready: a rollover or large liquidity event sitting in a deposit account.
  if (types.has("rollover") || types.has("liquidity_event")) {
    return {
      type: types.has("rollover") ? "Retirement rollover — uninvested" : "Liquidity event — uninvested",
      reason: "A large inflow landed on-bank and is not yet invested — a warm wealth moment.",
      action: "Prepare a warm, qualified referral to a wealth advisor.",
      destination: "CEW · Book 360",
      pnlHint: "nna",
      confidence,
      signals,
      enriched,
    };
  }

  if (types.has("lending_intent")) {
    return {
      type: "Home / lending intent",
      reason: "Lending-related activity suggests an active borrowing need.",
      action: "Route to a lending specialist for a pre-approval conversation.",
      destination: "Home Lending queue",
      pnlHint: "lending",
      confidence,
      signals,
      enriched,
    };
  }

  // Deepening fallback: a real relationship with a visible gap.
  return {
    type: "Relationship deepening",
    reason: "Consistent on-bank activity with room to deepen the product relationship.",
    action: "Prepare a next-best-product conversation.",
    destination: "Preferred Rewards",
    pnlHint: "deepen",
    confidence,
    signals,
    enriched,
  };
}

// ── Plaid-schema fixtures — realistic sandbox-shaped data for tests + offline demo ──
// Exactly the shape /transactions/get returns, so the pipeline is exercised identically
// whether these or a live Plaid response feed it.
export const PLAID_FIXTURE_PRIMACY: PlaidTransaction[] = [
  { transaction_id: "tx_p1", name: "GUSTO PAY 8829", merchant_name: "Gusto", amount: -4200, date: "2026-05-02", personal_finance_category: { primary: "INCOME", detailed: "INCOME_WAGES" }, payment_channel: "other" },
  { transaction_id: "tx_p2", name: "GUSTO PAY 8829", merchant_name: "Gusto", amount: -2500, date: "2026-06-02", personal_finance_category: { primary: "INCOME", detailed: "INCOME_WAGES" }, payment_channel: "other" },
  { transaction_id: "tx_p3", name: "CHIME TRANSFER", merchant_name: "Chime", amount: 1800, date: "2026-06-04", personal_finance_category: { primary: "TRANSFER_OUT", detailed: "TRANSFER_OUT_ACCOUNT_TRANSFER" }, payment_channel: "online" },
  { transaction_id: "tx_p4", name: "CHIME TRANSFER", merchant_name: "Chime", amount: 1300, date: "2026-06-18", personal_finance_category: { primary: "TRANSFER_OUT", detailed: "TRANSFER_OUT_ACCOUNT_TRANSFER" }, payment_channel: "online" },
  { transaction_id: "tx_p5", name: "CARD PURCHASE WHOLEFDS", merchant_name: "Whole Foods", amount: 240, date: "2026-06-09", personal_finance_category: { primary: "FOOD_AND_DRINK", detailed: "FOOD_AND_DRINK_GROCERIES" }, payment_channel: "in store" },
];

export const PLAID_FIXTURE_ROLLOVER: PlaidTransaction[] = [
  { transaction_id: "tx_r1", name: "FIDELITY ROLLOVER", merchant_name: "Fidelity", amount: -230000, date: "2026-06-11", personal_finance_category: { primary: "TRANSFER_IN", detailed: "TRANSFER_IN_ACCOUNT_TRANSFER" }, payment_channel: "other" },
  { transaction_id: "tx_r2", name: "PAYROLL DEP", merchant_name: "ADP", amount: -5100, date: "2026-06-02", personal_finance_category: { primary: "INCOME", detailed: "INCOME_WAGES" }, payment_channel: "other" },
  { transaction_id: "tx_r3", name: "CARD PURCHASE", merchant_name: "Costco", amount: 320, date: "2026-06-14", personal_finance_category: { primary: "GENERAL_MERCHANDISE", detailed: "GENERAL_MERCHANDISE_SUPERSTORES" }, payment_channel: "in store" },
];
