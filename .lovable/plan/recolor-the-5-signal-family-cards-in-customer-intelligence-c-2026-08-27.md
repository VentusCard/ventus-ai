# Recolor the 5 signal-family cards in Customer Intelligence Core

## Current state

In the System tab, the Customer Intelligence Core is the dark center panel of the pipeline board. Its five signal cards (Behavioral, Life Event, Financial, Demographic, Risk) already carry the correct family hues (blue, amber, emerald, violet, rose), but those hues only appear on a 3px left bar and a small pulsing dot. Every card body uses the same translucent white-on-dark treatment, so all five read as identical grey slabs — unlike the Intelligence Database cards, which now use saturated family colors.

## What to change

Give each card a visible family identity while keeping it legible on the dark core panel:

- Tinted card surface: replace the shared `bg-white/[0.045]` with a per-family colored wash (a soft gradient fading left-to-right from the family hue into transparent) so blue, amber, emerald, violet, and rose are distinguishable at a glance.
- Family-colored border instead of the generic `border-white/[0.08]`, brightening on hover and on the active/selected card.
- Wider, brighter left accent bar plus a matching family-colored icon chip next to the label (using each family's existing lucide icon) so the color has a second anchor point.
- Label and the "· 24h" count pick up a light tint of the family color rather than uniform slate.
- Active state: stronger family-tinted background and ring, replacing the current white-ring treatment, so the selected family visibly matches the detail panel below.
- The rolling detection ticker keeps its current behavior and typography; only the surrounding chrome is recolored.

Card size, spacing, and the overall pipeline layout stay the same, so nothing in the three-column board shifts.

## Technical notes

- All edits are contained in `src/components/tepilot/insights/CapabilitiesView.tsx`.
- Extend each entry in the `SIGNALS` array with dark-surface style fields (e.g. `darkSurface`, `darkBorder`, `darkActive`, `darkText`) keyed to the same hue family already used by `color`/`dot`/`tint`, and consume them in `SignalSection`.
- Hues stay aligned with the shared family palette in `src/lib/customerDirectoryData.ts` (Behavioral blue, Life Event amber, Financial emerald, Demographic violet, Risk rose).
- No changes to data, counts, or the shared detail panel logic.
