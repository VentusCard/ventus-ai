# Trim Ricky's masthead to one compact row

## Problem
The Ricky slide currently has three stacked layers of header text, and they repeat each other:
- Page header (shared `Header`): eyebrow "ONE CUSTOMER, FIVE SIGNAL FAMILIES", title "Meet Ricky", subtitle.
- Masthead row 1: eyebrow "Ricky · Living customer view" + title "Ricky's living profile".
- Masthead row 2: label "Living profile intelligence summary" + summary sentence.

"Ricky", "living", and "profile" each appear three times. The masthead eats vertical space the ledger needs.

## Change
Collapse the two-row masthead (DeckmoDeck.tsx lines ~268–283) into a single slim row:

```text
[icon] Ricky's living profile
       Age 44 · San Francisco, CA 94123 · Est. household income $850K · Preferred tier
       Affluent homeowner, active traveler, tennis regular, business owner, and an emerging relationship opportunity.
```

- Keep the small person icon (slightly smaller, e.g. h-9 w-9).
- Keep `d.profileTitle` as the single display title — drop the "Ricky · Living customer view" eyebrow.
- Drop the "Living profile intelligence summary" label; keep `d.profileBody` as the one summary line.
- Add a basic customer-file facts line under the title with core bank-record facts that are NOT Ventus-derived — the kind a teller would see in the customer profile. Ricky's file has no age or income yet, so add new fixture values consistent with the existing persona ("Ricky J", San Francisco CA, affluent small-business owner with a $1.5M+ home):

```text
Age 44 · San Francisco, CA 94123 · Est. household income $850K · Preferred tier
```

  Store it as a new `profileFacts` field in `src/lib/deckmoScript.ts` so the copy lives with the rest of the script.
- Thin divider stays between the identity block and the summary block; reduce vertical padding (py-4/py-3 → py-2.5) so the freed height goes to the ledger and pills.
- Everything else unchanged: page header, transaction ledger, pill grid, external evidence card, filtering behavior.

## Verification
- `bunx tsgo --noEmit` clean, build OK.
- Playwright check at 1024×768, 1540×855, 1920×1080: one slim masthead row, no repetition, ledger/pill filtering still work.
