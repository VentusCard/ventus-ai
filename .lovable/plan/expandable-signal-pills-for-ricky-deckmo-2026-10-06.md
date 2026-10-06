# Expandable signal pills for Ricky (/deckmo)

## What changes
Clicking any of Ricky's 13 signal pills opens a short detail card for that signal, right below its pillar group. Clicking the same pill again closes it. Only one card is open at a time. The current behavior stays: clicking an internal pill still filters the ledger to its evidence rows, and external pills still show their outside evidence.

## What each card shows
- Headline: the pill name plus a one-line summary
- 3–4 short facts: cadence, typical amounts or ranges, timing pattern, trend
- Key merchants seen in the ledger
- Source tag: "Internal ledger" or "External" (provider name)

Numbers come from Ricky's real demo ledger (counts, amount ranges, dates) so cards match what the table shows. Example:

```text
Monthly transfers to Goldman Marcus HYSA
Recurring ACH out of checking, every month since Feb
- Cadence: monthly, around the 3rd
- Size: $2,000–$3,500 per transfer
- Trend: amounts rising over 8 months
- Merchant: Marcus by Goldman Sachs
```

Draft wording for all 13 cards (tennis, Hawaii, pet spend, media/music, baby, Palo Alto home, Fidelity, Marcus, BMW X5 loan, Amex, income, food business, DraftKings), written in a calm, opportunity-focused tone, with no stress language.

## Layout
- The card opens inside the right-hand signal panel and pushes the groups below it down; the panel scrolls if needed. Nothing else on the slide moves.
- Same pillar color as the pill, light theme, small text matching the deck.
- Gentle open/close animation.

## Technical details
- Add a `detail: { summary, facts: string[], merchants: string[] }` field to each signal in `DECKMO.ricky.signals` (deckmoScript.ts).
- `SignalFamilyCard` renders the detail block under its pills when `selectedLabel` belongs to that family; reuses the existing selection state in `Ricky`.
- Five pillar structure and pill order unchanged. Verify at 1376×855 and 1590×1024 on beats 2.4, 2.5 and 3.x.
