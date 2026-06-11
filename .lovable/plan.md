## Section 3 — prominent left counter + fanned-deck slideshow

Rework Section 3's preview area in `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` so the position counter is the dominant left element and the campaigns appear as a fanned deck of cards behind the active one.

### New layout

```text
┌─ Section 3 header ──────────────────────────────────────────────────────────┐
│ [3] Micro-Segment Personalized Campaign Output                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐    ● Category stack                          [◀] [▶]  │
│  │ CAMPAIGN         │    ┌─────── active card (front) ───────────┐         │
│  │ 02 / 05          │    │  PLAY · anchor                         │   ┐ ┐  │
│  │ 548 total · logic│    │  Subject                               │   ┘ ┘  │
│  └──────────────────┘    │  Body…                                 │ fanned │
│                          │  [CTA]            ✨ why               │ behind │
│                          └────────────────────────────────────────┘        │
│                                                                             │
│  catalog total footer (unchanged)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Left counter block (prominent)

- New tall block, ~150px wide, white card with `border-l-4` colored to match the active campaign's family.
- Top: `CAMPAIGN` kicker (10px uppercase).
- Big numeric: `02 / 05` in a large mono/tabular numeric (~32-36px, slate-900, leading-tight).
- Bottom: `548 total · view logic` as a small `Popover` trigger (keeps the existing Variation Logic popover).
- Acts as the "more prominent" version of the counter.

### Right side — fanned deck

- Container is `relative` with fixed min-height (~280-300px), `overflow-hidden` on x-axis only so the fan sits within the section card.
- All 5 cards render absolutely positioned at the same top/left. Each non-active card gets a CSS transform layered behind based on its distance from the active index:
  - active: `translate(0,0) rotate(0) scale(1)` z-index 50, full opacity, shadow-md
  - +1 / -1 behind: `translate(±18px, 12px) rotate(±2.5deg) scale(0.97)` z-index 40, opacity 0.85
  - +2 / -2 behind: `translate(±34px, 22px) rotate(±5deg) scale(0.94)` z-index 30, opacity 0.65
- Cards keep the existing left-border family color and content (play/anchor pills, subject, body, CTA, why).
- The active card's family chip (`● Category stack` etc.) sits in a small bar above the deck, top-left of the right column.
- Arrows (`◀` / `▶`) sit top-right of the right column. Wrap-around through the 5 exemplars.
- Click any peeking card to bring it to the front.
- All transitions: `transition-all duration-300 ease-out`.

### Behavior

- `featuredIdx` state stays; arrows + clicks update it (wrap mod `shownCount`).
- Keyboard ← / → still pages the deck when the section has focus.
- The header's standalone Badge stays removed (counter lives in the new left block).
- The existing 5-card grid below is removed entirely.
- Catalog total footer line stays.

### Technical notes

- File touched: `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` only.
- Use the existing `ANCHOR_VISUAL` map (already has `border`, `dotBg`, `chipBg`, `chipBorder`, `chipText`, `label`).
- Stagger reveal stays — cards fade in one-by-one, but always render in their fanned position once revealed.
- No new packages; pure Tailwind + inline `style` for the per-card transform offsets.
- Light theme only (white bg, slate-200 borders), per project memory.

### Out of scope

- Drag/swipe gestures, autoplay, framer-motion.
- Paging across the full 548 bank — still only the 5 exemplars.
- Changes to `buildMessageCards`, the edge function, or Steps 1 / 2.