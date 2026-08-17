# Why deals and product cards take so long — and how to fix it

## Measured cause

From the AI Gateway logs for these two calls:

- `generate-next-offers`: 30–48s per run, ~1–2.4K tokens in, **4.1K–6.7K tokens out**
- `generate-product-cards`: 15–19s per run, ~2K tokens out

Both run on `google/gemini-3.1-pro-preview`, non-streamed, and the UI waits for the full JSON. The wait is dominated by output volume, not by network or prompt size.

`generate-next-offers` already fans out into 3 parallel gateway calls (behavioral rollups / life events / financial signals). The slow one is the behavioral call, which writes **5 deals for every cluster** in a single response.

## The existing rule this violates

There is a standing rule from the earlier product-cards work: **don't generate more than the UI displays.** `generate-product-cards` was capped at 2 non-risk cards (3 with risk) for exactly that reason.

The offers path never got the same treatment: **every** signal from **every** family is sent to the model, so the payload grows with the customer's signal count instead of with what the UI actually shows.

## Fix

1. **Keep 5 deals per signal** — that stays as-is.
2. **Send only the top signals per family**, not all of them: top 2 behavioral rollups (by spend), top 2 life events (by confidence), top 1 financial signal. Everything below the cut is dropped before the prompt is built, so the model never writes copy that is never surfaced.
3. **Lower `max_tokens`** from 8192 to a realistic ceiling for the trimmed output, and switch the behavioral/life-event copy calls to `google/gemini-3.5-flash` (already the model used by `deal-personalization`). Keep the Pro model on the financial-signal call, where the value math matters.
4. **Render progressively** — the result store keeps `offers` and `productCards` separate already; have the phone view show product cards as soon as they land instead of waiting on both.

## Expected result

Offer output drops from ~6K tokens to roughly 2.5K; first personalized content visible in roughly 10–15s instead of 45s, with deal quality and the 5-per-signal format unchanged.

## Technical notes

- `supabase/functions/generate-next-offers/index.ts`: slice `persona_rollups`, `life_events`, and `financial_signals` before building `rollupList`, `lifeEventList`, `financialSignalList`; per-call model selection in `callGateway`; `max_tokens: 4096`. The "Exactly 5 deals" prompt rules stay untouched.
- `src/lib/personalizationResultStore.ts`: set `productCards` as soon as that promise resolves rather than after `Promise.allSettled` on both.
- No taxonomy, schema, or auth changes; deal copy rules and value-math grounding rules stay exactly as they are.

