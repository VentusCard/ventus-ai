

## Goal

Within the Next-Product **rationale panel** (not the phone mockup), consolidate the up-to-4 stacked product card rows into **two slideshows**:
- **Life Events slideshow** — both pills shown side-by-side above; one product card visible at a time, auto-rotating.
- **Shopping Habits (Behavioral) slideshow** — both pills shown side-by-side above; one product card visible at a time, auto-rotating.

## Changes

### `src/components/exec-demo/NextProductRationale.tsx`
- Split `productCards` into two groups: `lifeEventCards` (type !== "behavioral") and `behavioralCards` (type === "behavioral"), preserving server interleaved order.
- For each group, pre-compute the resolved pill data (label, count, spend, color, click handler) per card — extract the existing per-card resolution logic (lines 168–260) into a helper so it can be reused for both pill-row rendering and slide rendering.
- Render two new `GroupSlideshow` sections (Life Events first, Shopping Habits second). Each section contains:
  - **Pill row** — render *both* resolved pills side-by-side at the top (always visible, both clickable to highlight transactions). Active slide's pill gets the existing scale/glow active treatment; the other pill stays inactive but clickable.
  - **Carousel** — single product card visible, using `embla-carousel-react` (already in project). Auto-advance every 5s, pause briefly on hover. Add small dot indicators below the card; clicking a dot or a pill jumps to that slide.
  - When clicking a pill, also advance the carousel to that card (so pill + visible slide stay in sync).
- Single-card group: render the one pill + static card (no carousel chrome / dots).
- Empty group: skip the section entirely.
- Keep the existing top-of-panel `CurrentHoldingsPills` and `RecommendedProductsPills` unchanged.
- Preserve all existing per-card visuals: product name, quote, action pills (Standard Response / Concierge Touch rows, dynamic + fallback), `exec-product-reveal` animation, color resolution, `onTriggerPillClick` behavior.

### Out of scope
- `ProductCardsPhoneView.tsx` — already a slideshow, untouched.
- Edge function `generate-product-cards` — order/structure unchanged.
- Next-Offer tab — untouched.
- Top behavioral/life-event pills in the main intel panel — untouched.

## Verification

1. `/demo` → Next-Product tab with ≥2 life events + ≥2 behavioral cards → see two stacked sections: "Life Events" slideshow (2 pills + 1 visible card rotating) and "Shopping Habits" slideshow (2 pills + 1 visible card rotating).
2. Each slideshow auto-advances every 5s; clicking a pill or dot jumps to that card and updates the active pill styling.
3. Clicking either pill still highlights the matching transactions in the left panel.
4. Customer with only 1 life event → Life Events section shows a single static pill + card (no carousel dots).
5. Phone mockup and Next-Offer tab are unchanged.

