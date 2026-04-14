

## Make behavioral product card match rollup card style and be clickable

### Problem
The behavioral product card (below the trigger pill) doesn't match the rollup card format from the Next-Purchase tab — it should be clickable to highlight transactions, and visually match with the colored top border, pill header, and consistent layout.

### Change: `src/components/exec-demo/NextProductRationale.tsx`

Restructure the product card (lines 238-279) for behavioral cards to match the `RollupCard` format:

1. **Make the entire card clickable** — wrap with `onClick={handlePillClick}` and add `cursor-pointer` when clickable
2. **Match the visual structure**:
   - Top colored border (`borderTopWidth: 3, borderTopColor: c.dot`) instead of left border
   - Header row with the rollup-style pill (`✦ signal_label`) + "Behavioral" badge, same as the Next-Purchase rollup header
   - Active state: thicker border + glow shadow, same as trigger pills
3. **Merge pill into the card** — remove the separate trigger pill above the card for behavioral cards; instead put the pill inside the card header (like rollup cards have `✦ Weekend Foodie` inside)
4. **Keep the product name, quote, and stats** inside the card body below the header

The life event card keeps its current separate pill + card layout (since it already works well). Only the behavioral card changes.

### Visual result
```text
┌─── blue top border ────────────────────┐
│ ✦ Dining Pattern  3 txns · $450  BEHAVIORAL │
│                                        │
│ ✦ Premium Dining Card                  │
│ "Based on your recent preferences..."  │
│ 💳 Spending Pattern                    │
└────────────────────────────────────────┘
```

Clicking the card highlights matching transactions in the left panel (same `onTriggerPillClick` logic already implemented).

