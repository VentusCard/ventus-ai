

## Speed Up Travel Detection

### Problem
The primary model is `google/gemini-2.5-pro` — the slowest, most expensive model. With batch size 30, concurrency 2, and up to 3 attempts per batch, this can easily take 30-90+ seconds.

### Fix — `supabase/functions/travel-detection/index.ts`

1. **Switch primary model to `openai/gpt-5-mini`** (line 12) — fast, strong at structured JSON extraction, reliable with tool calling. Keep `google/gemini-2.5-flash` as fallback.

2. **Reduce batch size from 30 → 15** (line 6) — smaller batches complete faster and are less likely to produce malformed output, reducing retries.

3. **Increase concurrency from 2 → 3** (line 7) — more parallel batches to offset smaller batch size.

These three line changes should cut travel detection time from 30-90s down to ~5-15s.

### Changes Summary

| Line | Before | After |
|------|--------|-------|
| 6 | `BATCH_SIZE = 30` | `BATCH_SIZE = 15` |
| 7 | `CONCURRENCY_LIMIT = 2` | `CONCURRENCY_LIMIT = 3` |
| 12 | `"google/gemini-2.5-pro"` | `"openai/gpt-5-mini"` |
| 13 | `"openai/gpt-5-mini"` | `"google/gemini-2.5-flash"` |

