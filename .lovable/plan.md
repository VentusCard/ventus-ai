# Fix `$0` amounts in intel-panel pill sublabels

## What's wrong
In the Behavioral Intelligence panel, several pills render `$0`:
- `College Preparation4 txns · $0`
- `Home Purchase / Transition4 txns` (spend suppressed because it computed to 0)
- `Gambling3 txns · $0`, `Financial Vulnerability3 txns · $0`

## Root cause
`buildLocalProfile` (`src/components/exec-demo/execDemoData.ts` ~line 79-97) stores each transaction's `amount` as a **display-formatted string** returned by `formatAccounting(rawAmt, flow)` — e.g. `"$685.00"` or `"($685.00)"` — even though the `Transaction` type declares `amount: number`.

Every pill sublabel in `src/components/exec-demo/ExecDemoIntelPanel.tsx` sums via:
```ts
matchedIndices.reduce((s, idx) => s + (Number(transactions?.[idx]?.amount) || 0), 0)
```
`Number("$685.00")` is `NaN`, coerced to `0`. So any sum over these strings collapses to `$0`. The enrichment table works because it separately parses with a regex (line 1371).

This affects life events, financial signals, demographics, risk pills, and the "$0" suppression branch in life events.

## Fix
Introduce one helper and use it wherever the panel converts `transactions[idx].amount` to a number.

1. Add a tiny helper at the top of `ExecDemoIntelPanel.tsx` (near `formatSpend`):
   ```ts
   function toAmount(v: unknown): number {
     if (typeof v === "number") return isFinite(v) ? Math.abs(v) : 0;
     if (typeof v === "string") {
       const n = parseFloat(v.replace(/[^0-9.\-]/g, ""));
       return isFinite(n) ? Math.abs(n) : 0;
     }
     return 0;
   }
   ```
2. Replace the five `Number(transactions?.[idx]?.amount) || 0` sums (lines ~838, ~1026, ~1113, ~1180, and the two inline ones at ~731 / ~753 already handle strings but should route through the same helper for consistency) with `toAmount(transactions?.[idx]?.amount)`.
3. No changes to persona synthesis, edge functions, or the enrichment table — the amounts are already correct in memory, only the panel's parser is wrong.

## Verification
- Reload `/bankdemo` demo tab; the College Prep, Home Purchase, Gambling, and Financial Vulnerability pills should show real `$X` totals.
- Existing pills that already showed non-zero amounts (Hawaiian Vacations, Skiing, Tennis Club) must remain unchanged — they were computed from `pillarRollups`, which uses parsed amounts on the enrichedTxs path.
- Typecheck.

## Scope
Frontend-only, single file: `src/components/exec-demo/ExecDemoIntelPanel.tsx`. No backend or LLM prompt changes.
