

## Expand Beat 5 Cards — Full Width with Example Sub-Cards

**File**: `src/components/demo/DemoPasswordGate.tsx`

**Lines 526–553** — Replace the three compact stacked cards with three full-width cards, each containing a title row and a grid of 4 small nested example cards.

### Card structure (each card):
```text
┌─────────────────────────────────────────────────────┐
│ 🎁  Personalized Rewards                            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ 🍼 Baby      │ │ 📚 Pregnancy │ │ 🧸 Strollers │ │ 🏥 Prenatal  │ │
│ │ Monitors     │ │ Books &      │ │ & Car Seats  │ │ Classes &    │ │
│ │              │ │ Audiobooks   │ │              │ │ Services     │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Content for each card:

**🎁 Personalized Rewards** — life-stage matched offers:
- 🍼 Baby Monitors & Gear
- 📚 Pregnancy Books & Audiobooks
- 🧸 Strollers & Car Seats
- 🏥 Prenatal Classes & Services

**🤝 Personalized Relationship** — advisor talking points:
- 📋 529 Plan Setup
- 🏠 Home Space Planning
- 🛡️ Life Insurance Review
- 💰 Emergency Fund Boost

**📱 Personalized UX** — app experience changes:
- 📊 "Family & Foundation" Pillar
- 🎯 Baby Budget Tracker
- 🔔 Parenting Milestone Alerts
- 🏷️ Family Deal Highlights

Each nested card: white background, rounded-lg border, small emoji + bold label, ~2-word subtitle. Grid is `grid-cols-2 sm:grid-cols-4 gap-2`.

