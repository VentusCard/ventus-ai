# Fix: deal generation drops behavioral and life-event collections

## What the logs show

From `generate-next-offers` (04:03–04:06 runs), every run ended the same way:

- `ERROR Failed to parse rollup AI response: ...` — the behavioral response comes back cut off mid-JSON (one run even returned a bulleted reasoning list instead of JSON). Nothing parses, so **zero behavioral groups** are produced.
- `WARNING life event "College-bound child" → NO MATCH ... Available raw labels: []` — the life-event response also failed to parse, so the matcher had no groups to match against and emitted **placeholder groups with empty `deals` arrays**.
- Only the financial-signal call succeeded, which is why the last response contained deals for "Building a savings buffer" and nothing else.

Cause: both copy calls run on `gemini-3.5-flash` with `max_tokens: 3000` and no JSON mode. Two clusters × 5 deals, each carrying `message`, `valueLine`, `valueMath`, `signalReason`, plus `collectionMessage` and `suppressedCategories`, does not fit in 3000 output tokens — the model gets truncated mid-object and `parseJsonLoose` returns null. The 3000 cap was added earlier to cut token spend and is now over-tight.

## Fix

In `supabase/functions/generate-next-offers/index.ts`:

1. **Send only the top signal per copy family** — `MAX_BEHAVIORAL_ROLLUPS = 1`, `MAX_LIFE_EVENTS = 1` (financial stays at 1). This matches the intended behavior: first behavioral cluster, first life event. One group of 5 deals fits comfortably in budget and keeps spend lower than today's failing 2-cluster calls.
2. **Force structured output** — add `response_format: { type: "json_object" }` to `callGateway` so the model can never return prose/reasoning instead of JSON.
3. **Right-size the cap** — raise `COPY_MAX_TOKENS` from 3000 to 4000, enough headroom for one group of 5 fully-grounded deals.
4. **Truncation salvage** — if `parseJsonLoose` fails, attempt a repair pass that trims to the last complete deal object and closes the JSON, so a near-miss still yields deals instead of an empty collection.
5. **Better diagnostics** — log `finish_reason` and output token count alongside the parse error so a future truncation is obvious from one log line.

No prompt-content, taxonomy, or client changes; the "exactly 5 deals" rules and all copy rules stay untouched.

## Verification

Re-run a customer selection on /bankdemo and confirm the response contains one behavioral group and one life-event group, each with 5 deals, and that the logs show no parse errors.
