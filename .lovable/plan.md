
## Clarification
The user wants the fix scoped to the **Next-Conversation tab only** (the Wealth column's Concierge Touch / Standard Response pills) — NOT to modify `generate-product-cards` edge function or any other tab.

## Goal
Fix Concierge Touch / Standard Response so EVERY habit pill and EVERY risk pill produces appropriate actions, using only client-side resolution logic in `NextConversationRationale.tsx`. No edge function changes.

## Plan

### `src/components/exec-demo/NextConversationRationale.tsx`
Replace the card-matching block (lines ~402–422) with a 3-tier resolver:

1. **Tier 1 — exact/substring match** on `signal_label` (current behavior, kept).
2. **Tier 2 — token overlap scoring** of the pill label against each card's `signal_label + theme` (mirrors `NextProductRationale.tsx` lines 154–156). Drop stopwords; pick best card if score ≥ 1.
3. **Tier 3 — kind-aware fallback**:
   - `lifestyle` / `segment` pill → first card with `type === "behavioral"` (else first non-risk card).
   - `lifeEvent` pill → first card with `type === "life_event"`.
   - `risk` pill → first card with `type === "risk"`. If no risk card exists at all, return a **synthesized default risk action set** built from a small lookup keyed on the risk label/category:
     - Gambling / Sports Betting / Adult / Payday → standard: "Push: Set Merchant Block" (shield/slate), "Suppress Category Marketing" (bell/slate); wow: "Discreet Wellness Check-in" (user-check/rose), "Personalized Spending Limit" (lightbulb/indigo).
     - Suspicious International / OFAC / Currency → standard: "SMS Verification Sent" (bell/sky), "Card-Freeze Quick Action" (shield/slate); wow: "Concierge Fraud-Team Callback" (user-check/rose).
     - AML / Structuring / Layering → standard: "Flag for Compliance Review" (shield/slate), "KYC Refresh Sent" (bell/indigo); wow: "Private Compliance Liaison" (user-check/indigo).
     - Generic risk fallback → standard: "Account Review Flagged" (shield/slate); wow: "Discreet Advisor Outreach" (user-check/rose).

The synthesized actions render through the existing `actionPillFromGenerated` path so styling stays consistent.

## Verification
- Pick customer with 2+ risks → click each risk pill → both show distinct risk-appropriate pills (no empty state).
- Click any 3rd/4th lifestyle rollup that previously had no matching card → now shows behavioral-card actions (not life-event marketing).
- Life-event and segment pills → unchanged.

## Out of scope
- `generate-product-cards`, `generate-product-actions`, or any other edge function.
- Other tabs (Next-Offer, Next-Product).
- Phone mockup / Rewards / Offers UI.
