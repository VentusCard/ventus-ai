import { describe, expect, test } from "bun:test";
import { signalPaymentSummary, signalAttributes, signalInlineSegments } from "../src/lib/deckmoSignalAttributes";
import { RICKY_SIGNAL_LABELS as L } from "../src/lib/deckmoRickyTransactions";
import { RICKY_KYC_SIGNAL_LABEL, RICKY_KYC_PROFILE, RICKY_LUXURY_AUTO_LABEL, RICKY_TOTAL_ASSETS_LABEL, RICKY_GENERAL_SPENDING_LABEL } from "../src/lib/deckmoScript";

const DECK_SIGNAL_LABELS: string[] = [
  RICKY_KYC_SIGNAL_LABEL,
  ...Object.values(L),
  "Small airplane co-owner",
  RICKY_LUXURY_AUTO_LABEL,
  RICKY_TOTAL_ASSETS_LABEL,
  RICKY_GENERAL_SPENDING_LABEL,
  "High pet expenditure",
];

describe("Ricky inline pill wording", () => {
  test("KYC shows age and separate location and tier attributes", () => {
    expect(signalInlineSegments(RICKY_KYC_SIGNAL_LABEL).filter((segment) => segment.kind === "attribute").map((segment) => segment.text)).toEqual(["Age 34", "San Francisco", "CA", "94123", "Preferred tier", "$25,000"]);
    expect(RICKY_KYC_PROFILE.customerId).toBe("45275487");
    expect(RICKY_KYC_PROFILE.name).toBe("Ricky J");
  });
  test("income attributes keep the household estimate distinct from payroll", () => {
    expect(signalAttributes(L.income)).toContain("Monthly income $23,000–$25,000");
    expect(signalInlineSegments(L.income).filter((segment) => segment.kind === "attribute").map((segment) => segment.text)).toContain("Est. annual household income $500K");
  });
  test("general spending phrase states the annual estimate in general spending", () => {
    const attributes = signalInlineSegments(RICKY_GENERAL_SPENDING_LABEL).filter((segment) => segment.kind === "attribute").map((segment) => segment.text);
    expect(attributes).toEqual(["Annual estimate", "$3,300/year", "general spending"]);
    expect(signalAttributes(RICKY_GENERAL_SPENDING_LABEL)).toContain("Everyday living expenses");
  });
  test("every pill phrase stays readable with no run-on or stray text", () => {
    for (const label of DECK_SIGNAL_LABELS) {
      const segments = signalInlineSegments(label);
      expect(segments.length).toBeGreaterThan(0);
      expect(segments[0]?.kind).toBe("attribute");
      expect(segments[segments.length - 1]?.kind).toBe("attribute");
      for (const segment of segments) {
        if (segment.kind === "connector") {
          expect(segment.text.startsWith(" ")).toBe(true);
          expect(segment.text.endsWith(" ")).toBe(true);
        }
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
  test("external ownership and asset context never invent payment evidence", () => {
    expect(signalPaymentSummary(RICKY_LUXURY_AUTO_LABEL)).toBeNull();
    expect(signalPaymentSummary(RICKY_TOTAL_ASSETS_LABEL)).toBeNull();
    expect(signalAttributes(RICKY_LUXURY_AUTO_LABEL).some((item) => item.includes("$"))).toBe(false);
  });
});