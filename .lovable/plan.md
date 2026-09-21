# Ricky: keep right panel empty on the first beat

## Current behavior
- In `src/components/deckmo/DeckmoDeck.tsx` the right section always renders the "VENTUS CUSTOMER INTELLIGENCE" eyebrow (`d.signalLabel`, line ~300). Only the signal pills animate in on the second step (`Reveal show={step > 0}`).

## Change
- Hide the whole right-panel content on the first beat: render the label bar and pill grid only when `step > 0`.
- On the first beat the right side stays a clean empty panel (same light background, no label, no pills).
- On the second beat the label and pills appear as they do today (pills keep their staggered Reveal).

## Scope
- Only the Ricky scene in `DeckmoDeck.tsx`. No script/data changes, no other scenes touched.

## Verification
- Typecheck (`tsgo --noEmit`) clean; Playwright check at 1540x855 (plus 1024x768 and 1920x1080): first beat shows an empty right panel, second beat shows the label and pills.
