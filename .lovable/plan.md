

## Fix trigger pill transaction count and amount display

### Problem
The `Transaction.amount` field from `execDemoData.ts` is a **formatted string** (e.g., `"$1,234.56"`) — not a number. The current code does `Math.abs(Number(transactions[idx]?.amount))` which yields `NaN` because `Number("$1,234.56")` fails.

### Fix: `src/components/exec-demo/NextProductRationale.tsx`

On line 207, parse the dollar string before summing:

```typescript
// Current (broken):
const txnSpend = transactions ? pillMatchedIndices.reduce((sum, idx) => sum + Math.abs(Number(transactions[idx]?.amount) || 0), 0) : 0;

// Fixed — strip "$" and "," before parsing:
const txnSpend = transactions ? pillMatchedIndices.reduce((sum, idx) => {
  const raw = (transactions[idx]?.amount || "").replace(/[$,]/g, "");
  return sum + Math.abs(parseFloat(raw) || 0);
}, 0) : 0;
```

One line change, no other files affected.

