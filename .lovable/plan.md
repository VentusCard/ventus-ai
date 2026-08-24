# FlowGovernanceCard — progress bar metric, color, and caption

## Problem
The current progress bar at the bottom of the Flow governance card measures "live products / total mapped products." After the recent change to show Marketing and Owner approval stages as signal-level fractions (e.g., 9/233 pending), the product-live metric no longer matches the rest of the rail and feels disconnected from the approval workflow the card is communicating.

## Goal
Make the progress bar represent the actual governance health of the signal corpus, use a single color that shifts with that health, and update only the footer caption to match.

## Proposed direction

### 1. Change the progress-bar metric
Replace `livePct` (live products / total products) with a signal-readiness percentage:

```text
readySignals = totalSignals - marketing.pending - owner.pending
progressPct  = readySignals / totalSignals
```

This counts every signal that has cleared both human approval gates and is therefore ready for channel execution. It directly reflects the two pending approval stages shown in the rail.

### 2. Single health-based color
Use one progress-bar fill color that changes based on the new percentage:

- < 50%  → amber-500 (approval backlog is high)
- 50-79% → amber-400 / yellow-500 (steady progress, still gated)
- >= 80%  → emerald-500 (healthy flow pipeline)

Keep the existing `transition-all` width animation; only the fill class changes.

### 3. Update the footer caption only
Rewrite the bottom caption to describe the new metric. Example:

```text
{progressPct}% of mapped signals have cleared both approval gates
```

Leave the header subtitle, stage labels, stage chips, and stage detail strings unchanged.

### 4. Keep data in one source of truth
Compute the new values in `src/components/tepilot/campaigns/data/flowGovernance.ts` so the React layer only reads and renders.

## Files to change
- `src/components/tepilot/campaigns/data/flowGovernance.ts` — add `readySignals` and `progressPct` (or expose the inputs so the component can derive it).
- `src/components/tepilot/campaigns/FlowGovernanceCard.tsx` — swap the progress bar metric, apply the health-based color class, and update the footer caption.

## Acceptance criteria
- Progress bar width is driven by cleared-signal percentage, not live products.
- Bar color is a single tone that shifts with the percentage (amber → emerald).
- Footer caption describes signals clearing approval gates.
- Header, stage tiles, chips, and tooltips remain unchanged.
- Light-theme policy is preserved; no `dark:` utilities.
- Build passes.
