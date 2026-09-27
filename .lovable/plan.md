# Closing slide: two succinct lines, bigger type

## What changes

The closing slide currently reveals three lines one beat at a time ("Today too many banking experiences are generic and replaceable." / "With Ventus AI your bank can…" + ticker / "Because your bank can anticipate and capture customer needs and deliver a differentiated banking experience."). The user wants **two lines** instead, with type scaled up to fill the freed space.

New copy (two lines):

1. **Line 1:** "Today, banking experiences are generic and replaceable."
2. **Line 2:** "With Ventus AI your bank can anticipate customer needs and deliver differentiated banking." — with the blue benefits ticker (grow deposits, cross-sell more products, increase card spend, deepen engagement, lift NPS) rolling beneath "your bank can", as today.

The signature block is unchanged: "Let's do great things together" then "Marco Ma — CEO & Cofounder — marco@ventusai.com".

## Beat structure

- Beat 0: line 1 reveals.
- Beat 1: line 2 reveals + ticker starts.
- Beat 2: signature block ("Let's do great things together" + one-line signature).

(Today: 4 beats with a standalone blue line; new: 3 beats.)

## Implementation

1. `src/lib/deckmoScript.ts` — rewrite `DECKMO.close.lines` to the two new strings (keep `ticker`, `signature` as-is). Delete the old third line.
2. `src/components/deckmo/DeckmoDeck.tsx` — `Close` component:
   - Render two lines, not three; beats renumbered (3 total).
   - Line 2 combines the with-Ventus setup with the former "Because your bank can…" clause; keep the ticker attached to the same line as today.
   - Increase type: line 1 clamp up to ~92px, line 2 up to ~64px (from 70/60); matching `@media(max-height:900px)` values up proportionally (e.g. 38/30px), margins between lines slightly larger since there is more room.
   - Keep the existing Reveal rise animation, centered stage, and footer-clearance checks.

## Verification

- `bunx tsgo --noEmit` + build log clean.
- Playwright at 1376×1011, 1540×855, 1691×1011: both lines and ticker render, signature clears the footer, no overlap.
