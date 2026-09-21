# Living View: second-beat synthesis card

On "THE COMPLETE PICTURE" slide, beat 2 currently only animates the connectors and rings. Add the visible payoff: a wide card that extends downward from the central customer circle, laid out as two lines.

## Slide flow

- Beat 1: header + internal/external source cards converging on the centered customer circle (unchanged).
- Beat 2: connectors and rings activate (existing animation), and a full-width card reveals below the grid, visually anchored to the circle by a short vertical connector line that draws down from the circle's bottom edge to the card's top edge. The row grid above compresses slightly to make room.

## The card — two lines

One wide, light card (bg-background, slate-200 border, deck shadow) spanning the slide canvas:

- Line 1: the five signal families in a single row, evenly spread across the card width, using the exact System-tab names and the deck family tones from the Ricky page:
  - Spending Habits (blue)
  - Life Events (amber)
  - Financial Signals (emerald)
  - Demographic (violet)
  - Risk (rose)
  Each as a tone-dot + bold family name (no sub-descriptions).
- Line 2: the question row, centered, one line: "Who they are · What they do · What do they need next?" (large, deck-serif or bold work-sans headline styling).

Copy lives in deckmoScript.ts as a new livingView.synthesis block (families array with name + tone, and the question line). No counts, amounts, or invented claims.

## Technical details

- src/lib/deckmoScript.ts: add livingView.synthesis { families: [{name, tone} x5], question: "Who they are · What they do · What do they need next?" }.
- src/components/deckmo/DeckmoDeck.tsx (LivingView only):
  - Reuse existing TONES for family dot/text colors.
  - Card is a Reveal show={step >= 1} so it slides up/fades in on beat 2.
  - Connector: a 1px vertical line from circle bottom to card top that grows (scale-y transition) when step >= 1, colored deck-blue.
  - Cap the row grid's min-height so header + grid + card fit at 1540x855 and 1024x768 without overflow; honor existing max-height:800px breakpoints.
  - No changes to steps count (stays 2), other scenes, tokens, or light-theme rules.

## Verification

bunx tsgo --noEmit, build log, then Playwright at 1540x855 and 1024x768: beat 1 unchanged with card hidden; beat 2 shows connector + card, no clipping, no page errors.
