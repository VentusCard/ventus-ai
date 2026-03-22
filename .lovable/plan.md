

## Convert Tab Bar to Collapsible Left Sidebar with Grouped Sections

### Current State
8 tabs displayed as a horizontal wrapping `TabsList` at the top of `AnalyticsContainer`.

### Target State
A collapsible left column with tabs grouped under 3 labeled sections:

**Analytics**
- Analytics Dashboard
- Financial Journey
- Wallet Share Intelligence
- Customer Insights

**Rewards**
- Rewards Intelligence
- Gamification

**Wealth Management**
- Life Events Intelligence
- WM Copilot

### Changes

**`src/components/tepilot/insights/AnalyticsContainer.tsx`** (rewrite)
- Replace `TabsList` with a two-column layout: left sidebar + right content area
- Use `useState` to track `activeTab` (instead of Radix Tabs, use manual state since sidebar nav doesn't map to TabsList)
- Left column (~240px, collapsible to icon-only ~48px):
  - Toggle button (ChevronLeft/ChevronRight) at top
  - Three `Collapsible` sections: "Analytics", "Rewards", "Wealth Management"
  - Each section has a group label and nav buttons with icons + text (text hidden when collapsed)
  - Active item highlighted with `bg-blue-50 text-blue-700 border-l-2 border-blue-600`
  - All sections default open
- Right side: renders the matching content component based on `activeTab`
- On mobile (<768px): sidebar starts collapsed, overlays or stays as icon strip

### No changes to
- Any content component (BankwideView, RewardsAnalyticsDashboard, etc.)
- TePilot.tsx (props pass-through unchanged)
- Any other file

