

## Match trigger pills to rollup pill styling (with txn count + spend)

### Problem
The "College Preparation" trigger pill in the Next-Product tab looks different from the rollup pills in the Next-Purchase tab. It needs the same visual format: `✦ Label  N txns · $Xk` with gradient background, colored border, and box shadow.

### Change: `src/components/exec-demo/NextProductRationale.tsx`

1. **Add a `formatSpend` helper** (same as in ExecDemoIntelPanel):
```typescript
function formatSpend(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${Math.round(amount)}`;
}
```

2. **Compute txn count and total spend** from `matchedIndices` before rendering the pill. Move the matching logic above the return so we have the count/spend available:
   - `txnCount = matchedIndices.length`
   - `txnSpend = sum of matched transactions' amounts`

3. **Restyle the trigger pill** (lines ~187-204) to match `PillarRollupChip` exactly:
   - Gradient background: `linear-gradient(135deg, ...)`
   - Border: `1.5px solid ${c.dot}` (or `2px` when active)
   - Box shadow: `0 2px 8px ...` (or `0 0 14px ...` when active)
   - Scale: `1.08` when active
   - Content: `✦ {label}  {count} txns · ${spend}`
   - Remove the `ShieldCheck`/`Zap` icons, use `✦` sparkle like rollup pills

No other files change.

