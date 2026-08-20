# Make the Intelligence Database overview Ventus-specific

Today the Intelligence Database → Overview opens with generic bank BI: total accounts, unique users, card spend, transactions, spend by card product, spend by region. None of that is what Ventus uniquely produces. The overview should lead with **the signals Ventus extracts** — visible at first glance, before any chart.

## New overview structure (top to bottom)

1. **Signal coverage strip** (replaces the 6 generic KPI tiles)
   - Customer profiles enriched (of total)
   - Signals detected (last 24h)
   - Avg signals per customer
   - Life-event signals active
   - External signals ingested (24h)
   - Signal confidence: % Strong

2. **Signal families board** — the centerpiece, five cards using the canonical
   ladder and existing family colors: Life Events, Financial, Behavioral /
   Spending Habits, Demographic, Risk. Each card shows:
   - customers carrying that family + 24h delta
   - the top 4 concrete signals in that family with counts
     (e.g. "College-bound child · 412K", "Auto loan maturing · 268K")
   - a small Strong / Likely / Emerging confidence split bar
   - click-through: Life Events / Financial / Behavioral / Demographic → Customers
     sub-tab, Risk → Risk sub-tab

3. **Live signal stream** — a compact rolling list of newly detected signals in
   `signal → evidence` form, matching the Systems tab ticker style
   ("Quarterly business trip to Chicago" → "repeat weekday fares, same corridor"),
   tagged internal vs external.

4. **Taxonomy coverage** — what the enrichment engine resolves: 12 lifestyle
   pillars, 3-tier semantic labeling, merchant-resolution rate, unclassified
   remainder. Pillar donut/table stays here (it is Ventus output, not generic BI).

5. **External intelligence** — small panel: sources ingested, signal types added
   on top of first-party transactions, match rate.

6. **Portfolio context** (demoted, collapsed to one compact row at the bottom):
   accounts, users, card spend, transactions kept as a single thin strip for
   scale context only. Spend-by-card-product and spend-by-region charts move out
   of the overview — they already exist under Reports.

Priority Opportunities strip and the "Ask Ventus AI" sliver stay where they are.

## Technical notes

- New `src/lib/intelligenceSignalStats.ts`: deterministic mock stats derived from
  the existing signal vocabularies (`customerDirectoryData` SIGNAL_FAMILY_META,
  `financialSignalTaxonomy`, `externalIntelligenceSignals`,
  `personalizationExamples`) scaled to the 75M-user portfolio — no LLM, no backend.
- New components under `src/components/tepilot/insights/dashboard/`:
  `SignalCoverageStrip.tsx`, `SignalFamilyBoard.tsx`, `LiveSignalStream.tsx`,
  `TaxonomyCoverageCard.tsx`, `ExternalIntelligenceCard.tsx`.
- `AnalystDashboardView.tsx` is re-composed to render the order above; existing
  `ChartCard` / `MetricTile` / `DashboardToolbar` primitives are reused.
- Strict light theme, no `dark:` utilities. Copy stays "vaguely specific" — no
  exact per-customer amounts or transaction counts.
