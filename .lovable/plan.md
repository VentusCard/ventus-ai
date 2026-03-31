

## Plan: Redesign Local Perks as 4-Column Card Matrix

### File: `src/components/demo/DemoRewardsView.tsx`

**1. Redesign `PerkCard` (~lines 305–329)** as a compact vertical card cell:
- Small category icon + title on one line (truncated)
- Partner name below in muted text
- Value badge at bottom (colored pill, same style as deal cards)
- Styling: `rounded-md border border-slate-100 p-1.5`, tight spacing

**2. Update `LocalPerksSection` grid (~line 379)**:
- Replace `<div className="space-y-0.5">` with `<div className="grid grid-cols-4 gap-1">`

**3. Remove collapsible toggle** — keep section always open since the grid is already compact. Replace the `<button>` header with a static header row.

### Result
Local perks rendered as a 4×N card matrix, roughly half the current height.

