# Reveal the "With Ventus" equation one segment per beat

## Goal
On the Thesis opener, the "With Ventus" line builds up piece by piece: each of its three segments appears on its own advance, three beats total.

## Current state
- The opener beat has 4 steps: line 1 ("Banking is personal."), line 2 ("Or at least, it used to be."), the Today row, then the full With Ventus row (all three segments at once).
- The comparison rows share one CSS grid in `DeckmoDeck.tsx` so the `=` signs align.

## What changes

### Reveal sequence (opener steps: 4 → 6)
- Step 0: "Banking is personal."
- Step 1: adds "Or at least, it used to be."
- Step 2: adds the full Today row (label + equation, as today)
- Step 3: adds "With Ventus" label + first segment "Anticipate and fulfil customer needs"
- Step 4: adds "= Personalized experiences"
- Step 5: adds "= Differentiation"
- Each reveal uses the same fade/slide transition as the other lines.
- The shared grid is preserved, so the `=` signs still align exactly between the two rows even while the Ventus row is partially revealed (unrevealed segments render invisibly but keep their grid cells, so nothing shifts).

### Ripple effects
- Deck step count goes from 30 to 32; slide numbering, progress bar, and presenter view pick this up automatically from the beat's `steps` value.
- No copy, color, or layout changes beyond the staged reveal.

## Verification
- Walk the opener steps at 1440x900 and 1024x768: confirm each Ventus segment appears on its own beat, in order, and the `=` signs stay pixel-aligned at every step.
- Confirm slide count reads 32, no page errors, no external requests.

## Technical notes
- `src/lib/deckmoScript.ts`: opener beat `steps: 4` → `6`.
- `src/components/deckmo/DeckmoDeck.tsx` Opener: Today row reveals at `step >= 2`; Ventus label + segment 0 at `step >= 3`; segment 1 (and its `=`) at `step >= 4`; segment 2 (and its `=`) at `step >= 5`. Unrevealed cells keep grid placement via the existing opacity/translate reveal pattern rather than conditional unmount, so the grid columns never reflow.
