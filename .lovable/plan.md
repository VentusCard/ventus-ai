## Problem

Two bad pills in Behavioral Intelligence:

1. **Life Events** shows "College Preparation for Dependent" AND **Demographic** shows "Kid → College" — same theme, two pills. The College Prep pill comes from upstream `analyze-lifestyle-signals` and flows into the UI unchanged.
2. **Demographic** shows "New Pet Ownership" — pets are recurring lifestyle spend and should live in the Pets Pillar Rollup under Spending Habits. `synthesize-persona` already tells the LLM to exclude pets, but the model emits it anyway.

## Approach

Per the user's constraint, `synthesize-persona` (the last LLM in the chain) owns final routing for all five sections. Do not modify any other edge function or the UI's rendering logic. Make `synthesize-persona`'s output the authoritative signal map by:

1. Accepting the upstream `lifeEvents` as **candidates**, not accepted.
2. Adding a new output field `dropped_upstream_life_events: string[]` — event_names the LLM has determined belong in a different bucket (currently: college-themed → Demographic, auto/car-loan themed → Financial Signals, mortgage → Financial Signals). This is computed deterministically in code (regex on the incoming names) — no reliance on LLM behavior.
3. Post-filter output shape (already the natural home for defensive filters):
   - `detected_life_events`: strip any event whose `event_name` matches the college/auto/mortgage regexes (LLM drift guard).
   - `demographic_shifts`: strip any shift whose `label`/`category` matches `/pet|chewy|petsmart|petco|banfield|vca|adopt/i`. If a stripped shift had ≥2 pet-vendor evidence rows, synthesize a `pillar_rollups` entry `{ pillar: "Pets", label: "Pet care routine", transaction_indices: <those indices> }` so the pet signal still surfaces under Spending Habits instead of being lost.

## UI wiring (minimum-viable, no rendering change)

The existing merge in `src/pages/ExecDemoPage.tsx` (lines 665–700) already applies `isBannedLifeEvent` to *promoted* events. Extend the same filter to *upstream* `detectedEvents` using the new `dropped_upstream_life_events` list returned by synthesize-persona:

```ts
const droppedUpstream = new Set(
  (data?.dropped_upstream_life_events || []).map(normalizeName)
);
const keptUpstream = detectedEvents.filter(
  e => !droppedUpstream.has(normalizeName(e.event_name || ""))
);
```

Then merge `keptUpstream + promotedEvents` instead of `detectedEvents + promotedEvents`. This is a two-line change; it does not alter what the LLM decides — it only respects synthesize-persona's routing.

## Files touched

- `supabase/functions/synthesize-persona/index.ts`:
  - Add deterministic post-processing to compute `dropped_upstream_life_events` from the incoming `lifeEvents` names (college / auto-loan / mortgage regexes).
  - Add output filters that strip college-themed life events and pet-themed demographic shifts.
  - When a pet-themed demographic shift is stripped and has ≥2 evidence indices, promote those into a Pets pillar_rollup so Spending Habits still shows the signal.
  - Add `dropped_upstream_life_events` to the JSON schema and the final response payload.
- `src/pages/ExecDemoPage.tsx` (~lines 665–700): honor `dropped_upstream_life_events` when merging upstream + promoted events. Two-line change, no visual/behavior change beyond removing the duplicate pill.

No changes to `analyze-lifestyle-signals`, no changes to any UI panel, no schema/DB changes.

## Verification

- Fresh run: **Life Events** row shows only Home Purchase (no College Prep pill).
- **Demographic** row shows Kid → College (unchanged) but no "New Pet Ownership".
- **Spending Habits** row includes a Pets rollup when there is meaningful pet spend.
