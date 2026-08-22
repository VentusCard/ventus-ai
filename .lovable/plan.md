# Signal family expansion: keep all five cards, open a drawer below

Today, opening a signal family replaces the five-card row with a full-width panel, so the other four families disappear and the layout jumps. Change it so the five cards always stay visible and the detail expands underneath them.

## Behavior

- The five family cards remain in their row at all times.
- Clicking a card opens a detail drawer directly below the row; clicking the same card again closes it.
- Clicking a different card swaps the drawer content in place — no hiding, no relayout of the row.
- The selected card gets a clear active treatment (stronger border/ring plus a rotated chevron) so it reads as the source of the drawer.
- The drawer is roughly double the height of a card (about 2x), scrollable inside if a family has more signals than fit, so the page height stays stable no matter which family is open.
- Life Events stays open by default, as it is now.

```text
[ Life Events ][ Financial ][ Behavior ][ Lifestyle ][ Risk ]
+---------------------------------------------------------+
|  Life Events detail — ~2x card height, signals grid      |
|  (scrolls internally if it overflows)                    |
+---------------------------------------------------------+
```

## Technical notes

- `SignalFamilyBoard.tsx`: always render the 5-card grid; render the panel as a second row below it instead of returning early. Toggle selection off when the active card is clicked again. Add an active-state class on the selected card.
- `SignalFamilyPanel.tsx`: drop the in-panel family switcher buttons (the cards above now do that job), keep the close button, and constrain the body to a fixed ~2x-card height with `overflow-y-auto`. Keep the header, confidence bar, and signal tiles as they are.
- Add a short open/height transition consistent with the existing animation styles.
