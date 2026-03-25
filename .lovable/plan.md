

## Plan: Enable Single-Customer Enrichment in Demo

Currently the demo requires both Customer A and Customer B to be selected before enrichment can run. This change allows processing with just one customer selected.

### Changes

#### 1. `src/components/demo/DemoCustomerPanel.tsx`
- Change the enrich button's `disabled` condition from `!customerA || !customerB` to `!customerA && !customerB` (at least one must be selected)
- Update button text to say "Enrich Customer" (singular) when only one is selected, "Enrich Both Customers" when two are selected

#### 2. `src/pages/DemoPage.tsx`
- Update `handleEnrich` to work when only one customer is selected (currently guards on both existing)
- Pass whichever customer(s) are available to `startEnrichment`

#### 3. `src/hooks/useDemoEnrichment.ts`
- Update `startEnrichment` signature to accept optional customers: `(customerA: DemoCustomer | null, customerB: DemoCustomer | null)`
- Make the "B" enrichment pipeline conditional — skip SSE classification, deal personalization, lifestyle signals, and coaching tips for the missing customer
- Adjust `maybeStartPhase2` to proceed when only the present customer's classification is complete (instead of requiring both)
- Handle the duplicate-check (`lastEnrichedRef`) to work with one or two customers

#### 4. `src/components/demo/DemoNetworkDiagram.tsx`
- Minor: when only one customer is present, only show that customer's placeholder/card (cosmetic, low priority — can keep both boxes but only populate one)

### Scope
This is primarily a logic change in the enrichment hook and button enablement. The overlay views already handle null data gracefully for the most part.

