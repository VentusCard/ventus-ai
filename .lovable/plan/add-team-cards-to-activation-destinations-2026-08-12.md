# Add Team Cards to Activation Destinations

## Goal
Add one new destination card to each of the three team groups in the `/bankdemo` System tab's "Activation destinations" panel.

## Changes
1. Extend `DESTINATION_GROUPS` in `src/components/tepilot/insights/CapabilitiesView.tsx` with three new items:
   - **Bank Leadership** → "Personalized Relationship"
   - **Product & Growth** → "Personalized Product Offer"
   - **Rewards and Deals** → "Royalty and Retention"
2. Use Lucide icons that match each destination's channel (e.g., `Users`, `Gift`, `Crown`).
3. Omit sublabels per user request; keep the green-dot bracket badge format consistent with existing cards.
4. Assign sensible channel badges:
   - Personalized Relationship → `[Ventus]`
   - Personalized Product Offer → `[CRM]`
   - Royalty and Retention → `[Digital Banking]`

## Verification
- Open `/bankdemo` System tab.
- Confirm each team group now shows three cards.
- Confirm badges render as a green dot + bracketed channel name.
