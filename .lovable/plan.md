Update Ricky J's signals and refresh cached personalization snapshots

## Goal
Refresh the /bankdemo personalization experience for the "Ricky J" example customer so his signals match the new brief.

## New signal set for Ricky J (id: c1)
- Behavioral: "Biweekly advanced tennis" — evidence should reflect competitive or advanced-level play (e.g., private coaching, league fees, premium club).
- Behavioral: "Recurring dog expenditures" — keep the pet signal but make it dog-specific.
- Life Event: "Buying a house above $1.5M" — update the home-purchase signal to include the price threshold.
- Risk: "Gambling: online sports betting" — narrow the generic gambling flag to online sports betting.

## Implementation steps
1. Edit `src/lib/personalizationExamples.ts`
   - Update the four signal labels and, where needed, their evidence strings for customer `c1`.
   - Preserve the existing signal family ordering and confidence values.

2. Regenerate `src/lib/personalizationSnapshots.ts`
   - The snapshot file is auto-generated from the static example signals and is used for instant demo rendering.
   - Re-run the snapshot generation script (or manually rebuild the c1 offers + product-cards sections) so the cached deals and product cards align with the new signal labels.
   - Ensure no stale references to "Biweekly tennis", "Buying a new house", or the old generic "Gambling" label remain in the c1 snapshot block.

## Out of scope
- Other example customers (c2–c5) are unchanged.
- No backend/edge-function changes are required; this only affects static demo data.
