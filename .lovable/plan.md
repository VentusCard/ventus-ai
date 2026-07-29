## Redo `CampaignStudioPreview.tsx`

The left-side signal builder (Life Events, Spending Habits, Financial Signals, Demographics, Age, Income) is scrapped. The panel becomes a focused, single-story showcase of the **Cash Rewards 3-2-1 card** and how Ventus turns one product into segmented, personalized outreach.

### New layout (single card, no split)

```text
┌─────────────────────────────────────────────────────────────┐
│  ● Campaign Studio · Powered by Ventus         54,910 reach │
├─────────────────────────────────────────────────────────────┤
│  THE PRODUCT                                                │
│  Cash Rewards Card — 3% top category · 2% second · 1% rest  │
│  $0 annual fee · $200 welcome bonus                         │
├─────────────────────────────────────────────────────────────┤
│  ONE PRODUCT · THREE SEGMENTS                               │
│  [Dining-led] [Grocery-led] [Commuter]   ← segment tabs     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Segment chip · 18,420 reachable · Email/Push/In-App  │  │
│  │ Subject: "Your dining habit could earn you $237..."   │  │
│  │ Body preview...                                       │  │
│  │ Value math chip: ~$280/mo dining + ~$650/mo grocery   │  │
│  │ 3% category: Dining · 2% category: Grocery            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### What changes

1. **Delete the entire left column** — remove Life Events, Spending Habits, Financial Signals, Demographics, Age and Income pickers, plus the `estimateStudioAudienceSize` call and all related state.
2. **Product header** becomes a full-width band at the top (not a right-column card).
3. **Segment selector**: replace the "Generate" button with 3 segment tabs (Dining-led / Grocery-led / Commuter). Clicking a tab swaps the visible email draft with a smooth fade.
4. **Segment count strip**: a small row below the tabs shows all three reach counts so the "segment of one" story is visible at a glance (e.g. `Dining 18.4k · Grocery 24.3k · Commuter 12.2k · Total 54.9k`).
5. **Email draft card** (single, larger): sender line ("Ventus AI Coworker · draft"), subject, body, value-math chip, and a "3% / 2%" mechanic row showing which categories map to that segment. Channel chips stay.
6. **Auto-rotate**: the segment tabs auto-advance every ~5s (like `CoworkerEmailReel`), with pause on hover. Manual click pauses rotation.
7. Keep the light-theme styling, `Manrope`, no dark utilities, no brand names.

### Files touched

- `src/components/solutions/CampaignStudioPreview.tsx` — full rewrite along the lines above.

No other files change. No routing, no data-layer changes.