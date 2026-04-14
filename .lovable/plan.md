

## Plan: Horizontal Square Deal Cards per Rollup

### Current State
Each rollup is a full-width card with a rotating carousel showing one deal at a time. User wants all deals visible simultaneously as square cards stacked horizontally within each rollup section.

### Changes

**`src/components/exec-demo/NextOfferRationale.tsx`** — Replace carousel with horizontal scrollable row of square cards:

- Remove the carousel logic (auto-rotate interval, prev/next buttons, dot indicators, `current` state)
- Replace with a horizontally scrollable `flex` row of compact square-ish deal cards (~110px wide)
- Each deal card is a small square tile showing: merchant name (bold), reward value badge, short message (2 lines max), signal indicator (small dot or icon), and CTA
- The rollup header (pill + suppressed pills) stays above the row
- Use `overflow-x-auto` with hidden scrollbar for clean horizontal scroll
- Cards use `shrink-0` so they don't compress

Layout per rollup:
```text
✦ Weekend Foodie  ✓ Ski Pass
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Merchant │ │ Merchant │ │ Merchant │ │ Merchant │
│ 15% Off  │ │ 20% Off  │ │ $10 Off  │ │ 3x Pts   │
│ "Short   │ │ "Short   │ │ "Short   │ │ "Short   │
│  msg..."  │ │  msg..."  │ │  msg..."  │ │  msg..."  │
│ ▲ Boost  │ │ — Neutral│ │ — Neutral│ │ ▲ Boost  │
│ [CTA]    │ │ [CTA]    │ │ [CTA]    │ │ [CTA]    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### No other files change
Same data structure, same edge function, same parent components.

