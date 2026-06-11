## Match the customer's anchor categories to the card's actual rate tiers

You're right — the copy should be smart enough to say *"3% on groceries, 2% on warehouse clubs"* when the anchor is `Groceries × Warehouse club` and the product is the 3/2/1 cashback card. Generic "earns the most where you spend" is lazy when the data to be specific is already in `MECHANICS_OVERRIDES`.

### Approach

All work stays in `src/components/tepilot/campaigns/sections/buildMessageCards.ts`.

1. **Pull mechanics for the product.** Import `getProductMechanics` from `productCatalogExtras` plus a small local `ProductCategory → FlowCategory` map (same 6 entries as `catalogProductAdapter`) so we don't introduce a cycle. Slug = `product.name` lowercased + hyphenated (same rule as `catalogProductId`).

2. **Split the anchor into its parts.** `splitAnchor("Groceries × Warehouse club")` → `["Groceries", "Warehouse club"]`. Works for single-part anchors too.

3. **Map each anchor part to the best-matching rate tier.** A keyword table covers the common category words:

   ```
   grocery   → matches tiers containing "grocery"
   warehouse → matches tiers containing "warehouse"
   dining    → "dining" | "restaurant"
   travel    → "travel" | "airfare" | "hotel"
   fuel/gas  → "fuel" | "gas" | "transit"
   streaming → "streaming"
   ```

   For each anchor part: find the rateTable row whose tier text contains the keyword. If none, fall back to the highest tier (treated as "chosen-category" earn). Returns `[{ part: "Groceries", rate: "3%" }, { part: "Warehouse club", rate: "2%" }]`.

4. **Build a "rate phrase" for STACK copy.** E.g. `"3% on groceries and 2% on warehouse clubs"`. If both parts resolve to the same tier (or product has only one tier), collapse to `"3% on groceries and warehouse clubs"`. If the card has a flat rate (1.5% everywhere), phrase as `"1.5% on everything, no categories to track"`.

5. **Rewrite the four templates** in `copyFor()` to use the resolved specifics (plus `fee` / a chosen feature line):

   - **STACK** — subject: `${ratePhrase} — on your two biggest categories`
     body: `Your spend in ${anchorProse} has been steady for a while. ${name} earns ${ratePhrase}, so the categories you already live in pay the most. ${feeLine}.`
     cta: `Make the switch` / `See how it adds up`

   - **LIFE_EVENT** — subject: `A good moment for ${lower}`
     body: `${anchor} usually reshuffles a few accounts. ${name} comes with ${keyFeature.toLowerCase()} and ${feeLine.toLowerCase()} — set it up once and it keeps pace with what just changed.`
     cta: `Turn it on` / `Open when you're ready`

   - **GOAL** — subject: `Quiet support for your ${anchorProse}`
     body: `The direction of your saving and spending lines up with a ${anchorProse}. ${name} adds ${keyFeature.toLowerCase()}, with ${feeLine.toLowerCase()} — progress compounds in the background.`
     cta: `Strengthen the plan` / `Keep it going`

   - **USAGE** — subject: `One small switch, more from ${lower}`
     body: `You already have ${lower}. The piece most people miss is ${keyFeature.toLowerCase()} — flip it on and ${ratePhrase ? `you start earning ${ratePhrase}` : `it starts pulling its weight`}, with nothing else to change.`
     cta: `Pick it back up` / `Turn it on`

6. **Graceful fallbacks** for deposits / insurance / digital (no rateTable): `ratePhrase` is `null` and the body leans on `tagline` + `keyFeature` so e.g. a high-yield savings card reads *"earns 4.25% APY on balances up to $25k, no monthly fee."* — still concrete, never generic.

### Result for the case you flagged

Product = Cashback 3/2/1, anchor = `Groceries × Warehouse club`:

> **3% on groceries and 2% on warehouse clubs — your two biggest categories**
> Your spend in groceries and warehouse clubs has been steady for a while. The Cashback (3/2/1) card earns 3% on groceries and 2% on warehouse clubs, so the categories you already live in pay the most. No annual fee.

### Out of scope

- `MESSAGE_OVERRIDES` path (separate, unchanged).
- New mechanics entries — the picker-slug audit already covers all 44 products.