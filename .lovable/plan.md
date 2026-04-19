

## Goal

In the Next-Product tab, consolidate the 4 product cards in the phone mockup into **2 slideshow cards** grouped by source type:
- **Slideshow 1: Life Events** — slides through the up-to-2 life-event product cards, with 2 pills above showing the source life events.
- **Slideshow 2: Shopping Habits** — slides through the up-to-2 behavioral product cards, with 2 pills above showing the source personas.

Each slideshow has its own dot indicators and auto-rotates independently. Pills above each slideshow mirror the exact source-of-truth labels (life event names / persona ✦ pills) and the active pill highlights in sync with the active slide.

## Changes

### 1. `src/components/exec-demo/ProductCardsPhoneView.tsx`
- Split incoming `cards` into two arrays by `card.type`: `lifeEventCards` and `behavioralCards`.
- Render two stacked sections (in order: Life Events first, then Shopping Habits — matching the interleaved generation priority):
  - Section header label ("Life Events" / "Shopping Habits") — small uppercase slate label.
  - **Pill row** above each carousel: 2 pills max, one per source card. Active pill = active slide; clicking a pill jumps the carousel to that slide.
    - Life-event pills: amber styling matching `LifeEventChip` in `ExecDemoIntelPanel`.
    - Behavioral pills: ✦ glyph + theme color matching `PillarRollupChip`.
  - Embla carousel below pills with the existing card visual; auto-advance every 5s; dot indicators below the card.
- Hide a section entirely if it has 0 cards.
- Keep the existing `THEME_STYLES` / `THEME_BENEFITS` / `THEME_VALUE` maps, `phone-card-reveal` animation, and disclaimer footer.
- Two independent embla instances (one per section), each with their own `selectedIndex` state and auto-advance interval.

### 2. `src/components/exec-demo/ExecDemoPhoneView.tsx`
- No structural change — still passes `productCards` through. May pass `pillarRollups` and `detectedLifeEvents` down so pill labels/colors can be resolved exactly (same matching logic already used in `NextProductRationale`).

### 3. Out of scope
- Edge function (`generate-product-cards`) — unchanged. Still emits up to 4 cards in interleaved order; the client now groups them.
- `NextProductRationale` panel — unchanged.
- Next-Offer tab — unchanged.

## Verification

1. `/demo` → customer with 2 life events + 2 behavioral rollups → phone shows 2 stacked slideshows: top one cycles 2 life-event product cards with 2 amber pills above; bottom cycles 2 behavioral cards with 2 ✦ pills above.
2. Clicking a pill jumps its carousel to that slide; active pill stays in sync with auto-advance.
3. Customer with only 1 life event → top section shows 1 pill + 1 static card (no rotation); bottom section unaffected.
4. Customer with 0 life events → only the Shopping Habits section renders.
5. Pill labels/colors exactly match the corresponding pills in `ExecDemoIntelPanel` (amber life-event chips, ✦ persona chips).

