

## Revamp Consumer Rewards in /demo — Side-by-Side Phone Mockups

### Concept
Two phone mockups side-by-side (same pattern as Personalized UX/Engagement view) — each showing a compact consumer rewards app experience with personalized deals, AI messages, and local experiences. Like two people comparing their phones.

### Changes — `src/components/demo/DemoRewardsView.tsx`

Full rewrite. Replace the current flat deal-card columns with two `PhoneMockup` components mirroring the Engagement view's phone frame pattern.

#### Phone Mockup Contents (per customer)
1. **Header**: "Your Rewards" + lifestyle type banner (reuse Engagement pattern — gradient banner with color)
2. **Lifestyle pills**: Top 3 pillars as small emoji+label chips (from enriched data or precomputed)
3. **Deal cards** (scrollable list inside phone): Compact deal rows showing:
   - Merchant name + category icon + reward badge (e.g. "5% Back")
   - AI personalized message in italic (from precomputed `personalizedA/B` or fetched via edge function)
   - AI CTA button
4. **Local Experiences section**: Collapsible section at top with city name + category tabs (Entertainment/Dining/Arts/Shopping) — pulls from `localExperiences` prop or `useCityDeals` hook
5. **Personalization status footer**: "X deals personalized" or loading spinner

#### Data Flow
- Reuse existing `precomputedA/B` props for deals + personalization (already fetched by `useDemoEnrichment`)
- Derive `customerProfile` from enriched transactions using existing `deriveCustomerProfile` from `dealSelectionUtils`
- Local experiences: use `localExperiences` prop passed from parent, or call `useCityDeals` with customer's home city
- Static fallback (pre-enrichment): show customer's static `deals` array in phone frame

#### Layout
- `grid grid-cols-2 gap-4` with two `PhoneMockup` components
- Phone frame: browser dots bar + `yourbank.com/rewards` URL bar + white content area
- Max width `max-w-[380px]` per phone (same as Engagement)
- Internal scroll for deal list (`max-h-[400px] overflow-y-auto`)

### Files Modified
- `src/components/demo/DemoRewardsView.tsx` — full rewrite with phone mockup pattern

