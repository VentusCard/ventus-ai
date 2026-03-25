

## Make Deal CTAs Lifestyle-Driven

### Problem
Current CTA examples ("Shop Now", "Claim Offer", "Get Cashback") are generic retail actions. The user wants CTAs that feel like the deal is **helping the customer live their lifestyle** — not just transacting.

### Fix — `supabase/functions/deal-personalization/index.ts`

Update the CTA guidance section (lines 48-50) to replace generic retail CTAs with lifestyle-driven ones:

**Before:**
```
Good: "Shop Now", "Claim Offer", "Get Cashback", "Redeem Now", "Start Earning", "Grab Deal", "Save Now"
```

**After — lifestyle-driven CTAs tied to the customer's signals:**
```
CTAs should feel lifestyle-driven — like the deal supports how the customer already lives.
Good: "Fuel Your Passion", "Treat the Family", "Elevate Your Style", "Power Your Routine", "Keep Exploring", "Level Up Game Day", "Upgrade Date Night"
Bad: "Shop Now", "Claim Offer", "Get Cashback" (too transactional), "Request Access", "Schedule Consultation" (banking products)
```

Also update the examples table to show lifestyle CTAs:

| Context | Merchant | CTA |
|---|---|---|
| Coffee lover | Starbucks | "Fuel Your Mornings" |
| Fitness enthusiast | Lululemon | "Power Your Workout" |
| Parent + Dining out | DoorDash | "Simplify Family Night" |
| Home cook | Williams-Sonoma | "Elevate Your Kitchen" |
| Traveler | Delta | "Keep Exploring" |

### What stays the same
- Message copy rules (short, reward-focused, privacy-safe)
- Everything else in the edge function

