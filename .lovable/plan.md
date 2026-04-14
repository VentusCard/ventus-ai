

## Plan: Collection Cards with Rotating Messages in Phone Rewards Tab

### Goal
Replace the current per-rollup layout (pill + hero card + grid of deals) with a **collection card** design. Each rollup becomes a visually rich collection card that auto-rotates, showing a curated message (e.g., "Travel smarter and with style with new gears and perks") and the deals grouped under it.

### Changes

**`src/components/exec-demo/GeneratedOffersPhoneView.tsx`** — Full rewrite:

- Replace the current layout with a **single rotating collection card** that cycles through rollup groups every ~4 seconds
- Each collection card shows:
  - A short lifestyle-aligned headline message (derived from the rollup name + deals context, e.g., "Travel smarter with new gear and perks")
  - The rollup pill badge
  - A horizontal row or compact grid of deal tiles (merchant, reward value, CTA)
  - Dot indicators at the bottom showing which collection is active
- Auto-rotation with smooth crossfade/slide transition between collections
- Tap on dots to jump to a specific collection

**`supabase/functions/generate-next-offers/index.ts`** — Add a `collectionMessage` field per rollup group:

- Update the prompt to generate a short, inspiring collection tagline per rollup (8-15 words, lifestyle-focused)
- Add `collectionMessage` to the rollup group schema (e.g., "Travel smarter and in style with new gear and perks")
- This message displays as the headline on each collection card

**`src/components/exec-demo/NextOfferRationale.tsx`** — Update the `RollupOfferGroup` interface:

- Add `collectionMessage?: string` to the type so it flows through

### Visual Layout (per collection card)

```text
┌─────────────────────────────────┐
│  ✦ Frequent Traveler            │
│                                 │
│  "Travel smarter and in style   │
│   with new gear and perks"      │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Away │ │Bose │ │TSA  │      │
│  │15%  │ │$40  │ │Free │      │
│  │[CTA]│ │[CTA]│ │[CTA]│      │
│  └─────┘ └─────┘ └─────┘      │
│                                 │
│         ● ○ ○                   │
└─────────────────────────────────┘
```

### No other files change
Parent components pass the same `generatedOffers` array — no structural changes needed.

