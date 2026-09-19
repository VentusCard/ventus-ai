# Show MCC category descriptions on card ledger rows

## Goal
On the /deckmo Visibility Gap "Inside the Walls" rolling ledger, card transactions currently show a bare MCC code (e.g. "MCC 5712"). Add the human-readable category description so the audience instantly understands what the code means.

## Changes
- In `src/lib/deckmoScript.ts`, add a small MCC description map (e.g. 5712 → "Home Furnishings", 5812 → "Restaurants & Dining") or extend the two card rows with a `mccLabel` field. Non-card rows are untouched — they still show no MCC.
- In `src/components/deckmo/DeckmoDeck.tsx`, render the description next to the code, e.g. "MCC 5712 · Home Furnishings", keeping the compact muted styling and truncation so nothing spills on the 4-column ledger row.
- Keep descriptions generic retail-category language (no merchant or vendor names).

## Validation
- Confirm the MCC label appears only on the two card rows, on every loop repeat.
- Check no clipping at 1024×768, 1389×855, 1440×900, 1920×1080.
- Build stays clean.
