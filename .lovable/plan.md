

# Make Pillar Cards Expandable to Show Subcategory Breakdown

## What Changes

In `DemoEngagementView.tsx`, make each pillar spending card in the 2x2 grid clickable/expandable. When tapped, it expands to show subcategory counts derived from the enriched transactions.

## Implementation

**File:** `src/components/demo/DemoEngagementView.tsx`

1. **Add state** to `PhoneMockup`: `const [expandedPillar, setExpandedPillar] = useState<string | null>(null)` — only one pillar expanded at a time.

2. **Compute subcategory data** per pillar from `enrichedTransactions`:
   ```ts
   // Group enriched transactions by pillar → subcategory → count + total
   const subcatMap: Record<string, { subcategory: string; count: number; total: number }[]>
   ```

3. **Make each pillar card clickable** — add `onClick` to toggle `expandedPillar`, add a small chevron icon indicator.

4. **When expanded**, render subcategory rows below the progress bar showing:
   - Subcategory name
   - Transaction count
   - Total spend
   
   Use a smooth height transition with `overflow-hidden`.

5. **When no enriched data**, the cards remain static (no expand behavior).

6. **Layout note**: Switch from `grid-cols-2` to a single-column list when a pillar is expanded, or keep grid but let expanded card span full width via conditional class.

### Simpler approach
Keep the 2-column grid. When a card is clicked, it expands downward within its grid cell showing 2-3 subcategory rows with counts. Add `cursor-pointer` and a tiny `ChevronDown`/`ChevronUp` icon.

