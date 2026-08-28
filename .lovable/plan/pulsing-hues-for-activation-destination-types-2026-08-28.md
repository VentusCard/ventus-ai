# Pulsing hues for activation destination types

## Goal
Add subtle, continuous pulsing background hues to the two activation destination types in `/bankdemo` → System tab so they feel alive and intelligent:
- **Bank-facing** destinations (`RadioTower`) — cool slate/indigo pulse
- **Consumer-facing** destinations (`Smartphone`) — soft blue/sky pulse

## Files to change
1. `src/styles/animations.css` (or equivalent global styles)
   - Add two new keyframe animations, e.g. `pulse-hue-bank` and `pulse-hue-consumer`.
   - Use very light, desaturated gradients that shift opacity/position in a slow loop (≈3–4s).
   - Keep contrast high enough for the dark slate text to remain legible.

2. `src/components/tepilot/insights/CapabilitiesView.tsx`
   - On each destination row wrapper (lines ~1142–1170), conditionally apply the animation class based on `d.facing`.
   - Bank-facing: `animate-pulse-hue-bank` with a slate-to-indigo tint.
   - Consumer-facing: `animate-pulse-hue-consumer` with a blue-to-sky tint.
   - Keep existing border, padding, icon tile, text, and navigation button unchanged.

## Verification
- Run a build/typecheck to confirm the new classes/imports are valid.
- Capture a preview screenshot of the System tab activation destinations to confirm both hues pulse subtly and text stays readable.

## Scope boundary
- Only the activation destination rows in the System tab.
- No changes to icons, labels, navigation behavior, or other sections.
