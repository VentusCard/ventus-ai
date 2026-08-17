# Why deals and product cards take so long — and how to fix it

## What the logs show

Measured from the AI Gateway logs for these two calls:

- `generate-next-offers`: 30–48s per run, 1,000–2,400 tokens in, **4,100–6,700 tokens out**
- `generate-product-cards`: 15–19s per run, ~4,400 tokens in, ~1,900–2,300 tokens out

Both run on `google/gemini-3.1-pro-preview`, non-streamed, and the UI waits for the full JSON before rendering anything. So the wait is dominated by one very large single-shot generation.

Root cause, in order of impact:

1. **Output volume.** `generate-next-offers` writes 5 collections × 5 deals, each with message, value line, value math, CTA, signal reason — roughly 6k output tokens in one response. Generation time scales almost linearly with output tokens.
2. **Model choice.** A Pro reasoning model is used for what is mostly formatted copywriting.
3. **No streaming / no partial render.** Nothing appears until both calls fully complete, so perceived latency equals the slowest call.

## Fix

**1. Split the offers call into parallel per-collection calls**
Instead of one call producing 5 collections, fire one call per collection (5 small calls in parallel, ~800 output tokens each). Wall-clock drops from ~45s to roughly the slowest single call (~8–12s). Results merge into the same `rollupOffers` shape, so no UI contract change.

**2. Downgrade the copywriting calls to a fast model**
Use `google/gemini-3.5-flash` for the offer-copy calls (same model already used by `deal-personalization`). Keep the Pro model only where reasoning matters — product-card selection.

**3. Render progressively**
Update the personalization result store so each collection lands in the UI as it returns, rather than waiting for the whole set. Product cards render as soon as their call finishes, independent of offers.

**4. Trim the output schema**
Drop or shorten redundant fields in the deal payload (`valueMath` duplicates `valueLine`; `signalReason` can be capped) to cut output tokens further.

## Expected result

First personalized content visible in ~5–8s instead of ~45s, with the rest filling in progressively.

## Technical notes

- `supabase/functions/generate-next-offers/index.ts`: accept an optional single-rollup mode; switch `MODEL` to a flash model for copy generation; lower `max_tokens` to fit one collection.
- `src/lib/personalizationGeneration.ts`: fan out one invoke per pillar rollup plus life-event group, merge with `Promise.allSettled`, emit partial results via a callback.
- `src/lib/personalizationResultStore.ts`: add incremental `offers` accumulation and a `partial` status so consumers re-render as groups arrive.
- Phone/mockup views: show collections that have arrived instead of an all-or-nothing spinner.
- No schema, auth, or prompt-taxonomy changes.
