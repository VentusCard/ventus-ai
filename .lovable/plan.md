# System tab: vertical flow view

Add a second view to the **System** tab in /bankdemo that presents the same architecture as a top-to-bottom pipeline instead of the current left-to-right wired diagram.

## What the user sees

The System page gets a sub-tab bar at the top:

- **Architecture** — the existing horizontal diagram (unchanged, default).
- **Flow** — the new vertical version.

The Flow view stacks the pipeline as numbered stages, each a full-width band with a connector arrow between them:

```text
  1  DATA SOURCES        6 providers · 39 inputs   [KYC][Transactions][Holdings][Digital][Context][External]
                     |
  2  VENTUS AI ENGINE    ingest -> resolve -> classify -> enrich -> score
                     |
  3  SIGNAL LAYERS       [Life Event][Behavioral][Financial][Demographic][Risk]
                     |
  4  BANK TEAMS          [Product & Growth][Wealth & Relationship][Deals & Rewards]
                     |
  5  DESTINATIONS        [Digital Banking][Marketing Automation][CRM][Rewards][Assistant][AI Coworker]
```

Behavior:
- Each stage band is expandable — clicking a chip opens the same detail content (inputs, signal items, team workflow steps) that the current diagram shows, rendered inline under that stage instead of in a side panel.
- Selecting a signal or team highlights the related chips in the stages above and below it, so the path through the pipeline is visible.
- Same light theme, same colors per signal/team, same copy and data — no new content invented.

## Technical notes

- Reuse the existing `SIGNALS`, `TEAMS`, `DESTINATIONS`, and `sourceGroups` data in `CapabilitiesView.tsx`; extract them into a shared module (`src/components/tepilot/insights/capabilities/capabilitiesData.ts`) so both views read one source of truth. `sourceGroups` currently lives inside the component because it depends on `onOpenProducts`; it becomes a factory function taking that callback.
- New component `src/components/tepilot/insights/capabilities/SystemFlowView.tsx` renders the vertical stages.
- `CapabilitiesView.tsx` keeps `TabHeader`, adds `SubTabBar` (existing component) with `architecture` / `flow`, and renders the current diagram body or the new flow view.
- No routing or sidebar changes — this stays inside the existing `capabilities` tab.
