import { describe, expect, test } from "bun:test";
import { RICKY_TRANSACTIONS } from "../src/lib/deckmoRickyTransactions";
import { enrichRickyTransaction } from "../src/lib/deckmoRickyEnrichment";

const byText = (t: string) => enrichRickyTransaction(RICKY_TRANSACTIONS.find((x) => x.description.includes(t))!);

describe("Ricky enrichment", () => {
  test("merchant names contain no raw bank abbreviations", () => {
    for (const t of RICKY_TRANSACTIONS) {
      expect(enrichRickyTransaction(t).merchant).not.toMatch(/FID BKG|\bACH\b|XFER|DIR DEP|EPAYMENT|USATAXPYMT/i);
    }
  });
  test("Fidelity transfer is a clear merchant under Investments", () => {
    expect(byText("FID BKG")).toMatchObject({ merchant: "Fidelity Brokerage Scheduled Transfer", category: "Investments" });
  });
  test("IRS tax refund is classified as income", () => {
    expect(byText("TAX REF")).toMatchObject({ pillar: "Income & Inflows", category: "Tax Refunds" });
  });
  test("no transaction falls back to unclassified", () => {
    expect(RICKY_TRANSACTIONS.filter((t) => enrichRickyTransaction(t).merchant === "Unclassified").map((t) => t.description)).toEqual([]);
  });
});
