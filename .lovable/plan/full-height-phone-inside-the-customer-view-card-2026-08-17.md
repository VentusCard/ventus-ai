# Full-height phone inside the Customer View card

Rework the Customer View shared by Personalized Deals, Product, and Relationship on /bankdemo so the phone mockup occupies the full height of the card instead of sitting below stacked chrome and beside a mostly empty copy column.

## Current state

The card stacks three horizontal bands before the phone: a panel header, the example-customer search/chips bar, then a 3-column grid where the phone has a fixed `h-[680px]` and shares its two columns with a tall "What the customer sees" copy block. The result pushes the phone far down the page and wastes the right-hand column.

## What changes

1. **The card becomes a fixed-height workspace**
   The Customer View card sizes itself to the remaining viewport height (roughly `calc(100vh - header/sub-tab chrome)`) rather than growing with its content. Nothing inside the card pushes the page taller; the page itself stops scrolling for this surface.

2. **One compact chrome row**
   The card header and the example-customer bar merge into a single row: "Customer View" title on the left, search input and the customer chips inline to the right, generating badge at the far right. The standalone "Run the demo" link is removed.

3. **Two columns, both full height**
   - Left (~1/3): the signal panel, scrolling internally if the signal set is tall.
   - Right (~2/3): the phone mockup, vertically centered and stretched to the full available height of the card.
   The phone loses its fixed 680px height and instead fills its container, so on a tall screen it renders larger and on a laptop it shrinks to fit — never clipped, never overflowing.

4. **The explainer copy moves off the main axis**
   "What the customer sees" no longer occupies a column. It becomes a compact caption strip directly beneath the phone (title + one line), with the three bullets available via a small "Why this surface" popover. The failure notice keeps the same placement.

```text
+--------------------------------------------------------------------------+
| Customer View   [ search ... ] [Ricky][James][Emily][Michael][Amanda]     |
+---------------------------+----------------------------------------------+
| LIFE EVENTS  (pill)(pill) |                                              |
| BEHAVIORAL   (pill)(pill) |               [ phone mockup ]               |
| FINANCIAL    (pill)       |             full card height                 |
| DEMOGRAPHIC  (pill)       |                                              |
| RISK         (pill)       |   What the customer sees — one line  (?)     |
+---------------------------+----------------------------------------------+
```

## Technical notes

- `CustomerMockupPanel.tsx`: card wrapper becomes `flex flex-col h-[calc(100vh-Xpx)] min-h-[560px]`; the grid body becomes `flex-1 min-h-0` with a 2-column split (`lg:grid-cols-3`, signals 1 col, phone 2 cols). The phone wrapper switches from `h-[680px]` to `flex-1 min-h-0`, centered with a max width so it doesn't stretch horizontally.
- `ExampleCustomerBar.tsx`: gains a compact inline mode (no own border/padding band) so it renders inside the header row.
- `CustomerSignalPanel.tsx`: outer container becomes `h-full flex flex-col` with the pill body in an `overflow-y-auto min-h-0` region; padding tightened slightly.
- `ExecDemoPhoneView` already renders inside a flex column parent, so it inherits the new height; verify its internal scroll container still behaves at both short and tall viewports.
- The three parent views (`PersonalizedDealsView`, `PersonalizedProductView`, `PersonalizedRelationshipView`) keep their `TabHeader` + `SubTabBar`; only the Customer View branch is affected.
- No data, generation, or store changes. Strict light theme, Manrope typography, slate-200 borders preserved.
