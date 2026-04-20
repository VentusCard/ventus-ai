

## Understanding
The Next-Product tab currently generates **4 product cards**. The user wants **only 2** displayed, side-by-side with a vertical divider (the layout I already built handles 2 side-by-side, but the upstream is producing 4 and possibly the layout isn't being seen because it's in a different view).

Let me look at where 4 products come from. Based on the memory note `mem://technical/edge-functions/product-card-generation`: "produces exactly two consumer-facing cards" — so the edge function returns 2. But the user says 4 are showing.

Likely culprit: there are **two different views** for product cards:
1. `ProductCardsPhoneView.tsx` (phone, already updated to 2 side-by-side)
2. `NextProductRationale.tsx` (the right-panel intelligence view on the Next-Product tab) — this likely shows 4 product cards in a grid

The user is talking about the **tab** (intelligence panel), not the phone. They want the panel itself to show just 2 cards side-by-side with a vertical divider.

## Plan

### File: `src/components/exec-demo/NextProductRationale.tsx`
- Slice the products array to the first 2 items
- Replace the current grid/list layout with a 2-column flex layout
- Add a vertical divider (`w-px bg-slate-200`) between the two cards
- Keep existing card styling (theme color, benefits, value, CTA) but ensure each card fills its half

### Layout structure
```text
┌─────────────────────────────────────────┐
│  Next Product Recommendations           │
├──────────────────┬──────────────────────┤
│                  │                      │
│   Card 1         │    Card 2            │
│   (behavioral)   │    (life event)      │
│                  │                      │
└──────────────────┴──────────────────────┘
```

### Out of scope
- No edge-function change (it already returns appropriate data; we just slice to 2)
- No phone mockup change (already 2 side-by-side)
- No changes to other tabs

