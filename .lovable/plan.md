# Plan: Risk Filter Visual Update

## Goal
Make eligibility filters in the Automated Flows tab visually read as risk filters with negative-impact numbers.

## Changes

### 1. Filter badge label and color
In `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`:
- Change the grey `Filter` badge inside `FilterRow` to a red `Risk Filter` badge.
- Use the existing project red palette (`bg-rose-50 text-rose-700 border-rose-200`).

### 2. Negative percentage inside the filter row
- Replace the `Keeps N%` copy with `-X%` where `X = round((1 - passRate) * 100)`.
- Update the expanded filter explanation to describe the reduction rather than the pass-through.

### 3. Negative people impact in the flow summary
- In the expanded `FlowRow` filter header, change `keeps N%` to `-X%` total reduction.
- Add a second figure showing the audience removed by filters (e.g. `-2,000 people`) computed as `triggered - qualified`.
- Keep the final qualified audience visible so the math is still readable.

## Files touched
- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`

## Validation
- Open `/bankdemo` Automated Flows, expand a Lending/Wealth flow with filters, confirm the badge reads `Risk Filter` in red and the numbers display as negative percentages and negative people counts.
