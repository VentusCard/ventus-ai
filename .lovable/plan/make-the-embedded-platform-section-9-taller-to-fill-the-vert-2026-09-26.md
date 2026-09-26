# Make the embedded platform (section 9) taller to fill the vertical space

## What the user asked
The real bankdemo platform embedded on section 9.1–9.3 currently sits in a fixed 552px-tall box, leaving dead space between it and the footer. Make it taller so it takes up the available vertical space.

## Measured current state (1376×1011)
- Workspace: 1188×552px, top ≈ 331, bottom ≈ 883; footer starts ≈ 955.
- Free space below the workspace ≈ 70px; small slack above from `py-8` and `mt-5`.
- The platform content (`AnalyticsContainer`) stretches to whatever height its box has (it is `h-full` internally), so growing the box simply reveals more of the screen — no content changes needed.

## Changes (all in `src/components/deckmo/DeckmoBankdemoScenes.tsx`)

1. **ExactWorkspace outer box** — replace the fixed height with a viewport-based clamp so it grows with the screen:
   - Default (≥1341px wide): `h-[clamp(500px,63vh,700px)]` (at the user's 1011px viewport → ~637px, +85px taller; at 855px viewports → ~540px, still fits with the footer).
   - `@media(max-width:1340px)` variant: `h-[clamp(480px,60vh,640px)]`.
   - Width and scale stay exactly as today (`max-w-[1188px]`, scale 0.825 / 0.77) so the platform keeps its current crispness and column layout.

2. **Inner scaled screen** — replace the fixed inner heights (`669px` / `717px`) with `calc(<same clamp> / 0.825)` and `/ 0.77` respectively, so the scaled content always fills the new outer box pixel-for-pixel (no rounding gaps).

3. **Reclaim spacing in `BankdemoBankTools`** — scene padding `py-8` → `py-6` and the gap above the workspace `mt-5` → `mt-3`, giving the taller box room without clipping the header.

## What is NOT changing
- Header copy, tab pills, beat screens (9.1 / 9.2 / 9.3), platform content, interactivity, arrow-key navigation, other sections.

## Verification
- Playwright at 1376×1011, 1540×855, and 1691×1011: navigate to 9.1/9.2/9.3, screenshot, confirm the workspace bottom clears the footer (no clipping) and the box is visibly taller; confirm clicks/typing inside the platform still work.
- `bunx tsgo --noEmit` + check `/tmp/observability/build-errors.log`.
