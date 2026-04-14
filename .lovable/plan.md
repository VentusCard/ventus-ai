

## Sort product cards: life event cards above behavioral cards

### Change: `src/components/exec-demo/NextProductRationale.tsx`

In the section where `productCards.map((card, i) => ...)` renders cards (line ~130), sort the cards before mapping so that life event cards (`card.type !== "behavioral"`) appear first and behavioral cards appear after.

Replace the direct `.map()` with a sorted copy:

```typescript
const sortedCards = [...productCards].sort((a, b) => {
  if (a.type === "behavioral" && b.type !== "behavioral") return 1;
  if (a.type !== "behavioral" && b.type === "behavioral") return -1;
  return 0;
});
```

Then map over `sortedCards` instead of `productCards`. No other files change.

