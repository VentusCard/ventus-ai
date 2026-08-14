# Rewrite Intelligence Delivery Destination Subtext

## Goal
Replace the overly specific insight bullets in the Intelligence delivery destinations with descriptive, type-focused subtext that explains what each banking team receives from Ventus AI Coworker.

## Current state
In `src/components/tepilot/coworker-inbox/coworkerInboxView.tsx`, each `TeamDestinationSliver` displays the first item from `team.insights` as its subtext. The data lives in `src/components/tepilot/coworker-inbox/coworkerInboxData.ts` under `TEAM_DESTINATIONS`. Current first insights include exact figures like "HNW life-event volume +18% WoW" and "$47M at-risk AUM", which the user finds too specific.

## Proposed change
1. Rewrite the first `insights` string for each of the six `TEAM_DESTINATIONS` entries to describe the insight category rather than a specific statistic.
2. Keep the language aligned with the team's role and email type.
3. Retain the second insight as a concrete-but-not-numeric example, or remove it if it adds specificity.

### Example direction
- Bank Leadership: "Weekly pulse summarizing major trends, key takeaways and strategic opportunities across the bank."
- Product & Growth: "Daily brief on product-fit gaps and cross-sell opportunities surfaced from behavioral signals."
- Risk & Compliance: "Alert stream for outbound-transfer clusters, vulnerability indicators, and advisor-inactivity flags."
- Rewards & Deals: "Daily brief on merchant partnership opportunities and reward-redemption intent by segment."
- Relationship Managers: "Signal brief highlighting client life events, liquidity moments, and recommended next outreach."
- Marketing / Campaign Ops: "Campaign brief with segment-of-one audiences and pre-drafted personalization copy."

## Files to modify
- `src/components/tepilot/coworker-inbox/coworkerInboxData.ts`

## Out of scope
- No changes to the sliver layout, KPIs, or capability tiles.
- No changes to the `TeamDestination` interface.
