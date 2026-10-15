import { RICKY_TRANSACTIONS, RICKY_SIGNAL_LABELS as L, type RickyTransaction } from "./deckmoRickyTransactions";

export const RICKY_DEMO_BALANCE_CENTS = 2500000;
export const RICKY_CASH_FLOW_LABEL = "Monthly cash flow";

/** Account transfers and settlements are not additional consumption. */
export function cashFlowBucket(row: RickyTransaction): "payroll" | "allocation" | "spending" | "excluded" {
  if (!row.amount.startsWith("(")) return row.signals.includes(L.income) ? "payroll" : "excluded";
  if (row.signals.includes(L.marcus) || row.signals.includes(L.brokerage)) return "allocation";
  if (row.signals.includes(L.amex) || /WALLET FUNDING|SCHEDULED XFER|SAVINGS|EPAYMENT/i.test(row.description)) return "excluded";
  return "spending";
}

export function rickyCashFlow(transactions: RickyTransaction[] = RICKY_TRANSACTIONS) {
  const monthly = Array.from({ length: 9 }, (_, i) => ({ month: i + 1, payrollCents: 0, spendingCents: 0, allocationCents: 0, surplusCents: 0, idleCents: 0 }));
  const evidence: RickyTransaction[] = [];
  for (const row of transactions) {
    const [month, , year] = row.date.split("/");
    const target = year === "26" ? monthly[Number(month) - 1] : undefined;
    const bucket = cashFlowBucket(row);
    if (!target || bucket === "excluded") continue;
    const cents = Math.round(Number(row.amount.replace(/[^\d.]/g, "")) * 100);
    if (!Number.isFinite(cents)) continue;
    target[bucket === "payroll" ? "payrollCents" : bucket === "allocation" ? "allocationCents" : "spendingCents"] += cents;
    evidence.push(row);
  }
  for (const row of monthly) {
    row.surplusCents = row.payrollCents - row.spendingCents;
    row.idleCents = row.surplusCents - row.allocationCents;
  }
  const average = (key: "surplusCents" | "idleCents") => Math.round(monthly.reduce((total, row) => total + row[key], 0) / monthly.length);
  return { monthly, evidence, surplusCents: average("surplusCents"), idleCents: average("idleCents") };
}