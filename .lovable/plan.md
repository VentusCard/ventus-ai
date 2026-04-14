

## Plan: Make category pills clickable to filter transactions

### What changes

Category pills (e.g. "Concerts & Events") become clickable. Clicking one filters the left panel to show all transactions matching that category within the pillar — same behavior as subcategory text clicks but at the category level.

### Implementation

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`** (~lines 334-343):
- Add `onClick` handler to the category `<span>` pill that calls `onPillClick?.(pillar, category)` with a distinguishing prefix or use the existing mechanism
- Actually, the existing `activePillFilter` uses `{ pillar, label }`. We can reuse this — when a category pill is clicked, set `label` to the category name. The filtering in `ExecDemoPage.tsx` matches `s.label === activePillFilter.label`. But category names live in `s.category`, not `s.label`.
- **Better approach**: Add `category` as an optional field to `activePillFilter`. Modify `onPillClick` to accept an optional 3rd param or use a separate callback.
- **Simplest approach**: Extend `onPillClick` signature to `(pillar: string, label: string, isCategory?: boolean)`. In ExecDemoPage, when `isCategory` is true, filter by `s.category === label` instead of `s.label === label`.

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**:
- Add `cursor-pointer hover:brightness-95` to category pill styling
- Call `onPillClick?.(pillar, category, true)` on click
- Highlight active category pill (check if `activePillFilter` matches)
- Update `onPillClick` prop type to include the optional boolean

**`src/pages/ExecDemoPage.tsx`** (~lines 585-636):
- Update `handlePillClick` to accept `isCategory?: boolean` and store it in state
- Update `activePillFilter` type to `{ pillar: string; label: string; isCategory?: boolean }`
- Update `filteredIndices` memo: when `isCategory` is true, filter `s.category === label` instead of `s.label === label`

### Files modified
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- `src/pages/ExecDemoPage.tsx`

