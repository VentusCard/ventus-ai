# Consistent navigation across the whole /deckmo deck

Make every slide advance and go back the same way, on every page and beat.

## Behavior after this change

- Click anywhere on the slide canvas: advance one beat.
- Right arrow / Down arrow / spacebar: advance one beat.
- Left arrow / Up arrow: go back one beat.
- Footer arrow buttons: same advance / back, always in sync with the counter.
- Clicking an interactive element (a pill, a transaction row, a button, a link, the table of content) does its own thing and does not advance the slide.
- While the table of content is open, arrows and clicks navigate the dialog only; Escape or P closes it.

## Problems being fixed

- Scroll detection currently snaps the deck back to the first beat of a page while scrolling, so a page's later beats can be lost after a click or keypress.
- Interactive pages (the 360-degree customer view, recent transactions) feel different from static pages because part of the canvas silently ignores clicks.
- There is no click equivalent of "go back"; only the footer button and arrow keys work.

## Technical notes

All in `src/components/deckmo/DeckmoDeck.tsx`:

- Add a `navigationLock` ref set when `jump()` runs and cleared shortly after the smooth scroll settles; the IntersectionObserver ignores section changes while it is set, so programmatic navigation is never overridden mid-scroll.
- When the observer does fire from a genuine user scroll, move to the first step of the newly visible section only if that section differs from the current one (existing behavior, now gated by the lock).
- Extend the keydown handler: add `" "` (space) and `PageDown` to advance, `PageUp` to go back; skip all navigation keys while `presenterOpen` is true except Escape and P.
- Keep `handleCanvasClick` ignoring `button, a, input, select, textarea, [role='dialog'], [role='tab']` so interactive slide content stays interactive.
- No copy, layout, token, or scene changes; step counts and the `X.Y / 10` counter stay as they are.

## Verification

Walk the full deck at 1540x855 with the footer buttons, arrow keys, and canvas clicks: every page and beat is reachable forward and backward, the counter matches, interactive pills and transaction rows still work without advancing, and the build stays clean.
