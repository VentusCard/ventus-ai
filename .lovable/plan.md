

## Build Consumer AI Chatbot + Unify Financial Tip Chat

### Overview

Create a new `consumer-chat` edge function and `ConsumerAIChatView` component for the AI tab. Additionally, update `FinancialTipCard` to use the same edge function, so one chatbot powers both experiences.

### Part 1: New Edge Function — `consumer-chat`

**File: `supabase/functions/consumer-chat/index.ts`**

- Accepts: `message`, `conversationHistory`, `context`
- Context includes: spending summary by pillar/category/merchant, subscriptions, demographics, life events, deals
- System prompt as a consumer banking assistant that:
  - Answers spending questions with real numbers ("Between different sports, you spent...")
  - Handles subscription, outflow, frequency queries
  - Recommends Bank of America products with application links
  - Surfaces life event intelligence subtly
  - Includes disclaimer about not being connected to a real bank
  - Supports a `mode` field — when `mode === "financial-tip-chat"`, switches to the financial coaching persona (same behavior as current tip chat but using the new function)
  - Tone: succinct, helpful, never inappropriate
- Model: `google/gemini-3-flash-preview`
- Standard CORS whitelist (matching existing pattern from advisor-chat)
- 429/402 error handling

### Part 2: New Chat Component — `ConsumerAIChatView`

**File: `src/components/demo/ConsumerAIChatView.tsx`**

- Mobile-banking chat UI fitting inside the iPad frame
- Welcome message + quick-action chips: "How much did I spend on sports?", "My subscriptions", "Product recommendations", "Life event insights"
- Markdown-rendered messages (ReactMarkdown)
- Calls `consumer-chat` edge function via `supabase.functions.invoke`
- Builds compact context payload from props: `enrichedTransactions`, `customer`, `detectedEvents`, `personalizedDeals`
- Context aggregation: totals by pillar, category, merchant, recurring/subscription detection, demographics, life events, deals

### Part 3: Wire AI Tab — `DemoDetailOverlay.tsx`

- Replace "Coming Soon" placeholder in `case "ai"` with `<ConsumerAIChatView>`
- Pass `customer`, `enriched`, `detectedEvents`, `personalizedDeals` props

### Part 4: Update FinancialTipCard to Use `consumer-chat`

**File: `src/components/tepilot/insights/FinancialTipCard.tsx`**

- Change `supabase.functions.invoke("advisor-chat", ...)` → `supabase.functions.invoke("consumer-chat", ...)`
- Keep the `mode: "financial-tip-chat"` context field so the edge function uses the coaching persona
- Pass enriched transactions context alongside the tip data for richer follow-up answers

### Files Changed
1. `supabase/functions/consumer-chat/index.ts` — new edge function
2. `src/components/demo/ConsumerAIChatView.tsx` — new chat component
3. `src/components/demo/DemoDetailOverlay.tsx` — wire AI tab
4. `src/components/tepilot/insights/FinancialTipCard.tsx` — switch to consumer-chat

