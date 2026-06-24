The "Failed to send a request to the Edge Function" error happens because `summarize-query-result` has source code but was never deployed (no logs exist, and it's not registered in `supabase/config.toml`).

## Fix

1. Add a `[functions.summarize-query-result]` block to `supabase/config.toml` with `verify_jwt = false` so it matches the other public demo functions on this page.
2. Deploy the `summarize-query-result` edge function so the client can actually reach it.
3. In `TakeawayPanel.tsx`, improve the error message: when `supabase.functions.invoke` returns a `FunctionsHttpError`, read `error.context.json()` (or `.text()`) and show the real backend reason instead of the generic "Failed to send a request…" string. Keeps the rest of the panel unchanged.

No changes to query engine, ResultActionsBar, or other components.
