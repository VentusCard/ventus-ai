

# Build Life Event Detection Demo for Wealth Management Page

## What's Being Built
An interactive animated demo for the `/wealth` page's "See It In Action" section, modeled after the actual Life Events Alert Dashboard in TEPilot. The demo will simulate the Ventus AI life event detection pipeline: transactions scroll in, behavioral signals are identified, life events are detected with confidence scores, and advisor action items populate -- all in an auto-looping animation.

## Demo Layout: 3-Panel Life Event Detection Simulator

The animation uses a 3-column layout that mirrors the real Advisor Console workflow:

**Left Panel -- Transaction Signal Feed**
Transactions scroll in one by one with fade-in animations. As transactions accumulate, the system highlights clusters that form life event signals (e.g., College Board + Princeton Review + campus travel = "Education Funding"). Each transaction shows merchant, amount, date, and card type badge.

**Center Panel -- Detected Life Events**
As transaction clusters are identified, life event cards appear with:
- Event type icon and label (color-coded: amber for Retirement, blue for Education, green for Home Purchase, etc.)
- Confidence percentage badge
- Urgency indicator (Urgent / Soon / Upcoming)
- Estimated timing
- Key evidence summary (one-line from the transactions)

**Right Panel -- Advisor Action Items**
When a life event is detected, corresponding advisor recommendations slide in:
- Numbered action steps specific to each event type
- A "Ventus AI Insight" summary paragraph describing behavioral context
- Meeting prep assembles progressively as more events are detected

### Client Profile Header
A client card sits above the 3 panels showing: "Margaret Chen" | Private Wealth | AUM: $4.2M | Tenure: 12 years -- with segment badge styling matching the real dashboard.

### Animation Flow (auto-looping, cycles through 5 life events)
1. Client profile header fades in
2. **Retirement Planning** (91% confidence): Fidelity 401k increase, AARP enrollment, Viking Cruises booking scroll into left panel. Center panel shows detected event with amber Sunset icon. Right panel shows "Schedule retirement review," "Discuss Roth conversion strategy"
3. Brief pause, then **Education Funding** (82%): College Board fees, Princeton Review, campus visit travel appear. Blue GraduationCap event card. Action items: "Initiate 529 plan discussion," "Calculate projected costs"
4. **Home Purchase** (87%): Home Depot, Earnest Money Deposit, U-Haul appear. Green Home event card. Actions: "Analyze liquid assets for down payment," "Compare mortgage scenarios"
5. **Family Formation** (76%): Baby registry, Buy Buy Baby, hospital pre-registration. Pink Baby event card. Actions: "Introduce 529 plan options," "Benchmark life insurance needs"
6. **Elder Care** (68%): Medical Guardian, accessibility modifications, Sunrise Senior Living. Red Heart event card. Actions: "Assess long-term care insurance," "Review Medicaid look-back"
7. Summary metrics bar animates: "5 Events Detected | 2 Urgent | 3 This Quarter"
8. Brief pause, then resets and loops

### Interactive Controls
- **Life event pills** at the top (like lifestyle indicators in Smart Rewards) -- clicking one jumps to that event's detection sequence
- Pause / Resume / Reset buttons
- Step counter: "Step 2/5 -- Detecting: Education Funding"

## Technical Approach

### Architecture
Same pattern as `VentusSmartRewards.tsx`: React component using `useRef` + direct DOM manipulation via `innerHTML` for high-performance animations. All CSS scoped with `.vwm-` prefix. Self-contained with all static data built in.

### Static Data (pulled directly from real TEPilot data)
- Transaction data from `PrepareEventDialog.tsx`'s `transactionsByEventType` (5 events x 5-6 transactions each)
- Recommended steps from `recommendedStepsByEventType`
- AI insights from `mockInsightsByEventType`
- Life event config (icons, colors, labels) from `LIFE_EVENT_CONFIG`
- Client profile: Margaret Chen, Private, $4.2M AUM

### Responsive Scaling
`.vwm-scale-wrapper` with `transform: scale()`:
- Tablet (max-width 1024px): scale 0.7, margin-bottom -30%
- Mobile (max-width 767px): scale 0.5, margin-bottom -50%

## Changes

### 1. New File: `src/components/technology/demos/VentusWealthDemo.tsx`
Self-contained React component (~800-1000 lines) with:
- Static data arrays for all 5 life event types (transactions, events, actions, insights)
- Animation engine cycling through events with `setInterval`
- 3-column grid layout with scrolling transaction feed, event detection cards, and action items
- Dark theme with colored accents matching each event type
- Interactive pills and playback controls

### 2. Modified File: `src/pages/Wealth.tsx`
- Remove `AnimatedDemo` and `wealthDemoHtml` imports
- Import and embed `VentusWealthDemo` component in "See It In Action" section
- Widen all containers from `max-w-6xl` to `max-w-7xl`
- Compress Hero padding from `py-16 md:py-24` to `py-6 md:py-10`
- Compress Overview padding from `py-12` to `py-4`
- Reduce main bottom padding from `pb-16` to `pb-10`

### 3. Deletable: `src/components/technology/demos/wealth-demo.ts`
The placeholder file becomes unused and can be removed.

