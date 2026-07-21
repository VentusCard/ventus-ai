## Goal

On the **Next-Offer** tab of `/bankdemo`, every generated deal should carry a **hyper-personalized value line** that uses the customer's own spend numbers (already available in `persona.pillarRollups` / `pillars`) to quantify the offer's payoff.

Examples of the target voice:
- Credit card / travel: *"3x points on travel ≈ $186 back on your ~$6.2k Hawaii trips this year."*
- Home loan (financial signal): *"−1.0% APR ≈ $2,750/yr saved per $500k of your mortgage."*
- Auto loan (financial signal): *"−1.25% APR ≈ ~$18/mo off your ~$685/mo VW Credit payment."*
- Behavioral (coffee runs): *"5% back at coffee shops ≈ $9/mo on your ~$180/mo Blue Bottle + Sightglass spend."*

Numbers must come from real inputs — never invented — and every deal must render one crisp value line under the existing message.

## Changes

### 1. `supabase/functions/generate-next-offers/index.ts`
- **Pass richer spend context to the LLM.** Extend `rollupList` and `lifeEventList` prompts with:
  - `totalSpend` and `totalCount` per rollup (already on the object, currently unused).
  - Top-merchant `$` breakdown when available (e.g. `Blue Bottle $92 · Sightglass $61`).
  - An `annualizedSpend` hint (roll `totalSpend` × months-of-data multiplier so the LLM has a clean yearly number to divide against).
- **Accept and forward `financialSignals`** in the request body. For each signal (auto loan, mortgage, student loan, lease, investment) pass label, `monthly_payment`, `balance`, `rate`, `renewal_window`. Add a third parallel task `financialSignalUserPrompt` that generates 1 rollup group per financial signal (5 deals) themed to that product family (refi, HELOC, IRA rollover, etc.).
- **Add `valueLine` to every deal** in the output schema (all three prompts — behavioral, life-event, financial-signal):
  - New required per-deal field `valueLine`: ≤ 18 words, MUST contain at least one `$` figure or `%` computed from the provided numbers.
  - New optional per-deal field `valueMath`: short parenthetical showing the calc (e.g. `"3% × $6,200 ≈ $186"`) — powers a tooltip.
  - Update the JSON shape example and hard-fail instructions: *"If you cannot ground a number in the input, write `valueLine: null` — never fabricate."*
- **Prompt guardrails for numbers:**
  - Only use `$` / `%` figures that appear in the input or are simple arithmetic on them (rate × spend, rate delta × balance, monthly × 12).
  - Round to friendly units ($5 for <$100, $10 for <$1k, $50 for ≥$1k, whole % only).
  - Never reference off-us balances that weren't passed in.
- **Model bump for math reliability:** switch `MODEL` from `google/gemini-3.5-flash` to `google/gemini-3.1-pro-preview` for the offer path (arithmetic grounding matters more than raw speed here). Keep `max_tokens: 8192`.

### 2. `src/pages/ExecDemoPage.tsx`
- In the `invoke("generate-next-offers", …)` call, add `financial_signals: synthesis?.financialSignals ?? []` and `months_of_data` (derived from the transaction date range already computed for the enrichment table) to the body.

### 3. `src/components/exec-demo/GeneratedOffersPhoneView.tsx` and `src/components/exec-demo/NextOfferRationale.tsx`
- Extend the `Deal` type with `valueLine?: string | null` and `valueMath?: string | null`.
- Render `valueLine` as a single-line accent under `message`, styled like existing `signalReason` but in slate-900 semibold with a subtle `$` glyph prefix. Hover shows `valueMath` in a tooltip.
- If `valueLine` is null, fall back to today's layout (no visual regression).

## Out of scope
- No changes to `synthesize-persona`, financial-signal detection, or the pill row.
- No changes to the retail-deal image system.
- The `generate-campaign-offers` function (used by the campaign studio, not the Next-Offer tab) is unchanged.

## Technical notes
- `pillarRollups[i].totalSpend` and `topMerchants` already exist server-side — we're just surfacing them in the prompt.
- `financialSignals` already flows through `ExecDemoPage` (used by `generate-product-cards`); reusing the same shape keeps the pipeline consistent.
- Adding `valueLine` as an optional field is backward-compatible — old cached responses render unchanged.
