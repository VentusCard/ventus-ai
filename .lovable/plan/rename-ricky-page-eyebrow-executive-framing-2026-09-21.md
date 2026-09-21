# Rename Ricky page eyebrow (executive framing)

## Change
Replace the Ricky page eyebrow in `src/lib/deckmoScript.ts`:

- Old: `eyebrow: "ONE CUSTOMER, FIVE SIGNAL FAMILIES"`
- New: `eyebrow: "CUSTOMER INTELLIGENCE IN ACTION"`

The title "Meet Ricky" and the masthead "Ricky's living profile" stay unchanged. The eyebrow pairs with the right-panel label "VENTUS CUSTOMER INTELLIGENCE" that appears on the second beat — the eyebrow states the capability, the panel shows it.

## Steps
1. Update `DECKMO.ricky.eyebrow` in `src/lib/deckmoScript.ts` (line ~79). Single string change; no component edits needed since `DeckmoDeck.tsx` renders `d.eyebrow` directly.

## Verification
- `bunx tsgo --noEmit` clean.
- Playwright: navigate the deck to Ricky's slide, confirm the new eyebrow renders above "Meet Ricky" and nothing else moved.
