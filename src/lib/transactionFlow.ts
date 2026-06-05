/**
 * Income vs spend flow detection + accounting-style formatting.
 * Income shows as `$9,500.00`; spend shows as `($2,800.00)`.
 * Downstream consumers should continue to use Math.abs(amount) for spend totals.
 */
export type Flow = "income" | "spend";

export function getFlow(tx: {
  flow?: Flow | string;
  pillar?: string;
  merchant_name?: string;
  merchant?: string;
  description?: string;
}): Flow {
  // Prefer the explicit field set by the classifier.
  if (tx.flow === "income" || tx.flow === "spend") return tx.flow;
  // Income & Inflows pillar always means inflow.
  if (tx.pillar === "Income & Inflows") return "income";
  // Regex fallback for sample/demo data that bypasses the classifier.
  const name = ((tx.merchant_name ?? tx.merchant ?? "") + " " + (tx.description ?? "")).toUpperCase();
  if (/DES:\s*PAYROLL|\bPAYROLL\b|DIRECT\s*DEP|\bDEPOSIT\b/.test(name)) return "income";
  return "spend";
}

export function formatAccounting(amount: number, flow: Flow): string {
  if (isNaN(amount)) return "";
  const abs = Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return flow === "income" ? `$${abs}` : `($${abs})`;
}

/** True if a transaction should be excluded from spend totals/context. */
export function isIncome(tx: {
  flow?: Flow | string;
  pillar?: string;
  merchant_name?: string;
  merchant?: string;
  description?: string;
}): boolean {
  return getFlow(tx) === "income";
}
