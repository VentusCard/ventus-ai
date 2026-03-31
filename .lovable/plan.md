

## Plan: Fix Subcategory Pills Styling + Filter from Full Deal Library

### Problem
1. Subcategory pills use a different style (smaller text `text-[8px]`, `border`, dot prefix `· {sub}`) vs pillar pills (`text-[9px]`, no border, no prefix) — they should match.
2. When a subcategory pill is selected, filtering only searches within the already-narrowed `gridDeals` (deals selected for this customer). It should search the **entire** `AVAILABLE_DEALS` library.

### File: `src/components/demo/DemoRewardsView.tsx`

**1. Match subcategory pill styling to pillar pills**
- Change subcategory pills from `text-[8px] border px-1.5 py-0.5` with `· ` prefix → same `text-[9px] font-medium px-2 py-1 rounded-full` as pillar pills, no dot prefix, no border distinction.
- Keep the `|` separator between pillar and subcategory groups for visual grouping.

**2. Filter from entire deal library when subcategory is active**
- Import `availableDeals` from `@/lib/availableDealsData` and `convertToBankDeal` from `@/lib/dealSelectionUtils`.
- In the `filteredDeals` memo: when `subcategoryFilter` is set, search the full `availableDeals` array (converting matches to `BankDeal`) instead of only filtering `gridDeals`.
- Match by `deal.subcategory === subcategoryFilter` (exact match on the deal's subcategory field).
- When `categoryFilter` is set, also search the full library for that category (so pillar pills also show all available deals, not just the pre-selected ones).

