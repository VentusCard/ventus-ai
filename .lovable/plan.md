# Living View: second-beat synthesis card

On "THE COMPLETE PICTURE" slide, beat 2 currently only animates the connectors and rings. Add the visible payoff: a wide card that extends downward from the central customer circle, showing the five governed signal families and the three questions they answer.

## Slide flow

- Beat 1: header + internal/external source cards converging on the centered customer circle (unchanged).
- Beat 2: connectors and rings activate (existing animation), and a full-width card reveals below the grid, visually anchored to the circle by a short vertical connector line that draws down from the circle's bottom edge to the card's top edge. The row grid above compresses slightly to make room.

## The card

One wide, light card (bg-background, slate-200 border, deck shadow) spanning the slide canvas, split into two zones:

- Left (~60%): "FIVE SIGNAL FAMILIES" — five rows, one per family, using the exact System-tab names and deck family tones already used on the Ricky page:
  - Spending Habits (blue) — category and merchant-theme rollups from internal rails
  - Life Events (amber) — inferred transitions corroborated by multiple signals
  - Financial Signals (emerald) — loans, leases, mortgages, and investments
  - Demographic (violet) — household composition and life stage
  - Risk (rose) — servicing and wellness only, never offer targeting
- Right (~40%): "THE QUESTIONS IT ANSWERS" — three stacked lines: "Who they are", "What they do", "What do they need next?"

Copy lives in deckmoScript.ts as a new livingView.synthesis block (families array + questions array); no exact counts, amounts, or invented claims. Descriptions paraphrase the System-tab policy notes in deck language.

## Technical details

- src/lib/deckmoScript.ts: add livingView.synthesis { familyLabel, families[{name, tone, note}], questionLabel, questions[3] }.
- src/components/deckmo/DeckmoDeck.tsx (LivingView only):
  - Reuse existing TONES for family dot/border/text.
  - Wrap the grid + new card in the flex column; card is a Reveal show={step >= 1} so it slides up/fades in on beat 2.
  - Connector: a 1px vertical line from circle bottom to card top that grows (scale-y transition) when step >= 1, colored deck-blue.
  - Reduce the row grid's min-height on beat 2 (or cap it) so header + grid + card fit within the slide at 1540x855 and 1024x768 without overflow; existing max-height:800px breakpoints honored.
  - No changes to steps count (stays 2), other scenes, tokens, or light-theme rules.

## Verification

bunx tsgo --noEmit, build log, then Playwright at 1540x855 and 1024x768: beat 1 unchanged and card hidden; beat 2 shows connector + card, no clipping, no page errors.
