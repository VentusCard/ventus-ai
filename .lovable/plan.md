

## Goal
Make the "Concierge Touch" / "Standard Response" pills in the Wealth column of the Next-Conversation tab respond properly when a **risk signal pill** is selected — showing risk-appropriate concierge actions (wellness check-in, account controls, compliance escalation, fraud-team callback) instead of falling back to a generic life-event card's actions.

## Current behavior
- `generate-product-cards` only sees `life_events` + `persona_rollups` → never produces a card whose `signal_label` matches a risk label.
- In `NextConversationRationale.tsx` (lines 402–417), when a risk pill is selected, no card matches → falls back to `productCards[0]` → shows wrong/generic concierge pills.
- Risk flags ARE detected (`riskFlags` state) but are never fed into product-card / product-action generation.

## Plan

### 1. `supabase/functions/generate-product-cards/index.ts`
- Accept new optional input: `risk_flags` (array of `{ category_group, category_label, evidence_strings }`).
- Update prompt: if risk_flags present, append **one extra "RISK CARD"** at the end (so total cards can be up to 5):
  - `signal_label` = top risk's `category_label` verbatim (e.g. "Gambling", "Suspicious International", "Adult Content", "AML")
  - Card content is **non-marketing, wellness/safety-oriented**: e.g. headline "Account controls available", quote framed as care/transparency, benefits like "Spending limits", "Merchant blocking", "Confidential support"
  - Use a "wellness/security" themed product (e.g. "Bank of America SafeBalance® / Account Controls" or generic "Account Wellness Tools") — NOT a credit card or investment product.
- New rule: NEVER mix marketing/upsell language with risk cards.

### 2. `supabase/functions/generate-product-actions/index.ts`
- Accept new optional input: `risk_flags`.
- Update prompt: when a card's `signal_label` matches a risk category, generate **risk-appropriate** wow + standard actions:
  - **Vice (gambling/adult)**: wow → "Discreet Wellness Check-in Call", "Personalized Spending Limit Setup"; standard → "Push: Set Merchant Block", "Suppress Category Marketing"
  - **Suspicious International**: wow → "Concierge Fraud-Team Callback", "Travel Notice Pre-Set"; standard → "SMS Verification Sent", "Card-Freeze Quick Action"
  - **AML**: wow → "Private Compliance Liaison Outreach"; standard → "Flag for Compliance Review", "KYC Refresh Sent"
- Use cooler/calmer colors for risk: `slate`, `sky`, `indigo` for standard; `rose`, `indigo` for wow (no celebratory pinks/oranges).
- Icons: prefer `shield`, `bell`, `user-check`, `lightbulb`.

### 3. `src/pages/ExecDemoPage.tsx`
- In `fireProductCards` (line 501) and `fireProductActions` (line 553), pass `risk_flags: riskFlags?.flags || []` into both edge function bodies.
- Sequence: ensure risk detection completes before product card generation, OR re-fire product cards once risk detection completes. Simplest: kick off `fireProductCards` after BOTH classification and risk detection settle. Use a small `Promise.all` / ref pattern (risk runs in parallel today; just await `riskRef.current` if available, else proceed without).

### 4. `src/components/exec-demo/NextConversationRationale.tsx`
- No structural change needed — existing `signal_label` substring match (lines 405–412) will now find the risk card automatically.
- Minor: improve fallback so a risk-kind signal that doesn't find a matching card returns an empty action list instead of falling through to `productCards[0]` (which could be a life-event card). Add: `if (matchIdx === -1 && effectiveSignal.kind === "risk") return [];`

## Verification
- `/demo` → select a customer with detected risk (e.g. gambling pattern) → wait for all tabs → switch to Next-Conversation.
- Click each risk pill → Concierge Touch + Standard Response sections show **risk-appropriate** pills (wellness check, card controls, compliance), not college visit / flowers / 529 plan.
- Click life-event pill → unchanged (still shows life-event-appropriate concierge actions).
- Click behavioral pill → unchanged.

## Out of scope
- Phone mockup UI (already gets risk context via deals).
- Other tabs (Next-Offer, Next-Product).
- Risk detection logic itself.

