## Problem

`classify-transactions` is already Gemini-only. The `openai/gpt-5-mini` 400 errors visible during a /bankdemo run come from two sibling functions that fire in parallel during preload:

- `supabase/functions/assess-creditworthiness/index.ts` — `FALLBACK_MODEL = "openai/gpt-5-mini"`
- `supabase/functions/travel-detection/index.ts` — `FALLBACK_MODEL = "openai/gpt-5-mini"`

`gpt-5-mini` rejects `max_tokens` (needs `max_completion_tokens`), so any fallback trigger produces a 400 that surfaces in the same preload window as classify-transactions.

## Fix

Edit-only changes, no schema/UI:

1. **`supabase/functions/assess-creditworthiness/index.ts`** — change `FALLBACK_MODEL` from `openai/gpt-5-mini` to `google/gemini-3.1-flash-lite`.
2. **`supabase/functions/travel-detection/index.ts`** — change `FALLBACK_MODEL` from `openai/gpt-5-mini` to `google/gemini-3.1-flash-lite`.
3. **`supabase/functions/classify-transactions/index.ts`** — housekeeping only: remove the now-stale `openai/gpt-5-mini` comment on line 11 and the unused `isOpenAiGpt5` branch on lines 533–534 so future readers don't think OpenAI is ever called here.

No prompt or business-logic changes.

## Validation

After deploy, re-run /bankdemo and confirm the ai-gateway log for the preload window shows only `google/*` models. No `openai/gpt-5-mini` entries should appear.
