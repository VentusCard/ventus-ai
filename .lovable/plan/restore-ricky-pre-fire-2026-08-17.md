# Restore Ricky pre-fire

## Current state (verified)

The LLM does **not** pre-fire for Ricky anymore.

- `personalizationResultStore.ts` still exports `prewarmDefaultCustomer()`, which would generate for the first example customer (`c1` = Ricky).
- Nothing in the codebase calls it — the only generation trigger left is `CustomerMockupPanel.tsx` line 44, which runs `ensurePersonalization(example.id)` **after** a customer is selected.
- Since the empty-state change, the selection starts as `null`, so no generation runs until the banker picks Ricky, and they then wait for the full round trip.

## Change

Call `prewarmDefaultCustomer()` once when the personalization workspace mounts, so Ricky's deals and product cards are generated in the background and are already cached when he is selected.

- Trigger it from `CustomerMockupPanel.tsx` in a mount-only effect (guarded internally by `hasPrewarmed`, so it fires once per session regardless of tab switching between Rewards / Product / Relationship).
- Keep the existing empty-state visuals unchanged: the left panel and mockup stay in the dashed placeholder state until a customer is selected — the prewarm only fills the cache.
- Keep the existing per-selection `ensurePersonalization` call; it is a no-op when the entry is already `running` or `ready`.

## Technical notes

- No changes to `personalizationGeneration.ts` or the edge functions.
- `prewarmDefaultCustomer` already de-dupes via the `hasPrewarmed` module flag and `inFlight` set, so React StrictMode double-mounts will not double-fire the model call.
