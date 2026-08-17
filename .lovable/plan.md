# Pre-fire personalization generation on /bankdemo load

Today the offers/product-card generation for an example customer only fires when that customer is first selected in a Personalization tab, so the first selection shows a loading state. This change warms all five example customers as soon as /bankdemo mounts.

## Behavior

- On mount of the dashboard container, kick off generation for the first example customer only (c1 / Sarah Mitchell).
- The call fires once per session and is a no-op if that customer is already ready or in flight.
- Result lands in the existing per-customer session cache, so opening Personalized Deals / Product / Relationship for the default customer shows the generated experience instantly with no loading state.
- Existing behavior is preserved: selecting any other customer still triggers its own generation, with failures falling back to the static demo content.

## Technical notes

- `src/lib/personalizationResultStore.ts`: add `prewarmDefaultCustomer()` that calls `ensurePersonalization` for the first `EXAMPLE_CUSTOMERS` entry; guard with a module-level `hasPrewarmed` flag so it runs once per session.
- `src/components/tepilot/insights/AnalyticsContainer.tsx`: call it from a mount `useEffect`.
- No edge-function, prompt, or UI-layout changes.

## Note

This makes /bankdemo fire AI calls on page load again (10 calls total: offers + product cards per customer), reversing the earlier "no model calls on /bankdemo load" rule — intentional per this request.
