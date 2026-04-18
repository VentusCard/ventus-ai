

## Goal
Fix wrong-deals display when clicking a life-event pill. Root cause: the fuzzy token-overlap fallback in `NextOfferRationale.tsx` can match unrelated rollups (e.g., clicking "College Preparation for Dependent" matches and renders the "New Homeowner Transitioning" group).

## Root cause
`PurchaseCycleTimeline` passes a single `activeRollupLabel` string to `NextOfferRationale` without indicating whether it's a **persona rollup** or a **life event**. The matcher then runs three fallbacks (exact → substring → token-overlap). Step 3 (and sometimes step 2) can pick the wrong group when the LLM didn't generate an exact match for the life event.

## Fix — two small changes

### 1. `PurchaseCycleTimeline.tsx`
Pass an additional `activeRollupPillar` prop to `NextOfferRationale`:
- When `activeTriggerLabel` is set → pillar = `"Life Event"`
- Otherwise → pillar = `selectedRollup?.pillar`

### 2. `NextOfferRationale.tsx`
- Add `activeRollupPillar?: string | null` to Props.
- Before running the fuzzy matcher, **scope candidate offers by pillar**:
  - If `activeRollupPillar === "Life Event"` → only match against groups where `g.pillar === "Life Event"`.
  - Else → only match against groups where `g.pillar !== "Life Event"`.
- Keep exact + substring matching within that scoped set.
- **Remove the loose token-overlap step 3** entirely — it's the main source of wrong matches. If exact and substring both fail, fall back to showing the empty-state message (`No offers generated for "<label>" yet.`), which is correct behavior.

## Expected result
- Clicking "College Preparation for Dependent" only shows the life-event group with that exact (or substring-matching) label — never a persona rollup like "New Homeowner Transitioning".
- Clicking a persona pill never accidentally shows a life-event group.
- If the LLM didn't generate a matching group, the empty-state message appears (honest, not misleading).

## Out of scope
- Edge function prompt changes (already instructs verbatim labels).
- Phone view auto-rotation (separate component, intentionally cycles all groups).
- Loading skeleton, card visuals.

