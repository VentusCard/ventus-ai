## Problem

Two related gaps:
- The 3 priority-opportunity tiles on the Analytics dashboard (`InsightStrip`) are dead ends. Only the small "See why" link is clickable and it lands on a hidden tab.
- The Reports page today is only a library of **SQL templates** — every row opens the Query console. There is no concept of an **interactive report** (narrative + numbers + graphs + next steps) that a non-SQL user can read end-to-end.

## Solution

Introduce **Reports** as a first-class interactive artifact — pages that combine words, numbers, graphs and recommended next steps. Add an **Interactive Reports** section to the Reports page listing all such reports. Ship the first one, **Priority Opportunity**, and route the 3 dashboard tiles into it. Future reports drop into the same section without new plumbing.

### 1. Shared interactive-report shell
`src/components/tepilot/insights/reports/InteractiveReportShell.tsx` (new)

A single layout primitive every interactive report renders inside. Sections, in order:
- Header: back button, eyebrow label, title, one-line framing, optional right-side badges.
- Optional switcher slot (segmented control for reports that pivot across entities).
- `KPI row` slot — 2 to 4 tiles.
- `Narrative` slot — short paragraphs + optional two-column contrast block (current vs. target).
- `Charts` slot — 1-3 chart cards using existing `ChartCard` + `recharts`.
- `Detail` slot — long content (tables, lists).
- `Recommended Next Steps` slot — numbered step cards, each with owner, timeframe, one-line rationale, and a CTA linking to an in-app surface. Final CTA row.

Shell owns spacing, typography rhythm, and back-navigation. Individual reports just fill slots.

### 2. Reports registry + Interactive Reports section
`src/components/tepilot/insights/reports/ReportsLibrary.tsx`
- Extend props: `onOpenQuery: (sql: string) => void` + `onOpenInteractiveReport: (id: InteractiveReportId, payload?: unknown) => void`.
- Add a new **Interactive Reports** section above the SQL template grid. Each card: title, one-line description, category chip, "Open report" chevron. First card = "Priority Opportunity". Room to add more.
- The existing SQL template grid stays unchanged below.

New small file `src/components/tepilot/insights/reports/interactiveReportsRegistry.ts` listing the interactive reports (id, title, description, icon, category). Single source of truth for the section cards.

### 3. Route the interactive reports as tabs
`src/components/tepilot/insights/AnalyticsContainer.tsx`
- Add tab value `'report-priority-opportunity'` (future ones follow the same `report-*` prefix already used).
- Add `selectedOpportunityId: string | null` state + setter.
- Route in `renderContent()` to `<PriorityOpportunityReport opportunityId={selectedOpportunityId} onBack={() => setActiveTab('reports')} />`.
- Add to `validTabs`. Not in sidebar — deep-linked from Reports and from the InsightStrip (matches existing `report-*` pages).
- Implement `handleOpenInteractiveReport(id, payload)` that sets any required state (e.g. `selectedOpportunityId`) then switches tabs.

### 4. Make the InsightStrip tiles open the first interactive report
`src/components/tepilot/insights/dashboard/InsightStrip.tsx`
- Replace `onSeeWhy?: () => void` with `onOpen?: (opportunityId: string) => void`.
- Wrap each tile in a `<button>` that calls `onOpen(op.id)`; keep the "See why →" chevron as visual affordance only.
- Thread `onOpenOpportunity(id)` from `AnalyticsContainer` → `VentusAIDashboardView` → `AnalystDashboardView` → `InsightStrip`. Container implementation reuses `handleOpenInteractiveReport('priority-opportunity', { opportunityId: id })`.

### 5. First interactive report — Priority Opportunity
`src/components/tepilot/insights/reports/pages/PriorityOpportunityReport.tsx` (new, colocated with the other report pages).

Renders inside `InteractiveReportShell`:

```text
← Back to Reports
PRIORITY OPPORTUNITY · [priority badge]
{gapTitle}
Strategic framing (strategicInsight)

Switcher: segmented control across the top 3 opportunities

KPI row: Addressable revenue · Affected users · Avg spend gap · Merchant partners

Narrative:
  2-3 short paragraphs derived from opportunity fields
  Current state -> Target state (two-column contrast block)

Charts:
  A. Monthly opportunity vs. currently captured (bar + line)
  B. Opportunity by customer tier (horizontal bars)
  C. Merchant pipeline value by quarter (stacked bar, from
     merchantPartnerships[].peakQuarter)

Detail: existing MerchantList (from rewards-pipeline)

Recommended Next Steps (numbered):
  1. Lock in merchant terms      -> Deal Pipeline (/tepilot/rewards-pipeline)
  2. Target the ready cohort     -> Segment Targeting tab
  3. Launch personalized campaign-> Campaign Builder tab
  4. Track lift                  -> Wallet Share / Cross-Sell report (by gapType)
Final CTA row: "Open Deal Pipeline" + "Launch Campaign Builder"
```

Data source: existing `getRevenueOpportunities(EMPTY_FILTERS)` from `@/lib/mockBankwideData`. If `opportunityId` is null or unknown, fall back to the top-priority item. All chart series are **deterministically derived** from opportunity fields — no random-at-render values, no new dataset, no new dependency.

### Out of scope
- No changes to `BankwideView` / `RevenueOpportunitiesCard`; the hidden `dashboard` tab stays.
- SQL template grid on the Reports page is unchanged.
- Retrofitting existing `LifestylePillarReport`, `PillarDeepDiveReport`, etc. into `InteractiveReportShell` is deferred — they keep working as-is; only the new report uses the shell.
- No sidebar reshuffling, no new data sources, no backend work.

## Files touched
- `src/components/tepilot/insights/reports/InteractiveReportShell.tsx` — new shared shell.
- `src/components/tepilot/insights/reports/interactiveReportsRegistry.ts` — new registry.
- `src/components/tepilot/insights/reports/ReportsLibrary.tsx` — add Interactive Reports section above SQL grid; new `onOpenInteractiveReport` prop.
- `src/components/tepilot/insights/reports/pages/PriorityOpportunityReport.tsx` — new report page (KPIs, narrative, 3 charts, merchant list, next steps, switcher).
- `src/components/tepilot/insights/AnalyticsContainer.tsx` — new `report-priority-opportunity` tab, `selectedOpportunityId` state, routing, valid-tab entry, `handleOpenInteractiveReport` wired to Reports + strip.
- `src/components/tepilot/insights/dashboard/InsightStrip.tsx` — tile → button; prop renamed to `onOpen(id)`.
- `src/components/tepilot/insights/dashboard/AnalystDashboardView.tsx` — thread callback down to the strip.
- `src/components/tepilot/insights/VentusAIDashboardView.tsx` — thread callback prop.
