# Split Customer View into two cards

Today the personalization tabs (Personalized Deals / Product / Relationship) render one "Customer View" card containing the search bar, customer chips, signal list, and phone mockup. Split that into two side-by-side cards inside the same full-height workspace.

## Layout

```text
+-----------------------------+  +-------------------------------------+
| Customer Selection          |  | Personalized Rewards                |
| search + customer chips     |  |            [ phone mockup ]         |
| ------------------------    |  |                                     |
| Signals detected — Ricky    |  |                                     |
|  Behavioral / Life Events   |  |                                     |
|  Financial / Demographic    |  | What the customer sees — caption    |
|  Risk  (scrolls)            |  | (?) Why this surface                |
+-----------------------------+  +-------------------------------------+
```

- Left card, ~1/3 width: header "Customer Selection", then the search field and example-customer chips, then the signal list in a scrollable area.
- Right card, ~2/3 width: header named per tab — "Personalized Rewards" on the Deals tab, "Personalized Product" on the Product tab, "Personalized Relationship" on the Relationship tab. Contains the phone mockup filling the card height, plus the caption strip and "Why this surface" popover at the bottom.
- Both cards share the same full-height row so the screen still fits without page scrolling.
- The "Generating" status chip moves into the right card's header (it describes the generated surface).
- Live-session mode (when the current /demo session customer is selected) keeps its explanatory note in the left card in place of the signal list.

## Technical notes

- `CustomerMockupPanel.tsx`: replace the single outer card with a two-column grid of two bordered cards; add a per-surface title map for the right card; move the search/chips into the left card body above the signal list; keep `h-[calc(100vh-230px)]` on the row.
- `ExampleCustomerBar.tsx`: keep the existing `compact` prop but stack the search field above the chips (vertical) so it reads well in the narrow left column.
- `CustomerSignalPanel.tsx`: drop its own outer card border/header chrome so it nests cleanly inside the Customer Selection card, keeping the scrollable signal area.
- No changes to data, generation, or signal logic.
