# Merge Next-Deal Intelligence, Deals & Perks, and Gamification into "Personalized Deals"

## Goal
Consolidate the three separate `/bankdemo` sidebar items — Next-Deal Intelligence, Deals & Perks, and Gamification — into a single tab called **Personalized Deals** with three distinct sections.

## Current State
- `AnalyticsContainer.tsx` lists three separate items under "Personalization Orchestration":
  - `rewards-intelligence` → `RewardsAnalyticsDashboard`
  - `deal-management` → `DealsAndPerksView`
  - `gamification` → `GamificationManagement`
- Several other files reference these tab values:
  - `VentusAIWelcomeView.tsx` (nav cards and module context)
  - `VentusAIChatPanel.tsx` / `ventusAiTabContext.ts` (chat context)
  - `DemoDetailOverlay.tsx` (demo node → tab mapping)

## Changes
1. **Create `PersonalizedDealsView.tsx`**
   - Compose the three existing components as vertical sections:
     1. Next-Deal Intelligence (`RewardsAnalyticsDashboard`)
     2. Deals & Perks (`DealsAndPerksView`)
     3. Gamification (`GamificationManagement`)
   - Add a single page header for "Personalized Deals".
   - Optionally add section anchors and a small in-page sub-nav for quick jumps.

2. **Update `AnalyticsContainer.tsx`**
   - Add `personalized-deals` to the `TabValue` union.
   - Replace the three sidebar items with one item: `{ value: "personalized-deals", label: "Personalized Deals", icon: Sparkles }`.
   - Route `personalized-deals` to `<PersonalizedDealsView />`.
   - Keep the old tab values (`rewards-intelligence`, `deal-management`, `gamification`) in `validTabs` so existing links/deep-links don't break; route them to `<PersonalizedDealsView />` as well.

3. **Update `VentusAIWelcomeView.tsx`**
   - Update its local `TabValue` type to include `personalized-deals` and remove the three old values.
   - Replace the three separate nav cards with one "Personalized Deals" card.
   - Consolidate the three module descriptions into one.

4. **Update chat context**
   - In `ventusAiTabContext.ts`, create a single `personalized-deals` context that covers all three former areas.
   - Update `VentusAIChatPanel.tsx` module descriptions if they duplicate the context.

5. **Update `DemoDetailOverlay.tsx`**
   - Remap `travel` and `dealPersonalization` demo nodes to `personalized-deals`.

6. **Verify**
   - Run TypeScript typecheck.
   - Confirm in the preview that the sidebar shows "Personalized Deals" and the page renders all three sections.

## Risks
- The three existing views each have their own headers and filters; stacking them may feel visually noisy. The new parent view may need a lighter section treatment or collapsed-by-default cards.
- `DealsAndPerksView` uses its own internal `Tabs` for Shopping Deals vs Location Perks; that nested tab interface remains as one of the three sections.
