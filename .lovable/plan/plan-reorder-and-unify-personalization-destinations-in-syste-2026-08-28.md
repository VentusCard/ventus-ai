# Plan: Reorder and Unify Personalization Destinations in System Flow

## Goal

In the System tab's **Activation destinations** column, move the three personalization destinations to the top and make the **Personalized Relationship** card visually identical to **Personalized Product** and **Personalized Deals**.

## Current State

The activation destinations list currently shows:

1. Intelligence Database (bank-facing, slate icon)
2. AI Coworker (bank-facing, slate icon)
3. Personalized Relationship (bank-facing, slate icon)
4. Automated Flows (bank-facing, slate icon)
5. Campaign Builder (bank-facing, slate icon)
6. Personalized Product (consumer-facing, blue icon)
7. Personalized Deals (consumer-facing, blue icon)

The three personalization surfaces are split: Relationship is grouped with bank-facing tools and uses the slate treatment, while Product and Deals are grouped at the bottom with the consumer-facing blue treatment.

## Changes

1. **Reorder `DESTINATIONS**` in `CapabilitiesView.tsx` so the three personalization cards appear first:
  - Personalized Deals
  - Personalized Product
  - Personalized Relationship
  - Then the remaining bank-facing destinations follow.
2. **Unify the visual treatment** of the three personalization cards so Relationship matches Product and Deals. This means changing **Personalized Relationship** from `facing: "bank"` to `facing: "consumer"` so it receives the same blue icon background and consumer-facing styling as the other two personalization surfaces.
3. **Verify navigation buttons still work** for the reordered destinations and that no labels or tab targets change.

## Files to Modify

- `src/components/tepilot/insights/CapabilitiesView.tsx` — reorder the `DESTINATIONS` array and update the `facing` value for Personalized Relationship.