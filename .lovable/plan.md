

## Plan: Group Deals by Rollup with Shorter Messages

### Changes

**1. Edge function `supabase/functions/generate-next-offers/index.ts`** — Restructure the prompt and output format:
- Instead of generating 4-6 flat deals, generate **3-5 deals per rollup pill** (behavioral cluster)
- Output shape changes to: `{ "rollupOffers": [ { "rollup": "Weekend Foodie", "pillar": "Food & Dining", "deals": [ { id, merchant, product, rewardValue, message, cta }, ... ] }, ... ] }`
- Message guidance changes to: **8-12 words max**, no demographic references (no occupation, family size, age), no over-explanation. Just a clean lifestyle-aligned sentence like "Upgrade your travels with sleek, durable luggage from Away"
- Remove `rationale`, `sourceRollup`, `isDiscovery` fields — they're no longer needed since deals are already grouped by rollup
- Remove the "discovery" deal concept (every deal belongs to a rollup)

**2. `src/components/exec-demo/NextOfferRationale.tsx`** — Redesign the UI to show grouped deals:
- Update the `GeneratedOffer` interface: remove `rationale`, `sourceRollup`, `isDiscovery`; add a grouped structure
- New layout: For each rollup, show the rollup pill as a section header, then render its 3-5 deal cards beneath it in a compact grid/list
- Each deal card shows: merchant name, product, reward value badge, short message, and CTA button
- Remove the "Why:" rationale line and the source rollup tag from each card
- Update the strategy header to reflect the new structure (e.g., "5 clusters → 18 personalized deals")

**3. `src/components/exec-demo/ExecDemoIntelPanel.tsx`** — Update the `GeneratedOffer` type import and any mapping of the response data to match the new grouped structure

**4. `src/components/exec-demo/GeneratedOffersPhoneView.tsx`** — Update to handle the new grouped data structure for the phone preview

### What stays the same
- The rollup pills at the top remain unchanged
- The heatmap/timeline above remains unchanged
- Loading skeleton stays the same
- All other tabs unaffected

