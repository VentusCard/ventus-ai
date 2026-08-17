# Pre-fire personalization generation on /bankdemo load

Today the offers/product-card generation for an example customer only fires when that customer is first selected in a Personalization tab, so the first selection shows a loading state. This change warms all five example customers as soon as /bankdemo mounts.

## Behavior

- On mount of the dashboard container, kick off generation for all 5 example customers (c1–c5).
- Requests are staggered slightly (sequential/small concurrency) so five parallel pairs of calls don't hit the gateway rate limit at once; the currently selected customer goes first.
- Results land in the existing per-customer session cache, so opening Personalized Deals / Product / Relationship shows the generated experience instantly with no loading state.
- Existing behavior is preserved: selection still calls the same warm-up entry point, which is a no-op when a customer is already ready or in flight, and failures still fall back to the static demo content.

## Technical notes

- `src/lib/personalizationResultStore.ts`: add `prewarmAllPersonalizations()` that iterates `EXAMPLE_CUSTOMERS` and calls the existing `ensurePersonalization` with a small delay between each; guard with a module-level `hasPrewarmed` flag so it runs once per session.
- `src/components/tepilot/insights/AnalyticsContainer.tsx`: call it from a mount `useEffect`.
- No edge-function, prompt, or UI-layout changes.

## Note

This makes /bankdemo fire AI calls on page load again (10 calls total: offers + product cards per customer), reversing the earlier "no model calls on /bankdemo load" rule — intentional per this request.
