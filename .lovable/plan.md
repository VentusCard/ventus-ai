## Goal

Permanently remove the "initial pill compilations" — the legacy Pillar / Category / Subcategory chip grid (the table-like rows of colored category pills with subcategory dots and dollar amounts) from the intelligence panel.

## What stays (rolled-up pills functionality — fully preserved)

- **Spending Habits rollup pills** (`PillarRollupChip` from `rollupStats`)
- **Life Event Detection pills** (amber pills from `detectedLifeEvents`)
- **Risk Factors pills** (gambling, financial vulnerability, etc.)
- Collapse/expand chevron behavior for the rollup pill cluster
- All click handlers driving Next-Offer / Next-Product / Next-Conversation tabs
- Auto-selection of first rollup when entering a tab
- Header text variations per active tab

## What gets removed

The legacy pill grid renderer in `ExecDemoIntelPanel.tsx` — the `else` branch (~lines 776–852) that maps over `chipsByPillarCategory` and renders the "Pillar / (Category) Subcategory, Amount / Total" rows.

## Changes

### `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Remove the legacy pill grid `else` branch** entirely.

2. **Simplify the conditional inside the expanded section** to two states only:
   - `enrichedTransactions` available → `ExecDemoEnrichmentTable`
   - Otherwise → loading skeleton

3. **Remove the now-unused `chipsByPillarCategory` `useMemo`**. Keep `chips` / `deriveChips` since `chips.length > 0` still gates the section header.

4. **Behavior after synthesis + re-expand**: clicking the chevron to expand shows the enrichment table (or skeleton if data isn't ready). The legacy pill compilation never appears again.

## Files touched

- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

No other files need changes. `ExecDemoEnrichmentTable` and all synthesis/rollup pill logic remain intact.
