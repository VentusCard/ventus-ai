

## Redesign Financial Journey as Automation Queue

### Current State
The `DemoFinancialJourneyView` shows a static list of "Next Best Product" recommendation cards derived from hardcoded life events and spending patterns. It has no connection to the AI-detected life event results (`detectedEventA`/`detectedEventB`) and no personalized messaging.

### New Design: "Next Best Action Queue"
Each card becomes a queued automation item — like an outreach pipeline — showing:
1. **Status indicator** — Ready to Send / Queued / Scheduled — with a colored left border
2. **Product + Match score** (kept from current)
3. **Trigger source** — for Life Event triggers, show the actual AI-detected event name + confidence from `detectedEventA`/`detectedEventB` (passed as new props); for Spending Pattern triggers, show the pillar data
4. **Supporting evidence** — 2-3 bullet points: top transaction evidence from detected events, or spending stats
5. **Personalized message preview** — a short, customer-specific outreach message generated per recommendation (e.g., "Sarah, your recent career milestone suggests this may be the right time to explore investment advisory options.")
6. **Action buttons** — "Send Now" and "Schedule" (visual only, toast on click)

### Changes

**1. `src/components/demo/DemoDetailOverlay.tsx`**
- Move `lifeEvents` out of `SIMPLE_VIEW_MAP` so it receives `detectedEventA`/`detectedEventB` as props
- Pass detected events to `DemoFinancialJourneyView`

**2. `src/components/demo/DemoFinancialJourneyView.tsx`** — Full rewrite
- Accept new props: `detectedEventA`, `detectedEventB` (type `DetectedLifeEventResult[]`)
- Update `deriveRecommendations` to accept detected events and pull real evidence/talking points from them
- Each recommendation gains:
  - `status`: "ready" | "queued" | "scheduled" (deterministic based on match score)
  - `personalizedMessage`: generated string using customer name + event/pillar context
  - `evidence`: string[] pulled from detected event evidence or pillar stats
  - `triggerEvent`: optional reference to the matched `DetectedLifeEventResult`
- New card layout:
  - Left colored border (green=ready, amber=queued, blue=scheduled)
  - Top row: status pill, product name, match circle
  - Trigger badge row: signal type + detected event name/confidence
  - Evidence bullets (2-3 items)
  - Personalized message in a quote-style block
  - Bottom: "Send Now" / "Schedule" ghost buttons
- Remove the "Current Products" holdings section (already shown in Wealth view)

### Data Flow
```text
DemoDetailOverlay
  └─ node === "lifeEvents"
       └─ DemoFinancialJourneyView
            ├─ customerA, customerB (existing)
            └─ detectedEventA, detectedEventB (NEW — from AI detection)
                 └─ deriveRecommendations() matches life events
                      by name to pull real evidence + talking_points
```

### Personalized Message Generation
Deterministic template using customer name + event/product context:
- Life Event: `"Hi {name}, based on signals we've detected around {event_name}, we'd love to discuss how our {product} could support your next chapter."`
- Spending Pattern: `"Hi {name}, your {pillar} spending suggests you'd benefit from our {product} — let's make every dollar work harder."`
- Upgrade: `"Hi {name}, your activity qualifies you for {product} — unlock better rewards and dedicated support."`

Two files edited, no new files.

