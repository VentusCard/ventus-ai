# Calm down the Intelligence Database

The Overview sub-tab currently stacks nine full-width blocks with no hierarchy: page header + date toolbar, three priority cards, the Ask Ventus banner, a coverage strip, five signal-family cards, live stream + taxonomy, pillar donut + external intelligence, pillar table + revenue opportunities, and a portfolio context bar. Everything competes for attention at the same visual weight, so nothing reads as the answer.

## The approach

Keep every piece of data, but move from one long scroll to a short, prioritized page with progressive disclosure.

### 1. Priorities move into Ventus AI chat
The three standalone priority cards disappear from the Overview page. Instead, Ventus delivers them:
- The Ask Ventus banner becomes the single top block, opening with a short AI-voiced line: "3 priorities in your book right now" plus the three headlines as compact one-line chips (life event / offer / flow) with their customer + addressable metric.
- Clicking a chip opens the Ventus AI chat with that priority as the opening turn — a chat message that states the signal, the population, the addressable value, and the recommended next step, with an action button that deep-links to the same destination the card used (briefing report / personalization / flow).
- Opening the chat with no chip selected starts with the same priorities briefing message, so the chatbot is the place priorities live.


### 2. Signal families become the core of the page
- Keep the 5-family board, but drop the coverage strip into the family board header as a one-line caption instead of its own section.
- Families stay clickable into the family panel exactly as today.

### 3. Everything analytical collapses into one section
Group the pillar donut, top-pillar table, revenue opportunities, taxonomy coverage, external intelligence and live signal stream into a single "Portfolio analytics" area with a small segmented switcher (Pillars / Opportunities / Taxonomy / Live stream / External). One panel visible at a time instead of six cards stacked.

### 4. Move scale context out of the way
The portfolio context bar (accounts, users, spend, transactions, wallet share) becomes a compact single line directly under the page title rather than a card at the bottom of the page.

### 5. Density control
Add a "Compact / Full" toggle next to the date range in the toolbar. Compact (default) shows steps 1, 2 and the collapsed analytics section; Full expands every analytics panel at once for users who want the current firehose. Preference persists in localStorage.

Net effect: first screen = Ventus briefing + signal families. Everything else is one click away rather than three scrolls down.

## Technical notes

- `getVentusPriorityCards` stays the data source; it now feeds the chat sliver and the chat's opening briefing instead of `InsightStrip`. `InsightStrip.tsx` is retired from the Overview.
- `VentusAIDashboardView.tsx`: the sliver renders the priority chips and passes a selected priority into `onOpenChat`.
- `VentusAIChatPage.tsx` / chat panel: accept a priority seed, render the briefing as the first assistant message with an action button routing through the existing `onOpenOpportunity` / navigation callbacks so `report-priority-opportunity` and the personalization/flow tabs still open.
- `AnalystDashboardView.tsx`: restructure the layout, add the density state (localStorage key) and the analytics panel switcher. No data logic changes — the same `getBankwideMetrics` / `getPillarDistribution` / `getRevenueOpportunities` calls feed the same components.
- `SignalCoverageStrip.tsx`: render as an inline caption variant.
- `LiveSignalStream`, `TaxonomyCoverageCard`, `ExternalIntelligenceCard`, `ChartCard` blocks: unchanged internally, just re-parented into the switcher.
- Sub-tabs (Overview / Segments / Risk / Reports / Query / API) and all navigation callbacks stay as-is.
- Strict light theme, existing slate borders and type scale preserved.

