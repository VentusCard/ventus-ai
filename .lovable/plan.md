## Expandable pillar rows in iPad Budget tab

Make each of the 4 pillar cards in `BudgetPhoneView` clickable to reveal the top 5 spending categories inside that pillar.

### Behavior
- Click a pillar row → toggles open a list of its top 5 categories.
- Chevron (right when collapsed, down when expanded) on the right side of the pillar header.
- Only one pillar open at a time (cleaner in the iPad's small viewport); clicking another closes the previous.
- Categories sorted by spend descending, capped at 5. Each row shows: category name, spend amount, mini progress bar relative to the pillar total (same pillar color, lighter shade).

### Data
- Group `enrichedTxs` filtered by pillar using the `category` field on `EnrichedTransaction` (already present in `execDemoData.ts`).
- Round to whole dollars, no transaction counts (per "vaguely specific" tone rule).

### Files touched
- Edit only: `src/components/exec-demo/BudgetPhoneView.tsx`
  - Add `useState` for expanded pillar key.
  - Wrap pillar header in a button; add `ChevronRight` / `ChevronDown` from lucide-react.
  - Render expandable section beneath the progress bar with the top 5 categories.

No changes to `ExecDemoPhoneView.tsx`, edge functions, or data plumbing.