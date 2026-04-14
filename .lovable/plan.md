

## Plan: Ensure 5 Visible Deals Per Rollup After Suppression

### Root Cause

Two issues combine to produce fewer than 5 visible deals:

1. **Prompt** (line 37): tells AI to generate "exactly 5 deals" per cluster, but some of those 5 are suppressed.
2. **UI** (line 34 of `NextOfferRationale.tsx`): filters out suppressed deals — `group.deals.filter(d => d.signal !== "suppress")` — so only 3-4 show.

### Fix

**`supabase/functions/generate-next-offers/index.ts`** — Update the prompt:

- Change the instruction so the AI generates **exactly 5 non-suppressed deals** (boost or neutral) per cluster.
- Suppressed categories should still be listed as metadata (the `suppressedCategory` field stays), but as a separate `suppressedCategories` string array on the rollup object — not as deal entries.
- Update the OUTPUT schema description to reflect: each rollup has `deals` (exactly 5, all boost/neutral) and `suppressedCategories` (string array of already-covered categories).

Key prompt change:
```
"1. For EACH cluster, generate exactly 5 ACTIVE deals (signal: boost or neutral only).
   Do NOT include suppressed deals in the deals array.
   Instead, list any already-covered categories in a separate suppressedCategories array on the rollup."
```

**`src/components/exec-demo/NextOfferRationale.tsx`** — Two small changes:

- Remove the `active` filter on line 34 (all deals are now active by design).
- Read `group.suppressedCategories` (string array) instead of extracting them from deals.

No other files change.

