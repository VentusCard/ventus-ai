# Visibility Gap: center Inside panel first, then slide left

## What changes

On the `/deckmo` Visibility Gap slide, the "INSIDE THE WALLS — Messy unstructured activity across payment rails" panel should start centered on the slide, then move to its left position on the next beat, revealing the "OUTSIDE THE WALLS" panel on the right.

## Current behavior

- The Inside ledger and Outside ticker render side-by-side immediately (grid `1fr / divider / 1fr`); only the Outside panel's blur reveals on step > 0.
- The Visibility beat already has 2 reveal steps (`steps: 2` in `deckmoScript.ts`), so no script changes are needed.

## Plan

1. **`src/components/deckmo/DeckmoDeck.tsx` — `Visibility` scene only**
   - Replace the static grid with an absolutely positioned layout inside a `relative flex-1` container so the panels can animate positions:
     - **Step 0:** Inside panel is horizontally centered with a comfortable fixed width (e.g. `w-[900px] max-w-full`, slightly wider than its half-column width so it reads as the solo focus).
     - **Step 1:** Inside panel transitions to the left half (`w-[calc(50%-…)]`, left-aligned) while the Outside panel fades/blurs in on the right half, as today.
   - Animate with the existing pattern: `transition-all duration-700` (transform, left, width) with `motion-reduce:transition-none`. Ticker animations keep running continuously throughout — the ledger never restarts when it moves.
   - The dashed divider between the columns appears (fade in) only on step 1.
   - Keep all current rail color-coding, compact 30px rows, column header, and clipping behavior untouched.

2. **No changes** to `deckmoScript.ts` copy or step counts, ticker keyframes in `src/styles/animations.css`, or any other scene.

## Verification

- Playwright on `/deckmo?from=demo`: advance to the Visibility slide, confirm the Inside panel is centered on step 0, then advances to left + Outside revealed on step 1.
- Screenshot at 1024×768, 1440×900, 1920×1080 — no overflow, no clipped headers, rows still roll.
- Build clean.
