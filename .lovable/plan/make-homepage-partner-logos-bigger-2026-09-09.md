# Make homepage partner logos bigger

## Goal
Increase the visual weight of the four partner logos in the homepage Partners & accelerators section without altering the cards themselves.

## Current state
- File: `src/components/PartnersSection.tsx`
- Logos are capped at `max-h-10` (40px) on mobile and `max-h-12` (48px) on desktop.
- Cards are `h-24` (96px) mobile / `md:h-28` (112px) desktop.

## Changes
1. Increase only the logo max-height inside the existing cards to roughly `max-h-14 md:max-h-18` (56px mobile / 72px desktop).
2. Leave card dimensions, grid gaps, borders, hover effects, and light theme untouched.

## Verification
- Build/typecheck.
- Preview the homepage Partners section at desktop and mobile widths to confirm logos are clearly larger without touching card edges.
