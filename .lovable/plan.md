# Calm down the Intelligence Database

The Overview sub-tab currently stacks nine full-width blocks with no hierarchy: page header + date toolbar, three priority cards, the Ask Ventus banner, a coverage strip, five signal-family cards, live stream + taxonomy, pillar donut + external intelligence, pillar table + revenue opportunities, and a portfolio context bar. Everything competes for attention at the same visual weight, so nothing reads as the answer.

## The approach

Keep every piece of data, but move from one long scroll to a short, prioritized page with progressive disclosure.

### 1. Lead with one answer layer
- Keep the three priority cards at the top, visually promoted (larger, clearly the "what to do now" row).
- Move the Ask Ventus banner directly under them as the single secondary action.

### 2. Signal families become the core of the page
- Keep the 5-family board, but drop the coverage strip into the family board header as a one-line caption instead of its own section.
- Families stay clickable into the family panel exactly as today.

### 3. Everything analytical collapses into one section
Group the pillar donut, top-pillar table, revenue opportunities, taxonomy coverage, external intelligence and live signal stream into a single "Portfolio analytics" area with a small segmented switcher (Pillars / Opportunities / Taxonomy / Live stream / External). One panel visible at a time instead of six cards stacked.

### 4. Move scale context out of the way
The portfolio context bar (accounts, users, spend, transactions, wallet share) becomes a compact single line directly under the page title rather than a card at the bottom of the page.

### 5. Density control
Add a "Compact / Full" toggle next to the date range in the toolbar. Compact (default) shows steps 1, 2 and the collapsed analytics section; Full expands every analytics panel at once for users who want the current firehose. Preference persists in localStorage.

Net effect: first screen = priorities + signal families. Everything else is one click away rather than three scrolls down.

## Technical notes

- `AnalystDashboardView.tsx`: restructure the layout, add the density state (localStorage key) and the analytics panel switcher. No data logic changes — the same `getBankwideMetrics` / `getPillarDistribution` / `getRevenueOpportunities` / `getVentusPriorityCards` calls feed the same components.
- `SignalCoverageStrip.tsx`: render as an inline caption variant.
- `LiveSignalStream`, `TaxonomyCoverageCard`, `ExternalIntelligenceCard`, `ChartCard` blocks: unchanged internally, just re-parented into the switcher.
- Sub-tabs (Overview / Segments / Risk / Reports / Query / API) and all navigation callbacks stay as-is.
- Strict light theme, existing slate borders and type scale preserved.
