# Empty state before a customer is selected

Today the personalization workspace auto-selects the first example customer (Ricky), so signals and the iPad mockup are populated before the banker does anything. Instead, the workspace should start empty and only fill in once a customer is chosen.

## Behavior

- On load, no customer is selected — this applies to all three personalization tabs (Deals, Product, Relationship), which share one selection.
- Left "Customer Selection" card: search bar only, plus a quiet placeholder where the signal pills normally sit ("Search and select a customer to view their detected signals").
- Right surface card: title stays ("Personalized Rewards / Product / Relationship"), the iPad/phone mockup is replaced by a blank placeholder area with a short prompt ("Select a customer to generate their personalized surface"). No device chrome content, no offers, no name in the header.
- No generation runs while nothing is selected (no offer/product calls fired), so no wasted latency or credits.
- Selecting a customer from search — or the live session pill — switches to the current populated view exactly as it works now.
- Once a customer is selected there is no way back to the empty state; the selection persists across tab switches as it does today.

## Technical notes

- `src/lib/personalizationCustomerStore.ts`: initial selection becomes `null` instead of `EXAMPLE_CUSTOMERS[0].id`; type widens to `string | null`.
- `src/components/tepilot/insights/CustomerMockupPanel.tsx`: skip the `ensurePersonalization` effect when nothing is selected; branch to placeholder blocks for the left panel and the mockup column; drop the "· name" header suffix and the caption line when empty.
- Any other consumer of `usePersonalizationCustomer` (personalization views/generation helpers) gets a null guard so nothing dereferences a missing example.
- Layout heights stay unchanged so the workspace does not shift when a customer is picked.
