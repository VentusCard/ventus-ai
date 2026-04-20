
## Diagnosis
The AI chatbot inside the executive demo's phone mockup (`ConsumerAIChatView`) is rendered with **only `customer` + `initialMessage`**. None of the enriched data flowing through `ExecDemoPage` is wired in:

- ❌ `enriched` (transactions) — missing → AI can't cite spending
- ❌ `detectedEvents` — missing → "Life event insights" quick action is empty
- ❌ `personalizedDeals` — missing → "Product recommendations" has no deal context
- ❌ `riskFlags` — missing → "Risk factors & alerts" falls back to live edge-function call

Result: the chatbot is essentially answering blind from the customer profile alone, even though `ExecDemoPage` already has all of this state populated.

## Fix (2 small files)

### 1. `src/components/exec-demo/ExecDemoPhoneView.tsx`
Accept and pass through 4 new props to `<ConsumerAIChatView />`:
- `enriched: EnrichedTransaction[]` — pulled from `classifiedRef` at the page level, lifted into state
- `detectedLifeEvents` → mapped to `detectedEvents` shape (`event_name`, `confidence`, `talking_points`)
- `generatedOffers` → flattened to `personalizedDeals` shape (`deals: [{ merchantName, dealTitle, activationCount }]`) the chat already understands
- `riskFlags` — passed straight through

### 2. `src/pages/ExecDemoPage.tsx`
- Add `enrichedTxs` state (mirroring `classifiedRef.current`) so it can be passed down reactively, OR pass `classifiedRef.current` directly via a recomputed value on render.
- Add the 4 props to the `<ExecDemoPhoneView />` invocation: `enrichedTxs`, `detectedLifeEvents` (already present), `generatedOffers` (already present), `riskFlags`.

### 3. Light shape adapter in `ExecDemoPhoneView`
Since `generatedOffers` is `RollupOfferGroup[]` (not the `PersonalizedDealData` shape), do a tiny in-component flatten before passing to chat:
```ts
const personalizedDeals = generatedOffers
  ? { deals: generatedOffers.flatMap(g => g.offers).map(o => ({
      merchantName: o.merchantName, dealTitle: o.dealTitle, activationCount: o.matchScore ?? 90
    })) }
  : null;

const detectedEvents = detectedLifeEvents?.map(e => ({
  event_name: e.event_name, confidence: e.confidence, talking_points: e.talking_points
}));
```

(Exact field names verified against the `LifeEvent` and offer types during implementation.)

## Result
After the fix, the in-phone AI chat will have full context to answer spending questions with real $ amounts, list subscriptions from enriched transactions, surface detected life events, recommend products tied to actual signals, and skip the redundant risk-detection call.

## Out of scope
- No edge function changes (`consumer-chat` already accepts and uses all four context fields).
- No UI/copy changes to the chat panel itself.
