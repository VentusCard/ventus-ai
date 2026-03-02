

## Update Platform Tab Previews: Rewards, Engagement, and Wealth

**File: `src/components/PlatformTabs.tsx`** — update three preview components.

---

### 1. RewardsPreview — Show Personalized Messages

Replace the generic "10% back" / "15% back" offer descriptions with AI-personalized marketing messages, mirroring the deal personalization from TEPilot's `DealActivationPreview`.

Each offer row will show:
- Merchant name (keep)
- A short, emotionally resonant personalized message in italics instead of the generic offer text (e.g., *"Your weekend trail runs deserve premium gear rewards"*)
- Match score (keep)
- Replace the static "Matched" badge with an "AI Personalized" badge

Sample personalized messages:
- **REI** (10% back): *"Your weekend trail runs deserve gear rewards"*
- **Patagonia** (15% back): *"Adventure-ready styles picked for you"*
- **Delta Miles** (2x miles): *"Your next mountain getaway, on us"*

This directly demonstrates that messaging is behavior-driven, not generic.

---

### 2. EngagementPreview — Show Pillars as Budgeting Tool

Replace the current generic lifestyle tiles with a budgeting-oriented view, mirroring TEPilot's `PillarExplorer` budget mode and `budgetUtils.ts` patterns.

New layout:
- **Header**: "Monthly Spending by Pillar" title
- **4 pillar rows**, each showing:
  - Pillar name
  - A progress bar showing spend vs. budget (color-coded: green = under, amber = near limit, red = over)
  - Spend / Budget text (e.g., "$480 / $500")
  - A small status label ("Under Budget", "Near Limit", "Over Budget")

Sample data:
- Travel: $1,240 / $1,500 (green, under)
- Dining: $480 / $500 (amber, near limit)
- Wellness: $320 / $250 (red, over budget)
- Shopping: $180 / $400 (green, under)

- **Bottom**: A compact insight line: "Wellness spending is 28% over budget this month" to show proactive alerting.

This positions lifestyle pillars as a consumer-facing budgeting tool, not just an internal analytics dimension.

---

### 3. WealthPreview — Add Supporting Transactions with Source Badges

Keep the two client alert cards (Margaret Chen, David Park). Enhance each with 2-3 compact supporting transaction rows below the event label, mirroring TEPilot's `LifeEventCard` evidence pattern and source badge styling.

Each client card will show:
- Existing name, AUM, event, and urgency (keep)
- Below the event line: 2 compact transaction evidence rows, each showing:
  - A small color-coded source dot (matching TEPilot's source colors: Checking = slate, Cashback Card = green, Travel Card = blue, Premium Card = purple)
  - Merchant name
  - Amount
  - Brief relevance note

Sample data:
- **Margaret Chen** (Retirement Planning):
  - Fidelity Rollover $45,000 (Premium Card, purple) — "401k consolidation"
  - AARP Membership $48 (Checking, slate) — "membership activation"

- **David Park** (Home Purchase):
  - Zillow Premium $35 (Checking, slate) — "active home search"
  - Home Depot $1,280 (Cashback Card, green) — "renovation planning"

This shows the transaction evidence that powers life event detection, with source differentiation.

---

### Summary

All changes in `src/components/PlatformTabs.tsx` — three component rewrites, no data or logic changes to the tab array or rotation system.
