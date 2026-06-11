## Goal
Regenerate the 5 local preview cards so they strictly follow the **2/1/1/1/1 rule** — 2 behavior, 1 life event, 1 demographic, 1 financial signal — and remove the dedicated "OFFER" card that currently occupies slot 0 in violation of the rule.

## Problem
`buildMessageCards.ts` pushes a promo card first whenever `offers[0]` is set (lines 282–293). That's why card #1 still renders:

> Activation nudge — OFFER — "Double rewards until EOY — on the cashback (3/2/1)" …

This breaks the 2/1/1/1/1 quota and uses a 5th family ("promo") that isn't in the rule.

## Changes — `src/components/tepilot/campaigns/sections/buildMessageCards.ts`

### 1. Drop the dedicated offer card
Remove the `if (primaryOffer) { cards.push({...}) }` block (lines 282–293). The promo overlay still influences copy — see step 4.

### 2. Add two new anchor families
Extend `AnchorFamily` to: `"BEHAVIOR" | "LIFE_EVENT" | "DEMOGRAPHIC" | "FINANCIAL_SIGNAL"`.

(STACK/USAGE/GOAL constants stay internal — BEHAVIOR is sourced from existing STACK_ANCHORS + USAGE_ANCHORS pools so card copy/rate-phrase logic is unchanged.)

New pools (per `ProductCategory`, ~3–4 entries each so seed rotation works):

- **DEMOGRAPHIC_ANCHORS** — life-stage / segment labels, e.g.
  - credit_cards: "Young professional, metro", "Family w/ school-age kids", "Mass-affluent household", "Empty-nester, suburb"
  - deposit_accounts: "Dual-income household", "Single-earner family", "Recent grad", "Pre-retiree"
  - (similar for loans / investments / insurance / digital_services)
- **FINANCIAL_SIGNAL_ANCHORS** — observed money-movement signals, e.g.
  - credit_cards: "Rising monthly card spend", "Off-us spend leakage", "Balance carried elsewhere", "Direct-deposit increase"
  - deposit_accounts: "Idle checking buffer", "Bonus landed in checking", "Savings rate trending up", "Outbound transfers to brokerage"
  - (similar for the rest)

### 3. Hard-coded 2/1/1/1 build order
Replace the current conditional build loop with a fixed 5-slot fill (seed rotates within each pool):

```text
slot 0: BEHAVIOR  (STACK_ANCHORS[cat], else USAGE_ANCHORS[cat])
slot 1: BEHAVIOR  (the other behavior pool, or 2nd entry)
slot 2: LIFE_EVENT
slot 3: DEMOGRAPHIC
slot 4: FINANCIAL_SIGNAL
```

Each slot uses `(slotIdx + seed) % pool.length` for variation on Regenerate.

If a category has no STACK pool (e.g. deposits), both behavior slots draw from USAGE_ANCHORS with offset indices.

### 4. Fold the promo overlay into copy, not a card
When `primaryOffer` is set, append it to the body of **slot 0 only** (first behavior card), e.g. `${base.body} Currently: ${primaryOffer}.` Promo never produces its own card and never appears as its own anchor family — this is what satisfies the user's earlier instruction about the LLM also taking the full campaign context into account (the promo lives inside the behavior card).

### 5. Copy templates for new families
Add two new `case` branches in `copyFor(...)`:

- **DEMOGRAPHIC**: subject `"Built for ${anchorProse}"`, body references mechanics tagline + fee, CTA "See if it fits", why `Demographic anchor — ${anchor}.`
- **FINANCIAL_SIGNAL**: subject `"${anchor} — worth a look"`, body references the signal + one mechanic feature + fee, CTA "Take a look", why `Financial-signal anchor — ${anchor}.`

### 6. `PLAYS_BY_FAMILY` additions
- DEMOGRAPHIC → `["ACQUIRE", "UPGRADE"]`
- FINANCIAL_SIGNAL → `["ACTIVATE", "WINBACK", "RETAIN"]`

## Out of scope
- No edge-function call (`generate-campaign-offers` stays untouched — local-only re-roll as previously confirmed).
- No changes to `MessagePreviewsSection.tsx`, the fanned deck, popover, counters, or `variants.total`.
- No changes to the "Micro-segments" label or the Regenerate button itself.

## Verification
After the edit, with any product + the "Double rewards until EOY" offer set:
- Card 1: BEHAVIOR (stack), body ends with "Currently: Double rewards until EOY."
- Card 2: BEHAVIOR (second stack or usage)
- Card 3: LIFE_EVENT
- Card 4: DEMOGRAPHIC
- Card 5: FINANCIAL_SIGNAL
- No card has `play: "OFFER"` or `anchorFamily` outside the four allowed.
- Clicking Regenerate rotates anchors/plays within each slot's pool.
