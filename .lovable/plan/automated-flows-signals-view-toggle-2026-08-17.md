# Automated Flows: Signals view toggle

Add a toggle above the filter pills on the Automated Flows tab that switches the pill row between the current **Products** filters (All / Lending / Wealth / Deposits / Cards / Insurance) and a **Signals** filter showing the five pillars we detect: Life Event, Financial, Behavioral, Demographic, Risk.

## Behavior

- A small two-option segmented control ("Products" / "Signals") sits at the left of the existing filter row.
- Products mode: unchanged — current category pills, counts, and All-sorted-by-audience behavior.
- Signals mode: pills become the five signal families, each with a count of how many flows carry at least one signal in that family, plus an "All" pill. Selecting a family filters the flow list to flows carrying that signal family, sorted by total audience descending.
- The flow rows themselves stay identical; only the filter dimension changes. Product category badges remain on each row so the product is still identifiable.
- Switching modes resets the selection to "All".

## Signal family data

Today each flow signal is typed only `life-event | behavioral`. To filter on five pillars, the signal model gets extended:

- Widen `SignalType` in `src/lib/productAutomatedFlows.ts` to the five families: `life-event`, `financial`, `behavioral`, `demographic`, `risk`.
- Reclassify existing signals across the 76 flows so each carries the right family (e.g. tradeline/maturity/balance-and-rate evidence to `financial`, age/household/income-band evidence to `demographic`, delinquency/overdraft/exposure evidence to `risk`, purchase-and-merchant patterns stay `behavioral`, milestones stay `life-event`).
- Add a shared family label + pill color map so the microsegment cards render the new families with consistent colors (life event amber, financial emerald, behavioral blue, demographic violet, risk rose — matching the palette used elsewhere in the demo).

## Files

- `src/lib/productAutomatedFlows.ts` — extend `SignalType`, add family label/color map, reclassify signal entries.
- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx` — mode state, segmented toggle, signal-family pill row and filtering, updated `MicrosegmentCard` badge to use the family map.
