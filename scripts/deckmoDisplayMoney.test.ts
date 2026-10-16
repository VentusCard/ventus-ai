import { describe, expect, test } from "bun:test";
import { formatRoundedLedgerAmount, formatRoundedMoney } from "../src/lib/deckmoDisplayMoney";
import { RICKY_SIGNAL_DETAILS } from "../src/lib/deckmoScript";
import { signalInlineSegments } from "../src/lib/deckmoSignalAttributes";

describe("deck display rounding", () => {
  test("hundreds under $10K, thousands from $10K, millions from $1M", () => {
    expect(formatRoundedMoney(812_419)).toBe("$8,100");
    expect(formatRoundedMoney(18_949_032)).toBe("$189,000");
    expect(formatRoundedMoney(350_000_000)).toBe("$3.5M");
    expect(formatRoundedMoney(2_800)).toBe("$100");
  });
  test("ledger amounts keep outflow parentheses", () => {
    expect(formatRoundedLedgerAmount("($184.62)")).toBe("($200)");
    expect(formatRoundedLedgerAmount("$12,368.40")).toBe("$12,000");
  });
  test("no signal pill or detail line shows cents", () => {
    for (const [label, detail] of Object.entries(RICKY_SIGNAL_DETAILS)) {
      for (const fact of detail.facts) expect(fact).not.toMatch(/\$[\d,]+\.\d{2}/);
      for (const seg of signalInlineSegments(label)) expect(seg.text).not.toMatch(/\$[\d,]+\.\d{2}/);
    }
  });
});
