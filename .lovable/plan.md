

## Add Repeat Pattern Detection to Persona Synthesis

### What Changes

**File: `src/pages/ExecDemoPage.tsx`** (~10 lines)
- In `firePersonaSynthesis`, collect transaction dates per category group and include `dates: string[]` in each pillar entry sent to the edge function

**File: `supabase/functions/synthesize-persona/index.ts`** (~25 lines)
- Compute simple cadence from `dates` array (visits/week, span in weeks) for each category
- Append a natural-language cadence hint to each input line, e.g. `~3x/wk over 10wk` or `~1x/yr over 2yr`
- Add one line to the system prompt: "When a category shows a clear repeat cadence, bake it into the label naturally — 'workday coffee runs', 'weekly grocery runs', 'annual hawaii trips'. Don't use stats like '3.2x/wk' — describe it the way a friend would."

### Example AI Input
```text
[0] Food & Dining > Coffee Shops: 38 txns, $247 [Budget] merchants: Starbucks (~3x/wk over 12wk)
[1] Travel > Hotels: 2 txns, $1,840 [Premium] merchants: Four Seasons Maui (~1x/yr over 2yr)
```

### Expected Output
- "Workday Coffee Runs" instead of "Coffee Enthusiast"
- "Annual Hawaii Trips" instead of "Domestic Traveler"

Two files, ~35 lines changed. No new edge functions or schema changes.

