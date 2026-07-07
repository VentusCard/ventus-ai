## Finding
The car-loan-renewal signal IS included in the payload sent to `generate-product-cards` (via `life_events` array), but the edge-function prompt is hardcoded to build the Life Event card from `life_events[0]` only. Current merge order is:

```
[events[0] (detected), ...external, ...events.slice(1)]  // external at index 1+
```

So the car-loan signal is passed to the LLM but never selected as the primary Life Event card. Same for `fireNextOffers` (uses whichever event is at [0] as the lead).

## Fix
Reorder the merge in `fireLifeEventDetection` (`src/pages/ExecDemoPage.tsx` line 727) so external signals lead:

```ts
const merged: LifeEvent[] = [...external, ...events]
  .filter(Boolean)
  .slice(0, 3);
```

Rationale:
- External signals are high-confidence, forward-looking, and merchant-independent — the exact signal that should drive Next-Product.
- Car loan renewal (92%) becomes `life_events[0]` → LLM builds the primary product card from it (e.g. `<Bank> Auto Loan Refinance` or similar).
- Detected events still appear as pills (slots 1 and 2) and remain in the payload; the LLM still sees them.

No edge-function changes needed — the existing prompt reads `life_events[0]` and will now naturally pick up the external signal.

## Downstream verification
- Product cards: `fireProductCards(merged, ...)` — car loan drives Card 1.
- Product actions: `fireProductActions(cards, events, ...)` — receives merged events too.
- Next-Offer: `fireNextOffers(syn, pillars, merged)` — merged already passed.
- Pills UI: unchanged (renders `merged` in order — external will render first).

## Acceptance
- Car Loan Renewal pill appears as the first amber pill.
- Next-Product card #1 references auto loan refinance / new-auto pre-approval with the exact `signal_label = "Car Loan Renewal in ~2 Months"`.
- Clicking the pill in the Next-Product tab still filters to the matching card.
- Adding a second entry to `EXTERNAL_INTEL_SIGNALS` promotes that one too (external always leads).