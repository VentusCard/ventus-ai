

# Add Editable Budgets in Expanded Pillar View

## Overview
When budgeting mode is on and a pillar is expanded, allow the user to edit the overall pillar budget and individual subcategory budgets via inline input fields. Budget status badges will update live as values change.

## What Changes

### 1. Editable Budget State
- Convert `budgets` from a `useMemo`-derived value to a `useState` with lazy initialization (seeded random values as before)
- Add a separate `subcategoryBudgets` state: `Record<string, number>` keyed by `"pillar::subcategory"`
- Initialize subcategory budgets on-demand when a pillar is expanded (random multiplier of subcategory spend, similar to pillar budgets)

### 2. Pillar Budget Editing (Expanded Header)
- When `budgetMode` is on and a pillar is expanded, show an editable input field next to the pillar title in the expanded card header
- Display: "Budget: $[input]" with a small number input
- On change, update the `budgets` state for that pillar
- The pillar card badge color/icon updates reactively

### 3. Subcategory Budget Editing (Expanded Subcategory Cards)
- When `budgetMode` is on, each subcategory card in the expanded view gets:
  - A "Budget: $[input]" row below the spend amount
  - A small colored status indicator (same green/amber/red logic)
  - The progress bar repurposed to show spend vs budget instead of percentage of pillar

### 4. No Changes Outside PillarExplorer
- All edits are local state within `PillarExplorer` -- no props or parent changes needed

## Technical Details

**File**: `src/components/tepilot/insights/PillarExplorer.tsx`

**State changes**:
- Replace `useMemo` budgets with `useState` initialized via a function that runs the same hash-based random logic
- Add `const [subcategoryBudgets, setSubcategoryBudgets] = useState<Record<string, number>>({})` 
- Helper to get/initialize a subcategory budget: checks state, if missing generates from hash and sets it

**Expanded header** (line ~131-137):
- Add inline `<Input type="number" />` showing pillar budget when `budgetMode` is true
- `onChange` updates `setBudgets(prev => ({...prev, [pillar]: newValue}))`

**Subcategory cards** (line ~154-183):
- When `budgetMode`, add budget input + status badge below spend
- Reuse `getBudgetStatus()` for subcategory spend vs subcategory budget
- Progress bar width becomes `Math.min(100, (spend/budget)*100)%` with color from status

**New import**: `Input` from `@/components/ui/input`
