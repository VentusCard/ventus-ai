

## Combine Life Events into Single Offer Generation Call

### Problem
Currently `fireNextOffers` and `fireLifeEventDetection` run in parallel, followed by a separate `fireLifeEventOffers` call. This produces two separate API calls and appends results awkwardly.

### Solution
Sequence the calls: detect life events first, then pass both pillars AND life events into a single `generate-next-offers` call.

### Changes — `src/pages/ExecDemoPage.tsx`

1. **Update `fireNextOffers`** to accept an optional `lifeEvents` parameter and include it in the request body alongside `persona` and `pillars`

2. **Change orchestration** (lines 277-280): Instead of firing `fireNextOffers` and `fireLifeEventDetection` in parallel, fire life event detection first. After events are detected (line 364-371), call `fireNextOffers` with the detected events as a third argument.

3. **Remove `fireLifeEventOffers`** (lines 380-399) entirely — no longer needed since life events go into the main call.

4. **In `fireLifeEventDetection`** (line 368-372): Replace the `fireLifeEventOffers(events)` call with `fireNextOffers(personaSynthesisRef.current!, pillarsRef.current, events)` — passing detected events into the main offer generation.

5. **Stop calling `fireNextOffers` from the synthesis callback** (line 278) — move it to after life event detection completes.

### Edge function
No changes needed — `generate-next-offers` already accepts both `persona`/`pillars` and `lifeEvents` in one request and generates combined output with life event groups appended after behavioral groups.

### Result
One API call produces all deal groups in order: behavioral clusters first, life event clusters second.

