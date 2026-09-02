# Collapse Automated Flows Governance Card into a Sliver

## Goal
On `/bankdemo` → **Automated Flows**, turn the large `FlowGovernanceCard` into a compact, expandable sliver so it takes less vertical space while still surfacing the most important governance numbers.

## What will change
- `src/components/tepilot/campaigns/FlowGovernanceCard.tsx`
  - Add a `collapsed` default state.
  - **Collapsed sliver** (default): one horizontal row showing:
    - Live status dot + "Flow governance" title
    - Key metric: `{readySignals} of {totalSignals} signals ready`
    - Progress percentage
    - A thin progress bar
    - Expand chevron
  - **Expanded state**: render the existing 5-stage rail (Products → Signals → Marketing → Owner → Channels) plus the bottom progress summary.
  - Clicking the sliver header toggles between collapsed and expanded.
  - Keep strict light theme (white card, slate-200 border, no `dark:` classes).

- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`
  - No structural change; `FlowGovernanceCard` remains in the same position above the category filters.

## Out of scope
- No changes to the underlying `FLOW_GOVERNANCE` data or `flowGovernance.ts`.
- No changes to the product cards, signal rows, or filters below.

## Acceptance criteria
- The governance card loads as a thin sliver (~48–56 px tall) by default.
- One click expands it to the full card; another click collapses it again.
- All existing tooltips, stage chips, and channel chips remain available in the expanded view.
- Build passes and the Automated Flows tab renders without errors.