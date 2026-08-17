# Automated Flows search bar

Add a short search input to the left of the active-count chip in the Automated Flows tab.

## Behavior

- Place a compact search input immediately to the left of the existing badge that currently reads "56 signals detected" or "10 active of 76".
- The search filters the current row list in real time as the user types.
- In **Products** mode, match against product `name`, `category`, and `positioning`.
- In **Signals** mode, match against signal `label`, `detection`, and the names of flows it feeds.
- The existing category/family pills and mode toggle remain unchanged and continue to narrow results before search.
- Clearing the input restores the full filtered list.

## Files

- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx` — add search state, input UI, and filter logic for both `filtered` and `signalRows`.
