# Combine The Visibility Gap and Meet Ricky

## New section 2 sequence
1. **2.1 — Visibility Gap:** keep the current opening view.
2. **2.2 — Visibility reveal:** keep the current second visibility beat.
3. **2.3 — Centered transaction ledger:** retain the compact ledger frame that hugs the transactions.
4. **2.4 — Enriched ledger:** expand the same frame and reveal the enrichment columns.
5. **2.5 — Signal view:** show the rolling ledger with internal signal pills first, then reveal the external pills as the final animation in this beat.

## Deck updates
- Merge these beats into one “The Visibility Gap / Meet Ricky” section in the shared deck sequence.
- Remove the separate Meet Ricky section and shift The Complete Picture to section 3; later sections renumber automatically.
- Keep ledger dimensions, row alignment, scrolling, and existing enrichment animations unchanged.
- On 2.5, initially exclude the two external pills, then animate them into their existing signal families after the internal pills appear.
- Update the table of contents, presenter navigation, progress calculation, and footer numbering through the shared registry.

## Technical details
- Add a combined scene that delegates beats 2.1–2.2 to the existing visibility view and beats 2.3–2.5 to the Ricky view.
- Give the Ricky signal beat a separate timed external-pill reveal while preserving pill selection and external-evidence interactions.

## Verification
- Navigate through 2.1–2.5 and confirm the exact sequence, including internal pills appearing before external pills on 2.5.
- Confirm section 3 is The Complete Picture, the table of contents has nine sections, and later numbering is correct.
- Check both the current presentation viewport and a shorter desktop viewport for clipping or movement.
