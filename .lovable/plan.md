

## Fix mismatched product actions on Next-Product cards

### Problem
Product cards are sorted (life event first, behavioral last) on line 169-173 before rendering. But the action lookup on line 311 uses the loop index `i` (post-sort position) to match against `productActions[].card_index` (which references the original pre-sort order). This swaps the actions between cards.

### Fix

**`src/components/exec-demo/NextProductRationale.tsx`** — one change:

On the sorted `.map()` (line 169-173), track the original index of each card and use that for the `productActions` lookup instead of `i`.

Replace the sort+map with:
```tsx
{[...productCards].map((card, origIdx) => ({ card, origIdx }))
  .sort((a, b) => {
    if (a.card.type === "behavioral" && b.card.type !== "behavioral") return 1;
    if (a.card.type !== "behavioral" && b.card.type === "behavioral") return -1;
    return 0;
  })
  .map(({ card, origIdx }, i) => {
    // ... existing rendering code ...
    // Line 311: use origIdx instead of i
    const dynamicActions = productActions?.find(ca => ca.card_index === origIdx)?.actions;
```

Single file, ~4 lines changed.

