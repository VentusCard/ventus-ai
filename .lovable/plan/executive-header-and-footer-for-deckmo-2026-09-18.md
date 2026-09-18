# Executive header and footer for `/deckmo`

## Goal
Replace the small floating navigation pill with a persistent, presentation-grade header and footer based on the selected **Executive boardroom layout**.

## Changes
- Add a slim full-width header with Ventus AI branding, presentation context, and a restrained confidential marker.
- Add a fixed full-width footer with:
  - previous and next controls
  - current slide and total slide count
  - current chapter name
  - a subtle linear progress indicator
  - an explicit presenter navigator control
- Keep keyboard arrows, click-to-advance, scrolling, and the existing presenter navigator behavior intact.
- Reserve space inside every slide for the persistent chrome so slide content and the reused `/bankdemo` screens remain unobstructed.
- Restyle the presenter navigator to match the same executive-report language.

## Visual system
- Palette: white, soft cool gray, institutional navy `#0F2747`, and blue `#2563EB`.
- Typography: Instrument Serif for presentation-level labels where appropriate; Work Sans for navigation and metadata.
- Structure: crisp full-width bands, fine rules, square or minimally rounded controls, generous spacing, and no floating pill.
- Motion: restrained 150–250ms state and progress transitions with reduced-motion support.
- Implement all visual values through semantic global tokens and Tailwind theme roles rather than hardcoded component colors.

## Scope safeguards
- Do not change slide copy, narrative order, datasets, phone mockups, or bank workspace screens.
- Keep the deck strict light theme and desktop-only.
- Preserve the existing password gate and static, network-free presentation behavior.

## Verification
- Check the opening, phone, and bank-tools slides at the presentation viewport.
- Verify the header/footer never overlap slide content.
- Verify buttons, arrow keys, click-to-advance, scrolling, progress, and presenter navigation.
- Confirm no runtime errors, external content requests, or build/type errors.
