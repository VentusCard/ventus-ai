## Objective
Add sequential "processing" reveal animations to Section 2 (signal cards) and Section 3 (message previews) of the `/bankdemo` Campaign Builder so cards appear one-by-one after a product is picked, each with a brief processing state.

## Trigger
Animations replay whenever `product.id` changes (including first selection). Until a product is selected, the existing empty state stays.

## Section 2 — ExclusionFunnelSection
Five signal cards in `orderedFamilies`. Reveal sequentially in their sort order (useful → neutral → flag).

- Add `useEffect` keyed on `product.id` that resets a `revealedIndex` state and increments it via `setInterval` (~220ms cadence) until all 5 are revealed.
- Each card has 3 visual states:
  1. **Pending** (idx > revealedIndex): hidden (opacity 0).
  2. **Processing** (idx === revealedIndex): card visible with skeleton shimmer overlay (animated `bg-white/20` bar) and a small `Loader2` spinning icon in the relevance-badge spot; pointer-events disabled.
  3. **Ready** (idx < revealedIndex): final card as today, with `animate-fade-in` + slight `scale-in` on entrance.
- Final footer ("Final addressable audience") and the expanded panel only render once all 5 cards are ready.

## Section 3 — MessagePreviewsSection
Three message cards.

- Same `useEffect` pattern keyed on `product.id`, ~260ms cadence.
- Cards begin **pending** (hidden). When their turn arrives, show a **processing skeleton card** (same outer frame + left border color, but inner content replaced by 3 shimmering `bg-slate-100` bars to mimic subject / body / CTA). After ~500ms swap to the real card with `animate-fade-in`.
- Header chip ("3 angles") and intro paragraph render immediately.

## Visual details
- Reuse Tailwind `animate-fade-in` for entrance; add a lightweight `animate-pulse` on skeleton bars (Tailwind built-in).
- Shimmer color: `bg-slate-100` for Section 3 skeleton bars, `bg-white/30` overlay for Section 2 colored cards.
- No layout shift — skeleton cards occupy the same grid cell dimensions as final cards.

## Files
- `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx` — add reveal state, per-card processing variant, hide footer until ready.
- `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` — add reveal state, skeleton card variant.

No changes to data, types, or other files.