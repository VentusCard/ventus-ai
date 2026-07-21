## Fix: send correct token param to gpt-5-mini in classify-transactions

**Problem:** `supabase/functions/classify-transactions/index.ts` line 539 unconditionally sends `max_tokens: 8000`. `openai/gpt-5-mini` rejects that with HTTP 400 (`Unsupported parameter: 'max_tokens' — use 'max_completion_tokens' instead`), which forces every batch through the slow fallback + retry path (~20s per batch, observed in edge logs).

**Change (single file):** `supabase/functions/classify-transactions/index.ts` around lines 531–543.

Replace the hard-coded `max_tokens: 8000` with a model-aware token field so gpt-5* gets `max_completion_tokens` and everything else keeps `max_tokens`:

```ts
const isOpenAiGpt5 = /^openai\/gpt-5/i.test(model);
const body: Record<string, unknown> = {
  model,
  messages: [...],
  tools: CLASSIFICATION_TOOL,
  tool_choice: { type: "function", function: { name: "classify_batch" } },
  ...(isOpenAiGpt5
    ? { max_completion_tokens: 8000 }
    : { max_tokens: 8000 }),
};
if (!isOpenAiGpt5) body.temperature = 0;
```

Nothing else changes — fallback ladder, retry logic, and prompt stay intact.

**Verify:**
1. Redeploy the edge function.
2. Load `/bankdemo` past the password gate and let pre-fire run.
3. Check AI Gateway logs: `openai/gpt-5-mini` requests for `classify-transactions` should return 200 (not 400), and batch durations should drop from ~20s to a few seconds. Fallbacks to `google/gemini-3.5-flash` should stop firing.
