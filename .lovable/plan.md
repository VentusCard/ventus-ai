

## Plan: Fix personalized deals not showing 11

### Problem
`getRelevantDeals()` in `src/lib/dealSelectionUtils.ts` allocates slots as 4 + 3 + 2 (pillar deals) + 2 (discovery) = 11. But if a pillar has fewer deals than its allocation, the function returns fewer than 11, leaving a visual gap in the 2-column grid (odd count = empty cell).

### Fix
In `src/lib/dealSelectionUtils.ts`, after combining `pillarDeals` and `discoveryDeals`, add a backfill step: if the combined count is still under `maxDeals`, pull additional deals from the full library (excluding already-used IDs), sorted by popularity, to fill remaining slots.

### File changed
- `src/lib/dealSelectionUtils.ts` — lines ~161-169: add backfill logic before the final return

### Implementation detail
```ts
// After discoveryDeals are assembled (~line 167):
const combined = [...pillarDeals, ...discoveryDeals];

// Backfill if under maxDeals
if (combined.length < maxDeals) {
  const remaining = AVAILABLE_DEALS
    .filter(d => !usedIds.has(d.id) && !topPillarNames.includes(d.category))
    .sort(sortByPopularity)
    .slice(0, maxDeals - combined.length)
    .map(convertToBankDeal);
  combined.push(...remaining);
}

return combined.slice(0, maxDeals);
```

This guarantees 11 deals are returned (assuming the library has enough), eliminating the grid gap.

