# Equal-width panels on slide 2.2

- Change slide 2.2 to a 50/50 split, with the divider centered.
- Keep the profile line, rolling transactions, outside events, and matched animation speeds unchanged.
- Preserve slide 2.1 and its transition into 2.2.

## Technical details
- In `src/components/deckmo/DeckmoDeck.tsx`, change only the Visibility scene’s revealed grid from `1.08fr / 0.92fr` to two equal `minmax(0,1fr)` columns.

## Verification
- Measure both panel widths in the live preview at 1375×1011, 1024×768, and 1691×1011; allow only the divider’s one-pixel difference.
- Confirm arrow navigation, rolling animations, and slide 2.1 remain unchanged, with no overflow or runtime errors.
