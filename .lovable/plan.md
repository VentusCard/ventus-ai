

## Plan: Add "Deep Personalization" Showcase to Cross-Sell Section

### Concept
Add a new subsection after the Campaign Activation flow that demonstrates how the **same cross-sell product** generates completely different messaging per customer based on their transaction history and lifestyle signals. This is the key differentiator — not just *who* to target, but *what to say*.

### Design: "Same Product, Different Story"
A visual showing **one product** (e.g., "Co-Branded Travel Card") being pitched to **3 different customer profiles**, each with a unique AI-generated message derived from their spending behavior:

```text
┌─────────────────────────────────────────────────────┐
│  HYPER-PERSONALIZED MESSAGING                       │
│  "Same product. Three completely different stories." │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─ Customer A ──────────────────────────────────┐  │
│  │ 👤 Sarah M. · European Travel + Fine Dining   │  │
│  │ Signals: 4 Paris flights, 12 Michelin reviews  │  │
│  │ ┌──────────────────────────────────────────┐   │  │
│  │ │ ✉ "Reward your next European summer       │   │  │
│  │ │   getaway — 3x points on flights & dining"│   │  │
│  │ └──────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ Customer B ──────────────────────────────────┐  │
│  │ 👤 James T. · Hawaii Enthusiast + Family      │  │
│  │ Signals: 3 Honolulu trips, resort bookings     │  │
│  │ ┌──────────────────────────────────────────┐   │  │
│  │ │ ✉ "Alohas from Hawaii are sweeter with    │   │  │
│  │ │   5x points on island stays & dining"     │   │  │
│  │ └──────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ Customer C ──────────────────────────────────┐  │
│  │ 👤 Priya K. · Business Travel + Wellness      │  │
│  │ Signals: 22 domestic flights, lounge access    │  │
│  │ ┌──────────────────────────────────────────┐   │  │
│  │ │ ✉ "Turn every business trip into first-   │   │  │
│  │ │   class rewards — lounge access included" │   │  │
│  │ └──────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  💡 AI Insight: "Personalized messaging drives      │
│     3.2x higher conversion vs. generic campaigns"   │
└─────────────────────────────────────────────────────┘
```

### Key Details
- Each profile card shows: name, lifestyle tags, 2-3 behavioral signals (kept general per privacy rules — no exact amounts), and the personalized message in a styled "email preview" block
- All 3 cards target the **same product** ("Co-Branded Travel Card") — the header makes this explicit
- Cards animate in staggered on scroll (same IntersectionObserver pattern)
- The personalized message block has a subtle gradient/highlight to draw the eye
- Ends with an AI insight callout about conversion lift from personalization

### Technical Approach
- Add to `CrossSellTargetingSection.tsx` as a 4th subsection after Campaign Activation
- Static data, no API calls
- Same animation pattern already in use

