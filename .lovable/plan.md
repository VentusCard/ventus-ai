## Goal

Make Section 1 (product picker + mechanics) noticeably denser without losing the "all 44 products visible / one product detailed" structure.

## Current pain

- 2–3 col card grid with 28px icon + wrapping name = ~52px per row × ~16 rows of cards = ~520px scroll area.
- Category headers eat another ~24px each (×5 categories).
- Detail panel is a fixed 400px column with generous internal padding.

## New layout

```text
┌──────────────────────────────────────────────────────────────────┐
│ Section 1 — header + sticky category tabs (Cards · Deposits ·   │
│            Lending · Wealth · Insurance · All)                  │
│ ┌────────────────────────┬──────────────────────────────────┐   │
│ │ Compact product list   │ Detail panel (sticky)            │   │
│ │  – 1-line rows         │  – Tighter header (icon inline   │   │
│ │  – icon · name · cat   │    with name, category as chip)  │   │
│ │  – tiny right-side     │  – Tagline + fee in one row      │   │
│ │    badge (penetration  │  – Rate card as compact 2-col    │   │
│ │    or audience)        │    table                         │   │
│ │  – selected row gets   │  – Features as inline · separated │   │
│ │    left bar + bg tint  │    bullets (not stacked list)    │   │
│ │                        │                                  │   │
│ │  ~28px row height      │                                  │   │
│ │  ~360px max-height     │                                  │   │
│ │  scroll                 │                                 │   │
│ └────────────────────────┴──────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Specific moves

1. **Replace card grid with a single-column dense list** (44 rows × ~28px each + 5 category dividers ≈ 1320px raw, but capped at 360px scroll → ~13 rows visible at once, half the current footprint).
2. **Category tabs above the list** — switch the view to a single category at a time (default `All`), or use them as quick-scroll anchors. Cuts visible rows further when filtered.
3. **Add a small search input** (top-right of the list) for finding a product fast across the 44 entries.
4. **Detail panel becomes denser**:
   - Header row: icon (24px) · name · category chip · audience badge — all one line.
   - Tagline + fee on one combined line.
   - Rate card: 2-column compact grid, no card-within-card border.
   - Features as 3–5 short lines, smaller leading.
5. **Drop the outer `max-h-[520px]`** — list scroll is now ~360px, freeing vertical space for sections 2 + 3.
6. Optional: collapsing category groups when `All` is selected (chevron toggles).

## Files

- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx` — full rewrite of the picker grid → list + tabs + search. Detail panel densified.
- No changes to `productCatalogExtras.ts`, `ExclusionFunnelSection`, `MessagePreviewsSection`, or `ProductCampaignBuilderView`.

## Non-goals

- No new data fields, no edge-function changes.
- Functionality stays identical: select a product → sections 2 + 3 update.
- Strict light theme preserved; no `dark:` utilities.
