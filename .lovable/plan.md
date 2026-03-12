

# Gamification Management Console — Bank-Wide Analytics

## Concept

Add a **"Gamification Program Manager"** section to `BankwideView.tsx` (after DemographicBreakdown) that gives bank managers tools to:
1. View portfolio-wide achievement performance metrics
2. Create and edit custom achievements
3. Configure automated reward fulfillment (gift cards, points, cashback) per achievement

This is a **demo/mock UI** — no database persistence, state managed client-side with `useState`.

## What Gets Built

### 1. New Component: `GamificationManagement.tsx`

**Section A — Portfolio KPIs** (4 metric cards)
- Program Enrollment: 28.4M users (63%)
- Avg Health Score: 47/100
- Total Achievements Unlocked: 89.2M (avg 3.1/user)
- Engagement Lift: +18.7% transaction frequency

**Section B — Achievement Manager Table**
Editable table showing all 8 achievements + any custom ones:
- Title, Icon, Category, Completion Rate (bar), Status (Active/Paused)
- **Edit button** → opens dialog to modify title, description, target, icon, category
- **+ Create Achievement** button → opens same dialog in create mode
- **Reward column** showing configured reward (e.g., "500 pts", "$10 Starbucks GC")

**Section C — Reward Automation Panel** (per-achievement)
Inline or dialog-based reward config per achievement:
- Reward Type selector: Points | Gift Card | Cashback | Custom
- Reward Value: amount input (e.g., 500 points, $10)
- Gift Card Merchant: dropdown (Starbucks, Amazon, Target, Visa)
- Fulfillment: Automatic | Manual Approval
- Budget Cap: monthly limit input
- Preview of estimated monthly cost based on completion rate

**Section D — Program Recommendations** (2-3 cards)
AI-suggested actions like "Launch Wellness Week" or "Add advance-booking cashback."

### 2. New Component: `AchievementEditorDialog.tsx`
Dialog for create/edit with fields:
- Title, Description, Icon (dropdown of lucide icons), Category
- Target metric (number input)
- Trigger logic description (text — for demo purposes)
- Reward configuration (type, value, merchant, fulfillment mode, budget cap)
- Save / Cancel buttons

### 3. Mock Data in `mockBankwideData.ts`
Add `getGamificationMetrics()` returning:
- KPI values
- Achievement rates array (8 items with completion/inProgress/locked percentages)
- Segment performance array
- Recommendations array
- Default reward configs per achievement

### 4. Types in `bankwide.ts`
```typescript
interface RewardConfig {
  type: 'points' | 'gift_card' | 'cashback' | 'custom';
  value: number;
  currency?: string;
  merchantName?: string;
  fulfillment: 'automatic' | 'manual_approval';
  monthlyBudgetCap?: number;
}

interface ManagedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  targetValue: number;
  triggerLogic: string;
  isActive: boolean;
  completionRate: number;
  inProgressRate: number;
  reward?: RewardConfig;
}

interface GamificationMetrics {
  enrolledUsers: number;
  enrollmentRate: number;
  avgHealthScore: number;
  totalUnlocks: number;
  avgUnlocksPerUser: number;
  engagementLift: number;
  achievements: ManagedAchievement[];
  recommendations: Array<{
    title: string;
    description: string;
    impact: string;
    priority: 'high' | 'medium';
  }>;
}
```

### Files

| File | Action |
|---|---|
| `src/types/bankwide.ts` | Add `RewardConfig`, `ManagedAchievement`, `GamificationMetrics` |
| `src/lib/mockBankwideData.ts` | Add `getGamificationMetrics()` with mock data |
| `src/components/tepilot/insights/GamificationManagement.tsx` | New — main section with KPIs, table, recommendations |
| `src/components/tepilot/insights/AchievementEditorDialog.tsx` | New — create/edit dialog with reward config |
| `src/components/tepilot/insights/BankwideView.tsx` | Insert `GamificationManagement` after `DemographicBreakdown` |

