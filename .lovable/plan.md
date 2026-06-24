# Query console for /bankdemo Analytics

Add a new "Query" tab inside the Analytics group of the `/bankdemo` AnalyticsContainer. It mirrors Shopify's report builder: SQL editor on top, natural-language "Refine query" box, a chart, and a results table — all running against the demo transactions dataset via an AI-assisted NL→SQL flow.

## UI

New file `src/components/tepilot/insights/QueryConsoleView.tsx`. Layout follows the strict light theme:

```text
┌──────────────────────────────────────────────────────────┐
│ Query                              [Run]   Last run: …   │
├──────────────────────────────────────────────────────────┤
│ Toolbar: [Last 30 days ▾] [Date range ▾] [Currency: USD] │
├──────────────────────────────────────────────────────────┤
│ SQL editor (monospaced, line-numbered, read-only-ish)    │
│   FROM transactions                                      │
│   SHOW count, total_amount, avg_amount                   │
│   TIMESERIES day WITH TOTALS, PERCENT_CHANGE             │
│   SINCE startOfDay(-30d) UNTIL today                     │
│   ORDER BY day ASC                                       │
│   LIMIT 1000                                             │
│   VISUALIZE count TYPE line                              │
├──────────────────────────────────────────────────────────┤
│ ✨ Refine query: [free-text prompt ........] [Generate]  │
├──────────────────────────────────────────────────────────┤
│ Chart (line/bar/area, picked from VISUALIZE clause)      │
├──────────────────────────────────────────────────────────┤
│ Results table — period, % change row, then daily rows    │
└──────────────────────────────────────────────────────────┘
```

- Editor: simple `<textarea>` with monospace font and syntax-colored render layer (no Monaco — keeps bundle small). Read/edit allowed but the primary flow is "describe → generate".
- 4–6 example queries shown as chips above the editor: "Orders over time", "Top pillars last 30d", "Wallet share by category", "Life events last 7d", "Travel trips this quarter".
- Chart uses existing recharts setup (see `OutflowByCategoryChart.tsx` for patterns).
- Results table uses `ReportDataTable` from `src/components/tepilot/insights/reports/ReportDataTable.tsx` so styling matches the Reports section.

## SQL dialect

Adopt a small Shopify-ShopifyQL-style DSL (`FROM`, `SHOW`, `TIMESERIES`, `SINCE`, `UNTIL`, `COMPARE TO`, `ORDER BY`, `LIMIT`, `VISUALIZE`) parsed on the client. The DSL is whitelisted to a handful of demo tables/columns derived from the existing sample dataset (transactions, customers, life_events, deals). Real Postgres is never touched — execution runs in the browser over the same in-memory demo data used by the rest of `/bankdemo`.

## AI flow ("Refine query" / "Generate")

New Supabase edge function `supabase/functions/generate-analytics-query/index.ts`:
- Input: `{ prompt: string, currentQuery?: string, schema: <inlined whitelist> }`
- Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) via the AI SDK with `Output.object` returning `{ query: string, explanation: string }`.
- System prompt enforces the DSL grammar and the whitelisted tables/columns; rejects anything else with a clear error string.
- Standard CORS, `verify_jwt = false` (default), `LOVABLE_API_KEY` already set.

Client calls it via `supabase.functions.invoke('generate-analytics-query', ...)`, drops the returned `query` into the editor, then auto-runs.

## Navigation wiring

In `src/components/tepilot/insights/AnalyticsContainer.tsx`:
- Add `'query'` to `TabValue`.
- Add `{ value: "query", label: "Query", icon: Terminal }` to the Analytics nav group (after Reports).
- Add a case in `renderContent()` rendering `<QueryConsoleView />`.

No changes to the Reports library, Dashboard, or any existing tab.

## Files

- New: `src/components/tepilot/insights/QueryConsoleView.tsx`
- New: `src/components/tepilot/insights/query/QueryEditor.tsx` (textarea + syntax highlight overlay)
- New: `src/components/tepilot/insights/query/QueryDslEngine.ts` (parse + execute DSL over demo data)
- New: `src/components/tepilot/insights/query/QueryChart.tsx` (line/bar/area dispatcher)
- New: `supabase/functions/generate-analytics-query/index.ts`
- Edit: `src/components/tepilot/insights/AnalyticsContainer.tsx` (nav item + render case + TabValue)

## Out of scope

- No real Postgres execution, no schema introspection of live tables.
- No saved-query/library persistence (one ephemeral query at a time).
- No CSV export in v1 (easy follow-up).
