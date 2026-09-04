# Make every signal open a real segment

## Current state

Clicking a signal inside an expanded family drawer already jumps to the Segments sub-tab and carries the label and the book population — a click on "Live events and culture goer" lands on Segments showing "Segment exported from signal: Live events and culture goer · 3.7M customers in the book".

Three gaps remain:

1. **Risk signals never reach Segments.** The handler in `VentusAIDashboardView` intercepts `family === "risk"` and routes to the Risk sub-tab instead, dropping the signal entirely.
2. **The family cards themselves aren't a destination.** Clicking a card only opens or closes the drawer; there is no way to open "all 64.0M Behavioral customers" as a segment.
3. **Only the label and count transfer.** The drawer knows each signal's 24h delta, evidence line and strong/likely/emerging mix; none of it reaches the Segments banner. And because the sampled directory rarely contains the newer signal labels, the results table often collapses to two representative profiles with no explanation of why.

## What to build

### 1. Every signal routes to Segments

Remove the Risk interception so all five families behave identically: signal click sets the segment seed and switches to Segments. Risk stays reachable from its own sub-tab; the drawer just no longer hijacks the click.

### 2. Family cards open the whole family as a segment

Each card keeps its expand/collapse chevron, and gains an explicit "Open segment" affordance (the customer count becomes the click target, with the chevron reserved for expanding). Opening a family seeds a family-level segment — no signal label — so Segments shows the family's full population.

### 3. Richer handoff

The segment seed grows from `{ family, label }` to also carry population, 24h delta, evidence and confidence mix. The Segments banner then reads as a proper segment header: signal name, family chip, book population, trend, the evidence line that produced it, and the strong/likely/emerging split. It stays one compact band with the existing Clear segment control.

The "representative sample" line becomes explicit about what it is — the sampled profiles illustrate the segment while the headline count is the book-level cohort — so a two-row table no longer reads as a bug.

## Technical notes

- `src/components/tepilot/insights/customers/CustomersDirectoryView.tsx` — widen `CustomerSegmentSeed` with optional `customers`, `delta`, `evidence`, `confidence`, and an optional family-only mode; prefer the passed population over the label lookup when present.
- `src/components/tepilot/insights/VentusAIDashboardView.tsx` — drop the risk branch; pass the full seed through.
- `src/components/tepilot/insights/dashboard/SignalFamilyBoard.tsx` / `SignalFamilyPanel.tsx` / `AnalystDashboardView.tsx` — send the full rollup up through `onOpenSignal`; add the family-level open path.
- Segment banner markup lives in `CustomersDirectoryView`; extend it in place, keeping the strict light theme.
- Verification: typecheck, build, and an authenticated Playwright pass confirming a Risk signal, a Behavioral signal and a family card each land on Segments with the matching population.
