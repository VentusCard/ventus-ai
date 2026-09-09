# Customer Intelligence Core — full-color signal cards

## Goal
Make the five signal-family cards in the Systems tab Customer Intelligence Core panel use full, saturated family colors as their backgrounds instead of the current light pastel tints, while keeping text legible and all existing behavior intact.

## Current state
- `src/components/tepilot/insights/CapabilitiesView.tsx` renders the Core panel with a light blue gradient background and five `SignalSection` cards.
- Each card currently uses `familyMeta.tint` (`bg-{color}-100/80`) plus a colored border and left accent bar.
- `SIGNAL_FAMILY_META` in `src/lib/customerDirectoryData.ts` defines the family palette (blue, amber, emerald, violet, rose) but only has pastel tints.

## Changes
1. **Add full-color background tokens**
   - Extend `SIGNAL_FAMILY_META` with a `fullBg` class per family using saturated Tailwind colors:
     - Behavioral: `bg-blue-600`
     - Life Events: `bg-amber-500`
     - Financial Signals: `bg-emerald-600`
     - Demographic: `bg-violet-600`
     - Risk: `bg-rose-600`

2. **Update `SignalSection` to use full-color backgrounds**
   - Replace `familyMeta.tint` with `familyMeta.fullBg` as the card background.
   - Switch card text to white/light for contrast: family label, count, 24h label, and ticker rows.
   - Keep the colored left accent bar but lighten it (e.g., `bg-white/30`) so it reads against the saturated background.
   - Update the icon chip to a white/light translucent style (`bg-white/15 text-white border-white/25`).
   - Update the detection-basis badge to a dark-on-light or light-on-dark style that contrasts with each family color.
   - Preserve the active ring (`familyMeta.cardRing`) and hover state.

3. **Preserve behavior**
   - Rolling ticker animation, pulse dot, click-to-select, and walkthrough gray-out remain unchanged.
   - Active-state ring and selected detail panel below continue to work.

## Verification
- Type-check and build the project.
- Open `/bankdemo` → Systems tab → Customer Intelligence Core and confirm each of the five cards has a distinct full-color background with readable white text.
- Confirm active/hover states and the rolling ticker are still visible.
