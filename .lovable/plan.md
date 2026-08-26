# /bankdemo: which LLM calls fire, and which shouldn't

## What fires today

Confirmed by reading the code and the AI Gateway logs (every `/bankdemo` load shows the same cluster of 4–5 calls within ~25s of each other).

**Automatic on page load — nobody asked for it**
- `AnalyticsContainer.tsx` mount effect calls `prewarmDefaultCustomer()`, which runs `ensurePersonalization("c1")` (Ricky).
- That fans out into `generate-next-offers` (itself 3 parallel gateway calls: behavioral rollups, life events, financial signals) plus `generate-product-cards`.
- Cost per dashboard load: ~4 gateway requests, roughly 10–13K output tokens, ~0.14 credits, 15–25s each. This happens on every fresh load of `/bankdemo`, including loads where the banker never opens a Personalization tab.

**Automatic, but scoped to a tab the user opened**
- `CustomerMockupPanel` → `ensurePersonalization(customerId)` when a customer is selected. Correct: user-intent driven, cached per session.
- `TakeawayPanel` → `summarize-query-result` when a query result renders.
- `useCityDeals` → `local-experiences` on mount of whatever surface uses it.
- `DealActivationPreview` → `deal-personalization` auto-runs once deals + enriched transactions exist.
- `PersonalizationPreviewPanel` → `deal-personalization` on product/selection change.

**Only on explicit user action (correct as-is)**
- Ventus AI chat / consumer chat, `generate-analytics-query`, `generate-campaign-brief`, `parse-campaign-intent`, `send-feedback`, `send-follow-up-email`, `analyze-lifestyle-signals`, `detect-risk-transactions`, `synthesize-persona`, `generate-product-actions` (the last several are `/demo` and `/tepilot`, not `/bankdemo`).

## What to change

1. **Stop the blind prewarm.** Remove the `prewarmDefaultCustomer()` mount effect from `AnalyticsContainer.tsx`. Instead warm Ricky when the banker signals intent: on first hover/click of any of the three Personalization nav items, or when a Personalization tab mounts (`CustomerMockupPanel` already calls `ensurePersonalization`, so a hover-prewarm on the nav item is enough to keep the tab feeling instant). Net effect: zero LLM spend on a `/bankdemo` load that never reaches personalization; unchanged perceived speed when it does.
2. **Persist the cache across reloads.** Store `personalizationResultStore` entries in `sessionStorage` keyed by customer id + demo bank name, so a page refresh during a live demo replays cached content instead of re-firing 4 calls. Keep the existing `clearPersonalizationResults()` on bank-config change so renaming the bank still regenerates.
3. **Collapse the offers fan-out where it is redundant.** `generate-next-offers` runs three gateway calls; the financial-signal call runs on `gemini-3.1-pro-preview` and is the most expensive. Skip any of the three whose input list is empty rather than sending an empty-signal prompt.
4. **Guard the auto-runs that are not visible.** `DealActivationPreview` and `PersonalizationPreviewPanel` auto-personalize even when their panel is collapsed or off-screen; gate both on the panel actually being open.

## Technical notes

- `src/components/tepilot/insights/AnalyticsContainer.tsx`: delete the prewarm effect; add `onMouseEnter`/`onFocus` prewarm on the Personalization nav entries.
- `src/lib/personalizationResultStore.ts`: hydrate/persist `store` through `sessionStorage`; keep the `hasPrewarmed` one-shot guard for the new hover trigger.
- `supabase/functions/generate-next-offers/index.ts`: early-return each of the three copy calls when its signal list is empty. No prompt-rule, taxonomy, or output-shape changes.
- `DealActivationPreview.tsx` / `PersonalizationPreviewPanel.tsx`: add an `isOpen`/visibility condition to the auto-run effects.
- No UI redesign, no change to what content renders once generation completes.
