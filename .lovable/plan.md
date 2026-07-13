## Goal

When a user searches inside the phone mockup on `/bankdemo`, the phone should visibly show matching deal cards. A query like `coffee machine` should not only show an AI reasoning chip, and it should not rely on loose matches like Starbucks unless there is a concrete product/accessory reason.

## What I will change

1. **Tighten search logic in the backend function**
   - Update `semantic-deal-search` so results are based on product intent:
     - direct sellers of the item
     - credible accessory/consumable sellers only when the reason is explicit
   - Remove the current broad “brand association” behavior that returns cafes/restaurants for appliance queries.
   - Replace the `coffee machine` example so it favors home/kitchen/general retail merchants and excludes Starbucks/Dunkin as default substitute-category matches.

2. **Fix the phone mockup display path**
   - The `/bankdemo` phone rewards view uses `GeneratedOffersPhoneView`, not `DemoRewardsView`.
   - Its search currently filters only the already-generated offer groups, so even if the search function returns valid catalog IDs, nothing appears unless those merchants already exist inside the generated campaign groups.
   - I’ll update this view so active search results can render catalog-backed deal cards directly in the phone, using the same merchant lookup and offer-card styling.

3. **Improve empty/loading states**
   - While searching: keep the loader clear.
   - If the search succeeds but no generated campaign group matches, show standalone catalog result cards instead of `No matching deals found`.
   - If there are truly no matches, keep the empty state.

4. **Validation**
   - Test `coffee machine` in the phone mockup.
   - Expected visible result cards: kitchen/home/general retailers such as Williams-Sonoma, Bed Bath & Beyond, Amazon, Target, Walmart, Costco, Best Buy, Dyson where available.
   - Expected not to appear by default: Starbucks, Dunkin, Chick-fil-A, streaming/services unrelated to product purchase intent.