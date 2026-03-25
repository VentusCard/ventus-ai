

## Fix Deal Personalization CTAs and Messages

### Problem
The tier-aware CTA system is designed for **financial products** (savings accounts, trusts, 529 plans) but is being applied to **retail cashback deals**. This produces absurd results like "Request Access" on a Williams-Sonoma 7% cashback offer, and overly flowery messages that don't match a simple retail deal.

The prompt has two conflicting CTA instructions:
- **Line 47-50**: Tier-aware CTAs like "Request Access", "Schedule Consultation" (designed for banking products)
- **Line 72**: Generic CTAs like "Claim Now", "Start Earning" (more appropriate for deals)

### Fix — `supabase/functions/deal-personalization/index.ts`

1. **Remove the tier-aware CTA section entirely** (lines 47-50) — these CTAs are for financial products, not retail deals
2. **Remove the tier-aware differentiation section** (lines 41-56) — the tier tone guidance ("exclusivity", "legacy", "white-glove service") produces nonsensical messaging for cashback offers at Target or Williams-Sonoma
3. **Replace with deal-appropriate CTA guidance**: CTAs should match the deal type — e.g., "Shop Now", "Claim Offer", "Start Saving", "Get Cashback", "Redeem Now"
4. **Simplify message guidance**: Keep messages short, practical, and tied to the actual reward — not aspirational fluff about "culinary masterpieces"
5. **Remove the generic CTA line** (line 72) and consolidate into one clear CTA section

### Also — `src/components/demo/DemoRewardsView.tsx`
- Add a CTA button to fallback deal cards with "View Deal" text
- Add `onClick` + toast to all CTA buttons for demo interactivity
- Add hover/active styles

