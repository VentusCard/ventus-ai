## Plan: Reorder Income card in customer-selection transaction dialog

### Current state
In `src/components/exec-demo/ExecDemoSelectionDialog.tsx`, the collapsible transaction cards inside the dialog are rendered in this order:
1. KYC
2. Income (aggregated inflows across all sources)
3. Source groups (Checking, Cashback Card, Travel Card, Premium Card, Checks, ACH, Wire, Zelle, HSA, then any unknown sources)

### Change
Move the **Income** card so it appears **second-to-last** in the list — i.e., after all source groups except the final one, and immediately before the final source group.

If the source-group list is `S1, S2, …, S(n-1), Sn`, the new order becomes:
1. KYC
2. S1 … S(n-1)
3. Income
4. Sn

### Implementation
- In the JSX around lines 364–431, split `sourceGroups.map(...)` into two passes:
  - Render `sourceGroups.slice(0, -1)` first.
  - Then render the existing Income card block.
  - Then render `sourceGroups.slice(-1)` (the last source group).
- Preserve all existing behavior: expand/collapse state, totals, styling, and the "Collapse all / Expand all" logic.
- Keep KYC as the first card.

### Files to edit
- `src/components/exec-demo/ExecDemoSelectionDialog.tsx`

### Out of scope
- No changes to source-group ordering itself.
- No changes to KYC placement.
- No styling or content changes beyond reordering.