import { describe, expect, test } from "bun:test";
import { formatRoundedMoney } from "../src/lib/deckmoDisplayMoney";
import { RICKY_SIGNAL_DETAILS } from "../src/lib/deckmoScript";
import { RICKY_CASH_FLOW_LABEL } from "../src/lib/deckmoCashFlow";
import { RICKY_SIGNAL_LABELS } from "../src/lib/deckmoRickyTransactions";
import { signalInlineSegments } from "../src/lib/deckmoSignalAttributes";

describe("signal pill rounding", () => {
  test("hundreds under $10K, thousands from $10K, millions from $1M", () => {
    expect(formatRoundedMoney(812_419)).toBe("$8,100");
    expect(formatRoundedMoney(18_949_032)).toBe("$189,000");
    expect(formatRoundedMoney(350_000_000)).toBe("$3.5M");
  });
  test("no signal pill shows cents", () => {
    for (const label of Object.keys(RICKY_SIGNAL_DETAILS))
      for (const seg of signalInlineSegments(label)) expect(seg.text).not.toMatch(/\$[\d,]+\.\d{2}/);
  });
  test("detail pages keep exact figures", () => {
    expect(RICKY_SIGNAL_DETAILS[RICKY_CASH_FLOW_LABEL].facts.join(" ")).toContain("$189,490.32");
    expect(RICKY_SIGNAL_DETAILS[RICKY_SIGNAL_LABELS.amex].facts).toContain("$35,735.74 paid year to date");
  });
  test("income title matches observed paychecks", () => {
    expect(RICKY_SIGNAL_LABELS.income).toBe("Stable $23–25K monthly income");
  });
});
