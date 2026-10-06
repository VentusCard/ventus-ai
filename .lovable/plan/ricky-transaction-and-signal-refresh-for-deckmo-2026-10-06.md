# Ricky transaction and signal refresh for `/deckmo`

## Goal
Replace the current Ricky signal set with the supplied 13-pill matrix and rebuild the static ledger evidence behind it. Preserve the five existing pillars exactly: Behavioral, Life Events, Financial, Demographics, and Risk. Beats 2.1–2.3 continue to show one canonical transaction history; beat 2.4 reveals the 11 internal signals; beat 2.5 adds the two external signals.

## Signal matrix

### Behavioral
- **Bi-weekly tennis** — keep and retag the City Tennis Center, CourtReserve, USTA NorCal, and Zelle coaching evidence.
- **Annual pre-holiday Hawaii trip** — move the prior Maui trip to early December 2025, including Hawaiian Airlines, Wailea Beach Resort, and Allianz; add a September 2026 Hawaiian Airlines booking for December 2026.
- **High pet expenditure** — retain the external SKU-level evidence unchanged.
- **Media and entertainment spend** — add/tag Netflix, YouTube TV, recurring Spotify charges rising from $11.99 to $13.99, AMC Theatres, and Ticketmaster at Shoreline Amphitheatre.

### Life Events
- **Had a baby ~6 months ago** — add/tag Babylist, Pottery Barn Kids, Lucile Packard Children’s Hospital Stanford, The Honest Company, and Bright Horizons, with dates that support a birth around March 2026.
- **Buying a $1.5M+ Palo Alto home** — keep the escrow wire, inspection, appraisal, moving deposit, and property-attorney evidence; remove unrelated rows from this signal.

### Financial
- **Monthly investing at Fidelity** — retain the monthly Fidelity transfers under the revised label.
- **Monthly transfers to Marcus savings** — add realistic monthly ACH transfers to Marcus by Goldman Sachs.
- **BMW X5 loan ending in ~4 months** — replace the current external lender-tradeline wording with external vehicle-ownership evidence for the BMW X5.
- **Monthly American Express payments** — add realistic monthly Amex ePayment rows.

### Demographics
- **Stable $11–13K monthly income** — add semi-monthly HP payroll direct deposits whose monthly totals stay within the stated range.
- **Started a small food business** — replace the generic business-owner evidence with May formation/permit rows and, from June onward, recurring Square payouts plus Urban Village Farmers’ Market vendor fees, Restaurant Depot, and FLIP food-liability insurance.

### Risk
- **Increasing DraftKings betting** — retain the existing increasing DraftKings pattern as the sole Risk signal. Risk remains its own fifth pillar.

## Ledger construction
- Create plausible statement dates, amounts, rails, descriptors, and MCC metadata where applicable; keep all rows in descending date order.
- Preserve ordinary non-signal activity so the ledger still reads as a complete account history rather than a list of authored evidence.
- Allow a transaction to support more than one signal only when the evidence genuinely overlaps.
- Update the deterministic enrichment rules for every added or renamed merchant so beat 2.3 shows useful merchant, pillar, category, subcategory, tier, frequency, and confidence values instead of falling back to “Unclassified.”

## Presentation updates
- Replace `RICKY_SIGNAL_LABELS` and `DECKMO.ricky.signals` with the exact 13-pill taxonomy and existing five-family colors; do not merge, rename, or remove any pillar.
- Keep the 2.4 internal-only reveal and 2.5 external reveal behavior; external pills remain non-ledger evidence cards.
- Preserve filtering, selected states, ledger rolling/cascade behavior, slide navigation isolation, layout, strict light theme, and institution terminology swapping.
- Do not change `/demo`, `/bankdemo`, production enrichment behavior, or live services; this remains a static `/deckmo` fixture.

## Validation
- Verify beats 2.1–2.5 end to end: full ledger continuity, enrichment coverage, 11 internal pills at 2.4, and all 13 pills at 2.5.
- Select every internal pill and confirm it returns the intended evidence rows; confirm each external pill opens only its external evidence card and does not filter the ledger.
- Confirm Hawaii chronology, six-month baby timeline, June business start, monthly Fidelity/Marcus/Amex cadence, semi-monthly HP payroll totals, and increasing DraftKings amounts.
- Check 1376×855 and 1590×1024 for pill overflow, clipping, truncation, or panel movement; tighten only existing compact presentation styles if 14 pills require it.
- Run the focused TypeScript check and confirm the preview build is clean.
