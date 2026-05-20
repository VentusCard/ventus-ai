## Goal
Visually differentiate income vs. spend in the **raw transaction CSV display** using accounting convention — income shown as a positive number, spend shown in parentheses, e.g. `$9,500.00` vs `($2,800.00)`. All **downstream copy** (LLM prompts, summaries, "you spent X on Y") continues to use positive numbers.

## Approach
Keep stored amounts unsigned (no churn through every consumer that sums or formats spend). Layer income detection + accounting display on top.

### 1. Income detection helper
Add `src/lib/transactionFlow.ts`:
```ts
export type Flow = "income" | "spend";
export function getFlow(tx: { merchant_name?: string; merchant?: string; source?: string }): Flow {
  const name = (tx.merchant_name ?? tx.merchant ?? "").toUpperCase();
  if (/DES:\s*PAYROLL|PAYROLL|DIRECT DEP|DEPOSIT/.test(name)) return "income";
  return "spend";
}
export function formatAccounting(amount: number, flow: Flow): string {
  const abs = Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return flow === "income" ? `$${abs}` : `($${abs})`;
}
```

### 2. Raw-CSV display points (only these change visually)
Apply `formatAccounting(amt, getFlow(row))` and color (income = emerald-600, spend = slate-900) at:
- `src/components/exec-demo/ExecDemoSelectionDialog.tsx` (raw paste preview table, line ~399)
- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` (raw enrichment table)
- `src/components/exec-demo/ExecDemoLeftPanel.tsx` if it shows amounts
- `src/components/demo/DemoEnrichmentTableView.tsx` (raw engine view on `/demo`)
- `src/components/exec-demo/execDemoData.ts → parseCsvToTransactions`: keep `Transaction.amount` string as-is for the tooltip/table renderers that already format via the helper; switch its current `fmt` to call `formatAccounting`.

### 3. Downstream stays positive
No changes to:
- Pillar aggregations, persona prompts, deal generation, financial tips, advisor chat, analytics totals — they already use absolute values or sum unsigned amounts.
- LLM prompt builders (`advisorContextBuilder`, `eventPreparationPromptBuilder`, etc.) — they format with `formatCurrency` on positive numbers; income rows currently inflate "spend" totals, so we add a filter: when building **spend** context/totals, exclude rows where `getFlow(tx) === "income"`. Income is surfaced separately only where the UI already shows it (none today — out of scope to add unless asked).

### 4. CSV files
No edits to the CSV string literals. Amounts stay positive; the display layer interprets sign by flow.

## Out of scope
- TePilot views (`ResultsTable`, `PreviewTable`, `TransactionDetailModal`) unless you want it there too — see open question.
- Adding an income summary card anywhere.
- Changing the underlying `amount: number` type to signed.

## Open question
Apply accounting brackets in **executive demo + `/demo` raw views only**, or also in **TePilot** raw tables (`PreviewTable`, `ResultsTable`, `TransactionDetailModal`)?