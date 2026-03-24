

## Redesign Beat 5 — Signal Activation Layout & Content

Rework the Beat 5 section (lines 476–654) with these changes:

### Layout: Signal + Demographics at top-left, three vertical cards below

**Phase 0 — Signal floats to top-left + demographics fade in:**
- Remove the centered column layout. Instead, position the "Expecting a Baby" badge at the top-left with a smooth upward/left animation (CSS transition on mount).
- Demographics card appears below/beside it with anonymous data: **Age 32 · HHI $145K · ZIP 60614 · Married** (no name — keep it anonymous per user request).
- Keep the "+" merge connector between signal and demographics.

**Phase 1+ — Three vertically stacked cards (not 3-column grid):**
- Change from `grid grid-cols-3` to a vertical stack (`flex flex-col gap-4`), full width.
- Order: **Personalized Rewards**, **Personalized Relationship**, **Analytics Signal**.

### Content updates:

**Personalized Rewards (Phase 2 expand):**
- Replace current items with baby-specific, location-aware examples:
  - "Buy Buy Baby — 15% off nursery furniture (2.3 mi away)"
  - "Prenatal wellness package at Northwestern Medicine"  
  - "Baby gear trade-in program — local Chicago partner"
  - "Upsell: Family protection insurance bundle"

**Personalized Relationship (Phase 3 expand):**
- Keep current content (wealth manager alert, automated prep, next-step recommendations) — user said it looks fine.

**Analytics Signal:**
- Keep as static card, no changes needed.

### File: `src/components/demo/DemoPasswordGate.tsx`
- Lines 476–654: Rework Beat 5 JSX
- Demographics: Remove "Sarah M." name, use anonymous format: "Age 32 · HHI $145K · ZIP 60614 · Married"
- Layout: Signal badge aligned top-left with `items-start` instead of `items-center`
- Cards: Vertical stack instead of horizontal grid

