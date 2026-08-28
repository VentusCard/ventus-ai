# Plan: Standardize the Banking Personalization Section

## Goal
Make the three personalization surfaces consistent and clearly ordered in the BANKING PERSONALIZATION section, with Personalized Relationship matching the simpler structure of Personalized Product and Personalized Deals.

## Current State
- The BANKING PERSONALIZATION sidebar group contains: Personalized Deals, Personalized Product, Personalized Relationship.
- Personalized Product and Personalized Deals each use a 2-tab layout: **Customer View** + one intelligence tab.
- Personalized Relationship uses a 4-tab layout: Customer View, Customer Insights, Relationship Intelligence, AI Banking Assistant — making it heavier and visually inconsistent.

## Changes

1. **Reorder the sidebar items** so the three personalization tabs read:
   - Personalized Relationship
   - Personalized Product
   - Personalized Deals
   This puts the tab currently being standardized at the top of the section.

2. **Refactor PersonalizedRelationshipView** to the same 2-tab pattern as the other two:
   - **Customer View** — keeps the existing `CustomerMockupPanel` with `surface="relationship"`.
   - **Relationship Intelligence** — a single consolidated intelligence tab that surfaces the most important relationship signals and assistant activity. The separate Customer Insights, Relationship Intelligence, and AI Banking Assistant sub-views will be merged or retired into this one tab.

3. **Update the sub-tab definitions** in `PersonalizedRelationshipView.tsx` to mirror the icon size, label style, and dropdown behavior used by `PersonalizedProductView` and `PersonalizedDealsView`.

4. **Verify no broken deep-links or nav references** after removing the extra Relationship sub-tabs.

## Files to Modify
- `src/components/tepilot/insights/AnalyticsContainer.tsx` — sidebar item order.
- `src/components/tepilot/insights/PersonalizedRelationshipView.tsx` — reduce to 2 tabs and consolidate content.
