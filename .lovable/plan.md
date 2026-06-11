## Goal
When no product is selected, the page should still render Section 2 (Audience & exclusion funnel) and Section 3 (Personalized message previews) as **dimmed empty-state placeholders** so the full workflow shape is visible from the start.

## Approach
Render the section shells unconditionally in `ProductCampaignBuilderView`. Each section gets a `product?: ProductFlow` prop; when undefined, it shows a dimmed shell with the header (numbered badge + title) and a centered "Pick a product above to see this" message inside the card body. When a product is selected, behavior is unchanged.

## Files

### `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`
- Remove the `{product && (...)}` gate. Always render both sections, passing `product` (possibly undefined).

### `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx`
- Change prop to `product?: ProductFlow`.
- If `!product`: render the outer card with the step-2 header ("Audience & exclusion funnel"), no `Addressable` badge, and a single centered placeholder line: "Pick a product above to model the audience funnel and risk filters." Use `opacity-60` on the card.
- Else: existing behavior.

### `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx`
- Same pattern: optional `product`. When absent, render the step-3 header + centered placeholder "Pick a product above to preview three personalized angles." with `opacity-60`.

No changes to `ProductPickerSection`, catalog data, or edge functions.
