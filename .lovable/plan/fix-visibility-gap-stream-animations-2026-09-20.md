# Fix Visibility Gap stream animations

## Goal
Make both the Inside the Walls ledger and Outside the Walls context stream visibly and continuously roll while the Visibility Gap slide is active.

## Confirmed findings
- Both streams already receive running CSS animations, and their transforms change over time in the rendered preview.
- Their column roots do not currently inherit the full available slide height, so the scrolling viewports shrink to their content instead of forming clearly clipped, full-height ticker windows.
- The current 18-second and 24-second loops move slowly enough that the motion can appear static at a glance.

## Changes
1. Make both ticker columns fill the available presentation height, preserving the fixed ledger header and clipping moving rows beneath it.
2. Increase the normal-motion scroll speed on both streams so movement is immediately visible while retaining seamless repeated-row loops.
3. Keep the two streams slightly offset in speed for a natural continuous-data effect.
4. Preserve the existing reduced-motion fallback, centered-first reveal, rail colors, copy, and slide navigation.

## Validation
- Confirm both transforms visibly change while the slide is displayed, before and after the Outside panel reveal.
- Check that rows remain clipped below headers and loop without jumps or blank gaps.
- Verify the slide at 1024×768, 1375×842, 1440×900, and 1920×1080 with no spillover or page scrolling.
- Confirm the preview build remains clean.
