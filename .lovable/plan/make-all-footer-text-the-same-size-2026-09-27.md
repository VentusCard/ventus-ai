# Make all footer text the same size

## Current state
In the deck footer (`src/components/deckmo/DeckmoDeck.tsx`):
- "Slide 7.1 / 10" — `text-[10px]`
- "Confidential" — `text-xs` (12px) ← the odd one out
- "TABLE OF CONTENT" — `text-[10px]`

## Change
- Change "Confidential" from `text-xs` to `text-[10px]` so all three footer texts are 10px, matching the other two. Font weight and color stay as they are.

## Not changing
- Header, slide content, or the table of contents overlay.
- Footer layout, spacing, or the progress bar.

## Verification
Screenshot the footer in a test browser and confirm all three texts render at the same size; check the build log.
