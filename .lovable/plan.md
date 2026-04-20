

## Goal
Make the offer details (headline, benefits, eligibility, CTA, CTA subtext) personalized per customer and come from the edge function instead of being derived from a heuristic switch in the front-end.

## Plan

### 1. `supabase/functions/generate-product-cards/index.ts`
Extend the tool schema for each card with five new required fields:
- `offer_headline` (string) — the bold offer line tied to the actual product (e.g. "Earn 2x miles on every purchase")
- `benefits` (array of 2-3 strings) — bullet points describing what's included
- `eligibility` (string) — one-line eligibility / approval note
- `cta` (string) — short, personalized button label that ties to the customer's signal (3-6 words)
- `cta_sub` (string) — small subtext under the CTA (e.g. "Decision in seconds")

Add prompt rules:
- CTA must be **personalized to the customer's life event or behavioral signal**, not generic ("Apply Now"). Examples by signal:
  - Tropical getaways → "Plan Your Next Escape"
  - College Preparation → "Start Their Tuition Fund"
  - Retirement Planning → "Build Your Next Chapter"
  - New Baby → "Prepare for the Milestone"
- Benefits should be specific to the actual BoA-style product
- Eligibility must reference the customer's relationship status when relevant ("Pre-approved", "Preferred Rewards eligible", etc.)
- Same privacy rules as existing prompt (no merchant names, no transaction counts)

### 2. `src/components/exec-demo/ProductCardsPhoneView.tsx` (type)
Add the five new optional fields to `ProductCard` type so both the rationale view and phone view can read them.

### 3. `src/components/exec-demo/NextProductRationale.tsx`
- Replace `deriveOfferDetails()` heuristic with a thin reader that:
  - Prefers `card.offer_headline / benefits / eligibility / cta / cta_sub` from the edge function
  - Falls back to the current heuristic only if any field is missing (safety net during the LLM transition)
- Remove the dead `ActionPillsRow` import path / props (already removed visually but still in props signature) — leave alone if cleanup is out of scope; just confirm.

### Out of scope
- No phone mockup CTA changes (separate component, separate behavior)
- No new tabs or layout changes

