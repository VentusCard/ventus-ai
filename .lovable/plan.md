## Goal

Card max-height 65vh, and the 3 pill rows (lifestyle / life events / risk) sized larger so they breathe into the new vertical space instead of clustering at the top.

## Changes (single file: `src/components/exec-demo/ExecDemoIntelPanel.tsx`)

1. **Card max-height** (line 445)
   - `45vh` → `65vh`

2. **Pill sizing — collapsed state grows to match expanded** (3 pill renderers + `PillarRollupChip`)
   - Lifestyle rollup pill (`PillarRollupChip`, line 1161)
   - Life-event pill (line 629)
   - Risk pill (line 764)
   - Empty-state risk pill (line 800)

   For each, when `isCollapsed`:
   - `text-[11px]` → `text-[12.5px]`
   - `py-1` → `py-2`
   - `px-3` → `px-3.5`
   - `gap-1.5` → `gap-2`
   - Inner count span: `text-[11px]` → `text-[11.5px]`

   When not collapsed: leave as-is (already `py-1.5`).

3. **Row gap between pills** — wherever the 3 rows render (search container `flex flex-wrap gap-*`), bump row/column gap one notch (e.g. `gap-2` → `gap-2.5`) so the taller pills don't crowd each other. (I'll confirm the exact wrapper line during implementation.)

No wording, ordering, color, click-handler, or other-tab changes.

## Risk
Minor — purely visual sizing tweaks scoped to the collapsed-pills state on the Next-Offer / analytics tabs.