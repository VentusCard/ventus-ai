# Customers tab — enterprise redesign

Rework the Customers tab in /bankdemo from a two-column browse list into a search-first, dashboard-led workspace that reads like an enterprise banker console.

## New page structure

```text
┌ Customers ─────────────────────────────────────────────────┐
│  KPI STRIP: 5 metric tiles                                  │
├─────────────────────────────────────────────────────────────┤
│  SEARCH BAR (large, centered, autocomplete)                 │
│  quick chips: recently viewed · high-value · signal filters │
├─────────────────────────────────────────────────────────────┤
│  RESULTS TABLE (dense, sortable) — 15 customers             │
├─────────────────────────────────────────────────────────────┤
│  CUSTOMER DETAIL (opens on row select, replaces table)      │
└─────────────────────────────────────────────────────────────┘
```

### 1. Portfolio dashboard strip
Five compact metric tiles computed from the directory data, not hardcoded:
- Customers in book
- Customers with an active life event
- Customers with financial-product obligations detected
- Customers carrying a risk signal
- Signals detected across the book

Each tile shows the number, a short label, and a subtle trend/context line. Below the tiles, a slim signal-family distribution bar showing how the book splits across the five families.

### 2. Search-first entry point
- Large search input as the primary call to action ("Search your book by name, city, segment, product, or signal").
- Type-ahead dropdown listing up to 6 matching customers with segment and city; Enter or click opens the profile.
- Quick-start chips beneath the search: signal-family filters, tier filters, and "Recently viewed" (session state).
- Before any search or selection, the results area shows a guided empty state: "Start with a search" plus three suggested starting points (highest-value customers, customers with a new life event, customers carrying risk).

### 3. Results table
Replaces the card list. Dense, enterprise table with columns:
Customer · Segment · City · Tier · Relationship value · Signals (family chips with counts) · Last activity.
Sortable by name, tier, relationship value, and total signals. Row click opens the detail view. Row count and active filters shown above the table with a Clear all control.

### 4. Customer detail
Opens in place with a back-to-results breadcrumb.
- Profile header: name, email, city, tier, age band, tenure, relationship value, last activity, product badges.
- Signal summary row: five family counters.
- Five signal sections in ladder order (Life Events, Financial, Spending Habits, Demographic, Risk) with label, evidence line, and confidence band.
- Suggested next actions panel on the right of the header block.

## Visual direction

Strict light theme — white surfaces, slate-200 borders, slate typography, Manrope UI. Blue used only for active/primary affordances; red reserved for risk. Existing family pill colors preserved. Tighter type scale, uppercase micro-labels, and table zebra-free rows with hover states to match the rest of the demo.

## Technical notes

- `src/components/tepilot/insights/CustomersDirectoryView.tsx` is restructured into: `CustomerPortfolioStats` (KPI strip + distribution bar), `CustomerSearchBar` (input + type-ahead + chips), `CustomerResultsTable`, and `CustomerDetailPanel` — kept in the same folder as small sibling files for readability.
- View mode state: `search` (empty/guided) → `results` → `detail`, with recently-viewed IDs held in component state.
- Metrics derive from `CUSTOMER_DIRECTORY` in `src/lib/customerDirectoryData.ts` via `useMemo`; no new data file needed and no changes to the signal dataset.
- No changes to `AnalyticsContainer.tsx` routing — the tab entry stays as is.
