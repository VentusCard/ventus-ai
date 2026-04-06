

## Fix: Data-Driven Seasonal Intelligence Not Working

### Root Cause
Two bugs prevent real spending data from rendering:

1. **Amount parsing fails** — `Transaction.amount` is stored as formatted strings like `"$156.78"` or `"$1,234.56"`. `parseFloat("$156.78")` returns `NaN`, so every amount falls back to 0. With all-zero monthly buckets, peak detection picks arbitrary months (index 0 = January, or April depending on the data path).

2. **Fallback behavior** — When all monthly values are 0, `Math.max(...months)` is 0, `indexOf(0)` returns the first month (January), and the "months until peak" calculation produces meaningless results.

### Fix (single file)

**`src/components/exec-demo/PurchaseCycleTimeline.tsx`**:
- Fix the amount parsing on line 61: strip `$` and commas before parsing
  ```ts
  const amount = parseFloat(tx.amount.replace(/[$,]/g, "")) || 0;
  ```
- That's it — the rest of the logic (monthly bucketing, peak detection, velocity, concentration) is correct and will work once amounts are non-zero.

### Result
Sarah's transactions (mostly dated `2025-08-*`) will correctly show August as the peak month with real dollar amounts in the heatmap bars and insight callout.

