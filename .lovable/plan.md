# Compact Customer View Layout

Reduce vertical distance to the phone mockup in the three Personalization tabs (Personalized Deals, Product, Relationship) on /bankdemo so the customer surface is visible without excessive scrolling.

## Current state

The Customer View panel stacks four horizontal bands before the phone:

1. Panel header ("Customer View" title + generating badge + "Run the demo" link)
2. `ExampleCustomerBar` (search input + customer chips)
3. Main 3-column grid: signal panel (1/3), phone (h-[680px]) + explanatory copy (2/3)

The copy column sits beside the phone and is mostly empty whitespace. The phone's fixed 680px height plus the stacked headers pushes it well below the fold on typical laptop viewports.

## What changes

1. **Merge the top chrome into one compact row**
   - Combine the panel header and `ExampleCustomerBar` into a single `flex` row.
   - Keep the "Customer View" title + generating badge on the left.
   - Put the search input and customer chips on the same row to the right, wrapping only when needed.
   - Remove the standalone "Run the demo" link; the session chip already covers this case, and the link duplicates the Demo tab navigation.

2. **Flatten the explanatory copy**
   - Move the "What the customer sees" title/body/bullets from a tall side column into a compact horizontal explainer strip directly above the phone.
   - Truncate the body text and show the bullets in a single inline row or hide them behind a "Why this surface" popover to reclaim height.

3. **Reduce phone height and let it respond to viewport**
   - Drop the fixed `h-[680px]` to a viewport-aware height (e.g. `h-[clamp(520px,70vh,640px)]`) so the phone fits on screen without scrolling.
   - Keep the phone centered and ensure the internal scroll container still works.

4. **Tighten the signal panel**
   - Reduce internal padding in `CustomerSignalPanel` from `p-3 space-y-3` to `p-2.5 space-y-2`.
   - Keep evidence collapsed by default; the expanded state remains click-to-reveal.
   - Shrink the "Signals detected" header line height and badge size.

5. **Layout becomes a 2-column workspace**
   - Left column (~30%): compact signal panel.
   - Right column (~70%): explainer strip on top, phone mockup below it.
   - Remove the third copy-only column entirely.

```text
[ Customer View  |  search ..  [Ricky][James][Emily][Michael][Amanda]  generating badge ]
------------------------------------------------------------------------------------------
| LIFE EVENTS  (pill)(pill)    |  [What the customer sees — 3 bullets as inline chips]
| BEHAVIORAL   (pill)(pill)    |  +----------------------------------+
| FINANCIAL    (pill)          |  |                                  |
| DEMOGRAPHIC  (pill)(pill)    |  |         phone mockup             |
| RISK         (pill)            |  |      (shorter, viewport-aware)   |
|                              |  |                                  |
```

## Technical notes

- Edit `src/components/tepilot/insights/CustomerMockupPanel.tsx` to merge the header/customer bar, flatten the copy, and switch to a 2-column grid.
- Edit `src/components/tepilot/insights/personalization/CustomerSignalPanel.tsx` for tighter padding and header sizing.
- `ExampleCustomerBar.tsx` may need a compact variant or its outer wrapper removed so it can sit inline with the panel title.
- No data, generation, or store changes. Strict light theme and Manrope typography are preserved.
