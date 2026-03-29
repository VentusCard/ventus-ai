

## Consistent Tab Headers with Collapsible "How It Works" and "Why It Matters"

### Problem
Each tab has a different header style — some have gradient banners, some have plain h2+p, some have info boxes, some have none. Need a unified, ultra-compact professional header across all 13 tabs.

### Solution
Create a reusable `TabHeader` component and apply it to every tab view.

### New Component: `src/components/tepilot/insights/TabHeader.tsx`

A slim, single-line header bar containing:
- **Icon** (from sidebar nav) + **Title** (bold, text-base)
- **Subtitle** (one-liner, muted, text-xs) — always visible
- Two small pill buttons on the right:
  - **"How It Works"** — opens a HoverCard (or Popover) on hover/click explaining the Ventus AI methodology for this feature
  - **"Why It Matters"** — same, explaining the business impact

```text
┌─[icon] Lifestyle Analysis ·········· [How It Works] [Why It Matters]─┐
│  One-line subtitle description                                        │
└───────────────────────────────────────────────────────────────────────┘
```

Total height: ~48px. Uses `Popover` from existing UI components. Each popover shows 2-3 sentences max.

Props:
```ts
interface TabHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  howItWorks: string;
  whyItMatters: string;
}
```

### Content Map (per tab)

Each tab gets specific `howItWorks` and `whyItMatters` strings. Examples:

| Tab | How It Works | Why It Matters |
|-----|-------------|----------------|
| dashboard | Ventus classifies every transaction into 12 lifestyle pillars using 3-level semantic labeling — not MCC codes. Patterns are updated in real time across your full customer base. | Reveals behavioral segments traditional BI cannot see, enabling data-driven product and campaign decisions at the portfolio level. |
| wallet-share | Ventus traces every ACH outflow — rent, loans, subscriptions, insurance — and maps them to competitor products and life obligations using intent signals. | Sizes the exact revenue leaking to competitors and surfaces targeted win-back and cross-sell plays per segment. |
| subscription-analytics | Ventus identifies recurring charges by analyzing frequency, amount stability, and merchant patterns — catching subscriptions that MCC codes misclassify. | Detects churn risk early, sizes subscription wallet share, and identifies bundling opportunities. |
| rewards-intelligence | Ventus analyzes seasonal spend curves, category gaps, and persona affinity to recommend which deals to pursue and when to deploy them. | Maximizes deal ROI by timing merchant partnerships to peak customer demand windows. |
| deal-management | Curated merchant deal library scored by customer affinity, category fit, and activation potential using Ventus behavioral data. | Enables rewards teams to quickly evaluate, activate, and manage deals with data-backed prioritization. |
| location-experience | Ventus maps customer home/work/travel geo-patterns from transaction locations to match city-level perks to the right audiences. | Drives foot traffic and engagement by surfacing hyper-local experiences to customers who will actually use them. |
| gamification | Ventus tracks spending milestones, category exploration, and behavioral streaks to trigger achievement unlocks automatically. | Increases transaction frequency and card-top-of-wallet status through behavioral reinforcement loops. |
| life-events | Ventus detects life events (home purchase, retirement, family formation) from transaction pattern shifts — months before customers self-report. | Enables proactive outreach at the highest-intent moments, dramatically improving conversion and deepening relationships. |
| targeting | Ventus scores every customer against every product using lifestyle pillars, life events, and behavioral gaps to rank next-best-offer. | Replaces guesswork with precision targeting, improving cross-sell conversion and reducing campaign waste. |
| wm-copilot | Ventus continuously monitors HNW client transactions for life events, risk signals, and opportunity triggers, surfacing them to advisors in real time. | Advisors spend less time on research and more on relationship building, with AI-powered preparation for every client interaction. |
| customer-insights | Ventus generates behavioral wellness scores from spending patterns, detecting financial stress, lifestyle changes, and intervention opportunities. | Enables proactive customer care, reducing attrition and building trust through timely, personalized outreach. |
| fvi-dashboard | Ventus identifies financially vulnerable customers using behavioral signals — gambling escalation, high-risk lending dependency, distress cascades — scored into cohorts. | Supports responsible banking obligations while enabling protective interventions that reduce defaults and regulatory risk. |

### Files Modified (13 tab views)

For each view, replace the existing header (gradient banner, info box, plain h2, or nothing) with `<TabHeader>`:

1. **BankwideView.tsx** — replace gradient banner (lines 34-40)
2. **WalletShareView.tsx** — replace Info banner (lines 19-27)
3. **SubscriptionAnalyticsView.tsx** — add header before metric cards (no header currently)
4. **RewardsAnalyticsDashboard.tsx** — replace plain h2+p (lines 20-25)
5. **AvailableDealsGrid.tsx** — replace h1+p header (lines 88-97)
6. **LocationExperienceManager.tsx** — replace h2+p (lines 108-114)
7. **GamificationManagement.tsx** — replace CardHeader icon+title (lines 82-94)
8. **BankwideLifeEventsView.tsx** — add header before metrics (no header currently)
9. **SegmentTargetingView.tsx** — add header before FinancialJourneyHeader
10. **BankwideWMCopilotView.tsx** — add header before view toggle
11. **WellnessAlertsDashboard.tsx** — add header before KPI cards
12. **FVIDashboard.tsx** — add header before sub-nav
13. **AnalyticsContainer.tsx** — add header for fraud-aml placeholder

### Design Details
- Background: `bg-white` with `border-b border-slate-100` — no gradient, no card wrapper
- Popover pills: `text-[11px] font-medium text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5 hover:bg-slate-50` 
- Popover content: max `w-72`, `text-xs text-slate-600 leading-relaxed`, 2-3 sentences
- Total header height kept under 50px to maximize content space

