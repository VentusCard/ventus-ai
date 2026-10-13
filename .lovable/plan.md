# Always-visible nested signal details

## Presentation
- Update all 14 signal pills in /deckmo’s customer story so each contains smaller, always-visible detail pills. Keep the five left-hand family headings and natural-language connections.
- For financial signals, show cadence, exact amount, destination, and account/product type wherever the evidence supports them.
- Preserve clicking a parent signal to open its fuller description and supporting evidence; child detail pills are labels, not separate navigation controls.

## Financial examples
- **Investing at Fidelity:** `(Monthly)` `($5,000.00)` to Fidelity `(Brokerage)` — a fixed monthly contribution supported by all nine fixture months.
- **Goldman Marcus HYSA:** `(Monthly)` `($3,500.00 latest · September)` to Goldman Marcus `(HYSA)` `(Variable amount)`. The expanded evidence will list each exact monthly contribution: January–March $2,000; April–May $2,500; June–July $3,000; August–September $3,500.
- **Amex Credit Cards:** `(Monthly)` `($4,862.19 latest · September)` to Amex `(Credit card payment)` `(Variable amount)`, with exact amounts for each month in the expanded evidence.
- Keep external loan information distinct from observed payments; do not invent a monthly installment where none is provided.

## Other signals
- Give every parent pill supported nested attributes: activity/product type, observed cadence, destination, timing, or other relevant context.
- Derive exact amounts from matching transactions where useful; distinguish recurring payments from irregular spending and estimates.
- Preserve the existing income range and household-income estimate. Keep external evidence clearly marked and never invent missing amounts or cadence.

## Layout and behavior
- Allow parent pills and their child labels to wrap cleanly at different desktop resolutions, maintaining aligned family headings and vertical scrolling when needed.
- Keep internal signals first and external signals last within each family, in Demographics → Financial → Behavioral → Life Events → Risk order.
- Preserve arrow/A/D-only slide navigation; clicking details never changes the slide.

## Technical details and validation
- Add a deck-scoped structured-detail helper derived from the existing Ricky transactions, with explicit product types and contextual attributes for signals that are not payment series.
- Update RickySignalStory and its semantic styling tokens without changing other demos or transaction fixtures.
- Add tests for fixed versus variable monthly amounts, exact month-by-month totals, and missing external payment data; run the existing story, rail, and navigation tests.
- Verify all 14 nested pills and their expanded evidence in the running deck at 1024×768, 1375×842, and 1691×1011, checking wrapping, scrolling, and click behavior.