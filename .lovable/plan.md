# Add Ventus-Signature Reports

Extend the Reports library with 5 new templates that surface insights only Ventus can produce for a bank — all framed as business outcomes, not pipeline internals. Brings the total to 15.

Each report reuses `ReportPageShell` + `DashboardToolbar` + `ReportDataTable`, existing mock data, and adds one signature visual.

## New report templates

1. **Behavioral Tier Migration** (category: *Lifestyle*)
   Customers shifting between Essential / Comfort / Premium / Luxury tiers across the period — early signal of upmarket or downmarket drift before income data confirms it. Visual: 4×4 migration matrix heatmap + table of largest tier jumps with suggested next product.

2. **Life Event Detection Funnel** (category: *Retention*)
   The detection pipeline as a business view: signals raised → corroborated → confirmed → actioned, by event type (new baby, home purchase, job change, relocation, retirement). Visual: 4-step funnel + table of recent confirmed events with evidence-transaction count and recommended outreach.

3. **Wallet Share & Outbound Funds** (category: *Outflow*)
   Detects outbound transfers leaving the bank — brokerage ACH, neobank funding, competitor card paydowns, Zelle to rival institutions. Visual: horizontal bar of destinations + win-back table with estimated AUM/deposits at risk per customer.

4. **Travel Trip Reconstruction** (category: *Lifestyle*)
   Groups raw transactions into labeled trips (origin → destination, dates, total spend, fare-class heuristic) — lets the bank target travel rewards, FX, and trip insurance at the right moment. Visual: trip timeline list + table with per-trip airline / hotel / dining breakdown.

5. **Next-Best-Conversation Triggers** (category: *Opportunities*)
   Behavioral triggers ready for the advisor / contact center this week — surfaced from spend pattern changes, life events, and tier drift. Visual: priority bar by trigger type + table of customer-level triggers with the 10-word AI action item (per existing advisor-console rules).

## Wiring

- Extend `TabValue` in `AnalyticsContainer.tsx` with: `report-tier-migration`, `report-life-event-funnel`, `report-wallet-share`, `report-travel-trips`, `report-next-conversation`.
- Add 5 cards to `ReportsLibrary.tsx` with icons (TrendingUp, GitBranch, ArrowUpRight, Plane, MessageSquare) and a "Ventus signature" badge to distinguish from generic BI templates.
- Add one new category chip: *Opportunities*.
- Add `case` branches mapping each tab value to its new page component.

## Out of scope

No new mock data, no real pipelines, no edits to the existing 10 reports beyond category-chip parity. No enrichment-quality or pipeline-health reports — these are business insights for the bank, not internal data-ops views.
