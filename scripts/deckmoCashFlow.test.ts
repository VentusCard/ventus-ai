import { describe, expect, test } from "bun:test";
import { cashFlowBucket, RICKY_DEMO_BALANCE_CENTS, rickyCashFlow } from "../src/lib/deckmoCashFlow";
import { RICKY_TRANSACTIONS } from "../src/lib/deckmoRickyTransactions";

describe("compact Ricky cash flow", () => {
  test("illustrative profile balance is $25,000", () => {
    expect(RICKY_DEMO_BALANCE_CENTS).toBe(2500000);
  });
  test("surplus averages payroll minus spending over nine months, excluding the one-time home purchase", () => {
    const result = rickyCashFlow();
    expect(result.monthly).toHaveLength(9);
    expect(result.surplusCents).toBe(1579086);
    expect(result.monthly[8]?.spendingCents).toBe(1310490);
    expect(result.evidence.some(row => row.id === "r007")).toBe(false);
    expect(RICKY_TRANSACTIONS.find(row => row.id === "r007")?.amount).toBe("($315,000.00)");
  });
  test("idle cash deducts savings and investing from ongoing surplus", () => {
    const result = rickyCashFlow();
    expect(result.idleCents).toBe(812419);
    expect(result.monthly[0]?.idleCents).toBe(1501301);
    expect(result.monthly[8]?.idleCents).toBe(312838);
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