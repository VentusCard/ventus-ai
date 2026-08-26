# /bankdemo: which LLM calls fire, and which are waste

## What the logs show

Every `/bankdemo` personalization run produces the same cluster of **four** gateway calls within ~25s (e.g. 2026-08-26T01:52:14–01:52:24Z, log_ids `01a03bc4-61ba-7e14…`, `01a03bc4-61bb-788f…`, `01a03bc4-6210-722a…`, `01a03bc4-62bb-7036…`; identical clusters at 2026-08-25T17:09 and 17:10):

| Call | Model | Tokens (in/out) | Cost |
|---|---|---|---|
| offers → behavioral rollup copy | gemini-3.5-flash | 1.6K / 3.0K | ~0.030 |
| offers → life-event copy | gemini-3.5-flash | 2.5K / 3.3K | ~0.034 |
| offers → financial-signal copy | gemini-3.1-pro | 1.1K / 3.2K | ~0.041 |
| product cards | gemini-3.1-pro | 4.3K / 2.4K | ~0.037 |

≈0.14 credits and ~25s per customer, and it repeats on every page reload.

## The waste, in order of size

**1. It fires before anyone asks.** `AnalyticsContainer.tsx` calls `prewarmDefaultCustomer()` in a mount effect, so all four calls run on every `/bankdemo` load — including loads that never reach a Personalization tab. Nothing is persisted, so a refresh mid-demo re-fires the whole cluster.

**2. Both generators fire on every surface, but each surface renders only one of them.** `CustomerMockupPanel` always calls `generatePersonalizedExperience`, which fires offers *and* product cards. But the phone maps surfaces to a single view: `rewards` → offers only, `product` → the relationship/email/SMS view, which reads only `productCards`. So on the Rewards tab the product-card call (pro model, 4.3K in) is pure waste, and on the Product tab the three offer calls are pure waste.

**3. The product-cards prompt ships far more input than it uses.** Its own rules use only `life_events[0]`, `persona_rollups[0]`, and `financial_signals[0]` (slots 1–3, with `[1]` as fallback), yet the request serializes the *entire* rollup list and up to 8 pillars — that's the 4.3K input tokens. It also runs on `gemini-3.1-pro-preview` to write three short cards.

**4. The offers function makes three calls to produce three groups.** `MAX_BEHAVIORAL_ROLLUPS`, `MAX_LIFE_EVENTS` and `MAX_FINANCIAL_SIGNALS` are all `1`, so each call returns exactly one collection of 5 deals. Three separate round-trips (one on the pro model) for three small groups is the dominant latency.

## Fix

1. **Delete the blind prewarm** in `AnalyticsContainer.tsx`. Warm on intent instead: prefetch on hover/focus of the Personalization nav items. The existing `ensurePersonalization` call in `CustomerMockupPanel` still covers direct navigation.
2. **Cache across reloads**: persist the personalization store in `sessionStorage`, keyed by customer id + demo bank name. `clearPersonalizationResults()` on bank-config change stays, so renaming the bank still regenerates.
3. **Generate per surface**: give `generatePersonalizedExperience` a `need: "offers" | "cards" | "both"` argument and have `CustomerMockupPanel` pass what its surface actually renders. Keep the cache per-part so switching tabs fills in the missing half instead of refiring both. (The AI-chat surface passes product recommendations, so it asks for cards.)
4. **Trim the product-cards payload and model**: send only the slot-1/slot-2 candidates the prompt is allowed to use (top 2 per family, drop the pillar dump), and move the call to `google/gemini-3.5-flash` — three short cards do not need the pro model. Expect ~4.3K in → under 1K.
5. **Skip empty families** in `generate-next-offers` (already partly true) and move the financial-signal call to `gemini-3.5-flash` as well, keeping its value-math prompt rules unchanged; verify one run's output quality before keeping it.

Expected: a `/bankdemo` load that never opens personalization costs **0 credits** instead of ~0.14; a run that does open it drops to 1–3 calls and roughly half the credits, with first content appearing sooner.

## Technical notes

- `src/components/tepilot/insights/AnalyticsContainer.tsx` — remove the prewarm effect, add hover/focus prefetch on the Personalization nav entries.
- `src/lib/personalizationResultStore.ts` — sessionStorage hydrate/persist; per-part status so `need` requests merge.
- `src/lib/personalizationGeneration.ts` — accept `need`; conditionally build each invoke.
- `src/components/tepilot/insights/CustomerMockupPanel.tsx` — pass `need` derived from `surface`.
- `supabase/functions/generate-product-cards/index.ts` — slice inputs to the slots the prompt uses; switch model.
- `supabase/functions/generate-next-offers/index.ts` — model change on the financial-signal call only.
- No prompt-rule, taxonomy, deal-format, or UI changes.
