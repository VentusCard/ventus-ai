import type { RickyTransaction } from "./deckmoRickyTransactions";

export const RICKY_RAILS = ["Cards", "ACH", "Checks", "Wire", "Zelle"] as const;
export type RickyRail = typeof RICKY_RAILS[number];

export function railFor(transaction: RickyTransaction): RickyRail {
  return transaction.source === "Premium Card" || transaction.source === "Cashback Card" ? "Cards" : transaction.source;
}

export function rawRailFields(transaction: RickyTransaction): { label: string; value: string }[] {
  const fields = [{ label: "Date", value: transaction.date }];
  const descriptor = transaction.description;
  if (railFor(transaction) === "Cards") {
    fields.push({ label: "Card source", value: transaction.source });
    if (transaction.mcc) fields.push({ label: "MCC", value: transaction.mcc });
  } else if (transaction.source === "ACH") {
    const direction = descriptor.match(/^ACH (DEBIT|CREDIT)\b/);
    const identifier = descriptor.match(/\bID ([A-Z0-9-]+)\b/);
    if (direction) fields.push({ label: "Direction", value: direction[1] });
    if (identifier) fields.push({ label: "Identifier", value: identifier[1] });
  } else if (transaction.source === "Checks") {
    const check = descriptor.match(/\bCHECK #(\d+)\b/);
    if (check) fields.push({ label: "Check number", value: `#${check[1]}` });
  } else if (transaction.source === "Wire") {
    const reference = descriptor.match(/\bREF ([A-Z0-9-]+)\b/);
    if (reference) fields.push({ label: "Reference", value: reference[1] });
  } else if (transaction.source === "Zelle") {
    const recipient = descriptor.match(/^ZELLE PAYMENT TO (.+)$/);
    if (recipient) fields.push({ label: "Recipient / memo", value: recipient[1] });
  }
  fields.push({ label: "Amount", value: transaction.amount });
  return fields;
}

export function groupRickyTransactionsByRail(transactions: readonly RickyTransaction[]) {
  return RICKY_RAILS.map((rail) => {
    const rows = transactions.filter((transaction) => railFor(transaction) === rail);
    // Cover both card sources and both ACH directions before filling the sample.
    const variants = new Set<string>();
    const examples: RickyTransaction[] = [];
    for (const row of rows) {
      const variant = rail === "Cards" ? row.source : rail === "ACH" ? row.description.match(/^ACH (DEBIT|CREDIT)\b/)?.[1] ?? "other" : row.id;
      if (!variants.has(variant) && examples.length < 3) {
        variants.add(variant);
        examples.push(row);
      }
    }
    for (const row of rows) {
      if (examples.length >= 3) break;
      if (!examples.some((example) => example.id === row.id)) examples.push(row);
    }
    return { rail, transactions: rows, examples: examples.sort((a, b) => rows.indexOf(a) - rows.indexOf(b)) };
  });
}