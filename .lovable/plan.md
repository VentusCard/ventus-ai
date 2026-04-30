## Problem

On the Next-Offer tab, clicking a **lifestyle pillar pill** correctly filters the offer collection in the phone mockup, but clicking a **life event pill** (or risk pill) does nothing — the phone keeps showing the default carousel.

## Root cause

There are two distinct selection states in `src/pages/ExecDemoPage.tsx`:

- `activeRollup` — set by lifestyle **pillar** pill clicks
- `activeTriggerPill` — set by **life event** and **risk** pill clicks

The phone view (`GeneratedOffersPhoneView`) only receives `activeRollupLabel` / `activeRollupPillar`, which are derived only from `activeRollup`. So when a life-event pill sets `activeTriggerPill`, the phone never learns about the selection and `expandedGroup` stays null.

The matcher inside the phone view (`findGroupForLabel`) already supports a `"Life Event"` pillar scope — it just never receives that input.

```text
Pillar pill click   → activeRollup        → phone receives label ✓
Life event pill     → activeTriggerPill   → phone receives nothing ✗
Risk pill           → activeTriggerPill   → phone receives nothing ✗
```

## Fix

In `src/pages/ExecDemoPage.tsx` (lines 1195–1196), make `activeTriggerPill` take precedence when passing the label/pillar down to `ExecDemoPhoneView`. When a trigger pill is active, pass its label with pillar scope `"Life Event"` so the matcher locks onto the Life Event group of offers.

```tsx
activeRollupLabel={activeTriggerPill?.label || activeRollup?.label || null}
activeRollupPillar={activeTriggerPill ? "Life Event" : (activeRollup?.pillar || null)}
```

That's the only change needed — the matcher and offer-group rendering already handle the rest.

## Verification

- Next-Offer tab → click life-event pill → phone expands the matching Life Event collection.
- Next-Offer tab → click pillar pill → still expands the matching pillar collection (unchanged).
- Next-Offer tab → click risk pill → phone tries to match against Life Event scope; if no match, falls back to closed state (acceptable since risk pills don't have associated offers anyway).
- Next-Conversation tab → behavior unchanged (chat dispatch still gated to that tab).
