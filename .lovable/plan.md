# Add KYC above the transaction rails

## Requested change
- On /deckmo slides 2.1 and 2.2, add **KYC** as the first expandable block above Cards, ACH, Checks, Wire, and Zelle.
- Show a compact customer-profile field/value table: name **Ricky J**, customer ID **45275487**, age **34**, location **San Francisco, CA 94123**, estimated household income **$500K**, and relationship tier **Preferred**. These values are already present in Ricky’s deck profile.
- Do not invent identity-verification status, date of birth, contact details, or other unavailable KYC information. Keep the income explicitly labeled as an estimate.

## Interaction and appearance
- Match the existing expandable headers, light theme, compact rows, and scrollable content window.
- KYC starts collapsed; Cards remains open initially. Opening KYC closes the open rail, and selecting a rail closes KYC. Clicking an open section collapses it.
- Preserve the selected section and its scroll position across 2.1 → 2.2.
- Keep the full transaction lists, rail counts, panel dimensions, outside-events panel, profile heading, and slides 2.3–2.5 unchanged.

## Technical details
- Extend `RickyRailAccordion.tsx` with a KYC section and selection state that supports KYC alongside the five existing rails.
- Source the profile fields from structured deck-profile data in `deckmoScript.ts`, keeping the existing profile header consistent with those values.
- Keep KYC separate from transaction grouping and signal pillars; it is customer-profile data, not another payment rail or an enrichment signal.

## Validation
- Verify KYC fields and expand/collapse behavior on slides 2.1 and 2.2 at the current 1377 × 842 viewport.
- Confirm Cards still starts open, full rail lists remain scrollable, selection persists during the slide transition, and later slides remain unchanged.
- Run the existing rail-group tests and check the preview for errors.