

## Refocus Category Extension Data: Merchant Deals Only

### What Changes

**Remove** life-event-driven and financial product entries from `categoryExtensionData.ts`:
- `newparents-lifeinsurance` (life insurance — financial product)
- `newparents-homesecurity` (keep — it's Ring/SimpliSafe, a real merchant deal)
- `newparents-529` (529 savings plans — financial product)
- `petowners-insurance` (pet insurance — financial product)
- `travelers-insurance` (travel insurance — financial product)

**Add** new merchant deal opportunities including:
1. **Green Juices / Supplements for Wellness + Sports crossover** — AG1 (Athletic Greens), Live It Up, Pressed Juicery, Daily Harvest. Behavioral signal: high wellness + high sports spending. Include population size, avg purchase ($65-85/order), conversion data.
2. **Yoga/Pilates enthusiasts → Lululemon / Alo Yoga** — apparel cross-sell from studio memberships
3. **Coffee connoisseurs → Fellow / Breville espresso** — high-frequency specialty coffee shop visitors
4. **Dog owners → BarkBox / Chewy subscriptions** — replace pet insurance with actual merchant deals
5. **Gamers → Secretlab chairs** (already exists, keep)
6. **Family travelers → Disney+ / Universal tickets** — replace 529 plans with real entertainment merchant deals

**Update** `CategoryExtensionOpportunities.tsx` pillar filters if any new pillars are introduced (likely not needed — all fit existing pillars).

### Files Changed
1. **`src/lib/categoryExtensionData.ts`** — Remove 4 insurance/financial entries, add 4-5 new merchant deal entries with the same detailed data structure
2. **`src/components/tepilot/insights/CategoryExtensionOpportunities.tsx`** — Minor: remove "Financial & Aspirational" from pillar filters if no entries remain in that category

