# Closing slide: turn the second statement into an intro-style equation

## What changes

Beat 1 of the closing slide currently shows a two-line statement ending in the rolling ticker ("With Ventus AI your bank can anticipate customer needs / to deliver a differentiated banking experience that lifts NPS"). The user wants the second half restyled as an **equation row** like the intro's "Today vs with Ventus" comparison:

```text
With Ventus AI your bank can anticipate customer needs

anticipate customer needs  =  differentiated banking  =  cross-sells more products (rolling)
```

The equation reuses the intro's visual language: bold blue segments separated by blue "=" signs, one row, segments sized with the same clamp typography.

## Implementation

1. `src/lib/deckmoScript.ts` — restructure `DECKMO.close`:
   - `lines[1]` stays the setup: "With Ventus AI your bank can anticipate customer needs"
   - Replace `lines[2]` with an `equation` array: `["anticipate customer needs", "differentiated banking"]` — the rolling ticker (unchanged: "lifts NPS", "grows deposits", "cross-sells more products", "increases card spend", "deepens engagement") becomes the final segment.
2. `src/components/deckmo/DeckmoDeck.tsx` — `Close` component, beat 1 Reveal:
   - Keep the setup line as-is.
   - Below it, render the equation as a single baseline-aligned row (same pattern as the intro comparison: `flex items-baseline justify-center gap-x-[clamp(8px,1vw,18px)]`, blue `=` separators, segments `whitespace-nowrap text-[clamp(17px,2vw,34px)] font-bold text-blue-600`, with the `CloseTicker` as the last segment).
   - Equation reveals with the same rise animation as the rest of beat 1.
3. Beats stay 3 (line 1 → statement + equation → signature). Line 1, ticker behavior, and signature block unchanged.

## Verification

- `bunx tsgo --noEmit` + build log clean.
- Playwright at 1376×1011, 1540×855, 1691×1011: equation fits on one row at all sizes, ticker rolls as the last segment, signature clears the footer.
