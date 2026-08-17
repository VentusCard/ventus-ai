# Update personalization panel header to "User selected" with customer name

## What's changing

In the **Customer Selection** card of the three Personalization tabs (`/bankdemo`), the signal panel currently shows a header labeled **"Signals detected"** with the segment/city/lifestyle subtext below it. We are updating this header to read **"User selected"** and to prominently display the selected customer's name.

## Files to change

- `src/components/tepilot/insights/personalization/CustomerSignalPanel.tsx`

## Changes

1. Replace the `<h3>` text `"Signals detected"` with `"User selected"`.
2. Render the selected customer's `name` in the header area so the banker immediately sees who is being personalized.
3. Keep the existing segment/city/lifestyle detail and the rest of the signal list unchanged.

## Verification

- Run a build/typecheck to confirm no references break.
- Open `/bankdemo` → any Personalization sub-tab, select a customer, and confirm the left panel header reads **"User selected"** with the customer's name visible.
