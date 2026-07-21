# Fix classify-transactions all-Miscellaneous fallback

## Root cause (confirmed from edge function logs)

Every batch is returning 400 from the AI gateway:

> "Unsupported parameter: `max_tokens` is not supported with this model. Use `max_completion_tokens` instead."

The primary model (`google/gemini-3.5-flash`) and the fallback (`openai/gpt-5-mini`) both reject `max_tokens` on the current gateway. Because every call errors out, the pipeline falls through to the per-row default classification (`Miscellaneous & Unclassified / General / General / One-Time`), which is exactly what the table is showing.

Source: `supabase/functions/classify-transactions/index.ts:544` sets `max_tokens: 4000` in the request body.

## Fix

- In `supabase/functions/classify-transactions/index.ts`, replace `max_tokens: 4000` with `max_completion_tokens: 4000` in `callClassificationAPI`.
- Redeploy the `classify-transactions` edge function so the change is live.
- Verify by re-running the Demo tab and checking edge function logs for a successful `[BATCH N] ✓ …` line and non-Miscellaneous rows in the enrichment table.

## Out of scope

- No changes to models, batch size, concurrency, or the classification schema.
- No changes to any other edge function.
