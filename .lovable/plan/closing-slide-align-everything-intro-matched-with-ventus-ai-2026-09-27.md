# Closing slide: align everything, intro-matched "With Ventus AI", only the ticker blue

## What changes

The closing slide's second beat currently renders "With Ventus AI your bank can anticipate customer needs" in its own smaller type with a centered, all-blue equation row beneath it. The user wants the whole closing aligned like the intro slide:

1. **Left-align everything** — the two headline lines and the equation row share the same left edge (the equation row loses `justify-center` and sits flush under the lines, matching the intro's left-aligned comparison grid).
2. **"With Ventus AI" line matches the intro exactly** — adopt the intro's second-line typography: `text-balance text-[clamp(34px,3.9vw,58px)] font-bold leading-[1.06] tracking-normal text-slate-950` (currently `clamp(28px,3vw,48px)` with `leading-[1.12]`). Line 1 stays as is.
3. **Only the rolling phrase is blue** — in the equation row, the static segments ("anticipate customer needs", "differentiated banking") and the `=` signs change from `text-blue-600` to `text-slate-950`; the `CloseTicker` keeps its blue color so the rolling benefit is the only blue element in the row.

## Files

- `src/components/deckmo/DeckmoDeck.tsx` — `Close` component only:
  - Line 2 `<p>` gets the intro-matched typography classes.
  - Equation row: drop `justify-center`, keep `items-baseline` and `gap-x-[clamp(8px,1vw,18px)]`; static segments and `=` signs switch to `text-slate-950`.
  - Ticker span stays blue (inside `CloseTicker`).
- No changes to `src/lib/deckmoScript.ts` — text strings unchanged.

## Beats

Unchanged: 3 beats (line 1 → line 2 + equation/ticker → signature).

## Verification

- `bunx tsgo --noEmit` + tail build log.
- Playwright at 1376×1011, 1540×855, 1691×1011: equation row left-aligned under the headline, only the rolling phrase blue, nothing overlaps the signature or footer.
