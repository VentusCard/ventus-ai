## Problem

In `/bankdemo` → Demo → Rewards phone, typing "coffee machine" shows the AI reasoning chip ("...return deals from Starbucks, Dunkin', Williams-Sonoma, Dyson, Best Buy, Amazon, Target...") but no deal cards appear.

Root cause is in `src/components/demo/DemoRewardsView.tsx` (lines 463-468). The `semantic-deal-search` edge function correctly returns ~24 matching deal IDs, but the default (no category selected) filter intersects them against `gridDeals` — only the ~10 deals personalized for the current customer. The semantic matches almost never overlap that small set, so the grid renders empty.

The category-filter branch already handles this correctly: it searches the full `AVAILABLE_DEALS` catalog and sorts personalized deals to the top. The default branch needs the same treatment.

## Fix

Single-file edit to `src/components/demo/DemoRewardsView.tsx`:

1. **Default `filteredDeals` branch:** when a search is active, source from the full catalog (`AVAILABLE_DEALS.map(convertToBankDeal)`), filter by `matchingDealIds`, then sort personalized deals first. When no search is active, keep current `gridDeals` behavior.

2. **Hero + Expiring Soon row (lines 528-545):** hide both while a search is active so results own the grid and there is no duplicate card at the top. Restores automatically when the search clears.

No changes to the edge function, `useSemanticDealSearch`, perks filter, or category-pill behavior.

## Verification

- "coffee machine" → Starbucks, Dunkin', Williams-Sonoma, Dyson, Home Depot, Target, Amazon, Best Buy, etc.
- "ski trip", "birthday gift", "healthy food" → broad relevant matches.
- Clear search → hero + personalized grid return.
- Category pill still narrows to the selected pillar and re-applies semantic search within it.
