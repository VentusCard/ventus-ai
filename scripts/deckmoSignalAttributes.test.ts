import { describe, expect, test } from "bun:test";
import { signalPaymentSummary, signalAttributes, signalInlineSegments } from "../src/lib/deckmoSignalAttributes";
import { RICKY_SIGNAL_LABELS as L } from "../src/lib/deckmoRickyTransactions";

const DECK_SIGNAL_LABELS: string[] = [
  ...Object.values(L),
  "Small airplane co-owner",
  "BMW X5 loan ending in ~4 months",
  "High pet expenditure",
];

describe("Ricky inline pill wording", () => {
  test("every pill phrase stays readable with no run-on or stray text", () => {
    for (const label of DECK_SIGNAL_LABELS) {
      const segments = signalInlineSegments(label);
      expect(segments.length).toBeGreaterThan(0);
      expect(segments[0]?.kind).toBe("attribute");
      expect(segments[segments.length - 1]?.kind).toBe("attribute");
      for (const segment of segments) {
        if (segment.kind === "connector") expect(segment.text).toMatch(/^ .+ $);
        expect(segment.text).not.toMatch(/variable|deposites|bi weekly/i);
      }
      for (let i = 1; i < segments.length; i += 1) {
        expect(segments[i - 1]?.kind === "attribute" && segments[i]?.kind === "attribute").toBe(false);
      }
      const text = segments.map((segment) => segment.text).join("");
      expect(text).not.toMatch(/\s{2,}/);
      expect(text).not.toMatch(/[·(]|\)$/);
    }
  });
});


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