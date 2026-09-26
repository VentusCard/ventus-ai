# Section 5 beat descriptions — audit and rewrite

## Audit findings

Section 5 ("Make every transaction understandable", 4 beats) shows one caption per beat in the right-hand callout rail. Current captions vs. what the beat actually shows:

| Beat | Phone shows | Current caption | Verdict |
|------|-------------|-----------------|---------|
| 5.1 | Transaction list, clean merchant names | "A clean merchant identity" | Aligned, but dry |
| 5.2 | Same list, category + pillar context | "Lifestyle context" | Aligned, vague title |
| 5.3 | Same list, recurring/subscription patterns | "Patterns, not just purchases" | Aligned, best of the four |
| 5.4 | JFK vending detail page with checks + insights | "A useful explanation" | Aligned, undersells the service-call deflection |

All four are factually correct but generic feature statements. Section 6 was rewritten into punchier, outcome-led lines; section 5 should match that tone.

## Change

Rewrite the four `popups` entries in `immediate` in `src/lib/deckmoScript.ts` (titles + bodies), keeping the one-caption-per-beat order:

1. **"Every charge, instantly recognizable"** — "Cryptic statement strings become clean merchant names and locations."
2. **"Context behind every purchase"** — "Each transaction carries a category and a lifestyle pillar, not just an amount."
3. **"Recurring patterns surface automatically"** — "Subscriptions and repeat activity are identified without the customer lifting a finger."
4. **"Plain-language answers, self-served"** — "A tap explains the charge from the customer's own activity — no call to the bank needed."

## Out of scope

- No change to the title, subtitle, "IMMEDIATE" eyebrow, or the "-9% Customer Service inquiries" value block.
- No change to the phone content, JFK detail page, or beat navigation.
- `/demo` untouched.

## Verification

- Load /deckmo at 1691×1011 and 1540×855, arrow through 5.1–5.4, screenshot each beat: correct caption per beat, no text overflow in the callout rail.
- Confirm build is clean.
