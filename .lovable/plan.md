## Diagnosis (from edge-function logs)

Last run of `classify-transactions` classified only 7/103 in ~105s. Two failure modes:

1. **`google/gemini-3.5-flash` (primary)** hits `MAX_TOKENS` — `finish_reason: "length"` — so no `tool_calls` come back for a 24-tx batch under `max_tokens: 4000`.
2. **`openai/gpt-5-mini` (fallback)** returns `400: "'temperature' does not support 0 with this model. Only the default (1) value is supported."` because we send `temperature: 0` unconditionally. Every fallback attempt 400s → sub-batch fallback repeats the same 400 → batch returns empty.

User wants `openai/gpt-5-mini` to be the **primary** model. That means we must fix the temperature issue (which is what's currently killing every gpt-5-mini call), plus size the request so it actually returns in one shot.

## Fix plan — edit `supabase/functions/classify-transactions/index.ts`

1. **Swap models:**
   - `FAST_MODEL` (primary) → `openai/gpt-5-mini`
   - `FALLBACK_MODEL` → `google/gemini-3.5-flash` (keeps a different provider as backstop, and it accepts `temperature: 0`)

2. **Model-aware sampling params** in `callClassificationAPI` — build the JSON body dynamically:
   - For `openai/gpt-5*` models: **omit `temperature`** (only default `1` is accepted). Still send `tools` + `tool_choice` to force the JSON tool call.
   - For Gemini models: keep `temperature: 0`.

3. **Right-size the request for gpt-5-mini tool output:**
   - Raise `max_tokens` from `4000` → `8000` in `callClassificationAPI`.
   - Lower `BATCH_SIZE` from `24` → `12` so each request comfortably fits and parallelism (still `CONCURRENCY_LIMIT = 4`) improves throughput.

4. **Fail fast on deterministic 4xx** in `callClassificationAPI`:
   - If status is 4xx and not 429, return immediately with an error marker so `classifyBatch` escalates to the fallback model instead of burning 4 same-model retries. This alone would have saved most of the 105s in the failing run.

5. **Sub-batch fallback** in `classifyWithSubBatchFallback`: also honor the model-aware temperature rule (it currently calls `callClassificationAPI` with `FALLBACK_MODEL` — will inherit fix #2 automatically once params are model-aware).

## Expected outcome

- Primary path succeeds on `openai/gpt-5-mini` for 12-tx batches (no more temperature 400, no more MAX_TOKENS truncation).
- Fallback path on `gemini-3.5-flash` also works when it does fire.
- 103-tx wall time should drop from ~105s (mostly failed) to roughly ~10–20s.

## Out of scope

Prompt content, schema, and all UI/frontend code are unchanged. Only request-shape, model ids, and batch sizing in the one edge function change.
