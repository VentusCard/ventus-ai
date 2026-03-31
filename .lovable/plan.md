

## Plan: Redesign Module Toggles as Checkbox Rows

### What changes

**`src/components/demo/DemoCustomerPanel.tsx`** (lines ~68-120)

Replace the current two-row pill layout with a checkbox-based design:

- **Row 1**: `All` pill (keep as blue pill toggle, same as now)
- **Row 2**: Checkbox (always checked, disabled) + label: `"Ventus AI Customer Intelligence and Analytics"`
- **Row 3**: Checkbox + label: `"AI & UX"`
- **Row 4**: Checkbox + label: `"Rewards"`
- **Row 5**: Checkbox + label: `"Relationship"`

Each checkbox row is a compact `flex items-center gap-2` with `text-[11px]`. Import `Checkbox` from `@/components/ui/checkbox`. Analytics checkbox is always checked and disabled. The other three toggle their module in `enabledModules`.

### Technical details

- Import `Checkbox` from `@/components/ui/checkbox`
- Remove the old Analytics pill button and Row 2 pill buttons
- Keep `All` pill as-is on its own row
- Below it, render 4 checkbox rows in a `space-y-1.5` container:
  - Analytics: `<Checkbox checked disabled />` + `"Ventus AI Customer Intelligence and Analytics"`
  - AI & UX: `<Checkbox checked={enabledModules.has("AI & UX")} onCheckedChange={() => toggleModule("AI & UX")} />`
  - Rewards: same pattern
  - Relationship: same pattern
- Labels use `text-[11px] text-slate-600`, truncated with `truncate` to prevent spill

