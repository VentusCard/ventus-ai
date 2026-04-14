

## Plan: Exactly 5 Deals Per Rollup Pill

### Change

**`supabase/functions/generate-next-offers/index.ts`** — two edits:

1. **Line 37** (system prompt): change `"generate 5-7 deals total"` → `"generate exactly 5 deals"`
2. **Line 70** (user prompt): change `"Generate 5-7 deals for EACH cluster"` → `"Generate exactly 5 deals for EACH cluster"`

No other files affected.

