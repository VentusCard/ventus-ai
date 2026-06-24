## Post-result actions for the Query tab

Add a results action bar that appears above the chart/table after a successful run. Four actions, each scoped to what makes sense for the current result.

### Action bar layout

Right-aligned chip row inside the same card region as the result, just under the "X rows" caption:

```
[ AI takeaway ] [ Export CSV ] [ Export cohort ▾ ] [ Email summary ]
```

### 1. Export CSV (result rows)

- Pure client-side. Serialize `result.columns` + `result.rows` to CSV (RFC 4180 quoting), trigger download via Blob + `<a download>`.
- Filename: `ventus-query-<YYYYMMDD-HHmm>.csv`.
- Disabled if `result.rowCount === 0`.

### 2. Export cohort (customer_id list)

Split button — primary action "Export all matching customers", dropdown to pick a single row's segment when the query is aggregated.

**"Export all":**
- Reuse the user's current SQL but rewrite to a cohort query. New helper `buildCohortQuery(sql)` in `query/sqlEngine.ts`:
  - Strip `SELECT … FROM` projection, replace with `SELECT DISTINCT customer_id`.
  - Drop `GROUP BY`, `ORDER BY`, `LIMIT`, `HAVING`.
  - Keep `FROM` + all `JOIN`s + `WHERE`.
  - Reject (toast) if no table in the FROM/JOIN graph exposes `customer_id` — `deals`, pure aggregates of `life_events` without join, etc.
- Execute via `executeSql`, then CSV download: one column `customer_id`. Filename `ventus-cohort-<YYYYMMDD-HHmm>.csv`.

**"Export this segment" (per row):**
- Enabled only when the result has a GROUP BY (detected during `executeSql` — extend `SqlResult` with `groupByCols: string[]`).
- Add a tiny "Export" link in the leftmost cell of each data row (hover-revealed) AND surface the same option in the action-bar dropdown by listing each row's grouping-key values.
- Builds a cohort query and appends `AND <groupCol> = <value>` for each grouping column. Same CSV format as above.

### 3. AI takeaway

- New button → opens a slide-down panel under the action bar with a single paragraph (3–5 sentences) interpreting the result.
- Calls a new edge function `summarize-query-result` (parallels `generate-analytics-query`):
  - Input: `{ sql, columns, rows: rows.slice(0, 100), dateContext }`.
  - System prompt: Ventus analyst voice; no fabricated numbers; cite figures only from rows; close with one suggested next action ("Consider exporting the 412 Affluent customers in the Travel pillar for a campaign"). Honors the "vaguely specific, no creepy specifics" memory rule for customer-facing copy — but here the audience is the banker, so concrete numbers from the result are allowed.
  - Uses Lovable AI Gateway, `Lovable-API-Key` auth, same pattern as existing function.
- Cache the takeaway per `(sql, lastRun)` so re-opening the panel is instant.

### 4. Email summary

- Button opens a small dialog: recipient(s) input (comma-separated, validates), optional note, "Include CSV attachment" checkbox (default on).
- Requires Lovable email infrastructure. If no domain configured, dialog shows the standard email setup CTA instead of the form.
- Sends via a new edge function `email-query-result` that:
  - Renders an HTML email: subject `Ventus query · <first column or "Result"> · <date>`, body = AI takeaway (reuses cached one or generates inline) + first 20 rows as an HTML table + "View full export attached".
  - Attaches the CSV when requested.
  - Enqueues through the existing transactional email queue.
- Toast on success / failure.

### Technical surface

Files touched:

- `src/components/tepilot/insights/QueryConsoleView.tsx` — render `<ResultActionsBar />`, hold takeaway/email dialog state.
- `src/components/tepilot/insights/query/ResultActionsBar.tsx` *(new)* — the 4-button row + per-segment dropdown.
- `src/components/tepilot/insights/query/EmailResultDialog.tsx` *(new)*.
- `src/components/tepilot/insights/query/TakeawayPanel.tsx` *(new)*.
- `src/components/tepilot/insights/query/exportCsv.ts` *(new)* — CSV helper + download trigger.
- `src/components/tepilot/insights/query/sqlEngine.ts` — add `buildCohortQuery(sql)`, extend `SqlResult` with `groupByCols`.
- `supabase/functions/summarize-query-result/index.ts` *(new)* + `supabase/functions/email-query-result/index.ts` *(new)*, both registered in `supabase/config.toml` with `verify_jwt = false` (matches existing analytics function pattern).

No schema, RLS, or design-system changes. Strict light theme preserved.

### Out of scope

- Saving queries / scheduled reports.
- Cohort push to campaign studio (separate follow-up).
- Editing email templates from inside the Query tab.
