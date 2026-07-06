## Plan: Expand "Bank Context" to 6 elements in the Systems tab

### Goal

Replace the current 2-item "Bank Context" source group in `CapabilitiesView.tsx` with 6 distinct elements that give Ventus richer bank-native context for personalization.

### Proposed 6 elements

1. **Consumer Banking Products** — Checking, savings, debit, credit cards, digital wallets
2. **Consumer Lending Products** — Mortgages, auto, personal, HELOC, student loans
3. **Wealth & Investment Products** — Brokerage, managed portfolios, trusts, advisory tiers
4. **Locations & Hours** — Branch network, ATM coverage, regional operating hours, holiday schedules
5. **Departments** — RM assignment rules, advisor specializations, support queues, escalation paths
6. **Customer Segments & Tiers** — Mass market, affluent, private-banking thresholds, qualification criteria, service-level differences

### Implementation steps

1. **Update `CapabilitiesView.tsx**` — In the `sourceGroups` array, expand the "Bank Context" group's `inputs` array from 2 to 6 items. Update the description to reflect the broader scope.
2. **No new files** — This is a data-only change inside the existing component.
3. **No backend changes** — Purely presentational, consistent with the existing static source-group pattern.

### Out of scope

- No changes to other source groups (KYC, Transactions, etc.)
- No changes to the detail panel behavior or the network visualization wiring.

If you prefer a different 6th element (e.g., "Rate & Fee Schedule" or "Campaign Calendar"), let me know and I'll adjust before implementing.