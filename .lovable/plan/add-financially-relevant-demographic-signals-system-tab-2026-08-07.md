# Add financially-relevant Demographic signals (System tab)

Extend the **Demographic** signal card in the /bankdemo System tab with attributes that carry direct financial implication — starting with business ownership.

## New signals to add

- **Self-employed / 1099 household** — quarterly estimated tax payments, irregular platform inflows (Uber, DoorDash, Upwork), no single employer ACH
- **Small business owner** — business banking deposits, merchant-services volume (Stripe, Square, Toast), commercial insurance, wholesale suppliers
- **Multi-property household** — two or more distinct mortgage/HOA/property-tax streams
- **Rental income earner** — recurring inbound rent deposits or property-management payouts
- **Household with dependents in college** — bursar/tuition outflows plus 529 distributions
- **High-net-worth indicator** — advisory fees, trust services, private-client banking outflows
- **Recently relocated household** — sustained merchant footprint shift into a new metro

Each entry follows the existing `label` + `sublabel` format (short evidence description), matching how the other four families render.

## Technical notes

Single file: `src/components/tepilot/insights/CapabilitiesView.tsx` — append entries to the `items` array of the `Demographic` team-detail block (currently lines 162–173). No logic, backend, or styling changes; the expanded card grid already handles a longer list.
