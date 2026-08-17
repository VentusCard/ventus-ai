# Why deals and product cards take so long — and how to fix it

## Measured cause

From the AI Gateway logs for these two calls:

- `generate-next-offers`: 30–48s per run, ~1–2.4K tokens in, **4.1K–6.7K tokens out**
- `generate-product-cards`: 15–19s per run, ~2K tokens out

Both run on `google/gemini-3.1-pro-preview`, non-streamed, and the UI waits for the full JSON. The wait is dominated by output volume, not by network or prompt size.

`generate-next-offers` already fans out into 3 parallel gateway calls (behavioral rollups / life events / financial signals). The slow one is the behavioral call, which writes **5 deals for every cluster** in a single response.

## The existing rule this violates

There is a standing rule from the earlier product-cards work: **don't generate more than the UI displays.** `generate-product-cards` was capped at 2 non-risk cards (3 with risk) for exactly that reason.

The offers path never got the same treatment:

- Prompt asks for **exactly 5 deals** per collection (`index.ts:85`, `:150`, `:314`)
- The phone view renders only **3** (`GeneratedOffersPhoneView.tsx:238`)

So roughly 40% of the generated deal copy is thrown away, and every collection in the payload gets generated whether or not it surfaces.

## Fix

1. **Generate 3 deals per collection, not 5** — matches what the phone actually renders. Update the three system prompts and the user prompts in `generate-next-offers`.
2. **Cap the collections sent to the model**: top 2 behavioral rollups (by spend), top 2 life events (by confidence), top 1 financial signal. Everything below the cut is dropped before the prompt is built, not after.
3. **Lower `max_tokens`** from 8192 to a realistic ceiling for the trimmed output, and switch the behavioral/life-event copy calls to `google/gemini-3.5-flash` (already the model used by `deal-personalization`). Keep the Pro model on the financial-signal call, where the value math matters.
4. **Render progressively** — the result store keeps `offers` and `productCards` separate already; have the phone view show product cards as soon as they land instead of waiting on both.

## Expected result

Offer generation output drops from ~6K to under 2K tokens; first personalized content visible in roughly 8–12s instead of 45s.

## Technical notes

- `supabase/functions/generate-next-offers/index.ts`: change "Exactly 5 deals" → 3 in `SYSTEM_PROMPT`, `LIFE_EVENT_SYSTEM_PROMPT`, `FINANCIAL_SIGNAL_SYSTEM_PROMPT` and the matching user prompts; slice rollups/life events/financial signals before building `rollupList`, `lifeEventList`, `financialSignalList`; per-call model selection in `callGateway`; `max_tokens: 3072`.
- `src/lib/personalizationResultStore.ts`: set `productCards` as soon as that promise resolves rather than after `Promise.allSettled` on both.
- No taxonomy, schema, or auth changes; deal copy rules and value-math grounding rules stay exactly as they are.
