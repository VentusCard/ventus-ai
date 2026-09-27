# 8.4: Shorten the placeholder assistant replies

## Goal
The third-bubble placeholder responses added to the three AI-initiated 8.4 conversations are too long. Reduce each to a short placeholder in the requested style, literally like "Sure! Here is what I found...".

## Changes

### `src/lib/deckmoScript.ts` — `retention.showcase.phones`
- Replace the three `reply` values with short one-line placeholders ending in "…":
  - Credit score update: "Sure! Here is what I found…"
  - Payment support: "Yes, here's the plan…"
  - Cash-flow support: "Yes, here are the options…"
- No other copy, layout, or behavior changes.

## Validation
- Playwright at 1540×855: confirm the three bubbles render as short one-line placeholders and the build stays clean.
