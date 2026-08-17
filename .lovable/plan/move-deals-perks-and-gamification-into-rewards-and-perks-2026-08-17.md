# Move Deals & Perks and Gamification into Rewards and Perks

## What changes

The "Rewards and Perks" tab (Growth Opportunities) becomes the single home for merchant/reward program operations. Two sub-tabs move there from "Personalized Deals":

- Deals & Perks
- Gamification

### Rewards and Perks — new sub-tab order

1. National Partners
2. Local Partners
3. Deals & Perks (moved)
4. Gamification (moved)
5. Behavioral Bridges

### Personalized Deals — remaining sub-tabs

1. Customer View (stays default)
2. Next-Deal Intelligence

Header subtitle/copy on both tabs is adjusted so each describes what it now contains: Personalized Deals stays focused on customer-facing deal intelligence; Rewards and Perks covers partner planning plus the deal/perk catalog and gamified engagement.

## Technical details

- `src/components/tepilot/insights/PersonalizedDealsView.tsx`: remove the `deals` and `gamification` entries from `TABS` and drop their render branches plus the now-unused `DealsAndPerksView` / `GamificationManagement` imports.
- `src/components/tepilot/insights/MerchantPartnershipsView.tsx`: add `deals` and `gamification` items to the `SubTabBar` (positioned before Behavioral Bridges) and render `<DealsAndPerksView defaultTab="shopping" />` and `<GamificationManagement hideHeader />` inside the same bordered white card wrapper used today in Personalized Deals.
- No changes to sidebar nav values or routing; both tabs keep their existing `TabValue`s so deep links (`personalized-deals`, `gamification`, `deal-management`, `growth-merchant-partnerships`) continue to resolve.
