## Group transactions by source as collapsible cards

In `src/components/exec-demo/ExecDemoSelectionDialog.tsx`, replace the single flat transaction table with a stack of collapsible source cards.

### Changes

**File: `src/components/exec-demo/ExecDemoSelectionDialog.tsx`**

1. Group `rawRows` by `source` (e.g. Checking, Cashback Card, Travel Card, Premium Card, Checks, ACH, Wire, Zelle, HSA, plus any "—" fallback). Preserve a stable order based on the existing `SOURCE_COLORS` keys, then append any unknown sources.

2. Replace the existing `<ScrollArea>` + `<table>` block (the one rendered when `!showCustomFlow`) with a single `<ScrollArea>` containing a vertical stack of cards — one per source group.

3. Each card:
   - Header (always visible, click toggles expand):
     - Source pill (using existing `SOURCE_COLORS` styling)
     - Source name
     - Right side: transaction count + total absolute amount (e.g. "12 txns · $1,432.50")
     - Chevron icon that rotates when open
   - Expanded body:
     - The same transaction table markup currently used, but only the rows for that source. Drop the redundant "Source" column inside the body since it is now implied by the card.
   - Default state: all collapsed. Add a small "Expand all / Collapse all" toggle above the stack.

4. Manage open/closed state with a single `useState<Record<string, boolean>>` keyed by source name. Reset when the selected customer changes (via `useEffect` on `customer.id`).

5. Keep the empty state message when there are zero rows overall.

6. Styling: cards use `border border-slate-200 rounded-xl bg-white` with a hover background on the header, matching the existing light-theme aesthetic of the dialog. No new dependencies — use the existing lucide `ChevronDown` icon.

### Out of scope

- No changes to the custom-persona flow, header, pills row, or footer Run button.
- No backend / edge function changes.
