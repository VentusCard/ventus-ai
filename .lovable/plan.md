

## Goal
Add two enhancements to the expanded pill grid in the Intelligence Panel (`ExecDemoIntelPanel.tsx`):
1. A column header row above the pillar grid.
2. A per-pillar total spend amount displayed in the left column.

## Where
Inside the expanded grid block (lines ~477–540 in `src/components/exec-demo/ExecDemoIntelPanel.tsx`), which renders one row per pillar with category/subcategory pills.

## Changes

### 1. Add a header row above the pillar grid
Render a sticky-style header inside the scrollable container with three columns matching the existing grid:
- **Pillar** (left, 115px column)
- **Categories & Subcategories** (right column)
- **Total** (right-aligned amount)

Header style: small uppercase tracking-wider slate-500 text, light bottom border.

### 2. Compute pillar totals
For each pillar in `chipsByPillarCategory`, sum `totalSpend` across all chips:
```ts
const pillarTotal = Array.from(categoriesMap.values())
  .flat()
  .reduce((sum, chip) => sum + chip.totalSpend, 0);
```

### 3. Update each pillar row layout
Adjust the row to a 3-zone flex:
- Left (115px): pillar dot + name (existing)
- Middle (flex-1): category + subcategory pills (existing)
- Right (auto, ~70px): pillar total amount, right-aligned, semibold, color-matched (`c.text`), formatted via existing `formatSpend()` helper.

```text
┌─────────────┬────────────────────────────────────────────┬────────┐
│ PILLAR      │ CATEGORY & SUBCATEGORIES                   │ TOTAL  │
├─────────────┼────────────────────────────────────────────┼────────┤
│ ● Pets      │ [Pet Services] Dogsitting $150  Vet $80    │  $230  │
│ ● Travel    │ [Lodging] Marriott $420  [Air] Delta $612  │ $1.0k  │
└─────────────┴────────────────────────────────────────────┴────────┘
```

## Files
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — only file touched.

## Out of scope
- No changes to pill behavior, click handlers, colors, or animations.
- No changes to the rollup/synthesis section above the grid.
- No changes to the Behavioral Intelligence header text.

