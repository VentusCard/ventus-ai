# Hero Animation Repositioning — Centered Content + Vertical Output Cards

## Goal
The hero content currently sits too high in the viewport. Rebalance so the main text/visual block is vertically centered, and when the Orchestrate output cards appear on the right, they stack vertically (one per row) instead of horizontally — smoother, more elegant, less cramped.

## Changes (all in `src/components/ScrollDrivenHero.tsx`)

### 1. Vertically center the main content
- Change the sticky container's top padding from `pt-24 md:pt-28 xl:pt-16` to true vertical centering on desktop: remove the large top padding on `xl:` and let the flex `items-center` do the centering, so the whole text + card row sits in the optical middle of the viewport on desktop.
- Keep a modest top padding on mobile/tablet (where the fixed nav overlaps), so nothing is hidden under the floating navbar.

### 2. Vertical stacking for the Orchestrate output cards (desktop)
- Change the output cards from `grid-cols-3` (three skinny columns, 120px tall, cramped text) to a single-column vertical stack (`flex flex-col gap-2.5`).
- Restyle each card to use its new wider, shorter shape: label chip and text laid out horizontally (chip left, text right) inside each card, min-height ~48px — readable, elegant rows.
- Cards keep their existing staggered scroll-driven reveal (`personaWindowProgress` stagger), now animating in from the right with a soft rise.

### 3. Panel sizing and connector lines
- Widen the Orchestrate panel from 220px to ~300px so the vertical cards breathe; panel header stays as-is.
- Redraw the animated dashed connectors: instead of three fanning lines at mid-height, draw one short line per card — from the dark card's right edge horizontally into each stacked card's center-left — preserving the animated dash "data flowing" effect.
- Keep the panel vertically centered against the dark card.

### 4. Preserve everything else
- 4-stage scroll narrative (Raw Stream → Categorize → Detect → Orchestrate), persona cycling, pill reveal, stage indicator, mobile/tablet in-card orchestration card, and all colors/fonts remain unchanged.

## Verification
- `bun run build` must pass.
- Playwright check at desktop viewport: content vertically centered, stage 4 shows three vertically stacked output cards with connectors, smooth persona cycling; confirm mobile layout unchanged.
