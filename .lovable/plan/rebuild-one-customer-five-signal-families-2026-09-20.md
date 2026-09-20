# Rebuild “One Customer, Five Signal Families”

## Goal
Recompose the Ricky beat to mirror the clear left-to-right structure of `/demo`: Ricky’s transactions remain visible on the left while everything learned about Ricky builds on the right.

## Layout
- Keep the existing deck header, footer, title, subtitle, light theme, and presentation sizing.
- Replace the current three-column card-and-arrow composition with a wider two-column workspace.
- Use the left column as a compact transaction feed for Ricky, following the visual hierarchy of `/demo`.
- Use the larger right column for Ricky’s identity, living profile, and all five signal families.
- Keep both columns visible together so the audience can connect transaction evidence to customer understanding.

## Reveal behavior
- First beat: show Ricky’s transaction feed on the left and his basic identity/profile area on the right.
- Second beat: reveal the synthesized signal families within Ricky’s right-side profile while leaving the transactions in place.
- Use restrained staggered motion for the signal groups; respect reduced-motion settings.

## Content treatment
- Preserve the existing Ricky transaction strings, signal labels, profile title, and profile summary.
- Organize the right side by the five named families rather than replacing the transaction panel with signals.
- Present Risk as bank-facing intelligence and keep the existing professional color system.

## Technical details
- Update only the `Ricky` scene and its small supporting presentation elements in `DeckmoDeck.tsx`.
- Keep the centralized Ricky copy in `deckmoScript.ts` unless a minor label adjustment is required for the new structure.
- Reuse the deck’s existing semantic colors, typography, spacing, and reveal utilities.

## Verification
- Confirm transactions remain on the left through both beats.
- Confirm Ricky’s profile and signal families all appear on the right without clipping.
- Check both reveal steps, navigation, and presentation layouts at 1024×768, 1540×855, and 1920×1080.
- Confirm no text spill, page overflow, runtime errors, or build errors.

## Scope
Only the “One Customer, Five Signal Families” Ricky beat changes. Other `/deckmo` beats and `/demo` remain unchanged.
