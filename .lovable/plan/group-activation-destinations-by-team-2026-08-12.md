# Group activation destinations by team

Rework the "Activation destinations" column in the System tab so it lists the same destinations that exist inside the /bankdemo workspace, grouped under the three teams Ventus serves.

## Grouping

```text
BANK LEADERSHIP
  Intelligence Analytics   customer intelligence + risk
  Ventus AI Coworker              every team, 24/7

PRODUCT & GROWTH
  Campaign Automations         segment-of-one campaigns
  Personalized Campgains     next-product routing

REWARDS & DEALS
  Personalized Deals       Digital Banking
  Merchant Growth Console      mobile + web delivery
```

Each group gets a small uppercase mono team label with a divider, then the existing NodeCard rows underneath. The count chip in the column header shows the total destination count across all three groups.

The other channels currently listed (Marketing Automation, CRM, AI Banking Assistant, Ask Ventus AI, Rewards Provider, Merchant Partnerships) are dropped from this column to keep the destination list focused on the two primary activation surfaces each team uses.

## Technical notes

- Edit `src/components/tepilot/insights/CapabilitiesView.tsx` only.
- Replace the flat `DESTINATIONS` array with a grouped structure `{ team, items: Destination[] }[]`; keep the `Destination` type and icons as-is.
- Update the destinations column render (around the `visibleDestinations.map`) to iterate groups, and derive the header count from the flattened list.
- No data, backend, or business-logic changes.