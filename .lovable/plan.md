

## Add "Next-Product" Tab Using Existing Life Events Detection

### Concept
Reuse the existing `analyze-lifestyle-signals` edge function (which already detects life events like college prep, home purchase, etc. and returns financial projections with recommended products) to power a new "Next-Product" tab. No new edge function needed — just call the existing one after persona synthesis and map its output to personalized product cards.

### Data Flow
```text
classify-transactions → persona synthesis
                              ↓
              analyze-lifestyle-signals  (EXISTING)
                              ↓
              Intel Panel: life event → product rationale
              Phone View: personalized product card
```

The `analyze-lifestyle-signals` already returns per-event:
- `event_name` (e.g., "College Preparation for Dependent")
- `confidence` score
- `evidence` (merchant, amount, date, relevance)
- `talking_points`
- `financial_projection.recommended_funding_sources` (529, HYSA, etc.)

### Changes

**File: `src/pages/ExecDemoPage.tsx`** (~30 lines changed)
- Add `"product"` to `TabKey` union and `TAB_ORDER`
- Add `detectedLifeEvents` state + `productsLoading` state
- After persona synthesis completes, fire `analyze-lifestyle-signals` (passing the customer profile + enriched transactions) in parallel with `generate-next-offers`
- Pass `detectedLifeEvents` + `productsLoading` down to intel panel and phone view
- Enable phone content when product tab is active

**New component: `src/components/exec-demo/NextProductRationale.tsx`** (~140 lines)
- Intel panel content for the "Next-Product" tab
- Strategy header: "X life events detected → Y product recommendations"
- Per-event cards showing: event name, confidence badge, evidence chain (merchant names), and recommended financial products (529 Plan, HYSA, etc.) with personalized messages derived from talking points
- Loading skeleton matching existing pattern

**New component: `src/components/exec-demo/ProductRecommendationPhoneView.tsx`** (~100 lines)
- Consumer-facing phone mockup view
- Hero card with warm personalized message (e.g., "Big milestones for the family ahead? Start putting your money to work now — explore a 529 Plan or High-Yield Savings Account.")
- Uses `talking_points` from the life event for the message copy
- Product badges from `recommended_funding_sources`
- Smaller secondary cards for additional detected events

**File: `src/components/exec-demo/ExecDemoIntelPanel.tsx`** (~15 lines changed)
- Add `"product"` to `TabKey`, `TAB_ORDER`, and `TAB_META` (icon: `CreditCard`, label: "Next-Product")
- Add `detectedLifeEvents` and `productsLoading` props
- Render `NextProductRationale` when `activeTab === "product"`

**File: `src/components/exec-demo/ExecDemoPhoneView.tsx`** (~15 lines changed)
- Add `"product"` to `TabKey` and tab mapping
- Accept `detectedLifeEvents` prop
- Render `ProductRecommendationPhoneView` when product tab is active and events exist

### Technical Details
- The `analyze-lifestyle-signals` function takes `{ client, transactions, spending_summary }` — we construct `client` from the demo customer profile (name, age, occupation, family status) and pass enriched transactions
- The response shape `{ detected_events: [...] }` maps directly to product cards
- Each `financial_projection.recommended_funding_sources[].type` maps to a product name (529 → "529 College Savings Plan", HYSA → "High-Yield Savings Account", etc.)
- Each event's `talking_points` provide ready-made personalized messages for the phone view

Five files, ~300 lines new code. Zero new edge functions.

