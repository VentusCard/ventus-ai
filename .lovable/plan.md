

## Changes to `src/components/demo/DemoRewardsView.tsx`

### 1. Remove "✨ For You" badge
Delete the badge block (lines 543-547).

### 2. Sort personalized deals first
In the `filteredDeals` memo, after building the result array, sort it so deals whose ID exists in the personalized set appear first. When a category filter is active (pulling from full library), personalized deals within that category will float to the top. When no filter is active, the default `gridDeals` already are personalized — no change needed there.

The subtle left-border accent (`isForYou ? border-l-2 with color`) stays as the visual differentiator.

### Technical detail
- Build `const personalizedIds = new Set(deals.map(d => d.id))` (already effectively exists via `deals.some(...)`)
- In `filteredDeals` memo, after filtering by category, add: `result.sort((a, b) => (personalizedIds.has(b.id) ? 1 : 0) - (personalizedIds.has(a.id) ? 1 : 0))`
- Remove the `{isForYou && <span>...✨ For You...</span>}` JSX block

