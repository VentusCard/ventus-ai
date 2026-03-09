

## Plan: Personalization Preview Tool for Segment Builder

### Vision
Transform the Segment Builder's goal from "define an audience" to **"preview how the same campaign personalizes differently for sample customers"** — matching the `/analytics` "Hyper-Personalized Messaging" demo (Sarah M. gets European travel messaging, James T. gets Hawaii messaging, both for the same Travel Card product).

### Current State
- `SegmentBuilder.tsx` focuses on targeting criteria (Life Events, Lifestyle Pillars, Product Holdings) and audience sizing
- The personalization preview exists in `DealActivationPreview.tsx` and `ComparisonRewardsView.tsx` for enriched transactions
- `/analytics` has a static "Hyper-Personalized Messaging" section showing 3 profile cards with distinct AI-generated messages for the same product

### New Flow

**1. Product Selection (New)**
- Add a product selector at the top: "What product are you promoting?"
- Options: Travel Card, Rewards Card, Premium Card, Wealth Management Suite, etc.
- This becomes the "anchor" — the same product shown across all sample profiles

**2. Sample Persona Gallery (New)**
- Below targeting criteria, show 3 synthetic sample profiles that MATCH the selected segment
- Each card displays:
  - Name + avatar
  - Behavioral tags (from selected pillars/life events)
  - Transaction signals (e.g., "12 Paris flights", "Hawaii resort bookings")
  - AI-generated personalized message for the SAME product

**3. Real-Time Personalization**
- When user adjusts targeting (e.g., adds "Travel & Exploration" pillar), the sample personas update to reflect that pillar
- AI generates distinct messaging for each persona based on their unique signals
- Uses existing `deal-personalization` edge function

### UI Changes

```text
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Segment Builder                                             │
├─────────────────────────────────────────────────────────────────┤
│  What product are you promoting?                                │
│  [Travel Card ▾]                                                │
├─────────────────────────────────────────────────────────────────┤
│  [Life Events] [Lifestyle Pillars] [Product Holdings]           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Select targeting criteria...                            │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│  📊 Same Product, Three Stories                                 │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐          │
│  │ Sarah M.      │ │ James T.      │ │ Priya K.      │          │
│  │ 🇫🇷 European  │ │ 🌺 Hawaii     │ │ ✈️ Business   │          │
│  │ Travel        │ │ Enthusiast    │ │ Travel        │          │
│  ├───────────────┤ ├───────────────┤ ├───────────────┤          │
│  │ 4 Paris trips │ │ 3 Honolulu    │ │ 22 domestic   │          │
│  │ Fine dining   │ │ Resort stays  │ │ Lounge visits │          │
│  ├───────────────┤ ├───────────────┤ ├───────────────┤          │
│  │ "Reward your  │ │ "Alohas from  │ │ "Turn every   │          │
│  │ next European │ │ Hawaii are    │ │ business trip │          │
│  │ getaway..."   │ │ sweeter..."   │ │ into rewards" │          │
│  └───────────────┘ └───────────────┘ └───────────────┘          │
│                                                                 │
│  [Generate More] [3.8x higher conversion vs generic campaigns]  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Steps

**1. Create `PersonalizationPreviewPanel.tsx`**
- New component showing 3 sample persona cards
- Receives: selected product, selected pillars, selected life events
- Generates synthetic transaction signals matching the targeting criteria
- Calls `deal-personalization` edge function to get AI-personalized messages
- Displays conversion lift insight

**2. Create sample persona generator utility**
- `lib/samplePersonaGenerator.ts`
- Takes targeting criteria and generates 3 distinct synthetic profiles
- Each profile has: name, avatar color, behavioral tags, transaction signals
- Signals are randomly generated to match selected pillars/events

**3. Modify `SegmentBuilder.tsx`**
- Add product selector dropdown at the top
- Add `PersonalizationPreviewPanel` below targeting tabs
- Pass selected criteria to the preview panel

**4. Style matching `/analytics` page**
- Use same card layout as `CrossSellTargetingSection`
- Gradient backgrounds per profile
- AI-Generated Message callout box
- Conversion lift badge

### Files Changed
- `src/components/tepilot/campaigns/SegmentBuilder.tsx` — add product selector + preview panel
- `src/components/tepilot/campaigns/PersonalizationPreviewPanel.tsx` — new component
- `src/lib/samplePersonaGenerator.ts` — new utility for synthetic profiles
- `src/lib/campaignStudioData.ts` — add product catalog for selector

