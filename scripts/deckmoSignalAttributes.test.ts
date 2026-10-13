import { describe, expect, test } from "bun:test";
import { signalPaymentSummary, signalAttributes } from "../src/lib/deckmoSignalAttributes";
import { RICKY_SIGNAL_LABELS as L } from "../src/lib/deckmoRickyTransactions";

describe("Ricky nested payment evidence", () => {
  test("Fidelity is exactly $5,000 in every observed month", () => {
    const summary = signalPaymentSummary(L.brokerage);
    expect(summary?.monthly.map((row) => row.cents)).toEqual(Array(9).fill(500000));
    expect(summary?.fixed).toBe(true);
  });
  test("Marcus shows exact monthly step-ups rather than a fixed payment", () => {
    const summary = signalPaymentSummary(L.marcus);
    expect(summary?.monthly.map((row) => row.cents)).toEqual([200000, 200000, 200000, 250000, 250000, 300000, 300000, 350000, 350000]);
    expect(summary?.fixed).toBe(false);
    expect(summary?.latest?.month).toBe("September");
  });
  test("Amex annualizes the nine-month average to $47,647.65", () => {
    const summary = signalPaymentSummary(L.amex);
    expect(summary?.totalCents).toBe(3573574);
    expect(summary?.annualizedCents).toBe(4764765);
    expect(summary?.monthly).toHaveLength(9);
    expect(summary?.latest?.cents).toBe(486219);
  });
  test("external loan context never invents payment evidence", () => {
    expect(signalPaymentSummary("BMW X5 loan ending in ~4 months")).toBeNull();
    expect(signalAttributes("BMW X5 loan ending in ~4 months").some((item) => item.includes("$"))).toBe(false);
  });
});