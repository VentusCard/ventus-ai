

## Goal

When a life-event (amber) or risk (red) pill is the active selection, the **Behavioral Based Deal Collection** card below the Shopping Pattern card should adopt the same color coding (amber/red) instead of the default behavioral/persona color — keeping the whole intelligence column visually consistent.

## What's wrong today

`NextOfferRationale` (the deal collection card) colors itself based on `activeOfferPillar`, which gets passed the rollup pillar (e.g. "Premium Hawaii Jetsetter" → blue). When a life event is selected, `PurchaseCycleTimeline` overrides cadence display but the deal card below still receives a pillar-derived color from `getColor()`, so the deal collection stays in the persona's color (e.g. blue) instead of switching to amber/red.

## Fix

Pass the active trigger's `kind` + `color` through to `NextOfferRationale` so its header chip, left border, and accent treatments switch to amber (life event) or red (risk) when a trigger pill is active.

### Plan

1. **`src/components/exec-demo/PurchaseCycleTimeline.tsx`**
   - When `activeTrigger` is set, forward `activeTrigger.color` and `activeTrigger.kind` (mapped to a pillar override) into `<NextOfferRationale>` instead of the default rollup-derived pillar color.

2. **`src/components/exec-demo/NextOfferRationale.tsx`**
   - Accept an optional `colorOverride?: string` and `kindOverride?: "lifeEvent" | "risk"` prop.
   - When present, use `colorOverride` for: header pill background, left border accent, sparkle/star icon color, and any pillar-color references in the deal group header.
   - Update the type label from "Persona:" to "Life Event:" (amber) or "Risk Signal:" (red) to match the Shopping Pattern card.
   - Fallback to existing `getColor(pillar)` behavior when no override.

3. **No backend changes.** Pure UI color plumbing.

## Files touched

- `src/components/exec-demo/PurchaseCycleTimeline.tsx` — forward trigger color/kind to NextOfferRationale.
- `src/components/exec-demo/NextOfferRationale.tsx` — accept color/kind overrides; apply to header, border, accents, and type label.

## Verification

1. Click "College Preparation for Dependent" → Shopping Pattern AND Behavioral Deal Collection both show amber styling with "Life Event:" label.
2. Click a risk pill → both cards show red styling with "Risk Signal:" label.
3. Click a persona rollup → both cards revert to the persona's pillar color and "Persona:" label.

## Out of scope

- Phone mockup colors (rotates independently).
- Deal card internal layout/typography.

