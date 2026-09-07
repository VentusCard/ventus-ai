# Intelligence Section Flow Update

## Goal
Update the homepage `IntelligenceSection` context-plane flow animation so the "Next action" stage shows three distinct action types, and the final destination segment is renamed and restructured to match.

## Current State
`src/components/IntelligenceSection.tsx` renders a 4-segment context plane:
1. Sources
2. Relationship view
3. Next action (single card: "Wealth conversation")
4. Advisor queue

The scroll-driven stages are Understand → Decide → Activate.

## Changes
1. **Split the single Next action into three cards** displayed during the "Decide" stage:
   - Digital banking
   - CRM
   - Relationship check-in
2. **Rename the 4th segment** from "Advisor queue" to "Activation destinations" and update its contents to reflect the three destination channels.
3. **Preserve existing behavior**: scroll-driven stage progression, stage-caption clicks, active-state transitions, ticker/sources animation, and responsive layout.
4. **Keep the dark context-plane visual style** and family color accents consistent with the rest of the section.

## Files
- `src/components/IntelligenceSection.tsx`

## Verification
- TypeScript typecheck passes.
- Build succeeds.
- Browser screenshot confirms the three next-action cards and renamed activation-destinations segment at the Decide/Activate stages.
