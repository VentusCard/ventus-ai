## Reports tab → Query tab handoff

Each tile in the Reports library now opens the **Query** tab with a pre-loaded SQL statement that runs against the Ventus in-engine schema, instead of opening a hard-coded report page.

### Mechanics

1. **`QueryConsoleView.tsx`** — accept optional `initialQuery?: string`. When it changes, set `query` state, call `run(initialQuery)`, and scroll the editor into view. The default behavior (load `DEFAULT_QUERY` on first mount) only fires when `initialQuery` is empty.
2. **`AnalyticsContainer.tsx`** — add `pendingQuery` state. Pass it into `<QueryConsoleView initialQuery={pendingQuery} />`. When `ReportsLibrary` requests an open, set `pendingQuery` then `setActiveTab('query')`.
3. **`ReportsLibrary.tsx`** — change the contract: each template carries a `query: string` (its best-fit SQL). The `onOpen` prop becomes `onOpenQuery(query: string)`. The tile still shows title / description / category / "Last run" — only the click handler changes (now reads "Open in Query"). The Reports tab itself, search, and category filter are untouched.

### SQL mapping (each template → 1 SQL statement using the live engine schema)

All queries use only tables in `SCHEMA`: `transactions`, `customers`, `life_events`, `shopping_habits`, `wallet_share`, `deals`, `deal_redemptions`. Each starts with a `-- @chart …` hint where it improves the auto-chart, ends with `LIMIT`, and aliases aggregates.

| Template | Query intent |
|---|---|
| Lifestyle pillar share | `SUM(amount), COUNT(*)` from `transactions` grouped by `pillar`, ordered by spend desc. Chart: bar. |
| Pillar deep-dive (age × region) | Join `transactions` to `customers`, bucket `age` into bands via `CASE`, group by `region, age_band, pillar`. |
| Cross-sell propensity matrix | Self-join `shopping_habits` on `customer_id` to surface pillar pairs the same customer spends in (proxy for cross-sell). |
| Spend by region | `transactions` grouped by `region`: customers, total spend, $/customer. Chart: bar. |
| Behavioral tier migration | `shopping_habits` grouped by `spending_tier, pillar`: customers + avg ticket per tier. |
| Travel trip reconstruction | `transactions` filtered to `pillar='Travel'`, grouped by `customer_id, day`, listing total + merchant counts. |
| Outflow to competitors | `wallet_share` grouped by `competitor_merchant, category`: customers + outflow. Chart: bar. |
| Top merchant outflow | `wallet_share` grouped by `competitor_merchant`: total outflow, affected customers, ordered desc, LIMIT 20. |
| Wallet share & outbound funds | `wallet_share` grouped by `category`: outflow, count, distinct customers. |
| Subscription churn cohort | `transactions WHERE pillar='Subscriptions'` grouped by `category, day` to show monthly run-rate. |
| Cohort retention (sign-up month) | `customers` grouped by `tenure_years`: customer count + avg AUM. (Proxy — no signup date.) |
| Life-event volume | `life_events` grouped by `event_type, urgency`: events + avg confidence. Chart: bar. |
| Life event detection funnel | `life_events` grouped by `event_type`: events, avg confidence, total evidence — proxy for funnel stages. |
| Financial vulnerability summary | Aggregate `wallet_share` + customer AUM to flag high-outflow vs low-AUM customers (CASE buckets). |
| Next-best-conversation triggers | `life_events` JOIN `customers`: top customers by `confidence * evidence_count`, with segment + event_type. |

### Verification

- Run Playwright: open `/bankdemo` → Analytics → Reports, click each tile, confirm it switches to the **Query** tab with the editor populated and a result table or chart rendered (no SQL error banner).
- Test the search input still filters; category chips still work; the "Last run" line and Ventus badge still render.

No data, RLS, edge-function, or design-system changes.