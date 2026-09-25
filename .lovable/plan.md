# Beat 8.4: Softer Carousel Edges, More Spacing

## Goal
Phones in the rolling carousel fade in and out at the left/right edges instead of being hard-clipped, with more breathing room between phones.

## Changes

### `src/components/deckmo/DeckmoBankdemoScenes.tsx` — `RetentionShowcase`
- Increase the track gap from `clamp(18px,2.5vw,44px)` to `clamp(36px,4vw,72px)` (matching trailing padding so the -50% loop point stays seamless).

### `src/styles/animations.css`
- On `.deckmo-carousel-viewport`, add a CSS mask (and `-webkit-mask-image`) linear gradient: transparent for the outer ~8–10% on each side, fully opaque in the middle — so phones gradually fade in as they enter and fade out as they exit instead of a hard cut at the overflow edge.

## Kept unchanged
- Continuous smooth roll, 55s loop, pause on hover/focus, phone sizes and 11:20 proportions, labels, all seven conversations, arrow-key slide navigation.

## Validation
- Playwright at 1540×855 and 1920×1080: edge phones visibly fade rather than clip, spacing is wider, loop still seamless, pause-on-interaction still works, no overflow; clean build.
