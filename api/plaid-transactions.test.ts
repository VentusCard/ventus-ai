import assert from "node:assert/strict";
import test from "node:test";
import { demoScenarioReady } from "./plaid-transactions.ts";

const payroll = { name: "ACME PAYROLL", amount: -4800, personal_finance_category: { primary: "INCOME" } };
const offbank = { name: "CHIME TRANSFER", amount: 2100, personal_finance_category: { primary: "TRANSFER_OUT" } };
const rollover = { name: "FIDELITY 401K ROLLOVER", amount: -230000, personal_finance_category: { primary: "TRANSFER_IN" } };

test("deposit-retention requires payroll plus off-bank movement", () => {
  assert.equal(demoScenarioReady("deposit-retention", [payroll]), false);
  assert.equal(demoScenarioReady("deposit-retention", [payroll, offbank]), true);
  assert.equal(demoScenarioReady("deposit-retention", [rollover]), false);
});

test("wealth-growth requires a qualified inbound liquidity event", () => {
  assert.equal(demoScenarioReady("wealth-growth", [payroll, offbank]), false);
  assert.equal(demoScenarioReady("wealth-growth", [rollover]), true);
});
