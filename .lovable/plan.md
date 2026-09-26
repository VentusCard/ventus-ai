# Section 5 audit + new 5th beat: customer confirms the charge

## Purpose of section 5

Nav label: "Immediate Value: Decrease Customer Service Cost". Value block: "-9% Customer Service inquiries". The section's story is a closed loop: a cryptic charge becomes understandable, the customer self-serves the answer, and the service call never happens. The current four captions are factually correct but generic feature statements, and the loop is never closed on screen — the customer never confirms.

## Audit of current beats

| Beat | Phone shows | Current caption | Verdict |
|------|-------------|-----------------|---------|
| 5.1 | Transaction list, clean merchant names | "A clean merchant identity" | Aligned, dry |
| 5.2 | Same list, category + pillar context | "Lifestyle context" | Aligned, vague |
| 5.3 | Same list, recurring/subscription patterns | "Patterns, not just purchases" | Aligned, strongest |
| 5.4 | JFK vending detail page (checks + insights) | "A useful explanation" | Aligned, undersells deflection |
| — | (missing) | — | The confirmation moment never appears |

## Changes

### 1. Add beat 5.5 — "Yes, that's right"

- `src/lib/deckmoScript.ts`: section `immediate` nav entry `steps: 4` → `steps: 5`; add a 5th popup caption.
- `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`: when `step === 4`, keep the JFK detail open (existing `step >= 3` selection) and pre-set `confirmations[jfkIndex] = "yes"` so the phone shows the confirmed state — the "Looks Good" outcome, closing the loop visually.
- Caption for 5.5: **"Confirmed by the customer"** — "One tap closes the loop. The answer improves every future explanation."

### 2. Rewrite the four existing captions to match the section's purpose

In `immediate.popups` (titles + bodies, order unchanged):

1. **"Every charge, instantly recognizable"** — "Cryptic statement strings become clean merchant names and locations."
2. **"Context behind every purchase"** — "Each transaction carries a category and a lifestyle pillar, not just an amount."
3. **"Recurring patterns surface automatically"** — "Subscriptions and repeat activity are identified without the customer lifting a finger."
4. **"Plain-language answers, self-served"** — "A tap explains the charge from the customer's own activity — no call to the bank needed."

## Out of scope

- No change to the title, subtitle, "IMMEDIATE" eyebrow, or the "-9%" value block.
- No change to the JFK detail layout, correction flow, or beat navigation mechanics.
- `/demo` untouched.

## Verification

- Load /deckmo at 1691×1011 and 1540×855, arrow through 5.1–5.5: correct caption per beat, 5.5 shows the JFK detail in the confirmed state, no overflow in the callout rail.
- Arrow back 5.5 → 5.4 → 6.1 to confirm navigation still works both directions.
- Confirm build is clean.
