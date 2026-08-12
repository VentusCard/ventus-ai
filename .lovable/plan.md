# Group activation destinations by team

Rework the "Activation destinations" column in the System tab so it lists the same destinations that exist inside the /bankdemo workspace, grouped under the three teams Ventus serves.

## Grouping

```text
BANK LEADERSHIP
  Intelligence Dashboard   customer intelligence + risk
  Ask Ventus AI            natural-language analytics
  AI Coworker              every team, 24/7

PRODUCT & GROWTH
  Automated Flows          lifecycle triggers
  Campaign Builder         segment-of-one campaigns
  Merchant Partnerships    category extension
  Personalized Product     next-product routing

REWARDS & DEALS
  Personalized Deals       next-deal + perks
  Rewards Provider         Kard, etc
  Digital Banking App      mobile + web delivery
```

Each group gets a small uppercase mono team label with a divider, then the existing NodeCard rows underneath. The count chip in the column header shows the total destination count across all three groups.

The channels currently listed that are systems of record rather than teams (Marketing Automation, CRM, AI Banking Assistant) fold into the group they serve: Marketing Automation and CRM under Product & Growth, AI Banking Assistant under Rewards & Deals delivery — nothing is dropped.

## Technical notes

- Edit `src/components/tepilot/insights/CapabilitiesView.tsx` only.
- Replace the flat `DESTINATIONS` array with a grouped structure `{ team, items: Destination[] }[]`; keep the `Destination` type and icons as-is.
- Update the destinations column render (around the `visibleDestinations.map`) to iterate groups, and derive the header count from the flattened list.
- No data, backend, or business-logic changes.
