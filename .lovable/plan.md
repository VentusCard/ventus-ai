

## Goal
Remove the per-deal delivery timing insight block (the amber "Deliver X weeks before..." card) and all associated derivation logic from `NextOfferRationale.tsx`.

## Changes — `src/components/exec-demo/NextOfferRationale.tsx`

### Remove
1. **Helper functions** (lines ~10-46):
   - `MONTHS` constant
   - `fmtFutureDate()`
   - `nextOccurrenceOfMonth()`
   - `deriveDeliveryInsight()`

2. **Per-tile usage** (lines ~163-173):
   - `const insight = deriveDeliveryInsight(...)` call
   - The entire `{insight && (...)}` JSX block rendering the amber Zap-icon card

3. **Imports**: Remove `Zap` from the lucide-react import (verify no other uses).

### Keep (unchanged)
- All other tile content: merchant name, trend icon, reward pill, message, signal reason, CTA
- Card header, rollup pill, suppressed/boost chips
- Loading skeleton, filtering logic, animations

## Expected result
Each deal tile becomes more compact, ending after the green `signalReason` line and CTA button. No more amber delivery-timing block.

