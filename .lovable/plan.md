

## Plan: Add Cross-Sell & Personalized Targeting Section to /analytics

### What exists in TePilot that's relevant
The TePilot dashboard already has rich cross-sell and targeting features:
- **Cross-Sell Matrix** — card-to-card opportunity sizing with color-coded heatmap
- **Revenue Opportunities Card** — spending gap detection with merchant partnership pitches (win-win proposals, timing, conversion rates)
- **Campaign Studio** — multi-dimensional segment builder (lifestyle pillars, life events, products, demographics, geography) with AI-generated campaign briefs
- **Segment Builder** — audience targeting by life events, lifestyle signals, and product holdings

### What to add to /analytics page

Add a new **Section 3.5** (between "See It In Action" and "Capabilities") titled something like **"From Insight to Action"** or **"Personalized Cross-Sell & Targeting"**. This section demonstrates how banks use the analytics intelligence to drive personalized campaigns and cross-sell.

#### Content structure (3 subsections):

**1. Behavioral Segmentation → Targeting**
A visual showing how lifestyle pillars translate into targetable customer segments. Example: animated cards showing a customer segment ("Wellness Explorers — 4.2M users") with their top spending pillars and a recommended cross-sell product.

**2. Cross-Sell Opportunity Matrix (static demo)**
A simplified version of the TePilot CrossSellMatrix — a small 4x4 heatmap showing card-to-card cross-sell opportunities with dollar values. Animates in on scroll like the existing demo panel.

**3. AI-Powered Campaign Activation**
Show how segments flow into campaign briefs. A compact mockup showing: segment definition → AI-generated personalized message → channel delivery (email, push, SMS, in-app). Could reuse the campaign brief concept from CampaignStudio.

#### Technical approach
- All static/hardcoded demo data (no API calls needed)
- Reuse the same scroll-triggered animation pattern (IntersectionObserver) already used on the page
- Same design language: white bg, rounded-xl cards, blue accents, gray-900 headings
- Add between current Section 3 (demo) and Section 4 (capabilities)
- Single file edit to `src/pages/BankWideAnalytics.tsx`

#### Rough layout
```text
┌──────────────────────────────────────────────┐
│  PERSONALIZED CROSS-SELL & TARGETING         │
│  "Turn spending patterns into revenue."      │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ Segment  │  │ Cross-  │  │Campaign │     │
│  │ Card     │→ │ Sell    │→ │ Brief   │     │
│  │ "Travel  │  │ Matrix  │  │ Preview │     │
│  │  Lovers" │  │ snippet │  │         │     │
│  └─────────┘  └─────────┘  └─────────┘     │
│                                              │
│  3-step flow: Detect → Match → Activate      │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  Mini cross-sell heatmap (4x4)       │    │
│  │  with animated fill on scroll        │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  AI Insight callout:                         │
│  "12.3M users show Travel+Dining overlap     │
│   — ideal for co-branded card upsell"        │
│                                              │
└──────────────────────────────────────────────┘
```

### Files to modify
- `src/pages/BankWideAnalytics.tsx` — add the new section with static demo data and scroll animations

