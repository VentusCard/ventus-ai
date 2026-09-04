# Move phone mockup to middle column in personalization tabs

## Goal
In /bankdemo's three Banking Personalization tabs (Personalized Deals, Personalized Product, Personalized Relationship), reorder the customer-view workspace so the phone mockup sits in the center column instead of the right column.

## Current layout
`CustomerMockupPanel.tsx` renders a 3-column grid:

```text
[ Customer Selection | Key Features + Unit Economics | Phone Mockup ]
        0.9fr                 1.1fr                      1.0fr
```

## Proposed layout

```text
[ Customer Selection | Phone Mockup | Key Features + Unit Economics ]
        0.9fr              1.0fr               1.1fr
```

## Changes
1. In `src/components/tepilot/insights/CustomerMockupPanel.tsx`:
   - Swap the JSX order of the "Personalized surface" phone-mockup card and the `SurfaceFeaturePanel`.
   - Update the `grid-cols` ratio from `0.9fr_1.1fr_1.0fr` to `0.9fr_1.0fr_1.1fr` so the middle column stays sized for the phone while the feature panel takes the slightly wider right column.
   - Keep all existing behavior: customer selection, signal focusing, generation states, retry banner, session fallback, and scroll-into-workspace hook.

2. No changes to tab structure, sub-tabs, data flow, or business logic. The three parent views (`PersonalizedDealsView`, `PersonalizedProductView`, `PersonalizedRelationshipView`) pass the same props and remain untouched.

## Verification
- TypeScript typecheck passes.
- Build succeeds.
- Playwright confirms the phone mockup renders between the customer-selection panel and the key-features panel on all three personalization tabs at desktop viewport.
