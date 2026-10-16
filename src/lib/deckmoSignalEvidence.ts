import { RICKY_TRANSACTIONS } from "./deckmoRickyTransactions";

/** Ledger transactions explicitly linked to one Section 4 signal. */
export function rickySignalEvidence(label: string) {
  return RICKY_TRANSACTIONS.filter((transaction) => transaction.signals.some((signalLabel) => signalLabel === label));
}
