

## Brainstorm: Next-Gen Personalized Banking Experience

Here are ideas for new sections to add inside the iPad mockup, drawing on the customer data we already have (name, segment, tenure, demographics, holdings, life events, contact info):

---

### 1. Your Dedicated Advisor Card
A warm, personal card with the advisor's photo (avatar placeholder), name, title, and a personalized quote like *"Hi Sarah, let's plan your next chapter together."* Includes a **Schedule a Meeting** button and a small **Message** icon. This makes the banking app feel like a relationship, not a transaction.

### 2. Relationship Tenure Banner
A subtle badge or ribbon: *"Valued member since 2016 — 8 years with TCBY Bank"*. Could include a small loyalty milestone like a star or shield icon. Reinforces long-term trust.

### 3. Proactive Financial Wellness Score
A circular gauge or progress ring (e.g., 78/100) labeled "Your Financial Wellness." Brief callouts beneath: *"Emergency fund: Strong"*, *"Debt ratio: Improving"*, *"Savings rate: On track."* Positions the bank as a partner in financial health, not just a product seller.

### 4. Personalized Quick Actions Row
A horizontal row of contextual shortcuts based on the customer's profile. Examples: "Transfer to Savings", "Review Mortgage Rate", "Explore 529 Plans", "Schedule Tax Review". These adapt based on life events and holdings.

### 5. Upcoming Milestones Timeline
A compact horizontal timeline showing the customer's milestones (from `profile.milestones`): *"Mar 2025 — Mortgage renewal"*, *"Sep 2025 — College tuition due"*. Visual dots connected by a line. Makes the bank feel anticipatory.

### 6. Local Community / Branch Card
A card showing the nearest branch with hours, plus a local community perk: *"Your Westfield branch — Open until 6pm today"* or *"Exclusive: Local farmers market partnership — 2x rewards this Saturday."*

---

### Proposed Implementation

**File: `src/components/demo/DemoWealthView.tsx`**

Add these new sections between the existing Greeting Header and the Life Events section:

1. **Advisor Card** — hardcoded advisor data (name, title, quote using `firstName`), avatar placeholder, "Schedule Meeting" button
2. **Tenure + Wellness row** — two side-by-side compact cards: tenure badge (pulled from `customer.profile.tenure`) and a static wellness score gauge
3. **Quick Actions** — horizontal scroll row of 4 contextual action chips
4. **Milestones Timeline** — render `customer.profile.milestones` as a horizontal dot-timeline

Keep the existing Life Events hero cards and Financial Snapshot below these new sections. No data model changes needed — all info comes from the existing `ClientProfileData` or is hardcoded for the demo.

