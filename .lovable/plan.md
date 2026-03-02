
## Merge Trip Card and Hospitality Greeting (No Dates)

**File: `src/components/PlatformTabs.tsx`** — lines 220-240

### What changes

Replace the two separate cards (Detected Trip card + hospitality greeting) with a single merged card. Remove dates and transaction stats since the customer is already in Miami during the trip.

### New merged card content

```text
[Detected Trip badge]  Miami, FL
Hi John, welcome to Miami!
Your Ventus Bank Membership gets you the following deals:
[green dot] Inferred from spending patterns - no location tracking
```

### Technical detail

- Remove: date range ("Mar 12 - Mar 17") — not needed during the trip
- Remove: "14 transactions" and "$4,280 total spend" — not relevant to the greeting
- Remove: the separate hospitality greeting card (lines 237-240)
- Merge the greeting text into the trip card body
- Keep: "Detected Trip" badge, "Miami, FL", privacy disclaimer, greeting text
- Styling: single `rounded-lg border border-gray-100 p-3` container
