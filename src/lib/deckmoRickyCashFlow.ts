import { RICKY_SIGNAL_LABELS as L, RICKY_TRANSACTIONS, type RickyTransaction } from "./deckmoRickyTransactions";

export const RICKY_BALANCE_LABEL = "Checking balance";
export const RICKY_LEFTOVERS_LABEL = "Monthly leftovers";
export const RICKY_DEMO_CHECKING = { cents: 8500000, period: "September 2026", illustrative: true } as const;
export type CashFlowKind = "payroll" | "spending" | "savings" | "investing" | "settlement" | "transfer" | "other-income";
export function transactionCents(row: RickyTransaction) {
  return Math.round(Number(row.amount.replace(/[^\d.]/g, "")) * 100);
}
/** Explicit expense basis, not a checking-account reconciliation or complete statement. */
export function cashFlowKind(row: RickyTransaction): CashFlowKind {
  if (!row.amount.startsWith("(") && !row.amount.startsWith("-")) return row.signals.includes(L.income) ? "payroll" : "other-income";
  if (row.signals.includes(L.marcus)) return "savings";
  if (row.signals.includes(L.brokerage)) return "investing";
  if (row.signals.includes(L.amex)) return "settlement";
  if (/WALLET FUNDING/.test(row.description) || (row.source === "Zelle" && !/COACHING/.test(row.description))) return "transfer";
  return "spending";
}
export function rickyCashFlow(transactions: RickyTransaction[] = RICKY_TRANSACTIONS) {
  const monthly = Array.from({ length: 9 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const rows = transactions.filter((row) => row.date.startsWith(`${month}/`) && row.date.endsWith("/26"));
    const sum = (kind: CashFlowKind) => rows.filter((row) => cashFlowKind(row) === kind).reduce((total, row) => total + transactionCents(row), 0);
    const payroll = sum("payroll"), spending = sum("spending"), savings = sum("savings"), investing = sum("investing");
    return { key: `2026-${month}`, month: new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, index, 1))), payroll, spending, savings, investing, afterSpending: payroll - spending, afterSavingInvesting: payroll - spending - savings - investing, otherIncome: sum("other-income"), settlements: sum("settlement"), transfers: sum("transfer"), homeOutlays: rows.filter((row) => cashFlowKind(row) === "spending" && row.signals.includes(L.home)).reduce((total, row) => total + transactionCents(row), 0) };
  });
  const average = (key: "afterSpending" | "afterSavingInvesting") => Math.round(monthly.reduce((sum, row) => sum + row[key], 0) / monthly.length);
  const evidence = transactions.filter((row) => row.date.endsWith("/26") && Number(row.date.split("/")[0]) <= 9);
  return { monthly, afterSpending: average("afterSpending"), afterSavingInvesting: average("afterSavingInvesting"), evidence };
}