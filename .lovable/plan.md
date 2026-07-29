Update the Campaign Studio preview's personalized-benefit placeholder from "$xx.xx" to "$xxx" across all usages.

## Change
- In `src/components/solutions/CampaignStudioPreview.tsx`, change the `MergeToken` default children from `"$xx.xx"` to `"$xxx"`.
- This automatically updates every placeholder in the rotating email drafts, the value-math chip, and the legend caption.

## Verification
- Confirm the component renders "$xxx" in subject lines, body copy, and the personalized est. chip.
- Run a TypeScript check to ensure no type regressions.
