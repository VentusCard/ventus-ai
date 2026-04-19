

## Goal

When a life-event pill (e.g. "College Preparation for Dependent") or risk pill is clicked, the **Shopping Pattern card** above the Behavioral Deal Collection should switch to reflect that selection — same visual treatment, same fields (top spot, top types, lifetime spend, cadence, etc.) — so the whole intelligence column stays internally consistent.

## What's wrong today

`PurchaseCycleTimeline` only knows how to build a cadence card from a `PillarRollup`. When `activeTriggerLabel` is set:

- `selectedRollup` falls back to `rollups[0]` (e.g. "Premium Hawaii Jetsetter")
- `cadenceData` is built from that fallback rollup
- The card silently displays Hawaii data even though the active selection is "College Preparation"
- Only the offer card below updates — the Shopping Pattern card and (visually) the pill treatment don't feel connected

The amber "Life Event Trigger" callout was a placeholder and only shows when `cadenceData` is null. In practice cadence is non-null because the fallback rollup always has data, so the placeholder never appears either.

## Fix

Make `PurchaseCycleTimeline` accept the active life-event / risk pill payload and build a cadence card from it — same component, same fields.

### Plan

1. **`src/pages/ExecDemoPage.tsx`** — pass the active trigger pill's matched indices + color + kind into `ExecDemoIntelPanel` so they can be forwarded to `PurchaseCycleTimeline`. We already have `activeTriggerPill` (label, indices, color); also pass which pill family it came from (life-event vs risk) for the header label and amber/red styling.

2. **`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
   - When firing `onTriggerPillClick`, also include a `kind: "lifeEvent" | "risk"` so the Shopping Pattern card knows whether to render "Life Event Pattern" (amber) or "Risk Pattern" (red).
   - Forward the active trigger payload (label, kind, indices, color) into `<PurchaseCycleTimeline>`.

3. **`src/components/exec-demo/PurchaseCycleTimeline.tsx`** (the real work)
   - Extend props with `activeTrigger?: { label, kind, indices, color } | null`.
   - Build a synthetic `PillarRollup`-shaped object from the trigger when present:
     - `pillar` = `"Life Event"` or `"Risk"`
     - `label` = trigger label
     - `txIndices` = trigger indices
   - Decide which selection wins:
     - If `activeTrigger` exists → use it for `cadenceData` and for `activeOfferLabel`/`activeOfferPillar`
     - Else fall back to `selectedRollup` (current behavior)
   - In `CadenceCard`, color the top border / sparkle icon / header label using the trigger color (amber/red) so the visual matches the source pill, instead of always using `getColor(pillar).dot`.
   - Keep the empty-state handling: if a life event has zero matched indices, fall back to the existing amber "Life Event Trigger" callout (with proper red variant for risk).

4. **No backend / prompt changes.** No changes to NextOfferRationale logic.

## Files touched

- `src/pages/ExecDemoPage.tsx` — extend `activeTriggerPill` state with `kind`, pass through.
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — pass `kind` into `onTriggerPillClick`, forward `activeTrigger` to `PurchaseCycleTimeline`.
- `src/components/exec-demo/PurchaseCycleTimeline.tsx` — accept `activeTrigger`, build cadence from it, use trigger color for header styling, fall back to placeholder only when no indices.

## Verification

1. Click "College Preparation for Dependent" → Shopping Pattern card switches to college transactions (top merchant, types, lifetime, cadence) with amber styling. Behavioral Deal Collection updates to college deals.
2. Click "Home Purchase" → same treatment, updated data.
3. Click a persona pill (e.g. Hawaii Jetsetter) → Shopping Pattern returns to that rollup's cadence with the persona's pillar color.
4. Click a risk pill → Shopping Pattern card shows that flagged transaction(s) with red styling.
5. Phone mockup continues to rotate through all groups independently (unchanged).

## Out of scope

- Changing pill-rendering styles in the header.
- Changing the offer card layout.
- Auto-switching tabs or any new animations.

