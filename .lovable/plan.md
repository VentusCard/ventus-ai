

## Show 5 Boost Pills Per Cluster (Keep Header Anchors)

### What stays
The two header pill rows — suppressedCategories (grey ✓ pills) and boostCategories (green ↑ pills) — remain unchanged.

### Changes

**1. `supabase/functions/generate-next-offers/index.ts`**
- Update prompt rule (line ~49): change "signal: boost or neutral ONLY" → all 5 deals MUST use `signal: "boost"` with a meaningful `signalReason` and `boostCategory`
- Remove line ~65 "AIM for 2-5 boosted and the rest neutral" — replace with "ALL 5 deals MUST have signal: boost"
- Remove/simplify the "neutral" signal description

**2. `src/components/exec-demo/NextOfferRationale.tsx`**
- Line 84: Remove the neutral `Minus` icon conditional — always show `TrendingUp`
- Lines 86-89: Remove conditional coloring — always use emerald styling
- Line 91: Always prepend "↑ "

### Result
Every deal tile across all clusters shows the green boost arrow and emerald reason text. The header still displays suppressed and boosted category anchors as before.

