# Ticker legibility: white labels over grey evidence

## Problem
In `/bankdemo` → Systems tab, the rolling signal ticker inside `CapabilitiesView.tsx` (`SignalSection`) shows a white-ish detection label (`example.to`) followed by grey evidence text (`example.ev`). When a row is long or the crossfade between rows creates a spacing conflict, the grey text can paint on top of the white label, making the label harder to read.

## Change
Update the `renderRow` markup in `src/components/tepilot/insights/CapabilitiesView.tsx` so the white label always renders above the grey evidence/arrow:
- Add `relative z-10` to the `example.to` label span.
- Add `relative z-0` to the arrow and evidence spans.
- Optionally add a tiny background scrim behind the label that matches the ticker card background so any underlying grey pixels are fully blocked.

No animation timing, dimensions, or content changes.

## Acceptance
- The white detection label remains fully legible and visually on top of the grey evidence when ticker text is crowded or during the roll transition.
- The rest of the Systems tab layout and behavior is unchanged.