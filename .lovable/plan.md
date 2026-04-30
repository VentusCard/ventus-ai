## Goal
Show all 3 generated products in the Next-Product section, not just 2.

## Context
The `generate-product-cards` edge function returns up to 3 cards (1 life-event + 1 behavioral + optional 1 risk). The Next-Product UI currently caps display at 2.

## Changes

**`src/components/exec-demo/NextProductRationale.tsx`**

1. In the `productCards && productCards.length > 0` branch (line ~724):
   - Update the picker to select up to 3 cards: first life-event, first behavioral, then any remaining (e.g. risk) until 3.
   - Update the layout from a 2-column flex with single divider to a 3-column flex with dividers between each filled column.
   - Update the labels: keep "Life Event" / "Shopping Habit"; add "Account Care" (or similar) for the 3rd slot when it's a risk-themed card. Detect via `pickedCards[2]` being neither the life-event nor behavioral first picks — label it based on its theme/origin (use "Account Care" for risk-themed, otherwise "Additional Offer").

2. Adjust the columns container around line 792:
   ```tsx
   <div className="flex items-stretch gap-3">
     {pickedCards.map((c, i) => (
       <Fragment key={i}>
         {i > 0 && <div className="w-px bg-slate-200 self-stretch shrink-0" />}
         {renderColumn(c, i)}
       </Fragment>
     ))}
   </div>
   ```

3. Tighten `renderColumn` slightly (gap `gap-3` → `gap-2` already set, reduce horizontal padding inside `ProductCardBody` from `px-4` to `px-3`) so 3 columns fit comfortably in the available width without text getting cramped.

## Notes
- Keep light theme + existing color/border styling.
- No changes to the edge function or other tabs (Next-Conversation / Next-Offer remain unchanged).
