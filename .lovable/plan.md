# Real SQL engine for the Query console + Ventus-specific tables

Replace the small DSL parser with a real in-browser SQL engine that runs against an expanded set of Ventus tables (shopping habits, life events with evidence, wallet share, deals + redemptions). The console keeps the same UI; only the engine and dataset grow.

## Engine

Use **alasql** (https://github.com/AlaSQL/alasql) — a pure-JS SQL engine that supports `SELECT … FROM … JOIN … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT`, common aggregates (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `COUNT(DISTINCT …)`), `CASE WHEN`, subqueries, and date functions. It accepts JS arrays as tables (`SELECT * FROM ?`) so no schema/import step is needed.

Install with `bun add alasql`. Register the tables once at module load by wrapping the existing `getDataset()` arrays.

New file `src/components/tepilot/insights/query/sqlEngine.ts`:
- `executeSql(sql: string): { columns: string[]; rows: Record<string, unknown>[]; rowCount: number }` runs the statement, returns the columnar result.
- Strips trailing semicolons and `LIMIT 1000` is added when missing to keep the UI responsive.
- Catches alasql errors and surfaces them with line/clause context.

Keep `queryDslEngine.ts` for now but stop calling it from the console — leaves room to delete later.

## Ventus tables exposed to SQL

Extend `queryDataset.ts` with four new derived/seeded tables on top of the existing transactions + customers seed:

| Table | Columns |
| --- | --- |
| `transactions` (existing) | transaction_id, customer_id, day, amount, pillar, category, merchant, region, segment |
| `customers` (existing) | customer_id, name, segment, region, age, tenure_years, aum |
| `life_events` (expanded) | event_id, customer_id, event_type, day, confidence, urgency (Urgent/Soon/Upcoming), evidence_count, evidence_sample (top merchant) |
| `shopping_habits` (new, derived) | customer_id, pillar, txn_count, total_spend, avg_ticket, top_merchant, spending_tier (Budget/Mainstream/Premium/Luxury), purchase_frequency (Rare/Monthly/Weekly/Daily), last_seen_day |
| `wallet_share` (new, derived) | customer_id, competitor_merchant, category, outflow_amount, outflow_count, last_outflow_day |
| `deals` (expanded) | deal_id, brand, pillar, category, discount_pct, redemptions, active |
| `deal_redemptions` (new) | redemption_id, deal_id, customer_id, day, redeemed_amount |

`shopping_habits` and `wallet_share` are computed in the dataset module after the transaction seed so they always agree with `transactions`. `deal_redemptions` is seeded directly with realistic counts per deal.

## Console updates

In `QueryConsoleView.tsx`:
- Replace `executeQuery` import with `executeSql` from the new engine.
- Update the default query and the example chips to real SQL:
  - "Transactions over time" → `SELECT day, COUNT(*) AS orders, SUM(amount) AS total_spend FROM transactions WHERE day >= DATE_SUB(...) GROUP BY day ORDER BY day` (alasql syntax).
  - "Top pillars last 30d" → `SELECT pillar, COUNT(*) AS txns, SUM(amount) AS spend FROM transactions GROUP BY pillar ORDER BY spend DESC LIMIT 20`.
  - "Life events by type (with evidence)" → `SELECT event_type, COUNT(*) AS events, AVG(confidence) AS avg_conf FROM life_events GROUP BY event_type ORDER BY events DESC`.
  - "Top wallet-share leakage" → `SELECT competitor_merchant, category, SUM(outflow_amount) AS leaked FROM wallet_share GROUP BY competitor_merchant, category ORDER BY leaked DESC LIMIT 10`.
  - "Premium shoppers by pillar" → `SELECT pillar, spending_tier, COUNT(*) AS customers FROM shopping_habits WHERE spending_tier IN ('Premium','Luxury') GROUP BY pillar, spending_tier ORDER BY customers DESC`.
  - "Deal redemptions × customer segment" → `SELECT c.segment, d.brand, COUNT(*) AS redemptions, SUM(r.redeemed_amount) AS revenue FROM deal_redemptions r JOIN customers c ON c.customer_id = r.customer_id JOIN deals d ON d.deal_id = r.deal_id GROUP BY c.segment, d.brand ORDER BY redemptions DESC LIMIT 20`.
- Toolbar shows full schema as a popover (table → columns) so the analyst can discover what to query.
- Chart auto-picks: if the result has a date-like first column, line; otherwise bar of the second numeric column. Optional `-- @chart line|bar|area:<column>` comment in the SQL overrides it.
- Drop the bespoke totals / PERCENT_CHANGE / COMPARE TO rows — analysts express that in SQL directly. The TabHeader copy is updated to "Standard SQL over Ventus tables".

## Edge function

Update `supabase/functions/generate-analytics-query/index.ts`:
- System prompt rewritten as a SQL generator (alasql dialect, examples, full schema inlined including the new tables).
- Tool name stays `deliver_query`, fields `query` (SQL string) and `explanation`.
- Strips markdown fences and stray prose; rejects DDL (`CREATE`/`DROP`/`INSERT`/`UPDATE`/`DELETE`/`ALTER`) before returning.

Redeploy after the edit.

## Files

- New: `src/components/tepilot/insights/query/sqlEngine.ts`
- Edit: `src/components/tepilot/insights/query/queryDataset.ts` (add life-event fields, shopping_habits, wallet_share, deal_redemptions; richer deals)
- Edit: `src/components/tepilot/insights/QueryConsoleView.tsx` (swap engine, new examples, schema popover, chart auto-pick)
- Edit: `src/components/tepilot/insights/query/QueryChart.tsx` (accept arbitrary first column + chart override)
- Edit: `src/components/tepilot/insights/query/QueryEditor.tsx` (add real SQL keywords to syntax highlight)
- Edit: `supabase/functions/generate-analytics-query/index.ts` (SQL prompt + schema)
- Install: `alasql`

## Verification

- `tsgo --noEmit` after the edit.
- Drive the preview with Playwright: navigate to `/bankdemo` → Analytics → Query, run the default + each example chip, screenshot the chart + table, confirm no errors in console.
- Smoke the edge function with `curl` for one prompt ("wellness spend per region last 60 days") and confirm it returns parseable SQL that the engine executes.

## Out of scope

- Saved queries / query history (still ephemeral).
- CSV export (easy follow-up).
- Cross-bank or live Postgres execution — engine stays in the browser.
