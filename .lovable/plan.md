Update the Creditworthiness section in the Next-Product panel to display a "Coming soon" placeholder instead of the current detailed credit assessment data.

### Change
In `src/components/exec-demo/NextProductRationale.tsx`, replace the `CreditworthinessBanner` component body so that it always renders a clean "Coming soon" card with the "Creditworthiness" label, regardless of loading or assessment state. Remove the dependency on the `CreditAssessment` data structure for rendering.

The placeholder will preserve the existing card container styling (rounded border, white background) so it visually fits the panel, with centered "Coming soon" text in slate-500.

### No other changes
- No backend or data-fetching changes.
- No changes to `CreditAssessment` interface or props passed from parent.
- No other UI sections affected.