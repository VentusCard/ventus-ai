# Closing slide: one statement with the ticker at the end

## What changes

The second closing beat becomes one row (a single paragraph, wrapping naturally) ending in the rolling ticker:

"With Ventus AI your bank can anticipate customer needs and deliver a differentiated banking experience that" + [ticker phrase, blue, rolling]

The standalone blue line ("Anticipate customer needs. Deliver differentiated banking.") is removed — its content now lives inside the statement. The ticker phrases conjugate to match "that …": "lifts NPS", "grows deposits", "cross-sells more products", "increases card spend", "deepens engagement".

Beat structure stays 3 beats: line 1 ("Today, banking experiences are generic and replaceable.") → the two-row statement + ticker → "Let's do great things together" + signature. The signature block is unchanged.

## Implementation

1. `src/lib/deckmoScript.ts` — `DECKMO.close`:
   - `lines` → ["Today, banking experiences are generic and replaceable.", "With Ventus AI your bank", "can anticipate customer needs and deliver a differentiated banking experience that"]
   - `ticker` → ["lifts NPS", "grows deposits", "cross-sells more products", "increases card spend", "deepens engagement"]
2. `src/components/deckmo/DeckmoDeck.tsx` — `Close`:
   - The step-1 Reveal renders `lines[1]` as its own row and `lines[2]` + `CloseTicker` as the second row (ticker stays blue inline).
   - Delete the separate blue paragraph; keep margins/type sizes as tuned (large type, mt-10/mt-7 short-viewport spacing).

## Verification

- `bunx tsgo --noEmit` + build log clean.
- Playwright at 1376×1011, 1540×855, 1691×1011: statement reads correctly, ticker rolls at rest on the baseline, signature clears the footer, no overlap.
