
## Goal

Make life-event pills in Next-Offer actually control the center “Behavioral Based Deal Collection” card, so clicking “College Preparation for Dependent” or “Home Purchase” shows those generated deal groups and keeps them selected.

## Fundamental root cause

This is not mainly an LLM problem anymore.

The deeper issue is a **state overwrite loop** in the UI:

- In `ExecDemoPage.tsx`, clicking a life-event pill sets `activeTriggerPill` and clears `activeRollup`.
- In `ExecDemoIntelPanel.tsx`, there is an auto-select effect:

```ts
if (activeTab === "analytics" && !activeRollup && rollupStats.length > 0) {
  onRollupClick?.(rollupStats[0]);
}
```

- That means the moment a life-event click clears `activeRollup`, the effect immediately re-selects the first behavioral rollup.
- `handleRollupClick` then clears `activeTriggerPill`.
- So the center panel snaps back to the default behavioral rollup (`Premium Hawaii Jetsetter`), even though the phone mockup still shows the generated life-event groups.

## Why the previous fixes didn’t stick

They addressed real issues, but not the main one:

- backend label mapping improved
- fuzzy matching in `NextOfferRationale` improved
- life-event pills became clickable even with empty txn matches

But after the click succeeded, a separate effect immediately **overrode the selection**. That is why this kept feeling “fundamental” and why the phone mockup looked correct while the center card did not.

## Recommended implementation plan

1. **Create a single source of truth for Next-Offer selection**
   - In `src/pages/ExecDemoPage.tsx`, replace the competing `activeRollup` + `activeTriggerPill` behavior for offer filtering with one unified selection object.
   - Example shape:
     - `kind: "rollup" | "lifeEvent"`
     - `label`
     - `pillar`
     - `txIndices`
     - `color`
     - optional `rollup`

2. **Stop auto-select from overwriting life-event selections**
   - In `src/components/exec-demo/ExecDemoIntelPanel.tsx`, remove the current “whenever `!activeRollup` then select first rollup” behavior.
   - Replace it with a **one-time default selection** only when:
     - analytics tab is first opened
     - no explicit selection exists yet
   - Do not auto-default if a life-event selection is already active.
   - Reset that one-time default when the customer changes or analysis reruns.

3. **Pass unified selection into the center card flow**
   - In `src/components/exec-demo/PurchaseCycleTimeline.tsx`, stop deriving the active offer target from two competing inputs.
   - Use the unified selection directly:
     - rollup selection → use rollup label/pillar
     - life-event selection → use clicked event label with pillar `"Life Event"`

4. **Keep transaction highlighting decoupled**
   - Preserve the earlier behavior where life-event pills can still work with empty `txIndices`.
   - If no matching transactions exist, the left panel should stay unfiltered while the center offer card still updates.

5. **Clean up console noise in the same file**
   - Fix the invalid `React.Fragment` prop warning in `ExecDemoIntelPanel.tsx`.
   - It is likely unrelated to the offer bug, but removing it will make further debugging clearer.

## Files to update

- `src/pages/ExecDemoPage.tsx`
  - unify Next-Offer selection state
  - update click handlers
  - keep left-panel filtering derived from the unified selection

- `src/components/exec-demo/ExecDemoIntelPanel.tsx`
  - replace the current auto-select effect
  - prevent life-event selection from being overwritten
  - fix the `React.Fragment` invalid-prop warning

- `src/components/exec-demo/PurchaseCycleTimeline.tsx`
  - consume the unified selection directly instead of fallback competition

- `src/components/exec-demo/NextOfferRationale.tsx`
  - likely only minor prop plumbing / simplification, not a logic rewrite

## Verification after implementation

1. Run analysis on `/demo`
2. Click `College Preparation for Dependent`
   - center card switches to college-related deals
   - it stays selected
3. Click `Home Purchase`
   - center card switches to home-purchase deals
   - it stays selected
4. Confirm the phone mockup can still rotate through all groups independently
5. Change customer / rerun analysis and confirm the initial default rollup still appears only once on first entry

## Technical detail

```text
Current failure chain:

life-event click
  -> setActiveTriggerPill(...)
  -> setActiveRollup(null)
  -> analytics auto-select effect sees !activeRollup
  -> onRollupClick(first behavioral rollup)
  -> handleRollupClick clears activeTriggerPill
  -> center panel falls back to Premium Hawaii Jetsetter
```

## Out of scope

- changing life-event detection
- changing deal generation prompts
- redesigning the offer card UI
