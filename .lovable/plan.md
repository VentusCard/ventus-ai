

# Budget Comparison Mode for Total Spend Card

## Overview
When budgeting mode is on, the "Total Spend" card in OverviewMetrics transforms into a budget comparison card. Clicking it opens an expandable panel where users can edit per-pillar budgets. The budget state is shared with PillarExplorer so numbers stay consistent everywhere.

## Key Design Decision: Lift Budget State Up
Currently, budget data lives inside `PillarExplorer`. To share it with `OverviewMetrics`, the budget state (pillar budgets, subcategory budgets, and helper functions) needs to move up to `TePilot.tsx` and be passed down as props to both components.

## Changes

### 1. `src/pages/TePilot.tsx` -- Lift budget state up
- Move `budgets`, `setBudgets`, `subcategoryBudgets`, `setSubcategoryBudgets` state from PillarExplorer up to TePilot
- Move `hashString` and `getBudgetStatus` helper functions to a shared location (or keep in PillarExplorer and also import in OverviewMetrics)
- Pass budget state + setters as props to both `OverviewMetrics` and `PillarExplorer`

### 2. `src/components/tepilot/insights/PillarExplorer.tsx` -- Accept budget props
- Remove internal budget state, accept it via props instead:
  - `budgets`, `setBudgets`, `subcategoryBudgets`, `setSubcategoryBudgets`
- Keep `getSubcategoryBudget` helper internally (it uses the passed-in state)
- Export `hashString` and `getBudgetStatus` so they can be reused

### 3. `src/components/tepilot/insights/OverviewMetrics.tsx` -- Budget-aware Total Spend card
- Accept new props: `budgetMode`, `budgets`, `setBudgets`
- When `budgetMode` is off: no changes, card looks exactly the same
- When `budgetMode` is on:
  - "Total Spend" card changes title to "Total Spend vs Budget"
  - Shows total spend vs total budget (sum of all pillar budgets)
  - Subtitle shows status: over/under/near with colored text
  - Card becomes clickable -- toggles an expanded panel below the metrics grid
- Expanded panel (shown below the 4-card grid when clicked):
  - Lists each pillar with its current spend, an editable budget input, and a colored status badge
  - Uses the same `getBudgetStatus` logic for consistency
  - Editing a budget here updates the shared state, which immediately reflects in PillarExplorer cards

## Data Flow

```text
TePilot.tsx
  |-- budgets state (Record<string, number>)
  |-- subcategoryBudgets state (Record<string, number>)
  |
  |-- OverviewMetrics (budgetMode, budgets, setBudgets)
  |     |-- Total Spend card shows spend vs budget
  |     |-- Click expands per-pillar budget editor
  |
  |-- PillarExplorer (budgetMode, budgets, setBudgets, subcategoryBudgets, setSubcategoryBudgets)
        |-- Pillar cards show badges + editable budgets
        |-- Subcategory cards show badges + editable budgets
```

## Files Modified

| File | Change |
|---|---|
| `src/pages/TePilot.tsx` | Lift budget state up, initialize from transaction data, pass as props to both components |
| `src/components/tepilot/insights/PillarExplorer.tsx` | Export `hashString` and `getBudgetStatus`, accept budget state via props instead of internal state |
| `src/components/tepilot/insights/OverviewMetrics.tsx` | Accept budget props, transform Total Spend card in budget mode, add expandable per-pillar budget editor panel |

## Technical Details

**Budget initialization** in TePilot.tsx:
- Compute `aggregateByPillar(displayTransactions)` to get pillar list
- Use same `hashString`-based seeding to generate initial budgets
- Lazy `useState` initializer to keep it stable

**OverviewMetrics expanded panel**:
- Local `showBudgetEditor` boolean state for expand/collapse
- Panel renders below the 4-card grid as a `Card` with a list of pillars
- Each row: pillar name, color dot, spend amount, `Input` for budget, status badge
- Same green/amber/red logic from `getBudgetStatus`

**Consistency guarantee**:
- Single source of truth for budgets in TePilot.tsx
- Both OverviewMetrics and PillarExplorer read/write the same state
- Editing in either location updates everywhere immediately
