import { expect, test } from "bun:test";
import { rickySignalEvidence } from "../src/lib/deckmoSignalEvidence";
import { RICKY_SIGNAL_LABELS } from "../src/lib/deckmoRickyTransactions";

test("home purchase evidence is only its 6 linked transactions", () => {
  const rows = rickySignalEvidence(RICKY_SIGNAL_LABELS.home);
  expect(rows).toHaveLength(6);
  expect(rows.map((row) => row.id)).toContain("r007");
  expect(rows.every((row) => row.signals.includes(RICKY_SIGNAL_LABELS.home))).toBe(true);
});

test("Goldman Marcus evidence is only its 9 linked transactions", () => {
  expect(rickySignalEvidence(RICKY_SIGNAL_LABELS.marcus)).toHaveLength(9);
});
