# Remove "SUPPORTING TRANSACTIONS" header from Ricky slide

## What changes
On the /deckmo "Example: Meet Ricky" slide, the left (transactions) section currently has a header bar showing:
- the eyebrow "SUPPORTING TRANSACTIONS" (or "EXTERNAL INTELLIGENCE" when an external pill is selected),
- a status line ("All transactions" or the selected pill's label),
- and a chip on the right ("76 transactions", filtered counts, "External signal", which also acts as a reset button).

Remove that entire header bar. The transaction ledger and the external-evidence card stand on their own — the external evidence card already self-identifies (label, confidence chip, Source/Timing). Deselecting a pill still works by re-clicking the selected pill, which is unchanged.

## How
File: `src/components/deckmo/DeckmoDeck.tsx` — in the `Ricky` component, delete the header `<div>` inside the left `<section>` (the flex row containing `d.rawLabel` / "EXTERNAL INTELLIGENCE" and the count Button). The ledger scroll container and external-evidence panel keep their existing styling and fill the freed vertical space.

`d.rawLabel` in `src/lib/deckmoScript.ts` becomes unused by the UI; leave the script data untouched.

## Validation
- `bunx tsgo --noEmit` clean; build log shows OK.
- Playwright at 1024×768, 1540×855, 1920×1080: header row gone, ledger fills the space with no clipping/overlap, internal pill filtering works, both external pills show the evidence card, re-click resets to all 76 rows, pill clicks don't advance the deck.
- Update roadmap.md.
