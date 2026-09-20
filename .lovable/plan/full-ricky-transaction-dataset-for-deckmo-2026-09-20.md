# Full Ricky Transaction Dataset for `/deckmo`

## Goal
Replace the 18 hand-picked evidence rows on “Meet Ricky” with a complete, realistic Ricky transaction history modeled on the full-ledger experience in `/demo`.

## What will change
- Build one complete static Ricky ledger with roughly the same depth as the default `/demo` customer dataset, covering the full date range and all relevant payment sources.
- Preserve the current Ricky identity and story rather than copying Sarah’s `/demo` rows.
- Include enough ordinary activity alongside the signal evidence so the intelligence feels discovered from a real customer history rather than authored around six conclusions.
- Keep all existing signal families and pills:
  - Bi-weekly advanced tennis
  - Annual Hawaiian vacation
  - Buying a house above $1.5M
  - Recurring transfer to brokerage
  - Small business owner
  - Increasing sports betting
- Tag each supporting transaction to one or more relevant signal pills.

## Interaction
- The left side initially shows Ricky’s entire transaction ledger.
- Selecting a signal pill on the right filters the ledger to all supporting transactions for that signal.
- Selecting the active pill again, or using a compact “All transactions” control, restores the complete ledger.
- Pill clicks remain isolated from deck navigation and retain clear selected states.
- The ledger remains scrollable within the slide; the overall presentation must not gain page scroll or clipping.

## Presentation details
- Match `/demo`’s dense transaction-feed treatment while retaining `/deckmo`’s strict light, executive presentation style.
- Show date, source/rail, merchant or raw description, and amount for every row.
- Preserve source distinctions from the full ledger, including cards, ACH, checks, wires, and person-to-person payments.
- Show MCC details only where the underlying card transaction has an MCC.
- Keep the right-side Ricky profile and five-family color system unchanged.

## Technical approach
- Add a dedicated static Ricky fixture rather than calling live services or reusing another customer’s identity.
- Use the existing transaction parsing and display conventions from `/demo` where practical, while keeping `/deckmo` network-free.
- Replace each signal’s duplicated evidence objects with references/tags into the single canonical Ricky ledger, preventing inconsistent copies.
- Derive filtered evidence from the canonical ledger in the Ricky scene.

## Validation
- Confirm every transaction appears in the unfiltered ledger and every pill returns the intended supporting rows.
- Confirm filter clearing and repeated pill selection work without advancing the deck.
- Check `/deckmo` at 1024×768, 1540×855, and 1920×1080 for cutoff, spillover, and unwanted page scrolling.
- Run the relevant TypeScript check and confirm the preview build is clean.

## Scope boundaries
- No changes to `/demo`, other deck scenes, customer-facing product logic, live APIs, prompts, or production data.
- The new Ricky dataset remains static and presentation-only.
