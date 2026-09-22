# Redesign the spacing of the Deckmo opener

## Audit finding
At 1540×855, the usable stage runs from the 80px header to the 56px footer, but the first line begins at roughly 259px. The unrevealed comparison still occupies space inside a fixed 360px composition, so the opening beat reads top-heavy with excessive empty space below.

## Redesign
- Give the opener three intentional spacing states:
  1. Center “Banking is personal.” vertically in the usable stage.
  2. Keep the two-line thesis centered as one balanced statement.
  3. When the comparison begins, transition the thesis upward and let Today / With Ventus fill the lower stage.
- Keep one consistent left alignment and content width across all states so movement feels controlled rather than jumpy.
- Tighten the spacing between the two thesis lines while creating a clearer break before the comparison.
- Rebalance the equation rows: labels sit closer to their statements, equal signs have consistent gutters, and Today / With Ventus have equal vertical rhythm.
- Preserve all current copy, reveal order, colors, navigation, header, and footer.
- Respect reduced-motion settings by switching states without animated movement.

## Verification
- Review every opener beat at 1024×768, 1540×855, and 1920×1080.
- Confirm the first two beats are visually centered, the completed comparison fits without clipping, and no text or logo overlaps the presentation chrome.
- Confirm arrow navigation and slide numbering remain unchanged.
