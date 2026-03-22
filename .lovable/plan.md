

## Rebuild Financial Journey View — Full Product Opportunity Explorer

### Concept
Side-by-side comparison showing **all financial products** each customer does NOT currently hold, organized by category. Products they hold are inferred from their CSV `source` column (e.g., "Cashback Card" → Basic Cashback, "Travel Card" → Travel Rewards, "Checking" → Checking, "HSA" → HSA, "Premium Card" → World Elite). The `digital_services` category is excluded entirely (not financial products).

### Changes

**1. `src/components/demo/DemoFinancialJourneyView.tsx` — full rebuild**

- **Source-to-product mapping**: Parse each customer's `sampleTransactions` sources to determine held products. Map source names to `JOURNEY_PRODUCTS` entries (e.g., "Premium Card" → "World Elite", "Cashback Card" → "Basic Cashback", "Travel Card" → "Travel Rewards").
- **Filter products**: Import `JOURNEY_PRODUCTS` and `JOURNEY_CATEGORIES` from `financialJourneyData.ts`. Exclude `digital_services` category. For each customer, split products into "held" vs "opportunity" lists.
- **Confidence scoring**: Score each un-held product (10–95%) based on:
  - Pillar affinity (travel pillar high → Travel Rewards card higher)
  - Detected life events (home event → Mortgage/HELOC, family → 529 Plan)
  - Adjacent products (if customer holds product X and X's `nextProductOpportunities` includes Y, boost Y)
  - Segment/AUM tier
- **Layout**: Side-by-side `grid-cols-2`. Each side shows:
  - Summary header: held product count, opportunity count, confidence breakdown (High/Med/Low)
  - Held products shown as small badges at top
  - Categories as collapsible sections (using Collapsible from radix) — category name, icon, opportunity count
  - Inside each category: collapsible product cards sorted by confidence desc
    - **Collapsed**: product name, confidence badge, signal type chip
    - **Expanded**: confidence score, signals detected (2-3 evidence lines), recommended next steps, downstream personalization row with action buttons (Email Campaign, SMS, In-App — toast on click), est. annual value
- **No digital services**: Filter out `digital_services` category entirely

**2. No changes to `demoData.ts`** — sources are already on `sampleTransactions`

### Files Modified
- `src/components/demo/DemoFinancialJourneyView.tsx` — full rebuild

