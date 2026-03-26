

## One-Shot Travel Detection with gemini-2.5-flash

### Why it works
- `google/gemini-2.5-flash` handles large structured outputs fast (~5-10s for 34 transactions vs 80s+ with batched gpt-5-mini)
- Already proven reliable in this project (used by classify-transactions and as current fallback)
- Strong at tool-calling / structured JSON extraction

### Changes — `supabase/functions/travel-detection/index.ts`

1. **Switch primary model** to `google/gemini-2.5-flash`, fallback to `openai/gpt-5-mini`
2. **Remove batching entirely** — send all transactions (up to ~50) in a single API call
3. **Remove `BATCH_SIZE`, `CONCURRENCY_LIMIT`, `runWithConcurrency`** and the batch-splitting logic
4. **Simplify to a single call** with retry (keep `MAX_RETRIES` + exponential backoff)
5. **Keep the SSE streaming response format** — just emit one `travel_updates` event with all results, then `done`
6. **Keep salvage/regex fallback** for malformed responses
7. **Keep `max_tokens: 8000`** token budget

### Result
- ~5-10s total instead of ~80s+ across batches
- No timeout risk — single call well within 60s edge function limit
- Simpler code, fewer failure modes

