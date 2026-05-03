## Update "Hands Off To" chips to consumer-facing handoffs

In `src/components/exec-demo/NextConversationRationale.tsx`, replace the `HANDOFF_ITEMS` array with consumer-facing destinations (people/teams a customer would actually be routed to), instead of internal channels.

### New chips

```ts
const HANDOFF_ITEMS = [
  "Wealth Advisor",
  "Account Opening",
  "Customer Service",
  "Branch Banker",
  "Mortgage Specialist",
];
```

No other changes. `INGEST_ITEMS` and layout remain as-is.
