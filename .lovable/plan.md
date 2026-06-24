## Fix: AI uses wrong dates for relative time phrases

**Root cause:** The edge function never tells the model what "today" or the dataset's date range is. The model guesses based on its own world knowledge, so phrases like "last month" produce arbitrary dates (e.g. `'2026-05-01'`) that may not match the data window at all.

The dataset always spans the **last 90 days ending today** (generated in `queryDataset.ts` from the user's current date).

### Changes

**1. `src/components/tepilot/insights/QueryConsoleView.tsx`**
- Import `DATASET` (or expose a small `getDateRange()` helper) from `queryDataset.ts`.
- Compute `today`, `minDay`, `maxDay` (ISO `YYYY-MM-DD`, UTC-safe — build via `Date.UTC` to avoid timezone drift, per the stack note).
- Pass them into the `supabase.functions.invoke("generate-analytics-query", { body: { …, dateContext: { today, minDay, maxDay } } })` call.

**2. `supabase/functions/generate-analytics-query/index.ts`**
- Accept `dateContext` from the request body.
- Inject it into the user prompt, e.g.:
  ```
  Date context (use these for any relative phrase like "today", "last week", "last month", "last 30 days"):
  - today: 2026-06-24
  - dataset spans: 2026-03-27 → 2026-06-24
  Always resolve relative time to concrete 'YYYY-MM-DD' literals inside the dataset range.
  ```
- Add a system-rule line: "Never invent dates outside the provided dataset range."

**3. Verification**
- Curl the edge function with prompt `"top life events in the last month"` and confirm the returned SQL uses a `day >=` value within the dataset range (e.g. `'2026-05-24'` or `'2026-05-01'` — both valid since both fall in-range), not a future or out-of-range value.
- Click the same example in the UI and confirm rows return.

No engine, schema, or business-logic changes — purely improves the AI's date grounding.