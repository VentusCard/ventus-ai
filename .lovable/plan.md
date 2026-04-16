

## Rank Life Event Deals Second in Next-Offer Tab

### What changes
Ensure life-event-based deal groups always appear after behavioral cluster groups in the Next-Offer tab, regardless of the order returned by the AI.

### Fix — `src/components/exec-demo/NextOfferRationale.tsx`

Sort the `generatedOffers` array before rendering: groups where `pillar === "Life Event"` come after all other groups. The sort is stable so the relative order within each category is preserved.

**Around line 160** (the `.map` that renders `RollupCard`), wrap `generatedOffers` with a sort:

```tsx
{[...generatedOffers]
  .sort((a, b) => {
    const aLife = a.pillar === "Life Event" ? 1 : 0;
    const bLife = b.pillar === "Life Event" ? 1 : 0;
    return aLife - bLife;
  })
  .map((group, gi) => (
    <RollupCard key={`${group.pillar}::${group.rollup}`} group={group} index={gi} />
  ))}
```

One line change. No other files affected.

