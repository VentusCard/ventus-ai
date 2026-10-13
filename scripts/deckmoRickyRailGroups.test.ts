import { describe, expect, test } from "bun:test";
import { RICKY_TRANSACTIONS, type RickyTransaction } from "../src/lib/deckmoRickyTransactions";
import { groupRickyTransactionsByRail, rawRailFields } from "../src/lib/deckmoRickyRailGroups";

describe("Ricky rail overview", () => {
  const groups = groupRickyTransactionsByRail(RICKY_TRANSACTIONS);
  test("uses exactly five rails and retains every original row", () => {
    expect(groups.map((group) => group.rail)).toEqual(["Cards", "ACH", "Checks", "Wire", "Zelle"]);
    expect(groups.flatMap((group) => group.transactions).map((row) => row.id).sort()).toEqual(RICKY_TRANSACTIONS.map((row) => row.id).sort());
  });
  test("combines Premium and Cashback cards and shows both first", () => {
    const cards = groups[0];
    expect(new Set(cards.examples.map((row) => row.source))).toEqual(new Set(["Cashback Card", "Premium Card"]));
    expect([cards.examples[0].source, cards.examples[1].source]).toEqual(expect.arrayContaining(["Cashback Card", "Premium Card"]));
    expect(cards.transactions.length).toBe(RICKY_TRANSACTIONS.filter((row) => row.source.endsWith("Card")).length);
  });
  test("shows the full list per rail with ACH debit and credit first", () => {
    expect(groups.every((group) => group.examples.length === group.transactions.length)).toBe(true);
    const ach = groups[1];
    expect(ach.examples.some((row) => row.description.startsWith("ACH DEBIT"))).toBe(true);
    expect(ach.examples.some((row) => row.description.startsWith("ACH CREDIT"))).toBe(true);
    expect(ach.examples.every((row) => RICKY_TRANSACTIONS.includes(row))).toBe(true);
  });
  test("keeps original order after the variant-coverage lead rows", () => {
    const cards = groups[0];
    const originalIds = RICKY_TRANSACTIONS.filter((row) => row.source.endsWith("Card")).map((row) => row.id);
    const leadIds = cards.examples.slice(0, 2).map((row) => row.id);
    expect(cards.examples.slice(2).map((row) => row.id)).toEqual(originalIds.filter((id) => !leadIds.includes(id)));
  });
  test("extracts only identifiers present in the raw data", () => {
    const row: RickyTransaction = { id: "test", date: "09/17/26", source: "ACH", description: "ACH DEBIT MARCUS SAVINGS ID 091726", amount: "($3,500.00)", signals: [] };
    expect(rawRailFields(row)).toContainEqual({ label: "Identifier", value: "091726" });
    expect(rawRailFields({ ...row, description: "TRANSFER" })).toEqual([{ label: "Date", value: "09/17/26" }, { label: "Amount", value: "($3,500.00)" }]);
    expect(rawRailFields(row).some((field) => field.label === "MCC")).toBe(false);
    expect(rawRailFields({ ...row, source: "Wire", description: "OUTGOING WIRE ESCROW REF 00000007" })).toContainEqual({ label: "Reference", value: "00000007" });
    expect(rawRailFields({ ...row, source: "Checks", description: "CHECK #1042 HOME INSPECTION" })).toContainEqual({ label: "Check number", value: "#1042" });
  });
});
