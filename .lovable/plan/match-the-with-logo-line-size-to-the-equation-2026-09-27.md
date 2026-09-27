# Match the "with (logo)" line size to the equation

On the closing slide, the "with [Ventus AI logo] your bank can anticipate customer needs" line currently renders larger than the equation row below it. Make both the same size, matching the equation.

## Changes (src/components/deckmo/DeckmoDeck.tsx, `Close`)

- Change the "with (logo)" paragraph size from `text-[clamp(34px,3.9vw,58px)]` to the equation's `text-[clamp(17px,2vw,34px)]` (both the normal and `[@media(max-height:900px)]` contexts follow the same clamp, so they stay in sync).
- Scale the inline logo to fit the smaller line: `h-[clamp(26px,3vw,46px)]` → `h-[clamp(13px,1.5vw,23px)]` so it visually matches the text cap height.
- Tighten the gap between the line and the equation from `mt-8` to `mt-5` (and `mt-6` → `mt-4` under max-height:900px) so they read as one block at the matched size.

No copy, data, or behavior changes. Beats and the signature block are untouched.

## Verification

- `bunx tsgo --noEmit` and check the build log.
- Playwright at 1376×1011, 1540×855, 1691×1011: confirm the line and equation render at identical size, the logo sits inline, and the signature still clears the footer.
