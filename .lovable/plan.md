# Cap output tokens on the two copy calls in generate-next-offers

Today every gateway call in `generate-next-offers` shares one ceiling: `max_tokens: 8192`. The two `COPY_MODEL` (`gemini-3.5-flash`) calls — the behavioral-rollup copy call and the life-event copy call — are the ones actually running to 5,000–7,700 output tokens per run, and output tokens are the bulk of gateway spend.

## Change

- Give `callGateway` an explicit `maxTokens` argument, defaulting to the current 8192 so nothing else shifts.
- Pass a strict cap of **3,000** output tokens for the two `COPY_MODEL` calls (rollup copy, life-event copy).
- Leave the financial-signal call on the pro model at its current ceiling — its value math is short and already well under the limit.

## Truncation safety

A hard cap can cut a response mid-JSON. The function already runs candidate JSON through a tolerant parser that returns `null` on failure, and the caller degrades to the remaining signal families rather than erroring — so a truncated copy call fails soft. No new fallback logic is added; the existing `null` path handles it.

## Technical notes

- `supabase/functions/generate-next-offers/index.ts` only. `callGateway(system, user, apiKey, model = MODEL, maxTokens = 8192)`; the two `COPY_MODEL` task pushes pass `3000`.
- No prompt, schema, taxonomy, or response-contract changes. The "Exactly 5 deals" copy rules stay as they are.
- Redeploy the function after the edit.

## Expected effect

Worst-case copy output drops from ~7.7K to 3K tokens per call, roughly halving the largest line item in gateway spend, with typical (already-under-3K) responses unchanged.
