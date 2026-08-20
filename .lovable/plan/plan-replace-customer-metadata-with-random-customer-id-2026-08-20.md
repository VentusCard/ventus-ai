# Plan: Replace Customer Metadata with Random Customer ID

## Goal
In the /bankdemo personalization customer search and selection UI, replace the visible city/segment/lifestyle metadata with a random numeric customer ID, and show that same ID next to the selected customer's name.

## Files to change

1. `src/lib/personalizationExamples.ts`
   - Add a `customerId: string` field to `ExampleCustomer`.
   - Generate a random 6-9 digit numeric ID for each of the 5 example customers (deterministic per customer, e.g. hashed from `id` or hardcoded).

2. `src/components/tepilot/insights/personalization/ExampleCustomerBar.tsx`
   - Replace the search-result subtext `{c.segment} · {c.city} · {c.lifestyleType}` with `Customer ID: {c.customerId}`.
   - Keep the search logic unchanged so users can still search by name, city, product, or signal.

3. `src/components/tepilot/insights/personalization/CustomerSignalPanel.tsx`
   - In the "User selected" header, append the customer ID after the customer name: `{customer.name} · {customer.customerId}`.
   - Style the ID as a muted, tabular-nums label so it reads as an identifier.

## Out of scope
- No changes to signal pills, mockup content, or LLM generation.
- No changes to search indexing or filtering behavior.

## Validation
- Open /bankdemo and navigate to any personalization tab.
- Click the customer search, type "Ricky", and confirm the suggestion shows "Ricky J" with "Customer ID: <number>" underneath.
- Select Ricky and confirm the left panel header reads "Ricky J · <same number>".
