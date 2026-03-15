

## Plan: Wire AI-Detected Life Events to Demo + Rich PrepareEventDialog UI

### Problem
1. The `analyze-lifestyle-signals` edge function IS called during enrichment, but the response is **discarded** — never stored in state
2. `DemoLifeEventsView` currently renders hardcoded `lifeEvents` from `demoData.ts` instead of AI-detected events
3. The life event cards are minimal — no supporting transactions, insights, or action buttons

### Target
- Show **one AI-detected life event per customer** with the rich PrepareEventDialog-style UI:
  - Supporting transaction evidence (from the AI response)
  - Ventus AI Insights paragraph
  - Recommended Next Steps
  - Action buttons: "Prepare with Ventus WM Co-Pilot", "Download PDF", "Email Me Summary"

### Changes

**File 1: `src/hooks/useDemoEnrichment.ts`**
- Store lifestyle signals response in new state: `lifestyleSignalsA` and `lifestyleSignalsB`
- The edge function currently only runs for `customerA`'s transactions — run it for **both** customers separately
- Each call returns `{ detected_events: [{ event_name, confidence, evidence: [{merchant, amount, date, relevance}], talking_points, financial_projection }] }`
- Store just the first detected event per customer
- Export these from the hook return value
- Add a new type `DetectedLifeEventResult` to capture the AI response shape

**File 2: `src/components/demo/DemoDetailOverlay.tsx`**
- Pass the stored lifestyle signals data to `DemoLifeEventsView`
- Remove `lifeEvents` from `SIMPLE_VIEW_MAP` since it now needs enriched data props

**File 3: `src/components/demo/DemoLifeEventsView.tsx`** (major rewrite)
- Accept new optional props: `lifestyleSignalA` and `lifestyleSignalB` (the AI-detected event objects)
- For each customer, render **one** life event card matching the PrepareEventDialog layout:
  - **Header**: Event name + confidence badge
  - **Supporting Transactions**: Chronological list with merchant, amount, date, and relevance explanation (from AI `evidence` array)
  - **Ventus AI Insights**: Use `mockInsightsByEventType` mapped from the event name, or fall back to a generated summary from the talking points
  - **Recommended Next Steps**: Use `getRecommendedSteps` mapped from the event name, or derive from talking points
  - **Action Buttons**: "Prepare with Ventus", "Download PDF", "Email Me Summary" — show toast on click (demo context)
- Fall back to the first hardcoded `lifeEvents` entry if AI data isn't available

**File 4: `src/pages/DemoPage.tsx`** (or wherever `useDemoEnrichment` is consumed)
- Pass the new lifestyle signal state down through `DemoDetailOverlay`

### Event Type Mapping
The AI returns `event_name` as a free-text string (e.g., "College Preparation for Child"). To map to `mockInsightsByEventType` keys, implement a keyword-based mapper:
- "retirement" / "401k" → `retirement`
- "college" / "education" / "school" → `education`
- "home" / "house" / "mortgage" → `home_purchase`
- "baby" / "family" / "child" / "nursery" → `family_formation`
- "elder" / "aging" / "senior" → `elder_care`
- "business" / "exit" / "liquidity" → `business_liquidity`
- "estate" / "wealth transfer" / "trust" → `wealth_transfer`
- Default → `retirement`

### Data Flow
```text
useDemoEnrichment
  → calls analyze-lifestyle-signals for each customer
  → stores first detected_event per customer in state
  → passes down via DemoDetailOverlay props
  → DemoLifeEventsView renders rich card per customer
```

