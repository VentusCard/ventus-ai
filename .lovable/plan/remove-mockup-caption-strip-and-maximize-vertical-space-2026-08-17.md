# Remove mockup caption strip and maximize vertical space

## What's changing

In the three Personalization tabs (`/bankdemo`), the right-hand mockup card currently shows a caption strip at the bottom:

> "What the customer sees — {name}'s generated surface, built from the signals on the left. [Why this surface]"

We are removing that strip entirely and reclaiming the vertical space for the phone/iPad mockup so the personalized surface fills as much of the available viewport as possible.

## Files to change

- `src/components/tepilot/insights/CustomerMockupPanel.tsx`

## Changes

1. Delete the bottom caption strip (`<div className="shrink-0 mt-1.5 ...">` containing the explanatory text and the "Why this surface" popover).
2. Remove the now-unused `SURFACE_COPY` object and the `HelpCircle` import if they become unused.
3. Adjust the mockup container so the phone/iPad mockup stretches to fill the newly freed vertical space:
   - Keep the outer workspace height but let the mockup column absorb the reclaimed area.
   - Ensure the `ExecDemoPhoneView` container uses `h-full` and centers without extra bottom padding.
4. Preserve the empty-state placeholder and the generation-failed message.

## Verification

- Run a build/typecheck to confirm no references break.
- Open `/bankdemo` → any Personalization sub-tab, select a customer, and confirm:
  - The caption strip and "Why this surface" button are gone.
  - The mockup is taller and uses the reclaimed space.
  - The "User selected" header with the customer name still renders correctly in the left panel.
