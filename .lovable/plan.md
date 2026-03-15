

# Redesign "Personalized UX" with Real Enriched Data

## Overview
Replace the static phone mockup content with real data derived from the enrichment pipeline. Remove "For You" section, add achievement card and coaching tip card, all computed from real enriched transactions.

## Data Flow Change

Currently `DemoEngagementView` only receives `customerA`/`customerB` (static demo data). The overlay already has `enrichedA`/`enrichedB` (real enriched transactions from edge functions) but doesn't pass them to the engagement view.

**Wire enriched data through:**
1. `DemoDetailOverlay.tsx` — move `engagement` out of `SIMPLE_VIEW_MAP` and pass `enrichedA`/`enrichedB` to `DemoEngagementView`
2. `DemoEngagementView.tsx` — accept optional `enrichedA`/`enrichedB` props

## DemoEngagementView Redesign

### Props
```ts
interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  enrichedA?: EnrichedTransaction[];
  enrichedB?: EnrichedTransaction[];
}
```

### PhoneMockup changes
- Accept `enrichedTransactions?: EnrichedTransaction[]`
- **Remove** the "For You" deals section entirely
- **Increase size**: `max-w-[280px]` → `max-w-[340px]`
- **Lifestyle Spending**: Compute from real enriched transactions (aggregate by pillar), bigger cards with thicker progress bars
- **Achievement Card**: Use `calculateAchievements()` and `calculateHealthScore()` from `achievementEngine.ts` on real enriched data. Show the health score, level badge, and the first in-progress or unlocked achievement with its progress bar
- **Coaching Tip Card**: Use `generateFinancialTip()` from `wellnessIntelligenceEngine.ts` on real enriched data. Show the tip message, category badge, icon, potential savings, and two mini response buttons ("Got it" / "Need help") — visual only, no chat functionality in the mockup

### Fallback
When `enrichedTransactions` is empty/undefined, fall back to the existing static pillar data from `customer.topPillars` (current behavior minus the deals section).

## Files to Edit
1. **`src/components/demo/DemoDetailOverlay.tsx`** — Remove `engagement` from `SIMPLE_VIEW_MAP`, add explicit case in `renderContent()` passing enriched data
2. **`src/components/demo/DemoEngagementView.tsx`** — Full rewrite of PhoneMockup content

## What stays the same
- Phone frame / browser bar styling (just bigger)
- Greeting + lifestyle banner
- Side-by-side two-column layout
- Color scheme (blue for A, green for B)

