## Problem

Spending Habits currently emits three overlapping rollups for the same theme:
- "Tropical Vacations" (11 txns · $11.7k)
- "Hawaiian Travel" (2 txns · $3.6k)
- "Casual Beachwear" (3 txns · $371)

All three are the same behavioral signal (a Hawaii trip). The LLM is splitting one theme into siblings that share vendors, categories, and often overlapping indices.

## Fix

Add a **theme-family merge pass** in `supabase/functions/synthesize-persona/index.ts`, applied right after `filteredSH` is built (currently line 851) and before `filteredSH` is returned.

### Logic

1. Define a small list of canonical theme families with regex matchers and a preferred display label:
   - `tropical_travel` → matches `/tropical|hawaii|beach|resort|island|caribbean|surf|snorkel/i` → label "Tropical Travel"
   - `winter_sports` → matches `/ski|snowboard|snow|alpine|mountain resort/i` → label "Skiing & Snowboarding"
   - `pet_care` → matches `/pet|vet|chewy|petco|petsmart|barkbox|rover|groom/i` → label "Pet Care Routine"
   - `home_goods` → matches `/home\s?goods|home\s?decor|furniture|hardware|garden/i` → label "Home Goods"
   - `fitness_wellness` → matches `/fitness|gym|yoga|peloton|wellness|athleisure|lululemon/i` → label "Fitness & Wellness"

2. For each rollup in `filteredSH`, classify into a family by matching the family regex against `label + categories.join(" ")`. Rollups with no family match keep their own identity.

3. Merge same-family rollups:
   - Union `transaction_indices` (dedupe).
   - Union `categories` (dedupe).
   - Use the canonical family label.
   - Pillar: take the pillar of the family member with the most txns (ties → first).

4. Re-apply the `≥3 txns` floor (pet exempt) to the merged output.

### Why server-side

The panel already trusts synthesize-persona for spending-habit rendering. Doing the merge in the edge function ensures the same clean list flows to Next-Offer / Next-Product / Next-Conversation without each surface re-implementing dedup.

### Out of scope

- Not adding a client-side merge in `ExecDemoIntelPanel.tsx` — server is the single source of truth.
- Not touching pillar-coherence logic; the merge runs after coherence filtering.
- Not changing `classify-transactions` — the underlying pillar assignments are fine; the issue is purely rollup labeling.

## Files touched

- `supabase/functions/synthesize-persona/index.ts` — add theme-family merge pass after line 873.
