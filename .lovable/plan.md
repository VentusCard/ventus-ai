

## Plan: Simplify Suppressed Deals to Inline Pills

### Problem
The current "Already Covered" section is a heavy dashed-border block with a header, merchant names, signal reasons, and checkmark icons — too much analysis. Most deals should be neutral anyway.

### Changes

**1. `src/components/exec-demo/NextOfferRationale.tsx`** — Replace the suppressed strip with inline pills next to the rollup pill in the card header:
- Remove the entire "Already Covered" `div` block (lines 72-85)
- In the card header row, after the rollup pill, render suppressed items as small gray pills with a checkmark icon and merchant name (e.g., `✓ Ski Pass`), no signal reason text
- Remove the "X active · Y covered" counter text on the right side of the header
- Keep everything else (carousel, signal badges on active deals) unchanged

**2. `supabase/functions/generate-next-offers/index.ts`** — Adjust the prompt to make most deals neutral:
- Change the guidance from "AIM for 2-3 suppressed, 2-3 boosted" to "AIM for 0-2 suppressed, 1-2 boosted, rest neutral" — most deals should be neutral, suppression only when there's a clear recent purchase match

### Result
Card header becomes: `✦ Winter Sports | ✓ Ski Pass | ✓ Helmet | [carousel below]` — clean, compact, informative.

