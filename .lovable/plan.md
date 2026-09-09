# Make homepage partner logos bigger

## Goal
Increase the visual weight of the four partner logos in the homepage Partners & accelerators section.

## Current state
- File: `src/components/PartnersSection.tsx`
- Logos are capped at `max-h-10` (40px) on mobile and `max-h-12` (48px) on desktop.
- Cards are `h-24` (96px) mobile / `md:h-28` (112px) desktop.

## Changes
1. Increase logo max-height to roughly `max-h-14 md:max-h-18` (56px mobile / 72px desktop).
2. Increase card height proportionally to `h-28 md:h-36` so logos do not feel cramped.
3. Keep the 2×2 / 4-column grid, borders, hover effect, and light theme unchanged.

## Verification
- Build/typecheck.
- Preview the homepage Partners section at desktop and mobile widths to confirm logos are clearly larger without touching card edges.
