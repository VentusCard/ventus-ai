
# Plan: Add Prepare Dialog for Life Event Cards

## Overview
When users click the "Prepare" button on a Life Event Alert Card, a dialog will open showing:
1. **Transaction history across different card types** (Travel, Cashback, etc.) that indicate the detected event
2. **Recommended next steps** for the advisor
3. **"Email Me" button** to send a summary

---

## Components to Create/Modify

### 1. New Component: `PrepareEventDialog.tsx`
A new dialog component that displays when "Prepare" is clicked.

**Structure:**
- **Header**: Client name, event type badge, confidence score
- **Card Transactions Section**: Collapsible list showing transactions grouped by card type (e.g., "Travel Rewards Card", "Cashback Card")
  - Each transaction shows: merchant, amount, date, and relevance to the detected event
- **Recommended Next Steps**: Numbered checklist of actions the advisor should take
- **Footer Actions**: "Email Me" button and "Close" button

### 2. New Type: `CardTransaction` in `dashboardClient.ts`
```typescript
interface CardTransaction {
  cardType: string;       // e.g., "Travel Rewards", "Cashback Plus"
  cardLast4: string;      // e.g., "4532"
  merchant: string;
  amount: number;
  date: string;
  relevance: string;      // Why this transaction indicates the life event
}

interface EventPreparationData {
  transactions: CardTransaction[];
  recommendedSteps: string[];
}
```

### 3. Modify `LifeEventAlertCard.tsx`
- Update `onPrepare` callback to pass both `clientId` and `event` data
- Signature change: `onPrepare: (clientId: string, event: DetectedLifeEvent) => void`

### 4. Modify `LifeEventsAlertDashboard.tsx`
- Add state for the prepare dialog: `prepareDialogOpen` and `selectedPrepareData`
- Add handler to open dialog with mock/generated transaction data
- Render `PrepareEventDialog` component

### 5. Mock Data Generator: `generateEventTransactions()`
A utility function that generates realistic transaction data based on event type:
- **Retirement**: 401k contributions, financial advisor fees, AARP purchases
- **Home Purchase**: Zillow, Home Depot, moving companies
- **Education**: Tuition payments, textbook stores, SAT prep
- **Travel**: Airlines, hotels, luggage stores
- etc.

---

## UI Layout (PrepareEventDialog)

```text
+--------------------------------------------------+
| [Icon] Prepare: {Event Name}                     |
| Client: {Name} | {Segment} | Confidence: 87%     |
+--------------------------------------------------+
|                                                  |
| 📊 Evidence Transactions (12 total)              |
|   [v] Travel Rewards Card (...4532) - 5 txns     |
|       • Delta Airlines    $1,250   Jan 15        |
|       • Marriott Hotels   $890     Jan 16        |
|       ...                                        |
|   [v] Cashback Plus (...7891) - 4 txns           |
|       • Home Depot        $2,340   Feb 1         |
|       • Lowe's            $567     Feb 3         |
|                                                  |
| ✅ Recommended Next Steps                         |
|   1. Review recent large purchases pattern        |
|   2. Discuss retirement timeline expectations     |
|   3. Propose portfolio rebalancing consultation   |
|   4. Schedule follow-up in 2 weeks               |
|                                                  |
+--------------------------------------------------+
| [Email Me Summary]            [Ask Ventus] [Close]|
+--------------------------------------------------+
```

---

## Technical Details

### File Changes

| File | Action |
|------|--------|
| `src/types/dashboardClient.ts` | Add `CardTransaction` and `EventPreparationData` interfaces |
| `src/components/tepilot/advisor-console/PrepareEventDialog.tsx` | **New file** - Dialog component |
| `src/components/tepilot/advisor-console/LifeEventAlertCard.tsx` | Update `onPrepare` signature to include event |
| `src/components/tepilot/advisor-console/LifeEventsAlertDashboard.tsx` | Add dialog state, handler, and render dialog |

### Email Me Functionality
- Clicking "Email Me" will show a toast notification: "Summary sent to your email"
- For now, this will be a mock action (no actual email sent)
- Future integration could use an edge function to send the actual email

### Transaction Data Generation
Each life event type will have a curated set of realistic transactions:
- Grouped by card type with card last 4 digits
- Includes relevance explanation (e.g., "Consistent airline bookings suggest upcoming travel plans")
- Sorted by recency

---

## Implementation Order
1. Add new types to `dashboardClient.ts`
2. Create `PrepareEventDialog.tsx` component
3. Update `LifeEventAlertCard.tsx` callback signature
4. Update `LifeEventsAlertDashboard.tsx` to manage dialog state and render
