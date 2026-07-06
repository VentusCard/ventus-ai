## What to add to External Intelligence

Reviewing the Data Axle screenshots against the current 9 inputs (Credit File, Wealth, Property, Demographics, Auto/VIN, Employment/income, Life events, Digital identity, Business owner identification), these attributes from the decks are **not yet represented** and are high-signal for a bank use case:

### Proposed new inputs (all non-FCRA)

1. **Neighborhood & community dimensions** — Census geo-aggregates: 700+ statistics, socio-economic status indicator, education/occupation/income by tract *(icon: MapPin)*
2. **Interests & hobbies** — Cooking, travel, apparel, outdoor, luxury affinities from surveys and subscriptions *(icon: Heart)*
3. **Public records** — Bankruptcies, liens, judgments, UCC filings *(icon: FileText)*
4. **Firmographics (business owner)** — SIC code, employee count, estimated sales volume, years in business, website — pairs with the Business Owner ID input *(icon: Building2)*
5. **Licenses & registrations** — Pilot, hunting, boat, driver's license history — wealth/lifestyle proxies *(icon: BadgeCheck)*
6. **New movers & pre-movers** — In-market relocation signal (pre-move intent + recent move flag) *(icon: Truck)*

### Skipped on purpose

- **Voter registration / political party** — regulated/sensitive for bank marketing; skip unless you want it
- **Ethnicity / race** — fair-lending risk; do not add
- **Marital status / children ages** — already covered by Demographics Data
- **Executive emails** — B2B contact enrichment, not relevant to consumer bank targeting  


Delete: Business Owner Identification chip

### Implementation

Edit `src/components/tepilot/insights/CapabilitiesView.tsx`:

- Add `MapPin, Heart, FileText, BadgeCheck, Truck` to the lucide-react import (Building2 already imported)
- Append the 6 items to the `inputs` array of the `External Intelligence` provider (lines 643–653)
- All 6 keep the default (non-FCRA) badge; only Credit File stays FCRA

Confirm the list (or tell me which to drop / whether to include voter registration) and I'll build.