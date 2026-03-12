

# Gamification / Achievement System — Customer Financial Habits

## Where It Lives

In the **Dashboard tab** (`analytics`), single-customer view — inserted **below PillarExplorer** and **above BeforeAfterTransformation**. A new collapsible card section titled "Financial Health Achievements."

## What Gets Built

### New Component: `FinancialAchievements.tsx`
Located at `src/components/tepilot/insights/FinancialAchievements.tsx`

Takes `enrichedTransactions` as input and derives achievements from actual spending data.

**Layout**: A card with two rows:

**Row 1 — Progress Summary Bar**
- Overall "Financial Health Score" (0–100) derived from achievements unlocked
- Progress ring or arc showing completion
- Level badge (e.g., "Saver Lv.2", "Budgeting Pro")

**Row 2 — Achievement Cards Grid** (3–4 columns)
Each card shows:
- Icon + title
- Progress bar (e.g., 7/10 weeks)
- Status badge: Locked / In Progress / Unlocked
- Brief description of the habit

### Achievement Categories (derived from enriched transaction data)

| Achievement | Logic (from transactions) | Icon |
|---|---|---|
| **Consistent Saver** | ≥4 weeks with groceries < dining out spend | Piggy bank |
| **Budget Guardian** | ≥3 pillars under budget (if budget mode data exists) | Shield |
| **Diversified Spender** | Transactions across ≥8 of 12 pillars | Grid |
| **Travel Planner** | Travel-context transactions with advance booking pattern | Plane |
| **Subscription Auditor** | Identified recurring merchants with low frequency variance | Search |
| **Local Champion** | ≥60% of dining/retail spend at local merchants | MapPin |
| **Streak: No Impulse** | No single transaction >2x category average for 2+ weeks | Flame |
| **Wellness Investor** | Health & Wellness pillar spend trending up month-over-month | Heart |

### New File: `src/lib/achievementEngine.ts`
Pure functions that take `EnrichedTransaction[]` and return `Achievement[]` with:
- `id`, `title`, `description`, `icon`, `category`
- `progress` (current / target)
- `status`: `locked` | `in_progress` | `unlocked`
- `unlockedAt?`: date string

### Files to Create/Edit

| File | Action |
|---|---|
| `src/lib/achievementEngine.ts` | New — achievement calculation logic |
| `src/components/tepilot/insights/FinancialAchievements.tsx` | New — main UI component |
| `src/pages/TePilot.tsx` | Edit — insert component after PillarExplorer in single-customer dashboard view |

### Design Notes
- Uses existing Card, Badge, Progress components
- Color scheme: green for unlocked, amber for in-progress, slate for locked
- Confetti animation (already installed: `canvas-confetti`) when viewing newly unlocked achievement
- Responsive: 2 cols on tablet, 1 on mobile

