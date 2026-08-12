# Match the uploaded design for Data sources and Activation destinations

Update the /bankdemo System tab pipeline board so the left column (Data sources) and right column (Activation destinations) match the uploaded reference.

## Data sources (left column)

Consolidate to the 5 sources in the reference:

```text
Banking Core            accounts · transactions · ledger        internal
Digital Banking         app + web telemetry                     internal
Bank Context            products · locations · org              internal
External Intelligence 1 national data partnerships              external · Modeled
External Intelligence 2 national data partnerships              external · Modeled
```

- Banking Core absorbs today's KYC, Transactions, and Product Holdings inputs into one group, so its drill-down panel shows identity, payment-rail, and portfolio inputs together.
- The current External Intelligence inputs split across the two partner sources (partner 1: credit file, wealth, loans & payments, property, demographics; partner 2: interests, auto/VIN, life events, public records, firmographics, licenses, new movers). Each keeps its Modeled badge and existing FCRA flags.
- Row styling follows the reference: 30x30 tinted icon tile (sky internal, amber external), 13px name, 11px mono meta line, amber "Modeled" chip, green status dot. Header meta reads `5 groups · N`.
- Clicking a source still filters/opens the same detail panel below.

## Activation destinations (right column)

Switch from the stacked team sections to the reference's single compact list of 9 rows — this removes the vertical team headers and shortens the column.

```text
[3px team bar] Bank Leadership   Intelligence Database          Ventus
               Bank Leadership   Ventus AI Coworker             Email
               Product & Growth  Personalized Relationship      Ventus
               Product & Growth  Automations Campaign           CRM
               Product & Growth  Custom Product Builder         CRM
               Product & Growth  Personalized Product Offer     CRM
               Rewards & Deals   Personalized Reward Program    Digital Banking
               Rewards & Deals   Local Merchant Deals           Ventus
               Rewards & Deals   Loyalty & Retention            Digital Banking
```

- Each row: left 3px team color bar, tinted team label chip, 12.5px destination name, right-side mono channel chip on slate-100.
- Team colors: Bank Leadership `#2563EB`, Product & Growth `#37B389`, Rewards & Deals `#B4722A`.
- Header meta reads `3 teams · 9`.
- Note the reference moves "Personalized Relationship" under Product & Growth and renames "Royalty and Retention" to "Loyalty & Retention".

## Technical notes

- Single file: `src/components/tepilot/insights/CapabilitiesView.tsx`.
- Replace the `sourceGroups` array contents (keeping the `SourceGroup` shape and existing input objects, regrouped) and restyle `SourceGroupCard` to the reference row.
- Replace `DESTINATION_GROUPS` with a flat `DESTINATIONS` list carrying `{ name, channel, team }` plus a `TEAMS` color map; drop `NodeCard` usage in this column (keep the component if used elsewhere).
- Presentation and data-labeling only — no backend, routing, or taxonomy changes. Strict light theme, no `dark:` utilities.

## Verification

Load /bankdemo → System tab, confirm the 5 source rows and 9 destination rows render as above and that source click-through still opens the detail panel.
