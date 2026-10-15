import { describe, expect, test } from "bun:test";
import { cashFlowBucket, RICKY_DEMO_BALANCE_CENTS, rickyCashFlow } from "../src/lib/deckmoCashFlow";
import { RICKY_TRANSACTIONS } from "../src/lib/deckmoRickyTransactions";

describe("compact Ricky cash flow", () => {
  test("illustrative profile balance is $25,000", () => {
    expect(RICKY_DEMO_BALANCE_CENTS).toBe(2500000);
  });
  test("surplus averages payroll minus spending over nine months, including escrow", () => {
    const result = rickyCashFlow();
    expect(result.monthly).toHaveLength(9);
    expect(result.surplusCents).toBe(-1920914);
    expect(result.monthly[8]?.spendingCents).toBe(32810490);
    expect(result.evidence.some(row => row.id === "r007")).toBe(true);
  });
  test("idle cash deducts savings and investing, retaining negative values", () => {
    const result = rickyCashFlow();
    expect(result.idleCents).toBe(-2687581);
    expect(result.monthly[0]?.idleCents).toBe(1501301);
    expect(result.monthly[8]?.idleCents).toBe(-31187162);
  });
  test("settlements and wallet transfers are not double-counted spending", () => {
    const buckets = new Map(RICKY_TRANSACTIONS.map(row => [row.id, cashFlowBucket(row)]));
    expect(buckets.get("amx09")).toBe("excluded");
    expect(buckets.get("r009")).toBe("excluded");
    expect(buckets.get("r005")).toBe("spending");
    expect(buckets.get("mar09")).toBe("allocation");
    expect(buckets.get("r002")).toBe("allocation");
    expect(buckets.get("r062")).toBe("excluded");
  });
});