

## Plan: Add Subcategory Pills from Enrichment to Category Filter

### File: `src/components/demo/DemoRewardsView.tsx`

**1. Extend `CategoryFilterPills` to accept enriched transactions and display subcategory pills**

- Add an `enriched` prop (`EnrichedTransaction[]`) to `CategoryFilterPills`
- Extract unique subcategories from the enriched transactions (e.g. "Fine Dining", "Boutique Hotel", "Activewear", "Streaming")
- Render them as additional smaller pills after the existing pillar-level category pills, separated by a subtle divider or just visually distinguished with a different style (outline instead of filled when inactive, slightly smaller text)

**2. Add more pillar pills to `DEAL_CATEGORY_PILLS`**

- Add missing pillars: `Pets` (🐾), `Family & Community` (👨‍👩‍👧)

**3. Subcategory pill styling**

- Same row, scrollable — subcategory pills appear after the pillar pills with a thin `|` separator
- Slightly different style: use a dot prefix or lighter background to distinguish them from top-level categories
- When a subcategory pill is active, filter deals whose `subcategory` matches AND filter local perks by text match

**4. Wire enriched data through**

- `RewardsPhoneMockup` already receives `enriched` transactions via parent — pass them down to `CategoryFilterPills`
- Add a `subcategoryFilter` state alongside existing `categoryFilter`
- Apply subcategory filtering in the `filteredDeals` memo

### Result
The filter pill bar will show both pillar-level categories (Dining, Travel, etc.) and enrichment-derived subcategory pills (Fine Dining, Boutique Hotel, Streaming, etc.), making the rewards view feel more data-rich and connected to the enrichment output.

