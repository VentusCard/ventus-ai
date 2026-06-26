In `src/components/tepilot/insights/CapabilitiesView.tsx`, change the Sources column so every `SourceGroupCard` starts collapsed by default — remove the initial-open behavior for the Credit Bureau group so no provider group is expanded on load. Users must click a group header to reveal its sub-inputs.

No other tabs, signals, or destination logic affected.