# Static signal-family narratives

Today each signal-family card popover only shows product-specific evidence (life-event/behavioral signals from `product.signals`, or financial/demographic/risk exclusions from `productCatalogExtras`). It doesn't explain *what we look at* for that customer in general — the narrative the user just described.

I'll add a static, family-level "what we're reading about this customer" block to the top of each popover, then keep the product-specific evidence list underneath as the *receipts*.

## What gets added

A new constant `FAMILY_NARRATIVE` in `src/lib/productCatalogExtras.ts`, keyed by `ExclusionType`, with for each family:

- `tagline` — one short italic line (the headline idea)
- `description` — one sentence framing the lens
- `themes` — 3 bullets capturing the dimensions we read

Trimmed and tightened from the source the user provided:

**Behavioral — the rhythm of their everyday life**
*What their week actually looks like, spend by spend.*
- Where the money goes: the daily coffee, Friday takeout, the gym, the Amazon habit, the kids'-cleats run to Dick's
- The conspicuous silences: zero groceries, zero gas, no travel for two years then three flights in a month
- How they pay: debit-for-everything vs. credit-savvy, one card vs. spreader, autopay vs. manual

**Life Event — the chapters that change everything**
*The moments where their financial center of gravity shifts.*
- New baby, new city, new job — each with its own unmistakable transaction fingerprint
- A wedding, a divorce, college tuition, an estate inflow, retirement on the horizon
- The tell is the change, not the level — the derivative, the moment the pattern breaks

**Demographic — the broad strokes**
*The slow-moving frame around the picture — the canvas, not the painting.*
- Age band, income band, household shape
- Tenure with us, credit-score tier
- Where they live: coastal city vs. rural, high-cost-of-living vs. not

**Financial — their relationship with money, and with us**
*Not just how much, but the posture — saver, spender, juggler, accumulator.*
- Breathing room vs. living tight: idle cash in checking vs. balance dipping low before payday
- What they're reaching for: the down-payment forming, the steady transfers toward something
- What they already hold with us — and the white space where we could be more

**Risk — can we, and should we**
*The conscience of the whole system. Runs first, no exceptions.*
- Eligibility, over-extension, delinquency, room on the line
- Compliance flags that mean "not this person, not this offer, full stop"
- Concentration and exposure that change the answer even when everything else says yes

## Popover layout change

In `ExclusionFunnelSection.tsx`, the popover for each family becomes:

```
[icon] Family Label
       Relevance label (useful / neutral / flag)

*tagline*
One-sentence description.

What we read:
• theme 1
• theme 2
• theme 3

──────────────────────
Evidence for {product.name}:
• existing product-specific signals (unchanged, capped at 5 + "more")
```

The existing product-evidence section is preserved verbatim; the "No product-specific signals — relying on universal checks" fallback stays. Width bumps from `w-64` to `w-72` so the themes don't get cramped.

## Files touched

- `src/lib/productCatalogExtras.ts` — export `FAMILY_NARRATIVE`
- `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx` — render the narrative block above existing evidence list; widen popover

## Out of scope

- No changes to which signals exist per product, the funnel math, the demographic filter panel, or `ProductPickerSection`.
- The card faces themselves (label + icon) stay as-is — only the popover content expands.
