

## Revamp Personalized UX Overlay in /demo

### Problem
1. The phone mockups in `DemoEngagementView` don't use available space well — progress bars are cluttered
2. Travel pillar needs a "Trip View" toggle (like the homepage Customer Experience tab) showing trip-grouped subcategories instead of raw budget bars

### Changes — `src/components/demo/DemoEngagementView.tsx`

#### 1. Replace progress bars with cleaner spending display
- Remove budget-based progress bars from the 2×2 grid
- Show spend amount prominently with a subtle percentage indicator instead
- Use the freed vertical space for richer subcategory detail

#### 2. Add Trip View toggle for Travel pillar
- When Travel pillar is present, show a "Trip View" toggle (matching the homepage pattern: small toggle switch + label)
- Default Trip View to "On" — subcategories display as trip labels (e.g., "Trip to New York · $520") rather than raw categories
- Pull trip data from `customer.trips` when available, falling back to enriched subcategories
- Trip rows show destination name + spend amount

#### 3. Use space more effectively
- Expand max width of phone mockups from `max-w-[340px]` to `max-w-[380px]`
- Remove the budget denominator text (`$620 / $700`) — just show the spend
- Make expanded subcategory rows slightly larger for readability
- Reduce vertical spacing on achievement/tip cards to give lifestyle grid more room

### Files modified
- `src/components/demo/DemoEngagementView.tsx`

