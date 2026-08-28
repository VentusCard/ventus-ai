# Taller signal pills in /bankdemo personalization customer selection

## What changes

In the **Customer Selection** card of the three `/bankdemo` personalization tabs (Personalized Deals, Personalized Product, Personalized Relationship), increase the vertical height of each behavioral signal pill slightly.

## File to edit

- `src/components/tepilot/insights/personalization/CustomerSignalPanel.tsx`

## Change detail

The signal pill `<button>` currently uses `py-2` (8 px vertical padding). Bump it to `py-2.5` (10 px) so the pills are a little taller and easier to read, without affecting the rounded-pill shape or family colors.

## Verification

- Open `/bankdemo` → any personalization sub-tab.
- Select an example customer.
- Confirm the colored signal pills in the left **Customer Selection** panel are visibly slightly taller than before.
- Run a build/typecheck to confirm no regressions.
