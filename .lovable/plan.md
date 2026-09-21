# Trim Ricky's masthead to one compact row

## Problem
The Ricky slide currently has three stacked layers of header text, and they repeat each other:
- Page header (shared `Header`): eyebrow "ONE CUSTOMER, FIVE SIGNAL FAMILIES", title "Meet Ricky", subtitle.
- Masthead row 1: eyebrow "Ricky · Living customer view" + title "Ricky's living profile".
- Masthead row 2: label "Living profile intelligence summary" + summary sentence.

"Ricky", "living", and "profile" each appear three times. The masthead eats vertical space the ledger needs.

## Change (src/components/deckmo/DeckmoDeck.tsx only)
Collapse the two-row masthead (lines ~268–283) into a single slim row:

```text
[icon] Ricky's living profile   |   Affluent homeowner, active traveler, tennis regular, business owner, and an emerging relationship opportunity.
```

- Keep the small person icon (slightly smaller, e.g. h-9 w-9).
- Keep `d.profileTitle` as the single display title — drop the "Ricky · Living customer view" eyebrow.
- Keep `d.profileBody` to the right of a thin divider — drop the "Living profile intelligence summary" label.
- Reduce vertical padding (py-4/py-3 → py-2.5) so the freed height goes to the ledger and pills.
- Everything else unchanged: page header, transaction ledger, pill grid, external evidence card, filtering behavior.

## Verification
- `bunx tsgo --noEmit` clean, build OK.
- Playwright check at 1024×768, 1540×855, 1920×1080: one slim masthead row, no repetition, ledger/pill filtering still work.
