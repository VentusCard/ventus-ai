# /bankdemo personalization: stop generating what's already static

## What actually runs on the three personalization tabs

The left panel (life events, behavioral, financial, demographic, risk pills) is **static data** — it comes from `EXAMPLE_CUSTOMERS` in `src/lib/personalizationExamples.ts`, five hand-authored customers. No model produces it. `generated.lifeEvents` in the store is likewise just `buildLifeEvents(customer)` — a mapping of those same static pills, not a detection result.

So the only live model work on those tabs is generating the phone content, and it is always the same four gateway calls (confirmed in the gateway logs, e.g. the 2026-08-26T01:52:14–01:52:24Z cluster `01a03bc4-61ba-7e14…`, `01a03bc4-61bb-788f…`, `01a03bc4-6210-722a…`, `01a03bc4-62bb-7036…`, repeated identically at 2026-08-25T17:09 and 17:10):

| Call | Model | Tokens in/out | Cost |
|---|---|---|---|
| offers → behavioral rollup copy | gemini-3.5-flash | 1.6K / 3.0K | ~0.030 |
| offers → life-event copy | gemini-3.5-flash | 2.5K / 3.3K | ~0.034 |
| offers → financial-signal copy | gemini-3.1-pro | 1.1K / 3.2K | ~0.041 |
| product cards | gemini-3.1-pro | 4.3K / 2.4K | ~0.037 |

≈0.14 credits and ~25 seconds per customer, re-run on every page load.

Because the inputs are static, **the outputs are deterministic per customer** — the same five signal sets are sent to the model over and over to get materially the same five collections and three cards back.

## What is genuinely needed

- Rewards tab → `rollupOffers` only.
- Product tab → `productCards` only (relationship/email/SMS views read nothing else).
- AI chat tab → no pre-generation; `consumer-chat` fires only when the user sends a message, and `detect-risk-transactions` only on the "risk factors" action. Both stay as-is.

Everything else currently fired is either unused on that tab or regenerating fixed content.

## Plan

**1. Freeze the five demo customers into a snapshot.** Generate offers + product cards once per customer for the default bank, and commit the results as `src/lib/personalizationSnapshots.ts`. `ensurePersonalization` serves the snapshot instantly (status `ready`, zero calls) and only falls back to live generation when the demo bank is set to a custom name — the only input that changes the copy. Result: the standard demo runs with **zero** model calls and no spinner.

**2. Keep the prewarm.** `prewarmDefaultCustomer()` stays on dashboard mount so all three personalization tabs are ready before the user gets there. With snapshots it becomes a free, instant store hydration for the default bank. In custom-bank mode it still fires the live pipeline on mount, exactly as today — just once per customer/bank, since results are then cached (step 5) instead of re-run on each load.

**3. Generate per surface on demand, prewarm everything.** Give `generatePersonalizedExperience` a `need: "offers" | "cards" | "all"` argument. The prewarm uses `all` (all three tabs are needed); an on-demand generation triggered by opening a single tab requests only what that surface renders, so a cache miss on the Rewards tab doesn't pay for product cards.


**4. Trim the two functions for the custom-bank path.**
- `generate-product-cards` uses only `life_events[0]`, `persona_rollups[0]`, `financial_signals[0]` (with `[1]` fallbacks), yet serializes every rollup plus 8 pillars — that is its 4.3K input. Send only the slots it can use, and move it to `gemini-3.5-flash`; three short cards do not need the pro model.
- `generate-next-offers` caps every family at 1 group already; move the financial-signal call to `gemini-3.5-flash` too, prompt rules unchanged, and skip any family whose list is empty.

**5. Persist live results across reloads** (custom-bank mode only): sessionStorage-backed store keyed by customer id + bank name, cleared by the existing `clearPersonalizationResults()` on bank change.

## Expected result

| Scenario | Today | After |
|---|---|---|
| Load `/bankdemo`, never open personalization | 4 calls, ~0.14 cr | 0 |
| Open a personalization tab, default bank | 4 calls, ~25s wait | 0 calls, instant |
| Custom bank name, one tab | 4 calls | 1–3 calls, ~half the credits |

## Technical notes

- New `src/lib/personalizationSnapshots.ts`: `Record<customerId, { offers, productCards }>`, produced by running the current pipeline once per customer and pasting the JSON. Types reuse `RollupOfferGroup` and `ProductCard`.
- `src/lib/personalizationResultStore.ts`: snapshot lookup first; live path only when `getBankPromptContext()` is non-null; sessionStorage persistence for the live path.
- `src/lib/personalizationGeneration.ts`: add `need`; conditionally build each `functions.invoke`.
- `src/components/tepilot/insights/CustomerMockupPanel.tsx`: derive `need` from `surface`.
- `src/components/tepilot/insights/AnalyticsContainer.tsx`: drop the prewarm effect.
- `supabase/functions/generate-product-cards/index.ts`: slice inputs to the used slots; model → `google/gemini-3.5-flash`.
- `supabase/functions/generate-next-offers/index.ts`: financial-signal call model only.
- No changes to signal data, prompt rules, deal format, or any UI layout.
