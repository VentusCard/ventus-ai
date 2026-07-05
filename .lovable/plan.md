## Goal
In /bankdemo Analytics sidebar, collapse the two Rewards items — **Deal Management** and **Locational Perk Aggregation** — into a single entry called **Deals & Perks**, with two clearly-labeled sub-tabs that spell out the difference (shopping/merchant offers vs. city/location experiences).

## Changes

### 1. `src/components/tepilot/insights/AnalyticsContainer.tsx`
- In the Rewards nav group, remove the `location-experience` item and rename `deal-management` → `Deals & Perks` (keep `value: "deal-management"` for URL stability; icon stays `Package`, or switch to `Tags`).
- Keep the legacy `location-experience` value routable so old links still work — its `renderContent` case will render the new combined view with the Perks sub-tab pre-selected.
- Replace the `deal-management` / `location-experience` render cases with a single new component `<DealsAndPerksView defaultTab={...} />`.

### 2. New file: `src/components/tepilot/insights/DealsAndPerksView.tsx`
- Wraps a shadcn `Tabs` with two triggers:
  - **Shopping Deals** — "Merchant offers customers redeem when they shop (e.g. 10% off Nike)." Renders `<AvailableDealsGrid />`.
  - **Location Perks** — "City-based experiences and partner benefits tied to where the customer lives or travels (e.g. lounge access in NYC)." Renders `<LocationExperienceManager />`.
- Short `TabHeader` above the tabs titled **Deals & Perks** with a one-line subtitle contrasting the two ("Shopping deals are transactional discounts. Location perks are place-based experiences.").
- `defaultTab` prop selects which sub-tab is active on mount (`"shopping"` default; `"perks"` when arriving via legacy `location-experience` value).

### 3. Sub-tab copy inside each panel
- Add a slim descriptor strip at the top of each sub-tab body making the distinction unmistakable:
  - Shopping: "Merchant discounts and cashback offers customers activate and redeem at checkout."
  - Perks: "Curated local experiences, partner benefits, and city-specific privileges — not tied to a purchase."

## Out of scope
- No changes to `AvailableDealsGrid` or `LocationExperienceManager` internals.
- No data model, routing, or edge-function changes.
- No changes to floating chat, other tabs, or `/rewards-pipeline` standalone page.

## Verification
- `tsgo --noEmit` clean.
- Navigate /bankdemo → Rewards → **Deals & Perks**: default lands on Shopping Deals; switching to Location Perks renders the manager. Old `location-experience` tab value routes to the same view with Perks active.
