# Why "No significant life events detected" now shows

## Root cause (verified)

Two turns ago we rewired the pipeline so **`synthesize-persona` became the sole source of life events** — `src/pages/ExecDemoPage.tsx` (lines 683–716) explicitly discards the upstream `analyze-lifestyle-signals` output and only keeps `data.detected_life_events` returned by the persona classifier.

`supabase/functions/synthesize-persona/index.ts` then applies four strict gates before emitting a life event:

1. `evidence.length >= 2` (line 673)
2. No pet vocabulary anywhere (line 675)
3. Every `transaction_indices` entry must have `owner === "life_event"` in the pre-computed `txnOwner` table (line 669 → `cleanIndices`)
4. LLM must have chosen the `LIFE_EVENT` bucket over Financial Signal / Demographic in the ladder

The upstream detector logged `Detected life events after filtering: 2` (Home Purchase, College Prep for Sarah), but those are thrown away. The persona LLM on this run routed College Prep → Demographic (`Kid → College`) and did not re-emit Home Purchase with ≥2 evidence rows whose `owner` tag was `life_event` — so `filteredLE` came back empty and the panel rendered the "No significant life events detected" fallback.

External signals didn't rescue the row because Sarah's only external fixture is the auto-loan (bucket = `financial_signal`, not `life_event`).

Net: the ladder is working exactly as designed, but by making persona the *sole* authority we introduced a silent-drop failure mode where a genuinely detected life event disappears if the LLM re-classifies it downward.

## Fix — hybridize instead of replacing

Keep the ladder authority for de-duplication, but let the upstream detector supply life events the persona classifier omitted.

### 1. `supabase/functions/synthesize-persona/index.ts`

- After building `filteredLE`, iterate over the upstream `detectedEventNames` payload (already received via `lifeEvents` in the request body).
- For any upstream event whose name is **not** in `droppedUpstreamLifeEvents` (college / auto / mortgage / student loan retirement list), **not** matched by `PET_VOCAB`, and **not** already present in `filteredLE` (case-insensitive `event_name` match), append a passthrough entry using the upstream evidence:
  ```
  { event_name, confidence, evidence, talking_points, transaction_indices: [] }
  ```
  Empty `transaction_indices` is fine because the ladder only uses these for downgrading downstream tiers, and upstream evidence merchants already hydrate the pill.
- Cap the merged list at 3 events (matches the existing UI slice).

### 2. `src/pages/ExecDemoPage.tsx`

- No structural change needed — `data.detected_life_events` will now include the rescued upstream events. Keep the "Life events come EXCLUSIVELY from synthesize-persona" comment but update it to note that persona now merges upstream events under the same taxonomy guards.
- `fireLifeEventDetection` already appends `bucket === "life_event"` externals on top, so the auto-loan external continues to route to Financial Signals only. No change there.

### 3. Cross-row de-dup safety net

`ExecDemoIntelPanel.tsx` (lines 364–406) already drops demographic pills whose label matches a life event name. Because we're re-adding upstream events, verify the following still holds after the merge:

- "Kid → College" demographic pill is suppressed if "College Preparation for Dependent" is now a life event (case-insensitive contains, not just exact match — extend `lifeEventNameSet` check to also match substrings like `/college/i` for the college case, or leave demographic normalization broader).

Only that one contains-check needs to be added; the rest of the ladder is unchanged.

## Verification

- Reload `/bankdemo` → Demo tab for Sarah Mitchell: Life Event row should show "Home Purchase in the SF Bay Area" and "College Preparation for Dependent" pills again, Demographic row no longer shows a duplicate "Kid → College".
- Clicking the auto-loan Financial Signal pill still surfaces the violet External Signal row (unchanged).
- Console: `[PRELOAD] Life events hydrated:` count should be ≥ 1 for Sarah.

## Files touched

- `supabase/functions/synthesize-persona/index.ts` — add upstream-rescue merge step before the response.
- `src/pages/ExecDemoPage.tsx` — comment update only.
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — extend demographic-vs-life-event dedup to catch the college substring case.
