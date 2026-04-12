

## Risk Factors & Standout Transactions — Consumer Chatbot Integration

### What We're Building
A new edge function `detect-risk-transactions` that analyzes enriched transactions for four risk categories, surfaced as a quick action button in the consumer chatbot.

### How It Works

```text
User taps "Risk factors" quick action
        ↓
Frontend calls detect-risk-transactions edge function
  with enriched transaction data
        ↓
Edge function (Gemini 3 Flash) analyzes for:
  • Fraud signals (unusual merchants, duplicate charges, geo anomalies)
  • AML patterns (structuring, round-number deposits, rapid movement)
  • Vice indicators (gambling, adult content, cash advances, payday loans)
  • Spending habit shifts (sudden spikes, new high-frequency categories)
        ↓
Returns structured JSON: array of flagged transactions with
  category, severity (low/medium/high), description
        ↓
Chatbot formats and displays results as a markdown message
```

### Technical Details

**New edge function:** `supabase/functions/detect-risk-transactions/index.ts`
- Receives enriched transactions array (merchant, amount, date, pillar, category, subcategory, frequency, spending_tier)
- Sends to Gemini 3 Flash with a structured analysis prompt
- Returns JSON: `{ flags: [{ transaction_id, category: "fraud"|"aml"|"vice"|"habit_shift", severity, merchant, amount, date, reason }], summary: string }`

**Edit:** `src/components/demo/ConsumerAIChatView.tsx`
- Add "Risk factors & alerts" to `QUICK_ACTIONS` array
- In `sendMessage`, detect this specific action and call `detect-risk-transactions` instead of `consumer-chat`
- Format the returned flags into a readable markdown message (grouped by category with severity badges) and push as an assistant message
- Follow-up questions about flagged items continue through the normal `consumer-chat` flow (the flags are added to conversation history as context)

**No database changes needed.** One new edge function, one file edit.

