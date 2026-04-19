

## Goal

Generate up to 4 product cards (interleaved: life_event_1, behavioral_1, life_event_2, behavioral_2) and render them as a single auto-rotating slideshow in the phone mockup. Next-Offer tab stays unchanged.

## Changes

### 1. `supabase/functions/generate-product-cards/index.ts`
- Update prompt + tool schema: `cards` array `minItems: 1, maxItems: 4`.
- Instruct LLM to emit cards in strict order: `[life_event_1, behavioral_1, life_event_2, behavioral_2]`, skipping slots when source is missing.
- Behavioral `signal_label` = rollup `label` verbatim; life-event `signal_label` = `event_name` verbatim (so existing pill matching in `NextProductRationale` works unchanged).

### 2. `src/components/exec-demo/ProductCardsPhoneView.tsx`
- Replace stacked `.map` with a single embla carousel (one slide visible at a time).
- Auto-advance every 5s; dot indicators below; manual dot click jumps slide.
- Remove local `.sort()` — trust server-returned order.
- Keep all existing per-card visuals (icon, name, quote, benefits, est. value, CTA) and the `phone-card-reveal` animation per slide.

### 3. `src/components/exec-demo/NextProductRationale.tsx`
- No structural change. Already iterates `productCards` and resolves each to its source-of-truth pill — will naturally render up to 4 rationale rows.

### 4. Next-Offer tab
- Untouched. Existing two-pill-per-section format preserved.

## Verification

1. `/demo` → customer with ≥2 life events + ≥2 rollups → Next-Product shows 4 rationale rows in interleaved order.
2. Phone mockup auto-rotates through 4 slides (~5s) with dots; clicking a dot jumps.
3. Customer with only 1 life event → 3 slides total, no blanks.
4. Next-Offer tab unchanged.

