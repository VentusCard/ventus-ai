

## Fix: Travel Detection Reliability

### Problem
1. **No real fallback** — `FALLBACK_MODEL` is the same as `PRIMARY_MODEL` (`google/gemini-2.5-pro`), so retries just repeat the same failing call.
2. **Gemini max_tokens too low** — `max_tokens: 4000` for 30 travel candidates with detailed structured output is likely hitting output truncation, causing empty tool calls.

### Changes — `supabase/functions/travel-detection/index.ts`

**Line 13** — Set a real fallback model:
```ts
const FALLBACK_MODEL = "openai/gpt-5-mini";
```

**Line 230** — Increase Gemini max_tokens to 8000:
```ts
const tokenParam = isOpenAI ? { max_completion_tokens: 8000 } : { max_tokens: 8000 };
```

Two line edits. Batch size stays at 30.

