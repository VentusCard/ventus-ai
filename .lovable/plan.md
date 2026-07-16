## Audit: LLM taxonomy rules to prevent pet-style miscategorizations

The root cause of "New Pet · Recurring Care" landing in **Demographic** is that the prompt in `supabase/functions/synthesize-persona/index.ts` treated the mere *presence* of recurring pet vendors as a household_composition shift. That same failure mode can fire for any recurring vertical (fitness, streaming, salons, subscriptions, hobbies) — a demographic shift should require a *temporal change*, not just recurring spend.

### Edits (single file: `supabase/functions/synthesize-persona/index.ts`)

1. **`HOUSEHOLD_HINTS` array (~line 174-181)** — Remove `chewy, petsmart, petco, vca, banfield, veterinar` so pet transactions stop being surfaced as demographic candidates. Leave a code comment explaining why they must not be re-added.

2. **`household_composition` bullet (~line 492)** — Delete `new pet (recurring vet + Chewy)` from the allowed families. Add an explicit `EXCLUDES pet spend → Pets pillar rollup` note. Keep empty nest, divorce, Kid → College.

3. **New general audit rule appended to the Demographic Shifts section** — Add one paragraph that generalizes the fix:
   > *Recurring vendor presence is NOT a demographic shift.* Every shift must show a temporal delta (start, stop, step-up, or centroid drift). Recurring spend in a vertical (pets, fitness, streaming, coffee, groceries, hobbies, subscriptions, salons, gym) is a lifestyle habit → Pillar Rollup, not a shift. Before emitting any shift, ask "what change over time does the evidence show?" — if the answer is "none, the vendor is just present", route to a Pillar Rollup and drop the shift.

4. **Claim-boundary reminder (~line 354)** — Append two sentences: pet spend is a Pets pillar rollup (never life event, never demographic); recurring fitness/hobby/subscription spend without onset/offset is a rollup, never a demographic.

### Not changed
- No client-side changes. The intel panel already renders `pillar_rollups[Pets]` under Spending Habits automatically once the LLM emits it there.
- No changes to Life Event, Financial Signal, or Risk ladders — those boundaries are already correct.
- External-signal injection logic is untouched.

Please switch to build mode to apply.
