# New tab: System Flow (vertical pipeline)

Add a **separate top-level tab** in the /bankdemo sidebar — next to the existing "System" tab — that renders the same architecture as a top-to-bottom vertical flow. The existing System tab is left completely untouched.

## What the user sees

New sidebar item **"System Flow"** (directly under "System"). It shows the pipeline as numbered full-width stages with connectors between them:

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
- Clicking a chip in any stage expands its detail inline under that stage — provider inputs, signal items, or the team's workflow steps — using the same copy that the current diagram shows.
- Selecting a signal or team highlights the related chips in the stages above and below, making the path through the pipeline visible.
- Same light theme and the same per-signal / per-team colors. No new content invented.

## Technical notes

- New tab value `capabilities-flow` added to `TabValue` and to the same sidebar group as `capabilities` in `AnalyticsContainer.tsx`, with a `case` returning the new view.
- New component `src/components/tepilot/insights/SystemFlowView.tsx`.
- Data (`SIGNALS`, `TEAMS`, `DESTINATIONS`, the source groups) is extracted from `CapabilitiesView.tsx` into `src/components/tepilot/insights/capabilities/capabilitiesData.ts` so both tabs read one source of truth. The source groups become a factory function since they depend on the `onOpenProducts` callback. `CapabilitiesView` then imports from that module; its rendering is unchanged.
