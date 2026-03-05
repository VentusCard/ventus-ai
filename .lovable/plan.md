

## Plan: Change Pillar Numbers to % of Total Spending

The pillar percentages currently show arbitrary "affinity scores" (87%, 91%, etc.). They should instead represent each pillar's share of total spending.

### Changes

**1. `src/components/technology/demos/VentusEngagementDemo.tsx`**
- Replace `score` field in `lifestyleProfile.pillars` with spending-based percentages derived from the budget data already in the file
- Use the spend values: Travel $1,240, Dining $480, Wellness $320, Shopping $180 → total $2,220
- Display: Travel 56%, Dining 22%, Wellness 14%, Pets → replace with Shopping 8%
- Update the `detail` text to reference spend amounts (e.g., "Travel · $1,240 this month")

**2. `src/components/PlatformTabs.tsx`** — `EngagementPreview` section
- Apply the same spending-percentage logic to the pillar scores shown in the Customer Experience tab
- Sync the pillar list and percentages with the updated demo data

This makes the numbers meaningful: each percentage = that pillar's share of the customer's total lifestyle spending.

