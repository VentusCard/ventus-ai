import { describe, expect, test } from "bun:test";
import { cashFlowKind, rickyCashFlow, RICKY_DEMO_CHECKING, RICKY_BALANCE_LABEL, RICKY_LEFTOVERS_LABEL } from "../src/lib/deckmoRickyCashFlow";
import { RICKY_TRANSACTIONS } from "../src/lib/deckmoRickyTransactions";
import { DECKMO, RICKY_SIGNAL_DETAILS } from "../src/lib/deckmoScript";

describe("Ricky monthly leftovers", () => {
  test("income minus spending preserves the September home outlay and negative amount", () => {
    const september = rickyCashFlow().monthly[8];
    expect(september.payroll).toBe(2473328);
    expect(september.spending).toBe(32810490);
    expect(september.homeOutlays).toBe(31627500);
    expect(september.afterSpending).toBe(-30337162);
  });
  test("second comparison also subtracts Marcus savings and Fidelity investing", () => {
    const september = rickyCashFlow().monthly[8];
    expect(september.savings).toBe(350000);
    expect(september.investing).toBe(500000);
    expect(september.afterSavingInvesting).toBe(-31187162);
  });
  test("compact amounts average all nine observed 2026 months", () => {
    const summary = rickyCashFlow();
    expect(summary.monthly).toHaveLength(9);
    expect(summary.afterSpending).toBe(-1918370);
    expect(summary.afterSavingInvesting).toBe(-2685036);
    expect(summary.evidence.some((row) => row.date.endsWith("/25"))).toBe(false);
  });
  test("Amex settlements are not added to spending", () => {
    const amex = RICKY_TRANSACTIONS.find((row) => row.id === "amx09");
    if (!amex) throw new Error("Missing September Amex fixture");
    expect(cashFlowKind(amex)).toBe("settlement");
    expect(rickyCashFlow([amex]).monthly[8].spending).toBe(0);
    expect(rickyCashFlow().monthly[8].settlements).toBe(486219);
  });
  test("wallet funding and unknown Zelle transfers are excluded; coaching is an expense", () => {
    for (const [id, expected] of [["r009", "transfer"], ["r034", "transfer"], ["r058", "transfer"], ["r078", "spending"]] as const) {
      const row = RICKY_TRANSACTIONS.find((item) => item.id === id);
      if (!row) throw new Error(`Missing ${id}`);
      expect(cashFlowKind(row)).toBe(expected);
    }
  });
  test("business receipts and refunds do not inflate payroll", () => {
    expect(rickyCashFlow().monthly[2].otherIncome).toBe(1098834);
    expect(rickyCashFlow().monthly[2].payroll).toBe(2308872);
    expect(rickyCashFlow().monthly[8].otherIncome).toBe(1248055);
  });
  test("illustrative checking balance stays separate from cash-flow results", () => {
    expect(RICKY_DEMO_CHECKING).toEqual({ cents: 8500000, period: "September 2026", illustrative: true });
    expect(RICKY_SIGNAL_DETAILS[RICKY_BALANCE_LABEL].evidenceKind).toBe("illustrative-balance");
    expect(rickyCashFlow([]).afterSpending).toBe(0);
    expect(rickyCashFlow([]).afterSavingInvesting).toBe(0);
  });
  test("both new internal signals follow income before existing investments", () => {
    expect(DECKMO.ricky.signals.filter((signal) => signal.family === "Financial").slice(0, 4).map((signal) => signal.label)).toEqual(["Stable $22–26K monthly income", RICKY_BALANCE_LABEL, RICKY_LEFTOVERS_LABEL, "Investing at Fidelity"]);
    expect(RICKY_SIGNAL_DETAILS[RICKY_LEFTOVERS_LABEL].evidenceKind).toBe("cash-flow");
  });
});