# Closing slide: one statement with the ticker at the end

## What changes

The second closing beat is one sentence that breaks into two lines, ending in the rolling ticker:

- Line A: "With Ventus AI your bank can anticipate customer needs"
- Line B: "to deliver a differentiated banking experience that" + [ticker phrase, blue, rolling]

The standalone blue line ("Anticipate customer needs. Deliver differentiated banking.") is removed — its content now lives inside the statement. The ticker phrases conjugate to match "that …": "lifts NPS", "grows deposits", "cross-sells more products", "increases card spend", "deepens engagement".

Beat structure stays 3 beats: line 1 ("Today, banking experiences are generic and replaceable.") → the two-row statement + ticker → "Let's do great things together" + signature. The signature block is unchanged.

## Implementation

1. `src/lib/deckmoScript.ts` — `DECKMO.close`:
   - `lines` → ["Today, banking experiences are generic and replaceable.", "With Ventus AI your bank can anticipate customer needs and deliver a differentiated banking experience that"]
   - `ticker` → ["lifts NPS", "grows deposits", "cross-sells more products", "increases card spend", "deepens engagement"]
2. `src/components/deckmo/DeckmoDeck.tsx` — `Close`:
   - The step-1 Reveal renders `lines[1]` + `CloseTicker` as one paragraph (`text-balance`, wraps naturally); ticker stays blue inline.
   - Delete the separate blue paragraph; keep type sizes/margins as tuned.

## Verification

- `bunx tsgo --noEmit` + build log clean.
- Playwright at 1376×1011, 1540×855, 1691×1011: statement reads correctly, ticker rolls at rest on the baseline, signature clears the footer, no overlap.
